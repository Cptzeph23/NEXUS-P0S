import { db, type IDBCustomerCache } from "./schema";
import { supabase } from "@/lib/supabase/client";
import type { Customer } from "@/types";
import { normalizeSearchKey } from "@/lib/utils";
import { v4 as uuid } from "uuid";

export async function searchCustomers(
  query: string
): Promise<IDBCustomerCache[]> {
  const normalized = normalizeSearchKey(query);

  // Search in local cache
  const local = await db.customers
    .filter(
      (c) =>
        c.searchKey.includes(normalized) ||
        c.email?.includes(normalized) ||
        c.phone?.includes(normalized)
    )
    .limit(10)
    .toArray();

  if (local.length > 0) {
    return local;
  }

  // If not found locally, search server
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .or(
      `name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`
    )
    .limit(10);

  if (error) {
    console.error("Customer search error:", error);
    return [];
  }

  // Cache results
  const customers: IDBCustomerCache[] = data.map((c: any) => ({
    id: c.id,
    tenantId: c.tenant_id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    loyaltyPoints: c.loyalty_points,
    totalSpent: parseFloat(c.total_spent),
    totalVisits: c.total_visits,
    createdAt: c.created_at,
    searchKey: normalizeSearchKey(c.name + " " + (c.email || "") + " " + (c.phone || "")),
  }));

  await db.customers.bulkPut(customers);

  return customers;
}

export async function getCustomerById(
  id: string
): Promise<IDBCustomerCache | undefined> {
  // Try local first
  let customer = await db.customers.get(id);

  if (customer) {
    return customer;
  }

  // Fetch from server
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return undefined;
  }

  customer = {
    id: data.id,
    tenantId: data.tenant_id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    loyaltyPoints: data.loyalty_points,
    totalSpent: parseFloat(data.total_spent),
    totalVisits: data.total_visits,
    createdAt: data.created_at,
    searchKey: normalizeSearchKey(data.name),
  };

  await db.customers.put(customer);

  return customer;
}

export async function createCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  tenantId: string;
}): Promise<IDBCustomerCache> {
  const customer = {
    id: uuid(),
    tenant_id: data.tenantId,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    loyalty_points: 0,
    total_spent: 0,
    total_visits: 0,
  };

  const { data: created, error } = await supabase
    .from("customers")
    .insert(customer)
    .select()
    .single();

  if (error) {
    throw error;
  }

  const idbCustomer: IDBCustomerCache = {
    id: created.id,
    tenantId: created.tenant_id,
    name: created.name,
    email: created.email,
    phone: created.phone,
    loyaltyPoints: created.loyalty_points,
    totalSpent: parseFloat(created.total_spent),
    totalVisits: created.total_visits,
    createdAt: created.created_at,
    searchKey: normalizeSearchKey(created.name),
  };

  await db.customers.put(idbCustomer);

  return idbCustomer;
}

export async function updateCustomerStats(
  customerId: string,
  saleAmount: number
): Promise<void> {
  await db.customers.where("id").equals(customerId).modify((customer) => {
    customer.totalSpent += saleAmount;
    customer.totalVisits += 1;
    // Award 1 point per dollar spent
    customer.loyaltyPoints += Math.floor(saleAmount);
  });

  // Queue for server sync
  const { addToSyncQueue } = await import("./sync-queue");
  await addToSyncQueue("customer_update", customerId, {
    totalSpent: saleAmount,
    totalVisits: 1,
    loyaltyPoints: Math.floor(saleAmount),
    timestamp: new Date().toISOString(),
  });
}

export async function redeemLoyaltyPoints(
  customerId: string,
  points: number
): Promise<number> {
  const customer = await db.customers.get(customerId);

  if (!customer) {
    throw new Error("Customer not found");
  }

  if (customer.loyaltyPoints < points) {
    throw new Error("Insufficient loyalty points");
  }

  // 100 points = $1 discount
  const discount = points / 100;

  await db.customers.where("id").equals(customerId).modify((c) => {
    c.loyaltyPoints -= points;
  });

  return discount;
}