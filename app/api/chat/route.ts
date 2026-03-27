import { NextRequest, NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import { executeSQL } from "@/lib/sql";

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

    // Build conversation history
    const conversationHistory: Message[] = [
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: message },
    ];

    // Get AI client
    const aiClient = getAIClient();

    // Step 1: Send initial message to Claude
    let aiResponse = await aiClient.chatWithTools(conversationHistory);

    console.log("[Chat] AI stop reason:", aiResponse.stopReason);

    // Step 2: Handle tool calls (SQL execution)
    if (aiResponse.toolCalls && aiResponse.toolCalls.length > 0) {
      console.log(
        `[Chat] Processing ${aiResponse.toolCalls.length} tool call(s)`
      );

      // Execute tool calls and collect results
      const toolResults: string[] = [];

      for (const toolCall of aiResponse.toolCalls) {
        if (toolCall.name === "execute_sql_query") {
          const query = toolCall.input.query as string;
          const reasoning = toolCall.input.reasoning as string;

          console.log("[Chat] Tool reasoning:", reasoning);
          console.log("[Chat] Executing SQL:", query.slice(0, 100));

          // Execute SQL with safety checks
          const sqlResult = await executeSQL(query);

          // Format result for AI
          let resultText = sqlResult.summary;
          if (sqlResult.data) {
            resultText += "\n\n" + sqlResult.data;
          }
          if (sqlResult.error) {
            resultText += "\n\nError: " + sqlResult.error;
          }

          toolResults.push(resultText);
        }
      }

      // Step 3: Send tool results back to Claude for final response
      conversationHistory.push({
        role: "assistant",
        content: aiResponse.response || "I'll analyze the data...",
      });

      conversationHistory.push({
        role: "user",
        content:
          "Tool execution results:\n\n" +
          toolResults.join("\n\n---\n\n") +
          "\n\nPlease analyze these results and provide a clear answer to my question.",
      });

      // Get final response from Claude
      aiResponse = await aiClient.chatWithTools(conversationHistory);
    }

    // Return final response
    return NextResponse.json({
      success: true,
      message: aiResponse.response || "I'm sorry, I couldn't generate a response.",
      toolsUsed: aiResponse.toolCalls ? aiResponse.toolCalls.length : 0,
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
