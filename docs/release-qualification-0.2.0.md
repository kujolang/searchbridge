# SearchBridge 0.2.0 release qualification

Status: **PASS** for Kujo-native fixture/offline normalization, CLI contracts,
security boundaries, and bounded transport behavior. Live-provider
authorization, quota policy, and upstream API availability remain external and
are not claimed by this qualification.

The 0.2.0 gate covers all declared provider fixtures, capability-level partial
failure, deterministic output, fixture immutability, schema parsing, malformed
submission URLs, same-host enforcement, explicit submission authorization,
custom-endpoint rejection, timeout/retry/row/response/output bounds, 429/5xx
retry classification, redacted errors, and launcher smoke tests.

The runtime implementation, tests, schema validator, and benchmark are native
Kujo modules. CI installs the pinned Kujo v1.0.1 Linux artifact only after its
published SHA-256 checksum passes.

```bash
bash scripts/validate.sh
"${KUJO_BIN:-../kujo/target/release/kujo}" run scripts/benchmark.kujo -- --iterations 100
```

The prior [0.1.0 qualification](release-qualification-0.1.0.md) is retained as
historical evidence for the original bridge-backed implementation.
