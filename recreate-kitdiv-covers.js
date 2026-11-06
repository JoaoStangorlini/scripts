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
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const cloudinary = require('cloudinary').v2;
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local
const envContent = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1].trim()] = val;
  }
});

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const COVERS = [
  {
    id: 'cf81c883-dc4a-4590-a00b-77272edb141b',
    slug: 'kitdiv-palestras',
    title: 'Palestras que inspiram',
    subtitle: 'Comunicação oral clara e cativante',
    cldPublicId: 'assets/submissions/kitdiv_palestras_que_inspiram',
    iconSvg: `
      <svg width="280" height="240" viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Glow Behind -->
        <circle cx="140" cy="110" r="90" fill="url(#micGlow)" opacity="0.4" />
        <!-- Sound Waves -->
        <path d="M70 85 C60 100 60 120 70 135" stroke="#FFCC00" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
        <path d="M50 70 C35 95 35 125 50 150" stroke="#FFCC00" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
        <path d="M210 85 C220 100 220 120 210 135" stroke="#FFCC00" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
        <path d="M230 70 C245 95 245 125 230 150" stroke="#FFCC00" stroke-width="4" stroke-linecap="round" opacity="0.5"/>
        <!-- Microphone Outer Cage -->
        <rect x="112" y="35" width="56" height="85" rx="28" fill="#1E293B" stroke="#CBD5E1" stroke-width="6"/>
        <!-- Mic Grille Stripes -->
        <path d="M115 55 H165 M113 70 H167 M115 85 H165 M120 100 H160" stroke="#64748B" stroke-width="3" stroke-linecap="round"/>
        <line x1="140" y1="40" x2="140" y2="115" stroke="#64748B" stroke-width="3"/>
        <!-- Metal Band / Accent -->
        <rect x="110" y="75" width="60" height="12" rx="4" fill="#F14343" stroke="#CBD5E1" stroke-width="2"/>
        <!-- Supporting Yoke -->
        <path d="M96 75 V95 C96 122 115 140 140 140 C165 140 184 122 184 95 V75" stroke="#CBD5E1" stroke-width="8" stroke-linecap="round"/>
        <!-- Mic Stand Stem -->
        <rect x="134" y="140" width="12" height="60" fill="#94A3B8"/>
        <rect x="131" y="170" width="18" height="10" rx="3" fill="#64748B"/>
        <!-- Mic Base -->
        <ellipse cx="140" cy="205" rx="65" ry="14" fill="#1E293B" stroke="#94A3B8" stroke-width="5"/>
        <ellipse cx="140" cy="202" rx="45" ry="8" fill="#334155"/>
        <defs>
          <radialGradient id="micGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stop-color="#FFCC00"/>
            <stop offset="100%" stop-color="#FFCC00" stop-opacity="0"/>
          </radialGradient>
        </defs>
      </svg>
    `
  },
  {
    id: 'efbfc69c-05f0-44a9-80b3-a29850cfff9b',
    slug: 'kitdiv-emails',
    title: 'Como escrever e-mails',
    subtitle: 'Comunicação acadêmica profissional e assertiva',
    cldPublicId: 'assets/submissions/kitdiv_como_escrever_emails',
    iconSvg: `
      <svg width="280" height="240" viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Glow Behind -->
        <circle cx="140" cy="110" r="90" fill="url(#emailGlow)" opacity="0.35" />
        <!-- Letter popping out -->
        <rect x="75" y="40" width="130" height="90" rx="8" fill="#F8FAFC" stroke="#94A3B8" stroke-width="3"/>
        <line x1="90" y1="58" x2="190" y2="58" stroke="#3B82F6" stroke-width="4" stroke-linecap="round"/>
        <line x1="90" y1="74" x2="160" y2="74" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
        <line x1="90" y1="88" x2="180" y2="88" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
        <line x1="90" y1="102" x2="140" y2="102" stroke="#94A3B8" stroke-width="3" stroke-linecap="round"/>
        <!-- Envelope Body -->
        <path d="M50 85 L140 150 L230 85 V175 C230 183 224 190 216 190 H64 C56 190 50 183 50 175 V85 Z" fill="#1E3A8A" stroke="#60A5FA" stroke-width="5"/>
        <!-- Envelope Fold Lines -->
        <path d="M50 185 L115 130" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/>
        <path d="M230 185 L165 130" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/>
        <!-- Envelope Flap (opened) -->
        <path d="M50 85 L140 25 L230 85" stroke="#93C5FD" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="rgba(30, 58, 138, 0.4)"/>
        <!-- Wax Seal / @ Badge -->
        <circle cx="140" cy="150" r="24" fill="#F14343" stroke="#FFCC00" stroke-width="3"/>
        <text x="140" y="158" font-family="'Open Sans', sans-serif" font-size="22" font-weight="900" fill="#FFFFFF" text-anchor="middle">@</text>
        <defs>
          <radialGradient id="emailGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#38BDF8" stop-opacity="0"/>
          </radialGradient>
        </defs>
      </svg>
    `
  },
  {
    id: '1bdc8d41-e35d-4933-b6cf-808613167b42',
    slug: 'kitdiv-caderno-dados',
    title: 'Caderno de dados brilhante',
    subtitle: 'Organização rigorosa de registros experimentais',
    cldPublicId: 'assets/submissions/kitdiv_caderno_de_dados_brilhante',
    iconSvg: `
      <svg width="280" height="240" viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Glow -->
        <circle cx="140" cy="115" r="90" fill="url(#cadernoGlow)" opacity="0.35" />
        <!-- Notebook Base Cover -->
        <rect x="65" y="45" width="135" height="150" rx="8" fill="#1E293B" stroke="#475569" stroke-width="4"/>
        <!-- Notebook Grid Page -->
        <rect x="75" y="52" width="120" height="136" rx="4" fill="#F8FAFC"/>
        <!-- Grid lines -->
        <path d="M85 70 H185 M85 88 H185 M85 106 H185 M85 124 H185 M85 142 H185 M85 160 H185 M85 174 H185" stroke="#E2E8F0" stroke-width="1.5"/>
        <path d="M100 55 V185 M120 55 V185 M140 55 V185 M160 55 V185 M180 55 V185" stroke="#E2E8F0" stroke-width="1.5"/>
        <!-- Plotted Data Line & Points -->
        <path d="M92 155 Q 115 130 135 140 T 175 80" stroke="#0F4780" stroke-width="3" fill="none" stroke-linecap="round"/>
        <circle cx="92" cy="155" r="4" fill="#F14343"/>
        <circle cx="115" cy="130" r="4" fill="#F14343"/>
        <circle cx="135" cy="140" r="4" fill="#F14343"/>
        <circle cx="155" cy="105" r="4" fill="#F14343"/>
        <circle cx="175" cy="80" r="4" fill="#F14343"/>
        <!-- Spiral Wire -->
        <path d="M60 62 H72 M60 80 H72 M60 98 H72 M60 116 H72 M60 134 H72 M60 152 H72 M60 170 H72" stroke="#CBD5E1" stroke-width="5" stroke-linecap="round"/>
        <!-- Ruler (Diagonal) -->
        <g transform="rotate(-28 175 120)">
          <rect x="140" y="50" width="110" height="24" rx="3" fill="#F14343" stroke="#FFCC00" stroke-width="2" opacity="0.95"/>
          <line x1="150" y1="50" x2="150" y2="60" stroke="#FFFFFF" stroke-width="2"/>
          <line x1="160" y1="50" x2="160" y2="56" stroke="#FFFFFF" stroke-width="1.5"/>
          <line x1="170" y1="50" x2="170" y2="60" stroke="#FFFFFF" stroke-width="2"/>
          <line x1="180" y1="50" x2="180" y2="56" stroke="#FFFFFF" stroke-width="1.5"/>
          <line x1="190" y1="50" x2="190" y2="60" stroke="#FFFFFF" stroke-width="2"/>
          <line x1="200" y1="50" x2="200" y2="56" stroke="#FFFFFF" stroke-width="1.5"/>
          <line x1="210" y1="50" x2="210" y2="60" stroke="#FFFFFF" stroke-width="2"/>
          <line x1="220" y1="50" x2="220" y2="56" stroke="#FFFFFF" stroke-width="1.5"/>
          <line x1="230" y1="50" x2="230" y2="60" stroke="#FFFFFF" stroke-width="2"/>
        </g>
        <!-- Pencil -->
        <g transform="rotate(22 210 160)">
          <rect x="180" y="110" width="14" height="75" fill="#FFCC00" stroke="#B45309" stroke-width="1.5"/>
          <polygon points="180,185 194,185 187,202" fill="#FDE68A"/>
          <polygon points="185,197 189,197 187,202" fill="#1E293B"/>
          <rect x="180" y="102" width="14" height="8" rx="2" fill="#F472B6"/>
        </g>
        <defs>
          <radialGradient id="cadernoGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#38BDF8" stop-opacity="0"/>
          </radialGradient>
        </defs>
      </svg>
    `
  },
  {
    id: 'd3dfad4d-a064-47d2-93dd-dd5af259f1e3',
    slug: 'kitdiv-slides',
    title: 'Slides que funcionam',
    subtitle: 'Estruturação visual de alto impacto',
    cldPublicId: 'assets/submissions/kitdiv_slides_que_funcionam',
    iconSvg: `
      <svg width="280" height="240" viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Glow -->
        <circle cx="140" cy="100" r="90" fill="url(#slidesGlow)" opacity="0.4" />
        <!-- Easel Legs -->
        <line x1="140" y1="35" x2="70" y2="210" stroke="#64748B" stroke-width="6" stroke-linecap="round"/>
        <line x1="140" y1="35" x2="210" y2="210" stroke="#64748B" stroke-width="6" stroke-linecap="round"/>
        <line x1="140" y1="35" x2="140" y2="210" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
        <!-- Display Board -->
        <rect x="55" y="45" width="170" height="110" rx="8" fill="#0F172A" stroke="#CBD5E1" stroke-width="5"/>
        <!-- Slide Screen Area -->
        <rect x="65" y="55" width="150" height="90" rx="4" fill="#1E293B"/>
        <!-- Slide Content: Header -->
        <rect x="75" y="65" width="65" height="8" rx="2" fill="#FFCC00"/>
        <!-- Bar Chart on Slide -->
        <rect x="78" y="105" width="14" height="25" rx="2" fill="#38BDF8"/>
        <rect x="98" y="92" width="14" height="38" rx="2" fill="#F14343"/>
        <rect x="118" y="80" width="14" height="50" rx="2" fill="#FFCC00"/>
        <line x1="72" y1="130" x2="140" y2="130" stroke="#64748B" stroke-width="2"/>
        <!-- Pie Chart / Graphic on Right -->
        <circle cx="175" cy="105" r="18" fill="none" stroke="#FFCC00" stroke-width="8" stroke-dasharray="75 40"/>
        <circle cx="175" cy="105" r="18" fill="none" stroke="#F14343" stroke-width="8" stroke-dasharray="35 80" stroke-dashoffset="-75"/>
        <!-- Easel Shelf / Ledge -->
        <rect x="45" y="152" width="190" height="8" rx="3" fill="#94A3B8"/>
        <defs>
          <radialGradient id="slidesGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stop-color="#FFCC00"/>
            <stop offset="100%" stop-color="#FFCC00" stop-opacity="0"/>
          </radialGradient>
        </defs>
      </svg>
    `
  },
  {
    id: '437d51d3-ef22-4f5c-866f-7f7b09659a6e',
    slug: 'kitdiv-posteres',
    title: 'Pôsteres Impactantes',
    subtitle: 'Design de pôsteres científicos sem muro de texto',
    cldPublicId: 'assets/submissions/kitdiv_posteres_impactantes',
    iconSvg: `
      <svg width="280" height="240" viewBox="0 0 280 240" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Glow -->
        <circle cx="140" cy="110" r="95" fill="url(#posterGlow)" opacity="0.4" />
        <!-- Poster Board Stand (Vertical Posts) -->
        <line x1="60" y1="35" x2="60" y2="210" stroke="#64748B" stroke-width="6" stroke-linecap="round"/>
        <line x1="220" y1="35" x2="220" y2="210" stroke="#64748B" stroke-width="6" stroke-linecap="round"/>
        <line x1="50" y1="210" x2="70" y2="210" stroke="#64748B" stroke-width="8" stroke-linecap="round"/>
        <line x1="210" y1="210" x2="230" y2="210" stroke="#64748B" stroke-width="8" stroke-linecap="round"/>
        <!-- Main Tri-fold / Wide Poster Body -->
        <rect x="60" y="42" width="160" height="135" rx="6" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="4"/>
        <!-- Poster Header Banner -->
        <rect x="62" y="44" width="156" height="30" rx="3" fill="#0F4780"/>
        <rect x="75" y="52" width="85" height="7" rx="2" fill="#FFCC00"/>
        <rect x="75" y="63" width="55" height="4" rx="2" fill="#93C5FD"/>
        <!-- 3 Columns Layout on Poster -->
        <!-- Col 1: Intro -->
        <rect x="70" y="82" width="40" height="5" rx="1.5" fill="#F14343"/>
        <rect x="70" y="91" width="42" height="22" rx="2" fill="#E2E8F0"/>
        <rect x="70" y="118" width="42" height="35" rx="2" fill="#E2E8F0"/>
        <!-- Col 2: Center Big Result / Key Finding -->
        <rect x="119" y="82" width="42" height="60" rx="3" fill="#FEF3C7" stroke="#FFCC00" stroke-width="1.5"/>
        <circle cx="140" cy="105" r="14" fill="#FFCC00" opacity="0.3"/>
        <path d="M128 118 L136 100 L144 110 L152 92" stroke="#0F4780" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <rect x="125" y="148" width="30" height="5" rx="1.5" fill="#0F4780"/>
        <rect x="125" y="156" width="30" height="12" rx="2" fill="#E2E8F0"/>
        <!-- Col 3: Conclusion & QR Code -->
        <rect x="168" y="82" width="42" height="45" rx="2" fill="#E2E8F0"/>
        <!-- Mini QR Code -->
        <rect x="178" y="134" width="22" height="22" rx="2" fill="#FFFFFF" stroke="#0F4780" stroke-width="1.5"/>
        <rect x="181" y="137" width="5" height="5" fill="#0F4780"/>
        <rect x="192" y="137" width="5" height="5" fill="#0F4780"/>
        <rect x="181" y="148" width="5" height="5" fill="#0F4780"/>
        <rect x="189" y="145" width="4" height="4" fill="#0F4780"/>
        <defs>
          <radialGradient id="posterGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stop-color="#38BDF8"/>
            <stop offset="100%" stop-color="#38BDF8" stop-opacity="0"/>
          </radialGradient>
        </defs>
      </svg>
    `
  }
];

