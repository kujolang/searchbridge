package searchbridge

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"os/exec"
)

type CommandError struct {
	ExitCode int
	Stderr   string
}

func (e *CommandError) Error() string {
	return fmt.Sprintf("searchbridge exited %d: %s", e.ExitCode, e.Stderr)
}

type Client struct {
	Executable string
	Dir        string
}

func NewClient(executable string) *Client {
	if executable == "" {
		executable = os.Getenv("SEARCHBRIDGE_BIN")
	}
	if executable == "" {
		executable = "searchbridge"
	}
	return &Client{Executable: executable}
}
func (c *Client) Run(ctx context.Context, args ...string) (json.RawMessage, error) {
	command := exec.CommandContext(ctx, c.Executable, args...)
	command.Dir = c.Dir
	output, err := command.Output()
	if err != nil {
		if exit, ok := err.(*exec.ExitError); ok {
			stderr := string(exit.Stderr)
			if len(stderr) > 65536 {
				stderr = stderr[:65536]
			}
			return nil, &CommandError{ExitCode: exit.ExitCode(), Stderr: stderr}
		}
		return nil, err
	}
	if !json.Valid(output) {
		return nil, fmt.Errorf("searchbridge returned invalid JSON")
	}
	return output, nil
}
func ValidateResult(data []byte) error {
	var value struct {
		Schema string            `json:"schema"`
		Rows   []json.RawMessage `json:"rows"`
	}
	if err := json.Unmarshal(data, &value); err != nil {
		return err
	}
	if value.Schema != "searchbridge.result/v1" || value.Rows == nil {
		return fmt.Errorf("invalid searchbridge result contract")
	}
	return nil
}
func DecodeJSONL(reader io.Reader, consume func(json.RawMessage) error) error {
	scanner := bufio.NewScanner(reader)
	scanner.Buffer(make([]byte, 64*1024), 1024*1024)
	for scanner.Scan() {
		if len(scanner.Bytes()) == 0 {
			continue
		}
		row := append(json.RawMessage(nil), scanner.Bytes()...)
		if !json.Valid(row) {
			return fmt.Errorf("invalid searchbridge JSONL row")
		}
		if err := consume(row); err != nil {
			return err
		}
	}
	return scanner.Err()
}
