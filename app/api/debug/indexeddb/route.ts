import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "IndexedDB can only be accessed from the browser",
    instructions: "Open browser console and run: await window.indexedDB.databases()",
  });
}