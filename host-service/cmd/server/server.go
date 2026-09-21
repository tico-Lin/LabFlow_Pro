package main

import (
	"context"
	"fmt"
	"log/slog"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/labflow/host-service/internal/agent"
	pb "github.com/labflow/host-service/gen/labflow/v1"
	"google.golang.org/grpc"
)

// Server holds gRPC server state.
type Server struct {
	grpc        *grpc.Server
	hostService *agent.HostService
}

func NewServer() *Server {
	grpcServer := grpc.NewServer()
	hostService := agent.NewHostService(4) // 4 workers for task queue
	
	pb.RegisterHostServiceServer(grpcServer, hostService)
	
	return &Server{
		grpc:        grpcServer,
		hostService: hostService,
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
		s.hostService.Stop()
		s.grpc.GracefulStop()
		return nil
	case err := <-errCh:
		syncer.Stop()
		s.hostService.Stop()
		return err
	}
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
