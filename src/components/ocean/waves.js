// The ocean's swell: the floating cubes and the boat camera both ride it, so they move together.
// (The water itself is a flat mirror whose ripples come from a texture, see Environment.js.)

export function wave(x, z, t) {
  return (
    Math.sin(x * 0.08 + t * 0.6) * 0.35 +
    Math.sin(z * 0.11 + t * 0.8) * 0.25 +
    Math.sin((x + z) * 0.05 + t * 0.4) * 0.45 +
    Math.sin(x * 0.3 - z * 0.2 + t * 1.3) * 0.06
  );
}

// How much the surface leans at a point (for tilting things that float on it)
export function slope(x, z, t) {
  const e = 0.5;
  return {
    x: (wave(x + e, z, t) - wave(x - e, z, t)) / (2 * e),
    z: (wave(x, z + e, t) - wave(x, z - e, t)) / (2 * e),
  };
}

// Colours of the scene: a pale dawn over calm water
export const PALETTE = {
  zenith: "#6f7fb0",
  horizon: "#f6b8a2",
  sun: "#ffd9a8",
  deep: "#ed00f5",
  shallow: "#00ffaa",
};
