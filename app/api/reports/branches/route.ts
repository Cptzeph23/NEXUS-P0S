import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (!from || !to) {
      return NextResponse.json(
        { error: "From and to dates are required" },
        { status: 400 }
      );
    }

    const startDate = new Date(from);
    const endDate = new Date(to);

    // Get all branches
    const { data: branches, error: branchError } = await supabaseAdmin
      .from("branches")
      .select("id, name, code")
      .eq("is_active", true);

    if (branchError) throw branchError;

    // Get transactions for each branch
    const branchStats = await Promise.all(
      branches.map(async (branch: any) => {
        const { data: transactions, error: txnError } = await supabaseAdmin
          .from("transactions")
          .select("id, total, type, completed_at")
          .eq("branch_id", branch.id)
          .gte("completed_at", startDate.toISOString())
          .lte("completed_at", endDate.toISOString())
          .eq("status", "completed");

        if (txnError) throw txnError;

        let revenue = 0;
        let refunds = 0;

        transactions.forEach((txn: any) => {
          if (txn.type === "refund") {
            refunds += parseFloat(txn.total);
          } else {
            revenue += parseFloat(txn.total);
          }
        });

        return {
          branchId: branch.id,
          branchName: branch.name,
          branchCode: branch.code,
          totalTransactions: transactions.length,
          revenue,
          refunds,
          netRevenue: revenue - refunds,
        };
      })
    );

    // Sort by revenue
    branchStats.sort((a, b) => b.netRevenue - a.netRevenue);

    return NextResponse.json({
      from,
      to,
      branches: branchStats,
      totalRevenue: branchStats.reduce((sum, b) => sum + b.revenue, 0),
      totalTransactions: branchStats.reduce((sum, b) => sum + b.totalTransactions, 0),
    });
  } catch (error: any) {
    console.error("Branch report error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate report" },
      { status: 500 }
    );
  }
}