"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
