import { db } from "@/lib/db/schema";
import type { DailySummary } from "@/types";
import { toDateString } from "@/lib/utils";

export async function getDailySales(
  branchId: string,
  date: string
): Promise<DailySummary> {
  const transactions = await db.transactions
    .where("[branchId+date]")
    .equals([branchId, date])
    .and((tx) => tx.status === "completed")
    .toArray();

  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const totalTax = transactions.reduce((sum, tx) => sum + tx.tax, 0);
  const totalDiscount = transactions.reduce((sum, tx) => sum + tx.discountAmt, 0);
  
  const refunds = transactions.filter((tx) => tx.type === "refund");
  const totalRefunds = refunds.reduce((sum, tx) => sum + tx.total, 0);

  // Group by payment method
  const byPaymentMethod: Record<string, number> = {};
  transactions.forEach((tx) => {
    const method = tx.payment.method;
    byPaymentMethod[method] = (byPaymentMethod[method] || 0) + tx.total;
  });

  // Top products
  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
  
  for (const tx of transactions) {
    for (const item of tx.items) {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.name,
          qty: 0,
          revenue: 0,
        };
      }
      productSales[item.productId].qty += item.qty;
      productSales[item.productId].revenue += item.lineTotal;
    }
  }

  const topProducts = Object.entries(productSales)
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    date,
    branchId,
    totalTransactions: transactions.length,
    totalRevenue,
    totalTax,
    totalDiscount,
    totalRefunds,
    netRevenue: totalRevenue - totalRefunds,
    byPaymentMethod: byPaymentMethod as any,
    topProducts,
  };
}

export async function getDateRangeSales(
  branchId: string,
  startDate: string,
  endDate: string
): Promise<DailySummary[]> {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(toDateString(d));
  }

  const summaries = await Promise.all(
    dates.map((date) => getDailySales(branchId, date))
  );

  return summaries;
}

export async function getCashierPerformance(
  branchId: string,
  startDate: string,
  endDate: string
) {
  const transactions = await db.transactions
    .where("branchId")
    .equals(branchId)
    .and((tx) => {
      const txDate = tx.completedAt.slice(0, 10);
      return txDate >= startDate && txDate <= endDate && tx.status === "completed";
    })
    .toArray();

  const cashierStats: Record
    string,
    {
      name: string;
      transactions: number;
      revenue: number;
      avgTransaction: number;
    }
  > = {};

  transactions.forEach((tx) => {
    if (!cashierStats[tx.cashierId]) {
      cashierStats[tx.cashierId] = {
        name: tx.cashierName,
        transactions: 0,
        revenue: 0,
        avgTransaction: 0,
      };
    }
    cashierStats[tx.cashierId].transactions++;
    cashierStats[tx.cashierId].revenue += tx.total;
  });

  // Calculate averages
  Object.values(cashierStats).forEach((stats) => {
    stats.avgTransaction = stats.revenue / stats.transactions;
  });

  return Object.entries(cashierStats).map(([id, stats]) => ({
    cashierId: id,
    ...stats,
  }));
}

export async function getTopProductsByRevenue(
  branchId: string,
  limit = 10
): Promise<Array<{ productId: string; name: string; qty: number; revenue: number }>> {
  const transactions = await db.transactions
    .where("branchId")
    .equals(branchId)
    .and((tx) => tx.status === "completed")
    .toArray();

  const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};

  transactions.forEach((tx) => {
    tx.items.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.name,
          qty: 0,
          revenue: 0,
        };
      }
      productSales[item.productId].qty += item.qty;
      productSales[item.productId].revenue += item.lineTotal;
    });
  });

  return Object.entries(productSales)
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}