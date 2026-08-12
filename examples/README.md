# Examples

Run all normalized providers without credentials:

```bash
for command in search-performance analytics inspect-url pagespeed crux; do
  ./searchbridge "$command" --fixture
done
./searchbridge backlinks --provider ahrefs --fixture
./searchbridge submit --provider indexnow --url https://example.com/new --fixture --capability index.submission --act --yes
```

Live read-only calls require the provider environment variables shown by
`./searchbridge providers`. Keep outputs in an operator-controlled directory.

`ci_quality_gate.kujo` imports SearchBridge directly, consumes a typed result,
and degrades to deterministic fixture evidence when live PageSpeed is not
available:

```bash
"${KUJO_BIN:-../kujo/target/release/kujo}" run examples/ci_quality_gate.kujo
```

Canonical rows under `examples/rows/` correspond to the public capability
schemas documented in `docs/row-contracts.md`.
