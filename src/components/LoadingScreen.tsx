"use client";

import React, { useState, useEffect, useCallback } from "react";
import { unlockAudio, playSprayCanShake, triggerHapticVibration } from "@/lib/sounds";

interface LoadingScreenProps {
  onComplete?: () => void;
  onUseDemo?: () => void;
  hasPermission: boolean | null;
  message?: string;
}

export function LoadingScreen({
  onComplete,
  onUseDemo,
  hasPermission,
  message,
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState("CALIBRATING CONVEX MIRRORS...");
  const [isReady, setIsReady] = useState(false);
  const [showDemoOption, setShowDemoOption] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Progressive calibration stages
  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(50);
      setStatusText("WARMING UP NEON FLASH...");
    }, 350);

    const t2 = setTimeout(() => {
      setProgress(85);
      setStatusText("TUNING FISHEYE LENSES...");
    }, 700);

    const t3 = setTimeout(() => {
      setProgress(100);
      setStatusText("STUDIO READY • PRESS ENTER");
      setIsReady(true);
    }, 1100);

    // If on a device without camera or if camera takes long, show demo switch
    const tDemo = setTimeout(() => {
      setShowDemoOption(true);
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tDemo);
    };
  }, []);

  // Update status when permission changes
  useEffect(() => {
    if (hasPermission === true) {
      setProgress(100);
      setStatusText("CAMERA CONNECTED • PRESS ENTER");
      setIsReady(true);
    } else if (hasPermission === false) {
      setStatusText("CAMERA PERMISSION NEEDED");
      setIsReady(true);
    }
  }, [hasPermission]);

  // Handle Enter action (click, touch, or Enter key)
  const handleEnter = useCallback(() => {
    if (isFadingOut) return;

    unlockAudio();
    playSprayCanShake();
    triggerHapticVibration();

    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600);
  }, [isFadingOut, onComplete]);

  // Listen for Enter or Spacebar keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleEnter]);

  return (
    <div
      className={`fixed inset-0 z-50 w-full h-full bg-black overflow-hidden select-none transition-opacity duration-600 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Background Red Room Image with Slow Cinematic Drift */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src="/loading-mirrors.jpg"
          alt="Red Room Convex Mirrors"
          className="w-full h-full object-cover object-center scale-105 animate-red-room filter brightness-95 contrast-110"
        />
        {/* Subtle Darkroom Red Grid & Ambient Vignette */}
        <div className="absolute inset-0 bg-radial from-transparent via-red-950/40 to-black/90 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/95 pointer-events-none" />
        {/* Subtle Scanline / Tile Texture */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 0, 0, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 0, 0, 0.25) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Floating Street Art Overlays */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-6 pt-safe pb-safe max-w-lg mx-auto">
        {/* Top Bar: JOT Street Decal & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-md bg-lime-400 text-black font-black text-[11px] tracking-wider uppercase border border-black shadow-[0_0_15px_rgba(163,230,53,0.5)] transform -rotate-2">
              JOT • 涂鸦
            </div>
            <div className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-[10px] font-mono tracking-widest uppercase flex items-center gap-1.5 shadow-md backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              <span>RED ROOM</span>
            </div>
          </div>

          <div className="px-2.5 py-1 rounded bg-black/60 border border-white/10 text-neutral-300 text-[10px] font-mono tracking-widest backdrop-blur-md">
            BOOTH #01
          </div>
        </div>

        {/* Center: Stylized Convex Mirror Aperture (Interactive on tap) */}
        <div className="flex flex-col items-center justify-center my-auto">
          <button
            onClick={handleEnter}
            aria-label="Tap mirror to enter booth"
            className="group relative w-44 h-44 sm:w-52 sm:h-52 rounded-full p-2 bg-gradient-to-tr from-neutral-800 via-neutral-600 to-neutral-900 border-3 border-neutral-400/80 shadow-[0_0_50px_rgba(239,68,68,0.7),inset_0_0_25px_rgba(0,0,0,0.9)] flex items-center justify-center cursor-pointer transition-transform duration-200 active:scale-95 focus:outline-none"
          >
            {/* Mirror Bezel Highlight */}
            <div className="absolute inset-1 rounded-full border border-white/40 pointer-events-none group-hover:border-white/70 transition-colors" />

            {/* Inner Red Convex Reflection Glow */}
            <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-b from-red-600/30 via-red-900/50 to-black flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] group-hover:from-red-600/40 transition-all">
              {/* Convex Mirror curved sheen */}
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/15 blur-md pointer-events-none transform rotate-12" />

              {/* Stencil Text (from reference photo) */}
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-[10px] sm:text-xs font-mono font-black text-white/90 tracking-[0.3em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                  NICE TO MEET
                </span>
                <span className="text-3xl sm:text-4xl my-1 animate-pulse filter drop-shadow-[0_0_12px_rgba(239,68,68,0.9)] group-hover:scale-110 transition-transform">
                  🪞
                </span>
                <span className="text-[9px] font-mono text-red-300/80 tracking-widest uppercase">
                  POP-UP STUDIO
                </span>
              </div>

              {/* Pulsing Aperture Ring */}
              <div
                className="absolute inset-3 rounded-full border border-dashed border-red-500/40 animate-spin pointer-events-none"
                style={{ animationDuration: "16s" }}
              />
            </div>

            {/* Corner Spray Star Bursts */}
            <div className="absolute -top-3 -right-3 text-amber-300 text-xl drop-shadow-[0_0_8px_rgba(252,211,77,0.9)] animate-pulse pointer-events-none">
              ✦
            </div>
            <div className="absolute -bottom-2 -left-2 text-cyan-400 text-base drop-shadow-[0_0_8px_rgba(34,211,238,0.9)] pointer-events-none">
              ✦
            </div>
          </button>

          {/* Dripping "was here..." Tag below the mirror */}
          <div className="relative mt-4 transform -rotate-3 select-none pointer-events-none">
            <span
              className="font-black italic text-3xl sm:text-4xl text-red-500 tracking-tight block drop-shadow-[0_0_14px_rgba(239,68,68,1)]"
              style={{
                fontFamily: "'Brush Script MT', 'Impact', cursive, sans-serif",
                textShadow: "0 0 10px #ef4444, 0 0 25px #dc2626",
              }}
            >
              was here...
            </span>
            <svg
              className="absolute -bottom-4 left-1 w-32 h-5 text-red-500 overflow-visible filter drop-shadow-[0_0_6px_rgba(239,68,68,0.9)]"
              viewBox="0 0 140 24"
              fill="currentColor"
            >
              <path d="M 8 0 L 9 14 A 2.5 2.5 0 0 0 14 14 L 15 0 Z" />
              <path d="M 38 0 L 39 20 A 3 3 0 0 0 45 20 L 46 0 Z" />
              <path d="M 68 0 L 69 11 A 2 2 0 0 0 73 11 L 74 0 Z" />
              <path d="M 94 0 L 95 22 A 3.5 3.5 0 0 0 102 22 L 103 0 Z" />
              <path d="M 124 0 L 125 15 A 2.5 2.5 0 0 0 130 15 L 131 0 Z" />
            </svg>
          </div>
        </div>

        {/* Bottom Area: Progress Bar, Status Text & Street Decals */}
        <div className="flex flex-col gap-3">
          {/* Street Poster: NO MORE WORK BUT MORE PHOTO */}
          <div className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-black/75 border border-red-500/30 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-black text-xs">●</span>
              <span className="text-[11px] font-black text-emerald-400 tracking-wide uppercase">
                NO MORE WORK BUT MORE PHOTO
              </span>
            </div>
            <span className="text-[10px] font-mono text-red-400 font-bold">
              {progress}%
            </span>
          </div>

          {/* Loading Progress Bar */}
          <div className="relative w-full h-2 rounded-full bg-black/80 border border-red-900/60 overflow-hidden shadow-inner p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 transition-all duration-300 ease-out shadow-[0_0_12px_rgba(244,63,94,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Dynamic Status Text */}
          <div className="flex items-center justify-between text-[11px] font-mono tracking-widest text-neutral-300">
            <span className="flex items-center gap-1.5 text-red-300 font-bold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
              {message || statusText}
            </span>
            <span className="text-neutral-500">JOT • 2026</span>
          </div>

          {/* Primary ENTER Button (Stays until pressed) */}
          <div className="mt-1">
            <button
              onClick={handleEnter}
              className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-widest border-2 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer active:scale-95 shadow-xl ${
                isReady
                  ? "bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white border-white/30 shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-pulse"
                  : "bg-neutral-900 text-neutral-400 border-white/10"
              }`}
            >
              <span>{isReady ? "ENTER BOOTH" : "CALIBRATING..."}</span>
              <span className="text-base">{isReady ? "🪞" : "⏳"}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-black/50 border border-white/20 font-mono text-neutral-300 normal-case">
                Press Enter ↵
              </span>
            </button>
          </div>

          {/* Fallback / Quick Start for desktop or denied permissions */}
          {showDemoOption && hasPermission === null && onUseDemo && (
            <button
              onClick={onUseDemo}
              className="mt-0.5 py-2 px-4 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-amber-300 border border-amber-400/40 text-xs font-black tracking-wider uppercase transition-all shadow-lg active:scale-95"
            >
              Camera taking a while? Switch to Demo Mode 📷
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
