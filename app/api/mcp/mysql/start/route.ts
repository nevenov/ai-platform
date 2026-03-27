import { NextRequest, NextResponse } from "next/server";
import { spawn, ChildProcess } from "child_process";

interface MCPProcessInfo {
  pid: number | undefined;
  process: ChildProcess;
  host: string;
  port: number;
  database: string;
  startedAt: string;
}

// Global map to store running MCP server processes
const mcpProcesses = new Map<string, MCPProcessInfo>();

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { host, port, username, password, database } = body;

    // Validate required fields
    if (!host || !port || !username || !database) {
      return NextResponse.json(
        { error: "All fields are required: host, port, username, database" },
        { status: 400 }
      );
    }

    // Check if MySQL MCP server is already running
    const processKey = `mysql_${host}_${port}_${database}`;
    if (mcpProcesses.has(processKey)) {
      return NextResponse.json(
        { error: "MySQL MCP server is already running for this configuration" },
        { status: 409 }
      );
    }

    // Build argument list dynamically
    const args = [
        "-y",
        "@modelcontextprotocol/server-mysql",
        "--host", host,
        "--port", port.toString(),
        "--user", username,
        "--database", database,
    ];

    // Add password only if provided
    if (password && password.trim() !== "") {
        args.push("--password", password);
    }

    // Spawn MySQL MCP server process
    const mcpServer = spawn("npx", args, {
        shell: true, // Required for Windows compatibility
        stdio: ["pipe", "pipe", "pipe"],
    });

    // Store process information
    mcpProcesses.set(processKey, {
      pid: mcpServer.pid,
      process: mcpServer,
      host,
      port,
      database,
      startedAt: new Date().toISOString(),
    });

    // Handle process events
    mcpServer.on("error", (error) => {
      console.error(`MySQL MCP server error:`, error);
      mcpProcesses.delete(processKey);
    });

    mcpServer.on("exit", (code, signal) => {
      console.log(`MySQL MCP server exited with code ${code} and signal ${signal}`);
      mcpProcesses.delete(processKey);
    });

    // Log stdout/stderr for debugging
    mcpServer.stdout?.on("data", (data) => {
      console.log(`MySQL MCP stdout: ${data}`);
    });

    mcpServer.stderr?.on("data", (data) => {
      console.error(`MySQL MCP stderr: ${data}`);
    });

    return NextResponse.json({
      success: true,
      message: "MySQL MCP server started successfully",
      pid: mcpServer.pid,
      processKey,
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

// GET endpoint to check server status
export async function GET() {
  const runningProcesses = Array.from(mcpProcesses.entries()).map(
    ([key, value]) => ({
      processKey: key,
      pid: value.pid,
      host: value.host,
      port: value.port,
      database: value.database,
      startedAt: value.startedAt,
    })
  );

  return NextResponse.json({
    running: runningProcesses.length > 0,
    processes: runningProcesses,
  });
}

// DELETE endpoint to stop a server
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const processKey = searchParams.get("processKey");

    if (!processKey) {
      return NextResponse.json(
        { error: "processKey parameter is required" },
        { status: 400 }
      );
    }

    const processInfo = mcpProcesses.get(processKey);
    if (!processInfo) {
      return NextResponse.json(
        { error: "Process not found" },
        { status: 404 }
      );
    }

    // Kill the process
    processInfo.process.kill();
    mcpProcesses.delete(processKey);

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
