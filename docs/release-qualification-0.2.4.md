# SearchBridge 0.2.4 release qualification

SearchBridge 0.2.4 is the final qualified release for the completed 0.2
production backlog. Its source includes the pinned Kujo runtime build,
cross-platform launchers, and the Windows `x64-windows-static-md` OpenSSL
prerequisite discovered by the live platform matrix. Earlier signed tags remain
immutable and preserve their automation audit trail.

Qualification requires the local 145-assertion validation gate, all 13 golden
public envelopes, provider snapshots, Linux/macOS/Windows package smoke, and
the signed release workflow. Live-provider qualification remains
credential-gated and scheduled independently from pull requests.
