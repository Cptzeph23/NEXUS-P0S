import { db, type IDBStockLevel } from "./schema";
import { supabase } from "@/lib/supabase/client";
import type { StockLevel } from "@/types";

export async function syncStockLevelsFromServer(
  branchId: string
): Promise<number> {
  try {
    const { data: stockLevels, error } = await supabase
      .from("branch_stock")
      .select(
        `
        id,
        branch_id,
        product_id,
        quantity,
        reorder_point,
        max_stock,
        updated_at
      `
      )
      .eq("branch_id", branchId);

    if (error) throw error;

    const now = new Date().toISOString();

    const idbStock: IDBStockLevel[] = stockLevels.map((s: any) => ({
      id: s.id,
      branchId: s.branch_id,
      productId: s.product_id,
      quantity: s.quantity,
      reorderPoint: s.reorder_point,
      maxStock: s.max_stock,
      branchProduct: `${s.branch_id}_${s.product_id}`,
      updatedAt: s.updated_at,
    }));

    await db.stock.bulkPut(idbStock);

    console.log(`Synced ${idbStock.length} stock levels`);
    return idbStock.length;
  } catch (error) {
    console.error("Stock sync error:", error);
    throw error;
  }
}

export async function getStockLevel(
  branchId: string,
  productId: string
): Promise<IDBStockLevel | undefined> {
  const key = `${branchId}_${productId}`;
  return await db.stock.get({ branchProduct: key });
}

export async function updateLocalStock(
  branchId: string,
  productId: string,
  delta: number
): Promise<void> {
  const key = `${branchId}_${productId}`;

  await db.stock.where("branchProduct").equals(key).modify((stock) => {
    stock.quantity = Math.max(0, stock.quantity + delta);
    stock.updatedAt = new Date().toISOString();
  });

  // Also update product stock cache
  await db.products.where("id").equals(productId).modify((product) => {
    product.stock = Math.max(0, product.stock + delta);
  });
}

export async function getLowStockItems(
  branchId: string
): Promise<IDBStockLevel[]> {
  return await db.stock
    .where("branchId")
    .equals(branchId)
    .filter((stock) => stock.quantity <= stock.reorderPoint)
    .toArray();
}

export async function adjustStock(
  branchId: string,
  productId: string,
  newQuantity: number,
  reason: string
): Promise<void> {
  const stock = await getStockLevel(branchId, productId);
  if (!stock) {
    throw new Error("Stock level not found");
  }

  const delta = newQuantity - stock.quantity;
  await updateLocalStock(branchId, productId, delta);

  // Queue for sync
  const { addToSyncQueue } = await import("./sync-queue");
  await addToSyncQueue("stock_adjustment", productId, {
    branchId,
    productId,
    oldQuantity: stock.quantity,
    newQuantity,
    delta,
    reason,
    timestamp: new Date().toISOString(),
  });
}