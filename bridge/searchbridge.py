#!/usr/bin/env python3
"""Provider REST bridge and normalized evidence contracts for SearchBridge."""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

VERSION = "0.1.0"
ROOT = Path(__file__).resolve().parents[1]
FIXTURES = ROOT / "fixtures" / "providers"
MAX_BYTES = 8 * 1024 * 1024
DETERMINISTIC_TIME = "1970-01-01T00:00:00Z"
POLICY = {"timeout": 30.0, "retries": 2, "deterministic": False, "offline": False}
UA = f"Kujo-SearchBridge/{VERSION} (+https://github.com/kujolang/searchbridge)"

PROVIDERS = {
    "google-search-console": {"capabilities": ["search.performance", "url.inspection"], "env": ["SEARCHBRIDGE_GSC_TOKEN"], "write": False},
    "google-analytics-4": {"capabilities": ["analytics"], "env": ["SEARCHBRIDGE_GA4_TOKEN"], "write": False},
    "pagespeed-insights": {"capabilities": ["page.performance"], "env": [], "optional_env": ["SEARCHBRIDGE_PAGESPEED_KEY"], "write": False},
    "crux": {"capabilities": ["field.performance"], "env": ["SEARCHBRIDGE_CRUX_KEY"], "write": False},
    "indexnow": {"capabilities": ["index.submission"], "env": ["SEARCHBRIDGE_INDEXNOW_KEY"], "write": True, "write_capabilities": ["index.submission"]},
    "bing-webmaster": {"capabilities": ["search.performance", "backlinks", "index.submission"], "env": ["SEARCHBRIDGE_BING_KEY"], "optional_env": ["SEARCHBRIDGE_BING_TOKEN"], "write": True, "write_capabilities": ["index.submission"]},
    "ahrefs": {"capabilities": ["backlinks", "keyword.data"], "env": ["SEARCHBRIDGE_AHREFS_TOKEN"], "write": False, "cost_warning": "Most API v3 requests consume Ahrefs API units."},
}


def now() -> str:
    if POLICY["deterministic"]: return DETERMINISTIC_TIME
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def clean_error(exc: Exception) -> str:
    if isinstance(exc, urllib.error.HTTPError): return f"provider returned HTTP {exc.code}"
    if isinstance(exc, urllib.error.URLError): return f"provider connection failed: {str(exc.reason)[:120]}"
    return re.sub(r"(?i)(token|key|authorization)=[^&\s]+", r"\1=[REDACTED]", str(exc))[:200]


