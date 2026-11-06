"use client";

import React, { useState } from "react";

interface PermissionDeniedViewProps {
  onRetry: () => void;
  onUseDemo: () => void;
  errorType?: "denied" | "not_found" | "error" | null;
}

export function PermissionDeniedView({
  onRetry,
  onUseDemo,
  errorType,
}: PermissionDeniedViewProps) {
  const [activeTab, setActiveTab] = useState<"ios" | "chrome">("ios");

  return (
    <main className="relative flex flex-col items-center justify-between w-full h-full min-h-screen px-6 py-safe bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-white select-none overflow-y-auto">
      {/* Top Header */}
      <header className="w-full max-w-md pt-8 flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-neutral-800/80 border border-white/10 flex items-center justify-center shadow-xl">
            <svg
              className="w-10 h-10 text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
              <line
                x1="3"
                y1="3"
                x2="21"
                y2="21"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-black text-xs font-bold">
            !
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          {errorType === "not_found"
            ? "No Camera Found"
            : "Camera Access Required"}
        </h1>
        <p className="text-sm text-neutral-400 leading-relaxed max-w-xs">
          Photo Booth needs camera permission to capture your photo strip. Here&apos;s
          how to turn it on:
        </p>
      </header>

      {/* Guide Tabs */}
      <section aria-label="Camera instructions" className="w-full max-w-md my-6">
        <div className="flex bg-neutral-800/60 p-1 rounded-xl mb-4 border border-white/5">
          <button
            onClick={() => setActiveTab("ios")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "ios"
                ? "bg-white text-black shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            iPhone (Safari)
          </button>
          <button
            onClick={() => setActiveTab("chrome")}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "chrome"
                ? "bg-white text-black shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Chrome / Laptop
          </button>
        </div>

        {activeTab === "ios" ? (
          <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
                1
              </span>
              <p className="text-xs text-neutral-300 leading-normal">
                Tap the <strong className="text-white font-semibold">aA</strong> icon or lock icon on the left side of Safari&apos;s address bar.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
                2
              </span>
              <p className="text-xs text-neutral-300 leading-normal">
                Select <strong className="text-white font-semibold">Website Settings</strong> from the popup menu.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
                3
              </span>
              <p className="text-xs text-neutral-300 leading-normal">
                Find <strong className="text-white font-semibold">Camera</strong> and switch it to <strong className="text-emerald-400 font-semibold">Allow</strong>.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-900/80 border border-white/10 rounded-2xl p-5 space-y-4 text-left">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
                1
              </span>
              <p className="text-xs text-neutral-300 leading-normal">
                Click the <strong className="text-white font-semibold">tune / lock</strong> icon next to the URL in your browser&apos;s address bar.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
                2
              </span>
              <p className="text-xs text-neutral-300 leading-normal">
                Toggle <strong className="text-white font-semibold">Camera</strong> to <strong className="text-emerald-400 font-semibold">On / Allow</strong>.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
                3
              </span>
              <p className="text-xs text-neutral-300 leading-normal">
                Tap <strong className="text-white font-semibold">Try Again</strong> below to reload the camera feed.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <footer className="w-full max-w-md pb-6 flex flex-col gap-3">
        <button
          onClick={onRetry}
          className="w-full py-3.5 px-6 rounded-2xl bg-white text-black font-semibold text-base shadow-lg shadow-white/10 active:scale-98 transition-transform flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>

        <button
          onClick={onUseDemo}
          className="w-full py-3 px-6 rounded-2xl bg-neutral-800/80 text-neutral-300 font-medium text-sm hover:text-white border border-white/5 active:scale-98 transition-transform"
        >
          Use Demo Camera (Simulated)
        </button>
      </footer>
    </main>
  );
}
