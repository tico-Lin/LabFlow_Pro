package agent

import (
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"

	pb "github.com/labflow/host-service/gen/labflow/v1"
)

type HostService struct {
	pb.UnimplementedHostServiceServer
	
	// Task queue and scheduling
	taskQueue chan *pb.TaskRequest
	wg        sync.WaitGroup
	
	// Sessions (mock implementation)
	sessions map[string]string // sessionId -> apiKey
	mu       sync.RWMutex
}

func NewHostService(workerCount int) *HostService {
	s := &HostService{
		taskQueue: make(chan *pb.TaskRequest, 1000),
		sessions:  make(map[string]string),
	}
	
	// Start worker pool for concurrent task processing
	for i := 0; i < workerCount; i++ {
		s.wg.Add(1)
		go s.worker(i)
	}
	
	return s
}

func (s *HostService) JoinSession(ctx context.Context, req *pb.JoinRequest) (*pb.JoinResponse, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	
	s.sessions[req.SessionId] = req.ApiKey
	
	slog.Info("Agent joined session", "session_id", req.SessionId)
	
	return &pb.JoinResponse{
		Accepted: true,
		Token:    "mock-jwt-token-for-" + req.SessionId,
		Message:  "Successfully joined session",
	}, nil
}

func (s *HostService) SubmitTask(ctx context.Context, req *pb.TaskRequest) (*pb.TaskResponse, error) {
	s.mu.RLock()
	_, exists := s.sessions[req.SessionId]
	s.mu.RUnlock()
	
	if !exists {
		return nil, fmt.Errorf("session not found: %s", req.SessionId)
	}
	
	select {
	case s.taskQueue <- req:
		slog.Info("Task queued", "task_id", req.TaskId, "priority", req.Priority)
		return &pb.TaskResponse{
			TaskId: req.TaskId,
			Status: pb.TaskStatus_TASK_STATUS_PENDING,
		}, nil
	default:
		return nil, fmt.Errorf("task queue full")
	}
}

func (s *HostService) SandboxWrite(ctx context.Context, req *pb.SandboxWriteRequest) (*pb.SandboxReadResponse, error) {
	// Delegated to core-engine via FFI in a real implementation
	slog.Info("Sandbox write requested", "offset", req.Offset, "size", len(req.Data))
	return &pb.SandboxReadResponse{
		Ok: true,
	}, nil
}

func (s *HostService) SandboxRead(ctx context.Context, req *pb.SandboxReadRequest) (*pb.SandboxReadResponse, error) {
	// Delegated to core-engine via FFI in a real implementation
	slog.Info("Sandbox read requested", "offset", req.Offset, "size", req.Size)
	return &pb.SandboxReadResponse{
		Ok:   true,
		Data: make([]byte, req.Size), // Mock empty data
	}, nil
}

func (s *HostService) worker(id int) {
	defer s.wg.Done()
	for task := range s.taskQueue {
		slog.Info("Worker processing task", "worker_id", id, "task_id", task.TaskId)
		
		// Simulate processing time
		time.Sleep(100 * time.Millisecond)
		
		slog.Info("Worker finished task", "worker_id", id, "task_id", task.TaskId)
	}
}

func (s *HostService) Stop() {
	close(s.taskQueue)
	s.wg.Wait()
}

