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
}: LoadingScreenProps) {
  const [progress, setProgress] = useState(30);
  const [isReady, setIsReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [centerButtonPressed, setCenterButtonPressed] = useState(false);

  // Progressive loading stages
  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(65);
    }, 300);

    const t2 = setTimeout(() => {
      setProgress(90);
    }, 600);

    const t3 = setTimeout(() => {
      setProgress(100);
      setIsReady(true);
    }, 950);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Update ready state when camera permission resolves
  useEffect(() => {
    if (hasPermission !== null) {
      setProgress(100);
      setIsReady(true);
    }
  }, [hasPermission]);

  // Handle Enter action (click wheel center, screen tap, or Enter key)
  const handleEnter = useCallback(() => {
    if (isFadingOut) return;

    setCenterButtonPressed(true);
    unlockAudio();
    playIpodClick();
    triggerHapticVibration();

    setIsFadingOut(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 500);
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
      className={`fixed inset-0 z-50 w-full h-full bg-black overflow-hidden select-none flex items-center justify-center p-2 sm:p-4 transition-all duration-500 ease-out ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* The Sole Hero: Giant Full-Scale Classic iPod */}
      <div className="relative w-full max-w-[420px] sm:max-w-[460px] h-full max-h-[96vh] sm:max-h-[94vh] aspect-[452/772] flex items-center justify-center">
        {/* Isolated iPod Body (Zero Background & Zero Drop Shadow) */}
        <img
          src="/ipod-isolated.png"
          alt="iPod Photo Booth"
          className="w-full h-full object-contain pointer-events-none select-none"
        />

        {/* =========================================================================
            CUSTOM IPOD COLOR LCD SCREEN OVERLAY
            Exact pixel coordinates matching the physical iPod screen bezel on 452x772
            ========================================================================= */}
        <div
          className="absolute bg-white overflow-hidden rounded-[3px] flex flex-col justify-between select-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
          style={{
            top: "5.44%",
            left: "8.63%",
            width: "82.74%",
            height: "36.79%",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Lucida Grande", "Segoe UI", Helvetica, Arial, sans-serif',
          }}
        >
          {/* 1. Classic iPod Glossy Top Header Bar */}
          <div className="w-full h-[14%] bg-gradient-to-b from-[#e3e8ef] via-[#c2cbd5] to-[#a8b4c2] border-b border-[#8290a0] px-2.5 flex items-center justify-between shadow-sm flex-shrink-0">
            <span className="text-[10px] sm:text-[12px] font-black text-neutral-800 tracking-tight">
              Photo Booth
            </span>
            <div className="flex items-center gap-1.5">
              {/* Blue Play Triangle */}
              <svg className="w-2 h-2 text-blue-600 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {/* Battery Icon with Green Charge Level */}
              <div className="w-4 h-2 rounded-[1.5px] border border-neutral-700 p-[0.5px] flex items-center bg-white/40">
                <div className="w-full h-full bg-emerald-500 rounded-[0.5px]" />
              </div>
            </div>
          </div>

          {/* 2. Middle Body: Album Art (Left) & Photobooth Metadata (Right) */}
          <div className="w-full flex-1 px-3 py-1 flex items-center justify-between gap-3 overflow-hidden">
            {/* Left: Square Album Tile with Mirror Reflection */}
            <div className="relative flex flex-col items-center flex-shrink-0 w-[42%] max-w-[90px] sm:max-w-[110px]">
              {/* Artwork Tile */}
              <div className="w-full aspect-square rounded-[4px] bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 border border-neutral-300 shadow-md overflow-hidden flex flex-col items-center justify-center p-1 text-center">
                <span className="text-2xl sm:text-3xl drop-shadow-sm">📸</span>
                <span className="text-[7.5px] sm:text-[9px] font-black text-amber-300 tracking-wider uppercase leading-none mt-1">
                  JOT • 涂鸦
                </span>
              </div>
              {/* Cover Flow Mirror Reflection */}
              <div
                className="w-full h-3.5 mt-[2px] bg-gradient-to-b from-neutral-400/35 to-transparent scale-y-[-1] blur-[0.4px] pointer-events-none rounded-b-[3px]"
                style={{ opacity: 0.45 }}
              />
            </div>

            {/* Right: Photobooth Metadata Info */}
            <div className="flex-1 flex flex-col justify-center min-w-0 pl-1 leading-tight">
              <span className="text-[12px] sm:text-[14px] font-black text-black tracking-tight truncate">
                Photo Booth
              </span>
              <span className="text-[9.5px] sm:text-[11px] font-semibold text-neutral-600 truncate mt-0.5">
                JOT Studio
              </span>
              <span className="text-[9px] sm:text-[10.5px] font-bold text-blue-600 truncate mt-1 animate-pulse">
                {isReady ? "Press Center ↵" : "Warming Up..."}
              </span>

              {/* 5-Star Rating */}
              <div className="flex items-center gap-[1.5px] text-[9px] sm:text-[11px] text-neutral-800 mt-1">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>

              {/* Track / Shot Counter */}
              <span className="text-[8px] sm:text-[9.5px] font-mono text-neutral-500 mt-1">
                1 of 4 Shots
              </span>
            </div>
          </div>

          {/* 3. Bottom Scrubber Bar & Timers */}
          <div className="w-full px-2.5 pb-2 pt-0.5 flex flex-col gap-0.5 flex-shrink-0">
            <div className="flex items-center justify-between text-[8px] sm:text-[9.5px] font-mono font-semibold text-neutral-600">
              <span>{isReady ? "READY" : "0:00"}</span>
              <span className="text-[8.5px] sm:text-[10px] font-bold text-neutral-800">
                {isReady ? "ENTER ↵" : "-3:21"}
              </span>
            </div>

            {/* Glossy Blue Progress Scrubber */}
            <div className="w-full h-2 sm:h-2.5 rounded-[2px] bg-[#d9e1ea] border border-[#a6b4c2] overflow-hidden p-[0.5px] shadow-inner">
              <div
                className="h-full rounded-[1px] bg-gradient-to-b from-[#60a8f8] via-[#2075df] to-[#115ebb] shadow-sm transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            INTERACTIVE HOTSPOTS ON THE IPOD CLICK WHEEL
            Coordinates on 452x772: center at (50.4%, 71.6%)
            ========================================================================= */}
        {/* Center "Select / Enter" Button */}
        <button
          onClick={handleEnter}
          onMouseDown={() => setCenterButtonPressed(true)}
          onMouseUp={() => setCenterButtonPressed(false)}
          onTouchStart={() => setCenterButtonPressed(true)}
          onTouchEnd={() => setCenterButtonPressed(false)}
          aria-label="Press iPod Center Button to Enter"
          className={`absolute rounded-full transition-transform duration-75 cursor-pointer focus:outline-none z-20 ${
            centerButtonPressed ? "scale-92 bg-black/25 shadow-inner" : "hover:bg-black/5"
          }`}
          style={{
            top: "65.5%",
            left: "40.0%",
            width: "20.8%",
            height: "12.2%",
          }}
        >
          {/* Subtle pulse ring around center button when ready */}
          {isReady && (
            <span className="absolute inset-0 rounded-full border border-blue-500/60 animate-ping pointer-events-none" />
          )}
        </button>

        {/* Click Wheel Outer Ring Hotspot */}
        <button
          onClick={handleEnter}
          aria-label="Tap iPod Click Wheel to Enter"
          className="absolute rounded-full cursor-pointer focus:outline-none hover:bg-black/[0.02] active:bg-black/10 transition-colors z-10"
          style={{
            top: "53.5%",
            left: "19.5%",
            width: "61.9%",
            height: "36.3%",
          }}
        />

        {/* Fallback full iPod body clickable */}
        <button
          onClick={handleEnter}
          aria-label="Tap iPod to Enter"
          className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none"
        />
      </div>
    </div>
  );
}
