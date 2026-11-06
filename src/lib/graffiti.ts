// Canvas Graffiti Rendering Library
// Inspired by the pop-up street art mirror studio (dripping spray tags, stencils, street stickers, caution decals)

export function drawSprayDrip(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  length: number,
  thickness: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = thickness * 2;

  // Tapered drip line
  ctx.beginPath();
  ctx.moveTo(startX - thickness / 2, startY);
  ctx.lineTo(startX + thickness / 2, startY);
  ctx.lineTo(startX + (thickness * 0.4), startY + length - thickness * 1.5);
  ctx.lineTo(startX - (thickness * 0.4), startY + length - thickness * 1.5);
  ctx.closePath();
  ctx.fill();

  // Teardrop bead at the end of the drip
  ctx.beginPath();
  ctx.arc(startX, startY + length - thickness, thickness * 1.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawSprayStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = radius * 0.8;

  ctx.beginPath();
  // 4-pointed graffiti sparkle star
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    const rOuter = radius;
    const rInner = radius * 0.22;

    const xOuter = cx + Math.cos(angle) * rOuter;
    const yOuter = cy + Math.sin(angle) * rOuter;

    const angleInner = angle + Math.PI / 4;
    const xInner = cx + Math.cos(angleInner) * rInner;
    const yInner = cy + Math.sin(angleInner) * rInner;

    if (i === 0) ctx.moveTo(xOuter, yOuter);
    else ctx.lineTo(xOuter, yOuter);

    ctx.lineTo(xInner, yInner);
  }
  ctx.closePath();
  ctx.fill();

  // Center spray dot
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

export function drawSpraySplatter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  count: number,
  spread: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * spread;
    const r = Math.random() * 3 + 1;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawCautionSticker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  sub: string
) {
  ctx.save();
  // Slight sticker tilt
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(-0.04);
  ctx.translate(-w / 2, -h / 2);

  // Sticker shadow
  ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  // Fluorescent green/lime sticker body
  ctx.fillStyle = "#84cc16"; // Lime-500
  ctx.fillRect(0, 0, w, h);

  // Inner black border
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 3;
  ctx.strokeRect(4, 4, w - 8, h - 8);

  // Sticker text
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#000000";
  ctx.font = "900 18px 'Impact', 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(title, w / 2, h / 2 - 8);

  ctx.font = "bold 11px monospace";
  ctx.letterSpacing = "1px";
  ctx.fillText(sub, w / 2, h / 2 + 10);

  ctx.restore();
}

export function drawCircleSticker(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  text: string
) {
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 4, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, cx, cy);

  ctx.restore();
}

/**
 * Decorates a photo strip with the full reference graffiti mirror studio aesthetic
 */
export function applyGraffitiThemeToStrip(
  ctx: CanvasRenderingContext2D,
  stripWidth: number,
  stripHeight: number,
  footerStartY: number,
  footerHeight: number,
  dateText: string
) {
  ctx.save();

  // 1. Yellow & Cyan Spray Paint bursts around margins (like background wall in reference)
  drawSpraySplatter(ctx, 45, 120, 18, 50, "rgba(250, 204, 21, 0.7)"); // Yellow
  drawSpraySplatter(ctx, stripWidth - 50, 220, 22, 60, "rgba(6, 182, 212, 0.7)"); // Cyan
  drawSpraySplatter(ctx, 45, 1400, 25, 55, "rgba(37, 99, 235, 0.6)"); // Blue
  drawSpraySplatter(ctx, stripWidth - 45, 2100, 20, 50, "rgba(239, 68, 68, 0.6)"); // Red

  // 2. Yellow & Blue Spray Stars
  drawSprayStar(ctx, 38, 380, 24, "#facc15"); // Chrome yellow star
  drawSprayStar(ctx, stripWidth - 40, 780, 28, "#2563eb"); // Cobalt blue star
  drawSprayStar(ctx, 36, 1750, 26, "#ef4444"); // Red star
  drawSprayStar(ctx, stripWidth - 36, 2350, 22, "#facc15"); // Yellow star

  // 3. Top Graffiti Tag Header: "JOT STUDIO" & Star
  ctx.save();
  ctx.fillStyle = "#09090b";
  ctx.font = "900 32px 'Impact', 'Arial Black', sans-serif";
  ctx.textAlign = "center";
  ctx.letterSpacing = "6px";
  ctx.fillText("✦ JOT PHOTO BOOTH ✦", stripWidth / 2, 40);
  ctx.restore();

  // 4. "WAS HERE..." Dripping Red Spray Paint Tag (Exact match to mirror in reference photo!)
  const tagY = footerStartY + 65;
  ctx.save();
  ctx.translate(stripWidth / 2, tagY);
  ctx.rotate(-0.03); // Classic slanted graffiti handstyle

  ctx.fillStyle = "#ef4444";
  ctx.shadowColor = "rgba(239, 68, 68, 0.8)";
  ctx.shadowBlur = 16;
  ctx.font = "italic 900 68px 'Brush Script MT', 'Impact', cursive, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("was here...", 0, 0);

  // Secondary layer for rich overspray
  ctx.fillText("was here...", 0, 0);

  // Paint drips dripping down from the letters
  drawSprayDrip(ctx, -140, 18, 48, 4.5, "#dc2626"); // From 'w'
  drawSprayDrip(ctx, -75, 20, 68, 5.0, "#ef4444"); // From 'a'
  drawSprayDrip(ctx, -20, 22, 36, 4.0, "#dc2626"); // From 's'
  drawSprayDrip(ctx, 45, 22, 85, 5.5, "#ef4444"); // Big drip from 'h'
  drawSprayDrip(ctx, 110, 20, 52, 4.0, "#dc2626"); // From 'e'
  drawSprayDrip(ctx, 160, 22, 42, 3.5, "#ef4444"); // From '.'
  ctx.restore();

  // 5. Street Art Stickers in Footer (From right side of reference photo)
  // Caution sticker: "NO WORK • ALL VIBES"
  drawCautionSticker(ctx, 80, footerStartY + 140, 240, 58, "NO MORE WORK", "BUT MORE PHOTO");

  // Orange circle sticker: "NICE TO MEET"
  drawCircleSticker(ctx, stripWidth - 140, footerStartY + 168, 42, "#ea580c", "NICE TO MEET");

  // 6. Bold Streetwear Footer Branding
  ctx.save();
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 28px 'Impact', sans-serif";
  ctx.letterSpacing = "4px";
  ctx.textAlign = "center";
  ctx.fillText("READY TO GO • THEN GO", stripWidth / 2, footerStartY + 230);

  // Date and Time in clean monospace stencil
  ctx.fillStyle = "#475569";
  ctx.font = "700 22px monospace";
  ctx.letterSpacing = "3px";
  ctx.fillText(dateText.toUpperCase(), stripWidth / 2, footerStartY + 265);
  ctx.restore();

  ctx.restore();
}
