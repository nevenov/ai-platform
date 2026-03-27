# AI Orchestration Architecture

Complete AI orchestration system with Claude API and MySQL MCP integration.

## Architecture Overview

```
Frontend (Chat UI)
    ↓
/api/chat (Orchestrator)
    ↓
┌─────────────────────────────────────┐
│ AI Client (lib/ai.ts)               │
│ - Claude Sonnet 3.5/4.5             │
│ - Tool/Function calling             │
│ - Conversation management           │
└─────────────────────────────────────┘
    ↓ (decides if SQL needed)
┌─────────────────────────────────────┐
│ SQL Executor (lib/sql.ts)           │
│ - Query execution                   │
│ - Connection testing                │
│ - Schema inspection                 │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Safety Validator (lib/safety.ts)    │
│ - Only SELECT/SHOW/DESCRIBE/EXPLAIN │
│ - Blocks DROP/DELETE/UPDATE/ALTER   │
│ - Query sanitization                │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ MCP Client (lib/mcp.ts)             │
│ - JSON-RPC communication            │
│ - MySQL MCP server connection       │
│ - Tool invocation                   │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│ Result Formatter (lib/format.ts)    │
│ - Markdown tables                   │
│ - Error formatting                  │
│ - Context truncation                │
└─────────────────────────────────────┘
```

## Files Structure

### Core Libraries (lib/)

#### `lib/ai.ts` (190 lines)
- **Purpose**: Claude API client with tool/function calling support
- **Features**:
  - Claude Sonnet 3.5/4.5 integration
  - Tool definitions for SQL execution
  - Conversation history management
  - System prompts for AI behavior
- **Key Functions**:
  - `getAIClient()` - Get global AI client instance
  - `chatWithTools()` - Chat with SQL tool support
  - `sendMessage()` - Send messages to Claude API

#### `lib/mcp.ts` (115 lines)
- **Purpose**: MCP (Model Context Protocol) client for MySQL
- **Features**:
  - JSON-RPC communication
  - Tool listing and invocation
  - Connection health checks
- **Key Functions**:
  - `getMCPClient()` - Get global MCP client instance
  - `executeQuery()` - Execute SQL via MCP
  - `ping()` - Test MCP connection
  - `listTools()` - Get available MCP tools

#### `lib/sql.ts` (100 lines)
- **Purpose**: SQL execution layer with safety checks
- **Features**:
  - Query validation before execution
  - Result formatting
  - Connection testing
  - Schema inspection helpers
- **Key Functions**:
  - `executeSQL()` - Execute safe SQL queries
  - `testConnection()` - Test database connection
  - `listTables()` - Get all tables
  - `describeTable()` - Get table structure

#### `lib/safety.ts` (90 lines)
- **Purpose**: SQL security and validation
- **Features**:
  - Whitelist-based validation (only SELECT/SHOW/DESCRIBE/EXPLAIN)
  - Blocks dangerous operations (DROP/DELETE/UPDATE/ALTER)
  - Query sanitization for logging
- **Key Functions**:
  - `validateQuery()` - Validate SQL query safety
  - `sanitizeQueryForLogging()` - Remove sensitive data from logs

#### `lib/format.ts` (140 lines)
- **Purpose**: Format SQL results for AI and users
- **Features**:
  - Markdown table generation
  - Row limiting (max 50 rows display)
  - Cell value formatting
  - Context truncation
- **Key Functions**:
  - `formatSQLResults()` - Format query results as markdown
  - `formatError()` - Format error messages
  - `truncateForContext()` - Truncate long text

### API Endpoints

#### `app/api/chat/route.ts` (130 lines)
- **Purpose**: Main orchestration endpoint
- **Flow**:
  1. Receive user message + history
  2. Send to Claude with tool definitions
  3. If Claude requests SQL execution:
     - Execute query with safety checks
     - Send results back to Claude
     - Get final formatted response
  4. Return response to frontend
- **Error Handling**:
  - API key validation
  - MCP connection errors
  - SQL execution errors

## Setup Instructions

### 1. Configure Environment Variables

Create `.env.local`:

```env
# Anthropic API Key (required for AI features)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: Choose Claude model
CLAUDE_MODEL=claude-sonnet-4-20250514
```

### 2. Start MySQL MCP Server

```bash
# Start MySQL MCP server (see /api/mcp/mysql/start)
# Or manually:
npx @modelcontextprotocol/server-mysql \
  --host localhost \
  --port 3306 \
  --user root \
  --password your_password \
  --database your_database
```

### 3. Test the System

Navigate to `/chat` and try:
- "Show me all tables in the database"
- "What's in the users table?"
- "Find all orders from last month"

## Security Features

### SQL Safety (lib/safety.ts)
✅ **Allowed**: SELECT, SHOW, DESCRIBE, EXPLAIN
❌ **Blocked**: DROP, DELETE, UPDATE, ALTER, INSERT, TRUNCATE, CREATE

### Query Validation
- Keyword scanning
- File operation blocking (INTO OUTFILE, LOAD DATA)
- Query sanitization for logging

### Error Handling
- API key validation
- MCP connection checks
- Graceful degradation
- User-friendly error messages

## Development Notes

### File Size Constraints
All files kept under 200-300 lines as requested:
- `lib/ai.ts`: 190 lines ✅
- `lib/mcp.ts`: 115 lines ✅
- `lib/sql.ts`: 100 lines ✅
- `lib/safety.ts`: 90 lines ✅
- `lib/format.ts`: 140 lines ✅
- `app/api/chat/route.ts`: 130 lines ✅

### Adding New Tools
To add more AI tools (e.g., API calls, file operations):
1. Define tool in `lib/ai.ts`
2. Add execution logic in orchestrator
3. Update safety checks if needed

### Production Considerations
1. **MCP Connection**: Implement persistent connection pooling
2. **Rate Limiting**: Add API rate limiting
3. **Caching**: Cache database schema queries
4. **Logging**: Add structured logging (Winston, Pino)
5. **Monitoring**: Track API usage and errors
6. **Authentication**: Add user authentication
7. **Streaming**: Implement streaming responses for long queries

## API Response Format

```json
{
  "success": true,
  "message": "AI response with formatted results",
  "toolsUsed": 1,
  "timestamp": "2026-03-27T10:30:00.000Z"
}
```

## Error Response Format

```json
{
  "error": "Error message",
  "timestamp": "2026-03-27T10:30:00.000Z"
}
```

## Testing

```bash
# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me all tables",
    "history": []
  }'
```

## Next Steps

1. ✅ Core architecture implemented
2. 🚧 Connect real MySQL MCP server
3. 🚧 Add streaming responses
4. 🚧 Implement authentication
5. 🚧 Add conversation persistence
6. 🚧 Create admin dashboard
