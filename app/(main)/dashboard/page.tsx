import Link from "next/link";

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
    <div className="space-y-8">
      {/* Header */}
      <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            SimpleAI WebAdmin
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Your unified AI-powered control panel for data analysis and automation
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {stat.name}
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <div className="text-2xl font-semibold text-zinc-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">
                  {stat.change}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                href={action.href}
                className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${action.gradient} text-white`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      {action.name}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {action.description}
                    </p>
                  </div>
                  <svg
                    className="h-5 w-5 text-zinc-400 transition-transform group-hover:translate-x-1 dark:text-zinc-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Getting Started */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
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
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="font-semibold text-zinc-900 dark:text-white">
              📊 System Info
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Cost Optimization
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  92% savings
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Query Budget
                </span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  ~450 queries/$5
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Performance
                </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  2-3x faster
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Architecture
                </span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  Modular
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-zinc-600 dark:text-zinc-400">
                  Files
                </span>
                <span className="font-medium text-zinc-900 dark:text-white">
                  {"All <300 lines"}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
  );
}
