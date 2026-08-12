# SearchBridge 0.2.3 release qualification

SearchBridge 0.2.3 is the qualified release for the completed production
backlog. It retains the corrected Kujo pin from 0.2.2 and supplies the required
stable toolchain input to every Rust setup action. Earlier signed tags remain
immutable and their failed automation runs preserve the audit trail.

Qualification requires the local 145-assertion validation gate, all 13 golden
public envelopes, provider snapshots, Linux/macOS/Windows smoke jobs, and the
signed release workflow. Live-provider qualification remains credential-gated
and scheduled independently from pull requests.
