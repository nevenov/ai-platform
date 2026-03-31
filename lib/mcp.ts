import { spawn, ChildProcess } from "child_process";

interface MCPTool {
  name: string;
  description: string;
  inputSchema: unknown;
}

interface PendingRequest {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}

export class MCPClient {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pending: Map<number, PendingRequest> = new Map();
  private tools: Record<string, MCPTool> = {};

  constructor(
    private command: string = "npx",
    private args: string[] = ["-y", "@matpb/mysql-mcp-server"],
    private env: Record<string, string> = {}
  ) {}

  /**
   * Start MCP server process and perform handshake
   */
  async start(): Promise<void> {
    this.process = spawn(this.command, this.args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, ...this.env },
      shell: true,
    });

    this.process.stdout?.on("data", (data) => this.handleData(data));
    this.process.stderr?.on("data", (data) =>
      console.error("[MCP STDERR]", data.toString())
    );

    await this.initialize();
  }

  /**
   * MCP handshake: initialize → initialized
   */
  private async initialize(): Promise<void> {
    const initResponse = await this.sendRequest("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "ai-platform", version: "1.0" },
    });

    if (initResponse?.result?.tools) {
      this.tools = initResponse.result.tools;
    }

    // "initialized" is a notification (no id, no response expected)
    this.sendNotification("notifications/initialized");
  }

  /**
   * Handle incoming MCP messages
   */
  private handleData(data: Buffer) {
    const lines = data.toString().trim().split("\n");

    for (const line of lines) {
        try {
            const msg = JSON.parse(line);

            // 🔥 Handle tool list notifications
            if (msg.method === "tools/list" && msg.params?.tools) {
                this.tools = msg.params.tools;
                continue;
            }

            // 🔥 Handle normal responses
            if (msg.id && this.pending.has(msg.id)) {
                const { resolve, reject } = this.pending.get(msg.id)!;
                this.pending.delete(msg.id);

                if (msg.error) reject(msg.error);
                else resolve(msg);
            }
        } catch {
            // ignore non-JSON lines
        }
    }
  }


  /**
   * Send JSON-RPC notification (no id, no response expected)
   */
  private sendNotification(method: string, params?: unknown): void {
    const payload: Record<string, unknown> = {
      jsonrpc: "2.0",
      method,
    };
    if (params !== undefined) {
      payload.params = params;
    }
    this.process?.stdin?.write(JSON.stringify(payload) + "\n");
  }

  /**
   * Send JSON-RPC request to MCP server
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sendRequest(method: string, params: unknown): Promise<any> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;

      this.pending.set(id, { resolve, reject });

      const payload = {
        jsonrpc: "2.0",
        id,
        method,
        params,
      };

      this.process?.stdin?.write(JSON.stringify(payload) + "\n");
    });
  }

  /**
   * List available tools
   */
  async listTools(): Promise<MCPTool[]> {
    return Object.values(this.tools);
  }

  /**
   * Call MCP tool
   */
  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    return this.sendRequest("tools/call", { name, arguments: args });
  }

  /**
   * Execute SQL query via MCP
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async executeQuery(query: string): Promise<any> {
    return this.callTool("execute_query", { query });
  }


  /**
   * Check if MCP server is alive
   */
  async ping(): Promise<boolean> {
    try {
      await this.listTools();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Stop MCP process
   */
  stop(): void {
    this.process?.kill();
  }
}

/**
 * Global instance
 */
let mcpClientInstance: MCPClient | null = null;

export function getMCPClient(): MCPClient {
  if (!mcpClientInstance) {
    throw new Error("MCP client not started. Please configure MySQL first via /modules/mysql.");
  }
  return mcpClientInstance;
}

/**
 * Start MCP client with MySQL connection params
 */
export async function startMCPClient(config: {
  host: string;
  port: string;
  username: string;
  password?: string;
  database: string;
}): Promise<MCPClient> {
  // Stop existing instance if running
  if (mcpClientInstance) {
    mcpClientInstance.stop();
  }

  const args = ["-y", "@matpb/mysql-mcp-server"];

  const env: Record<string, string> = {
    MYSQL_HOST: config.host,
    MYSQL_PORT: config.port,
    MYSQL_USER: config.username,
    MYSQL_DATABASE: config.database,
  };

  if (config.password && config.password.trim() !== "") {
    env.MYSQL_PASSWORD = config.password;
  }

  const client = new MCPClient("npx", args, env);
  try {
    mcpClientInstance = client;
    await client.start();
    return client;
  } catch (error) {
    client.stop();
    mcpClientInstance = null;
    throw error;
  }
}

/**
 * Check if MCP client is running
 */
export function isMCPClientRunning(): boolean {
  return mcpClientInstance !== null;
}

export function resetMCPClient(): void {
  if (mcpClientInstance) {
    mcpClientInstance.stop();
  }
  mcpClientInstance = null;
}
