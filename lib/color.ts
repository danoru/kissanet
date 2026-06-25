/** Parse a #rrggbb (or #rgb) string into [r,g,b], or null if unparseable. */
export function hexToRgb(hex: string): [number, number, number] | null {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return null;
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/** Relative luminance (0–1) via the sRGB perceptual weighting. */
export function luminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const [r, g, b] = rgb.map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Pick cream or near-black text so it stays legible on a given spine color. */
export function readableText(hex: string): string {
  return luminance(hex) > 0.45 ? "#1a140d" : "#e8d9b8";
}

/** A warm default for spines with no extracted color yet. */
export const DEFAULT_SPINE = "#3a2c1d";
