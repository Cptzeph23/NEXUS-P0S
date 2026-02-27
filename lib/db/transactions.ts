import { db, type IDBTransaction } from "./schema";
import type { LocalTransaction, CartItem, PaymentDetails } from "@/types";
import { v4 as uuid } from "uuid";
import { toDateString } from "@/lib/utils";

export async function saveTransaction(
  transaction: Omit<LocalTransaction, "id" | "createdAt" | "localVersion">
): Promise<IDBTransaction> {
  const idbTransaction: IDBTransaction = {
    ...transaction,
    id: uuid(),
    createdAt: new Date().toISOString(),
    localVersion: 1,
    date: toDateString(new Date(transaction.completedAt)),
  };

  await db.transactions.add(idbTransaction);

  return idbTransaction;
}

export async function getTransactionById(
  id: string
): Promise<IDBTransaction | undefined> {
  return await db.transactions.get(id);
}

export async function getTransactionsByDate(
  date: string,
  branchId: string
): Promise<IDBTransaction[]> {
  return await db.transactions
    .where("[branchId+date]")
    .equals([branchId, date])
    .reverse()
    .sortBy("completedAt");
}

export async function getPendingTransactions(): Promise<IDBTransaction[]> {
  return await db.transactions.where("syncStatus").equals("pending").toArray();
}

export async function updateTransactionSyncStatus(
  id: string,
  status: "syncing" | "synced" | "failed",
  error?: string
): Promise<void> {
  await db.transactions.update(id, {
    syncStatus: status,
    syncedAt: status === "synced" ? new Date().toISOString() : undefined,
    syncError: error,
  });
}