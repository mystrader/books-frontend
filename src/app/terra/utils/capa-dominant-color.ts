export type Rgb = { r: number; g: number; b: number };

const PADRAO_SOMBRA: Rgb = { r: 46, g: 50, b: 48 };

export function rgbPadraoSombraCapa(): Rgb {
  return { ...PADRAO_SOMBRA };
}

export function amostrarCorPredominanteDaCapa(img: HTMLImageElement): Rgb | null {
  try {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    if (nw < 2 || nh < 2) return null;

    const w = 40;
    const h = Math.max(2, Math.round((nh / nw) * w));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;

    let r = 0;
    let g = 0;
    let b = 0;
    let n = 0;

    for (let i = 0; i < data.length; i += 4) {
      const rr = data[i] ?? 0;
      const gg = data[i + 1] ?? 0;
      const bb = data[i + 2] ?? 0;
      const aa = data[i + 3] ?? 0;
      if (aa < 24) continue;

      const max = Math.max(rr, gg, bb);
      const min = Math.min(rr, gg, bb);
      const sat = max === 0 ? 0 : (max - min) / max;
      const lum = (rr + gg + bb) / 3;

      if (lum > 248) continue;
      if (lum < 10) continue;
      if (sat < 0.08 && lum > 210) continue;

      r += rr;
      g += gg;
      b += bb;
      n++;
    }

    if (n === 0) {
      for (let i = 0; i < data.length; i += 4) {
        const rr = data[i] ?? 0;
        const gg = data[i + 1] ?? 0;
        const bb = data[i + 2] ?? 0;
        const aa = data[i + 3] ?? 0;
        if (aa < 24) continue;
        r += rr;
        g += gg;
        b += bb;
        n++;
      }
    }

    if (n === 0) return null;

    return {
      r: Math.round(r / n),
      g: Math.round(g / n),
      b: Math.round(b / n),
    };
  } catch {
    return null;
  }
}
