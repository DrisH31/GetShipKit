import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

// GET /api/health: for uptime monitors and your host's health check.
// 200 when the app can reach its database, 503 when it can't. Says nothing else.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { error } = await createAdminSupabaseClient()
      .from("profiles")
      .select("user_id", { head: true, count: "exact" })
      .limit(1);
    if (error) throw error;
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[health] database unreachable:", error);
    return NextResponse.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
