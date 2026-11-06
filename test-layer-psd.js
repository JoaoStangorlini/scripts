/*!
 * Test layer extraction and PSD assembly for Poster 10
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const POSTER_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/posters/poster10');
const HTML_PATH = path.join(POSTER_DIR, 'poster.html');
const TMP_DIR = path.join(POSTER_DIR, '.tmp_layers');

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

const LAYERS = [
  { id: '01_bg_math', name: '01. Padrão Matemático', selector: '.bg-math-pattern' },
  { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
  { id: '03_top_header', name: '03. Topo & Tag LabDiv', selector: '.p10-top-header' },
  { id: '04_main_title', name: '04. Título Principal', selector: '.p10-brand-main-title' },
  { id: '05_sub_title', name: '05. Subtítulo Descritivo', selector: '.p10-sub' },
  { id: '06_hero_center', name: '06. Ícone Central & Glow', selector: '.p10-center-hero-zone' },
  { id: '07_pillars', name: '07. Os 3 Pilares', selector: '.p10-pillars-row' },
  { id: '08_bottom_qr', name: '08. QR Code & Acesso', selector: '.bottom-third-plane' }
];

async function run() {
  console.log('🚀 Iniciando extração de camadas do Poster 10...');
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  for (const layer of LAYERS) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
    await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

    await page.evaluate((sel) => {
      const style = document.createElement('style');
      style.innerHTML = `
        body, html, .poster-container {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
        }
        * { visibility: hidden !important; }
        ${sel}, ${sel} * { visibility: visible !important; }
      `;
      document.head.appendChild(style);
    }, layer.selector);

    const outPath = path.join(TMP_DIR, `${layer.id}.png`);
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: 1240, height: 1754 },
      omitBackground: true
    });
    console.log(`   📸 Camada extraída: ${layer.name}`);
    await page.close();
  }

  await browser.close();
  console.log('✅ Todas as camadas foram extraídas!');
}

run().catch(console.error);
