/**
 * API Route: Single Session (Load & Delete)
 * GET /api/sessions/[id] - Load specific session
 * DELETE /api/sessions/[id] - Delete specific session
 */

import { NextRequest, NextResponse } from "next/server";
import { loadSession, deleteSession } from "@/lib/session-manager";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET - Load specific session
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const sessionData = await loadSession(id);

    if (!sessionData) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: id,
      title: sessionData.title,
      messageCount: sessionData.messages.length,
      messages: sessionData.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[API] Failed to load session:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load session",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete specific session
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const deleted = await deleteSession(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Session not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("[API] Failed to delete session:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete session",
      },
      { status: 500 }
    );
  }
}
