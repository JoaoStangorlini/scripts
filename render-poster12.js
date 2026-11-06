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
const POSTER12_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/posters/poster12');
const POSTERS_DE_1_A_12_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/posters/posters_de_1_a_12');
const HTML_PATH = path.join(POSTER12_DIR, 'poster.html');

async function render() {
  console.log('🚀 Iniciando renderização do Poster 12 atualizado...');
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

  const outPngPath1 = path.join(POSTER12_DIR, 'poster12.png');
  const outPngPath2 = path.join(POSTER12_DIR, 'poster.png');
  const outPngPath3 = path.join(POSTERS_DE_1_A_12_DIR, 'poster12.png');

  await page.screenshot({
    path: outPngPath1,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Poster 12 gerado em alta resolução: ${outPngPath1}`);

  fs.copyFileSync(outPngPath1, outPngPath2);
  if (fs.existsSync(POSTERS_DE_1_A_12_DIR)) {
    fs.copyFileSync(outPngPath1, outPngPath3);
  }

  // Preview PNG (resolução 1x para visualização rápida)
  const previewPage = await browser.newPage();
  await previewPage.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 0.5 });
  await previewPage.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });
  await previewPage.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 500));
  const previewPath = path.join(POSTER12_DIR, 'poster_preview.png');
  await previewPage.screenshot({
    path: previewPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Preview do Poster 12 gerado em: ${previewPath}`);

  // Copiar também para o diretório de artefatos atual para embedding
  const artifactDir = (process.env.ARTIFACTS_DIR || './artifacts');
  if (fs.existsSync(artifactDir)) {
    fs.copyFileSync(previewPath, path.join(artifactDir, 'poster12_preview.png'));
  }

  await browser.close();
}

render().catch(err => {
  console.error('❌ Erro no render de Poster 12:', err);
  process.exit(1);
});
