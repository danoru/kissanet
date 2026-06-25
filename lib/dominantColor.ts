/**
 * Sample the dominant color from a cover image in the browser via a canvas.
 * Averages pixels in a quantized histogram, biasing toward saturated, mid-tone
 * colors so spines pick up the artwork's character rather than its black border.
 * Returns a #rrggbb string, or null if the image can't be read (e.g. CORS).
 */
export async function extractDominantColor(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const size = 48; // downscale — we only need a rough average
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        type Bucket = { r: number; g: number; b: number; n: number; score: number };
        const buckets = new Map<string, Bucket>();

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 200) continue;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const sat = max === 0 ? 0 : (max - min) / max;
          const lum = (max + min) / 2 / 255;
          // skip near-black and near-white; weight by saturation + mid lightness
          if (lum < 0.12 || lum > 0.92) continue;
          const weight = sat * (1 - Math.abs(lum - 0.5)) + 0.05;

          const key = `${r >> 4}-${g >> 4}-${b >> 4}`;
          const bucket =
            buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0, score: 0 };
          bucket.r += r;
          bucket.g += g;
          bucket.b += b;
          bucket.n += 1;
          bucket.score += weight;
          buckets.set(key, bucket);
        }

        const best = Array.from(buckets.values()).reduce<Bucket | null>(
          (acc, bucket) =>
            acc === null || bucket.score > acc.score ? bucket : acc,
          null,
        );
        if (!best || best.n === 0) return resolve(null);

        const to = (v: number) =>
          Math.round(v / best.n)
            .toString(16)
            .padStart(2, "0");
        resolve(`#${to(best.r)}${to(best.g)}${to(best.b)}`);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
