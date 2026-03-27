/**
 * SQL Safety Validator
 * Ensures only safe read-only queries are executed
 */

const DANGEROUS_KEYWORDS = [
  "DROP",
  "DELETE",
  "UPDATE",
  "ALTER",
  "TRUNCATE",
  "INSERT",
  "CREATE",
  "REPLACE",
  "RENAME",
  "GRANT",
  "REVOKE",
];

const ALLOWED_KEYWORDS = ["SELECT", "SHOW", "DESCRIBE", "EXPLAIN"];

interface SafetyCheckResult {
  safe: boolean;
  reason?: string;
  query: string;
}

/**
 * Check if a SQL query is safe to execute (read-only)
 */
export function validateQuery(query: string): SafetyCheckResult {
  const normalizedQuery = query.trim().toUpperCase();

  // Empty query check
  if (!normalizedQuery) {
    return {
      safe: false,
      reason: "Empty query",
      query,
    };
  }

  // Check for dangerous keywords
  for (const keyword of DANGEROUS_KEYWORDS) {
    if (normalizedQuery.includes(keyword)) {
      return {
        safe: false,
        reason: `Dangerous operation detected: ${keyword}. Only read-only queries are allowed.`,
        query,
      };
    }
  }

  // Check if query starts with allowed keyword
  const startsWithAllowed = ALLOWED_KEYWORDS.some((keyword) =>
    normalizedQuery.startsWith(keyword)
  );

  if (!startsWithAllowed) {
    return {
      safe: false,
      reason: `Query must start with one of: ${ALLOWED_KEYWORDS.join(", ")}`,
      query,
    };
  }

  // Additional safety checks
  if (normalizedQuery.includes("INTO OUTFILE")) {
    return {
      safe: false,
      reason: "File operations are not allowed",
      query,
    };
  }

  if (normalizedQuery.includes("LOAD DATA")) {
    return {
      safe: false,
      reason: "Data loading operations are not allowed",
      query,
    };
  }

  return {
    safe: true,
    query,
  };
}

/**
 * Sanitize query for logging (remove sensitive data)
 */
export function sanitizeQueryForLogging(query: string): string {
  // Remove potential passwords or sensitive strings
  return query.replace(/password\s*=\s*['"][^'"]*['"]/gi, "password='***'");
}
