import Link from "next/link";

const modules = [
  {
    id: "mysql",
    name: "MySQL Analyst",
    description: "Connect and analyze MySQL databases with AI-powered insights",
    icon: "🗄️",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "ga4",
    name: "GA4 Analyst",
    description: "Analyze Google Analytics 4 data with natural language queries",
    icon: "📊",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "github",
    name: "GitHub Analyst",
    description: "Explore GitHub repositories and analyze code insights",
    icon: "🐙",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "http",
    name: "HTTP Analyst",
    description: "Monitor and analyze HTTP requests and API endpoints",
    icon: "🌐",
    color: "from-green-500 to-emerald-500",
  },
];

export default function ModulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
            AI Modules
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400">
            Choose a module to configure and start analyzing your data
          </p>
        </div>

        {/* Grid of Module Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl dark:bg-zinc-900"
            >
              {/* Gradient Background */}
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${module.color} opacity-5 transition-opacity duration-300 group-hover:opacity-10`}
              />

              {/* Card Content */}
              <div className="relative p-6">
                {/* Icon */}
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-4xl shadow-sm dark:from-zinc-800 dark:to-zinc-700">
                  {module.icon}
                </div>

                {/* Title */}
                <h3 className="mb-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  {module.name}
                </h3>

                {/* Description */}
                <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
                  {module.description}
                </p>

                {/* Configure Button */}
                <Link
                  href={`/modules/${module.id}`}
                  className={`flex w-full items-center justify-center rounded-lg bg-gradient-to-r ${module.color} px-4 py-2.5 text-sm font-medium text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95`}
                >
                  Configure
                </Link>
              </div>

              {/* Hover Effect Border */}
              <div
                className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r ${module.color} opacity-0 transition-opacity duration-300 group-hover:opacity-20`}
                style={{ mixBlendMode: "overlay" }}
                />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
