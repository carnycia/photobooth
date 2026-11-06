// Canvas-based vertical photobooth strip generator
import { CameraFilter, getFilterCss } from "./filters";
import { applyFisheyeToImage } from "./fisheye";
import { applyGraffitiThemeToStrip } from "./graffiti";

export type StripFilter = CameraFilter | "normal" | "sepia" | "vintage" | "cool";
export type StripTheme = "graffiti" | "classic";

export interface StripOptions {
  filter?: StripFilter;
  theme?: StripTheme;
  isSquished?: boolean;
  dateText?: string;
  title?: string;
}

export async function createPhotoStrip(
  photos: string[],
  options: StripOptions = {}
): Promise<{ dataUrl: string; blob: Blob }> {
  const {
    filter = "original",
    theme = "graffiti",
    isSquished = true,
    dateText = formatDefaultDate(new Date()),
    title = "PHOTO BOOTH",
  } = options;

  // Load all 4 photos as HTMLImageElements
  const images = await Promise.all(
    photos.slice(0, 4).map(
      (src) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        })
    )
  );

  // Dimensions for high-res photo strip
  const stripWidth = 1080;
  const outerMarginX = 56;
  const outerMarginTop = 56;
  const photoGap = 34;

  const photoWidth = stripWidth - outerMarginX * 2; // 968px
  const photoHeight = isSquished
    ? Math.round(photoWidth * (420 / 320)) // 1270px (squished 320:420 aspect ratio)
    : Math.round(photoWidth * 0.72);       // 697px (unsquished standard 4:3 aspect ratio)

  const photosTotalHeight =
    images.length * photoHeight + (images.length - 1) * photoGap;
  const footerHeight = 310;
  const stripHeight = outerMarginTop + photosTotalHeight + footerHeight;

  const canvas = document.createElement("canvas");
  canvas.width = stripWidth;
  canvas.height = stripHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  // Fill crisp white photo strip paper background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, stripWidth, stripHeight);

  // Apply photo filter if requested
  function applyCanvasFilter(context: CanvasRenderingContext2D, f: StripFilter) {
    context.filter = getFilterCss(f);
  }

  // Draw each photo (squished or unsquished)
  images.forEach((img, i) => {
    const photoY = outerMarginTop + i * (photoHeight + photoGap);

    ctx.save();
    // Rounded photo frame or crisp edge
    const radius = 10;
    drawRoundedRect(ctx, outerMarginX, photoY, photoWidth, photoHeight, radius);
    ctx.clip();

    if (filter === "fisheye") {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = photoWidth;
      tempCanvas.height = photoHeight;
      const tCtx = tempCanvas.getContext("2d");
      if (tCtx) {
        if (isSquished) {
          tCtx.drawImage(img, 0, 0, photoWidth, photoHeight);
        } else {
          drawImageProp(tCtx, img, 0, 0, photoWidth, photoHeight);
        }
        const fisheyeCanvas = applyFisheyeToImage(tempCanvas, photoWidth, photoHeight);
        ctx.drawImage(fisheyeCanvas, outerMarginX, photoY, photoWidth, photoHeight);
      }
    } else {
      applyCanvasFilter(ctx, filter);
      if (isSquished) {
        ctx.drawImage(img, outerMarginX, photoY, photoWidth, photoHeight);
      } else {
        drawImageProp(ctx, img, outerMarginX, photoY, photoWidth, photoHeight);
      }
    }

    ctx.restore();

    // Subtle inner hairline border around each photo for depth
    ctx.save();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 2;
    drawRoundedRect(ctx, outerMarginX, photoY, photoWidth, photoHeight, radius);
    ctx.stroke();
    ctx.restore();
  });

  // Reset filter for footer drawing
  ctx.filter = "none";

  // Draw Footer Area
  const footerStartY = outerMarginTop + photosTotalHeight;

  if (theme === "graffiti") {
    // Render the street art graffiti theme (exact reference match)
    applyGraffitiThemeToStrip(
      ctx,
      stripWidth,
      stripHeight,
      footerStartY,
      footerHeight,
      dateText
    );
  } else {
    // Classic Minimalist Theme
    ctx.fillStyle = "#111827";
    ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦  ✦  ✦", stripWidth / 2, footerStartY + 55);

    ctx.fillStyle = "#0f172a";
    ctx.font = "800 42px -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText(title, stripWidth / 2, footerStartY + 115);

    ctx.fillStyle = "#64748b";
    ctx.font = "600 24px -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText(dateText.toUpperCase(), stripWidth / 2, footerStartY + 170);

    const serial = `PB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    ctx.fillStyle = "#94a3b8";
    ctx.font = "500 18px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText(serial, stripWidth / 2, footerStartY + 230);

    drawSimulatedBarcode(ctx, stripWidth / 2, footerStartY + 265, 240, 24);
  }

  // Convert canvas to Data URL and Blob
  const dataUrl = canvas.toDataURL("image/png", 0.95);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Canvas toBlob failed"));
      },
      "image/png",
      0.95
    );
  });

  return { dataUrl, blob };
}

function formatDefaultDate(d: Date): string {
  const months = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
  ];
  const m = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${m} ${day}, ${year} • ${hours}:${minutes} ${ampm}`;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Draws image with object-fit: cover center-cropped into destination rectangle
 */
function drawImageProp(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const nw = img.naturalWidth || img.width;
  const nh = img.naturalHeight || img.height;
  const r = Math.min(w / nw, h / nh);
  let nwScaled = nw * r;
  let nhScaled = nh * r;
  let cx = 1;
  let cy = 1;

  // Decide if we need to scale up to cover
  if (Math.round(nwScaled) < w) {
    cx = w / nwScaled;
  }
  if (Math.round(nhScaled) < h) {
    cy = h / nhScaled;
  }

  const factor = Math.max(cx, cy);
  nwScaled *= factor;
  nhScaled *= factor;

  const sx = (nw - w / (nwScaled / nw)) / 2;
  const sy = (nh - h / (nhScaled / nh)) / 2;
  const sw = w / (nwScaled / nw);
  const sh = h / (nhScaled / nh);

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawSimulatedBarcode(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  totalWidth: number,
  height: number
) {
  const startX = centerX - totalWidth / 2;
  const topY = centerY - height / 2;
  ctx.fillStyle = "#cbd5e1";

  // Pseudo-random barcode bars
  const pattern = [2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 1, 2, 3, 2, 1];
  let curX = startX;
  const step = totalWidth / 48;

  for (let i = 0; i < pattern.length; i++) {
    const barW = Math.max(2, pattern[i] * (step / 3));
    ctx.fillRect(curX, topY, barW, height);
    curX += barW + step * (1 + (i % 2));
    if (curX > startX + totalWidth) break;
  }
}
