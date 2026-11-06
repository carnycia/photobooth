"use client";

import React from "react";
import { StripFilter } from "@/lib/photostrip";

interface ResultsViewProps {
  stripUrl: string | null;
  activeFilter: StripFilter;
  isGenerating: boolean;
  galleryCount?: number;
  onFilterChange: (filter: StripFilter) => void;
  onSave: () => void;
  onRetake: () => void;
  onRetakeSinglePhoto: (index: number) => void;
  onOpenGallery: () => void;
}

export function ResultsView({
  stripUrl,
  activeFilter,
  isGenerating,
  galleryCount = 0,
  onFilterChange,
  onSave,
  onRetake,
  onRetakeSinglePhoto,
  onOpenGallery,
}: ResultsViewProps) {
  const filters: { id: StripFilter; label: string }[] = [
    { id: "normal", label: "Color" },
    { id: "bw", label: "B & W" },
    { id: "sepia", label: "Sepia" },
    { id: "vintage", label: "Vintage" },
    { id: "cool", label: "Cool" },
  ];

  // Calculated coordinates of the 4 photos inside the vertical strip
  const photoSlots = [
    { index: 0, top: "1.72%", height: "21.41%" },
    { index: 1, top: "24.17%", height: "21.41%" },
    { index: 2, top: "46.62%", height: "21.41%" },
    { index: 3, top: "69.07%", height: "21.41%" },
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
          Retake All
        </button>

        <h2 className="text-sm font-semibold tracking-wider uppercase text-neutral-300">
          Your Photo Strip
        </h2>

        {/* Gallery button shortcut */}
        <button
          onClick={onOpenGallery}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold backdrop-blur-md active:scale-95 transition-all"
        >
          <span>🎞️</span>
          <span>Gallery</span>
          {galleryCount > 0 && (
            <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-white text-black text-[10px] font-bold">
              {galleryCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Strip Display Area (scrollable on small screens) */}
      <div className="relative z-10 flex-1 w-full overflow-y-auto px-4 py-1 flex flex-col items-center justify-center">
        {isGenerating || !stripUrl ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="text-neutral-400 text-sm font-medium tracking-wide">
              Developing photo strip...
            </p>
          </div>
        ) : (
          <div className="relative inline-block max-h-[52vh] sm:max-h-[58vh] w-auto">
            {/* The high-res rendered photo strip image */}
            <img
              src={stripUrl}
              alt="Photo Booth Strip"
              className="h-full max-h-[52vh] sm:max-h-[58vh] w-auto object-contain rounded-md shadow-2xl shadow-black/90 ring-1 ring-white/15"
            />

            {/* Interactive Hitbox Targets over each of the 4 photos */}
            {photoSlots.map((slot) => (
              <button
                key={slot.index}
                onClick={() => onRetakeSinglePhoto(slot.index)}
                aria-label={`Tap to retake photo ${slot.index + 1}`}
                style={{
                  top: slot.top,
                  height: slot.height,
                  left: "5.18%",
                  width: "89.64%",
                }}
                className="group absolute rounded border border-transparent hover:border-amber-400/90 active:border-amber-400 active:bg-black/40 hover:bg-black/25 transition-all flex items-center justify-center cursor-pointer"
              >
                {/* Visual hover / active badge */}
                <span className="opacity-0 group-hover:opacity-100 group-active:opacity-100 px-3 py-1.5 rounded-full bg-black/90 text-amber-300 text-xs font-bold tracking-wide backdrop-blur-md border border-amber-400/60 shadow-xl flex items-center gap-1.5 transition-opacity">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retake Shot {slot.index + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Friendly instruction helper */}
        <p className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5 mt-2">
          <span>📸</span>
          <span>Tap any photo above to retake just that shot</span>
        </p>

        {/* Quick-tap shot selectors */}
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold mr-0.5">
            Retake:
          </span>
          {[0, 1, 2, 3].map((idx) => (
            <button
              key={idx}
              onClick={() => onRetakeSinglePhoto(idx)}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-amber-500/20 text-neutral-300 hover:text-amber-300 border border-white/10 hover:border-amber-400/40 text-[11px] font-semibold transition-all active:scale-95"
            >
              Shot {idx + 1}
            </button>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="mt-2.5 flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900/90 border border-white/10 backdrop-blur-xl shadow-lg">
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
          {/* Retake All Button */}
          <button
            onClick={onRetake}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-neutral-800/90 text-neutral-200 font-semibold text-sm hover:text-white border border-white/10 active:scale-98 transition-transform flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retake All
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
