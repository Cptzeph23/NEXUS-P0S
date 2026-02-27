import type { CartItem, CartTotals } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function formatCurrency(
  amount: number,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export const fmt = (n: number) => formatCurrency(n);

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calcCartTotals(
  items: CartItem[],
  cartDiscountPct = 0
): CartTotals {
  const subtotal = round2(items.reduce((s, i) => s + i.lineTotal, 0));

  const cartDiscount = round2(subtotal * (cartDiscountPct / 100));
  const taxable = round2(subtotal - cartDiscount);

  const tax = round2(
    items.reduce((s, i) => {
      const adjustedLine = i.lineTotal * (1 - cartDiscountPct / 100);
      return s + adjustedLine * (i.taxRate / 100);
    }, 0)
  );

  const total = round2(taxable + tax);

  const itemDiscount = round2(
    items.reduce((s, i) => s + i.price * i.qty * (i.discount / 100), 0)
  );

  return {
    subtotal,
    itemDiscount,
    cartDiscount,
    tax,
    total,
    itemCount: items.reduce((s, i) => s + i.qty, 0),
  };
}

export function calcLineTotal(
  price: number,
  qty: number,
  discountPct = 0
): number {
  return round2(price * qty * (1 - discountPct / 100));
}

export function calcLineTax(lineTotal: number, taxRate: number): number {
  return round2(lineTotal * (taxRate / 100));
}

let receiptCounter = 1;

export function generateReceiptNumber(
  branchCode = "BR1",
  terminalNum = 1
): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const seq = String(receiptCounter++).padStart(4, "0");
  return `${branchCode}-T${terminalNum}-${y}${m}${d}-${seq}`;
}

export function generateDeviceId(): string {
  const parts = [
    navigator.userAgent.length.toString(16),
    screen.width.toString(16),
    screen.height.toString(16),
    (navigator.hardwareConcurrency ?? 1).toString(16),
    Date.now().toString(36),
    Math.random().toString(36).slice(2, 8),
  ];
  return parts.join("-").toUpperCase();
}

export function formatDate(iso: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function formatTime(iso: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function toDateString(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function truncate(str: string, maxLen: number): string {
  return str.length <= maxLen ? str : str.slice(0, maxLen - 3) + "...";
}

export function normalizeSearchKey(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, " ");
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}