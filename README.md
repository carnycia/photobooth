# Photo Booth 📸

A native-feeling iPhone photo booth web app built with Next.js, React 19, and Tailwind CSS. Designed mobile-first for phones, with safe-area support and PWA home screen installation.

## ✨ Features

- **📱 Native iPhone Camera UI**: Full-screen live camera preview (front selfie camera default with flip toggle) and tactile round shutter button.
- **⏱️ 3-2-1 Countdown & Flash**: 3-second countdown before each shot with dual-tone audio beeps, screen recoil vibration, and a realistic mechanical shutter sound.
- **🎞️ 4-Photo Sequence**: Snaps 4 photos in a row with pose indicators (`Pose 1 of 4` through `Pose 4 of 4`).
- **🤍 Classic Vertical Photo Strip**: Composites the 4 snaps onto high-resolution white border photo paper with date/time stamps and branding.
- **🎯 Tap Any Photo to Retake**: Tap any of the 4 photos on the strip (or use the shot selectors) to retake just that single shot without losing the others.
- **🖼️ Persistent Photo Strip Gallery**: A dedicated screen storing every photo strip you've made (backed by IndexedDB for offline, quota-free storage). Browse, view full-screen, re-share, or delete.
- **🐟 90s Fish-Eye Lens**: Real-time WebGL barrel distortion with spherical optical warping, edge chromatic aberration, and a classic circular lens vignette in both the live preview and final strip.
- **🎨 Live Camera Filters**: Switch between **Original**, **Black & White**, **Film**, and **Fisheye** directly above the shutter button with real-time viewfinder updates.
- **📲 Native iOS Share Sheet**: Tapping **Save** invokes the iPhone share sheet to save directly into **Apple Photos** (or downloads the image on a laptop/desktop).
- **🔒 Friendly Permission Screen**: Clear instructions for iOS Safari and desktop browsers if camera access was denied, plus a **Demo Camera** simulation mode.
- **📲 Installable PWA**: Includes web app manifest, standalone display mode, iOS meta tags, and icons for full-screen home screen launching without the Safari address bar.

## 🚀 Getting Started

First, install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or `http://localhost:3001` if 3000 is occupied).

### Running on your iPhone

1. Connect your iPhone to the same Wi-Fi network as your computer.
2. In Safari on your iPhone, navigate to `http://<your-mac-local-ip>:3000`.
3. Tap the **Share** button (<svg style="display:inline;vertical-align:middle;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V3m0 0l-3.5 3.5M12 3l3.5 3.5"/></svg>) and select **"Add to Home Screen"**.
4. Launch **Photo Booth** from your home screen for the full-screen native experience!

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router & Turbopack)
- **UI**: React 19, Tailwind CSS v4
- **Graphics**: HTML5 Canvas compositing & filters
- **Audio**: Web Audio API synthesized tones & mechanical shutter sound
- **Storage**: IndexedDB for persistent local photo strip library
- **Share**: Web Share API Level 2 (files sharing)