function buildCardHtml(card) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      width: 1200px;
      height: 800px;
      background: radial-gradient(circle at 50% 40%, #0F4780 0%, #082952 50%, #04142B 100%);
      font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #FFFFFF;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      padding-top: 55px;
    }

    /* Subtle Grid / Geometric Mesh */
    .bg-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
      background-size: 40px 40px;
      pointer-events: none;
    }

    /* Floating Question Marks */
    .q-mark {
      position: absolute;
      color: #FFCC00;
      font-weight: 800;
      user-select: none;
      filter: drop-shadow(0 2px 8px rgba(255, 204, 0, 0.4));
      opacity: 0.85;
      font-family: 'Open Sans', sans-serif;
    }
    .q1 { top: 75px; left: 140px; font-size: 52px; transform: rotate(-15deg); }
    .q2 { top: 120px; right: 150px; font-size: 64px; transform: rotate(18deg); opacity: 0.9; }
    .q3 { top: 280px; left: 90px; font-size: 44px; transform: rotate(12deg); opacity: 0.6; }
    .q4 { top: 340px; right: 100px; font-size: 48px; transform: rotate(-12deg); opacity: 0.7; }
    .q5 { bottom: 180px; left: 160px; font-size: 38px; transform: rotate(-22deg); opacity: 0.5; }
    .q6 { bottom: 190px; right: 170px; font-size: 42px; transform: rotate(15deg); opacity: 0.55; }

    /* Top Red Pill: KITDIV */
    .badge-kitdiv {
      background: #F14343;
      color: #FFFFFF;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: 3.5px;
      padding: 6px 28px;
      border-radius: 9999px;
      text-transform: uppercase;
      box-shadow: 0 4px 20px rgba(241, 67, 67, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.3);
      margin-bottom: 24px;
      z-index: 10;
    }

    /* Title: Yellow Highlight */
    .title-card {
      color: #FFCC00;
      font-size: 54px;
      font-weight: 800;
      text-align: center;
      line-height: 1.15;
      max-width: 950px;
      text-shadow: 0 3px 12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(255, 204, 0, 0.25);
      letter-spacing: -0.5px;
      z-index: 10;
      margin-bottom: 8px;
    }

    .subtitle-card {
      color: #E2E8F0;
      font-size: 20px;
      font-weight: 600;
      opacity: 0.9;
      text-align: center;
      letter-spacing: 0.2px;
      z-index: 10;
      margin-bottom: 30px;
    }

    /* Central Illustration */
    .illustration-box {
      z-index: 10;
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.5));
      transform: scale(1.18);
    }

    /* Audience Silhouette at Bottom */
    .crowd-silhouette {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 95px;
      z-index: 15;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="bg-grid"></div>

  <!-- Floating Question Marks -->
  <div class="q-mark q1">?</div>
  <div class="q-mark q2">?</div>
  <div class="q-mark q3">?</div>
  <div class="q-mark q4">?</div>
  <div class="q-mark q5">?</div>
  <div class="q-mark q6">?</div>

  <!-- Badge -->
  <div class="badge-kitdiv">KITDIV</div>

  <!-- Title & Subtitle -->
  <h1 class="title-card">${card.title}</h1>
  <p class="subtitle-card">${card.subtitle}</p>

  <!-- Illustration -->
  <div class="illustration-box">
    ${card.iconSvg}
  </div>

  <!-- Crowd Silhouette -->
  <svg class="crowd-silhouette" viewBox="0 0 1200 95" fill="none" preserveAspectRatio="none">
    <path d="M0 95 V65 C30 65 45 48 65 48 C85 48 95 62 120 62 C145 62 160 40 185 40 C210 40 225 58 250 58 C275 58 290 44 315 44 C340 44 355 60 380 60 C405 60 420 38 445 38 C470 38 485 54 510 54 C535 54 550 35 580 35 C610 35 625 55 650 55 C675 55 690 32 720 32 C750 32 765 52 790 52 C815 52 830 36 855 36 C880 36 895 56 925 56 C955 56 970 42 995 42 C1020 42 1035 62 1060 62 C1085 62 1100 46 1125 46 C1150 46 1170 58 1200 58 V95 H0 Z" fill="#030C18"/>
    <!-- Raised audience hands / gestures -->
    <path d="M140 62 C138 45 142 35 146 32 C150 29 154 36 150 62 Z" fill="#030C18"/>
    <path d="M380 60 C378 40 382 28 387 25 C392 22 396 30 392 60 Z" fill="#030C18"/>
    <path d="M650 55 C647 32 653 20 658 18 C663 16 667 24 662 55 Z" fill="#030C18"/>
    <path d="M925 56 C922 36 927 25 932 22 C937 19 941 28 937 56 Z" fill="#030C18"/>
    <path d="M1060 62 C1058 45 1062 34 1066 32 C1070 30 1074 38 1070 62 Z" fill="#030C18"/>
  </svg>
</body>
</html>`;
}

async function main() {
  console.log('--- RECREATING KITDIV COVERS & UPLOADING TO CLOUDINARY & SUPABASE ---');

  const outDir = path.resolve(__dirname, '../public/kitdiv-covers');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Launch Puppeteer to render the 5 covers
  console.log('1. Launching Chromium...');
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1200,
      height: 800,
      deviceScaleFactor: 1
    },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800 });

  const generatedFiles = [];

  for (const card of COVERS) {
    console.log(`Rendering cover: ${card.title}...`);
    const html = buildCardHtml(card);
    const htmlPath = path.join(outDir, `${card.slug}.html`);
    const pngPath = path.join(outDir, `${card.slug}.png`);
    const webpPath = path.join(outDir, `${card.slug}.webp`);

    fs.writeFileSync(htmlPath, html, 'utf8');

    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 200));

    await page.screenshot({ path: pngPath, type: 'png' });
    console.log(`Saved PNG: ${pngPath}`);

    generatedFiles.push({ card, pngPath });
  }

  await browser.close();
  console.log('All 5 covers rendered successfully!');

  // 2. Upload to Cloudinary & Supabase Storage, and update Submissions Table
  for (const item of generatedFiles) {
    const { card, pngPath } = item;
    console.log(`\nProcessing upload for: ${card.title}...`);

    // A. Upload to Cloudinary
    console.log(`  -> Uploading to Cloudinary (${card.cldPublicId})...`);
    let cldSecureUrl = '';
    try {
      const cldRes = await cloudinary.uploader.upload(pngPath, {
        public_id: card.cldPublicId,
        overwrite: true,
        resource_type: 'image',
        tags: ['kitdiv', 'capa', 'labdiv', 'oficial']
      });
      cldSecureUrl = cldRes.secure_url;
      console.log(`  -> Cloudinary Success! URL: ${cldSecureUrl}`);
    } catch (cldErr) {
      console.error(`  -> Cloudinary Upload Error: ${cldErr.message}`);
    }

    // B. Upload to Supabase Storage as permanent backup
    console.log(`  -> Uploading to Supabase Storage (media/${card.slug}.png)...`);
    let sbPublicUrl = '';
    try {
      const fileBuffer = fs.readFileSync(pngPath);
      const storagePath = `media/${card.slug}.png`;
      const { data: sbUploadData, error: sbUploadErr } = await supabase.storage
        .from('submissions')
        .upload(storagePath, fileBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (sbUploadErr) {
        console.error(`  -> Supabase Storage Error: ${sbUploadErr.message}`);
      } else {
        const { data: pubData } = supabase.storage
          .from('submissions')
          .getPublicUrl(storagePath);
        sbPublicUrl = pubData.publicUrl;
        console.log(`  -> Supabase Storage Success! URL: ${sbPublicUrl}`);
      }
    } catch (sbErr) {
      console.error(`  -> Supabase Catch: ${sbErr.message}`);
    }

    // Determine target primary URL (Cloudinary if available, otherwise Supabase)
    const targetUrl = cldSecureUrl || sbPublicUrl;

    if (!targetUrl) {
      console.error(`  -> No valid URL generated for ${card.title}, skipping DB update.`);
      continue;
    }

    // C. Update Database Submission
    console.log(`  -> Updating database submission ID: ${card.id}...`);
    // Fetch current media_url to update the first image block
    const { data: subData, error: subFetchErr } = await supabase
      .from('submissions')
      .select('media_url')
      .eq('id', card.id)
      .single();

    if (subFetchErr) {
      console.error(`  -> Error fetching submission: ${subFetchErr.message}`);
      continue;
    }

    try {
      let blocks = JSON.parse(subData.media_url);
      const imgIdx = blocks.findIndex(b => b.type === 'image');
      if (imgIdx !== -1) {
        blocks[imgIdx].content = blocks[imgIdx].content || {};
        blocks[imgIdx].content.url = targetUrl;
      } else {
        blocks.unshift({
          id: `kitdiv-cover-${card.slug}`,
          type: 'image',
          content: { url: targetUrl, caption: card.title }
        });
      }

      const updatedJson = JSON.stringify(blocks);
      const { error: updateErr } = await supabase
        .from('submissions')
        .update({ media_url: updatedJson })
        .eq('id', card.id);

      if (updateErr) {
        console.error(`  -> Database Update Error: ${updateErr.message}`);
      } else {
        console.log(`  -> Database updated successfully with URL: ${targetUrl}`);
      }
    } catch (parseErr) {
      console.error(`  -> JSON Parse Error for submission ${card.id}: ${parseErr.message}`);
    }
  }

  console.log('\n--- ALL 5 KITDIV COVERS RECREATED, UPLOADED TO CLOUDINARY & SUPABASE, AND DB UPDATED! ---');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
