const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function createPng(width, height, pixelFn) {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      raw[offset++] = r;
      raw[offset++] = g;
      raw[offset++] = b;
      raw[offset++] = a;
    }
  }

  const idatData = zlib.deflateSync(raw, { level: 9 });
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, makeChunk('IHDR', ihdr), idat, iend]);
}

// Distance helper
function dist(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}

function renderAppIcon(x, y, size) {
  // Normalize coordinates 0..1
  const u = x / size;
  const v = y / size;

  // Background rounded rect / squircle
  // Corner radius ~ 0.22 of size (iOS standard)
  const cx = 0.5;
  const cy = 0.5;
  
  // Base dark background with subtle radial gradient
  const rBg = dist(u, v, 0.5, 0.3);
  let r = Math.round(24 + 10 * (1 - rBg));
  let g = Math.round(24 + 10 * (1 - rBg));
  let b = Math.round(30 + 15 * (1 - rBg));
  let a = 255;

  // Camera Body (rounded rect from u: 0.15 to 0.85, v: 0.25 to 0.78)
  const inBody = (u >= 0.16 && u <= 0.84 && v >= 0.26 && v <= 0.78);
  if (inBody) {
    // Body gradient
    const bodyG = 0.8 - (v - 0.26);
    r = Math.round(40 + 25 * bodyG);
    g = Math.round(42 + 25 * bodyG);
    b = Math.round(48 + 25 * bodyG);

    // Subtle edge highlight
    if (u <= 0.17 || u >= 0.83 || v <= 0.27 || v >= 0.77) {
      r = Math.min(255, r + 40);
      g = Math.min(255, g + 40);
      b = Math.min(255, b + 45);
    }
  }

  // Camera Top Notch / Viewfinder hump (u: 0.35 to 0.65, v: 0.18 to 0.26)
  if (u >= 0.35 && u <= 0.65 && v >= 0.18 && v <= 0.26) {
    r = 52;
    g = 54;
    b = 60;
  }

  // Flash LED / Viewfinder light (top right: u: 0.72, v: 0.35, r: 0.05)
  const dFlash = dist(u, v, 0.72, 0.36);
  if (dFlash < 0.05) {
    if (dFlash < 0.035) {
      // Warm amber flash
      r = 255;
      g = 210;
      b = 80;
    } else {
      r = 90;
      g = 90;
      b = 95;
    }
  }

  // Red recording dot (top left: u: 0.28, v: 0.36, r: 0.035)
  const dRed = dist(u, v, 0.28, 0.36);
  if (dRed < 0.035) {
    r = 239;
    g = 68;
    b = 68;
  }

  // Central Large Lens (center: 0.5, 0.52)
  const dLens = dist(u, v, 0.5, 0.53);
  if (dLens < 0.23) {
    if (dLens >= 0.20) {
      // Chrome / Silver Outer Ring
      const angle = Math.atan2(v - 0.53, u - 0.5);
      const ringShine = Math.sin(angle * 2) * 40;
      r = Math.min(255, Math.max(0, 180 + ringShine));
      g = Math.min(255, Math.max(0, 185 + ringShine));
      b = Math.min(255, Math.max(0, 195 + ringShine));
    } else if (dLens >= 0.18) {
      // Dark bezel
      r = 25;
      g = 26;
      b = 30;
    } else if (dLens >= 0.12) {
      // Deep blue lens glass
      const glassDist = dLens / 0.18;
      r = Math.round(15 + 10 * glassDist);
      g = Math.round(25 + 20 * glassDist);
      b = Math.round(55 + 50 * glassDist);
      
      // Reflection glare highlight in upper left
      if (dist(u, v, 0.44, 0.47) < 0.045) {
        r = Math.min(255, r + 130);
        g = Math.min(255, g + 150);
        b = Math.min(255, b + 180);
      }
    } else {
      // Lens pupil / aperture center
      r = 10;
      g = 12;
      b = 18;
      // Secondary smaller reflection
      if (dist(u, v, 0.54, 0.57) < 0.02) {
        r = 120;
        g = 140;
        b = 180;
      }
    }
  }

  // Photo booth 4-color strip accent at the bottom (representing the 4 photos!)
  if (v >= 0.84 && v <= 0.88 && u >= 0.25 && u <= 0.75) {
    const stripU = (u - 0.25) / 0.50; // 0..1
    if (stripU < 0.25) {
      // Photo 1: Rose
      r = 244; g = 63; b = 94;
    } else if (stripU < 0.5) {
      // Photo 2: Amber
      r = 245; g = 158; b = 11;
    } else if (stripU < 0.75) {
      // Photo 3: Emerald
      r = 16; g = 185; b = 129;
    } else {
      // Photo 4: Sky
      r = 14; g = 165; b = 233;
    }
  }

  return [Math.max(0, Math.min(255, r)), Math.max(0, Math.min(255, g)), Math.max(0, Math.min(255, b)), a];
}

const sizes = [
  { file: 'public/icons/icon-192.png', size: 192 },
  { file: 'public/icons/icon-512.png', size: 512 },
  { file: 'public/icons/apple-touch-icon.png', size: 180 },
  { file: 'public/apple-touch-icon.png', size: 180 },
];

sizes.forEach(({ file, size }) => {
  console.log(`Generating ${file} (${size}x${size})...`);
  const png = createPng(size, size, (x, y, w, h) => renderAppIcon(x, y, size));
  fs.writeFileSync(path.resolve(process.cwd(), file), png);
});

console.log('All icons generated successfully!');
