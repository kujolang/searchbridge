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
