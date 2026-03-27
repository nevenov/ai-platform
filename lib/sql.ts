/**
 * SQL Execution Layer
 * Handles SQL query execution with safety checks
 */

import { getMCPClient } from "./mcp";
import { validateQuery, sanitizeQueryForLogging } from "./safety";
import { formatSQLResults, formatError } from "./format";

interface SQLExecutionResult {
  success: boolean;
  summary: string;
  data?: string;
  rowCount?: number;
  error?: string;
}

/**
 * Execute a SQL query with safety validation
 */
export async function executeSQL(query: string): Promise<SQLExecutionResult> {
  // Step 1: Validate query safety
  const safetyCheck = validateQuery(query);
  
  if (!safetyCheck.safe) {
    return {
      success: false,
      error: safetyCheck.reason || "Query validation failed",
      summary: `Query rejected: ${safetyCheck.reason}`,
    };
  }

  // Log sanitized query
  console.log(
    "[SQL] Executing query:",
    sanitizeQueryForLogging(query).slice(0, 200)
  );

  // Step 2: Get MCP client
  const mcpClient = getMCPClient();

  try {
    // Step 3: Execute query via MCP
    const result = await mcpClient.executeQuery(query);

    // Step 4: Format results
    const formatted = formatSQLResults(result);

    console.log(
      `[SQL] Query completed: ${formatted.rowCount || 0} rows returned`
    );

    return formatted;
  } catch (error) {
    const errorMessage = formatError(error);
    console.error("[SQL] Execution error:", errorMessage);

    return {
      success: false,
      error: errorMessage,
      summary: `Query execution failed: ${errorMessage}`,
    };
  }
}

/**
 * Test SQL connection
 */
export async function testConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  try {
    const mcpClient = getMCPClient();
    const isConnected = await mcpClient.ping();

    if (isConnected) {
      return {
        connected: true,
        message: "MySQL MCP connection is active",
      };
    } else {
      return {
        connected: false,
        message: "MySQL MCP server is not responding",
      };
    }
  } catch (error) {
    return {
      connected: false,
      message: `Connection test failed: ${formatError(error)}`,
    };
  }
}

/**
 * Get available database tables
 */
export async function listTables(): Promise<SQLExecutionResult> {
  return executeSQL("SHOW TABLES");
}

/**
 * Describe a table structure
 */
export async function describeTable(tableName: string): Promise<SQLExecutionResult> {
  // Sanitize table name to prevent injection
  const sanitizedTable = tableName.replace(/[^a-zA-Z0-9_]/g, "");
  return executeSQL(`DESCRIBE ${sanitizedTable}`);
}
