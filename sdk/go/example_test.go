package searchbridge_test

import (
	"context"
	"fmt"
	searchbridge "github.com/kujolang/searchbridge/sdk/go"
	"path/filepath"
)

func ExampleClient() {
	executable, _ := filepath.Abs("../../searchbridge")
	client := searchbridge.NewClient(executable)
	client.Dir = "../.."
	result, err := client.Run(context.Background(), "fetch", "--capability", "analytics", "--provider", "google-analytics-4", "--fixture", "--offline", "--deterministic")
	if err != nil {
		panic(err)
	}
	if err := searchbridge.ValidateResult(result); err != nil {
		panic(err)
	}
	fmt.Println("valid SearchBridge result") /* Output: valid SearchBridge result */
}
