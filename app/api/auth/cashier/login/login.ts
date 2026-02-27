import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { v4 as uuid } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const { pin, terminalId } = await request.json();

    if (!pin || !terminalId) {
      return NextResponse.json(
        { error: "PIN and terminal ID required" },
        { status: 400 }
      );
    }

    // Find user by PIN
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("pin", pin)
      .eq("is_active", true)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid PIN" },
        { status: 401 }
      );
    }

    // Get terminal to verify branch
    const { data: terminal } = await supabaseAdmin
      .from("terminals")
      .select("branch_id")
      .eq("id", terminalId)
      .single();

    if (!terminal) {
      return NextResponse.json(
        { error: "Invalid terminal" },
        { status: 404 }
      );
    }

    // Create session
    const sessionId = uuid();
    const token = `session_${uuid()}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 12); // 12 hour session

    return NextResponse.json({
      success: true,
      cashier: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branch_id,
      },
      session: {
        sessionId,
        token,
        expiresAt: expiresAt.toISOString(),
        startedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}