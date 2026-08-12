package searchbridge

import "encoding/json"

type Result struct {
	Schema string `json:"schema"`
	Capability string `json:"capability"`
	Provider string `json:"provider"`
	Mode string `json:"mode"`
	RetrievedAt string `json:"retrieved_at"`
	Rows []json.RawMessage `json:"rows"`
}

type Batch struct {
	Schema string `json:"schema"`
	BoundedConcurrency int `json:"bounded_concurrency"`
	Execution string `json:"execution"`
	CancelFile string `json:"cancel_file"`
	Succeeded int `json:"succeeded"`
	Failed int `json:"failed"`
	Results []json.RawMessage `json:"results"`
}
