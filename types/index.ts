export type UUID = string;
export type ISO8601 = string;
export type Currency = number;
export type Percentage = number;

export type TransactionType = "sale" | "refund" | "void" | "exchange";
export type TransactionStatus = "draft" | "completed" | "refunded" | "voided";
export type SyncStatus = "pending" | "syncing" | "synced" | "failed";
export type PaymentMethod = "cash" | "card" | "mobile_pay" | "split" | "loyalty";
export type UserRole = "cashier" | "supervisor" | "manager" | "admin";
export type StockMovementType = "sale" | "purchase" | "adjustment" | "transfer_in" | "transfer_out" | "refund";
export type SyncEventType = "transaction" | "stock_adjustment" | "price_change" | "customer_update";

export interface Product {
  id: UUID;
  tenantId: UUID;
  barcode: string | null;
  sku: string | null;
  name: string;
  description: string | null;
  price: Currency;
  cost: Currency | null;
  taxRate: Percentage;
  category: string | null;
  unit: string;
  imageUrl: string | null;
  isActive: boolean;
  updatedAt: ISO8601;
}

export interface LocalProduct extends Product {
  stock: number;
  serverStock?: number;
  syncedAt: ISO8601;
}

export interface CartItem {
  productId: UUID;
  barcode: string;
  name: string;
  price: Currency;
  qty: number;
  discount: Percentage;
  taxRate: Percentage;
  lineTotal: Currency;
  lineTax: Currency;
}

export interface CartState {
  items: CartItem[];
  discount: Percentage;
  customer: CustomerRef | null;
  note: string;
  createdAt: ISO8601;
}

export interface CartTotals {
  subtotal: Currency;
  itemDiscount: Currency;
  cartDiscount: Currency;
  tax: Currency;
  total: Currency;
  itemCount: number;
}

export interface PaymentDetails {
  method: PaymentMethod;
  amount: Currency;
  change?: Currency;
  reference?: string;
  loyaltyPoints?: number;
  splits?: PaymentSplit[];
}

export interface PaymentSplit {
  method: Exclude<PaymentMethod, "split">;
  amount: Currency;
}

export interface Transaction {
  id: UUID;
  type: TransactionType;
  originalId?: UUID;
  terminalId: UUID;
  branchId: UUID;
  cashierId: UUID;
  cashierName: string;
  customer?: CustomerRef;
  receiptNumber: string;
  items: CartItem[];
  payment: PaymentDetails;
  subtotal: Currency;
  discount: Percentage;
  discountAmt: Currency;
  tax: Currency;
  total: Currency;
  note?: string;
  status: TransactionStatus;
  completedAt: ISO8601;
  createdAt: ISO8601;
}

export interface LocalTransaction extends Transaction {
  syncStatus: SyncStatus;
  syncedAt?: ISO8601;
  serverVersion?: number;
  localVersion: number;
  syncError?: string;
}

export interface Customer {
  id: UUID;
  tenantId: UUID;
  name: string;
  email?: string;
  phone?: string;
  loyaltyPoints: number;
  totalSpent: Currency;
  totalVisits: number;
  createdAt: ISO8601;
}

export interface CustomerRef {
  id: UUID;
  name: string;
}

export interface Branch {
  id: UUID;
  tenantId: UUID;
  name: string;
  code: string;
  address?: Address;
  settings: BranchSettings;
  isActive: boolean;
}

export interface BranchSettings {
  taxRate: Percentage;
  currency: string;
  receiptFooter: string;
  timezone: string;
}

export interface Terminal {
  id: UUID;
  branchId: UUID;
  name: string;
  deviceId: string;
  lastSeen?: ISO8601;
  isActive: boolean;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
  id: UUID;
  tenantId: UUID;
  branchId: UUID | null;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  pin?: string;
  isActive: boolean;
}

export interface CashierSession {
  sessionId: UUID;
  cashier: Pick<User, "id" | "name" | "role">;
  terminalId: UUID;
  branchId: UUID;
  token: string;
  expiresAt: ISO8601;
  startedAt: ISO8601;
}

export interface SyncEvent {
  id: UUID;
  type: SyncEventType;
  entityId: UUID;
  payload: unknown;
  createdAt: ISO8601;
  attempts: number;
  lastAttempt?: ISO8601;
  error?: string;
}

export interface SyncBatchRequest {
  terminalId: UUID;
  events: Array<{
    syncId: UUID;
    type: SyncEventType;
    entityId: UUID;
    payload: unknown;
  }>;
}

export interface SyncBatchResponse {
  processed: Array<{
    syncId: UUID;
    entityId: UUID;
    type: SyncEventType;
    accepted: boolean;
    serverVersion?: number;
  }>;
  failed: Array<{
    syncId: UUID;
    reason: string;
  }>;
  serverTime: ISO8601;
}

export interface StockLevel {
  productId: UUID;
  branchId: UUID;
  quantity: number;
  reorderPoint: number;
  maxStock?: number;
  updatedAt: ISO8601;
}

export interface DailySummary {
  date: string;
  branchId: UUID;
  totalTransactions: number;
  totalRevenue: Currency;
  totalTax: Currency;
  totalDiscount: Currency;
  totalRefunds: Currency;
  netRevenue: Currency;
  byPaymentMethod: Record<PaymentMethod, Currency>;
  topProducts: Array<{
    productId: UUID;
    name: string;
    qty: number;
    revenue: Currency;
  }>;
}

export interface PrinterStatus {
  connected: boolean;
  mode: "web-serial" | "bridge" | "none";
  error?: string;
}

export interface BarcodeScanEvent {
  barcode: string;
  timestamp: ISO8601;
}

export interface Notification {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}