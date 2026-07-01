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

/** Clamp to a byte and format as #rrggbb. */
function toHex(r: number, g: number, b: number): string {
  const c = (v: number) =>
    Math.max(0, Math.min(255, Math.round(v)))
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/**
 * Shift a color lighter (amount > 0) or darker (amount < 0) by a fraction,
 * warming as it lightens and cooling as it darkens so a spine reads like a
 * lit cardboard edge rather than a flat swatch. `amount` is roughly -1..1.
 */
export function shade(hex: string, amount: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const [r, g, b] = rgb;
  if (amount >= 0) {
    // lighten toward a warm highlight
    return toHex(
      r + (255 - r) * amount,
      g + (250 - g) * amount * 0.94,
      b + (235 - b) * amount * 0.82,
    );
  }
  // darken toward a cool shadow
  const t = -amount;
  return toHex(r * (1 - t), g * (1 - t), b * (1 - t * 0.96));
}

/**
 * A top-lit → shadowed vertical gradient for a record spine, so the cardboard
 * catches the room light along its length instead of reading as one flat fill.
 */
export function spineGradient(hex: string): string {
  return `linear-gradient(180deg, ${shade(hex, 0.14)} 0%, ${hex} 42%, ${shade(hex, -0.22)} 100%)`;
}
