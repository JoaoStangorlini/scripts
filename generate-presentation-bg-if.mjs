/**
 * HUB LabDiv - Software Livre sob Licença AGPLv3.
 * Copyright (C) 2026 HUB LabDiv
 *
 * Este programa é um software livre; você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU como publicada pela
 * Free Software Foundation, versão 3 da Licença.
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const outputDir = path.join(projectRoot, 'public', 'presentation');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Brand Colors
// Base Dark (#121212), Surfaces (#1E1E1E)
// Amarelo #FFCC00, Azul #0F4780, Vermelho #F14343
const BRAND = {
  bgDark: '#121212',
  surfaceDark: '#1E1E1E',
  blue: '#0F4780',
  red: '#F14343',
  yellow: '#FFCC00',
  textLight: '#E0E0E0'
};

// Generate Widescreen 16:9 HTML template with SVG graphics
function createSlideHtml({ theme = 'dark', slideType = 'standard', width = 1920, height = 1080 }) {
  const isDark = theme === 'dark';
  const isTransparent = theme === 'transparent';

  const bgColor = isTransparent ? 'transparent' : (isDark ? BRAND.bgDark : '#FAFAFA');
  const eqOpacityBase = isDark ? 0.35 : 0.25;

  // Header / frame styling if content or title slide
  let overlayFrame = '';
  if (slideType === 'capa' && !isTransparent) {
    overlayFrame = `
      <!-- Title slide framing -->
      <div style="position: absolute; left: 120px; top: 220px; width: 850px; height: 500px; border-left: 6px solid ${BRAND.yellow}; background: rgba(30, 30, 30, 0.45); backdrop-filter: blur(8px); border-radius: 0 16px 16px 0; padding: 40px; box-sizing: border-box; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
        <div style="display: inline-block; padding: 6px 16px; background: rgba(15, 71, 128, 0.6); border: 1px solid ${BRAND.blue}; color: ${BRAND.yellow}; font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: 700; border-radius: 20px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 20px;">
          HUB LabDiv • Instituto de Física
        </div>
        <div style="color: #FFFFFF; font-family: 'Open Sans', sans-serif; font-size: 48px; font-weight: 800; line-height: 1.2; margin-bottom: 16px; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
          Título da Apresentação
        </div>
        <div style="color: #B0B0B0; font-family: 'Open Sans', sans-serif; font-size: 22px; font-weight: 400;">
          Subtítulo ou Nome do Palestrante / Pesquisador
        </div>
      </div>
    `;
  } else if (slideType === 'conteudo' && !isTransparent) {
    overlayFrame = `
      <!-- Top header line for standard content slide -->
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 6px; background: linear-gradient(90deg, ${BRAND.blue} 0%, ${BRAND.yellow} 50%, ${BRAND.red} 100%);"></div>
      <div style="position: absolute; top: 40px; left: 80px; font-family: 'Open Sans', sans-serif; font-size: 14px; font-weight: 700; color: ${BRAND.yellow}; letter-spacing: 1.5px; text-transform: uppercase;">
        HUB LABDIV | IF-USP
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: ${width}px;
      height: ${height}px;
      background-color: ${bgColor};
      overflow: hidden;
      font-family: 'Open Sans', sans-serif;
      position: relative;
    }
    .ambient-glow {
      position: absolute;
      border-radius: 50%;
      filter: blur(140px);
      pointer-events: none;
    }
  </style>
</head>
<body>
  ${!isTransparent && isDark ? `
    <!-- Ambient glowing light spots using brand colors -->
    <div class="ambient-glow" style="top: -150px; left: -100px; width: 700px; height: 700px; background: ${BRAND.blue}; opacity: 0.35;"></div>
    <div class="ambient-glow" style="bottom: -200px; right: -100px; width: 800px; height: 800px; background: ${BRAND.red}; opacity: 0.22;"></div>
    <div class="ambient-glow" style="top: 200px; right: 200px; width: 500px; height: 500px; background: ${BRAND.yellow}; opacity: 0.12;"></div>
  ` : ''}

  <!-- Physics background elements (Adapted widescreen layout of bg-if.svg) -->
  <svg style="position: absolute; top: 0; left: 0; width: ${width}px; height: ${height}px;" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg">

    <!-- Top Left & Top Edge Equations -->
    <text x="90" y="80" fill="${BRAND.blue}" opacity="${eqOpacityBase * 0.9}" font-size="28" font-family="'Open Sans', 'Georgia', serif" font-weight="600" transform="rotate(-10 90 80)">E = mc²</text>
    <text x="450" y="110" fill="${BRAND.red}" opacity="${eqOpacityBase * 0.85}" font-size="24" font-family="'Open Sans', 'Georgia', serif" transform="rotate(6 450 110)">∂ψ/∂t</text>
    <text x="850" y="90" fill="${BRAND.yellow}" opacity="${eqOpacityBase * 0.9}" font-size="22" font-family="'Open Sans', 'Georgia', serif" transform="rotate(-5 850 90)">ℏ</text>
    <text x="1250" y="130" fill="${BRAND.blue}" opacity="${eqOpacityBase * 0.85}" font-size="26" font-family="'Open Sans', 'Georgia', serif" transform="rotate(12 1250 130)">∇×B</text>
    <text x="1680" y="95" fill="${BRAND.yellow}" opacity="${eqOpacityBase * 0.95}" font-size="32" font-family="'Open Sans', 'Georgia', serif" transform="rotate(-8 1680 95)">∫</text>

    <!-- Upper Middle band -->
    <text x="160" y="240" fill="${BRAND.yellow}" opacity="${eqOpacityBase * 0.8}" font-size="24" font-family="'Open Sans', 'Georgia', serif" transform="rotate(14 160 240)">λ = h/p</text>
    <text x="620" y="220" fill="${BRAND.blue}" opacity="${eqOpacityBase * 0.75}" font-size="26" font-family="'Open Sans', 'Georgia', serif" transform="rotate(-8 620 220)">Σ</text>
    <text x="1420" y="260" fill="${BRAND.red}" opacity="${eqOpacityBase * 0.85}" font-size="22" font-family="'Open Sans', 'Georgia', serif" transform="rotate(9 1420 260)">ΔxΔp ≥ ℏ/2</text>
    <text x="1800" y="230" fill="${BRAND.yellow}" opacity="${eqOpacityBase * 0.9}" font-size="28" font-family="'Open Sans', 'Georgia', serif" transform="rotate(-12 1800 230)">π</text>

    <!-- Side Margins Equations -->
    <text x="80" y="420" fill="${BRAND.red}" opacity="${eqOpacityBase * 0.85}" font-size="24" font-family="'Open Sans', 'Georgia', serif" transform="rotate(7 80 420)">F = ma</text>
    <text x="1750" y="440" fill="${BRAND.blue}" opacity="${eqOpacityBase * 0.85}" font-size="28" font-family="'Open Sans', 'Georgia', serif" transform="rotate(-14 1750 440)">∂²u/∂t²</text>

    <text x="110" y="600" fill="${BRAND.blue}" opacity="${eqOpacityBase * 0.85}" font-size="24" font-family="'Open Sans', 'Georgia', serif" transform="rotate(5 110 600)">∮ E·dl</text>
    <text x="1720" y="620" fill="${BRAND.yellow}" opacity="${eqOpacityBase * 0.8}" font-size="22" font-family="'Open Sans', 'Georgia', serif" transform="rotate(-7 1720 620)">ψ(x,t)</text>
    <text x="1830" y="740" fill="${BRAND.red}" opacity="${eqOpacityBase * 0.9}" font-size="30" font-family="'Open Sans', 'Georgia', serif" transform="rotate(11 1830 740)">∞</text>

    <!-- Bottom Left & Bottom Edge Equations -->
    <text x="130" y="790" fill="${BRAND.red}" opacity="${eqOpacityBase * 0.9}" font-size="22" font-family="'Open Sans', 'Georgia', serif" transform="rotate(-9 130 790)">iℏ∂ψ/∂t = Ĥψ</text>
    <text x="520" y="940" fill="${BRAND.blue}" opacity="${eqOpacityBase * 0.85}" font-size="32" font-family="'Open Sans', 'Georgia', serif" transform="rotate(8 520 940)">Ω</text>

    <text x="960" y="990" fill="${BRAND.yellow}" opacity="${eqOpacityBase * 0.85}" font-size="24" font-family="'Open Sans', 'Georgia', serif" transform="rotate(-11 960 990)">∇²φ</text>
    <text x="1350" y="920" fill="${BRAND.yellow}" opacity="${eqOpacityBase * 0.85}" font-size="26" font-family="'Open Sans', 'Georgia', serif" transform="rotate(5 1350 920)">α β γ</text>
    <text x="1620" y="970" fill="${BRAND.red}" opacity="${eqOpacityBase * 0.9}" font-size="22" font-family="'Open Sans', 'Georgia', serif" transform="rotate(-8 1620 970)">S = k ln W</text>
    <text x="1810" y="900" fill="${BRAND.blue}" opacity="${eqOpacityBase * 0.85}" font-size="28" font-family="'Open Sans', 'Georgia', serif" transform="rotate(10 1810 900)">∂/∂x</text>

    <text x="80" y="990" fill="${BRAND.blue}" opacity="${eqOpacityBase * 0.8}" font-size="22" font-family="'Open Sans', 'Georgia', serif" transform="rotate(-4 80 990)">μ₀ε₀</text>
    <text x="320" y="1030" fill="${BRAND.red}" opacity="${eqOpacityBase * 0.85}" font-size="26" font-family="'Open Sans', 'Georgia', serif" transform="rotate(14 320 1030)">ρ</text>
    <text x="1750" y="1020" fill="${BRAND.yellow}" opacity="${eqOpacityBase * 0.9}" font-size="30" font-family="'Open Sans', 'Georgia', serif" transform="rotate(-11 1750 1020)">Δ</text>

    <!-- Floating Particles & Dots -->
    <circle cx="180" cy="140" r="2.5" fill="${BRAND.blue}" opacity="0.7"/>
    <circle cx="580" cy="95" r="2" fill="${BRAND.red}" opacity="0.8"/>
    <circle cx="1120" cy="150" r="3" fill="${BRAND.yellow}" opacity="0.9"/>
    <circle cx="1550" cy="110" r="2" fill="${BRAND.blue}" opacity="0.7"/>

    <circle cx="340" cy="310" r="2.5" fill="${BRAND.yellow}" opacity="0.8"/>
    <circle cx="1300" cy="350" r="3" fill="${BRAND.blue}" opacity="0.7"/>
    <circle cx="1700" cy="380" r="2" fill="${BRAND.red}" opacity="0.8"/>

    <circle cx="120" cy="500" r="3" fill="${BRAND.red}" opacity="0.8"/>
    <circle cx="1850" cy="520" r="2.5" fill="${BRAND.yellow}" opacity="0.9"/>

    <circle cx="220" cy="700" r="3" fill="${BRAND.blue}" opacity="0.8"/>
    <circle cx="1650" cy="710" r="2" fill="${BRAND.red}" opacity="0.7"/>

    <circle cx="410" cy="860" r="2.5" fill="${BRAND.yellow}" opacity="0.9"/>
    <circle cx="1180" cy="920" r="3" fill="${BRAND.blue}" opacity="0.8"/>
    <circle cx="1510" cy="1010" r="2" fill="${BRAND.red}" opacity="0.8"/>

    <!-- Atom Orbit Accents -->
    <!-- Top-Right Orbit -->
    <g transform="translate(1600, 220)">
      <ellipse cx="0" cy="0" rx="36" ry="12" fill="none" stroke="${BRAND.yellow}" stroke-width="1.2" opacity="0.6" transform="rotate(30)"/>
      <ellipse cx="0" cy="0" rx="36" ry="12" fill="none" stroke="${BRAND.red}" stroke-width="1.2" opacity="0.6" transform="rotate(-30)"/>
      <ellipse cx="0" cy="0" rx="36" ry="12" fill="none" stroke="${BRAND.blue}" stroke-width="1.2" opacity="0.6" transform="rotate(90)"/>
      <circle cx="0" cy="0" r="4" fill="${BRAND.yellow}"/>
    </g>

    <!-- Bottom-Left Orbit -->
    <g transform="translate(300, 820)">
      <ellipse cx="0" cy="0" rx="40" ry="14" fill="none" stroke="${BRAND.blue}" stroke-width="1.2" opacity="0.6" transform="rotate(25)"/>
      <ellipse cx="0" cy="0" rx="40" ry="14" fill="none" stroke="${BRAND.yellow}" stroke-width="1.2" opacity="0.6" transform="rotate(-35)"/>
      <ellipse cx="0" cy="0" rx="40" ry="14" fill="none" stroke="${BRAND.red}" stroke-width="1.2" opacity="0.6" transform="rotate(85)"/>
      <circle cx="0" cy="0" r="4" fill="${BRAND.red}"/>
    </g>

    <!-- Right Margin Orbit -->
    <g transform="translate(1780, 680)">
      <ellipse cx="0" cy="0" rx="32" ry="10" fill="none" stroke="${BRAND.red}" stroke-width="1" opacity="0.65" transform="rotate(40)"/>
      <ellipse cx="0" cy="0" rx="32" ry="10" fill="none" stroke="${BRAND.yellow}" stroke-width="1" opacity="0.65" transform="rotate(-20)"/>
      <ellipse cx="0" cy="0" rx="32" ry="10" fill="none" stroke="${BRAND.blue}" stroke-width="1" opacity="0.65" transform="rotate(80)"/>
      <circle cx="0" cy="0" r="3.5" fill="${BRAND.blue}"/>
    </g>

  </svg>

  ${overlayFrame}
</body>
</html>`;
}

async function generateAllBackgrounds() {
  console.log('🚀 Inicializando Puppeteer para gerar fundos PNG para Google Apresentações...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const configs = [
    {
      name: 'bg-if-slide-dark.png',
      theme: 'dark',
      slideType: 'standard',
      width: 1920,
      height: 1080,
      desc: 'Fundo Escuro 16:9 Padrão (#121212) com equações da física e brilho sutil'
    },
    {
      name: 'bg-if-slide-capa.png',
      theme: 'dark',
      slideType: 'capa',
      width: 1920,
      height: 1080,
      desc: 'Fundo para Slide de Título / Capa com cartão glassmorphism'
    },
    {
      name: 'bg-if-slide-conteudo.png',
      theme: 'dark',
      slideType: 'conteudo',
      width: 1920,
      height: 1080,
      desc: 'Fundo para Slides de Conteúdo com linha de topo de marca'
    },
    {
      name: 'bg-if-slide-transparent.png',
      theme: 'transparent',
      slideType: 'standard',
      width: 1920,
      height: 1080,
      desc: 'Fundo Transparente 16:9 contendo apenas as equações e partículas'
    },
    {
      name: 'bg-if-slide-dark-4k.png',
      theme: 'dark',
      slideType: 'standard',
      width: 3840,
      height: 2160,
      desc: 'Fundo Escuro em Ultra HD 4K (3840x2160)'
    },
    {
      name: 'bg-if-slide-light.png',
      theme: 'light',
      slideType: 'standard',
      width: 1920,
      height: 1080,
      desc: 'Opção de Fundo Claro 16:9'
    }
  ];

  for (const cfg of configs) {
    console.log(`📸 Gerando: ${cfg.name} (${cfg.width}x${cfg.height})...`);
    await page.setViewport({ width: cfg.width, height: cfg.height, deviceScaleFactor: 1 });

    const html = createSlideHtml({
      theme: cfg.theme,
      slideType: cfg.slideType,
      width: cfg.width,
      height: cfg.height
    });

    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });

    // Save in public/presentation/ and also copy main dark background to public/bg-if-slide.png
    const destPath = path.join(outputDir, cfg.name);
    await page.screenshot({
      path: destPath,
      omitBackground: cfg.theme === 'transparent',
      type: 'png'
    });

    if (cfg.name === 'bg-if-slide-dark.png') {
      const mainPublicPath = path.join(projectRoot, 'public', 'bg-if-slide.png');
      fs.copyFileSync(destPath, mainPublicPath);
      console.log(`  └─ Copiado para ${mainPublicPath}`);
    }

    console.log(`  ✓ Salvo em: ${destPath}`);
  }

  await browser.close();
  console.log('✨ Todos os fundos de slides PNG foram gerados com sucesso!');
}

generateAllBackgrounds().catch(err => {
  console.error('❌ Erro na geração dos fundos:', err);
  process.exit(1);
});
