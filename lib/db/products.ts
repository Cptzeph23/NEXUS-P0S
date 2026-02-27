import { db, type IDBProduct } from "./schema";
import { supabase } from "@/lib/supabase/client";
import type { LocalProduct } from "@/types";
import { normalizeSearchKey } from "@/lib/utils";

export async function syncProductsFromServer(
  branchId: string
): Promise<number> {
  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
      id,
      tenant_id,
      barcode,
      sku,
      name,
      description,
      price,
      cost,
      tax_rate,
      category,
      unit,
      image_url,
      is_active,
      updated_at,
      branch_stock!inner(quantity)
    `
    )
    .eq("branch_stock.branch_id", branchId)
    .eq("is_active", true);

  if (error) throw error;

  const now = new Date().toISOString();

  const idbProducts: IDBProduct[] = products.map((p: any) => ({
    id: p.id,
    tenantId: p.tenant_id,
    barcode: p.barcode,
    sku: p.sku,
    name: p.name,
    description: p.description,
    price: parseFloat(p.price),
    cost: p.cost ? parseFloat(p.cost) : null,
    taxRate: parseFloat(p.tax_rate),
    category: p.category,
    unit: p.unit,
    imageUrl: p.image_url,
    isActive: p.is_active,
    updatedAt: p.updated_at,
    stock: p.branch_stock[0]?.quantity || 0,
    serverStock: p.branch_stock[0]?.quantity || 0,
    syncedAt: now,
    categoryNormalized: p.category?.toLowerCase() || "",
  }));

  await db.products.bulkPut(idbProducts);

  return idbProducts.length;
}

export async function getProductByBarcode(
  barcode: string
): Promise<IDBProduct | undefined> {
  return await db.products.get({ barcode });
}

export async function getProductById(
  id: string
): Promise<IDBProduct | undefined> {
  return await db.products.get(id);
}

export async function searchProducts(query: string): Promise<IDBProduct[]> {
  const normalized = normalizeSearchKey(query);

  return await db.products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(normalized) ||
        p.barcode?.includes(normalized) ||
        p.sku?.includes(normalized)
    )
    .limit(20)
    .toArray();
}

export async function getProductsByCategory(
  category: string
): Promise<IDBProduct[]> {
  if (category === "All") {
    return await db.products.toArray();
  }

  return await db.products
    .where("categoryNormalized")
    .equals(category.toLowerCase())
    .toArray();
}

export async function getAllCategories(): Promise<string[]> {
  const products = await db.products.toArray();
  const categories = new Set(
    products.map((p) => p.category).filter((c): c is string => !!c)
  );
  return ["All", ...Array.from(categories).sort()];
}

export async function updateLocalStock(
  productId: string,
  delta: number
): Promise<void> {
  await db.products.where("id").equals(productId).modify((p) => {
    p.stock = Math.max(0, p.stock + delta);
  });
}