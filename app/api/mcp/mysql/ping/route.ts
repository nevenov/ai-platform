import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp";

export async function GET() {
  try {
    const client = await getMCPClient();
    const ok = await client.ping();

    return NextResponse.json({ ok });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Ping failed" },
      { status: 500 }
    );
  }
}
