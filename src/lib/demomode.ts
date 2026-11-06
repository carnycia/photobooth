// Helper to generate fun demo frames when physical camera is unavailable

export function generateDemoFrame(frameIndex: number): string {
  if (typeof window === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 420;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Gradients for 4 distinct poses
  const palettes = [
    ["#ec4899", "#8b5cf6", "#3b82f6"],
    ["#f59e0b", "#ef4444", "#7c3aed"],
    ["#10b981", "#06b6d4", "#3b82f6"],
    ["#6366f1", "#a855f7", "#ec4899"],
  ];
  const colors = palettes[frameIndex % 4];

  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, colors[0]);
  grad.addColorStop(0.5, colors[1]);
  grad.addColorStop(1, colors[2]);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorative bokeh / light circles in background
  ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(
      (canvas.width * (i * 37 % 100)) / 100,
      (canvas.height * (i * 53 % 100)) / 100,
      40 + (i * 20),
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Draw simulated selfie avatar
  const emojis = ["✌️", "😎", "😜", "📸"];
  const emoji = emojis[frameIndex % 4];

  ctx.font = "180px -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, canvas.width / 2, canvas.height / 2 - 20);

  // Label
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
  ctx.fillText(`Pose ${frameIndex + 1} of 4`, canvas.width / 2, canvas.height / 2 + 130);

  return canvas.toDataURL("image/jpeg", 0.95);
}
