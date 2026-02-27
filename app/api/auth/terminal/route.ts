import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { deviceId, branchCode } = await request.json();

    if (!deviceId || !branchCode) {
      return NextResponse.json(
        { error: "Device ID and branch code required" },
        { status: 400 }
      );
    }

    // Find branch by code
    const { data: branch, error: branchError } = await supabaseAdmin
      .from("branches")
      .select("*")
      .eq("code", branchCode)
      .single();

    if (branchError || !branch) {
      return NextResponse.json(
        { error: "Invalid branch code" },
        { status: 404 }
      );
    }

    // Check if terminal already exists
    let { data: existingTerminal } = await supabaseAdmin
      .from("terminals")
      .select("*")
      .eq("device_id", deviceId)
      .single();

    let terminal;

    if (existingTerminal) {
      // Update last seen
      const { data: updated } = await supabaseAdmin
        .from("terminals")
        .update({ last_seen: new Date().toISOString() })
        .eq("id", existingTerminal.id)
        .select()
        .single();
      
      terminal = updated;
    } else {
      // Create new terminal
      const { data: newTerminal } = await supabaseAdmin
        .from("terminals")
        .insert({
          id: uuid(),
          branch_id: branch.id,
          name: `Terminal ${deviceId.slice(-6)}`,
          device_id: deviceId,
          last_seen: new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single();
      
      terminal = newTerminal;
    }

    return NextResponse.json({
      success: true,
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
      },
    });
  } catch (error: any) {
    console.error("Terminal registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}