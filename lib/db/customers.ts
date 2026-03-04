import { db, type IDBCustomerCache } from "./schema";
import type { Customer } from "@/types";
import { normalizeSearchKey } from "@/lib/utils";

export async function searchCustomers(
  query: string
): Promise<IDBCustomerCache[]> {
  const normalized = normalizeSearchKey(query);

  // Search in local cache first
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

  // Search via API
  try {
    const response = await fetch(`/api/customers?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error("Search failed");
    }

    const { customers } = await response.json();

    // Cache results
    const idbCustomers: IDBCustomerCache[] = customers.map((c: any) => ({
      id: c.id,
      tenantId: c.tenantId,
      name: c.name,
      email: c.email,
      phone: c.phone,
      loyaltyPoints: c.loyaltyPoints,
      totalSpent: c.totalSpent,
      totalVisits: c.totalVisits,
      createdAt: c.createdAt,
      searchKey: normalizeSearchKey(
        c.name + " " + (c.email || "") + " " + (c.phone || "")
      ),
    }));

    await db.customers.bulkPut(idbCustomers);

    return idbCustomers;
  } catch (error) {
    console.error("Customer search error:", error);
    return [];
  }
}

export async function getCustomerById(
  id: string
): Promise<IDBCustomerCache | undefined> {
  // Try local first
  const customer = await db.customers.get(id);
  return customer;
}

export async function createCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  tenantId: string;
}): Promise<IDBCustomerCache> {
  try {
    const response = await fetch("/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create customer");
    }

    const { customer } = await response.json();

    const idbCustomer: IDBCustomerCache = {
      id: customer.id,
      tenantId: customer.tenantId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      loyaltyPoints: customer.loyaltyPoints,
      totalSpent: customer.totalSpent,
      totalVisits: customer.totalVisits,
      createdAt: customer.createdAt,
      searchKey: normalizeSearchKey(customer.name),
    };

    await db.customers.put(idbCustomer);

    return idbCustomer;
  } catch (error) {
    console.error("Create customer error:", error);
    throw error;
  }
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