import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp";

export async function GET() {
  try {
    const client = getMCPClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await client.callTool("show_tables", {});

    // MCP returns JSON inside result.content[].text
    const text =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      raw?.result?.content?.find((c: any) => c.type === "text")?.text;
    const parsed = text ? JSON.parse(text) : null;

    return NextResponse.json({
      success: true,
      tables: parsed?.tables || [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to list tables",
      },
      { status: 500 }
    );
  }
}
