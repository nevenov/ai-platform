import { NextRequest, NextResponse } from "next/server";
import { startMCPClient, isMCPClientRunning, resetMCPClient } from "@/lib/mcp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { host, port, username, password, database } = body;

    if (!host || !port || !username || !database) {
      return NextResponse.json(
        { error: "All fields are required: host, port, username, database" },
        { status: 400 }
      );
    }

    if (isMCPClientRunning()) {
      return NextResponse.json(
        { error: "MySQL MCP server is already running" },
        { status: 409 }
      );
    }

    const client = await startMCPClient({
      host,
      port: port.toString(),
      username,
      password,
      database,
    });

    return NextResponse.json({
      success: true,
      message: "MySQL MCP server started successfully",
      connected: await client.ping(),
    });
  } catch (error) {
    console.error("Error starting MySQL MCP server:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to start MySQL MCP server",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    running: isMCPClientRunning(),
  });
}

export async function DELETE() {
  try {
    resetMCPClient();

    return NextResponse.json({
      success: true,
      message: "MySQL MCP server stopped successfully",
    });
  } catch (error) {
    console.error("Error stopping MySQL MCP server:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to stop MySQL MCP server",
      },
      { status: 500 }
    );
  }
}
