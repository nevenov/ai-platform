/**
 * Tool execution orchestration helper
 * Handles Claude tool calling with proper format
 */

import { executeSQL } from "@/lib/sql";

export interface ContentBlock {
  type: "text" | "tool_use" | "tool_result";
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
 is_error?: boolean;
}

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

/**
 * Execute tools from Claude response and format results
 */
export async function executeToolsAndFormatResults(
  content: ContentBlock[]
): Promise<ContentBlock[]> {
  const toolResults: ContentBlock[] = [];

  for (const block of content) {
    if (block.type === "tool_use" && block.name === "execute_sql_query") {
      const query = (block.input?.query as string) || "";
      const reasoning = (block.input?.reasoning as string) || "";

      console.log("[Chat] Tool reasoning:", reasoning);
      console.log("[Chat] Executing SQL:", query.slice(0, 100));

      try {
        // Execute SQL with safety checks
        const sqlResult = await executeSQL(query);

        // Format result text
        let resultText = sqlResult.summary;
        if (sqlResult.data) {
          resultText += "\n\n" + sqlResult.data;
        }
        if (sqlResult.error) {
          resultText = "Error: " + sqlResult.error;
        }

        // Add helpful hint if 0 rows returned on a WHERE query
        if (
          sqlResult.success &&
          sqlResult.summary.includes("0 rows") &&
          query.toLowerCase().includes("where")
        ) {
          resultText +=
            "\n\n💡 Hint: 0 rows might indicate incorrect column names. " +
            "Consider using DESCRIBE <table> to verify exact column names.";
        }

        // Add tool result in Claude format
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id!,
          content: resultText,
          is_error: !sqlResult.success,
        });
      } catch (error) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id!,
          content: `Error executing query: ${error instanceof Error ? error.message : String(error)}`,
          is_error: true,
        });
      }
    }
  }

  return toolResults;
}

/**
 * Build conversation history with tool results
 */
export function buildConversationWithToolResults(
  history: Array<{ role: string; content: string }>,
  userMessage: string,
  assistantContent: ContentBlock[],
  toolResults: ContentBlock[]
): ClaudeMessage[] {
  const messages: ClaudeMessage[] = [
    // Previous conversation
    ...history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    })),
    // User's latest message
    { role: "user" as const, content: userMessage },
    // Assistant's response with tool_use blocks
    { role: "assistant" as const, content: assistantContent },
    // User message with tool_result blocks
    { role: "user" as const, content: toolResults },
  ];

  return messages;
}