def request_json(url: str, *, method: str = "GET", body: Any = None, headers: dict[str, str] | None = None, timeout: float | None = None) -> tuple[int, Any]:
    if POLICY["offline"]: raise RuntimeError("offline mode blocks live provider requests")
    merged = {"User-Agent": UA, "Accept": "application/json", **(headers or {})}
    encoded = None
    if body is not None:
        encoded = json.dumps(body).encode(); merged["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=encoded, headers=merged, method=method)
    request_timeout = timeout if timeout is not None else float(POLICY["timeout"])
    last: Exception | None = None
    for attempt in range(int(POLICY["retries"]) + 1):
        try:
            with urllib.request.urlopen(req, timeout=request_timeout) as response:
                raw = response.read(MAX_BYTES + 1)
                if len(raw) > MAX_BYTES: raise RuntimeError("provider response exceeded 8 MiB")
                return response.status, json.loads(raw or b"{}")
        except urllib.error.HTTPError as exc:
            last = exc
            if exc.code not in {429, 500, 502, 503, 504} or attempt >= int(POLICY["retries"]): break
        except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
            last = exc
            if attempt >= int(POLICY["retries"]): break
        time.sleep(min(0.25 * (2 ** attempt), 2.0))
    raise RuntimeError(clean_error(last or RuntimeError("provider request failed"))) from None


def fixture(name: str) -> Any:
    return json.loads((FIXTURES / f"{name}.json").read_text(encoding="utf-8"))


def bearer(name: str) -> dict[str, str]:
    value = os.environ.get(name, "")
    if not value: raise RuntimeError(f"unavailable capability: set {name} or use --fixture")
    return {"Authorization": f"Bearer {value}"}


def write_result(result: dict[str, Any], path: str | None, max_bytes: int = 1024 * 1024, max_tokens: int = 250000) -> None:
    text = json.dumps(result, indent=2, sort_keys=True) + "\n"
    size = len(text.encode("utf-8"))
    if size > max_bytes or size > max_tokens * 4:
        raise RuntimeError(f"output budget exceeded ({size} bytes)")
    if path:
        target = Path(path).expanduser().resolve()
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")
    print(text, end="")


def envelope(capability: str, provider: str, mode: str, rows: list[dict[str, Any]], **extra: Any) -> dict[str, Any]:
    return {"schema": "searchbridge.result/v1", "capability": capability, "provider": provider, "mode": mode, "retrieved_at": now(), "rows": rows, **extra}


def normalize_gsc(raw: dict[str, Any], dimensions: list[str], property_name: str, mode: str) -> dict[str, Any]:
    rows = []
    for source in raw.get("rows", []):
        row = {name: value for name, value in zip(dimensions, source.get("keys", []))}
        row.update({name: source.get(name) for name in ("clicks", "impressions", "ctr", "position")})
        rows.append(row)
    return envelope("search.performance", "google-search-console", mode, rows, property=property_name, dimensions=dimensions, response_aggregation_type=raw.get("responseAggregationType"), metadata=raw.get("metadata", {}))


def command_search_performance(args: argparse.Namespace) -> dict[str, Any]:
    provider = args.provider
    if provider == "google-search-console":
        dimensions = [x.strip() for x in args.dimensions.split(",") if x.strip()]
        property_name = args.property or "sc-domain:example.com"
        if args.fixture: return normalize_gsc(fixture("google-search-console"), dimensions, property_name, "fixture")
        if not args.property or not args.start_date or not args.end_date: raise RuntimeError("live GSC requires --property, --start-date, and --end-date")
        endpoint = "https://www.googleapis.com/webmasters/v3/sites/" + urllib.parse.quote(args.property, safe="") + "/searchAnalytics/query"
        _, raw = request_json(endpoint, method="POST", headers=bearer("SEARCHBRIDGE_GSC_TOKEN"), body={"startDate": args.start_date, "endDate": args.end_date, "dimensions": dimensions, "rowLimit": args.limit})
        return normalize_gsc(raw, dimensions, args.property, "live")
    site = args.property or "https://example.com"
    if args.fixture: raw = fixture("bing-webmaster-search")
    else:
        key = os.environ.get("SEARCHBRIDGE_BING_KEY", "")
        if not key: raise RuntimeError("unavailable capability: set SEARCHBRIDGE_BING_KEY or use --fixture")
        query = urllib.parse.urlencode({"siteUrl": site, "apikey": key})
        _, raw = request_json("https://ssl.bing.com/webmaster/api.svc/json/GetQueryStats?" + query)
    source_rows = raw.get("d", raw.get("rows", []))
    rows = [{"date": r.get("Date"), "query": r.get("Query"), "clicks": r.get("Clicks"), "impressions": r.get("Impressions"), "ctr": r.get("Ctr"), "position": r.get("AvgPosition")} for r in source_rows[:args.limit]]
    return envelope("search.performance", "bing-webmaster", "fixture" if args.fixture else "live", rows, property=site, dimensions=["date", "query"])


def command_analytics(args: argparse.Namespace) -> dict[str, Any]:
    property_name = args.property or "properties/123456"
    dimensions = [x.strip() for x in args.dimensions.split(",") if x.strip()]
    metrics = [x.strip() for x in args.metrics.split(",") if x.strip()]
    if args.fixture: raw = fixture("google-analytics-4")
    else:
        if not args.property: raise RuntimeError("live GA4 requires --property")
        if not property_name.startswith("properties/"): property_name = "properties/" + property_name
        endpoint = f"https://analyticsdata.googleapis.com/v1beta/{property_name}:runReport"
        body = {"dateRanges": [{"startDate": args.start_date or "28daysAgo", "endDate": args.end_date or "yesterday"}], "dimensions": [{"name": x} for x in dimensions], "metrics": [{"name": x} for x in metrics], "limit": str(args.limit)}
        _, raw = request_json(endpoint, method="POST", headers=bearer("SEARCHBRIDGE_GA4_TOKEN"), body=body)
    dim_headers = [x.get("name") for x in raw.get("dimensionHeaders", [])] or dimensions
    metric_headers = [x.get("name") for x in raw.get("metricHeaders", [])] or metrics
    rows = []
    for source in raw.get("rows", [])[:args.limit]:
        row = {name: value.get("value") for name, value in zip(dim_headers, source.get("dimensionValues", []))}
        row.update({name: value.get("value") for name, value in zip(metric_headers, source.get("metricValues", []))})
        rows.append(row)
    return envelope("analytics", "google-analytics-4", "fixture" if args.fixture else "live", rows, property=property_name, dimensions=dim_headers, metrics=metric_headers)


def command_inspect(args: argparse.Namespace) -> dict[str, Any]:
    inspected = args.url or "https://example.com/page"
    property_name = args.property or "sc-domain:example.com"
    if args.fixture: raw = fixture("google-url-inspection")
    else:
        if not args.url or not args.property: raise RuntimeError("live inspection requires --url and --property")
        _, raw = request_json("https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", method="POST", headers=bearer("SEARCHBRIDGE_GSC_TOKEN"), body={"inspectionUrl": inspected, "siteUrl": property_name, "languageCode": "en-US"})
    result = raw.get("inspectionResult", raw)
    index = result.get("indexStatusResult", {})
    row = {"url": inspected, "verdict": index.get("verdict"), "coverage_state": index.get("coverageState"), "robots_txt_state": index.get("robotsTxtState"), "indexing_state": index.get("indexingState"), "last_crawl_time": index.get("lastCrawlTime"), "google_canonical": index.get("googleCanonical"), "user_canonical": index.get("userCanonical")}
    return envelope("url.inspection", "google-search-console", "fixture" if args.fixture else "live", [row], property=property_name)


def command_pagespeed(args: argparse.Namespace) -> dict[str, Any]:
    target = args.url or "https://example.com/"
    if args.fixture: raw = fixture("pagespeed-insights")
    else:
        if not args.url: raise RuntimeError("live PageSpeed requires --url")
        params = {"url": target, "strategy": args.strategy, "category": ["performance", "accessibility", "seo", "best-practices"]}
        key = os.environ.get("SEARCHBRIDGE_PAGESPEED_KEY");
        if key: params["key"] = key
        _, raw = request_json("https://www.googleapis.com/pagespeedonline/v5/runPagespeed?" + urllib.parse.urlencode(params, doseq=True))
    lighthouse = raw.get("lighthouseResult", {}); categories = lighthouse.get("categories", {}); audits = lighthouse.get("audits", {})
    row = {"url": target, "strategy": args.strategy, "lab": {k: v.get("score") for k, v in categories.items()}, "metrics": {k: audits.get(k, {}).get("numericValue") for k in ("largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time", "server-response-time")}, "field": raw.get("loadingExperience")}
    return envelope("page.performance", "pagespeed-insights", "fixture" if args.fixture else "live", [row], target=target, evidence_classes=["lab", "field-if-returned"])


def command_crux(args: argparse.Namespace) -> dict[str, Any]:
    target = args.url or "https://example.com/"
    if args.fixture: raw = fixture("crux")
    else:
        key = os.environ.get("SEARCHBRIDGE_CRUX_KEY", "")
        if not key or not args.url: raise RuntimeError("live CrUX requires --url and SEARCHBRIDGE_CRUX_KEY")
        _, raw = request_json("https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=" + urllib.parse.quote(key), method="POST", body={"url": target, "formFactor": args.form_factor})
    record = raw.get("record", raw)
    return envelope("field.performance", "crux", "fixture" if args.fixture else "live", [{"url": target, "form_factor": args.form_factor, "metrics": record.get("metrics", {}), "collection_period": record.get("collectionPeriod")}], target=target)


def command_backlinks(args: argparse.Namespace) -> dict[str, Any]:
    target = args.target or "example.com"
    if args.provider == "ahrefs":
        if args.fixture: raw = fixture("ahrefs-backlinks")
        else:
            token = os.environ.get("SEARCHBRIDGE_AHREFS_TOKEN", "")
            if not token: raise RuntimeError("unavailable capability: set SEARCHBRIDGE_AHREFS_TOKEN or use --fixture")
            params = {"target": target, "mode": "domain", "select": "url_from,url_to,anchor,first_seen,last_visited,is_dofollow", "limit": args.limit}
            _, raw = request_json("https://api.ahrefs.com/v3/site-explorer/all-backlinks?" + urllib.parse.urlencode(params), headers={"Authorization": f"Bearer {token}"})
        source = raw.get("backlinks", raw.get("rows", []))
        rows = [{"source_url": x.get("url_from"), "target_url": x.get("url_to"), "anchor": x.get("anchor"), "first_seen": x.get("first_seen"), "last_seen": x.get("last_visited"), "nofollow": not bool(x.get("is_dofollow", True))} for x in source[:args.limit]]
    else:
        if args.fixture: raw = fixture("bing-backlinks")
        else:
            key = os.environ.get("SEARCHBRIDGE_BING_KEY", "")
            if not key: raise RuntimeError("unavailable capability: set SEARCHBRIDGE_BING_KEY or use --fixture")
            _, raw = request_json("https://ssl.bing.com/webmaster/api.svc/json/GetLinkDetails?" + urllib.parse.urlencode({"siteUrl": target, "link": target, "apikey": key}))
        rows = [{"source_url": x.get("SourceUrl"), "target_url": x.get("AnchorUrl"), "anchor": x.get("AnchorText")} for x in raw.get("d", raw.get("rows", []))[:args.limit]]
    return envelope("backlinks", args.provider, "fixture" if args.fixture else "live", rows, target=target, estimated_provider_cost="none-in-fixture" if args.fixture else ("provider-units" if args.provider == "ahrefs" else "provider-quota"))


def command_keywords(args: argparse.Namespace) -> dict[str, Any]:
    keyword = args.keyword or "example keyword"
    if args.fixture: raw = fixture("ahrefs-keywords")
    else:
        token = os.environ.get("SEARCHBRIDGE_AHREFS_TOKEN", "")
        if not token: raise RuntimeError("unavailable capability: set SEARCHBRIDGE_AHREFS_TOKEN or use --fixture")
        params = {"keywords": keyword, "country": args.country, "select": "keyword,volume,difficulty,cpc", "limit": args.limit}
        _, raw = request_json("https://api.ahrefs.com/v3/keywords-explorer/overview?" + urllib.parse.urlencode(params), headers={"Authorization": f"Bearer {token}"})
    rows = [{"keyword": x.get("keyword"), "country": x.get("country", args.country), "volume_estimate": x.get("volume"), "difficulty_estimate": x.get("difficulty"), "cpc_estimate": x.get("cpc")} for x in raw.get("rows", raw.get("keywords", []))[:args.limit]]
    return envelope("keyword.data", "ahrefs", "fixture" if args.fixture else "live", rows, target=keyword, measured=False, third_party_estimates=True)


def validate_urls(urls: list[str]) -> tuple[str, list[str]]:
    normalized = []
    hosts = set()
    for url in urls:
        parsed = urllib.parse.urlsplit(url)
        if parsed.scheme not in {"http", "https"} or not parsed.hostname or parsed.username or parsed.password: raise RuntimeError("invalid submission URL")
        _ = parsed.port
        normalized.append(urllib.parse.urlunsplit((parsed.scheme, parsed.netloc, parsed.path or "/", parsed.query, ""))); hosts.add(parsed.hostname.lower())
    if len(hosts) != 1: raise RuntimeError("submission URLs must share one host")
    return next(iter(hosts)), normalized


def command_submit(args: argparse.Namespace) -> dict[str, Any]:
    if not (args.act and args.yes and args.capability == "index.submission"): raise RuntimeError("submission requires --capability index.submission, --act, and --yes")
    host, urls = validate_urls(args.url)
    if len(urls) > 1000: raise RuntimeError("SearchBridge caps one submission at 1,000 URLs")
    if args.fixture: status = 202
    elif args.provider == "indexnow":
        key = os.environ.get("SEARCHBRIDGE_INDEXNOW_KEY", "")
        if not key: raise RuntimeError("set SEARCHBRIDGE_INDEXNOW_KEY or use --fixture")
        body = {"host": host, "key": key, "urlList": urls}
        if args.key_location: body["keyLocation"] = args.key_location
        status, _ = request_json(args.endpoint or "https://api.indexnow.org/indexnow", method="POST", body=body)
    else:
        key = os.environ.get("SEARCHBRIDGE_BING_KEY", "")
        if not key: raise RuntimeError("set SEARCHBRIDGE_BING_KEY or use --fixture")
        status = 200
        for url in urls:
            status, _ = request_json("https://ssl.bing.com/webmaster/api.svc/json/SubmitUrl?apikey=" + urllib.parse.quote(key), method="POST", body={"siteUrl": f"https://{host}", "url": url})
    return {"schema": "searchbridge.submission/v1", "provider": args.provider, "mode": "fixture" if args.fixture else "live", "submitted_at": now(), "authorization": {"capability": "index.submission", "act": True, "confirmed": True}, "status": status, "received": status in {200, 202}, "indexed": False, "urls": urls, "claim": "Receipt means received or accepted; it does not guarantee indexing."}


def capability_report() -> dict[str, Any]:
    rows = []
    for capability in sorted({x for provider in PROVIDERS.values() for x in provider["capabilities"]}):
        providers = []
        for name, cfg in PROVIDERS.items():
            if capability not in cfg["capabilities"]: continue
            required = cfg.get("env", []); available = not required or all(os.environ.get(key) for key in required)
            providers.append({"provider": name, "live_available": available, "fixture_available": True, "write": capability in cfg.get("write_capabilities", []), "missing_environment": [key for key in required if not os.environ.get(key)]})
        rows.append({"capability": capability, "available": any(p["live_available"] for p in providers), "degraded": not any(p["live_available"] for p in providers), "providers": providers})
    return {"schema": "searchbridge.capabilities/v1", "generated_at": now(), "capabilities": rows}


def add_common(p: argparse.ArgumentParser) -> None:
    p.add_argument("--fixture", action="store_true"); p.add_argument("--offline", action="store_true"); p.add_argument("--deterministic", action="store_true"); p.add_argument("--out"); p.add_argument("--timeout", type=float, default=30); p.add_argument("--retries", type=int, default=2); p.add_argument("--limit", type=int, default=100); p.add_argument("--max-output-bytes", type=int, default=1024 * 1024); p.add_argument("--max-output-tokens", type=int, default=250000)


def build_parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(prog="searchbridge"); sub = root.add_subparsers(dest="command", required=True)
    sub.add_parser("doctor"); sub.add_parser("capabilities"); sub.add_parser("providers"); sub.add_parser("version")
    p = sub.add_parser("search-performance"); add_common(p); p.add_argument("--provider", choices=["google-search-console", "bing-webmaster"], default="google-search-console"); p.add_argument("--property"); p.add_argument("--start-date"); p.add_argument("--end-date"); p.add_argument("--dimensions", default="date,query,page")
    p = sub.add_parser("analytics"); add_common(p); p.add_argument("--property"); p.add_argument("--start-date"); p.add_argument("--end-date"); p.add_argument("--dimensions", default="date,pagePath"); p.add_argument("--metrics", default="sessions,screenPageViews")
    p = sub.add_parser("inspect-url"); add_common(p); p.add_argument("--url"); p.add_argument("--property")
    p = sub.add_parser("pagespeed"); add_common(p); p.add_argument("--url"); p.add_argument("--strategy", choices=["mobile", "desktop"], default="mobile")
    p = sub.add_parser("crux"); add_common(p); p.add_argument("--url"); p.add_argument("--form-factor", choices=["PHONE", "DESKTOP", "TABLET"], default="PHONE")
    p = sub.add_parser("backlinks"); add_common(p); p.add_argument("--provider", choices=["ahrefs", "bing-webmaster"], default="ahrefs"); p.add_argument("--target")
    p = sub.add_parser("keyword-data"); add_common(p); p.add_argument("--keyword"); p.add_argument("--country", default="US")
    p = sub.add_parser("submit"); p.add_argument("--provider", choices=["indexnow", "bing-webmaster"], default="indexnow"); p.add_argument("--url", action="append", required=True); p.add_argument("--key-location"); p.add_argument("--endpoint"); p.add_argument("--fixture", action="store_true"); p.add_argument("--offline", action="store_true"); p.add_argument("--deterministic", action="store_true"); p.add_argument("--timeout", type=float, default=30); p.add_argument("--retries", type=int, default=2); p.add_argument("--max-output-bytes", type=int, default=1024 * 1024); p.add_argument("--max-output-tokens", type=int, default=250000); p.add_argument("--capability"); p.add_argument("--act", action="store_true"); p.add_argument("--yes", action="store_true"); p.add_argument("--out")
    return root


def main() -> int:
    args = build_parser().parse_args()
    try:
        if args.command == "version": result = {"name": "searchbridge", "version": VERSION, "contract": "searchbridge.result/v1"}
        elif args.command == "providers": result = {"schema": "searchbridge.providers/v1", "providers": [{"name": name, **cfg} for name, cfg in PROVIDERS.items()]}
        elif args.command == "capabilities": result = capability_report()
        elif args.command == "doctor":
            report = capability_report(); result = {"schema": "searchbridge.doctor/v1", "ok": True, "fixture_ready": True, "credentials_required_for_doctor": False, "live_capabilities": [x["capability"] for x in report["capabilities"] if x["available"]], "unavailable_capabilities": [x["capability"] for x in report["capabilities"] if not x["available"]], "warnings": [cfg["cost_warning"] for cfg in PROVIDERS.values() if cfg.get("cost_warning")]}
        else:
            if hasattr(args, "limit") and (args.limit < 1 or args.limit > 1000): raise RuntimeError("--limit must be between 1 and 1000")
            if hasattr(args, "timeout") and (args.timeout <= 0 or args.timeout > 120): raise RuntimeError("--timeout must be between 0 and 120 seconds")
            if hasattr(args, "retries") and (args.retries < 0 or args.retries > 5): raise RuntimeError("--retries must be between 0 and 5")
            if hasattr(args, "max_output_bytes") and args.max_output_bytes < 256: raise RuntimeError("--max-output-bytes must be at least 256")
            if hasattr(args, "max_output_tokens") and args.max_output_tokens < 64: raise RuntimeError("--max-output-tokens must be at least 64")
            POLICY.update(timeout=getattr(args, "timeout", 30), retries=getattr(args, "retries", 2), deterministic=getattr(args, "deterministic", False), offline=getattr(args, "offline", False))
            if POLICY["offline"] and not getattr(args, "fixture", False): raise RuntimeError("offline mode requires --fixture for provider commands")
            result = {"search-performance": command_search_performance, "analytics": command_analytics, "inspect-url": command_inspect, "pagespeed": command_pagespeed, "crux": command_crux, "backlinks": command_backlinks, "keyword-data": command_keywords, "submit": command_submit}[args.command](args)
        write_result(result, getattr(args, "out", None), getattr(args, "max_output_bytes", 1024 * 1024), getattr(args, "max_output_tokens", 250000)); return 0
    except (RuntimeError, OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"SearchBridge: {clean_error(exc)}", file=sys.stderr); return 1


if __name__ == "__main__": raise SystemExit(main())
