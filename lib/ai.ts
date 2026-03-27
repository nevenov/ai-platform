/**
 * AI Client (Claude API)
 * Handles communication with Anthropic's Claude API
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

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
    messages: Message[],
    options?: {
      tools?: Tool[];
      maxTokens?: number;
      systemPrompt?: string;
    }
  ): Promise<ClaudeResponse> {
    if (!this.apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    // Convert messages to Claude format
    const claudeMessages: ClaudeMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const requestBody = {
      model: this.model,
      max_tokens: options?.maxTokens || 4096,
      messages: claudeMessages,
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
   */
  async chatWithTools(messages: Message[]): Promise<{
    response: string;
    toolCalls?: Array<{ name: string; input: Record<string, unknown> }>;
    stopReason: string;
  }> {
    const systemPrompt =
      "You are a helpful AI assistant with access to a MySQL database. " +
      "When users ask questions about data, use the execute_sql_query tool to retrieve information. " +
      "Always explain your SQL queries and format results in a user-friendly way. " +
      "If you're unsure about the database schema, ask the user or query SHOW TABLES / DESCRIBE to learn more.";

    const claudeResponse = await this.sendMessage(messages, {
      tools: [SQL_TOOL],
      systemPrompt,
    });

    // Extract text and tool calls from response
    let responseText = "";
    const toolCalls: Array<{ name: string; input: Record<string, unknown> }> = [];

    for (const block of claudeResponse.content) {
      if (block.type === "text" && block.text) {
        responseText += block.text;
      } else if (block.type === "tool_use" && block.name && block.input) {
        toolCalls.push({
          name: block.name,
          input: block.input,
        });
      }
    }

    return {
      response: responseText.trim(),
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
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
