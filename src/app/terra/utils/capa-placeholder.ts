const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
<defs>
<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#2f4a3c"/>
<stop offset="45%" style="stop-color:#1e2f28"/>
<stop offset="100%" style="stop-color:#0f1814"/>
</linearGradient>
<pattern id="p" width="24" height="24" patternUnits="userSpaceOnUse">
<path d="M0 24V0h24" fill="none" stroke="#c4b896" stroke-opacity="0.12" stroke-width="0.5"/>
</pattern>
</defs>
<rect width="400" height="600" fill="url(#g)"/>
<rect width="400" height="600" fill="url(#p)"/>
<path d="M48 72h28v456H48V72zm276 24h36v408h-36V96z" fill="none" stroke="#d4c4a4" stroke-opacity="0.22" stroke-width="1.5"/>
<text x="200" y="292" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="13" letter-spacing="0.12em" fill="#e2d8c4" fill-opacity="0.85">SEM CAPA</text>
<text x="200" y="318" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="10" fill="#a89878" fill-opacity="0.65">Open Library · Terra</text>
</svg>`;

export const CAPA_PLACEHOLDER_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export function capaOuPlaceholder(thumbnail: string | null | undefined): string {
  const t = thumbnail?.trim();
  return t && t.length > 0 ? t : CAPA_PLACEHOLDER_URI;
}
