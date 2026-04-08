<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# SimpleAI WebAdmin - Agent Guide

**Project Type:** Next.js 16.2.1 App Router + TypeScript + Tailwind CSS v3  
**Purpose:** Generic AI-powered control panel for any MySQL database  
**Tech Stack:** React 19, Claude API, MySQL MCP Server, next-themes

---

## 🎯 Project Vision

**SimpleAI WebAdmin** is a universal AI hub for managing databases, websites, and digital operations through natural language. It's NOT healthcare-specific - works with ANY MySQL database (Sakila, e-commerce, CMS, etc.).

**Core Features:**
- 💬 AI Chat with Claude API (tool calling)
- 🗄️ MySQL Explorer (browse, query, analyze)
- 🎨 Professional Dashboard with real-time monitoring
- 🌓 Dark mode support (next-themes)
- 🔔 Toast notification system
- 📊 Connection status indicators

---

## � Quick Onboarding (For New Agents)

**First time working on this project? Start here:**

### Critical Rules (Read First!)
1. **🌍 Generic & Universal** - This is NOT a domain-specific app
   - ❌ Never use: medical, healthcare, finance, e-commerce terms
   - ✅ Always use: records, items, users, data, entries, categories
   
2. **🎨 Design System Compliance**
   - Dark mode is **mandatory** - every component needs `dark:*` classes
   - Colors: zinc palette (50-950) + blue-purple gradients
   - Spacing: gap-5/6/7, p-6/7/8 (consistent patterns)
   - Border radius: rounded-xl (small), rounded-2xl (cards), rounded-3xl (hero)
   - Shadows: shadow-md/lg/xl (always increase on hover)

3. **📏 Code Organization**
   - Files < 200 lines preferred (modular architecture)
   - Use TypeScript strict mode
   - Client components: add `"use client"` when using hooks/events
   - Server components: default (no hooks, data fetching only)

4. **🔒 Security First**
   - SQL queries: READ-ONLY mode (SELECT, SHOW, DESCRIBE, EXPLAIN)
   - Validation in `lib/safety.ts` - never bypass
   - Environment variables in `.env.local` (git-ignored)
   - Never commit credentials or domain-specific data

5. **📱 Responsive Design**
   - Test at 3 breakpoints: mobile (`sm:`), tablet (`lg:`), desktop (`xl:`)
   - Mobile-first approach
   - Touch-friendly interactions

### Where to Find What

| Need to... | Look at... |
|------------|------------|
| Add dashboard widget | `app/(main)/dashboard/page.tsx` |
| Add sidebar link | `components/Sidebar.tsx` |
| Create API endpoint | `app/api/your-endpoint/route.ts` |
| Add reusable component | `components/YourComponent.tsx` |
| Add utility function | `lib/your-util.ts` |
| Understand architecture | `ARCHITECTURE.md` |
| Setup environment | `README.md` |

### Common Task Patterns

**Show toast notification:**
```tsx
import { useToast } from "@/components/ToastContext";
const { showToast } = useToast();
showToast({ type: "success", message: "Done!" });
```

**Connection status:**
```tsx
<ConnectionStatus type="mysql" />
<ConnectionStatus type="api" endpoint="/api/health" />
```

**Dark mode aware component:**
```tsx
<div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
  {/* Content */}
</div>
```

### Tech Stack Quick Reference
- **Framework:** Next.js 16.2.1 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v3
- **AI:** Claude API (Anthropic)
- **Database:** MySQL via MCP Server
- **Theme:** next-themes
- **Editor:** Monaco Editor (SQL syntax highlighting)

### Before Making Changes Checklist
- [ ] Generic terminology only (no domain-specific terms)
- [ ] Dark mode classes included (`dark:*`)
- [ ] Responsive design considered (sm:/lg:/xl:)
- [ ] File size < 200 lines (or well justified)
- [ ] TypeScript types added
- [ ] Tested in both light and dark mode
- [ ] No console errors or warnings

**Need more details?** Continue reading below for comprehensive guidelines.

---

## �📁 Project Structure

