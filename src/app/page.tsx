"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { CameraView } from "@/components/CameraView";
import { ResultsView } from "@/components/ResultsView";
import { PermissionDeniedView } from "@/components/PermissionDeniedView";
import { Toast } from "@/components/Toast";
import { createPhotoStrip, StripFilter } from "@/lib/photostrip";
import {
  playCountdownBeep,
  playShutterSound,
  unlockAudio,
  triggerHapticVibration,
} from "@/lib/sounds";
import { generateDemoFrame } from "@/lib/demomode";

export default function PhotoBoothApp() {
  // Camera & permission states
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [permissionError, setPermissionError] = useState<"denied" | "not_found" | "error" | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoFrameIndex, setDemoFrameIndex] = useState(0);

  // Photo sequence states
  const [isTakingPhotos, setIsTakingPhotos] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Single photo retake state
  const [retakingIndex, setRetakingIndex] = useState<number | null>(null);
  const [cachedStripUrl, setCachedStripUrl] = useState<string | null>(null);
  const [cachedStripBlob, setCachedStripBlob] = useState<Blob | null>(null);

  // Results & strip states
  const [stripUrl, setStripUrl] = useState<string | null>(null);
  const [stripBlob, setStripBlob] = useState<Blob | null>(null);
  const [activeFilter, setActiveFilter] = useState<StripFilter>("normal");
  const [isGeneratingStrip, setIsGeneratingStrip] = useState(false);

  // UI feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Stop active camera stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Request camera access and attach to video element
  const startCamera = useCallback(
    async (mode: "user" | "environment" = facingMode) => {
      setIsDemoMode(false);
      stopStream();

      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false);
        setPermissionError("not_found");
        return;
      }

      try {
        setPermissionError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        streamRef.current = stream;
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch {
            // Auto-play handle
          }
        }
      } catch (err: unknown) {
        const error = err as { name?: string };
        console.warn("Camera access failed:", error);
        setHasPermission(false);
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          setPermissionError("denied");
        } else if (
          error.name === "NotFoundError" ||
          error.name === "DevicesNotFoundError"
        ) {
          setPermissionError("not_found");
        } else {
          setPermissionError("error");
        }
      }
    },
    [facingMode, stopStream]
  );

  // Initialize camera on mount
  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopStream();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [facingMode, startCamera, stopStream]);

  // Handle switching front/back camera
  const handleFlipCamera = () => {
    if (isTakingPhotos) return;
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Toggle demo camera mode
  const handleUseDemo = () => {
    stopStream();
    setIsDemoMode(true);
    setHasPermission(true);
    setPermissionError(null);
    setDemoFrameIndex(0);
    showToast("Switched to Demo Camera");
  };

  // Start single photo retake mode
  const handleStartSingleRetake = (index: number) => {
    setRetakingIndex(index);
    setCachedStripUrl(stripUrl);
    setCachedStripBlob(stripBlob);
    setStripUrl(null);
    if (isDemoMode) {
      setDemoFrameIndex(index);
    }
    showToast(`Position for Shot ${index + 1}`);
  };

  // Cancel single photo retake mode
  const handleCancelSingleRetake = () => {
    setRetakingIndex(null);
    setStripUrl(cachedStripUrl);
    setStripBlob(cachedStripBlob);
  };

  // Capture current video frame into high-res data URL
  const captureCurrentFrame = (): string => {
    if (isDemoMode) {
      return generateDemoFrame(demoFrameIndex);
    }

    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) {
      return generateDemoFrame(demoFrameIndex);
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Mirror horizontally for front-facing selfie camera
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.95);
  };

  // Sequence to take photos (either full 4 shots or single retake)
  const startPhotoBoothSequence = async () => {
    if (isTakingPhotos) return;

    // Immediately unlock Web Audio API in the user gesture call stack (required for iOS Safari)
    unlockAudio();
    setIsTakingPhotos(true);

    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    // MODE A: Retaking just one single photo
    if (retakingIndex !== null) {
      const targetIdx = retakingIndex;
      setCurrentPhotoIndex(targetIdx);
      if (isDemoMode) {
        setDemoFrameIndex(targetIdx);
      }

      // 3-2-1 Countdown with audible beeps
      setCountdown(3);
      if (soundEnabled) playCountdownBeep(3);
      await wait(1000);

      setCountdown(2);
      if (soundEnabled) playCountdownBeep(2);
      await wait(1000);

      setCountdown(1);
      if (soundEnabled) playCountdownBeep(1);
      await wait(1000);

      // SNAP!
      setCountdown(null);
      setIsFlashing(true);
      if (soundEnabled) playShutterSound();
      triggerHapticVibration();

      const newPhotoUrl = captureCurrentFrame();
      const updatedPhotos = [...capturedPhotos];
      updatedPhotos[targetIdx] = newPhotoUrl;
      setCapturedPhotos(updatedPhotos);

      await wait(180);
      setIsFlashing(false);
      setIsTakingPhotos(false);
      setRetakingIndex(null);

      // Re-generate photo strip with the updated photo
      setIsGeneratingStrip(true);
      try {
        const { dataUrl, blob } = await createPhotoStrip(updatedPhotos, {
          filter: activeFilter,
        });
        setStripUrl(dataUrl);
        setStripBlob(blob);
        showToast(`Shot ${targetIdx + 1} updated!`);
      } catch (err) {
        console.error("Failed regenerating strip:", err);
        showToast("Error updating photo strip");
      } finally {
        setIsGeneratingStrip(false);
      }
      return;
    }

    // MODE B: Full 4-shot photo booth sequence
    setCapturedPhotos([]);
    const photos: string[] = [];

    for (let i = 0; i < 4; i++) {
      setCurrentPhotoIndex(i);
      if (isDemoMode) {
        setDemoFrameIndex(i);
      }

      // 3-2-1 Countdown with crisp audible beeps
      setCountdown(3);
      if (soundEnabled) playCountdownBeep(3);
      await wait(1000);

      setCountdown(2);
      if (soundEnabled) playCountdownBeep(2);
      await wait(1000);

      setCountdown(1);
      if (soundEnabled) playCountdownBeep(1);
      await wait(1000);

      // SNAP! Flash screen, play shutter sound, trigger vibration
      setCountdown(null);
      setIsFlashing(true);
      if (soundEnabled) playShutterSound();
      triggerHapticVibration();

      const photoDataUrl = captureCurrentFrame();
      photos.push(photoDataUrl);
      setCapturedPhotos([...photos]);

      // Flash fade out
      await wait(180);
      setIsFlashing(false);

      // Pause before next pose (if not last photo)
      if (i < 3) {
        await wait(1000);
      }
    }

    // Sequence complete, build the photo strip!
    setIsTakingPhotos(false);
    setIsGeneratingStrip(true);

    try {
      const { dataUrl, blob } = await createPhotoStrip(photos, {
        filter: activeFilter,
      });
      setStripUrl(dataUrl);
      setStripBlob(blob);
    } catch (err) {
      console.error("Failed to generate photo strip:", err);
      showToast("Error creating photo strip");
    } finally {
      setIsGeneratingStrip(false);
    }
  };

  // Handle filter changes on results screen
  const handleFilterChange = async (filter: StripFilter) => {
    setActiveFilter(filter);
    if (capturedPhotos.length === 4) {
      setIsGeneratingStrip(true);
      try {
        const { dataUrl, blob } = await createPhotoStrip(capturedPhotos, {
          filter,
        });
        setStripUrl(dataUrl);
        setStripBlob(blob);
      } catch (err) {
        console.error("Failed updating strip filter:", err);
      } finally {
        setIsGeneratingStrip(false);
      }
    }
  };

  // Handle Save / Share button
  const handleSave = async () => {
    if (!stripBlob || !stripUrl) return;

    const dateStr = new Date().toISOString().slice(0, 10);
    const timeStr = Date.now().toString().slice(-4);
    const filename = `photobooth-${dateStr}-${timeStr}.png`;
    const file = new File([stripBlob], filename, { type: "image/png" });

    // Try native Web Share API with files (iPhone Share Sheet -> "Save Image" to Photos)
    if (
      typeof navigator !== "undefined" &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      try {
        await navigator.share({
          files: [file],
          title: "Photo Booth Strip",
          text: "Here is our photo booth strip!",
        });
        showToast("Opened Share Sheet");
        return;
      } catch (err: unknown) {
        const error = err as { name?: string };
        if (error.name === "AbortError") {
          return;
        }
        console.warn("Share failed, falling back to download:", error);
      }
    }

    // Fallback: Direct download for Laptop/Desktop or unsupported mobile browsers
    try {
      const a = document.createElement("a");
      a.href = stripUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast("Photo strip saved to Downloads!");
    } catch (err) {
      console.error("Download failed:", err);
      showToast("Could not download image");
    }
  };

  // Retake all: return to camera
  const handleRetakeAll = () => {
    setCapturedPhotos([]);
    setStripUrl(null);
    setStripBlob(null);
    setRetakingIndex(null);
    setIsTakingPhotos(false);
    setCountdown(null);
    setCurrentPhotoIndex(0);
    if (!isDemoMode) {
      startCamera(facingMode);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-black text-white select-none overflow-hidden">
      <Toast message={toastMessage} />

      {/* Permission Denied Screen */}
      {hasPermission === false && (
        <PermissionDeniedView
          onRetry={() => startCamera(facingMode)}
          onUseDemo={handleUseDemo}
          errorType={permissionError}
        />
      )}

      {/* Results View (when 4 photos are captured & strip generated) */}
      {hasPermission !== false && stripUrl && (
        <ResultsView
          stripUrl={stripUrl}
          activeFilter={activeFilter}
          isGenerating={isGeneratingStrip}
          onFilterChange={handleFilterChange}
          onSave={handleSave}
          onRetake={handleRetakeAll}
          onRetakeSinglePhoto={handleStartSingleRetake}
        />
      )}

      {/* Live Camera Viewfinder */}
      {hasPermission !== false && !stripUrl && (
        <CameraView
          videoRef={videoRef}
          facingMode={facingMode}
          isTakingPhotos={isTakingPhotos}
          currentPhotoIndex={currentPhotoIndex}
          countdown={countdown}
          isFlashing={isFlashing}
          capturedPhotos={capturedPhotos}
          soundEnabled={soundEnabled}
          isDemoMode={isDemoMode}
          demoFrameIndex={demoFrameIndex}
          retakingIndex={retakingIndex}
          onCancelRetake={handleCancelSingleRetake}
          onShutterTap={startPhotoBoothSequence}
          onFlipCamera={handleFlipCamera}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
        />
      )}
    </div>
  );
}
