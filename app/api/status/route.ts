import { NextResponse } from "next/server";

export async function GET() {
  try {
    // System status check
    const status = {
      api: "operational",
      database: "checking",
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { status: "error", message: "Status check failed" },
      { status: 500 }
    );
  }
}
