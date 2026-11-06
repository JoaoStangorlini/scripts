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
const ARTIFACT_DIR = (process.env.ARTIFACTS_DIR || './artifacts');

async function main() {
  const sourceHtmlPath = path.join(ARTIFACT_DIR, 'scratch/poster1_opcao2_bento_grid.html');
  const targetHtmlPath = path.join(PROJECT_ROOT, 'public/divulgacao/posters/poster1/poster.html');
  const targetPngPath = path.join(PROJECT_ROOT, 'public/divulgacao/posters/poster1/poster1.png');

  if (!fs.existsSync(sourceHtmlPath)) {
    throw new Error(`Arquivo fonte não encontrado: ${sourceHtmlPath}`);
  }

  let htmlContent = fs.readFileSync(sourceHtmlPath, 'utf8');

  // Adiciona o cabeçalho AGPLv3 no topo do HTML se não presente
  if (!htmlContent.includes('Licença Pública Geral Affero GNU (AGPLv3)')) {
    const agplHeader = `<!--
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 * Este programa é um software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3).
-->\n`;
    htmlContent = agplHeader + htmlContent;
  }

  fs.writeFileSync(targetHtmlPath, htmlContent, 'utf8');
  console.log(`✅ Salvo: ${targetHtmlPath}`);

  // Renderizar o PNG oficial a 300 DPI
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
  await page.goto('file://' + targetHtmlPath, { waitUntil: 'networkidle0' });

  await page.screenshot({
    path: targetPngPath,
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Pôster Oficial Renderizado: ${targetPngPath}`);

  await page.close();
  await browser.close();
  console.log('🎉 Pôster 1 oficial atualizado com sucesso!');
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
