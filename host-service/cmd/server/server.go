package main

import (
	"context"
	"fmt"
	"log/slog"
	"net"
	"os"
	"os/signal"
	"syscall"

	"google.golang.org/grpc"
)

// Server holds gRPC server state.
type Server struct {
	grpc *grpc.Server
}

func NewServer() *Server {
	return &Server{
		grpc: grpc.NewServer(),
	}
}

func (s *Server) Run() error {
	addr := envOr("HOST_SERVICE_ADDR", ":50051")
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		return fmt.Errorf("listen %s: %w", addr, err)
	}

	ctx, stop := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer stop()

	errCh := make(chan error, 1)
	go func() {
		slog.Info("gRPC server listening", "addr", addr)
		if err := s.grpc.Serve(lis); err != nil {
			errCh <- err
		}
	}()

	// Start cloud sync (Mocking OAuth tokens for now)
	syncer := NewCloudSyncer("GoogleDrive", "mock-oauth-token-123", 1*time.Minute)
	syncer.Start()

	select {
	case <-ctx.Done():
		slog.Info("shutting down gracefully")
		syncer.Stop()
		s.grpc.GracefulStop()
		return nil
	case err := <-errCh:
		syncer.Stop()
		return err
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
