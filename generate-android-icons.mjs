/**
 * Generate all Android adaptive icon resources from icone-HUBLabDiv-bgscience.png
 * 
 * Android Adaptive Icons require:
 * - ic_launcher_foreground.png (108dp at each density) - the logo with transparent bg
 * - ic_launcher_background.png (108dp at each density) - the bg-science pattern
 * - ic_launcher.png (48dp at each density) - legacy icon (full composed icon)
 * - ic_launcher_round.png (48dp at each density) - round legacy icon
 */

import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');
const resDir = resolve(__dirname, '../android/app/src/main/res');
const resourcesDir = resolve(__dirname, '../resources');

// Android mipmap density sizes
// For adaptive icons: foreground/background are 108dp
// For legacy icons: 48dp
const DENSITIES = {
    'mipmap-ldpi':    { adaptive: 81,  legacy: 36  },
    'mipmap-mdpi':    { adaptive: 108, legacy: 48  },
    'mipmap-hdpi':    { adaptive: 162, legacy: 72  },
    'mipmap-xhdpi':   { adaptive: 216, legacy: 96  },
    'mipmap-xxhdpi':  { adaptive: 324, legacy: 144 },
    'mipmap-xxxhdpi': { adaptive: 432, legacy: 192 },
};

async function main() {
    console.log('🎨 Generating Android icons from icone-HUBLabDiv-bgscience.png...\n');

    // === 1. Create the BACKGROUND layer (bg-science on dark) ===
    const bgSvgRaw = readFileSync(resolve(publicDir, 'bg-science.svg'), 'utf-8');
    const bgSvgBoosted = bgSvgRaw
        .replaceAll('#0F4780', '#5BA4FC') // Brighter science blue
        .replaceAll('#F14343', '#FF6B6B') // Vibrant light red
        .replaceAll('#FFCC00', '#FFE15D') // High contrast light yellow
        .replace(/opacity="0\.[0-9]+"/g, 'opacity="0.95"'); // High opacity

    const bgSvgWithDark = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200">
  <rect width="1200" height="1200" fill="#121212"/>
  ${bgSvgBoosted.replace(/<svg[^>]*>/, '').replace(/<\/svg>/, '')}
</svg>`;
    const bgBaseBuffer = await sharp(Buffer.from(bgSvgWithDark))
        .resize(1024, 1024)
        .png()
        .toBuffer();

    // === 2. Create the FOREGROUND layer (just the cap icon, transparent bg) ===
    const iconSvg = readFileSync(resolve(publicDir, 'icone-HUBLabDiv.svg'), 'utf-8');
    // For adaptive icons, the safe zone is the inner 66% (72dp of 108dp)
    // So we place the icon in the center with padding
    const fgPadding = Math.round(1024 * 0.18); // ~18% padding on each side
    const fgIconSize = 1024 - (fgPadding * 2);
    
    const fgIconBuffer = await sharp(Buffer.from(iconSvg))
        .resize(fgIconSize, fgIconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

    // Create full 1024x1024 transparent canvas with icon centered
    const fgBaseBuffer = await sharp({
        create: {
            width: 1024,
            height: 1024,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
        }
    })
        .composite([{ input: fgIconBuffer, top: fgPadding, left: fgPadding }])
        .png()
        .toBuffer();

    // === 3. Create the LEGACY icon (composed: bg + fg) ===
    const legacyBaseBuffer = await sharp(bgBaseBuffer)
        .composite([{ input: fgBaseBuffer, blend: 'over' }])
        .png()
        .toBuffer();

    // === 4. Generate all density variants ===
    for (const [folder, sizes] of Object.entries(DENSITIES)) {
        const dirPath = resolve(resDir, folder);
        mkdirSync(dirPath, { recursive: true });

        // Background
        await sharp(bgBaseBuffer)
            .resize(sizes.adaptive, sizes.adaptive)
            .png()
            .toFile(resolve(dirPath, 'ic_launcher_background.png'));

        // Foreground
        await sharp(fgBaseBuffer)
            .resize(sizes.adaptive, sizes.adaptive)
            .png()
            .toFile(resolve(dirPath, 'ic_launcher_foreground.png'));

        // Legacy icon (square)
        await sharp(legacyBaseBuffer)
            .resize(sizes.legacy, sizes.legacy)
            .png()
            .toFile(resolve(dirPath, 'ic_launcher.png'));

        // Legacy round icon (circle-cropped)
        const roundMask = Buffer.from(
            `<svg width="${sizes.legacy}" height="${sizes.legacy}">
                <circle cx="${sizes.legacy/2}" cy="${sizes.legacy/2}" r="${sizes.legacy/2}" fill="white"/>
            </svg>`
        );
        const roundIcon = await sharp(legacyBaseBuffer)
            .resize(sizes.legacy, sizes.legacy)
            .composite([{
                input: await sharp(roundMask).png().toBuffer(),
                blend: 'dest-in'
            }])
            .png()
            .toBuffer();
        await sharp(roundIcon).toFile(resolve(dirPath, 'ic_launcher_round.png'));

        console.log(`  ✅ ${folder}: adaptive=${sizes.adaptive}px, legacy=${sizes.legacy}px`);
    }

    // === 5. Update resources/ for Capacitor ===
    // icon.png (1024x1024 composed)
    await sharp(legacyBaseBuffer)
        .resize(1024, 1024)
        .png()
        .toFile(resolve(resourcesDir, 'icon.png'));
    console.log(`  ✅ resources/icon.png (1024x1024)`);

    // icon-background.png (1024x1024)
    await sharp(bgBaseBuffer)
        .resize(1024, 1024)
        .png()
        .toFile(resolve(resourcesDir, 'icon-background.png'));
    console.log(`  ✅ resources/icon-background.png (1024x1024)`);

    // icon-foreground.png (1024x1024)
    await sharp(fgBaseBuffer)
        .resize(1024, 1024)
        .png()
        .toFile(resolve(resourcesDir, 'icon-foreground.png'));
    console.log(`  ✅ resources/icon-foreground.png (1024x1024)`);

    console.log('\n🎉 All Android icons generated successfully!');
    console.log('   Next steps:');
    console.log('   1. Open Android Studio and verify icons look correct');
    console.log('   2. Run: npx cap sync android');
}

main().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
