import { db } from "@/lib/db/schema";
import { supabase } from "@/lib/supabase/client";
import type { CartItem } from "@/types";

export async function updateStockAfterSale(
  branchId: string,
  items: CartItem[]
): Promise<void> {
  try {
    for (const item of items) {
      // Update local stock
      await db.products.where("id").equals(item.productId).modify((product) => {
        product.stock = Math.max(0, product.stock - item.qty);
      });

      // Also update stock table
      const currentStock = await db.stock
        .where("branchProduct")
        .equals(`${branchId}:${item.productId}`)
        .first();

      if (currentStock) {
        await db.stock.update(currentStock.id, {
          quantity: Math.max(0, currentStock.quantity - item.qty),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    console.log("Stock updated for sale");
  } catch (error) {
    console.error("Failed to update stock:", error);
  }
}

export async function syncStockFromServer(branchId: string): Promise<void> {
  try {
    const { data: stockLevels, error } = await supabase
      .from("branch_stock")
      .select("product_id, quantity, reorder_point, max_stock")
      .eq("branch_id", branchId);

    if (error) throw error;

    // Update local stock
    for (const stock of stockLevels) {
      await db.stock.put({
        id: `${branchId}:${stock.product_id}`,
        branchId,
        productId: stock.product_id,
        quantity: stock.quantity,
        reorderPoint: stock.reorder_point,
        maxStock: stock.max_stock,
        branchProduct: `${branchId}:${stock.product_id}`,
        updatedAt: new Date().toISOString(),
      });

      // Update product stock as well
      await db.products
        .where("id")
        .equals(stock.product_id)
        .modify((product) => {
          product.stock = stock.quantity;
          product.serverStock = stock.quantity;
        });
    }

    console.log(`Synced stock levels for ${stockLevels.length} products`);
  } catch (error) {
    console.error("Stock sync failed:", error);
    throw error;
  }
}

export async function getLowStockProducts(
  branchId: string
): Promise<Array<{ productId: string; name: string; stock: number; reorderPoint: number }>> {
  const stockItems = await db.stock.where("branchId").equals(branchId).toArray();

  const lowStock = [];
  for (const stock of stockItems) {
    if (stock.quantity <= stock.reorderPoint) {
      const product = await db.products.get(stock.productId);
      if (product) {
        lowStock.push({
          productId: product.id,
          name: product.name,
          stock: stock.quantity,
          reorderPoint: stock.reorderPoint,
        });
      }
    }
  }

  return lowStock;
}

export async function getProductStock(
  branchId: string,
  productId: string
): Promise<number> {
  const product = await db.products.get(productId);
  return product?.stock || 0;
}