"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useToast } from "@/components/ToastContext";

/* 1) Icons */
function StructureIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="6" rx="1" />
      <rect x="3" y="14" width="18" height="6" rx="1" />
    </svg>
  );
}

function DescribeIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15.4 9c.33.52.33 1.48 0 2z" />
    </svg>
  );
}

function QueryIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 5h18M3 12h18M3 19h18" />
    </svg>
  );
}


/* 2) Tabs */
function Tabs({
  active,
  onChange,
}: {
  active: "structure" | "describe" | "query";
  onChange: (tab: "structure" | "describe" | "query") => void;
}) {
  const tabs = [
    { id: "structure", label: "Structure", icon: StructureIcon },
    { id: "describe", label: "Describe", icon: DescribeIcon },
    { id: "query", label: "Query", icon: QueryIcon },
  ] as const;

  return (
    <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all
            ${
              active === t.id
                ? "bg-zinc-50 dark:bg-zinc-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            }`}
        >
          <t.icon className="w-4 h-4" />
          {t.label}
        </button>
      ))}
    </div>
  );
}


/* 3) CollapsibleSection */
function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-700 rounded bg-gray-800">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2 text-left text-gray-200 hover:bg-gray-700 transition"
      >
        <span className="font-semibold">{title}</span>
        <span className="text-gray-400">
          {open ? "▾" : "▸"}
        </span>
      </button>

      {open && (
        <div className="px-4 py-3 border-t border-gray-700 text-gray-300">
          {children}
        </div>
      )}
    </div>
  );
}


