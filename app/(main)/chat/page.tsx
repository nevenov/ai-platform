"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useToast } from "@/components/ToastContext";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Schema status
  const [schemaAge, setSchemaAge] = useState<number | null>(null);
  const [showSchemaWarning, setShowSchemaWarning] = useState(false);

  // Session management
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [sessions, setSessions] = useState<{ id: string; title: string; created: string }[]>([]);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const [showSessionPicker, setShowSessionPicker] = useState(false);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check schema age on mount
  useEffect(() => {
    async function checkSchema() {
      try {
        const res = await fetch("/api/schema/status");
        const data = await res.json();
        
        if (data.ageHours !== null) {
          setSchemaAge(data.ageHours);
          setShowSchemaWarning(data.needsRefresh);
        }
      } catch (error) {
        console.error("Failed to check schema status:", error);
      }
    }
    checkSchema();
  }, []);

  // Load sessions list on mount
  useEffect(() => {
    async function loadSessions() {
      try {
        const res = await fetch("/api/sessions");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setSessions(data.slice(0, 20)); // Show last 20 sessions
        }
      } catch (error) {
        console.error("Failed to load sessions:", error);
      }
    }
    loadSessions();
  }, []);

  // Auto-save session before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (messages.length > 0) {
        // Save session using navigator.sendBeacon for reliability
        const sessionData = JSON.stringify({
          sessionId: currentSessionId,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
          })),
        });
        
        const blob = new Blob([sessionData], { type: 'application/json' });
        navigator.sendBeacon('/api/sessions', blob);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [messages, currentSessionId]);

  // Auto-submit query from URL parameter
  useEffect(() => {
    const query = searchParams.get("q");
    if (query && !isLoading && messages.length === 0) {
      setInput(query);
      // Auto-submit after a small delay to ensure input is set
      setTimeout(() => {
        const form = document.querySelector("form");
        if (form) {
          form.requestSubmit();
        }
      }, 100);
    }
  }, [searchParams, isLoading, messages.length]);

  // Refresh schema
  const refreshSchema = async () => {
    try {
      const res = await fetch("/api/schema/generate", { method: "POST" });
      const data = await res.json();
      
      if (res.ok) {
        setSchemaAge(0);
        setShowSchemaWarning(false);
        showToast({ type: "success", message: `Schema refreshed! ${data.tables} tables, ${data.totalColumns} columns` });
      } else {
        showToast({ type: "error", message: `Schema refresh failed: ${data.error}` });
      }
    } catch (error) {
      showToast({ type: "error", message: "Network error while refreshing schema" });
      console.error(error);
    }
  };

  // Load a previous session
  const loadSession = async (sessionId: string) => {
    setIsLoadingSession(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();
      
      if (res.ok && Array.isArray(data.messages)) {
        // Convert messages to expected format
        const loadedMessages: Message[] = data.messages.map((msg: { role: string; content: string; timestamp?: string }, index: number) => ({
          id: `${Date.now()}-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp || Date.now()),
        }));
        
        setMessages(loadedMessages);
        setCurrentSessionId(sessionId);
        setLastSaved(new Date());
        setShowSessionPicker(false);
        showToast({ type: "success", message: `Loaded session: "${data.title}"` });
      } else {
        showToast({ type: "error", message: `Failed to load session: ${data.error || "Unknown error"}` });
      }
    } catch (error) {
      showToast({ type: "error", message: "Network error while loading session" });
      console.error(error);
    } finally {
      setIsLoadingSession(false);
    }
  };

  // Start a new chat session
  const newChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setLastSaved(null);
    setInput("");
    showToast({ type: "info", message: "Started new chat" });
  };

  // Auto-save current session
  const saveSession = useCallback(async () => {
    if (messages.length === 0) {
      return;
    }

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId, // Include existing session ID if available
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp.toISOString(),
          })),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Set session ID if this was the first save
        if (!currentSessionId) {
          setCurrentSessionId(data.sessionId);
        }
        
        setLastSaved(new Date());
        
        // Refresh sessions list
        const refreshRes = await fetch("/api/sessions");
        const refreshData = await refreshRes.json();
        if (Array.isArray(refreshData)) {
          setSessions(refreshData.slice(0, 20));
        }
      }
    } catch (error) {
      console.error("Auto-save error:", error);
    }
  }, [messages, currentSessionId]);

  // Auto-save session periodically (30 seconds after last change)
  useEffect(() => {
    if (messages.length === 0) return;

    const timeout = setTimeout(() => {
      saveSession();
    }, 30000); // 30 seconds

    return () => clearTimeout(timeout);
  }, [messages, saveSession]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          history: messages,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message || data.response || "No response",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Error handling
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${data.error || "Failed to get response"}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Network error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-4 py-6">
          {/* Schema Age Warning */}
          {showSchemaWarning && schemaAge !== null && (
            <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-md dark:border-amber-700 dark:bg-amber-950">
              <div className="flex items-start gap-3">
                <div className="text-2xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="mb-1 font-semibold text-amber-900 dark:text-amber-100">
                    Schema Cache Outdated
                  </h3>
                  <p className="mb-3 text-sm text-amber-800 dark:text-amber-200">
                    Database schema is {Math.floor(schemaAge / 24)} days old. 
                    Refresh recommended for accurate AI responses.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={refreshSchema}
                      className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-700"
                    >
                      🔄 Refresh Now
                    </button>
                    <button
                      onClick={() => setShowSchemaWarning(false)}
                      className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 shadow-sm transition hover:bg-amber-50 dark:border-amber-700 dark:bg-zinc-900 dark:text-amber-100 dark:hover:bg-zinc-800"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="mb-4 text-6xl">💬</div>
                  <h2 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                    Start a conversation
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Type a message below to begin chatting with AI
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                          : "bg-white text-zinc-900 shadow-md dark:bg-zinc-800 dark:text-zinc-50"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              // Table styling
                              table: ({ ...props }) => (
                                <div className="my-4 overflow-x-auto">
                                  <table
                                    className="min-w-full divide-y divide-zinc-200 rounded-lg border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700"
                                    {...props}
                                  />
                                </div>
                              ),
                              thead: ({ ...props }) => (
                                <thead className="bg-zinc-50 dark:bg-zinc-900" {...props} />
                              ),
                              tbody: ({ ...props }) => (
                                <tbody className="divide-y divide-zinc-200 bg-white dark:divide-zinc-700 dark:bg-zinc-800" {...props} />
                              ),
                              tr: ({ ...props }) => (
                                <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50" {...props} />
                              ),
                              th: ({ ...props }) => (
                                <th
                                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300"
                                  {...props}
                                />
                              ),
                              td: ({ ...props }) => (
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100" {...props} />
                              ),
                              // Headings
                              h1: ({ ...props }) => (
                                <h1 className="mb-4 mt-6 text-2xl font-bold text-zinc-900 dark:text-zinc-50" {...props} />
                              ),
                              h2: ({ ...props }) => (
                                <h2 className="mb-3 mt-5 text-xl font-bold text-zinc-900 dark:text-zinc-50" {...props} />
                              ),
                              h3: ({ ...props }) => (
                                <h3 className="mb-2 mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50" {...props} />
                              ),
                              // Paragraphs & Lists
                              p: ({ ...props }) => (
                                <p className="mb-3 leading-relaxed text-zinc-900 dark:text-zinc-50" {...props} />
                              ),
                              ul: ({ ...props }) => (
                                <ul className="mb-3 ml-5 list-disc space-y-1 text-zinc-900 dark:text-zinc-50" {...props} />
                              ),
                              ol: ({ ...props }) => (
                                <ol className="mb-3 ml-5 list-decimal space-y-1 text-zinc-900 dark:text-zinc-50" {...props} />
                              ),
                              li: ({ ...props }) => (
                                <li className="text-zinc-900 dark:text-zinc-50" {...props} />
                              ),
                              // Code blocks
                              code: ({ inline, children, ...props }: { inline?: boolean; children?: React.ReactNode }) =>
                                inline ? (
                                  <code
                                    className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <code
                                    className="block rounded-lg bg-zinc-100 p-4 font-mono text-sm text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                ),
                              pre: ({ ...props }) => (
                                <pre className="my-4 overflow-x-auto rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900" {...props} />
                              ),
                              // Links
                              a: ({ ...props }) => (
                                <a
                                  className="text-blue-600 underline hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  {...props}
                                />
                              ),
                              // Strong & Emphasis
                              strong: ({ ...props }) => (
                                <strong className="font-bold text-zinc-900 dark:text-zinc-50" {...props} />
                              ),
                              em: ({ ...props }) => (
                                <em className="italic text-zinc-900 dark:text-zinc-50" {...props} />
                              ),
                              // Blockquote
                              blockquote: ({ ...props }) => (
                                <blockquote
                                  className="my-4 border-l-4 border-zinc-300 pl-4 italic text-zinc-700 dark:border-zinc-600 dark:text-zinc-300"
                                  {...props}
                                />
                              ),
                              // Horizontal rule
                              hr: ({ ...props }) => (
                                <hr className="my-6 border-zinc-200 dark:border-zinc-700" {...props} />
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                          {message.content}
                        </p>
                      )}
                      <span
                        className={`mt-1 block text-xs ${
                          message.role === "user"
                            ? "text-blue-100"
                            : "text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl bg-white px-4 py-3 shadow-md dark:bg-zinc-800">
                      <div className="flex items-center space-x-2">
                        <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                        <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Form */}
        <div className="border-t border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          {/* Session Management */}
          {(sessions.length > 0 || messages.length > 0) && (
            <div className="mx-auto mb-3 max-w-4xl">
              <div className="flex gap-2">
                {/* Load Session Picker */}
                {sessions.length > 0 && (
                  <div className="flex-1">
                    <button
                      onClick={() => setShowSessionPicker(!showSessionPicker)}
                      className="flex w-full items-center justify-between rounded-lg border border-zinc-300 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    >
                      <span className="flex items-center gap-2">
                        📁 Load Previous Session
                        {isLoadingSession && (
                          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        )}
                      </span>
                      <svg
                        className={`h-5 w-5 transition-transform ${showSessionPicker ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}

                {/* New Chat Button */}
                {messages.length > 0 && (
                  <button
                    onClick={newChat}
                    className="flex items-center gap-2 rounded-lg border border-zinc-300 bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-blue-600 hover:to-cyan-600"
                  >
                    ✨ New Chat
                  </button>
                )}
              </div>

              {/* Last Saved Indicator */}
              {lastSaved && (
                <div className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  Auto-saved {Math.floor((Date.now() - lastSaved.getTime()) / 1000)}s ago
                </div>
              )}

              {/* Session Picker Dropdown */}
              {showSessionPicker && sessions.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-zinc-300 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                    {sessions.map((session) => (
                      <button
                        key={session.id}
                        onClick={() => loadSession(session.id)}
                        disabled={isLoadingSession}
                        className="flex w-full items-start gap-3 border-b border-zinc-200 px-4 py-3 text-left transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
                      >
                        <div className="text-xl">💬</div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium text-zinc-900 dark:text-zinc-100">
                            {session.title}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {new Date(session.created).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-4xl items-end gap-3"
          >
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              rows={1}
              className="block w-full resize-none rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-500"
              style={{
                minHeight: "48px",
                maxHeight: "200px",
              }}
            />
          </div>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <svg
                className="h-5 w-5 animate-spin"
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
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </form>
        <p className="mx-auto mt-2 max-w-4xl text-center text-xs text-zinc-500 dark:text-zinc-400">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
