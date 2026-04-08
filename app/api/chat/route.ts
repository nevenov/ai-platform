import { NextRequest, NextResponse } from "next/server";
import { getAIClient } from "@/lib/ai";
import {
  executeToolsAndFormatResults,
  type ClaudeMessage,
} from "@/lib/tool-orchestration";
import { loadPrimarySetup } from "@/lib/setup-loader";

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

    // Load primary setup files (db-schema.md, project-context.md, etc.)
    const setupContent = await loadPrimarySetup();
    
    // Build system prompt with setup content
    const baseSystemPrompt =
      "You are a helpful AI assistant with access to a MySQL database. " +
      "When users ask questions about data, use the execute_sql_query tool efficiently. " +
      "\n\n🎯 OPTIMIZATION RULES (CRITICAL):\n" +
      "1. **Make educated guesses** - Try the query directly first with common column names\n" +
      "2. **Minimize schema checks** - Only use DESCRIBE/SHOW TABLES if a query fails\n" +
      "3. **Use simple SQL** - Avoid complex JOINs/CASE when a simple SELECT works\n" +
      "4. **Common column patterns:**\n" +
      "   - Dates: created_at, updated_at, date, timestamp\n" +
      "   - IDs: id, user_id, customer_id, item_id, category_id\n" +
      "   - Names: name, first_name, last_name, title\n" +
      "   - Foreign keys usually match table names: category_id → category table\n" +
      "5. **Recovery strategy:** If 0 rows on WHERE clause, then DESCRIBE to verify columns\n" +
      "\n📊 Format results with clear markdown tables and concise analysis.";

    // Prepend setup content to system prompt
    const systemPrompt = setupContent 
      ? `${setupContent}\n\n---\n\n${baseSystemPrompt}`
      : baseSystemPrompt;

    if (setupContent) {
      console.log(`[Chat] Loaded setup content: ${setupContent.length} chars`);
    }

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

    // Adaptive model configuration
    const haikuModel = "claude-haiku-4-5"; // Fast & cheap for initial rounds
    const sonnetModel = "claude-sonnet-4-6"; // Powerful for complex recovery
    const switchRound = 5; // Switch to Sonnet after round 4

    // Step 1: Send initial message to Claude (use Haiku)
    let aiResponse = await aiClient.chatWithTools(
      currentMessages,
      systemPrompt,
      haikuModel
    );
    console.log("[Chat] AI stop reason:", aiResponse.stopReason);
    console.log("[Chat] Using model:", haikuModel);

    // Step 2: Loop to handle multiple rounds of tool calls
    const maxRounds = 10; // Allow more rounds for complex multi-table queries
    let round = 0;

    while (aiResponse.stopReason === "tool_use" && round < maxRounds) {
      round++;
      const toolUseBlocks = aiResponse.content.filter(
        (block) => block.type === "tool_use"
      );

      if (toolUseBlocks.length === 0) break;

      // Adaptive model selection: Haiku for first rounds, Sonnet for complex recovery
      const currentModel = round < switchRound ? haikuModel : sonnetModel;

      console.log(
        `[Chat] Round ${round}: Processing ${toolUseBlocks.length} tool call(s) [Model: ${currentModel}]`
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

      // Get next response from Claude (adaptive model)
      aiResponse = await aiClient.chatWithTools(
        currentMessages,
        systemPrompt,
        currentModel
      );
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
