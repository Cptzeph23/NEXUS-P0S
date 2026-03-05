import { db } from "@/lib/db/schema";
import { supabase } from "@/lib/supabase/client";
import type { Customer } from "@/types";
import { normalizeSearchKey } from "@/lib/utils";
import { v4 as uuid } from "uuid";

export async function searchCustomers(query: string): Promise<Customer[]> {
  const normalized = normalizeSearchKey(query);

  const customers = await db.customers
    .filter(
      (c) =>
        c.name.toLowerCase().includes(normalized) ||
        c.email?.toLowerCase().includes(normalized) ||
        c.phone?.includes(normalized)
    )
    .limit(10)
    .toArray();

  return customers;
}

export async function getCustomerById(id: string): Promise<Customer | undefined> {
  return await db.customers.get(id);
}

export async function createCustomer(
  tenantId: string,
  data: {
    name: string;
    email?: string;
    phone?: string;
  }
): Promise<Customer> {
  const customer: Customer = {
    id: uuid(),
    tenantId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    loyaltyPoints: 0,
    totalSpent: 0,
    totalVisits: 0,
    createdAt: new Date().toISOString(),
  };

  // Save to IndexedDB
  await db.customers.add({
    ...customer,
    searchKey: normalizeSearchKey(`${data.name} ${data.email} ${data.phone}`),
  });

  // Try to sync to server
  try {
    const { error } = await supabase.from("customers").insert({
      id: customer.id,
      tenant_id: customer.tenantId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      loyalty_points: 0,
      total_spent: 0,
      total_visits: 0,
    });

    if (error) {
      console.warn("Failed to sync customer to server:", error);
    }
  } catch (error) {
    console.warn("Customer sync failed, will retry later");
  }

  return customer;
}

export async function updateCustomerAfterPurchase(
  customerId: string,
  saleTotal: number
): Promise<void> {
  await db.customers.where("id").equals(customerId).modify((customer) => {
    customer.totalSpent += saleTotal;
    customer.totalVisits += 1;
    // Award 1 point per dollar spent
    customer.loyaltyPoints += Math.floor(saleTotal);
  });

  console.log(`Updated customer ${customerId} stats`);
}

export async function syncCustomersFromServer(tenantId: string): Promise<number> {
  try {
    const { data: customers, error } = await supabase
      .from("customers")
      .select("*")
      .eq("tenant_id", tenantId)
      .limit(100);

    if (error) throw error;

    for (const c of customers) {
      await db.customers.put({
        id: c.id,
        tenantId: c.tenant_id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        loyaltyPoints: c.loyalty_points,
        totalSpent: parseFloat(c.total_spent),
        totalVisits: c.total_visits,
        createdAt: c.created_at,
        searchKey: normalizeSearchKey(`${c.name} ${c.email} ${c.phone}`),
      });
    }

    console.log(`Synced ${customers.length} customers`);
    return customers.length;
  } catch (error) {
    console.error("Customer sync failed:", error);
    throw error;
  }
}