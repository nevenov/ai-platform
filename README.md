# SimpleAI WebAdmin

**Universal AI-powered control panel for managing databases, websites, and digital operations through natural language.**

A modern Next.js application that combines AI capabilities (Claude API) with database management (MySQL via MCP) to provide an intelligent interface for any MySQL database.

---

## 🎯 Features

### ✅ AI Chat Interface
- Natural language queries to your database
- Multi-round tool calling (up to 10 rounds)
- Automatic schema discovery and error recovery
- Business intelligence insights and data analysis
- Markdown-formatted results with tables

### ✅ MySQL Explorer
- Browse database tables and schemas
- SQL query editor with syntax highlighting (Monaco Editor)
- Execute queries with real-time results
- Table structure inspection (DESCRIBE, SHOW)
- Connection status monitoring

### ✅ Professional Dashboard
- Real-time system status monitoring
- Quick action cards
- Connection health indicators
- Recent activity tracking
- Dark mode support

### ✅ Security First
- SQL query validation (read-only mode)
- Whitelist: `SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`
- Blocked: `DROP`, `DELETE`, `UPDATE`, `ALTER`, `INSERT`
- Safe for production use

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ 
- MySQL database (local or remote)
- Anthropic API key ([get one here](https://console.anthropic.com))

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-platform

# Install dependencies
npm install
```

### 3. Configuration

Create `.env.local` in the project root:

```env
# Anthropic API Key (required)
ANTHROPIC_API_KEY=sk-ant-api03-...

# MySQL Connection (update with your credentials)
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=your_username
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=your_database
```

**Note:** `.env.local` is git-ignored by default and will not be committed.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📁 Project Structure

```
app/
├── (main)/              # Main app with sidebar
│   ├── dashboard/       # Main dashboard
│   ├── chat/           # AI chat interface
│   ├── mysql-explorer/ # Database explorer
│   └── modules/        # Additional modules
├── api/
│   ├── chat/           # AI orchestration endpoint
│   ├── health/         # Health check
│   ├── status/         # System status
│   └── mcp/mysql/      # MySQL MCP proxy
└── layout.tsx          # Root layout

components/
├── Sidebar.tsx          # Navigation sidebar
├── ThemeToggle.tsx      # Light/dark mode switcher
├── ToastContainer.tsx   # Toast notifications
└── ConnectionStatus.tsx # Connection indicators

lib/
├── ai.ts               # Claude API client
├── mcp.ts              # MCP (Model Context Protocol) client
├── sql.ts              # SQL execution layer
├── safety.ts           # SQL query validation
├── format.ts           # Result formatting
└── tool-orchestration.ts # Multi-round tool calling
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

---

## 🎨 Tech Stack

- **Framework:** Next.js 16.2.1 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v3
- **AI:** Claude API (Anthropic)
- **Database:** MySQL via MCP Server
- **Editor:** Monaco Editor
- **Theme:** next-themes (dark mode)

---

## 💬 Usage Examples

### AI Chat Queries

Try these natural language queries in the `/chat` interface:

```
"Show me all tables in the database"
"What's the structure of the users table?"
"Show me the top 10 records ordered by date"
"Compare counts by category and status"
"Show me distribution of records by year"
```

The AI will automatically:
1. Explore your database schema
2. Generate appropriate SQL queries
3. Execute with safety validation
4. Format results as readable tables
5. Provide business insights

### SQL Explorer

Use the `/mysql-explorer` page to:
- Browse all tables
- Click to describe table structure
- Write custom SQL queries
- View formatted results

---

## 🔒 Security & Safety

### SQL Query Validation
All queries pass through `lib/safety.ts` which enforces:
- ✅ **Allowed:** `SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`
- ❌ **Blocked:** `DROP`, `DELETE`, `UPDATE`, `ALTER`, `INSERT`, `TRUNCATE`, `CREATE`

### Environment Variables
Never commit sensitive data:
- Use `.env.local` for secrets
- `.env.example` for template (no real credentials)
- API keys, passwords protected

---

## 🛠️ Development

### File Size Convention
All files kept under 200-300 lines for maintainability:
- Modular architecture
- Single responsibility principle
- Easy to navigate and debug

### Adding New Features

**New Dashboard Widget:**
- Edit `app/(main)/dashboard/page.tsx`
- Follow design system (zinc colors, dark mode)

**New Sidebar Link:**
- Update `components/Sidebar.tsx`
- Create page in `app/(main)/your-page/page.tsx`

**New API Endpoint:**
- Create in `app/api/your-endpoint/route.ts`

See [AGENTS.md](./AGENTS.md) for AI coding guidelines.

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture details
- **[AGENTS.md](./AGENTS.md)** - AI agent guidelines and conventions

---

## 🎯 Roadmap

**Completed (v1.0):**
- ✅ AI Chat with Claude integration
- ✅ MySQL Explorer with MCP server
- ✅ Dashboard with real-time monitoring
- ✅ Dark mode support
- ✅ Toast notifications
- ✅ Connection status indicators

**Planned Features:**
- 🔄 Streaming AI responses (SSE)
- 📊 Charts & visualizations
- 📤 Export to CSV/Excel
- 💾 Conversation persistence
- 🔐 User authentication
- 🌐 Web scraping module
- 📧 Email automation module
- 📈 GA4 analytics module

---

## 🤝 Contributing

**New to this project?** Read the [Quick Onboarding](./AGENTS.md#-quick-onboarding-for-new-agents) section in AGENTS.md first.

### Contribution Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. **Read [AGENTS.md](./AGENTS.md)** - Project guidelines and conventions
4. Follow the design system and coding standards
5. Test in both light/dark mode at all breakpoints
6. Commit changes (`git commit -m 'Add amazing feature'`)
7. Push to branch (`git push origin feature/amazing-feature`)
8. Open Pull Request

### Important Guidelines
- ✅ Use generic, neutral terminology (no domain-specific terms)
- ✅ Dark mode support mandatory
- ✅ Keep files under 200 lines when possible
- ✅ TypeScript strict mode
- ✅ Test responsive design (mobile/tablet/desktop)

---

## 📄 License

This project is licensed under the MIT License.

---

## 🆘 Troubleshooting

**MCP Connection Issues:**
- Verify MySQL credentials in `.env.local`
- Check MySQL server is running
- Test connection in MySQL Explorer

**API Key Errors:**
- Verify `ANTHROPIC_API_KEY` in `.env.local`
- Check API key is valid at [console.anthropic.com](https://console.anthropic.com)

**Build Errors:**
- Run `npm install` to ensure dependencies are installed
- Delete `.next` folder and rebuild

---

**Questions?** Open an issue or check the documentation files!
