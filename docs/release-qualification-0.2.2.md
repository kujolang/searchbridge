# SearchBridge 0.2.2 release qualification

SearchBridge 0.2.2 is the corrective qualified release for the 0.2.1 feature
set. The signed `v0.2.1` tag is intentionally immutable, but its GitHub build
could not resolve an incorrectly expanded Kujo source SHA. Version 0.2.2 pins
the published Kujo commit
`517c53678e261f9e23bb92f08d6d3c5755c24c13` across every workflow.

Qualification requires the local 145-assertion validation gate, all 13 golden
public envelopes, provider snapshots, Linux/macOS/Windows smoke jobs, and the
signed release workflow. Live-provider qualification remains credential-gated
and scheduled independently from pull requests.
