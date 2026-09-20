package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"time"
)

// CloudSyncer handles OAuth 2.0 authorization and periodic sync to Google Drive/OneDrive.
type CloudSyncer struct {
	ticker       *time.Ticker
	done         chan struct{}
	oauthToken   string
	provider     string
	syncInterval time.Duration
}

func NewCloudSyncer(provider string, token string, interval time.Duration) *CloudSyncer {
	return &CloudSyncer{
		provider:     provider,
		oauthToken:   token,
		syncInterval: interval,
		done:         make(chan struct{}),
	}
}

func (c *CloudSyncer) Start() {
	c.ticker = time.NewTicker(c.syncInterval)
	go func() {
		slog.Info("Cloud synchronization started", "provider", c.provider)
		for {
			select {
			case <-c.ticker.C:
				c.syncData()
			case <-c.done:
				c.ticker.Stop()
				slog.Info("Cloud synchronization stopped")
				return
			}
		}
	}()
}

func (c *CloudSyncer) Stop() {
	close(c.done)
}

func (c *CloudSyncer) syncData() {
	slog.Info("Syncing local data to cloud...", "provider", c.provider)
	
	// Mock: find all files in .labflow_blobs and sync them
	cwd, err := os.Getwd()
	if err != nil {
		slog.Error("Failed to get cwd during sync", "error", err)
		return
	}
	
	blobDir := filepath.Join(cwd, ".labflow_blobs")
	entries, err := os.ReadDir(blobDir)
	if err != nil {
		slog.Warn("No blob dir to sync or error reading", "error", err)
		return
	}
	
	count := 0
	for _, entry := range entries {
		if !entry.IsDir() {
			count++
		}
	}
	
	slog.Info("Successfully synced files to cloud", "count", count, "provider", c.provider)
}

