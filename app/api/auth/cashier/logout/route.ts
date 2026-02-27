import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    // In a full implementation, we'd invalidate the session in the database
    // For now, just acknowledge the logout

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Logout failed" },
      { status: 500 }
    );
  }
}