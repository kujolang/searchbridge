package searchbridge

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

func TestGoldenResultAndBatchDecode(t *testing.T) {
	for _, payload := range []struct {
		data string
		out  any
	}{{`{"schema":"searchbridge.result/v1","capability":"analytics","provider":"google-analytics-4","mode":"fixture","retrieved_at":"1970-01-01T00:00:00Z","rows":[]}`, &Result{}}, {`{"schema":"searchbridge.batch/v1","bounded_concurrency":2,"execution":"bounded-worker-pool","cancel_file":"","succeeded":0,"failed":0,"results":[]}`, &Batch{}}} {
		if err := json.Unmarshal([]byte(payload.data), payload.out); err != nil {
			t.Fatal(err)
		}
	}
}

func TestEveryGoldenAndRowSchemaCompilesIntoConsumer(t *testing.T) {
	goldens, err := filepath.Glob("../../fixtures/golden/0.2/*.json")
	if err != nil {
		t.Fatal(err)
	}
	schemas, err := filepath.Glob("../../schemas/rows/*.json")
	if err != nil {
		t.Fatal(err)
	}
	for _, path := range append(goldens, schemas...) {
		data, err := os.ReadFile(path)
		if err != nil {
			t.Fatal(err)
		}
		var value map[string]any
		if err := json.Unmarshal(data, &value); err != nil {
			t.Fatalf("%s: %v", path, err)
		}
		if value["schema"] == "searchbridge.result/v1" {
			var result Result
			if err := json.Unmarshal(data, &result); err != nil {
				t.Fatal(err)
			}
		}
		if value["schema"] == "searchbridge.batch/v1" {
			var batch Batch
			if err := json.Unmarshal(data, &batch); err != nil {
				t.Fatal(err)
			}
		}
	}
}
