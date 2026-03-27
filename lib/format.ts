/**
 * SQL Result Formatter
 * Formats SQL query results for AI consumption
 */

interface SQLResult {
  rows?: unknown[];
  fields?: { name: string; type: string }[];
  rowCount?: number;
  error?: string;
}

interface FormattedResult {
  success: boolean;
  summary: string;
  data?: string;
  rowCount?: number;
  error?: string;
}

/**
 * Format SQL results into a human-readable string for AI
 */
export function formatSQLResults(result: SQLResult): FormattedResult {
  if (result.error) {
    return {
      success: false,
      error: result.error,
      summary: `Query failed: ${result.error}`,
    };
  }

  const rows = result.rows || [];
  const rowCount = result.rowCount || rows.length;

  // No results
  if (rowCount === 0) {
    return {
      success: true,
      summary: "Query executed successfully but returned no rows.",
      rowCount: 0,
    };
  }

  // Format as markdown table
  const tableData = formatAsMarkdownTable(rows, result.fields);

  return {
    success: true,
    summary: `Query returned ${rowCount} row${rowCount === 1 ? "" : "s"}.`,
    data: tableData,
    rowCount,
  };
}

/**
 * Convert array of objects to markdown table
 */
function formatAsMarkdownTable(
  rows: unknown[],
  fields?: { name: string; type: string }[]
): string {
  if (rows.length === 0) return "";

  // Get column names
  const firstRow = rows[0] as Record<string, unknown>;
  const columns = fields
    ? fields.map((f) => f.name)
    : Object.keys(firstRow);

  if (columns.length === 0) return "";

  // Limit rows for display (prevent huge responses)
  const maxRows = 50;
  const displayRows = rows.slice(0, maxRows);
  const hasMore = rows.length > maxRows;

  // Build markdown table
  let table = "| " + columns.join(" | ") + " |\n";
  table += "| " + columns.map(() => "---").join(" | ") + " |\n";

  for (const row of displayRows) {
    const rowData = row as Record<string, unknown>;
    const values = columns.map((col) => {
      const value = rowData[col];
      return formatCellValue(value);
    });
    table += "| " + values.join(" | ") + " |\n";
  }

  if (hasMore) {
    table += `\n_(Showing ${maxRows} of ${rows.length} rows)_`;
  }

  return table;
}

/**
 * Format individual cell value
 */
function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "string") {
    // Escape pipe characters in strings
    return value.replace(/\|/g, "\\|");
  }

  if (typeof value === "number") {
    return value.toString();
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  // For objects/arrays, convert to JSON string
  try {
    return JSON.stringify(value).replace(/\|/g, "\\|");
  } catch {
    return String(value);
  }
}

/**
 * Format error message for user display
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Truncate long text for AI context
 */
export function truncateForContext(text: string, maxLength = 4000): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "\n\n...(truncated)";
}
