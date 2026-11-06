"use client";

import React, { RefObject, useEffect, useRef } from "react";
import { CameraFilter, CAMERA_FILTERS, getFilterCss } from "@/lib/filters";
import { createFisheyeRenderer, FisheyeRenderer } from "@/lib/fisheye";
import { playSprayCanShake } from "@/lib/sounds";

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
  retakingIndex?: number | null;
  galleryCount?: number;
  latestGalleryStripUrl?: string | null;
  activeFilter: CameraFilter;
  onSelectFilter: (filter: CameraFilter) => void;
  onOpenGallery: () => void;
  onCancelRetake?: () => void;
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
  retakingIndex,
  galleryCount = 0,
  latestGalleryStripUrl,
  activeFilter,
  onSelectFilter,
  onOpenGallery,
  onCancelRetake,
  onShutterTap,
  onFlipCamera,
  onToggleSound,
}: CameraViewProps) {
  const isFront = facingMode === "user";
  const isSingleRetake = retakingIndex !== null && retakingIndex !== undefined;
  const filterStyle = { filter: getFilterCss(activeFilter) };

  const fisheyeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<FisheyeRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Real-time 60 FPS WebGL Fisheye render loop
  useEffect(() => {
    if (activeFilter !== "fisheye") {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
      return;
    }

    const canvas = fisheyeCanvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    canvas.width = Math.min(window.innerWidth * dpr, 960);
    canvas.height = Math.min(window.innerHeight * dpr, 1280);

    const renderer = createFisheyeRenderer(canvas);
    rendererRef.current = renderer;

    const renderLoop = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && rendererRef.current) {
        rendererRef.current.render(video, isFront);
      }
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, [activeFilter, isFront, videoRef]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden flex flex-col justify-between select-none">
      {/* Hidden helper for iOS Safari haptic switch event */}
      <input
        type="checkbox"
        id="ios-haptic-trigger"
        className="sr-only pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
        readOnly
      />

      {/* Background Video Viewfinder with Live Filter & Recoil Shake on Snap */}
      <div
        className={`absolute inset-0 w-full h-full overflow-hidden bg-black flex items-center justify-center transition-transform duration-75 ${
          isFlashing ? "animate-camera-recoil" : ""
        }`}
      >
        {isDemoMode ? (
          <div
            style={filterStyle}
            className={`w-full h-full flex flex-col items-center justify-center transition-all duration-300 ${
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
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={filterStyle}
              className={`w-full h-full object-cover pointer-events-none transition-all duration-300 ${
                isFront ? "scale-x-[-1]" : "scale-x-100"
              } ${activeFilter === "fisheye" ? "opacity-0" : "opacity-100"}`}
            />
            {activeFilter === "fisheye" && (
              <canvas
                ref={fisheyeCanvasRef}
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
            )}
          </>
        )}
      </div>

      {/* Street Art Mirror Frame Overlay (from reference photo) */}
      <div className="absolute inset-3 sm:inset-5 pointer-events-none rounded-3xl border-2 border-neutral-300/30 shadow-[inset_0_0_20px_rgba(255,255,255,0.08)] z-20">
        {/* Top-Left: Cyan & Yellow Spray Paint bursts */}
        <div className="absolute -top-1 -left-1">
          <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(250,204,21,0.9)] animate-pulse">
            ✦
          </span>
          <span className="absolute -bottom-3 -right-3 text-sm text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]">
            ✦
          </span>
        </div>

        {/* Top-Right: Street Sticker "JOT" */}
        <div className="absolute top-2 right-2 transform rotate-3">
          <div className="px-2 py-0.5 rounded bg-lime-400 text-black font-black text-[9px] tracking-widest uppercase border border-black shadow-md">
            JOT • 涂鸦
          </div>
        </div>

        {/* Fisheye Mode Convex Mirror Stencil Tag ("NICE TO MEET" from reference photo) */}
        {activeFilter === "fisheye" && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-black/70 border border-white/20 text-white font-mono font-black text-xs tracking-widest uppercase shadow-lg backdrop-blur-sm animate-in fade-in zoom-in-95">
            NICE TO MEET
          </div>
        )}

        {/* Bottom-Left: Iconic Dripping Red Spray Paint Tag "was here..." */}
        <div className="absolute bottom-28 left-3 sm:left-4 transform -rotate-3 select-none">
          <div className="relative">
            <span
              className="font-black italic text-3xl sm:text-4xl text-red-500 tracking-tight block drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]"
              style={{
                fontFamily: "'Brush Script MT', 'Impact', cursive, sans-serif",
                textShadow: "0 0 10px #ef4444, 0 0 20px #dc2626",
              }}
            >
              was here...
            </span>
            {/* Realistic Paint Drips SVG */}
            <svg
              className="absolute -bottom-5 left-1 w-36 h-6 text-red-500 overflow-visible filter drop-shadow-[0_0_6px_rgba(239,68,68,0.8)]"
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

        {/* Bottom-Right: Blue star */}
        <div className="absolute bottom-32 right-3 text-blue-500 text-lg filter drop-shadow-[0_0_8px_rgba(59,130,246,0.9)]">
          ✦
        </div>
      </div>

      {/* Screen White Flash Overlay */}
      {isFlashing && (
        <div className="absolute inset-0 z-40 bg-white pointer-events-none animate-camera-flash" />
      )}

      {/* Viewfinder Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-radial from-transparent via-black/10 to-black/60" />

      {/* Top Safe Area Bar */}
      <div className="relative z-30 w-full pt-safe px-5 flex items-center justify-between">
        {/* Left Side: Cancel button in retake mode, or Sound toggle */}
        {isSingleRetake ? (
          <button
            onClick={onCancelRetake}
            disabled={isTakingPhotos}
            className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-semibold text-neutral-300 hover:text-white active:scale-95 transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              disabled={isTakingPhotos}
              aria-label={soundEnabled ? "Mute audio" : "Unmute audio"}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/90 active:scale-95 transition-transform disabled:opacity-40 shadow-lg"
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
          </div>
        )}

        {/* Center: Single Retake indicator OR 4-photo progress pills */}
        {isSingleRetake ? (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/50 backdrop-blur-md shadow-lg text-amber-300 text-xs font-bold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Retaking Shot {retakingIndex + 1}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 shadow-lg">
            {[0, 1, 2, 3].map((idx) => {
              const isTaken = idx < capturedPhotos.length;
              const isCurrent = isTakingPhotos && idx === currentPhotoIndex;
              return (
                <div
                  key={idx}
                  className={`transition-all duration-300 rounded-full ${
                    isTaken
                      ? "w-4 h-2 bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]"
                      : isCurrent
                      ? "w-6 h-2 bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.8)] animate-pulse"
                      : "w-2 h-2 bg-white/30"
                  }`}
                />
              );
            })}
          </div>
        )}

        {/* Right Side: Flip camera button */}
        <button
          onClick={onFlipCamera}
          disabled={isTakingPhotos || isDemoMode}
          aria-label="Flip camera"
          className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/90 active:scale-95 transition-transform disabled:opacity-40 shadow-lg"
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
            <div className="px-5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white font-black text-sm tracking-widest uppercase mb-6 shadow-2xl">
              {isSingleRetake ? `Shot ${retakingIndex + 1}` : `Pose ${currentPhotoIndex + 1} of 4`}
            </div>

            {/* Huge 3-2-1 Spray Stencil Countdown Indicator */}
            {countdown !== null ? (
              <div
                key={countdown}
                className="flex items-center justify-center w-36 h-36 rounded-full bg-black/55 backdrop-blur-xl border-3 border-amber-400 text-yellow-300 font-black text-7xl shadow-[0_0_40px_rgba(250,204,21,0.5)] animate-in zoom-in-75 duration-200"
                style={{
                  fontFamily: "'Impact', 'Arial Black', sans-serif",
                  textShadow: "0 0 20px #facc15",
                }}
              >
                {countdown}
              </div>
            ) : (
              <div className="px-6 py-2.5 rounded-2xl bg-red-600/90 backdrop-blur-md text-white font-black text-2xl tracking-wider uppercase animate-pulse shadow-[0_0_25px_rgba(239,68,68,0.8)]">
                SMILE! 📸
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Bottom Shutter & Controls Area */}
      <div className="relative z-30 w-full pb-safe px-8 flex flex-col items-center">
        {/* Row of Filter Buttons Above the Shutter with Spray Can Shake Sound */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/70 backdrop-blur-xl border border-white/20 shadow-2xl mb-4 z-40">
          {CAMERA_FILTERS.map((f) => {
            const isSelected = activeFilter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  playSprayCanShake();
                  onSelectFilter(f.id);
                }}
                disabled={isTakingPhotos}
                aria-pressed={isSelected}
                className={`px-3 py-1.5 rounded-full text-xs font-black tracking-wide uppercase transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer ${
                  isSelected
                    ? "bg-amber-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.6)] font-black scale-[1.03]"
                    : "text-neutral-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* Helper instruction tooltip when idle */}
        {!isTakingPhotos && (
          <p className="text-white/90 text-[10px] font-black tracking-widest uppercase mb-3.5 backdrop-blur-sm bg-neutral-900/80 px-3 py-1 rounded-full border border-white/15">
            {isSingleRetake
              ? `Tap shutter to retake Shot ${retakingIndex + 1}`
              : "Tap shutter to shoot 4 photos"}
          </p>
        )}

        <div className="w-full flex items-center justify-between max-w-sm mb-2">
          {/* Left: Gallery button showing latest strip thumbnail or photos icon */}
          <button
            onClick={onOpenGallery}
            disabled={isTakingPhotos}
            aria-label="Open photo strip gallery"
            className="group relative w-12 h-12 rounded-2xl border-2 border-white/30 overflow-hidden bg-neutral-900/90 backdrop-blur-md flex items-center justify-center active:scale-95 transition-transform disabled:opacity-40 cursor-pointer shadow-xl"
          >
            {isSingleRetake && capturedPhotos[retakingIndex] ? (
              <img
                src={capturedPhotos[retakingIndex]}
                alt={`Current Shot ${retakingIndex + 1}`}
                className="w-full h-full object-cover opacity-60"
              />
            ) : latestGalleryStripUrl ? (
              <div className="w-full h-full relative">
                <img
                  src={latestGalleryStripUrl}
                  alt="Gallery"
                  className="w-full h-full object-cover"
                />
                {galleryCount > 0 && (
                  <span className="absolute bottom-0 right-0 bg-red-600 text-[9px] font-black px-1 rounded-tl text-white">
                    {galleryCount}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-white/70">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </button>

          {/* Center: Big Round Shutter Button with Spray Can Halo */}
          <button
            onClick={onShutterTap}
            disabled={isTakingPhotos}
            aria-label={isSingleRetake ? `Retake shot ${retakingIndex + 1}` : "Take 4 photos"}
            className="group relative flex items-center justify-center w-20 h-20 rounded-full border-[4px] border-white active:scale-92 transition-all duration-150 disabled:opacity-50 disabled:scale-95 focus:outline-none shadow-[0_0_24px_rgba(250,204,21,0.45)]"
          >
            {/* Inner circle */}
            <span
              className={`rounded-full transition-all duration-200 ${
                isTakingPhotos
                  ? "w-8 h-8 bg-red-500 rounded-lg animate-pulse"
                  : isSingleRetake
                  ? "w-[62px] h-[62px] bg-amber-400 group-active:bg-amber-300"
                  : "w-[62px] h-[62px] bg-white group-active:bg-neutral-200 shadow-inner"
              }`}
            />
          </button>

          {/* Right: Gallery Shortcut Button styled with orange street vibe */}
          <button
            onClick={onOpenGallery}
            disabled={isTakingPhotos}
            aria-label="View gallery"
            className="w-12 h-12 flex flex-col items-center justify-center rounded-2xl bg-neutral-900/90 backdrop-blur-md border border-white/20 active:scale-95 transition-transform disabled:opacity-40 text-neutral-300 hover:text-white shadow-xl"
          >
            <span className="text-base">🎞️</span>
            <span className="text-[8px] font-black tracking-tight uppercase text-amber-400 mt-0.5">
              Gallery
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