```
app/
├── (main)/                    # Route group WITH sidebar
│   ├── dashboard/            # Main dashboard page
│   ├── chat/                 # AI chat interface
│   ├── mysql-explorer/       # Database explorer
│   └── modules/              # Additional modules
├── api/
│   ├── chat/                 # AI orchestrator endpoint
│   ├── health/               # Health check API
│   ├── status/               # System status API
│   └── mcp/mysql/            # MCP proxy endpoints
├── layout.tsx                # Root layout (ThemeProvider, ToastProvider)
└── globals.css               # Global styles + animations

components/
├── Sidebar.tsx               # Global navigation sidebar
├── DashboardLayout.tsx       # Layout with sidebar offset
├── ThemeToggle.tsx           # Light/dark mode switcher
├── ThemeProvider.tsx         # next-themes wrapper
├── ToastContainer.tsx        # Toast notifications UI
├── ToastContext.tsx          # Toast state management
└── ConnectionStatus.tsx      # Real-time connection indicators

lib/
├── ai.ts                     # Claude API client
├── mcp.ts                    # MCP (Model Context Protocol) client
├── sql.ts                    # SQL execution layer
├── safety.ts                 # SQL query validation
├── format.ts                 # Result formatting
└── tool-orchestration.ts     # Multi-round tool calling
```

---

## 🎨 Design System

### Colors & Gradients
- **Primary:** Blue to Purple gradients (`from-blue-600 to-purple-600`)
- **Success:** Green (`bg-green-500`, `text-green-600`)
- **Error:** Red (`bg-red-500`, `text-red-600`)
- **Warning:** Yellow (`bg-yellow-500`, `text-yellow-600`)
- **Info:** Blue (`bg-blue-500`, `text-blue-600`)
- **Neutral:** Zinc palette (`zinc-50` to `zinc-950`)

### Spacing Pattern
- **Container gaps:** `space-y-10`
- **Grid gaps:** `gap-5`, `gap-6`, `gap-7`
- **Section headers:** `mb-5`
- **Card padding:** `p-6`, `p-7`, `p-8`

### Border Radius
- **Small elements:** `rounded-xl` (12px)
- **Cards:** `rounded-2xl` (16px)
- **Hero sections:** `rounded-3xl` (24px)

### Shadows
- **Small:** `shadow-md`
- **Medium:** `shadow-lg`
- **Large:** `shadow-xl`, `shadow-2xl`
- **Hover:** Always increase shadow on hover

### Animations
- **Duration:** `duration-200`, `duration-300`
- **Hover scale:** `hover:scale-[1.02]`, `hover:scale-105`
- **Hover lift:** `hover:-translate-y-1`, `hover:-translate-y-0.5`

---

## 🔧 Common Tasks

### Adding a New Dashboard Widget

1. **Location:** `app/(main)/dashboard/page.tsx`
2. **Pattern:**
```tsx
<div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
  <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">
    🎯 Widget Title
  </h3>
  {/* Content */}
</div>
```

3. **Follow spacing:** Use `gap-7` in grid, `p-7` for padding
4. **Dark mode:** Always include `dark:` variants
5. **Hover effects:** `hover:shadow-lg hover:border-zinc-300`

### Adding a New Sidebar Link

1. **Location:** `components/Sidebar.tsx`
2. **Add to navigation array:**
```tsx
{
  name: "Page Name",
  href: "/page-route",
  icon: <svg>...</svg>,
  gradient: "from-color-500 to-color-500",
}
```

3. **Create page:** `app/(main)/page-route/page.tsx`
4. **Use client components:** Add `"use client"` if using hooks

### Creating a Toast Notification

```tsx
import { useToast } from "@/components/ToastContext";

function MyComponent() {
  const { showToast } = useToast();
  
  const handleAction = () => {
    showToast({ 
      type: "success", 
      message: "Action completed!" 
    });
  };
}
```

**Types:** `success`, `error`, `warning`, `info`

### Checking Connection Status

```tsx
<ConnectionStatus type="mysql" />
<ConnectionStatus type="api" endpoint="/api/health" />
<ConnectionStatus type="system" endpoint="/api/status" />
```

**Compact mode:** `<ConnectionStatus type="mysql" compact />`

---

## 🚨 Important Conventions

### 1. Generic, Neutral Examples Only
❌ **Bad:** Domain-specific terminology (medical, finance, etc.)  
✅ **Good:** "Show records", "Count data", "📋 Tables", "List items"

Use universal terms: records, items, users, categories, data, entries

### 2. Dark Mode Always
Every component MUST support dark mode:
```tsx
className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
```

