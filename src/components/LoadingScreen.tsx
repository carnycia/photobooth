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
  const [progress, setProgress] = useState(25);
  const [isReady, setIsReady] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [centerButtonPressed, setCenterButtonPressed] = useState(false);

  // Progressive loading stages
  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(60);
    }, 350);

    const t2 = setTimeout(() => {
      setProgress(90);
    }, 700);

    const t3 = setTimeout(() => {
      setProgress(100);
      setIsReady(true);
    }, 1050);

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
    }, 550);
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
      className={`fixed inset-0 z-50 w-full h-full bg-gradient-to-b from-[#edf2f7] via-[#e2e8f0] to-[#cbd5e1] overflow-hidden select-none flex items-center justify-center p-4 transition-all duration-500 ease-out ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* The Sole Element: The Classic iPod */}
      <div className="relative w-auto max-w-[340px] sm:max-w-[400px] max-h-[82vh] aspect-square flex items-center justify-center">
        {/* Authentic Classic iPod Shell Image */}
        <img
          src="/ipod-loading.jpg"
          alt="iPod Photo Booth"
          className="w-full h-full object-contain pointer-events-none select-none drop-shadow-[0_25px_50px_rgba(0,0,0,0.3)]"
        />

        {/* =========================================================================
            CUSTOM IPOD COLOR LCD SCREEN OVERLAY
            Exact pixel coordinates matching the physical iPod screen bezel
            ========================================================================= */}
        <div
          className="absolute bg-white overflow-hidden rounded-[2px] flex flex-col justify-between select-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
          style={{
            top: "16.50%",
            left: "31.54%",
            width: "36.91%",
            height: "27.73%",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Lucida Grande", "Segoe UI", Helvetica, Arial, sans-serif',
          }}
        >
          {/* 1. Classic iPod Glossy Top Header Bar */}
          <div className="w-full h-[14%] bg-gradient-to-b from-[#e3e8ef] via-[#c2cbd5] to-[#a8b4c2] border-b border-[#8290a0] px-1.5 flex items-center justify-between shadow-sm">
            <span className="text-[7.5px] sm:text-[9px] font-black text-neutral-800 tracking-tight">
              Photo Booth
            </span>
            <div className="flex items-center gap-1">
              {/* Blue Play Triangle */}
              <svg className="w-1.5 h-1.5 text-blue-600 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              {/* Battery Icon with Green Charge Level */}
              <div className="w-3.5 h-1.5 rounded-[1px] border border-neutral-700 p-[0.5px] flex items-center bg-white/40">
                <div className="w-full h-full bg-emerald-500 rounded-[0.5px]" />
              </div>
            </div>
          </div>

          {/* 2. Middle Body: Album Art (Left) & Photobooth Metadata (Right) */}
          <div className="w-full flex-1 px-1.5 pt-1 pb-0.5 flex items-center justify-between gap-1 overflow-hidden">
            {/* Left: Square Album Tile with Mirror Reflection */}
            <div className="relative flex flex-col items-center flex-shrink-0 w-[42%] max-w-[56px] sm:max-w-[66px]">
              {/* Artwork Tile */}
              <div className="w-full aspect-square rounded-[3px] bg-gradient-to-tr from-neutral-900 via-neutral-800 to-neutral-700 border border-neutral-300 shadow-sm overflow-hidden flex flex-col items-center justify-center p-1 text-center">
                <span className="text-base sm:text-xl drop-shadow-sm">📸</span>
                <span className="text-[5.5px] sm:text-[6.5px] font-black text-amber-300 tracking-wider uppercase leading-none mt-0.5">
                  JOT • 涂鸦
                </span>
              </div>
              {/* Cover Flow Mirror Reflection */}
              <div
                className="w-full h-2.5 mt-[1px] bg-gradient-to-b from-neutral-400/30 to-transparent scale-y-[-1] blur-[0.4px] pointer-events-none rounded-b-[2px]"
                style={{ opacity: 0.4 }}
              />
            </div>

            {/* Right: Photobooth Metadata Info */}
            <div className="flex-1 flex flex-col justify-center min-w-0 pl-1 leading-tight">
              <span className="text-[8.5px] sm:text-[10px] font-black text-black tracking-tight truncate">
                Photo Booth
              </span>
              <span className="text-[7px] sm:text-[8px] font-medium text-neutral-600 truncate mt-0.5">
                JOT Studio
              </span>
              <span className="text-[6.5px] sm:text-[7.5px] font-bold text-blue-600 truncate mt-0.5 animate-pulse">
                {isReady ? "Press Center ↵" : "Loading Lenses..."}
              </span>

              {/* 5-Star Rating */}
              <div className="flex items-center gap-[1px] text-[6.5px] sm:text-[7.5px] text-neutral-800 mt-0.5">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>

              {/* Track / Shot Counter */}
              <span className="text-[6px] sm:text-[7px] font-mono text-neutral-500 mt-0.5">
                1 of 4 Shots
              </span>
            </div>
          </div>

          {/* 3. Bottom Scrubber Bar & Timers */}
          <div className="w-full px-1.5 pb-1 pt-0.5 flex flex-col gap-0.5">
            <div className="flex items-center justify-between text-[6px] sm:text-[7px] font-mono font-medium text-neutral-600">
              <span>{isReady ? "READY" : "0:00"}</span>
              <span className="text-[6.5px] sm:text-[7.5px] font-bold text-neutral-800">
                {isReady ? "ENTER ↵" : "-3:21"}
              </span>
            </div>

            {/* Glossy Blue Progress Scrubber */}
            <div className="w-full h-1.5 sm:h-2 rounded-[1.5px] bg-[#d9e1ea] border border-[#a6b4c2] overflow-hidden p-[0.5px] shadow-inner">
              <div
                className="h-full rounded-[1px] bg-gradient-to-b from-[#60a8f8] via-[#2075df] to-[#115ebb] shadow-sm transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* =========================================================================
            INTERACTIVE HOTSPOTS ON THE IPOD CLICK WHEEL
            ========================================================================= */}
        {/* Center "Select / Enter" Button */}
        <button
          onClick={handleEnter}
          onMouseDown={() => setCenterButtonPressed(true)}
          onMouseUp={() => setCenterButtonPressed(false)}
          onTouchStart={() => setCenterButtonPressed(true)}
          onTouchEnd={() => setCenterButtonPressed(false)}
          aria-label="Press iPod Center Button to Enter"
          className={`absolute rounded-full transition-transform duration-75 cursor-pointer focus:outline-none ${
            centerButtonPressed ? "scale-90 bg-black/20 shadow-inner" : "hover:bg-black/5"
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
            <span className="absolute inset-0 rounded-full border border-blue-500/70 animate-ping pointer-events-none" />
          )}
        </button>

        {/* Click Wheel Whole Ring Hotspot */}
        <button
          onClick={handleEnter}
          aria-label="Tap iPod to Enter"
          className="absolute rounded-full cursor-pointer focus:outline-none hover:bg-black/[0.02] active:bg-black/10 transition-colors"
          style={{
            top: "52.7%",
            left: "36.3%",
            width: "27.4%",
            height: "27.4%",
          }}
        />

        {/* Entire iPod Surface Clickable to Enter */}
        <button
          onClick={handleEnter}
          aria-label="Tap iPod"
          className="absolute inset-0 w-full h-full rounded-[2.5rem] cursor-pointer focus:outline-none"
        />
      </div>
    </div>
  );
}
