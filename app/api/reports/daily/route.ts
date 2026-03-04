import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get("branchId");
    const date = searchParams.get("date");

    if (!branchId || !date) {
      return NextResponse.json(
        { error: "Branch ID and date are required" },
        { status: 400 }
      );
    }

    // Get transactions for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: transactions, error: txnError } = await supabaseAdmin
      .from("transactions")
      .select(
        `
        id,
        type,
        total,
        subtotal,
        tax,
        discount,
        payment_method,
        completed_at,
        cashier_id,
        transaction_items (
          product_id,
          product_name,
          qty,
          line_total
        )
      `
      )
      .eq("branch_id", branchId)
      .gte("completed_at", startOfDay.toISOString())
      .lte("completed_at", endOfDay.toISOString())
      .eq("status", "completed");

    if (txnError) throw txnError;

    // Calculate summary
    let totalRevenue = 0;
    let totalTax = 0;
    let totalDiscount = 0;
    let totalRefunds = 0;
    const paymentMethods: { [key: string]: number } = {};
    const productSales: {
      [key: string]: { name: string; qty: number; revenue: number };
    } = {};

    transactions.forEach((txn: any) => {
      if (txn.type === "refund") {
        totalRefunds += parseFloat(txn.total);
      } else {
        totalRevenue += parseFloat(txn.total);
      }

      totalTax += parseFloat(txn.tax);
      totalDiscount += parseFloat(txn.discount);

      // Payment methods
      const method = txn.payment_method || "unknown";
      paymentMethods[method] = (paymentMethods[method] || 0) + parseFloat(txn.total);

      // Product sales
      if (txn.transaction_items && txn.transaction_items.length > 0) {
        txn.transaction_items.forEach((item: any) => {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = {
              name: item.product_name,
              qty: 0,
              revenue: 0,
            };
          }
          productSales[item.product_id].qty += item.qty;
          productSales[item.product_id].revenue += parseFloat(item.line_total);
        });
      }
    });

    // Top products
    const topProducts = Object.entries(productSales)
      .map(([id, data]) => ({
        productId: id,
        name: data.name,
        qty: data.qty,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    return NextResponse.json({
      date,
      branchId,
      totalTransactions: transactions.length,
      totalRevenue,
      totalTax,
      totalDiscount,
      totalRefunds,
      netRevenue: totalRevenue - totalRefunds,
      byPaymentMethod: paymentMethods,
      topProducts,
    });
  } catch (error: any) {
    console.error("Daily report error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}