import { NextResponse } from "next/server";
import { mcpProcesses } from "../start/route";

export async function GET() {
  try {
    const entries = Array.from(mcpProcesses.entries());
    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No running MCP MySQL server found" },
        { status: 400 }
      );
    }

    const [processKey, info] = entries[0];
    const child = info.process;

    const request = {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/show_tables",
        params: {}
    };


    // ---- CHECK stdin ----
    if (!child.stdin) {
      return NextResponse.json(
        { error: "MCP process stdin is not available" },
        { status: 500 }
      );
    }

    child.stdin.write(JSON.stringify(request) + "\n");

    // ---- CHECK stdout ----
    if (!child.stdout) {
      return NextResponse.json(
        { error: "MCP process stdout is not available" },
        { status: 500 }
      );
    }

    const response = await new Promise((resolve) => {
      const onData = (data: Buffer) => {
        const text = data.toString().trim();
        try {
          const json = JSON.parse(text);
          child.stdout!.off("data", onData);
          resolve(json);
        } catch {
          // ignore non-JSON lines
        }
      };

      child.stdout!.on("data", onData);
    });

    return NextResponse.json({ success: true, response });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
