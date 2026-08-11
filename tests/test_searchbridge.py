#!/usr/bin/env python3
from __future__ import annotations
import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / "bridge" / "searchbridge.py"


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
        receipt = json.loads(self.run_cli("submit", "--fixture", "--url", url, "--act", "--yes").stdout)
        self.assertTrue(receipt["received"]); self.assertFalse(receipt["indexed"])
        self.run_cli("submit", "--fixture", "--url", url, "--url", "https://other.example/new", "--act", "--yes", expected=1)

    def test_live_unavailable_is_scoped(self):
        result = self.run_cli("analytics", "--property", "123", expected=1)
        self.assertIn("SEARCHBRIDGE_GA4_TOKEN", result.stderr)
        self.assertNotIn("Traceback", result.stderr)


if __name__ == "__main__": unittest.main(verbosity=2)
