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

    for (const txn of pending) {
      try {
        await updateTransactionSyncStatus(txn.id, "syncing");

        // Prepare transaction data for server
        const serverData = {
          id: txn.id,
          type: txn.type,
          branch_id: txn.branchId,
          terminal_id: txn.terminalId,
          cashier_id: txn.cashierId,
          customer_id: txn.customer?.id || null,
          receipt_number: txn.receiptNumber,
          subtotal: txn.subtotal,
          discount: txn.discountAmt,
          tax: txn.tax,
          total: txn.total,
          payment_method: txn.payment.method,
          payment_data: JSON.stringify(txn.payment),
          note: txn.note || null,
          status: txn.status,
          completed_at: txn.completedAt,
          version: txn.localVersion,
        };

        // Insert transaction
        const { error: txnError } = await supabase
          .from("transactions")
          .upsert(serverData, {
            onConflict: "id",
            ignoreDuplicates: false,
          });

        if (txnError) throw txnError;

        // Insert transaction items
        const items = txn.items.map((item) => ({
          transaction_id: txn.id,
          product_id: item.productId,
          product_name: item.name,
          price: item.price,
          qty: item.qty,
          discount: item.discount,
          tax_rate: item.taxRate,
          line_total: item.lineTotal,
        }));

        const { error: itemsError } = await supabase
          .from("transaction_items")
          .upsert(items, {
            onConflict: "id",
            ignoreDuplicates: false,
          });

        if (itemsError) throw itemsError;

        // Update local status to synced
        await updateTransactionSyncStatus(txn.id, "synced");
        result.synced++;

        console.log(`✓ Synced transaction ${txn.receiptNumber}`);
      } catch (error) {
        console.error(`✗ Failed to sync transaction ${txn.id}:`, error);
        await updateTransactionSyncStatus(
          txn.id,
          "failed",
          (error as Error).message
        );
        result.failed++;
        result.errors.push({
          id: txn.id,
          error: (error as Error).message,
        });
      }
    }

    result.success = result.failed === 0;
    return result;
  } catch (error) {
    console.error("Sync engine error:", error);
    result.success = false;
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