### 3. Client vs Server Components
- **Use `"use client"`** when using:
  - `useState`, `useEffect`, `useContext`
  - Event handlers (`onClick`, `onSubmit`)
  - `useToast`, `useTheme`, `usePathname`
- **Server components** (default) for:
  - Static content
  - Data fetching
  - Layouts

### 4. Responsive Design
Always test at 3 breakpoints:
- **Mobile:** `sm:` (640px+)
- **Tablet:** `lg:` (1024px+)
- **Desktop:** `xl:` (1280px+)

### 5. Accessibility
- Use semantic HTML (`<nav>`, `<main>`, `<article>`)
- Add `aria-label` to icon buttons
- Ensure keyboard navigation works
- Maintain color contrast ratios

---

## 🔐 Security Rules

### SQL Queries
**Only allowed:** `SELECT`, `SHOW`, `DESCRIBE`, `EXPLAIN`  
**Blocked:** `DROP`, `DELETE`, `UPDATE`, `ALTER`, `INSERT`, `TRUNCATE`, `CREATE`

Validation happens in `lib/safety.ts` - NEVER bypass this!

### Environment Variables
**Never commit:**
- `ANTHROPIC_API_KEY`
- `MYSQL_PASSWORD`

**Always use `.env.local`** for secrets.

---

## 🎯 AI Chat Architecture

```
User Message
    ↓
/api/chat (Orchestrator)
    ↓
lib/ai.ts (Claude API)
    ↓ (tool_use)
lib/tool-orchestration.ts
    ↓
lib/sql.ts → lib/safety.ts → lib/mcp.ts
    ↓
MySQL Database
    ↓
lib/format.ts (Markdown tables)
    ↓
Claude API (final response)
    ↓
User sees formatted result
```

**Multi-round loop:** Up to 10 rounds for complex queries  
**Adaptive models:** Haiku (fast) → Sonnet (complex)

---

## 🛠️ Development Workflow

### Starting Dev Server
```bash
npm run dev
```

### Testing Changes
1. Make edits
2. Browser auto-refreshes (Turbopack)
3. Check console for errors
4. Test dark mode toggle
5. Test responsive design

### Common Dev Issues

**Hydration errors:**
- Use `suppressHydrationWarning` on affected elements
- Format dates consistently (use 'en-US' locale)

**Theme flash:**
- Already handled with `next-themes` + `suppressHydrationWarning`

**Toast not showing:**
- Check if component is wrapped in `<ToastProvider>`
- Verify `useToast()` is called inside component

---

## 📊 Performance Guidelines

### Keep Files Small
- Components: < 200 lines
- API routes: < 150 lines
- Utils: < 100 lines per function

### Optimize Images
Use Next.js `<Image>` component with proper sizes

### Lazy Load Heavy Components
```tsx
import dynamic from 'next/dynamic';
const HeavyComponent = dynamic(() => import('./HeavyComponent'));
```

---

## 🎨 Tailwind Customization

**Current config:** Tailwind v3 with `darkMode: 'class'`

**Custom animations:** See `app/globals.css`
- `@keyframes progress` - Toast countdown
- `@keyframes slide-in-from-right` - Toast entry

---

## 📝 Documentation Files

- **AGENTS.md** (this file) - For AI agents
- **ARCHITECTURE.md** - For human developers
- **CHAT_FIX_SESSION.md** - Historical debug session
- **README.md** - Project overview

---

## ✅ Before Submitting Changes

- [ ] Test in both light and dark mode
- [ ] Check responsive design (mobile/tablet/desktop)
- [ ] No console errors or warnings
- [ ] Generic, neutral content only
- [ ] Code follows existing patterns
- [ ] Dark mode classes added where needed
- [ ] Accessibility considered

---

## 🚀 Next Steps (Roadmap)

**Completed (10/10):**
✅ Dashboard improvements  
✅ System status cards  
✅ Quick actions  
✅ AI Assistant panel  
✅ Recent activity  
✅ Sidebar styling  
✅ Theme toggle  
✅ Connection indicators  
✅ Card design polish  
✅ Toast notifications  

**Future Ideas:**
- HTTP tools module
- Automation workflows
- Schema caching
- Multi-tenant support
- Export to CSV/Excel
- Charting & visualization
- User authentication
- Conversation persistence

---

**Questions?** Check existing code patterns or ask for clarification!
