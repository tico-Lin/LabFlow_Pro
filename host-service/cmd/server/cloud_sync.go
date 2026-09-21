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
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := c.refreshOAuthToken(ctx); err != nil {
		slog.Error("Failed to refresh OAuth token", "error", err)
		return
	}

	// Read local directory
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

	for _, entry := range entries {
		if !entry.IsDir() {
			localInfo, err := entry.Info()
			if err != nil {
				continue
			}

			// Poll remote timestamp
			remoteModTime, err := c.pollRemoteTimestamp(ctx, entry.Name())
			if err != nil {
				slog.Error("Failed to poll remote timestamp", "file", entry.Name(), "error", err)
				continue
			}

			// Compare timestamps
			if localInfo.ModTime().After(remoteModTime) {
				slog.Info("Uploading newer local file", "file", entry.Name())
				c.uploadFile(ctx, entry.Name())
			} else if remoteModTime.After(localInfo.ModTime()) {
				slog.Info("Downloading newer remote file", "file", entry.Name())
				c.downloadFile(ctx, entry.Name())
			} else {
				slog.Debug("File is up to date", "file", entry.Name())
			}
		}
	}
}

func (c *CloudSyncer) refreshOAuthToken(ctx context.Context) error {
	// Mock Google Drive OAuth token refresh
	if c.provider != "GoogleDrive" {
		return nil
	}
	slog.Debug("Refreshing Google Drive OAuth token...")
	time.Sleep(10 * time.Millisecond) // Simulate network delay
	c.oauthToken = "refreshed-oauth-token"
	return nil
}

func (c *CloudSyncer) pollRemoteTimestamp(ctx context.Context, filename string) (time.Time, error) {
	// Mock polling remote timestamp from Google Drive API
	time.Sleep(5 * time.Millisecond)
	// Return a slightly old time to simulate local being newer
	return time.Now().Add(-1 * time.Hour), nil
}

func (c *CloudSyncer) uploadFile(ctx context.Context, filename string) {
	// Mock upload to Google Drive
	time.Sleep(20 * time.Millisecond)
}

func (c *CloudSyncer) downloadFile(ctx context.Context, filename string) {
	// Mock download from Google Drive
	time.Sleep(20 * time.Millisecond)
}

