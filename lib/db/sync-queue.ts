import { db, type IDBSyncEvent } from "./schema";
import type { SyncEventType } from "@/types";
import { v4 as uuid } from "uuid";

export async function addToSyncQueue(
  type: SyncEventType,
  entityId: string,
  payload: unknown
): Promise<void> {
  const event: IDBSyncEvent = {
    id: uuid(),
    type,
    entityId,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };

  await db.syncQueue.add(event);
}

export async function getPendingSyncEvents(
  limit = 25
): Promise<IDBSyncEvent[]> {
  return await db.syncQueue
    .where("attempts")
    .below(5)
    .limit(limit)
    .toArray();
}

export async function markSyncEventProcessed(id: string): Promise<void> {
  await db.syncQueue.delete(id);
}

export async function incrementSyncAttempts(
  id: string,
  error: string
): Promise<void> {
  await db.syncQueue.where("id").equals(id).modify((event) => {
    event.attempts++;
    event.lastAttempt = new Date().toISOString();
    event.error = error;
  });
}

export async function getPendingSyncCount(): Promise<number> {
  return await db.syncQueue.where("attempts").below(5).count();
}