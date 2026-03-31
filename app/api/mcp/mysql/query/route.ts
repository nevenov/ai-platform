import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp";

export async function POST(req: Request) {
  try {
    const { sql } = await req.json();

    if (!sql) {
      return NextResponse.json(
        { error: "Missing SQL query" },
        { status: 400 }
      );
    }

    const client = getMCPClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await client.executeQuery(sql);

    const text =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      raw?.result?.content?.find((c: any) => c.type === "text")?.text;

    const parsed = text ? JSON.parse(text) : null;

    return NextResponse.json({
      success: true,
      result: parsed || {},
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Query failed",
      },
      { status: 500 }
    );
  }
}
