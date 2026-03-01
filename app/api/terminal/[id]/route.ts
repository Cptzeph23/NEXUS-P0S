import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await params in Next.js 15+
    const { id: terminalId } = await context.params;

    const { data: terminal, error: terminalError } = await supabaseAdmin
      .from("terminals")
      .select("*")
      .eq("id", terminalId)
      .single();

    if (terminalError || !terminal) {
      return NextResponse.json(
        { error: "Terminal not found" },
        { status: 404 }
      );
    }

    const { data: branch, error: branchError } = await supabaseAdmin
      .from("branches")
      .select("*")
      .eq("id", terminal.branch_id)
      .single();

    if (branchError || !branch) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      terminal: {
        id: terminal.id,
        branchId: terminal.branch_id,
        name: terminal.name,
        deviceId: terminal.device_id,
        isActive: terminal.is_active,
      },
      branch: {
        id: branch.id,
        tenantId: branch.tenant_id,
        name: branch.name,
        code: branch.code,
        settings: branch.settings,
        isActive: branch.is_active,
      },
    });
  } catch (error: any) {
    console.error("Terminal fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch terminal" },
      { status: 500 }
    );
  }
}