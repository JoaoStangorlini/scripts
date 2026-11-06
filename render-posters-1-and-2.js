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
const POSTERS_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/posters');
const ARTIFACT_DIR = process.env.ARTIFACT_DIR || null;

async function renderPoster(num) {
  const posterDir = path.join(POSTERS_DIR, `poster${num}`);
  const htmlPath = path.join(posterDir, 'poster.html');

  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ Arquivo não encontrado: ${htmlPath}`);
    return;
  }

  console.log(`🚀 Renderizando Poster ${num}...`);
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
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1000));

  const outPngPath = path.join(posterDir, 'poster.png');

  await page.screenshot({
    path: outPngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  // Gera também com o nome numerado para conveniência
  fs.copyFileSync(outPngPath, path.join(posterDir, `poster${num}.png`));
  console.log(`✅ Poster ${num} gerado em alta resolução: ${outPngPath}`);

  // Preview PNG salvo apenas nos artefatos do agente
  if (fs.existsSync(ARTIFACT_DIR)) {
    const previewPath = path.join(ARTIFACT_DIR, `poster${num}_preview.png`);
    fs.copyFileSync(outPngPath, previewPath);
    console.log(`✅ Preview do Poster ${num} salvo em: ${previewPath}`);
  }

  await browser.close();
}

async function main() {
  await renderPoster(1);
  await renderPoster(2);
  console.log('🎉 Todos os pôsteres foram renderizados com sucesso!');
}

main().catch(err => {
  console.error('❌ Erro no render:', err);
  process.exit(1);
});
