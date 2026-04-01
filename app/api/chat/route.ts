import { NextRequest, NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import {
  executeToolsAndFormatResults,
  type ClaudeMessage,
} from "@/lib/tool-orchestration";

interface Message {
  role: "user" | "assistant";
  content: string;
}

/**
 * AI Chat Orchestrator
 * Handles conversation flow with Claude and tool execution
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    // Validate input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    console.log("[Chat] Processing message:", message.slice(0, 100));

    // Get AI client
    const aiClient = getAIClient();

    // Build initial conversation
    const conversationHistory = Array.isArray(history) ? history : [];
    const currentMessages: ClaudeMessage[] = [
      ...conversationHistory.map((msg: Message) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Step 1: Send initial message to Claude
    let aiResponse = await aiClient.chatWithTools(currentMessages);
    console.log("[Chat] AI stop reason:", aiResponse.stopReason);

    // Step 2: Loop to handle multiple rounds of tool calls
    const maxRounds = 10; // Allow more rounds for complex multi-table queries
    let round = 0;

    while (aiResponse.stopReason === "tool_use" && round < maxRounds) {
      round++;
      const toolUseBlocks = aiResponse.content.filter(
        (block) => block.type === "tool_use"
      );

      if (toolUseBlocks.length === 0) break;

      console.log(
        `[Chat] Round ${round}: Processing ${toolUseBlocks.length} tool call(s)`
      );

      // Execute tools and get results
      const toolResults = await executeToolsAndFormatResults(
        aiResponse.content
      );

      console.log(
        `[Chat] Round ${round}: Generated ${toolResults.length} tool results`
      );

      // Add assistant message with tool_use blocks
      currentMessages.push({
        role: "assistant",
        content: aiResponse.content,
      });

      // Add user message with tool_result blocks
      currentMessages.push({
        role: "user",
        content: toolResults,
      });

      // Get next response from Claude
      aiResponse = await aiClient.chatWithTools(currentMessages);
      console.log(`[Chat] Round ${round} stop reason:`, aiResponse.stopReason);
    }

    console.log("[Chat] Final stop reason:", aiResponse.stopReason);

    // Extract text response from content blocks
    const textBlocks = aiResponse.content.filter(
      (block) => block.type === "text"
    );
    let finalResponse =
      textBlocks.map((block) => block.text).join("\n") ||
      aiResponse.response ||
      "";

    // Handle max rounds reached
    if (round >= maxRounds && aiResponse.stopReason === "tool_use") {
      console.warn(
        "[Chat] Max tool calling rounds reached - query was very complex"
      );
      if (finalResponse.trim()) {
        finalResponse +=
          "\n\n---\n\n⚠️ This query was complex and reached the computation limit. " +
          "The partial results above have been generated. Try breaking your question into smaller parts for complete results.";
      } else {
        finalResponse =
          "This query was too complex and exceeded the maximum number of computation rounds. " +
          "Please try breaking it into smaller, more specific questions. For example:\n" +
          "- First ask about the table structure\n" +
          "- Then ask about specific data you need";
      }
    }

    // Fallback if still no response
    if (!finalResponse.trim()) {
      finalResponse = "I'm sorry, I couldn't generate a response.";
    }

    // Return final response
    return NextResponse.json({
      success: true,
      message: finalResponse,
      toolRounds: round,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Chat] Error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("ANTHROPIC_API_KEY")) {
        return NextResponse.json(
          {
            error:
              "AI service is not configured. Please set ANTHROPIC_API_KEY environment variable.",
          },
          { status: 503 }
        );
      }

      if (error.message.includes("MCP")) {
        return NextResponse.json(
          {
            error:
              "Database connection is not available. Please configure MySQL MCP server.",
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to process chat message",
      },
      { status: 500 }
    );
  }
}
