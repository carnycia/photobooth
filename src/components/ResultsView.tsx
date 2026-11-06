"use client";

import React from "react";
import { StripFilter } from "@/lib/photostrip";

interface ResultsViewProps {
  stripUrl: string | null;
  activeFilter: StripFilter;
  isGenerating: boolean;
  onFilterChange: (filter: StripFilter) => void;
  onSave: () => void;
  onRetake: () => void;
}

export function ResultsView({
  stripUrl,
  activeFilter,
  isGenerating,
  onFilterChange,
  onSave,
  onRetake,
}: ResultsViewProps) {
  const filters: { id: StripFilter; label: string }[] = [
    { id: "normal", label: "Color" },
    { id: "bw", label: "B & W" },
    { id: "sepia", label: "Sepia" },
    { id: "vintage", label: "Vintage" },
    { id: "cool", label: "Cool" },
  ];

  return (
    <div className="relative w-full h-full min-h-screen bg-neutral-950 text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header */}
      <div className="relative z-20 w-full pt-safe px-6 flex items-center justify-between pb-3 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onRetake}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retake
        </button>

        <h2 className="text-sm font-semibold tracking-wider uppercase text-neutral-300">
          Your Photo Strip
        </h2>

        {/* Small badge or placeholder */}
        <div className="w-14 text-right">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/70">
            4 SHOTS
          </span>
        </div>
      </div>

      {/* Main Strip Display Area (scrollable on small screens) */}
      <div className="relative z-10 flex-1 w-full overflow-y-auto px-4 py-2 flex flex-col items-center justify-center">
        {isGenerating || !stripUrl ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-neutral-400 text-sm font-medium tracking-wide">
              Developing photo strip...
            </p>
          </div>
        ) : (
          <div className="relative max-h-[62vh] sm:max-h-[68vh] transition-transform duration-300 hover:scale-[1.01]">
            <img
              src={stripUrl}
              alt="Photo Booth Strip"
              className="h-full max-h-[62vh] sm:max-h-[68vh] w-auto object-contain rounded-md shadow-2xl shadow-black/90 ring-1 ring-white/15"
            />
          </div>
        )}

        {/* Filter Pills */}
        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900/90 border border-white/10 backdrop-blur-xl shadow-lg">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                activeFilter === f.id
                  ? "bg-white text-black shadow-sm"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="relative z-20 w-full pb-safe px-6 pt-3 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {/* Retake Button */}
          <button
            onClick={onRetake}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-neutral-800/90 text-neutral-200 font-semibold text-sm hover:text-white border border-white/10 active:scale-98 transition-transform flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retake
          </button>

          {/* Primary Save Button */}
          <button
            onClick={onSave}
            disabled={!stripUrl || isGenerating}
            className="flex-2 py-3.5 px-6 rounded-2xl bg-white text-black font-semibold text-sm shadow-xl shadow-white/10 active:scale-98 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V3m0 0l-3.5 3.5M12 3l3.5 3.5" />
            </svg>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
