import { db } from "@/lib/db/schema";

import {
  getPendingTransactions,
  updateTransactionSyncStatus,
} from "@/lib/db/transactions";
import {
  getPendingSyncEvents,
  markSyncEventProcessed,
  incrementSyncAttempts,
} from "@/lib/db/sync-queue";
import { supabase } from "@/lib/supabase/client";
import type { LocalTransaction } from "@/types";

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export async function syncTransactionsToServer(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Get pending transactions
    const pending = await getPendingTransactions();

    if (pending.length === 0) {
      console.log("No pending transactions to sync");
      return result;
    }

    console.log(`Syncing ${pending.length} transactions...`);

    // Mark all as syncing
    for (const txn of pending) {
      await updateTransactionSyncStatus(txn.id, "syncing");
    }

    // Prepare transaction data
    const transactionsData = pending.map((txn) => ({
      id: txn.id,
      type: txn.type,
      branchId: txn.branchId,
      terminalId: txn.terminalId,
      cashierId: txn.cashierId,
      customer: txn.customer,
      receiptNumber: txn.receiptNumber,
      items: txn.items,
      payment: txn.payment,
      subtotal: txn.subtotal,
      discountAmt: txn.discountAmt,
      tax: txn.tax,
      total: txn.total,
      note: txn.note,
      status: txn.status,
      completedAt: txn.completedAt,
      localVersion: txn.localVersion,
    }));

    // Send to API
    const response = await fetch("/api/sync/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionsData),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const data = await response.json();

    // Update local status based on server response
    for (const txn of pending) {
      const wasSuccessful = !data.errors.find((e: any) => e.id === txn.id);
      
      if (wasSuccessful) {
        await updateTransactionSyncStatus(txn.id, "synced");
      } else {
        const error = data.errors.find((e: any) => e.id === txn.id);
        await updateTransactionSyncStatus(txn.id, "failed", error?.error);
      }
    }

    result.synced = data.synced;
    result.failed = data.failed;
    result.errors = data.errors;
    result.success = data.success;

    console.log(`✓ Sync completed: ${result.synced} synced, ${result.failed} failed`);
    
    return result;
  } catch (error) {
    console.error("Sync engine error:", error);
    
    // Mark all as failed
    const pending = await getPendingTransactions();
    for (const txn of pending) {
      if (txn.syncStatus === "syncing") {
        await updateTransactionSyncStatus(txn.id, "failed", (error as Error).message);
      }
    }
    
    result.success = false;
    result.failed = pending.length;
    return result;
  }
}

export async function syncStockLevelsToServer(
  branchId: string
): Promise<number> {
  try {
    // Get all local stock levels
    const stockLevels = await db.stock
      .where("branchId")
      .equals(branchId)
      .toArray();

    if (stockLevels.length === 0) return 0;

    // Update stock on server
    const updates = stockLevels.map((stock) => ({
      branch_id: stock.branchId,
      product_id: stock.productId,
      quantity: stock.quantity,
      reorder_point: stock.reorderPoint,
      max_stock: stock.maxStock,
    }));

    const { error } = await supabase
      .from("branch_stock")
      .upsert(updates, {
        onConflict: "branch_id,product_id",
      });

    if (error) throw error;

    console.log(`Synced ${stockLevels.length} stock levels`);
    return stockLevels.length;
  } catch (error) {
    console.error("Stock sync error:", error);
    throw error;
  }
}

export async function getLastSyncTime(): Promise<Date | null> {
  const { appConfig, CONFIG_KEYS } = await import("@/lib/db/schema");
  const lastSync = await appConfig.get<string>(CONFIG_KEYS.LAST_SYNC);
  return lastSync ? new Date(lastSync) : null;
}

export async function updateLastSyncTime(): Promise<void> {
  const { appConfig, CONFIG_KEYS } = await import("@/lib/db/schema");
  await appConfig.set(CONFIG_KEYS.LAST_SYNC, new Date().toISOString());
}

export async function getPendingSyncCount(): Promise<number> {
  const pending = await getPendingTransactions();
  return pending.length;
}