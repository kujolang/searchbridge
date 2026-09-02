# Runtime bundles and offline installation

Runtime bundles contain the complete SearchBridge source tree and the exact
Kujo executable used to qualify it. The launchers prefer `runtime/kujo` (or
`runtime/kujo.exe`) and therefore need no network access or machine-wide Kujo
installation after extraction.

`scripts/build_runtime_bundle.sh` accepts `linux-x64`, `macos-x64`,
`macos-arm64`, or `windows-x64` and requires `KUJO_BIN` plus the pinned
`KUJO_COMMIT`. It normalizes timestamps and archive ordering, writes an embedded
manifest binding both source and runtime, and creates an adjacent SHA-256 file.
The checksum names only the archive basename, so it remains verifiable after
download or relocation to any directory.

The retained release-candidate artifact also contains `RC-SHA256SUMS`, rooted
at the artifact extraction directory, for one-command verification of every
bundle, SDK package, benchmark, SBOM, and provenance document.

The platform workflow builds each runtime from the pinned Kujo commit, creates
the bundle twice, requires byte-identical hashes, extracts it into a clean
temporary directory, and executes an offline fixture with an empty environment.
The bundle and checksum are retained as workflow evidence.

To install, verify the adjacent `.sha256`, extract the archive, and put its
directory on `PATH` or invoke `searchbridge` / `searchbridge.ps1` directly.
Credentials are still supplied only through the operator's environment for live
runs; they are never included in a bundle.
