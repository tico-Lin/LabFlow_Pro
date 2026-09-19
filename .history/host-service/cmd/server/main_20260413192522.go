package main

import (
	"log/slog"
	"os"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	slog.Info("LabFlow host-service starting")

	srv := NewServer()
	if err := srv.Run(); err != nil {
		slog.Error("server exited with error", "err", err)
		os.Exit(1)
	}
}
