"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import ConnectionStatus from "./ConnectionStatus";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const [dataToolsOpen, setDataToolsOpen] = useState(true);

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "AI Chat",
      href: "/chat",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-500",
    },
    {
      name: "Data Tools",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
        </svg>
      ),
      gradient: "from-green-500 to-emerald-500",
      children: [
        { name: "MySQL Explorer", href: "/mysql-explorer" },
        { name: "MySQL Config", href: "/modules/mysql" },
      ],
    },
    {
      name: "Modules",
      href: "/modules",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group fixed left-4 top-4 z-50 overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-3 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl lg:hidden"
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        
        <svg className="relative h-6 w-6 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform border-r border-zinc-200 bg-white transition-transform dark:border-zinc-800 dark:bg-zinc-900 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6 dark:border-zinc-800">
            <Link href="/dashboard" className="group flex items-center gap-2.5 transition-all duration-200 hover:scale-105">
              <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg transition-all duration-200 group-hover:shadow-xl">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                
                <svg className="relative h-5 w-5 text-white transition-transform duration-200 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <span className="block text-base font-bold text-zinc-900 dark:text-white">
                  SimpleAI
                </span>
                <span className="block text-xs text-zinc-500 dark:text-zinc-400">
                  WebAdmin
                </span>
              </div>
            </Link>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

              if (item.children) {
                const hasActiveChild = item.children.some(child => pathname === child.href);
                
                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => setDataToolsOpen(!dataToolsOpen)}
                      className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        hasActiveChild
                          ? "text-zinc-900 dark:text-white"
                          : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                      }`}
                    >
                      {/* Gradient background on hover */}
                      <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${item.gradient} opacity-0 transition-opacity duration-200 group-hover:opacity-10`} />
                      
                      {/* Active accent line */}
                      {hasActiveChild && (
                        <div className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b ${item.gradient}`} />
                      )}
                      
                      <div className="relative">{item.icon}</div>
                      <span className="relative flex-1 text-left">{item.name}</span>
                      
                      {/* Dropdown arrow */}
                      <svg
                        className={`relative h-4 w-4 transition-transform duration-200 ${
                          dataToolsOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {/* Dropdown items */}
                    {dataToolsOpen && (
                      <div className="ml-6 space-y-1 overflow-hidden">
                        {item.children.map((child) => {
                          const isChildActive = pathname === child.href;
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`group relative block rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                                isChildActive
                                  ? "font-medium text-zinc-900 dark:text-white"
                                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                              }`}
                            >
                              {/* Gradient background on hover/active */}
                              <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${item.gradient} opacity-0 transition-opacity duration-200 ${
                                isChildActive ? "opacity-10" : "group-hover:opacity-10"
                              }`} />
                              
                              {/* Active indicator dot */}
                              {isChildActive && (
                                <div className={`absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b ${item.gradient}`} />
                              )}
                              
                              <span className="relative">{child.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-zinc-900 dark:text-white"
                      : "text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
                  }`}
                >
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-r ${item.gradient} opacity-0 transition-opacity duration-200 ${
                    isActive ? "opacity-10" : "group-hover:opacity-10"
                  }`} />
                  
                  {/* Active accent line */}
                  {isActive && (
                    <div className={`absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b ${item.gradient}`} />
                  )}
                  
                  <div className="relative">{item.icon}</div>
                  <span className="relative">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-3 transition-all duration-200 hover:border-zinc-300 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-900 dark:hover:border-zinc-600">
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 text-sm font-bold text-white shadow-lg">
                  AI
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">
                    AI Platform
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>v1.0.0</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span>Operational</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Connection indicators */}
              <div className="relative mt-3 flex items-center gap-3 border-t border-zinc-200/50 pt-3 dark:border-zinc-700/50">
                <ConnectionStatus type="mysql" compact />
                <ConnectionStatus type="api" compact />
              </div>
              
              {/* Progress indicator */}
              <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div className="absolute inset-y-0 left-0 w-3/5 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 shadow-sm" />
              </div>
              <div className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                60% Setup Complete
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
