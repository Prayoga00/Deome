/**
 * Generates an SVG objectBoundingBox path [0..1] for a superellipse (squircle)
 * matching the Glaze specification: exponent 4.2, sampled at 160 points.
 */
export function buildSuperellipsePath(exponent = 4.2, samples = 160): string {
  const power = 2 / exponent;
  const commands: string[] = [];

  for (let i = 0; i < samples; i++) {
    const theta = (i / samples) * Math.PI * 2;
    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);

    const x = 0.5 + 0.5 * Math.sign(cosT) * Math.pow(Math.abs(cosT), power);
    const y = 0.5 + 0.5 * Math.sign(sinT) * Math.pow(Math.abs(sinT), power);

    const cmd = i === 0 ? 'M' : 'L';
    commands.push(`${cmd}${x.toFixed(5)},${y.toFixed(5)}`);
  }

  commands.push('Z');
  return commands.join(' ');
}

export const DEOME_SQUIRCLE_PATH = buildSuperellipsePath(4.2, 160);
