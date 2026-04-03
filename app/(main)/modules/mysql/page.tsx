"use client";

import Link from "next/link";
import { useState } from "react";

export default function MySQLConfigurePage() {
  const [formData, setFormData] = useState({
    host: "",
    port: "3306",
    username: "",
    password: "",
    database: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/mcp/mysql/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "MySQL connection configured successfully!",
        });
        // Reset form after success
        setFormData({
          host: "",
          port: "3306",
          username: "",
          password: "",
          database: "",
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to configure MySQL connection",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-zinc-950 dark:to-black">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          href="/modules"
          className="mb-8 inline-flex items-center text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Modules
        </Link>

        <div className="mb-12">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-4xl shadow-lg">
              🗄️
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                MySQL Analyst
              </h1>
              <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
                Configure your MySQL database connection
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl dark:bg-zinc-900">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Host Field */}
            <div>
              <label
                htmlFor="host"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Host
              </label>
              <input
                type="text"
                id="host"
                name="host"
                value={formData.host}
                onChange={handleChange}
                required
                placeholder="localhost or 127.0.0.1"
                className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
              />
            </div>

            <div>
              <label
                htmlFor="port"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Port
              </label>
              <input
                type="number"
                id="port"
                name="port"
                value={formData.port}
                onChange={handleChange}
                required
                placeholder="3306"
                className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="root"
                className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
              />
            </div>

            <div>
              <label
                htmlFor="database"
                className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                Database
              </label>
              <input
                type="text"
                id="database"
                name="database"
                value={formData.database}
                onChange={handleChange}
                required
                placeholder="my_database"
                className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
              />
            </div>

            {/* Status Messages */}
            {message && (
              <div
                className={`rounded-lg p-4 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                }`}
              >
                <div className="flex items-center">
                  {message.type === "success" ? (
                    <svg
                      className="mr-3 h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="mr-3 h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="text-sm font-medium">{message.text}</span>
                </div>
              </div>
            )}

            {message?.type === "success" && (
                <div className="mt-6">
                  <Link
                    href="/mysql-explorer"
                    className="inline-flex items-center rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-white font-semibold shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Go to MySQL Explorer
                    <svg
                        className="ml-2 h-5 w-5"
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
                  </Link>
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="mr-3 h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Connecting...
                </span>
              ) : (
                "Start MCP Server"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
