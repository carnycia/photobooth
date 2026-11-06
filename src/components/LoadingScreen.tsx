"use client";

import React, { useState, useEffect, useCallback } from "react";
import { unlockAudio, playIpodClick, triggerHapticVibration } from "@/lib/sounds";

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
  const [progress, setProgress] = useState(25);
  const [isReady, setIsReady] = useState(false);
  const [showDemoOption, setShowDemoOption] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [centerButtonPressed, setCenterButtonPressed] = useState(false);

  // Progressive loading stages
  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(60);
    }, 400);

    const t2 = setTimeout(() => {
      setProgress(90);
    }, 800);

    const t3 = setTimeout(() => {
      setProgress(100);
      setIsReady(true);
    }, 1200);

    // If camera takes longer than 2.8s, show demo camera shortcut
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

  // Update ready state when camera permission resolves
  useEffect(() => {
    if (hasPermission !== null) {
      setProgress(100);
      setIsReady(true);
    }
  }, [hasPermission]);

  // Handle Enter action (click wheel center, Enter key, or button)
  const handleEnter = useCallback(() => {
    if (isFadingOut) return;

    setCenterButtonPressed(true);
    unlockAudio();
    playIpodClick();
    triggerHapticVibration();

    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 600);
  }, [isFadingOut, onComplete]);

  // Listen for physical Enter or Spacebar keys
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
      className={`fixed inset-0 z-50 w-full h-full bg-gradient-to-b from-[#edf2f7] via-[#e2e8f0] to-[#cbd5e1] text-neutral-800 overflow-hidden select-none flex flex-col justify-between items-center p-4 sm:p-6 pt-safe pb-safe transition-all duration-600 ease-out ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Top Subtle Header Bar */}
      <div className="w-full max-w-sm flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-neutral-500 pt-1">
        <span className="flex items-center gap-1.5 font-bold">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          PHOTO BOOTH OS
        </span>
        <span className="px-2 py-0.5 rounded bg-white/70 border border-neutral-300 shadow-sm text-neutral-600 font-semibold text-[10px]">
          CLASSIC
        </span>
      </div>

      {/* Main Hero: The Classic iPod with Interactive Hotspots */}
      <div className="relative my-auto flex flex-col items-center justify-center">
        <div className="relative w-auto max-w-[320px] sm:max-w-[360px] max-h-[68vh] sm:max-h-[72vh] aspect-square rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35),0_0_30px_rgba(255,255,255,0.6)]">
          {/* Authentic iPod Image */}
          <img
            src="/ipod-loading.jpg"
            alt="Classic iPod Loading Screen"
            className="w-full h-full object-contain pointer-events-none select-none rounded-[2.5rem]"
          />

          {/* Dynamic Scrubber Progress Bar Overlay onto the iPod Screen */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: "41.0%",
              left: "38.2%",
              width: "24.5%",
              height: "1.7%",
            }}
          >
            {/* Glossy Blue Fill advancing with progress */}
            <div
              className="h-full rounded-sm bg-gradient-to-b from-sky-400 via-blue-500 to-sky-600 shadow-[0_0_4px_rgba(14,165,233,0.8)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Interactive Click Wheel Center "Select / Enter" Button */}
          <button
            onClick={handleEnter}
            onMouseDown={() => setCenterButtonPressed(true)}
            onMouseUp={() => setCenterButtonPressed(false)}
            onTouchStart={() => setCenterButtonPressed(true)}
            onTouchEnd={() => setCenterButtonPressed(false)}
            aria-label="Press iPod Center Button to Enter"
            className={`absolute rounded-full transition-all duration-100 cursor-pointer focus:outline-none ${
              centerButtonPressed ? "scale-92 bg-black/15 shadow-inner" : "hover:bg-black/5"
            }`}
            style={{
              top: "61.8%",
              left: "45.4%",
              width: "9.2%",
              height: "9.2%",
            }}
          >
            {/* Subtle pulse ring around center button when ready */}
            {isReady && (
              <span className="absolute inset-0 rounded-full border-2 border-blue-400/80 animate-ping pointer-events-none" />
            )}
          </button>

          {/* Click Wheel Whole Ring Hotspot (tapping anywhere on the wheel triggers enter) */}
          <button
            onClick={handleEnter}
            aria-label="Tap Click Wheel to Enter"
            className="absolute rounded-full cursor-pointer focus:outline-none hover:bg-black/[0.03] active:bg-black/10 transition-colors"
            style={{
              top: "52.7%",
              left: "36.3%",
              width: "27.4%",
              height: "27.4%",
            }}
          />
        </div>

        {/* Tactile Hint below iPod */}
        <div className="mt-4 flex flex-col items-center gap-1">
          <p className="text-xs font-mono font-semibold tracking-wider text-neutral-600 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isReady ? "Ready to shoot" : "Loading Photo Booth..."}
          </p>
        </div>
      </div>

      {/* Bottom Sticky Action Bar: Primary Enter Button */}
      <div className="w-full max-w-sm flex flex-col items-center gap-2">
        <button
          onClick={handleEnter}
          className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer active:scale-95 shadow-lg ${
            isReady
              ? "bg-neutral-900 hover:bg-neutral-800 text-white shadow-neutral-900/30 border border-neutral-700 animate-pulse"
              : "bg-neutral-300 text-neutral-500 border border-neutral-400/50"
          }`}
        >
          <span>{isReady ? "Press Center Button to Enter" : "Warming Up Booth..."}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-white/20 border border-white/20 font-mono text-neutral-200 normal-case">
            Enter ↵
          </span>
        </button>

        {/* Demo Mode Button for testing/denied camera */}
        {showDemoOption && hasPermission === null && onUseDemo && (
          <button
            onClick={onUseDemo}
            className="py-1.5 px-3 rounded-lg text-neutral-500 hover:text-neutral-800 text-xs font-mono uppercase tracking-wider transition-colors"
          >
            Use Demo Camera 📷
          </button>
        )}
      </div>
    </div>
  );
}
