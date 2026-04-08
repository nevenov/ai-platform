/**
 * API Route: Sessions (List & Create)
 * GET /api/sessions - List all sessions
 * POST /api/sessions - Create new session
 */

import { NextRequest, NextResponse } from "next/server";
import {
  listSessions,
  createSession,
  type Message,
} from "@/lib/session-manager";

/**
 * GET - List all sessions
 */
export async function GET() {
  try {
    const sessions = await listSessions();

    // Return array directly (matches UI expectations)
    return NextResponse.json(
      sessions.map((s) => ({
        id: s.id,
        title: s.title,
        created: s.created.toISOString(),
        messageCount: s.messageCount,
      }))
    );
  } catch (error) {
    console.error("[API] Failed to list sessions:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to list sessions",
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, title } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: "Messages array is required and must not be empty" },
        { status: 400 }
      );
    }

    // Convert messages to proper format with timestamps
    const formattedMessages: Message[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    }));

    const result = await createSession(formattedMessages, title);
    const sessionId = typeof result === 'string' ? result : result.id;
    const sessionTitle = typeof result === 'string' ? 'Session' : result.title;

    return NextResponse.json({
      success: true,
      sessionId,
      title: sessionTitle,
      message: "Session saved successfully",
    });
  } catch (error) {
    console.error("[API] Failed to create session:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create session",
      },
      { status: 500 }
    );
  }
}