/* 4) Describe helpers */
function ColumnsTable({ columns }: { columns: any[] }) {
  return (
    <table className="w-full text-sm text-gray-300">
      <thead className="text-gray-400 border-b border-gray-700">
        <tr>
          <th className="py-1 text-left">Field</th>
          <th className="py-1 text-left">Type</th>
          <th className="py-1 text-left">Null</th>
          <th className="py-1 text-left">Key</th>
          <th className="py-1 text-left">Default</th>
          <th className="py-1 text-left">Extra</th>
        </tr>
      </thead>
      <tbody>
        {columns.map((col, i) => (
          <tr key={i} className="border-b border-gray-800 hover:bg-gray-700/40">
            <td className="py-1">{col.field}</td>
            <td className="py-1">{col.type}</td>
            <td className="py-1">{col.nullable ? "YES" : "NO"}</td>
            <td className="py-1">{col.key || "-"}</td>
            <td className="py-1">{col.default ?? "-"}</td>
            <td className="py-1">{col.extra || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function IndexesTable({ indexes }: { indexes: any[] }) {
  return (
    <table className="w-full text-sm text-gray-300">
      <thead className="text-gray-400 border-b border-gray-700">
        <tr>
          <th className="py-1 text-left">Name</th>
          <th className="py-1 text-left">Unique</th>
          <th className="py-1 text-left">Columns</th>
        </tr>
      </thead>
      <tbody>
        {indexes.map((idx, i) => (
          <tr key={i} className="border-b border-gray-800 hover:bg-gray-700/40">
            <td className="py-1">{idx.name}</td>
            <td className="py-1">{idx.unique ? "Yes" : "No"}</td>
            <td className="py-1">
              {idx.columns.map((c: any) => c.column).join(", ")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MetadataTable({ metadata }: { metadata: any }) {
  const rows = [
    ["Engine", metadata.engine],
    ["Rows", metadata.rows],
    ["Data Length", metadata.dataLength],
    ["Index Length", metadata.indexLength],
    ["Collation", metadata.collation],
    ["Created", metadata.createTime],
    ["Updated", metadata.updateTime ?? "-"],
    ["Comment", metadata.comment || "-"],
  ];

  return (
    <table className="w-full text-sm text-gray-300">
      <tbody>
        {rows.map(([label, value], i) => (
          <tr key={i} className="border-b border-gray-800 hover:bg-gray-700/40">
            <td className="py-1 font-medium text-gray-400">{label}</td>
            <td className="py-1">{String(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 text-xs bg-gray-700 text-gray-200 rounded border border-gray-600">
      {children}
    </span>
  );
}

function DescribeTab({
  table,
  describe,
}: {
  table: string | null;
  describe: any;
}) {
  const [open, setOpen] = useState({
    columns: true,
    indexes: false,
    metadata: false,
  });

  const toggle = (key: "columns" | "indexes" | "metadata") =>
    setOpen((s) => ({ ...s, [key]: !s[key] }));

  if (!table || !describe) {
    return (
      <div className="text-gray-400 p-4">
        Select a table from the Structure tab.
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Summary */}
      <div className="flex items-center gap-3 text-gray-200">
        <h2 className="text-xl font-semibold">{table}</h2>
        <Badge>{describe.columns.length} columns</Badge>
        <Badge>{describe.indexes.length} indexes</Badge>
        <Badge>{describe.metadata.engine}</Badge>
        <Badge>{describe.metadata.collation}</Badge>
      </div>

      {/* Sections */}
      <CollapsibleSection
        title="Columns"
        open={open.columns}
        onToggle={() => toggle("columns")}
      >
        <ColumnsTable columns={describe.columns} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Indexes"
        open={open.indexes}
        onToggle={() => toggle("indexes")}
      >
        <IndexesTable indexes={describe.indexes} />
      </CollapsibleSection>

      <CollapsibleSection
        title="Metadata"
        open={open.metadata}
        onToggle={() => toggle("metadata")}
      >
        <MetadataTable metadata={describe.metadata} />
      </CollapsibleSection>
    </div>
  );
}


/* 5) Structure helpers */
function DatabaseOverview({
  tables,
  firstTableDescribe,
}: {
  tables: string[];
  firstTableDescribe: any | null;
}) {
  if (!firstTableDescribe) {
    return (
      <div className="text-gray-400 text-sm">
        Load tables to see database overview.
      </div>
    );
  }

  const meta = firstTableDescribe.metadata;

  return (
    <div className="space-y-2 text-zinc-700 dark:text-zinc-300 text-sm">
      <div>
        <span className="text-gray-400">Tables:</span> {tables.length}
      </div>
      <div>
        <span className="text-gray-400">Engine:</span> {meta.engine}
      </div>
      <div>
        <span className="text-gray-400">Collation:</span> {meta.collation}
      </div>
      <div>
        <span className="text-gray-400">Created:</span>{" "}
        {meta.createTime || "-"}
      </div>
    </div>
  );
}

function StructureTab({
  tables,
  selectedTable,
  onSelectTable,
  firstTableDescribe,
}: {
  tables: string[];
  selectedTable: string | null;
  onSelectTable: (t: string) => void;
  firstTableDescribe: any | null;
}) {
  return (
    <div className="py-6 space-y-6">
      {/* Overview */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-white">Database Overview</h2>
        <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg p-4">
          <DatabaseOverview
            tables={tables}
            firstTableDescribe={firstTableDescribe}
          />
        </div>
      </div>

      {/* Tables */}
      <div>
        <h2 className="text-lg font-semibold mb-3 text-zinc-900 dark:text-white">Tables</h2>
        <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg p-4 max-h-80 overflow-y-auto">
          {tables.length === 0 && (
            <div className="text-zinc-500 dark:text-zinc-400 text-sm">No tables loaded.</div>
          )}

          <ul className="space-y-1">
            {tables.map((t) => (
              <li key={t}>
                <button
                  onClick={() => onSelectTable(t)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition font-medium
                    ${
                      selectedTable === t
                        ? "bg-blue-600 text-white"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                    }`}
                >
                  {t}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}


/* 6) Query tab */
function QueryTab({
  sql,
  setSql,
  onExecute,
  result,
}: {
  sql: string;
  setSql: (v: string) => void;
  onExecute: () => void;
  result: any;
}) {
  return (
    <div className="p-4 space-y-4 text-gray-200">
      {/* Editor */}
      <div>
        <h2 className="text-lg font-semibold mb-2">SQL Editor</h2>
        <div className="h-64 border border-gray-700 rounded overflow-hidden bg-gray-900">
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
      </div>

      {/* Execute button */}
      <button
        onClick={onExecute}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 transition text-white rounded"
      >
        Execute
      </button>

      {/* Result */}
      {result && (
        <div className="border border-gray-700 bg-gray-800 rounded p-4 overflow-auto">
          <h3 className="text-md font-semibold mb-2 text-gray-300">Result</h3>
          <pre className="text-sm text-gray-200 whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}



/* 7) MAIN COMPONENT */
export default function MySQLExplorerPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"structure" | "describe" | "query">(
    "structure"
  );

  const [status, setStatus] = useState<string | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [describeData, setDescribeData] = useState<any>(null);
  const [isRefreshingSchema, setIsRefreshingSchema] = useState(false);
  const [schemaStatus, setSchemaStatus] = useState<{age: number | null; needsRefresh: boolean} | null>(null);

  const [sql, setSql] = useState("");
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

  async function checkSchemaStatus() {
    try {
      const res = await fetch("/api/schema/status");
      const data = await res.json();
      setSchemaStatus({
        age: data.ageHours,
        needsRefresh: data.needsRefresh
      });
    } catch (error) {
      console.error("Failed to check schema status:", error);
    }
  }

  async function refreshSchema() {
    setIsRefreshingSchema(true);
    try {
      const res = await fetch("/api/schema/generate", { method: "POST" });
      const data = await res.json();
      
      if (data.success) {
        showToast({ type: "success", message: `Schema refreshed! ${data.data.tableCount} tables, ${data.data.totalColumns} columns` });
        await checkSchemaStatus();
      } else {
        showToast({ type: "error", message: `Schema refresh failed: ${data.error}` });
      }
    } catch (error) {
      showToast({ type: "error", message: `Schema refresh error: ${error}` });
    } finally {
      setIsRefreshingSchema(false);
    }
  }

  // Check schema status on mount
  useEffect(() => {
    checkSchemaStatus();
  }, []);

  async function describeTable(name: string) {
    setSelectedTable(name);
    setActiveTab("describe"); // auto-switch
    const res = await fetch(`/api/mcp/mysql/describe?table=${name}`);
    const data = await res.json();
    setDescribeData(data.describe || null);
  }

  async function executeQuery() {
    setActiveTab("query"); // auto-switch
    const res = await fetch("/api/mcp/mysql/query", {
      method: "POST",
      body: JSON.stringify({ sql }),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setQueryResult(data.result || data.error);
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* HEADER WITH ACTIONS */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">MySQL Explorer</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              Browse tables, run queries, and explore your database
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={ping}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white rounded-lg font-medium shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Test Connection
            </button>
            <button
              onClick={loadTables}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 transition text-white rounded-lg font-medium shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              Load Tables
            </button>
            <button
              onClick={refreshSchema}
              disabled={isRefreshingSchema}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm transition ${
                schemaStatus?.needsRefresh
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title={schemaStatus?.age ? `Schema is ${Math.floor(schemaStatus.age / 24)} days old` : "Refresh schema cache"}
            >
              <svg className={`h-4 w-4 ${isRefreshingSchema ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRefreshingSchema ? "Refreshing..." : "Refresh Schema"}
            </button>
            {status && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {status}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MAIN PANEL */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <Tabs active={activeTab} onChange={setActiveTab} />

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "structure" && (
            <StructureTab
              tables={tables}
              selectedTable={selectedTable}
              onSelectTable={describeTable}
              firstTableDescribe={describeData}
            />
          )}

          {activeTab === "describe" && (
            <DescribeTab table={selectedTable} describe={describeData} />
          )}

          {activeTab === "query" && (
            <QueryTab
              sql={sql}
              setSql={setSql}
              onExecute={executeQuery}
              result={queryResult}
            />
          )}
        </div>
      </div>
    </div>
  );
}
