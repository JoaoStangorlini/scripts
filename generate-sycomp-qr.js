/*!
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 *
 * Este programa é um software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
 * publicada pela Free Software Foundation.
 *
 * Este programa é distribuído na esperança de que seja útil, mas SEM
 * QUALQUER GARANTIA; sem mesmo a garantia implícita de COMERCIALIZAÇÃO
 * ou ADEQUAÇÃO A UM DETERMINADO FIM.
 */

const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const sharp = require('sharp');

async function main() {
  const sourceLogoPath = (process.env.ARTIFACTS_DIR || './artifacts');
  const outDir = path.resolve(__dirname, '../public/divulgacao/sycomp');

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Process Logo with clean circular transparency mask
  // Source is 150x150. Let's make an upscaled clean version (300x300 or 600x600) with circle mask
  const size = 300;
  const radius = size / 2;
  const maskSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${radius}" cy="${radius}" r="${radius - 0.5}" fill="#ffffff"/></svg>`
  );

  const logoProcessedBuffer = await sharp(sourceLogoPath)
    .resize(size, size, { kernel: sharp.kernel.lanczos3 })
    .composite([
      {
        input: maskSvg,
        blend: 'dest-in'
      }
    ])
    .png({ quality: 90, compressionLevel: 9, effort: 10 })
    .toBuffer();

  const logoPath = path.join(outDir, 'logo-sycomp.png');
  fs.writeFileSync(logoPath, logoProcessedBuffer);
  console.log('Saved logo to', logoPath);

  // Also save raw original
  fs.copyFileSync(sourceLogoPath, path.join(outDir, 'logo-sycomp-original.png'));

  // 2. Generate QR Code
  const targetUrl = 'https://www.instagram.com/symcomp.imeusp/';
  const qr = QRCode.create(targetUrl, {
    errorCorrectionLevel: 'H'
  });

  const moduleCount = qr.modules.size; // 37
  const margin = 3; // quiet zone in modules
  const totalGridSize = moduleCount + margin * 2; // 43
  const scale = 20; // 20px per module => 860x860 px viewbox
  const totalPx = totalGridSize * scale;

  // Let's create SVG paths for modules
  let pathData = '';
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (qr.modules.get(r, c)) {
        const x = (c + margin) * scale;
        const y = (r + margin) * scale;
        pathData += `M${x},${y}h${scale}v${scale}h-${scale}z `;
      }
    }
  }

  // Center of QR Code in px
  const centerPx = totalPx / 2;

  // Logo size calculation:
  // In a 37x37 grid, 9 to 10 modules width is safe with H level (up to 30% error correction).
  // 10 modules width = 200px.
  // 9.5 modules = 190px.
  // White backing badge circle radius:
  const logoDiameterPx = 9.2 * scale; // 184px
  const logoRadiusPx = logoDiameterPx / 2;
  const whiteBgRadiusPx = logoRadiusPx + (0.7 * scale); // 14px white border buffer around logo

  const logoBase64 = logoProcessedBuffer.toString('base64');
  const logoDataUri = `data:image/png;base64,${logoBase64}`;

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Hub de Comunicação Científica Lab-Div - Divulgação SYCOMP
  Licença AGPLv3 - Este programa é um software livre.
  Destino: ${targetUrl}
-->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${totalPx} ${totalPx}" width="${totalPx}" height="${totalPx}">
  <title>QR Code - Semana da Computação (SYCOMP / IME-USP)</title>
  <desc>${targetUrl}</desc>
  <defs>
    <!-- Circular clip for centered logo -->
    <clipPath id="sycomp-logo-clip">
      <circle cx="${centerPx}" cy="${centerPx}" r="${logoRadiusPx}" />
    </clipPath>
    <!-- Subtle drop shadow for logo container to separate crisply from QR pattern -->
    <filter id="badge-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Background White -->
  <rect width="100%" height="100%" fill="#ffffff" rx="${scale}" />

  <!-- QR Code Modules -->
  <path d="${pathData.trim()}" fill="#000000" shape-rendering="crispEdges" />

  <!-- Center Badge Quiet Zone (Clean White Circle with subtle shadow and border) -->
  <circle cx="${centerPx}" cy="${centerPx}" r="${whiteBgRadiusPx}" fill="#ffffff" filter="url(#badge-shadow)" />
  <circle cx="${centerPx}" cy="${centerPx}" r="${whiteBgRadiusPx}" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />

  <!-- Central SYCOMP Logo -->
  <image
    href="${logoDataUri}"
    xlink:href="${logoDataUri}"
    x="${centerPx - logoRadiusPx}"
    y="${centerPx - logoRadiusPx}"
    width="${logoDiameterPx}"
    height="${logoDiameterPx}"
    clip-path="url(#sycomp-logo-clip)"
    preserveAspectRatio="xMidYMid slice"
  />
</svg>
`;

  const svgPath = path.join(outDir, 'qr-sycomp.svg');
  const pngPath = path.join(outDir, 'qr-sycomp.png');

  fs.writeFileSync(svgPath, svgContent, 'utf-8');
  console.log('Saved SVG to', svgPath);

  // Render high-resolution PNG (1024x1024)
  await sharp(Buffer.from(svgContent))
    .resize(1024, 1024)
    .png({ quality: 95, compressionLevel: 9 })
    .toFile(pngPath);
  console.log('Saved PNG to', pngPath);
}

main().catch(err => {
  console.error('Error generating QR Code:', err);
  process.exit(1);
});
