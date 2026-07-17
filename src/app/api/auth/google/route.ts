import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google-drive";

export const runtime = "nodejs";

export async function GET() {
  try {
    const url = getAuthUrl();
    return NextResponse.redirect(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lỗi không xác định";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
