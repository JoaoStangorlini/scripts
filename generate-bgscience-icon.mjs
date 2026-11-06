/**
 * Script to generate icone-HUBLabDiv-bgscience.png
 * Combines bg-science.svg as background with the HUB LabDiv icon overlay.
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');

const SIZE = 512;
const ICON_PADDING = 40; // padding around the icon
const ICON_SIZE = SIZE - (ICON_PADDING * 2);
const CORNER_RADIUS = 80; // rounded corners for the final icon

async function main() {
    // 1. Read the bg-science.svg and modify it to have a dark background (#121212)
    const bgSvgRaw = readFileSync(resolve(publicDir, 'bg-science.svg'), 'utf-8');
    
    // Boost contrast of colors and opacities in background SVG
    const bgSvgBoosted = bgSvgRaw
        .replaceAll('#0F4780', '#5BA4FC') // Brighter science blue
        .replaceAll('#F14343', '#FF6B6B') // Vibrant light red
        .replaceAll('#FFCC00', '#FFE15D') // High contrast light yellow
        .replace(/opacity="0\.[0-9]+"/g, 'opacity="0.95"'); // High opacity

    // Wrap the bg-science SVG content with a dark background rect and resize to 512x512
    const bgSvgWithBackground = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 1200 1200">
  <rect width="1200" height="1200" fill="#121212"/>
  ${bgSvgBoosted.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
</svg>`;

    // 2. Render bg-science SVG to a buffer at target size
    const bgBuffer = await sharp(Buffer.from(bgSvgWithBackground))
        .resize(SIZE, SIZE)
        .png()
        .toBuffer();

    // 3. Read the HUB LabDiv icon SVG  
    const iconSvg = readFileSync(resolve(publicDir, 'icone-HUBLabDiv.svg'), 'utf-8');
    
    // 4. Render the icon SVG to a buffer (smaller, with padding)
    const iconBuffer = await sharp(Buffer.from(iconSvg))
        .resize(ICON_SIZE, ICON_SIZE, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

    // 5. Create a rounded rectangle mask for the final image
    const roundedMask = Buffer.from(
        `<svg width="${SIZE}" height="${SIZE}">
            <rect width="${SIZE}" height="${SIZE}" rx="${CORNER_RADIUS}" ry="${CORNER_RADIUS}" fill="white"/>
        </svg>`
    );

    // 6. Composite: bg-science background + icon overlay
    const composited = await sharp(bgBuffer)
        .composite([
            {
                input: iconBuffer,
                top: ICON_PADDING,
                left: ICON_PADDING,
                blend: 'over'
            }
        ])
        .png()
        .toBuffer();

    // 7. Apply rounded corners mask
    const final = await sharp(composited)
        .composite([
            {
                input: await sharp(roundedMask).resize(SIZE, SIZE).png().toBuffer(),
                blend: 'dest-in'
            }
        ])
        .png()
        .toBuffer();

    // 8. Write final PNG
    const outputPath = resolve(publicDir, 'icone-HUBLabDiv-bgscience.png');
    await sharp(final).toFile(outputPath);

    console.log(`✅ Generated: ${outputPath}`);
    console.log(`   Size: ${SIZE}x${SIZE}px, rounded corners: ${CORNER_RADIUS}px`);
}

main().catch(err => {
    console.error('❌ Error generating icon:', err);
    process.exit(1);
});
