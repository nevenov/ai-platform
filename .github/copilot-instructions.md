# GitHub Copilot Instructions for SimpleAI WebAdmin

You are a specialized AI assistant working on the **SimpleAI WebAdmin** project.

## 🚀 New Here? Quick Start

**First time on this project?**
1. Read the **Quick Onboarding** section in `/AGENTS.md` (lines 35-120)
2. This gives you everything needed to start contributing immediately
3. Come back here for quick reference on common patterns

## 🎯 Core Principles

1. **Read AGENTS.md first** - Complete guidelines with Quick Onboarding section
2. **Generic examples only** - Use neutral terms: records, items, users, categories, data
3. **Dark mode mandatory** - Every UI component must support dark mode
4. **Follow design system** - Use zinc colors, consistent spacing, proper shadows

## 📋 Quick Checklist

Before suggesting any code change:
- [ ] Uses generic, neutral terminology?
- [ ] Does it include dark mode classes (`dark:*`)?
- [ ] Does it follow spacing pattern (gap-5/6/7, p-6/7/8)?
- [ ] Does it use correct border-radius (rounded-xl/2xl/3xl)?
- [ ] Is it responsive (sm:/lg:/xl: breakpoints)?

## 🎨 Design System Quick Reference

**Colors:**
- Primary gradient: `from-blue-600 to-purple-600`
- Success: `bg-green-500`, Error: `bg-red-500`
- Neutral: `zinc-50` to `zinc-950`

**Spacing:**
- Container: `space-y-10`
- Grids: `gap-5`, `gap-6`, `gap-7`
- Cards: `p-6`, `p-7`, `p-8`

**Shadows:**
- Small: `shadow-md`, Medium: `shadow-lg`, Large: `shadow-xl`
- Always increase on hover

**Border Radius:**
- Small: `rounded-xl`, Cards: `rounded-2xl`, Hero: `rounded-3xl`

## 🚨 Security & Safety

**SQL Queries:**
- ✅ Allowed: SELECT, SHOW, DESCRIBE, EXPLAIN
- ❌ Blocked: DROP, DELETE, UPDATE, ALTER, INSERT, TRUNCATE, CREATE

Validation is in `lib/safety.ts` - **never bypass**.

## 📦 Common Patterns

### Dashboard Widget
```tsx
<div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
  <h3 className="mb-4 font-semibold text-zinc-900 dark:text-white">
    🎯 Title
  </h3>
  {/* Content */}
</div>
```

### Toast Notification
```tsx
import { useToast } from "@/components/ToastContext";
const { showToast } = useToast();
showToast({ type: "success", message: "Done!" });
```

### Connection Status
```tsx
<ConnectionStatus type="mysql" />
<ConnectionStatus type="api" endpoint="/api/health" />
```

## 📁 File Locations

- Dashboard widgets: `app/(main)/dashboard/page.tsx`
- Sidebar links: `components/Sidebar.tsx`
- API routes: `app/api/`
- Reusable components: `components/`
- Utilities: `lib/`

## 🔧 Development Rules

1. Use `"use client"` for interactive components (hooks, event handlers)
2. Keep files under 200 lines when possible
3. Test in both light and dark mode
4. Check responsive design at 3 breakpoints (mobile/tablet/desktop)
5. Always add TypeScript types

## ⚠️ Common Mistakes to Avoid

- ❌ Using domain-specific terminology in examples
- ❌ Forgetting dark mode classes
- ❌ Inconsistent spacing (mixing gap-4 and gap-7)
- ❌ Wrong border-radius (using rounded-lg when should be rounded-2xl)
- ❌ Missing hover states
- ❌ Not testing responsive design

## ✅ Before Submitting

Check all of these:
- [ ] Generic, neutral content only
- [ ] Dark mode support complete
- [ ] Responsive at mobile/tablet/desktop
- [ ] No console errors or warnings
- [ ] Follows design system
- [ ] TypeScript types correct
- [ ] Accessibility considered

---

**Need more details?** Read `/AGENTS.md` for comprehensive guidelines.
