"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

export default function MySQLExplorerPage() {
  const [status, setStatus] = useState<string | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [describeData, setDescribeData] = useState<any>(null);
  const [sql, setSql] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [queryResult, setQueryResult] = useState<any>(null);

  // --- API calls ---
  async function ping() {
    const res = await fetch("/api/mcp/mysql/ping");
    const data = await res.json();
    setStatus(data.ok ? "Connected" : "Not connected");
  }

  async function loadTables() {
    const res = await fetch("/api/mcp/mysql/tables");
    const data = await res.json();

    setTables(data.tables || []);
  }

  async function describeTable(name: string) {
    setSelectedTable(name);
    const res = await fetch(`/api/mcp/mysql/describe?table=${name}`);
    const data = await res.json();
    setDescribeData(data.describe || null);
  }

  async function executeQuery() {
    const res = await fetch("/api/mcp/mysql/query", {
      method: "POST",
      body: JSON.stringify({ sql }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setQueryResult(data.result || data.error);
  }

  return (
    <div className="flex h-screen">
      {/* LEFT SIDEBAR */}
      <div className="w-64 border-r bg-gray-50 p-4 space-y-4">
        <h2 className="text-xl font-bold">MySQL Explorer</h2>

        {/* Connection */}
        <button
          onClick={ping}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded"
        >
          Test Connection
        </button>
        {status && <p className="text-sm">Status: {status}</p>}

        {/* Tables */}
        <button
          onClick={loadTables}
          className="w-full px-4 py-2 bg-green-600 text-white rounded"
        >
          Show Tables
        </button>

        <div className="mt-4">
          <h3 className="font-semibold mb-2">Tables</h3>
          <ul className="space-y-1 max-h-64 overflow-y-auto">
            {tables.map((t) => (
              <li
                key={t}
                className={`cursor-pointer px-2 py-1 rounded ${
                  selectedTable === t
                    ? "bg-blue-200 font-semibold"
                    : "hover:bg-gray-200"
                }`}
                onClick={() => describeTable(t)}
              >
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* Describe Table */}
        {selectedTable && describeData && (
          <div className="border p-4 rounded bg-white shadow">
            <h2 className="font-semibold text-lg mb-2">
              Describe: {selectedTable}
            </h2>
            <pre className="text-sm">{JSON.stringify(describeData, null, 2)}</pre>
          </div>
        )}

        {/* SQL Editor */}
        <div className="border p-4 rounded bg-white shadow">
          <h2 className="font-semibold text-lg mb-2">SQL Query</h2>

          <div className="h-64 border rounded overflow-hidden">
            <Editor
                height="100%"
                defaultLanguage="sql"
                theme="vs-dark"
                value={sql}
                onChange={(value) => setSql(value || "")}
                options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
                }}
            />
          </div>

          <button
            onClick={executeQuery}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded"
          >
            Execute
          </button>

          {queryResult && (
            <pre className="mt-4 text-sm bg-gray-50 p-4 rounded border">
              {JSON.stringify(queryResult, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
