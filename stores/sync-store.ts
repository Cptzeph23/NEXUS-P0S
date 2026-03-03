import { create } from "zustand";

interface SyncState {
  isSyncing: boolean;
  lastSyncAt: Date | null;
  pendingCount: number;
  lastError: string | null;
  
  setIsSyncing: (syncing: boolean) => void;
  setLastSyncAt: (date: Date) => void;
  setPendingCount: (count: number) => void;
  setLastError: (error: string | null) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  isSyncing: false,
  lastSyncAt: null,
  pendingCount: 0,
  lastError: null,
  
  setIsSyncing: (syncing) => set({ isSyncing: syncing }),
  setLastSyncAt: (date) => set({ lastSyncAt: date }),
  setPendingCount: (count) => set({ pendingCount: count }),
  setLastError: (error) => set({ lastError: error }),
}));