/*!
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 *
 * Este programa é um software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
 * publicada pela Free Software Foundation.
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const POSTER3_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/poster3');
const HTML_PATH = path.join(POSTER3_DIR, 'poster.html');

async function render() {
  console.log('🚀 Iniciando renderização do Poster 3...');
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1240,
      height: 1754,
      deviceScaleFactor: 2 // 2480 x 3508 px (300 DPI A4)
    },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1000));

  const outPngPath = path.join(POSTER3_DIR, 'poster.png');
  await page.screenshot({
    path: outPngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Poster 3 gerado em alta resolução: ${outPngPath}`);

  // Preview PNG (menor resolução para visualização rápida)
  const previewPage = await browser.newPage();
  await previewPage.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 0.5 });
  await previewPage.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });
  await previewPage.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 500));
  const previewPath = path.join(POSTER3_DIR, 'poster_preview.png');
  await previewPage.screenshot({
    path: previewPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Preview do Poster 3 gerado em: ${previewPath}`);

  await browser.close();
}

render().catch(err => {
  console.error('❌ Erro no render:', err);
  process.exit(1);
});
