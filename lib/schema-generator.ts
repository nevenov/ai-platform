/**
 * Database Schema Generator
 * Generates Markdown documentation of MySQL database structure
 */

import fs from "fs/promises";
import path from "path";
import { getMCPClient } from "./mcp";

interface TableColumn {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}

interface SchemaInfo {
  databaseName: string;
  tableCount: number;
  totalColumns: number;
  generatedAt: Date;
  tables: TableInfo[];
}

interface TableInfo {
  name: string;
  columns: TableColumn[];
  rowCount?: number;
}

const SCHEMA_FILE_PATH = path.join(
  process.cwd(),
  ".md-setup",
  "primary",
  "db-schema.md"
);

/**
 * Generate complete database schema as Markdown
 */
export async function generateSchema(): Promise<SchemaInfo> {
  console.log("[Schema] Starting schema generation...");

  const mcpClient = await getMCPClient();

  // Step 1: Get database name from environment
  const databaseName = process.env.MYSQL_DATABASE || "unknown";

  // Step 2: Get all tables
  const tablesResult = await mcpClient.executeQuery("SHOW TABLES");
  const tables = parseMCPResult(tablesResult);

  if (!tables || tables.length === 0) {
    throw new Error("No tables found in database");
  }

  console.log(`[Schema] Found ${tables.length} tables`);

  // Step 3: Describe each table
  const tableInfos: TableInfo[] = [];
  let totalColumns = 0;

  for (const tableRow of tables) {
    const tableName = Object.values(tableRow)[0] as string;
    console.log(`[Schema] Describing table: ${tableName}`);

    try {
      const describeResult = await mcpClient.executeQuery(
        `DESCRIBE \`${tableName}\``
      );
      const columns = parseMCPResult(describeResult) as unknown as TableColumn[];

      totalColumns += columns.length;

      tableInfos.push({
        name: tableName,
        columns,
      });
    } catch (error) {
      console.error(`[Schema] Failed to describe table ${tableName}:`, error);
      // Continue with other tables
    }
  }

  const schemaInfo: SchemaInfo = {
    databaseName,
    tableCount: tableInfos.length,
    totalColumns,
    generatedAt: new Date(),
    tables: tableInfos,
  };

  console.log(
    `[Schema] Generated schema: ${schemaInfo.tableCount} tables, ${schemaInfo.totalColumns} columns`
  );

  return schemaInfo;
}

/**
 * Save schema to Markdown file
 */
export async function saveSchema(schemaInfo: SchemaInfo): Promise<void> {
  const markdown = formatSchemaAsMarkdown(schemaInfo);

  // Ensure directory exists
  const dir = path.dirname(SCHEMA_FILE_PATH);
  await fs.mkdir(dir, { recursive: true });

  // Write file
  await fs.writeFile(SCHEMA_FILE_PATH, markdown, "utf-8");

  console.log(`[Schema] Saved to ${SCHEMA_FILE_PATH}`);
}

/**
 * Get schema age in hours (returns null if file doesn't exist)
 */
export async function getSchemaAge(): Promise<number | null> {
  try {
    const stats = await fs.stat(SCHEMA_FILE_PATH);
    const ageMs = Date.now() - stats.mtime.getTime();
    return ageMs / (1000 * 60 * 60); // Convert to hours
  } catch {
    return null; // File doesn't exist
  }
}

/**
 * Delete schema file (for manual refresh)
 */
export async function deleteSchema(): Promise<void> {
  try {
    await fs.unlink(SCHEMA_FILE_PATH);
    console.log("[Schema] Deleted schema file");
  } catch {
    // File doesn't exist, ignore
  }
}

/**
 * Check if schema file exists
 */
export async function schemaExists(): Promise<boolean> {
  try {
    await fs.access(SCHEMA_FILE_PATH);
    return true;
  } catch {
    return false;
  }
}

/**
 * Format schema as Markdown
 */
function formatSchemaAsMarkdown(schemaInfo: SchemaInfo): string {
  let md = `# Database Schema\n\n`;
  md += `**Database:** ${schemaInfo.databaseName}\n`;
  md += `**Tables:** ${schemaInfo.tableCount}\n`;
  md += `**Total Columns:** ${schemaInfo.totalColumns}\n`;
  md += `**Generated:** ${schemaInfo.generatedAt.toISOString()}\n\n`;
  md += `---\n\n`;

  // Table of contents
  md += `## 📋 Tables\n\n`;
  for (const table of schemaInfo.tables) {
    md += `- [${table.name}](#${table.name.toLowerCase()}) (${table.columns.length} columns)\n`;
  }
  md += `\n---\n\n`;

  // Table details
  for (const table of schemaInfo.tables) {
    md += `## ${table.name}\n\n`;
    md += `**Columns:** ${table.columns.length}\n\n`;

    // Column table
    md += `| Column | Type | Null | Key | Default | Extra |\n`;
    md += `|--------|------|------|-----|---------|-------|\n`;

    for (const col of table.columns) {
      md += `| \`${col.Field}\` | ${col.Type} | ${col.Null} | ${col.Key || "-"} | ${col.Default || "NULL"} | ${col.Extra || "-"} |\n`;
    }

    md += `\n`;

    // Primary key
    const pkColumns = table.columns.filter((c) => c.Key === "PRI");
    if (pkColumns.length > 0) {
      md += `**Primary Key:** ${pkColumns.map((c) => `\`${c.Field}\``).join(", ")}\n\n`;
    }

    // Foreign keys (indicated by MUL)
    const fkColumns = table.columns.filter((c) => c.Key === "MUL");
    if (fkColumns.length > 0) {
      md += `**Foreign Keys:** ${fkColumns.map((c) => `\`${c.Field}\``).join(", ")}\n\n`;
    }

    md += `---\n\n`;
  }

  return md;
}

/**
 * Parse MCP result format into array of objects
 */
function parseMCPResult(result: unknown): Record<string, unknown>[] {
  try {
    const mcpData = result as {
      result?: {
        content?: Array<{ type: string; text?: string }>;
      };
    };

    const textContent = mcpData?.result?.content?.find(
      (c) => c.type === "text"
    )?.text;

    if (!textContent) {
      return [];
    }

    // Parse JSON array
    const parsed = JSON.parse(textContent);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("[Schema] Failed to parse MCP result:", error);
    return [];
  }
}
