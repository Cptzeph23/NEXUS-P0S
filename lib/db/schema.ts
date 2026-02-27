import Dexie, { type Table } from "dexie";
import type {
  LocalTransaction,
  LocalProduct,
  SyncEvent,
  Customer,
  CashierSession,
  StockLevel,
} from "@/types";

export interface IDBProduct extends LocalProduct {
  categoryNormalized: string;
}

export interface IDBTransaction extends LocalTransaction {
  date: string;
}

export interface IDBSyncEvent extends SyncEvent {}

export interface IDBCustomerCache extends Customer {
  searchKey: string;
}

export interface IDBSession extends CashierSession {
  isActive: 0 | 1;
}

export interface IDBStockLevel extends StockLevel {
  branchProduct: string;
}

export interface IDBAppConfig {
  key: string;
  value: unknown;
  updatedAt: string;
}

class NexusPOSDatabase extends Dexie {
  transactions!: Table<IDBTransaction>;
  products!: Table<IDBProduct>;
  syncQueue!: Table<IDBSyncEvent>;
  customers!: Table<IDBCustomerCache>;
  sessions!: Table<IDBSession>;
  stock!: Table<IDBStockLevel>;
  config!: Table<IDBAppConfig>;

  constructor() {
    super("NexusPOS_v1");

    this.version(1).stores({
      transactions: "id, branchId, terminalId, cashierId, date, status, syncStatus, completedAt, [branchId+date], [branchId+syncStatus], receiptNumber",
      products: "id, &barcode, category, categoryNormalized, syncedAt, updatedAt",
      syncQueue: "id, type, entityId, createdAt, attempts, [type+attempts]",
      customers: "id, email, phone, searchKey",
      sessions: "sessionId, isActive, cashier.id, startedAt",
      stock: "id, &branchProduct, branchId, productId, updatedAt",
      config: "&key",
    });
  }
}

export const db = new NexusPOSDatabase();

export const appConfig = {
  async get<T>(key: string): Promise<T | undefined> {
    const row = await db.config.get(key);
    return row?.value as T | undefined;
  },

  async set<T>(key: string, value: T): Promise<void> {
    await db.config.put({ key, value, updatedAt: new Date().toISOString() });
  },

  async delete(key: string): Promise<void> {
    await db.config.delete(key);
  },
};

export const CONFIG_KEYS = {
  TERMINAL_ID: "terminal_id",
  BRANCH_ID: "branch_id",
  TENANT_ID: "tenant_id",
  CASHIER_TOKEN: "cashier_token",
  SESSION_ID: "session_id",
  LAST_SYNC: "last_sync_at",
  PRODUCTS_ETAG: "products_etag",
  DEVICE_ID: "device_id",
} as const;

export async function checkDBHealth(): Promise<{
  ok: boolean;
  tables: Record<string, number>;
  error?: string;
}> {
  try {
    const [txCount, productCount, syncCount] = await Promise.all([
      db.transactions.count(),
      db.products.count(),
      db.syncQueue.count(),
    ]);
    return {
      ok: true,
      tables: {
        transactions: txCount,
        products: productCount,
        syncQueue: syncCount,
      },
    };
  } catch (err) {
    return {
      ok: false,
      tables: {},
      error: err instanceof Error ? err.message : "Unknown DB error",
    };
  }
}