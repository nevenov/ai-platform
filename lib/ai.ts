/**
 * AI Client (Claude API)
 * Handles communication with Anthropic's Claude API
 */

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string | ContentBlock[];
}

interface ContentBlock {
  type: "text" | "tool_use" | "tool_result";
  text?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string;
}

interface ClaudeResponse {
  id: string;
  type: "message";
  role: "assistant";
  content: ContentBlock[];
  model: string;
  stop_reason: "end_turn" | "tool_use" | "max_tokens";
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

interface Tool {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
}

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

/**
 * SQL Tool Definition for Claude
 */
const SQL_TOOL: Tool = {
  name: "execute_sql_query",
  description:
    "Execute a read-only SQL query on the connected MySQL database. " +
    "Only SELECT, SHOW, DESCRIBE, and EXPLAIN queries are allowed. " +
    "Use this when the user asks questions about database data, tables, or structure.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "The SQL query to execute. Must be a read-only query (SELECT, SHOW, DESCRIBE, EXPLAIN).",
      },
      reasoning: {
        type: "string",
        description: "Brief explanation of why this query is being executed.",
      },
    },
    required: ["query"],
  },
};

/**
 * Claude AI Client
 */
export class ClaudeClient {
  private apiKey: string;
  private model: string;

  constructor(apiKey?: string, model = "claude-sonnet-4-20250514") {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || "";
    this.model = model;

    if (!this.apiKey) {
      console.warn(
        "[AI] Warning: ANTHROPIC_API_KEY not set. AI features will not work."
      );
    }
  }

  /**
   * Send a message to Claude with tool support
   */
  async sendMessage(
    messages: ClaudeMessage[],
    options?: {
      tools?: Tool[];
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<ClaudeResponse> {
    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const requestBody = {
      model: this.model,
      max_tokens: options?.maxTokens || 4096,
      messages: messages,
      ...(options?.tools && { tools: options.tools }),
      ...(options?.systemPrompt && { system: options.systemPrompt }),
    };

    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Chat with tools enabled (for SQL execution)
   * Supports multi-turn tool calling with proper Claude format
   */
  async chatWithTools(
    messages: ClaudeMessage[],
    systemPrompt?: string
  ): Promise<{
    response: string;
    content: ContentBlock[];
    stopReason: string;
  }> {
    const defaultSystemPrompt =
      "You are a helpful AI assistant with access to a MySQL database. " +
      "When users ask questions about data, use the execute_sql_query tool efficiently. " +
      "\n\n🎯 OPTIMIZATION RULES (CRITICAL):\n" +
      "1. **Make educated guesses** - Try the query directly first with common column names\n" +
      "2. **Minimize schema checks** - Only use DESCRIBE/SHOW TABLES if a query fails\n" +
      "3. **Use simple SQL** - Avoid complex JOINs/CASE when a simple SELECT works\n" +
      "4. **Common column patterns:**\n" +
      "   - Dates: date_of_birth, created_at, updated_at\n" +
      "   - IDs: id, patient_id, clinic_id, provider_id\n" +
      "   - Names: first_name, last_name, name\n" +
      "   - Foreign keys usually match table names: clinic_id → clinic table\n" +
      "5. **Recovery strategy:** If 0 rows on WHERE clause, then DESCRIBE to verify columns\n" +
      "\n📊 Format results with clear markdown tables and concise analysis.";

    const claudeResponse = await this.sendMessage(messages, {
      tools: [SQL_TOOL],
      systemPrompt: systemPrompt || defaultSystemPrompt,
      maxTokens: 4096,
    });

    // Extract text from response
    let responseText = "";
    for (const block of claudeResponse.content) {
      if (block.type === "text" && block.text) {
        responseText += block.text;
      }
    }

    return {
      response: responseText.trim(),
      content: claudeResponse.content,
      stopReason: claudeResponse.stop_reason,
    };
  }
}

/**
 * Global AI client instance
 */
let aiClientInstance: ClaudeClient | null = null;

export function getAIClient(): ClaudeClient {
  if (!aiClientInstance) {
    aiClientInstance = new ClaudeClient();
  }
  return aiClientInstance;
}
