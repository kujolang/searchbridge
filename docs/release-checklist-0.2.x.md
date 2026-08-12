# Reproducible 0.2.x release checklist

1. Start from a clean, reviewed `main`; confirm `VERSION`, `kujo.toml`, and the tag agree.
2. Build Kujo commit `517c5369c6349038831951917478eb66100c1924` with stable Rust and set `KUJO_BIN` to it.
3. Run `bash scripts/validate.sh` twice from fresh clones and compare golden-gate output.
4. Create an annotated SSH- or GPG-signed `v0.2.x` tag and push it.
5. The release workflow archives the exact tag, creates SHA-256 checksums, an SPDX 2.3 SBOM, a SLSA/in-toto statement, and GitHub OIDC provenance attestations.
6. Verify the tag signature with `git verify-tag`, each artifact with `sha256sum -c`, and the attestation with `gh attestation verify --repo kujolang/searchbridge <artifact>`.
7. Extract both archives on a clean host and run the deterministic fixture smoke using the pinned Kujo runtime.

The archive is source-only and contains no credentials or cached provider evidence.
