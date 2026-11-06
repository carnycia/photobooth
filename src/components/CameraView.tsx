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
  onBackToFront?: () => void;
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
  onBackToFront,
}: CameraViewProps) {
  const isFront = facingMode === "user";
  const isSingleRetake = retakingIndex !== null && retakingIndex !== undefined;
  const filterStyle = { filter: getFilterCss(activeFilter) };

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fisheyeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<FisheyeRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Real-time Low-Res Canvas preview loop (320x240 crunchy digicam resolution)
  useEffect(() => {
    if (activeFilter === "fisheye") {
      // Setup Fisheye WebGL renderer
      const canvas = fisheyeCanvasRef.current;
      if (!canvas) return;
      canvas.width = 320;
      canvas.height = 400;

      const renderer = createFisheyeRenderer(canvas);
      rendererRef.current = renderer;

      const fisheyeLoop = () => {
        const video = videoRef.current;
        if (video && video.readyState >= 2 && rendererRef.current) {
          rendererRef.current.render(video, isFront);
        }
        animFrameRef.current = requestAnimationFrame(fisheyeLoop);
      };
      animFrameRef.current = requestAnimationFrame(fisheyeLoop);

      return () => {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        if (rendererRef.current) {
          rendererRef.current.destroy();
          rendererRef.current = null;
        }
      };
    }

    // Standard / Low-Res digicam render loop
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    canvas.width = 320;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderLoop = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        ctx.save();
        if (isFront) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [activeFilter, isFront, videoRef]);

  return (
    <div className="relative w-full h-full min-h-screen bg-black overflow-hidden flex items-center justify-center p-2 sm:p-4 select-none">
      {/* Hidden helper for iOS Safari haptic switch event */}
      <input
        type="checkbox"
        id="ios-haptic-trigger"
        className="sr-only pointer-events-none"
        tabIndex={-1}
        aria-hidden="true"
        readOnly
      />

      {/* Hidden Source Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="sr-only pointer-events-none"
      />

      {/* =========================================================================
          THE IPOD CHASSIS (WINDOW 2)
          Full-scale iPod casing with an expanded picture window taking up ~68%
          ========================================================================= */}
      <div className="relative w-full max-w-[420px] sm:max-w-[460px] h-full max-h-[96vh] sm:max-h-[94vh] aspect-[452/772] rounded-[2.5rem] bg-gradient-to-b from-[#f8fafc] via-[#edf2f7] to-[#cbd5e1] border-[3px] border-[#c0c7d2] shadow-[0_25px_60px_rgba(0,0,0,0.9),inset_0_1px_3px_rgba(255,255,255,0.9)] flex flex-col justify-between p-3.5 sm:p-4 overflow-hidden">
        
        {/* =========================================================================
            1. THE BIGGER PICTURE WINDOW (~68% of iPod height)
            Framed with authentic black iPod LCD bezel and low-res pixelated feed
            ========================================================================= */}
        <div className="relative w-full h-[68%] rounded-2xl bg-black border-2 border-neutral-700/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between">
          
          {/* Top Status Bar inside the picture window */}
          <div className="relative z-30 w-full pt-2.5 px-3 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
            {/* Left: Go back to front iPod screen */}
            {onBackToFront && !isSingleRetake && (
              <button
                onClick={onBackToFront}
                disabled={isTakingPhotos}
                aria-label="Go back to the front"
                className="h-8 px-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-black text-white hover:text-amber-300 flex items-center gap-1 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-40"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Front</span>
              </button>
            )}

            {isSingleRetake && onCancelRetake && (
              <button
                onClick={onCancelRetake}
                disabled={isTakingPhotos}
                className="h-8 px-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-neutral-300 flex items-center gap-1"
              >
                Cancel
              </button>
            )}

            {/* Center: Shot Counter / Indicator */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-wider text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>
                {isSingleRetake
                  ? `SHOT ${retakingIndex + 1}`
                  : `${capturedPhotos.length} / 4 SHOTS`}
              </span>
            </div>

            {/* Right: Sound & Camera Flip Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onToggleSound}
                disabled={isTakingPhotos}
                aria-label={soundEnabled ? "Mute audio" : "Unmute audio"}
                className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-xs active:scale-95"
              >
                {soundEnabled ? "🔊" : "🔇"}
              </button>
              <button
                onClick={onFlipCamera}
                disabled={isTakingPhotos || isDemoMode}
                aria-label="Flip camera"
                className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Low-Res Viewfinder Display Area */}
          <div
            className={`absolute inset-0 w-full h-full overflow-hidden bg-neutral-950 flex items-center justify-center ${
              isFlashing ? "animate-camera-recoil" : ""
            }`}
          >
            {isDemoMode ? (
              <div
                style={filterStyle}
                className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gradient-to-tr from-neutral-900 to-neutral-800"
              >
                <div className="text-6xl mb-2 animate-bounce">
                  {demoFrameIndex === 0
                    ? "✌️"
                    : demoFrameIndex === 1
                    ? "😎"
                    : demoFrameIndex === 2
                    ? "😜"
                    : "🎉"}
                </div>
                <p className="text-white/60 text-xs font-mono">DEMO CAMERA ACTIVE</p>
              </div>
            ) : (
              <>
                {/* 60 FPS Pixelated Low-Res Canvas Viewfinder */}
                {activeFilter !== "fisheye" ? (
                  <canvas
                    ref={previewCanvasRef}
                    style={{
                      ...filterStyle,
                      imageRendering: "pixelated",
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <canvas
                    ref={fisheyeCanvasRef}
                    style={{
                      imageRendering: "pixelated",
                    }}
                    className="w-full h-full object-cover"
                  />
                )}
              </>
            )}

            {/* Flash Overlay */}
            {isFlashing && (
              <div className="absolute inset-0 z-40 bg-white pointer-events-none animate-camera-flash" />
            )}

            {/* Countdown Overlay during shooting */}
            {isTakingPhotos && (
              <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none bg-black/20">
                {countdown !== null ? (
                  <div
                    key={countdown}
                    className="flex items-center justify-center w-28 h-28 rounded-full bg-black/60 backdrop-blur-md border-3 border-amber-400 text-yellow-300 font-black text-6xl shadow-2xl animate-in zoom-in-75 duration-200"
                    style={{
                      fontFamily: "'Impact', 'Arial Black', sans-serif",
                      textShadow: "0 0 20px #facc15",
                    }}
                  >
                    {countdown}
                  </div>
                ) : (
                  <div className="px-5 py-2 rounded-xl bg-red-600 text-white font-black text-xl tracking-wider uppercase animate-pulse shadow-2xl">
                    SNAP! 📸
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Filter Selector Bar inside the picture window */}
          <div className="relative z-30 w-full pb-2 px-2 flex items-center justify-center bg-gradient-to-t from-black/85 via-black/40 to-transparent">
            <div className="flex items-center gap-1 p-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
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
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide transition-all ${
                      isSelected
                        ? "bg-amber-400 text-black shadow-md font-black"
                        : "text-neutral-300 hover:text-white"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. THE IPOD CLICK WHEEL (~28% of iPod height)
            The Center Button is the SHUTTER BUTTON!
            ========================================================================= */}
        <div className="relative w-full h-[28%] flex items-center justify-center">
          {/* Circular Click Wheel */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-tr from-[#cbd5e1] via-[#e2e8f0] to-[#f1f5f9] border border-neutral-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(0,0,0,0.12)] flex items-center justify-center">
            
            {/* Top Label: MENU */}
            <span className="absolute top-2.5 text-[10px] font-bold text-neutral-500 font-mono tracking-widest uppercase">
              MENU
            </span>

            {/* Left Button: Gallery Thumbnail */}
            <button
              onClick={onOpenGallery}
              disabled={isTakingPhotos}
              aria-label="View Gallery"
              className="absolute left-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs text-neutral-700 active:scale-90 transition-transform cursor-pointer"
            >
              🎞️
            </button>

            {/* Right Button: Next Filter */}
            <button
              onClick={onFlipCamera}
              disabled={isTakingPhotos || isDemoMode}
              aria-label="Flip Camera"
              className="absolute right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-xs text-neutral-700 active:scale-90 transition-transform cursor-pointer"
            >
              🔄
            </button>

            {/* Bottom Button: Play / Pause icon */}
            <span className="absolute bottom-2.5 text-[9px] text-neutral-500 font-mono">
              ▶ ⏸
            </span>

            {/* =====================================================================
                CENTER BUTTON = THE SHUTTER BUTTON 📸
                ===================================================================== */}
            <button
              onClick={onShutterTap}
              disabled={isTakingPhotos}
              aria-label={isSingleRetake ? `Retake shot ${retakingIndex + 1}` : "Take 4 photos"}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 transition-all duration-100 flex items-center justify-center cursor-pointer shadow-md focus:outline-none ${
                isTakingPhotos
                  ? "bg-red-500 border-red-600 animate-pulse scale-95"
                  : "bg-gradient-to-b from-white to-[#edf2f7] border-neutral-300 hover:border-neutral-400 active:scale-90 shadow-[0_2px_5px_rgba(0,0,0,0.15)]"
              }`}
            >
              <span
                className={`transition-all ${
                  isTakingPhotos ? "text-white text-xs font-bold" : "text-xl sm:text-2xl"
                }`}
              >
                {isTakingPhotos ? "REC" : "📸"}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
