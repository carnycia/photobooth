"use client";

import React from "react";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-neutral-900/90 text-white text-sm font-medium backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>{message}</span>
      </div>
    </div>
  );
}
