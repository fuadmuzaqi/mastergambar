export function drawFrame(ctx, config, frameIndex) {
  const { width, height, totalFrames, title, subtitle, accent, bg } = config;
  const progress = totalFrames <= 1 ? 0 : frameIndex / (totalFrames - 1);
  const t = progress;

  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, bg);
  gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for (let i = 0; i < 10; i += 1) {
    const x = (width / 10) * i + Math.sin(t * Math.PI * 2 + i) * 40;
    const y = height * 0.18 + i * 34;
    ctx.fillRect(x, y, width * 0.2, 2);
  }

  const cardW = width * 0.72;
  const cardH = height * 0.38;
  const cardX = width * 0.14 + Math.sin(t * Math.PI * 2) * 50;
  const cardY = height * 0.28 + Math.cos(t * Math.PI * 2) * 20;

  ctx.fillStyle = 'rgba(15,23,42,0.6)';
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.fillRect(cardX + 32, cardY + 36, 110 + Math.sin(t * Math.PI) * 80, 8);

  ctx.fillStyle = '#ffffff';
  ctx.font = `700 ${Math.max(34, width * 0.03)}px Inter, Arial, sans-serif`;
  ctx.fillText(title, cardX + 32, cardY + 110);

  ctx.fillStyle = 'rgba(255,255,255,0.78)';
  ctx.font = `400 ${Math.max(18, width * 0.015)}px Inter, Arial, sans-serif`;
  wrapText(ctx, subtitle, cardX + 32, cardY + 160, cardW - 64, Math.max(28, width * 0.02));

  const orbX = width * (0.2 + progress * 0.6);
  const orbY = height * 0.82;
  const radius = 28 + Math.sin(t * Math.PI * 4) * 8;
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(orbX, orbY, radius, 0, Math.PI * 2);
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (let n = 0; n < words.length; n += 1) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, currentY);
      line = `${words[n]} `;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}
