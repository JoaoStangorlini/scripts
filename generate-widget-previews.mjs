/*!
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 * * Este programa é software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
 * publicada pela Free Software Foundation.
 */

import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const drawableDir = resolve(__dirname, '../android/app/src/main/res/drawable');

async function main() {
    console.log('🎨 Generating high-res Android widget preview images...\n');

    // 1. Widget Global Preview (4x3)
    const globalSvg = `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="600" rx="32" fill="#18181B" stroke="#27272A" stroke-width="4"/>
      <!-- Header -->
      <text x="32" y="52" fill="#E2E8F0" font-family="sans-serif" font-weight="bold" font-size="24">Dimensões ▾</text>
      <rect x="620" y="24" width="36" height="36" rx="8" fill="#FFCC00"/>
      <text x="638" y="48" fill="#121212" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle">E</text>
      <rect x="668" y="24" width="36" height="36" rx="8" fill="#A855F7"/>
      <text x="686" y="48" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle">T</text>
      <rect x="716" y="24" width="36" height="36" rx="8" fill="#3B82F6"/>
      <text x="734" y="50" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">+</text>

      <line x1="32" y1="80" x2="768" y2="80" stroke="#2A2A2A" stroke-width="2"/>

      <!-- Split View Left: Mini Month + Single Week -->
      <text x="32" y="120" fill="#CBD5E1" font-family="sans-serif" font-weight="bold" font-size="20">Agosto 2026</text>
      <text x="32" y="150" fill="#94A3B8" font-family="sans-serif" font-size="16" letter-spacing="18">D  S  T  Q  Q  S  S</text>
      <text x="32" y="180" fill="#64748B" font-family="sans-serif" font-size="15" letter-spacing="18">                 1</text>
      <text x="32" y="210" fill="#64748B" font-family="sans-serif" font-size="15" letter-spacing="14"> 2  3  4  5  6  7  8</text>
      <text x="32" y="240" fill="#64748B" font-family="sans-serif" font-size="15" letter-spacing="10"> 9 10 11 12 13 14 15</text>
      <text x="32" y="270" fill="#64748B" font-family="sans-serif" font-size="15" letter-spacing="10">16 17 18 19 20 21 22</text>
      <text x="32" y="300" fill="#64748B" font-family="sans-serif" font-size="15" letter-spacing="10">23 24 25 26 27 28 29</text>
      <text x="32" y="330" fill="#64748B" font-family="sans-serif" font-size="15" letter-spacing="10">30 31</text>

      <line x1="32" y1="360" x2="380" y2="360" stroke="#2A2A2A" stroke-width="2"/>

      <!-- Single Week Section (D 9 -> S 15) -->
      <g transform="translate(32, 380)">
        <text x="15" y="20" fill="#94A3B8" font-size="14" font-family="sans-serif" text-anchor="middle">D</text>
        <text x="15" y="44" fill="#FFFFFF" font-size="18" font-weight="bold" font-family="sans-serif" text-anchor="middle">9</text>

        <text x="65" y="20" fill="#94A3B8" font-size="14" font-family="sans-serif" text-anchor="middle">S</text>
        <text x="65" y="44" fill="#FFFFFF" font-size="18" font-weight="bold" font-family="sans-serif" text-anchor="middle">10</text>

        <text x="115" y="20" fill="#94A3B8" font-size="14" font-family="sans-serif" text-anchor="middle">T</text>
        <text x="115" y="44" fill="#FFFFFF" font-size="18" font-weight="bold" font-family="sans-serif" text-anchor="middle">11</text>

        <text x="165" y="20" fill="#94A3B8" font-size="14" font-family="sans-serif" text-anchor="middle">Q</text>
        <text x="165" y="44" fill="#FFFFFF" font-size="18" font-weight="bold" font-family="sans-serif" text-anchor="middle">12</text>

        <text x="215" y="20" fill="#A855F7" font-size="14" font-family="sans-serif" text-anchor="middle">Q</text>
        <text x="215" y="44" fill="#A855F7" font-size="18" font-weight="bold" font-family="sans-serif" text-anchor="middle">13</text>

        <text x="265" y="20" fill="#94A3B8" font-size="14" font-family="sans-serif" text-anchor="middle">S</text>
        <text x="265" y="44" fill="#FFFFFF" font-size="18" font-weight="bold" font-family="sans-serif" text-anchor="middle">14</text>

        <text x="315" y="20" fill="#94A3B8" font-size="14" font-family="sans-serif" text-anchor="middle">S</text>
        <text x="315" y="44" fill="#FFFFFF" font-size="18" font-weight="bold" font-family="sans-serif" text-anchor="middle">15</text>
      </g>

      <!-- Center Divider -->
      <line x1="410" y1="90" x2="410" y2="570" stroke="#2A2A2A" stroke-width="2"/>

      <!-- Split View Right: Agenda Events List -->
      <g transform="translate(430, 110)">
        <text x="0" y="20" fill="#E2E8F0" font-family="sans-serif" font-weight="bold" font-size="22">Sem data</text>
        
        <rect x="0" y="40" width="330" height="80" rx="16" fill="#2D223B"/>
        <text x="16" y="75" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="18">Dermatologista</text>
        <text x="16" y="102" fill="#94A3B8" font-family="sans-serif" font-size="14">Dia inteiro</text>

        <rect x="0" y="135" width="330" height="52" rx="14" fill="#262626"/>
        <text x="16" y="168" fill="#FFCC00" font-family="sans-serif" font-size="16">feedback por email... ✎</text>

        <rect x="0" y="200" width="330" height="52" rx="14" fill="#262626"/>
        <text x="16" y="233" fill="#FFCC00" font-family="sans-serif" font-size="16">opcao no menu... ✎</text>

        <rect x="0" y="265" width="330" height="52" rx="14" fill="#262626"/>
        <text x="16" y="298" fill="#FFCC00" font-family="sans-serif" font-size="16">minimo de status... ✎</text>

        <rect x="0" y="330" width="330" height="52" rx="14" fill="#262626"/>
        <text x="16" y="363" fill="#FFCC00" font-family="sans-serif" font-size="16">abrir eventos p... ✎</text>
      </g>
    </svg>`;

    // 2. Widget Calendar Preview (3x3)
    const calendarSvg = `<svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="600" rx="32" fill="#18181B" stroke="#27272A" stroke-width="4"/>
      <!-- Header -->
      <text x="32" y="52" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24">Agosto 2026</text>
      <rect x="420" y="24" width="36" height="36" rx="8" fill="#FFCC00"/>
      <text x="438" y="48" fill="#121212" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle">E</text>
      <rect x="468" y="24" width="36" height="36" rx="8" fill="#A855F7"/>
      <text x="486" y="48" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle">T</text>
      <rect x="516" y="24" width="36" height="36" rx="8" fill="#3B82F6"/>
      <text x="534" y="50" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">+</text>

      <!-- Day Names Header -->
      <g transform="translate(32, 90)">
        <text x="38" y="0" fill="#94A3B8" font-family="sans-serif" font-size="18" text-anchor="middle">D</text>
        <text x="114" y="0" fill="#94A3B8" font-family="sans-serif" font-size="18" text-anchor="middle">S</text>
        <text x="190" y="0" fill="#94A3B8" font-family="sans-serif" font-size="18" text-anchor="middle">T</text>
        <text x="266" y="0" fill="#94A3B8" font-family="sans-serif" font-size="18" text-anchor="middle">Q</text>
        <text x="342" y="0" fill="#94A3B8" font-family="sans-serif" font-size="18" text-anchor="middle">Q</text>
        <text x="418" y="0" fill="#94A3B8" font-family="sans-serif" font-size="18" text-anchor="middle">S</text>
        <text x="494" y="0" fill="#94A3B8" font-family="sans-serif" font-size="18" text-anchor="middle">S</text>
      </g>

      <!-- 6 Rows Grid (Days 1..31 complete) -->
      <g transform="translate(32, 120)">
        <!-- Row 1 -->
        <text x="494" y="40" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">1</text>

        <!-- Row 2 -->
        <text x="38" y="110" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">2</text>
        <rect x="94" y="75" width="40" height="48" rx="10" fill="#2D223B"/>
        <text x="114" y="110" fill="#A855F7" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">3</text>
        <text x="190" y="110" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">4</text>
        <text x="266" y="110" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">5</text>
        <text x="342" y="110" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">6</text>
        <text x="418" y="110" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">7</text>
        <text x="494" y="110" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">8</text>

        <!-- Row 3 -->
        <text x="38" y="180" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">9</text>
        <rect x="94" y="145" width="40" height="48" rx="10" fill="#332B12"/>
        <text x="114" y="180" fill="#FFCC00" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">10</text>
        <text x="190" y="180" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">11</text>
        <text x="266" y="180" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">12</text>
        <text x="342" y="180" fill="#A855F7" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">13</text>
        <text x="418" y="180" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">14</text>
        <text x="494" y="180" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">15</text>

        <!-- Row 4 -->
        <text x="38" y="250" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">16</text>
        <text x="114" y="250" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">17</text>
        <text x="190" y="250" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">18</text>
        <text x="266" y="250" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">19</text>
        <text x="342" y="250" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">20</text>
        <text x="418" y="250" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">21</text>
        <text x="494" y="250" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">22</text>

        <!-- Row 5 -->
        <text x="38" y="320" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">23</text>
        <text x="114" y="320" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">24</text>
        <text x="190" y="320" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">25</text>
        <text x="266" y="320" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">26</text>
        <text x="342" y="320" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">27</text>
        <text x="418" y="320" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">28</text>
        <text x="494" y="320" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">29</text>

        <!-- Row 6 (Days 30 & 31) -->
        <text x="38" y="390" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">30</text>
        <text x="114" y="390" fill="#E2E8F0" font-family="sans-serif" font-size="20" text-anchor="middle">31</text>
      </g>
    </svg>`;

    // 3. Widget Agenda Preview (2x3)
    const agendaSvg = `<svg width="400" height="600" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="600" rx="32" fill="#18181B" stroke="#27272A" stroke-width="4"/>
      <!-- Header -->
      <text x="24" y="52" fill="#E2E8F0" font-family="sans-serif" font-weight="bold" font-size="22">Dimensões ▾</text>
      <rect x="220" y="24" width="36" height="36" rx="8" fill="#FFCC00"/>
      <text x="238" y="48" fill="#121212" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle">E</text>
      <rect x="268" y="24" width="36" height="36" rx="8" fill="#A855F7"/>
      <text x="286" y="48" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="20" text-anchor="middle">T</text>
      <rect x="316" y="24" width="36" height="36" rx="8" fill="#3B82F6"/>
      <text x="334" y="50" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">+</text>

      <g transform="translate(24, 100)">
        <text x="0" y="20" fill="#E2E8F0" font-family="sans-serif" font-weight="bold" font-size="22">Sem data</text>
        
        <rect x="0" y="40" width="350" height="90" rx="18" fill="#2D223B"/>
        <text x="20" y="80" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="20">Dermatologista</text>
        <text x="20" y="110" fill="#94A3B8" font-family="sans-serif" font-size="16">Dia inteiro</text>

        <rect x="0" y="150" width="350" height="58" rx="16" fill="#262626"/>
        <text x="20" y="186" fill="#FFCC00" font-family="sans-serif" font-size="18">feedback por email... ✎</text>

        <rect x="0" y="225" width="350" height="58" rx="16" fill="#262626"/>
        <text x="20" y="261" fill="#FFCC00" font-family="sans-serif" font-size="18">opcao no menu... ✎</text>

        <rect x="0" y="300" width="350" height="58" rx="16" fill="#262626"/>
        <text x="20" y="336" fill="#FFCC00" font-family="sans-serif" font-size="18">minimo de status... ✎</text>

        <rect x="0" y="375" width="350" height="58" rx="16" fill="#262626"/>
        <text x="20" y="411" fill="#FFCC00" font-family="sans-serif" font-size="18">abrir eventos p... ✎</text>
      </g>
    </svg>`;

    // 4. Widget Weekly Preview (4x2)
    const weeklySvg = `<svg width="800" height="350" viewBox="0 0 800 350" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="350" rx="32" fill="#18181B" stroke="#27272A" stroke-width="4"/>
      
      <!-- Actions Stack Left -->
      <g transform="translate(32, 50)">
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#FFCC00"/>
        <text x="24" y="32" fill="#121212" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">E</text>

        <rect x="0" y="68" width="48" height="48" rx="12" fill="#A855F7"/>
        <text x="24" y="100" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">T</text>

        <rect x="0" y="136" width="48" height="48" rx="12" fill="#3B82F6"/>
        <text x="24" y="170" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="30" text-anchor="middle">+</text>
      </g>

      <line x1="110" y1="30" x2="110" y2="320" stroke="#2A2A2A" stroke-width="2"/>

      <!-- Single Week Columns (D 9 -> S 15) -->
      <g transform="translate(140, 40)">
        <!-- Day 1: D 9 -->
        <text x="35" y="30" fill="#94A3B8" font-family="sans-serif" font-size="20" text-anchor="middle">D</text>
        <text x="35" y="65" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">9</text>
        <rect x="5" y="85" width="60" height="180" rx="12" fill="#262626"/>

        <!-- Day 2: S 10 -->
        <text x="130" y="30" fill="#94A3B8" font-family="sans-serif" font-size="20" text-anchor="middle">S</text>
        <text x="130" y="65" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">10</text>
        <rect x="100" y="85" width="60" height="180" rx="12" fill="#262626"/>

        <!-- Day 3: T 11 -->
        <text x="225" y="30" fill="#94A3B8" font-family="sans-serif" font-size="20" text-anchor="middle">T</text>
        <text x="225" y="65" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">11</text>
        <rect x="195" y="85" width="60" height="180" rx="12" fill="#262626"/>

        <!-- Day 4: Q 12 -->
        <text x="320" y="30" fill="#94A3B8" font-family="sans-serif" font-size="20" text-anchor="middle">Q</text>
        <text x="320" y="65" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">12</text>
        <rect x="290" y="85" width="60" height="180" rx="12" fill="#262626"/>

        <!-- Day 5: Q 13 -->
        <text x="415" y="30" fill="#A855F7" font-family="sans-serif" font-size="20" text-anchor="middle">Q</text>
        <text x="415" y="65" fill="#A855F7" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">13</text>
        <rect x="385" y="85" width="60" height="180" rx="12" fill="#2D223B"/>

        <!-- Day 6: S 14 -->
        <text x="510" y="30" fill="#94A3B8" font-family="sans-serif" font-size="20" text-anchor="middle">S</text>
        <text x="510" y="65" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">14</text>
        <rect x="480" y="85" width="60" height="180" rx="12" fill="#262626"/>

        <!-- Day 7: S 15 -->
        <text x="605" y="30" fill="#94A3B8" font-family="sans-serif" font-size="20" text-anchor="middle">S</text>
        <text x="605" y="65" fill="#FFFFFF" font-family="sans-serif" font-weight="bold" font-size="24" text-anchor="middle">15</text>
        <rect x="575" y="85" width="60" height="180" rx="12" fill="#262626"/>
      </g>
    </svg>`;

    const targets = [
        { name: 'widget_preview_global.png', svg: globalSvg },
        { name: 'widget_preview_calendar.png', svg: calendarSvg },
        { name: 'widget_preview_agenda.png', svg: agendaSvg },
        { name: 'widget_preview_weekly.png', svg: weeklySvg },
    ];

    for (const t of targets) {
        const path = resolve(drawableDir, t.name);
        await sharp(Buffer.from(t.svg))
            .png()
            .toFile(path);
        console.log(` ✅ Saved ${t.name}`);
    }

    console.log('\n✨ All widget preview images generated successfully!');
}

main().catch(err => {
    console.error('❌ Error generating widget previews:', err);
    process.exit(1);
});
