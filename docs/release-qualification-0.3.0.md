# SearchBridge 0.3.0 release qualification

SearchBridge 0.3.0 implements the locally actionable 0.3 scale, extension,
adoption, and release-verification backlog while preserving every readable
0.2.x golden envelope.

Qualified evidence:

- bounded worker-pool overlap, stable ordering, cooperative cancellation, and partial success;
- page-by-page live GSC and GA4 JSONL publication without full-budget retention;
- authenticated encrypted replay, TTL deletion, tamper rejection, and capability allowlists;
- RSA-signed external adapter manifests with capability, endpoint, and credential allowlists;
- generated TypeScript, Rust, and Go SDK consumers compiled against all golden envelopes and row schemas;
- opt-in OTLP traces and metrics passing the committed redaction corpus;
- bounded Kujo-native JSONL filtering and joining;
- checkout-independent public release verification covering the tag signature, checksums, archive, GitHub attestation, and exact-commit platform smoke.

The scheduled six-provider live contract run remains an operational activation:
it requires dedicated least-privilege provider properties and repository
environment secrets. Kujo v1.0.2 publication also remains subject to Kujo's
explicit release-unblock directive; SearchBridge cannot claim the published
runtime pin until that release exists.
