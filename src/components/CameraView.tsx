"use client";

import React, { RefObject } from "react";

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  facingMode: "user" | "environment";
  isTakingPhotos: boolean;
  currentPhotoIndex: number;
  countdown: number | null;
  isFlashing: boolean;
  capturedPhotos: string[];
  soundEnabled: boolean;
  isDemoMode: boolean;
  demoFrameIndex: number;
  onShutterTap: () => void;
  onFlipCamera: () => void;
  onToggleSound: () => void;
}

export function CameraView({
  videoRef,
  facingMode,
  isTakingPhotos,
  currentPhotoIndex,
  countdown,
  isFlashing,
  capturedPhotos,
  soundEnabled,
  isDemoMode,
  demoFrameIndex,
  onShutterTap,
  onFlipCamera,
  onToggleSound,
}: CameraViewProps) {
  const isFront = facingMode === "user";

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-between select-none">
      {/* Background Video Viewfinder */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-black flex items-center justify-center">
        {isDemoMode ? (
          <div
            className={`w-full h-full flex flex-col items-center justify-center transition-colors duration-500 ${
              demoFrameIndex === 0
                ? "bg-gradient-to-tr from-rose-900 via-purple-900 to-indigo-950"
                : demoFrameIndex === 1
                ? "bg-gradient-to-tr from-amber-900 via-orange-950 to-neutral-900"
                : demoFrameIndex === 2
                ? "bg-gradient-to-tr from-emerald-950 via-teal-900 to-cyan-950"
                : "bg-gradient-to-tr from-sky-950 via-indigo-900 to-violet-950"
            }`}
          >
            <div className="text-7xl mb-4 animate-bounce">
              {demoFrameIndex === 0
                ? "✌️"
                : demoFrameIndex === 1
                ? "😎"
                : demoFrameIndex === 2
                ? "😜"
                : "🎉"}
            </div>
            <p className="text-white/60 text-sm font-medium tracking-wide">
              DEMO CAMERA ACTIVE
            </p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover pointer-events-none transition-transform duration-300 ${
              isFront ? "scale-x-[-1]" : "scale-x-100"
            }`}
          />
        )}
      </div>

      {/* Screen White Flash Overlay */}
      {isFlashing && (
        <div className="absolute inset-0 z-40 bg-white pointer-events-none animate-camera-flash" />
      )}

      {/* Viewfinder Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-black/10 to-black/60" />

      {/* Top Safe Area Bar */}
      <div className="relative z-30 w-full pt-safe px-5 flex items-center justify-between">
        {/* Left: Sound Toggle */}
        <button
          onClick={onToggleSound}
          disabled={isTakingPhotos}
          aria-label={soundEnabled ? "Mute audio" : "Unmute audio"}
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 active:scale-95 transition-transform disabled:opacity-40"
        >
          {soundEnabled ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          )}
        </button>

        {/* Center: Photo Sequence Progress Pills */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/10 shadow-lg">
          {[0, 1, 2, 3].map((idx) => {
            const isTaken = idx < capturedPhotos.length;
            const isCurrent = isTakingPhotos && idx === currentPhotoIndex;
            return (
              <div
                key={idx}
                className={`transition-all duration-300 rounded-full ${
                  isTaken
                    ? "w-4 h-2 bg-emerald-400"
                    : isCurrent
                    ? "w-6 h-2 bg-yellow-400 animate-pulse"
                    : "w-2 h-2 bg-white/30"
                }`}
              />
            );
          })}
        </div>

        {/* Right: Camera Flip Toggle */}
        <button
          onClick={onFlipCamera}
          disabled={isTakingPhotos || isDemoMode}
          aria-label="Flip camera"
          className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/90 active:scale-95 transition-transform disabled:opacity-40"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Center Countdown & Pose Stage Overlay */}
      <div className="relative z-30 flex-1 flex flex-col items-center justify-center pointer-events-none">
        {isTakingPhotos ? (
          <div className="flex flex-col items-center justify-center">
            {/* Pose indicator badge */}
            <div className="px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white/90 text-sm font-semibold tracking-wider uppercase mb-6 shadow-2xl">
              Pose {currentPhotoIndex + 1} of 4
            </div>

            {/* Huge 3-2-1 Countdown Indicator */}
            {countdown !== null ? (
              <div
                key={countdown}
                className="flex items-center justify-center w-36 h-36 rounded-full bg-black/40 backdrop-blur-xl border-2 border-white/30 text-white font-extrabold text-7xl shadow-2xl animate-in zoom-in-75 duration-200"
              >
                {countdown}
              </div>
            ) : (
              <div className="px-6 py-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold text-xl tracking-wide uppercase animate-pulse">
                Smile! 📸
              </div>
            )}
          </div>
        ) : (
          /* Subtle centering rule / frame guide */
          <div className="w-64 h-80 rounded-3xl border border-white/20 pointer-events-none opacity-40 transition-opacity" />
        )}
      </div>

      {/* Bottom Shutter & Controls Area */}
      <div className="relative z-30 w-full pb-safe px-8 flex flex-col items-center">
        {/* Helper instruction tooltip when idle */}
        {!isTakingPhotos && (
          <p className="text-white/70 text-xs font-medium tracking-wider uppercase mb-5 backdrop-blur-sm bg-black/30 px-3 py-1 rounded-full border border-white/5">
            Tap shutter to take 4 photos
          </p>
        )}

        <div className="w-full flex items-center justify-between max-w-sm mb-2">
          {/* Left: Last snapped photo thumbnail thumbnail slot */}
          <div className="w-12 h-12 rounded-xl border border-white/20 overflow-hidden bg-neutral-900/60 backdrop-blur-md flex items-center justify-center">
            {capturedPhotos.length > 0 ? (
              <img
                src={capturedPhotos[capturedPhotos.length - 1]}
                alt="Latest snap"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          {/* Center: Big Round Shutter Button */}
          <button
            onClick={onShutterTap}
            disabled={isTakingPhotos}
            aria-label="Take 4 photos"
            className="group relative flex items-center justify-center w-20 h-20 rounded-full border-[4px] border-white active:scale-92 transition-all duration-150 disabled:opacity-50 disabled:scale-95 focus:outline-none"
          >
            {/* Inner solid white circle */}
            <span
              className={`rounded-full transition-all duration-200 ${
                isTakingPhotos
                  ? "w-8 h-8 bg-red-500 rounded-lg animate-pulse"
                  : "w-[62px] h-[62px] bg-white group-active:bg-neutral-200"
              }`}
            />
          </button>

          {/* Right: Balance placeholder or Front indicator */}
          <div className="w-12 h-12 flex items-center justify-center">
            <span className="text-[11px] font-bold text-white/60 tracking-wider uppercase">
              {isFront ? "FRONT" : "BACK"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
