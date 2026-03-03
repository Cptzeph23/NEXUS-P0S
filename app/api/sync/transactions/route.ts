import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const transactions = await request.json();

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: expected array of transactions" },
        { status: 400 }
      );
    }

    const results = {
      synced: 0,
      failed: 0,
      errors: [] as Array<{ id: string; error: string }>,
    };

    for (const txn of transactions) {
      try {
        // Prepare transaction data
        const serverData = {
          id: txn.id,
          tenant_id: txn.tenantId || "01936d9e-8f5a-4b2c-9d3e-1234567890ab",
          type: txn.type,
          branch_id: txn.branchId,
          terminal_id: txn.terminalId,
          cashier_id: txn.cashierId,
          customer_id: txn.customer?.id || null,
          receipt_number: txn.receiptNumber,
          subtotal: txn.subtotal,
          discount: txn.discountAmt,
          tax: txn.tax,
          total: txn.total,
          payment_method: txn.payment.method,
          payment_data: txn.payment,
          note: txn.note || null,
          status: txn.status,
          completed_at: txn.completedAt,
          version: txn.localVersion || 1,
        };

        // Insert transaction
        const { error: txnError } = await supabaseAdmin
          .from("transactions")
          .upsert(serverData, {
            onConflict: "id",
          });

        if (txnError) {
          // Check if it's a duplicate receipt number (already synced)
          if (txnError.code === '23505' && txnError.message.includes('receipt_number')) {
            console.log(`✓ Transaction ${txn.receiptNumber} already exists in database`);
            results.synced++; // Count as synced
            continue; // Skip items insert and move to next
          }
          
          console.error("Transaction insert error:", txnError);
          throw txnError;
        }

        // Insert transaction items
        const items = txn.items.map((item: any) => ({
          transaction_id: txn.id,
          product_id: item.productId,
          product_name: item.name,
          price: item.price,
          qty: item.qty,
          discount: item.discount,
          tax_rate: item.taxRate,
          line_total: item.lineTotal,
        }));

        const { error: itemsError } = await supabaseAdmin
          .from("transaction_items")
          .insert(items);

        if (itemsError) {
          // If items already exist, that's okay too
          if (itemsError.code === '23505') {
            console.log(`✓ Transaction items for ${txn.receiptNumber} already exist`);
            results.synced++;
            continue;
          }
          
          console.error("Transaction items insert error:", itemsError);
          throw itemsError;
        }

        results.synced++;
        console.log(`✓ Synced transaction ${txn.receiptNumber}`);
      } catch (error: any) {
        console.error(`✗ Failed to sync transaction ${txn.id}:`, error);
        results.failed++;
        results.errors.push({
          id: txn.id,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: results.failed === 0,
      synced: results.synced,
      failed: results.failed,
      errors: results.errors,
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Sync API error:", error);
    return NextResponse.json(
      { error: error.message || "Sync failed" },
      { status: 500 }
    );
  }
}