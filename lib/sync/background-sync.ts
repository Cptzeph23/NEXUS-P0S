import {
  syncTransactionsToServer,
  getLastSyncTime,
  updateLastSyncTime,
  getPendingSyncCount,
} from "./engine";
import { useSyncStore } from "@/stores/sync-store";

let syncInterval: ReturnType<typeof setInterval> | null = null;
const SYNC_INTERVAL = 30_000; // 30 seconds

export function startBackgroundSync() {
  if (syncInterval) {
    console.log("Background sync already running");
    return;
  }

  console.log("Starting background sync service...");

  // Initial sync
  performSync();

  // Set up interval
  syncInterval = setInterval(() => {
    performSync();
  }, SYNC_INTERVAL);
}

export function stopBackgroundSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
    console.log("Background sync stopped");
  }
}

async function performSync() {
  const { isSyncing, setIsSyncing, setLastSyncAt, setPendingCount, setLastError } =
    useSyncStore.getState();

  if (isSyncing) {
    console.log("Sync already in progress, skipping...");
    return;
  }

  if (!navigator.onLine) {
    console.log("Offline - skipping sync");
    return;
  }

  try {
    setIsSyncing(true);
    setLastError(null);

    const result = await syncTransactionsToServer();

    if (result.success) {
      await updateLastSyncTime();
      const lastSync = await getLastSyncTime();
      setLastSyncAt(lastSync!);
      console.log(`✓ Sync completed: ${result.synced} synced, ${result.failed} failed`);
    } else {
      console.warn(`Sync completed with errors: ${result.failed} failed`);
      if (result.errors.length > 0) {
        setLastError(result.errors[0].error);
      }
    }

    // Update pending count
    const pending = await getPendingSyncCount();
    setPendingCount(pending);
  } catch (error) {
    console.error("Sync failed:", error);
    setLastError((error as Error).message);
  } finally {
    setIsSyncing(false);
  }
}

export async function manualSync(): Promise<void> {
  await performSync();
}