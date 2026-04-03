"use client";

import { useEffect, useState } from "react";

interface ConnectionStatusProps {
  type: "mysql" | "api" | "system";
  endpoint?: string;
  compact?: boolean;
}

type Status = "connected" | "disconnected" | "checking" | "error";

export default function ConnectionStatus({ 
  type, 
  endpoint = "/api/health",
  compact = false 
}: ConnectionStatusProps) {
  const [status, setStatus] = useState<Status>("checking");
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setStatus("checking");
        
        // Different endpoints based on type
        const url = type === "mysql" 
          ? "/api/mcp/mysql/ping" 
          : endpoint;
        
        const response = await fetch(url);
        
        if (response.ok) {
          setStatus("connected");
        } else {
          setStatus("error");
        }
        
        setLastCheck(new Date());
      } catch (error) {
        setStatus("disconnected");
        setLastCheck(new Date());
      }
    };

    // Initial check
    checkConnection();

    // Poll every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, [type, endpoint]);

  const getStatusConfig = () => {
    switch (status) {
      case "connected":
        return {
          color: "bg-green-500",
          text: "Connected",
          icon: "✓",
          pulse: true,
        };
      case "disconnected":
        return {
          color: "bg-red-500",
          text: "Disconnected",
          icon: "✕",
          pulse: false,
        };
      case "error":
        return {
          color: "bg-yellow-500",
          text: "Error",
          icon: "⚠",
          pulse: false,
        };
      case "checking":
        return {
          color: "bg-blue-500",
          text: "Checking...",
          icon: "◌",
          pulse: true,
        };
    }
  };

  const config = getStatusConfig();
  const typeLabel = type === "mysql" ? "MySQL" : type === "api" ? "API" : "System";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className={`h-2 w-2 rounded-full ${config.color} ${config.pulse ? "animate-pulse" : ""}`} />
        <span className="text-xs text-zinc-600 dark:text-zinc-400">{typeLabel}</span>
      </div>
    );
  }

  return (
    <div className="group relative flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 transition-all hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600">
      {/* Status indicator */}
      <div className="relative flex items-center justify-center">
        <div className={`h-3 w-3 rounded-full ${config.color} ${config.pulse ? "animate-pulse" : ""}`} />
        {config.pulse && (
          <div className={`absolute h-3 w-3 animate-ping rounded-full ${config.color} opacity-75`} />
        )}
      </div>

      {/* Labels */}
      <div className="flex-1">
        <div className="text-xs font-medium text-zinc-900 dark:text-white">
          {typeLabel}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {config.text}
        </div>
      </div>

      {/* Tooltip on hover */}
      <div className="pointer-events-none absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 dark:bg-zinc-700">
        Last checked: {lastCheck.toLocaleTimeString()}
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-zinc-900 dark:bg-zinc-700" />
      </div>
    </div>
  );
}
