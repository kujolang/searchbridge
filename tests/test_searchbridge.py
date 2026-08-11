#!/usr/bin/env python3
from __future__ import annotations
import json
import hashlib
import os
import random
import subprocess
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / "bridge" / "searchbridge.py"

class RetryHandler(BaseHTTPRequestHandler):
    hits = 0
    def log_message(self, *_args): pass
    def do_POST(self):
        type(self).hits += 1
        self.send_response(429 if type(self).hits == 1 else 202); self.send_header("Content-Type", "application/json"); self.end_headers(); self.wfile.write(b"{}")


class SearchBridgeTests(unittest.TestCase):
    def run_cli(self, *args, expected=0, env=None):
        clean = {k: v for k, v in os.environ.items() if not k.startswith("SEARCHBRIDGE_")}
        clean.update(env or {})
        result = subprocess.run(["python3", str(CLI), *args], cwd=ROOT, text=True, capture_output=True, env=clean)
        self.assertEqual(expected, result.returncode, result.stderr + result.stdout)
        return result

    def test_doctor_and_capability_degradation(self):
        doctor = json.loads(self.run_cli("doctor").stdout)
        self.assertTrue(doctor["ok"]); self.assertTrue(doctor["fixture_ready"])
        caps = json.loads(self.run_cli("capabilities").stdout)
        self.assertTrue(any(x["degraded"] for x in caps["capabilities"]))
        for capability in caps["capabilities"]:
            writes = [provider["write"] for provider in capability["providers"]]
            self.assertEqual(capability["capability"] == "index.submission", any(writes))

    def test_all_read_provider_fixtures_normalize(self):
        commands = [
            ("search-performance", "--fixture"), ("search-performance", "--provider", "bing-webmaster", "--fixture"),
            ("analytics", "--fixture"), ("inspect-url", "--fixture"), ("pagespeed", "--fixture"),
            ("crux", "--fixture"), ("backlinks", "--fixture"), ("backlinks", "--provider", "bing-webmaster", "--fixture"),
            ("keyword-data", "--fixture"),
        ]
        for command in commands:
            with self.subTest(command=command):
                data = json.loads(self.run_cli(*command).stdout)
                self.assertEqual("searchbridge.result/v1", data["schema"]); self.assertEqual("fixture", data["mode"]); self.assertTrue(data["rows"])

    def test_output_file_and_bounded_limit(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "result.json"
            self.run_cli("analytics", "--fixture", "--out", str(path))
            self.assertEqual("analytics", json.loads(path.read_text())["capability"])
        self.run_cli("backlinks", "--fixture", "--limit", "1001", expected=1)

    def test_submission_requires_explicit_act_and_never_claims_indexed(self):
        url = "https://example.com/new"
        self.run_cli("submit", "--fixture", "--url", url, expected=1)
        self.run_cli("submit", "--fixture", "--url", url, "--act", "--yes", expected=1)
        receipt = json.loads(self.run_cli("submit", "--fixture", "--url", url, "--capability", "index.submission", "--act", "--yes").stdout)
        self.assertTrue(receipt["received"]); self.assertFalse(receipt["indexed"])
        self.run_cli("submit", "--fixture", "--url", url, "--url", "https://other.example/new", "--capability", "index.submission", "--act", "--yes", expected=1)

    def test_live_unavailable_is_scoped(self):
        result = self.run_cli("analytics", "--property", "123", expected=1)
        self.assertIn("SEARCHBRIDGE_GA4_TOKEN", result.stderr)
        self.assertNotIn("Traceback", result.stderr)

    def test_offline_deterministic_partial_failure_and_read_only_fixtures(self):
        fixture_paths = sorted((ROOT / "fixtures" / "providers").glob("*.json"))
        before = {p: hashlib.sha256(p.read_bytes()).hexdigest() for p in fixture_paths}
        first = self.run_cli("analytics", "--fixture", "--offline", "--deterministic").stdout
        second = self.run_cli("analytics", "--fixture", "--offline", "--deterministic").stdout
        self.assertEqual(first, second)
        self.assertEqual("1970-01-01T00:00:00Z", json.loads(first)["retrieved_at"])
        self.run_cli("analytics", "--offline", expected=1)
        self.run_cli("analytics", "--property", "123", expected=1)
        healthy = json.loads(self.run_cli("pagespeed", "--fixture", "--offline").stdout)
        self.assertEqual("page.performance", healthy["capability"])
        self.assertEqual(before, {p: hashlib.sha256(p.read_bytes()).hexdigest() for p in fixture_paths})

    def test_fuzz_submission_urls_and_output_budgets(self):
        rng = random.Random(20260811)
        values = ["", "ftp://example.com", "http://[::1", "https://u:p@example.com", "http://example.com:99999"]
        values.extend("".join(rng.choice("%[]:/?@\\abc") for _ in range(24)) for _ in range(100))
        for value in values:
            result = self.run_cli("submit", "--fixture", "--url", value, "--capability", "index.submission", "--act", "--yes", expected=1)
            self.assertNotIn("Traceback", result.stderr)
            self.assertNotIn("u:p", result.stderr)
        self.run_cli("analytics", "--fixture", "--max-output-bytes", "256", expected=1)
        self.run_cli("analytics", "--fixture", "--max-output-tokens", "64", expected=1)

    def test_submit_retries_rate_limit_but_never_weakens_authorization(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), RetryHandler); thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start(); RetryHandler.hits = 0
        try:
            endpoint = f"http://127.0.0.1:{server.server_port}/indexnow"
            receipt = json.loads(self.run_cli("submit", "--url", "https://example.com/new", "--endpoint", endpoint, "--capability", "index.submission", "--act", "--yes", "--retries", "2", env={"SEARCHBRIDGE_INDEXNOW_KEY": "fixture-key"}).stdout)
            self.assertEqual(2, RetryHandler.hits); self.assertTrue(receipt["received"])
            self.assertEqual("index.submission", receipt["authorization"]["capability"])
        finally:
            server.shutdown(); server.server_close()


if __name__ == "__main__": unittest.main(verbosity=2)
