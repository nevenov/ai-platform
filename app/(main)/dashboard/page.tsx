"use client";

import Link from "next/link";
import ConnectionStatus from "@/components/ConnectionStatus";

export default function DashboardPage() {
  const quickActions = [
    {
      name: "AI Chat",
      description: "Ask questions about your data with natural language",
      href: "/chat",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      gradient: "from-purple-600 to-blue-600",
    },
    {
      name: "MySQL Explorer",
      description: "Browse tables, run queries, and analyze database",
      href: "/mysql-explorer",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
      gradient: "from-green-600 to-teal-600",
    },
    {
      name: "MySQL Config",
      description: "Configure database connection and settings",
      href: "/modules/mysql",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      name: "All Modules",
      description: "Browse all available AI modules and integrations",
      href: "/modules",
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      gradient: "from-amber-600 to-orange-600",
    },
  ];

  const stats = [
    { name: "AI Model", value: "Claude Sonnet 4.6", change: "Latest" },
    { name: "Tool Model", value: "Haiku 4.5", change: "Adaptive" },
    { name: "Database", value: "MySQL", change: "Connected" },
    { name: "Status", value: "Operational", change: "All systems" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-white to-purple-50 p-10 shadow-xl dark:from-zinc-900 dark:via-zinc-900 dark:to-purple-950">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SimpleAI WebAdmin
            </h1>
            <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
              ● Operational
            </span>
          </div>
          <p className="text-lg text-zinc-600 dark:text-zinc-300">
            Your unified AI-powered control panel for databases, websites, and digital operations
          </p>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Ask questions in natural language • Automate tasks • Analyze data instantly
          </p>
        </div>
        {/* Background decoration */}
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-purple-100/50 to-transparent dark:from-purple-900/20" />
      </div>

        {/* Stats */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {stat.name}
                </div>
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  {stat.name === "AI Model" && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  )}
                  {stat.name === "Tool Model" && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {stat.name === "Database" && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  )}
                  {stat.name === "Status" && (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-green-600 dark:text-green-400">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {stat.change}
                </div>
              </div>
              {/* Hover gradient effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-50/50 to-blue-50/0 opacity-0 transition-opacity group-hover:opacity-100 dark:from-blue-900/0 dark:via-blue-900/10 dark:to-blue-900/0" />
            </div>
          ))}
        </div>

        {/* Connection Monitoring */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Connection Status
            </h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Real-time monitoring
            </span>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <ConnectionStatus type="mysql" />
            <ConnectionStatus type="api" endpoint="/api/health" />
            <ConnectionStatus type="system" endpoint="/api/status" />
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Quick Actions
            </h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              Jump to key features
            </span>
          </div>
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-7 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-blue-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-blue-700"
              >
                <div className="relative z-10 flex items-start gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {action.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {action.description}
                    </p>
                  </div>
                  <svg
                    className="h-6 w-6 shrink-0 text-zinc-400 transition-all duration-300 group-hover:translate-x-2 group-hover:text-blue-600 dark:text-zinc-600 dark:group-hover:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/0 via-blue-100/30 to-purple-50/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-blue-950/0 dark:via-blue-900/20 dark:to-purple-950/0" />
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>
        </div>

        {/* AI Assistant Quick Panel */}
        <div className="rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-8 shadow-xl dark:border-blue-900/50 dark:from-blue-950/30 dark:to-purple-950/30">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 dark:text-white">AI Assistant</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Ask me anything about your data</p>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="mb-4 flex flex-wrap gap-2">
            <a
              href="/chat?q=Show me total patients"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20"
            >
              💊 Total patients
            </a>
            <a
              href="/chat?q=Top 5 clinics by patients"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20"
            >
              🏥 Top clinics
            </a>
            <a
              href="/chat?q=Compare patients by gender"
              className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-md transition-all hover:scale-105 hover:shadow-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:from-purple-900/20 dark:hover:to-blue-900/20"
            >
              📊 Gender analysis
            </a>
          </div>

          {/* Input Field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = new FormData(e.currentTarget).get("query") as string;
              if (input?.trim()) {
                window.location.href = `/chat?q=${encodeURIComponent(input)}`;
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              name="query"
              placeholder="Ask AI anything... (e.g., 'Show me all tables')"
              className="flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-500 shadow-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
            />
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Ask
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid gap-7 lg:grid-cols-2">
          {/* Getting Started */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-md transition-all duration-200 hover:shadow-lg hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              🚀 Getting Started
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>AI Chat interface with multi-round tool calling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>MySQL database integration via MCP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 dark:text-green-400">✓</span>
                <span>Adaptive model selection (Haiku → Sonnet)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-400">○</span>
                <span>HTTP tools (coming soon)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-zinc-400">○</span>
                <span>Automation workflows (coming soon)</span>
              </li>
            </ul>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-md transition-all duration-200 hover:shadow-lg hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-900 dark:text-white">
                📈 Recent Activity
              </h3>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Last 24 hours</span>
            </div>
            <div className="space-y-3">
              {/* Activity Item 1 */}
              <div className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 transition-all hover:border-blue-200 hover:bg-blue-50/50 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-blue-800 dark:hover:bg-blue-900/20">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">AI Query executed</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Show me total patients by clinic</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">2 hours ago</p>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 transition-all hover:border-blue-200 hover:bg-blue-50/50 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-blue-800 dark:hover:bg-blue-900/20">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">Database explored</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Viewed patients table structure</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">5 hours ago</p>
                </div>
              </div>

              {/* Activity Item 3 */}
              <div className="flex items-start gap-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3 transition-all hover:border-blue-200 hover:bg-blue-50/50 dark:border-zinc-800 dark:bg-zinc-800/50 dark:hover:border-blue-800 dark:hover:bg-blue-900/20">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">MySQL connection tested</p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">Connection successful</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">Yesterday</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
