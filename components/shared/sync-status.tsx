"use client";

import { useEffect } from "react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useSyncStore } from "@/stores/sync-store";
import { manualSync } from "@/lib/sync/background-sync";
import { getPendingSyncCount } from "@/lib/sync/engine";

export function SyncStatus() {
  const isOnline = useNetworkStatus();
  const { isSyncing, pendingCount, lastSyncAt, lastError, setPendingCount } =
    useSyncStore();

  useEffect(() => {
    async function loadPending() {
      const count = await getPendingSyncCount();
      setPendingCount(count);
    }
    loadPending();

    // Refresh pending count every 10 seconds
    const interval = setInterval(loadPending, 10_000);
    return () => clearInterval(interval);
  }, [setPendingCount]);

  async function handleManualSync() {
    await manualSync();
  }

  const statusColor = !isOnline
    ? "#ef4444"
    : isSyncing
    ? "#f59e0b"
    : pendingCount > 0
    ? "#3b82f6"
    : "#22c55e";

  const statusText = !isOnline
    ? "Offline"
    : isSyncing
    ? "Syncing..."
    : pendingCount > 0
    ? `${pendingCount} pending`
    : "Synced";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleManualSync}
        disabled={isSyncing || !isOnline}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
        style={{
          backgroundColor: !isOnline ? "#1a0d0d" : "#0d0d1a",
          border: `1px solid ${statusColor}`,
          color: statusColor,
        }}
        title={lastError || undefined}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{
            backgroundColor: statusColor,
            animation: isSyncing ? "pulse 1.5s ease-in-out infinite" : "none",
          }}
        />
        <span>{statusText}</span>
      </button>

      {lastSyncAt && (
        <div className="text-xs" style={{ color: "#6b6b8a" }}>
          {new Date(lastSyncAt).toLocaleTimeString()}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}