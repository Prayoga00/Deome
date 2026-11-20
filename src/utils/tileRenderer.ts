export type TileVariant = 0 | 1 | 2 | 3 | 4;

/**
 * Draws a single frame of one of the 5 bespoke Deome motion-graphics tiles
 * onto a square HTML5 2D canvas, inheriting Glaze's cobalt / sky-blue / #ff5512 palette.
 */
export function drawDeomeTile(
  ctx: CanvasRenderingContext2D,
  size: number,
  variant: TileVariant,
  t: number
): void {
  ctx.save();
  ctx.clearRect(0, 0, size, size);

  switch (variant) {
    case 0:
      drawPillowStar(ctx, size, t);
      break;
    case 1:
      drawCobaltDeome(ctx, size, t);
      break;
    case 2:
      drawHalftoneBlob(ctx, size, t);
      break;
    case 3:
      drawFypPlanStreaks(ctx, size, t);
      break;
    case 4:
      drawKineticViralRows(ctx, size, t);
      break;
  }

  ctx.restore();
}

function drawPillowStar(ctx: CanvasRenderingContext2D, s: number, t: number) {
  // Puffy pale sky-blue pillow base
  const bg = ctx.createRadialGradient(s * 0.34, s * 0.28, s * 0.04, s * 0.5, s * 0.5, s * 0.72);
  bg.addColorStop(0, '#eef7ff');
  bg.addColorStop(0.55, '#b9dafc');
  bg.addColorStop(1, '#79acee');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, s, s);

  // Subtle pillow pillow-bevel shading
  const innerShade = ctx.createRadialGradient(s * 0.5, s * 0.5, s * 0.28, s * 0.5, s * 0.5, s * 0.65);
  innerShade.addColorStop(0, 'rgba(255,255,255,0)');
  innerShade.addColorStop(1, 'rgba(34,68,140,0.34)');
  ctx.fillStyle = innerShade;
  ctx.fillRect(0, 0, s, s);

  // Glossy tangerine 3D star bulging from centre
  const pulse = 1 + 0.055 * Math.sin(t * 2.4);
  const rot = Math.sin(t * 1.3) * 0.14;
  ctx.save();
  ctx.translate(s * 0.5, s * 0.5);
  ctx.rotate(rot);
  ctx.scale(pulse, pulse);

  // Soft drop shadow beneath star
  ctx.shadowColor = 'rgba(20, 48, 120, 0.32)';
  ctx.shadowBlur = s * 0.12;
  ctx.shadowOffsetY = s * 0.05;

  const points = 5;
  const outerR = s * 0.31;
  const innerR = s * 0.155;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const nextAngle = ((i + 1) * Math.PI) / points - Math.PI / 2;
    const nextR = (i + 1) % 2 === 0 ? outerR : innerR;
    const x1 = Math.cos(angle) * r;
    const y1 = Math.sin(angle) * r;
    const x2 = Math.cos(nextAngle) * nextR;
    const y2 = Math.sin(nextAngle) * nextR;
    if (i === 0) {
      ctx.moveTo((x1 + x2) * 0.5, (y1 + y2) * 0.5);
    }
    const midNextAngle = ((i + 2) * Math.PI) / points - Math.PI / 2;
    const midNextR = (i + 2) % 2 === 0 ? outerR : innerR;
    const x3 = Math.cos(midNextAngle) * midNextR;
    const y3 = Math.sin(midNextAngle) * midNextR;
    ctx.quadraticCurveTo(x2, y2, (x2 + x3) * 0.5, (y2 + y3) * 0.5);
  }
  ctx.closePath();

  const starGrad = ctx.createRadialGradient(-s * 0.07, -s * 0.08, s * 0.02, 0, 0, outerR);
  starGrad.addColorStop(0, '#ffd0a6');
  starGrad.addColorStop(0.28, '#ff7733');
  starGrad.addColorStop(0.72, '#ff5512');
  starGrad.addColorStop(1, '#b82800');
  ctx.fillStyle = starGrad;
  ctx.fill();

  // Top glossy specular highlight
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.42)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.055, -s * 0.09, s * 0.075, s * 0.032, -0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCobaltDeome(ctx: CanvasRenderingContext2D, s: number, t: number) {
  const bg = ctx.createLinearGradient(0, 0, s, s);
  bg.addColorStop(0, '#0a144a');
  bg.addColorStop(0.55, '#1430e0');
  bg.addColorStop(1, '#081038');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, s, s);

  // Moving aura behind wordmark
  const gx = s * (0.5 + 0.16 * Math.cos(t * 1.4));
  const gy = s * (0.5 + 0.14 * Math.sin(t * 1.1));
  const aura = ctx.createRadialGradient(gx, gy, s * 0.02, gx, gy, s * 0.48);
  aura.addColorStop(0, 'rgba(130, 195, 255, 0.72)');
  aura.addColorStop(0.5, 'rgba(20, 48, 224, 0.25)');
  aura.addColorStop(1, 'rgba(10, 20, 74, 0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, s, s);

  // Soft glowing "deome" wordmark
  const driftX = Math.sin(t * 1.8) * s * 0.025;
  const driftY = Math.cos(t * 1.5) * s * 0.015;
  ctx.save();
  ctx.translate(s * 0.5 + driftX, s * 0.52 + driftY);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${Math.round(s * 0.24)}px "Inter Tight", system-ui, sans-serif`;

  ctx.shadowColor = 'rgba(180, 225, 255, 0.95)';
  ctx.shadowBlur = s * 0.12;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillText('deome', 0, 0);

  ctx.shadowBlur = s * 0.03;
  ctx.fillStyle = '#ffffff';
  ctx.fillText('deome', 0, 0);
  ctx.restore();
}

function drawHalftoneBlob(ctx: CanvasRenderingContext2D, s: number, t: number) {
  ctx.fillStyle = '#090c14';
  ctx.fillRect(0, 0, s, s);

  const cols = 15;
  const step = s / (cols + 1);
  const cx1 = s * (0.46 + 0.13 * Math.sin(t * 1.7));
  const cy1 = s * (0.48 + 0.11 * Math.cos(t * 1.3));
  const cx2 = s * (0.56 - 0.12 * Math.cos(t * 1.4));
  const cy2 = s * (0.52 - 0.11 * Math.sin(t * 1.6));

  for (let row = 1; row <= cols; row++) {
    for (let col = 1; col <= cols; col++) {
      const px = col * step;
      const py = row * step;
      const d1 = Math.hypot(px - cx1, py - cy1) / (s * 0.34);
      const d2 = Math.hypot(px - cx2, py - cy2) / (s * 0.28);
      const field = Math.exp(-d1 * d1 * 2.1) + 0.85 * Math.exp(-d2 * d2 * 2.4);

      if (field < 0.14) continue;

      const radius = Math.min(step * 0.44, step * 0.45 * field);
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      if (field > 0.72) {
        ctx.fillStyle = '#ff5512';
      } else if (field > 0.44) {
        ctx.fillStyle = '#4e7bff';
      } else {
        ctx.fillStyle = '#1b3be0';
      }
      ctx.fill();
    }
  }
}

function drawFypPlanStreaks(ctx: CanvasRenderingContext2D, s: number, t: number) {
  ctx.fillStyle = '#0b153c';
  ctx.fillRect(0, 0, s, s);

  // Chromatic vertical light streaks
  const streakCount = 12;
  for (let i = 0; i < streakCount; i++) {
    const phase = (i / streakCount + t * 0.12) % 1;
    const x = phase * s;
    const w = s * (0.04 + 0.03 * Math.sin(i * 1.7 + t));
    const grad = ctx.createLinearGradient(x - w, 0, x + w, 0);
    grad.addColorStop(0, 'rgba(20, 48, 224, 0)');
    grad.addColorStop(0.35, 'rgba(62, 166, 255, 0.55)');
    grad.addColorStop(0.5, 'rgba(210, 240, 255, 0.85)');
    grad.addColorStop(0.7, 'rgba(255, 85, 18, 0.45)');
    grad.addColorStop(1, 'rgba(20, 48, 224, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - w, 0, w * 2, s);
  }

  // Dark contrast vignette behind typography
  const vig = ctx.createRadialGradient(s * 0.5, s * 0.5, s * 0.08, s * 0.5, s * 0.5, s * 0.58);
  vig.addColorStop(0, 'rgba(8, 14, 42, 0.58)');
  vig.addColorStop(1, 'rgba(8, 14, 42, 0.1)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, s, s);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `900 ${Math.round(s * 0.24)}px "Archivo Black", "Inter Tight", sans-serif`;

  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = s * 0.05;
  ctx.fillStyle = '#ff5512';
  ctx.fillText('FYP', s * 0.5, s * 0.39);
  ctx.fillText('PLAN', s * 0.5, s * 0.64);
  ctx.restore();
}

function drawKineticViralRows(ctx: CanvasRenderingContext2D, s: number, t: number) {
  const bg = ctx.createLinearGradient(0, 0, 0, s);
  bg.addColorStop(0, '#ff6a2b');
  bg.addColorStop(0.5, '#ff5512');
  bg.addColorStop(1, '#e03e00');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, s, s);

  const rows = 5;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(s * 0.165)}px "Unbounded", "Inter Tight", sans-serif`;

  for (let r = 0; r < rows; r++) {
    const y = s * (0.14 + r * 0.18);
    const waveX = Math.sin(t * 2.8 + r * 0.85) * s * 0.09;
    const skew = Math.cos(t * 2.8 + r * 0.85) * 0.14;
    ctx.save();
    ctx.translate(s * 0.5 + waveX, y);
    ctx.transform(1, 0, skew, 0.88 + 0.08 * Math.sin(t * 2 + r), 0, 0);
    ctx.fillStyle = r === 2 ? '#ffffff' : 'rgba(255, 255, 255, 0.86)';
    ctx.fillText('VIRAL', 0, 0);
    ctx.restore();
  }
  ctx.restore();
}
