import { NextResponse } from "next/server";
import { getMCPClient } from "@/lib/mcp";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table");

    if (!table) {
      return NextResponse.json(
        { error: "Missing ?table=name parameter" },
        { status: 400 }
      );
    }

    const client = getMCPClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw: any = await client.callTool("describe_table", { table });

    const text =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
      raw?.result?.content?.find((c: any) => c.type === "text")?.text;

    const parsed = text ? JSON.parse(text) : null;

    return NextResponse.json({
      success: true,
      describe: parsed || {},
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Describe failed",
      },
      { status: 500 }
    );
  }
}
