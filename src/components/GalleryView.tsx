"use client";

import React, { useState } from "react";
import { SavedStrip } from "@/lib/gallery-db";

interface GalleryViewProps {
  strips: SavedStrip[];
  onBackToCamera: () => void;
  onDeleteStrip: (id: string) => void;
  onClearAll: () => void;
  onShareStrip: (stripUrl: string) => void;
}

export function GalleryView({
  strips,
  onBackToCamera,
  onDeleteStrip,
  onClearAll,
  onShareStrip,
}: GalleryViewProps) {
  const [selectedStrip, setSelectedStrip] = useState<SavedStrip | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const m = months[d.getMonth()];
    const day = d.getDate();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${m} ${day} • ${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-black text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header */}
      <header className="relative z-20 w-full pt-safe px-5 flex items-center justify-between pb-3 bg-gradient-to-b from-black via-black/90 to-transparent border-b border-white/5">
        <button
          onClick={onBackToCamera}
          className="flex items-center gap-1.5 text-neutral-300 hover:text-white text-sm font-semibold active:scale-95 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Camera
        </button>

        <div className="flex flex-col items-center">
          <h1 className="text-sm font-bold tracking-wider uppercase text-white">
            Strip Gallery
          </h1>
          <span className="text-[10px] font-medium text-neutral-400">
            {strips.length} {strips.length === 1 ? "Strip" : "Strips"} Saved
          </span>
        </div>

        {strips.length > 0 ? (
          <button
            onClick={() => setConfirmClear(true)}
            className="text-xs font-semibold text-red-400/90 hover:text-red-400 active:scale-95 transition-all"
          >
            Clear
          </button>
        ) : (
          <div className="w-10" />
        )}
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full overflow-y-auto px-4 py-4">
        {strips.length === 0 ? (
          <div className="h-full min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 rounded-3xl bg-neutral-900 border border-white/10 flex items-center justify-center mb-5 shadow-2xl shadow-black">
              <span className="text-3xl">🎞️</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No Photo Strips Yet</h2>
            <p className="text-sm text-neutral-400 max-w-xs mb-6 leading-relaxed">
              Every 4-shot photo booth strip you take will automatically be saved right here in your gallery.
            </p>
            <button
              onClick={onBackToCamera}
              className="py-3 px-6 rounded-2xl bg-white text-black font-semibold text-sm shadow-xl active:scale-98 transition-transform flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Take First Strip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-12">
            {strips.map((strip) => (
              <div
                key={strip.id}
                onClick={() => setSelectedStrip(strip)}
                className="group relative flex flex-col items-center p-2 rounded-2xl bg-neutral-900/70 border border-white/10 hover:border-white/30 transition-all duration-200 cursor-pointer shadow-xl active:scale-97"
              >
                {/* Strip Image Card */}
                <div className="w-full aspect-[1/3] max-h-[340px] overflow-hidden rounded-xl bg-neutral-950 flex items-center justify-center p-1.5 ring-1 ring-white/5">
                  <img
                    src={strip.stripUrl}
                    alt={`Photo Strip from ${formatDate(strip.createdAt)}`}
                    className="w-full h-full object-contain rounded drop-shadow-md group-hover:scale-[1.02] transition-transform duration-200"
                    loading="lazy"
                  />
                </div>

                {/* Date & Filter Badge */}
                <div className="w-full mt-2 flex items-center justify-between px-1">
                  <span className="text-[11px] font-semibold text-neutral-300 truncate">
                    {formatDate(strip.createdAt)}
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-neutral-400">
                    {strip.filter || "Color"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Full-Screen Strip Detail Modal */}
      {selectedStrip && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between animate-in fade-in duration-200">
          {/* Modal Header */}
          <div className="w-full pt-safe px-6 flex items-center justify-between pb-3 bg-gradient-to-b from-black to-transparent">
            <span className="text-xs font-semibold text-neutral-400">
              {formatDate(selectedStrip.createdAt)}
            </span>

            <button
              onClick={() => setSelectedStrip(null)}
              className="w-8 h-8 rounded-full bg-neutral-800 text-white flex items-center justify-center active:scale-95 transition-all"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Image View */}
          <div className="flex-1 w-full overflow-y-auto px-4 py-2 flex items-center justify-center">
            <img
              src={selectedStrip.stripUrl}
              alt="Full-size Photo Strip"
              className="max-h-[72vh] w-auto object-contain rounded-md shadow-2xl shadow-black ring-1 ring-white/20"
            />
          </div>

          {/* Modal Action Bar */}
          <div className="w-full pb-safe px-6 pt-3 bg-gradient-to-t from-black via-black/90 to-transparent">
            <div className="max-w-md mx-auto flex items-center gap-3">
              {/* Delete Button */}
              <button
                onClick={() => {
                  onDeleteStrip(selectedStrip.id);
                  setSelectedStrip(null);
                }}
                className="py-3 px-4 rounded-2xl bg-red-500/15 text-red-400 border border-red-500/30 text-xs font-semibold active:scale-95 transition-transform flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>

              {/* Share / Save Button */}
              <button
                onClick={() => onShareStrip(selectedStrip.stripUrl)}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-white text-black font-semibold text-sm shadow-xl shadow-white/10 active:scale-98 transition-transform flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V3m0 0l-3.5 3.5M12 3l3.5 3.5" />
                </svg>
                Save / Share Strip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-150">
          <div className="w-full max-w-xs rounded-2xl bg-neutral-900 border border-white/10 p-5 text-center shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Clear All Photo Strips?</h3>
            <p className="text-xs text-neutral-400 mb-5">
              This will permanently delete all {strips.length} saved strips from your device gallery.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 text-neutral-300 text-xs font-semibold active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearAll();
                  setConfirmClear(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold shadow-lg shadow-red-600/30 active:scale-95 transition-all"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
