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
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const POSTERS_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/posters');

const POSTERS_CONFIG = {
  1: {
    bg_color: '#FFFFFF',
    layers: [
      { id: '01_bg_math', name: '01. Padrão Matemático (bg-if)', selector: '.bg-math-pattern', opacity: 140 },
      { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
      { id: '03_header', name: '03. Header & Título Principal', selector: '.p1-header-section' },
      { id: '04_floating_stage', name: '04. Palco Central Flutuante', selector: '.p1-floating-stage' },
      { id: '05_logo_center', name: '05. Emblema Central HUB LabDiv', selector: '.p1-center-logo-box' },
      { id: '06_feature_badges', name: '06. Pílulas Satélites dos Recursos', selector: '.p1-feature-badge' },
      { id: '07_stats_strip', name: '07. Faixa de Métricas & Valores', selector: '.p1-stats-strip' },
      { id: '08_bottom_plane', name: '08. Base Integrada & QR Code', selector: '.p1-bottom-plane' }
    ]
  },
  2: {
    bg_color: '#FFFFFF',
    layers: [
      { id: '01_bg_math', name: '01. Padrão Matemático (bg-if)', selector: '.bg-math-pattern', opacity: 140 },
      { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
      { id: '03_header', name: '03. Moldura Editorial & Título', selector: '.p2-header-section' },
      { id: '04_reticle', name: '04. Retículo Científico de Calibração', selector: '.p2-reticle-container' },
      { id: '05_logo_center', name: '05. Emblema Central HUB LabDiv', selector: '.p2-logo-center-box' },
      { id: '06_stacked_cards', name: '06. 3 Faixas Horizontais dos Eixos', selector: '.p2-stacked-rows-section' },
      { id: '07_bottom_bar', name: '07. Base com QR Code & Licença', selector: '.p2-bottom-bar-section' }
    ]
  },
  3: {
    bg_color: '#FFFFFF',
    layers: [
      { id: '01_bg_math', name: '01. Padrão Matemático', selector: '.bg-math-pattern', opacity: 140 },
      { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
      { id: '04_top_left', name: '04. Título & Hero Topo', selector: '.p3-top-left' },
      { id: '05_top_qr', name: '05. Card QR Code Topo', selector: '.p3-top-right-qr' },
      { id: '06_hero_stage', name: '06. Mockup Smartphone & Ilustração', selector: '.p3-hero-section, .p3-center-stage' },
      { id: '07_bottom_strip', name: '07. Rodapé & Pilares', selector: '.p3-bottom-section, .p3-bottom-strip' }
    ]
  },
  4: {
    bg_color: '#FFFFFF',
    layers: [
      { id: '01_bg_math', name: '01. Padrão Matemático', selector: '.bg-math-pattern', opacity: 140 },
      { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
      { id: '04_header', name: '04. Título & Subtítulo', selector: '.header-section' },
      { id: '05_splatters', name: '05. Espirros de Tinta Vetoriais', selector: '.splatters-svg-layer' },
      { id: '06_center_icon', name: '06. Ícone Central HUB', selector: '.center-app-icon-container' },
      { id: '07_cards', name: '07. Balõezinhos dos Eixos', selector: '.axis-splat-card' },
      { id: '08_qr', name: '08. QR Code Inferior', selector: '.bottom-right-qr-clean' },
      { id: '09_footer', name: '09. Rodapé Institucional', selector: '.bottom-left-footer-box' }
    ]
  },
  5: {
    bg_color: '#FFFFFF',
    layers: [
      { id: '01_bg_math', name: '01. Padrão Matemático', selector: '.bg-math-pattern', opacity: 140 },
      { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
      { id: '04_header', name: '04. Título & Subtítulo', selector: '.header-section' },
      { id: '05_center_icon', name: '05. Ícone Central HUB', selector: '.center-app-icon-container' },
      { id: '06_cards', name: '06. Balõezinhos dos Eixos (Sem #)', selector: '.axis-splat-card' },
      { id: '07_qr', name: '07. QR Code Inferior', selector: '.bottom-right-qr-clean' },
      { id: '08_footer', name: '08. Rodapé Institucional', selector: '.bottom-left-footer-box' }
    ]
  },
  6: {
    bg_color: '#FFFFFF',
    layers: [
      { id: '01_bg_math', name: '01. Padrão Matemático', selector: '.bg-math-pattern', opacity: 140 },
      { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
      { id: '04_header', name: '04. Título & Subtítulo', selector: '.header-section' },
      { id: '05_hand_phone', name: '05. Ilustração Celular na Mão', selector: '.illustration-wrap' },
      { id: '06_cards', name: '06. Balõezinhos dos Eixos', selector: '.notif-balloon' },
      { id: '07_qr', name: '07. QR Code Inferior', selector: '.bottom-qr-col' },
      { id: '08_footer', name: '08. Rodapé Institucional', selector: '.bottom-inst-box' }
    ]
  },
  7: {
    bg_color: '#FFFFFF',
    layers: [
      { id: '01_bg_math', name: '01. Padrão Matemático', selector: '.bg-math-pattern', opacity: 140 },
      { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
      { id: '04_header', name: '04. Título & Badge Hero', selector: '.p7-header' },
      { id: '05_orbital', name: '05. Zona Orbital & Ícone', selector: '.p7-orbital-zone' },
      { id: '06_cards', name: '06. Os 3 Cards dos Eixos', selector: '.p7-card' },
      { id: '07_bottom', name: '07. QR Code & Rodapé', selector: '.bottom-third-plane' }
    ]
  },
  8: {
    bg_color: '#FFFFFF',
    layers: [
      { id: '01_bg_math', name: '01. Padrão Matemático', selector: '.bg-math-pattern', opacity: 140 },
      { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
      { id: '04_hero_box', name: '04. Card Destaque Topo', selector: '.p8-hero-zone' },
      { id: '05_headline', name: '05. Título & Subtítulo', selector: '.p8-headline-zone' },
      { id: '06_tri_grid', name: '06. Grid dos 3 Pilares', selector: '.p8-tri-grid' },
      { id: '07_bottom_panel', name: '07. Painel QR Code & Rodapé', selector: '.bottom-third-plane' }
    ]
  },
  9: {
    bg_color: '#FFFFFF',
    layers: [
      { id: '01_bg_math', name: '01. Padrão Matemático', selector: '.bg-math-pattern', opacity: 140 },
      { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
      { id: '04_left', name: '04. Coluna Hero & Ícone', selector: '.p9-left' },
      { id: '05_right', name: '05. Coluna Cards dos Pilares', selector: '.p9-right' },
      { id: '06_bottom', name: '06. Barra Inferior & QR Code', selector: '.bottom-third-plane' }
    ]
  },
  10: {
    bg_color: '#FFFFFF',
    layers: [
      { id: '01_bg_math', name: '01. Padrão Matemático', selector: '.bg-math-pattern', opacity: 140 },
      { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
      { id: '04_top_header', name: '04. Header & Tag LabDiv', selector: '.p10-top-header' },
      { id: '05_main_title', name: '05. Título Marca HUB LABDIV', selector: '.p10-title' },
      { id: '06_sub_title', name: '06. Subtítulo Descritivo', selector: '.p10-sub' },
      { id: '07_hero_center', name: '07. Ícone Central & Glow', selector: '.p10-center-logo-zone' },
      { id: '08_pillars', name: '08. Os 3 Pilares', selector: '.p10-pillars-row' },
      { id: '09_bottom_qr', name: '09. QR Code & Rodapé', selector: '.bottom-third-plane' }
    ]
  },
  11: {
    bg_color: '#FFFFFF',
    layers: [
      { id: '01_bg_math', name: '01. Padrão Matemático', selector: '.bg-math-pattern', opacity: 140 },
      { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
      { id: '04_left', name: '04. Coluna Editorial Esquerda', selector: '.p11-left-col' },
      { id: '05_right', name: '05. Coluna Destaque Direita & QR', selector: '.p11-right-col' },
      { id: '06_footer', name: '06. Rodapé Institucional', selector: '.bottom-third-plane' }
    ]
  },
  12: {
    bg_color: '#FFFFFF',
    layers: [
      { id: '01_diagonal', name: '01. Faixa Diagonal Decorativa', selector: '.p12-diagonal' },
      { id: '02_bg_math', name: '02. Padrão Matemático', selector: '.bg-math-pattern', opacity: 140 },
      { id: '04_header', name: '04. Header & Título Principal', selector: '.p12-header' },
      { id: '05_cards_grid', name: '05. Grid de Cartões dos Eixos', selector: '.p12-cards-grid' },
      { id: '06_bottom', name: '06. Rodapé com QR Code & Acesso', selector: '.bottom-third-plane' }
    ]
  }
};

async function renderAndExtractLayers(browser, posterIdx) {
  const cfg = POSTERS_CONFIG[posterIdx];
  if (!cfg) return;

  const pDir = path.join(POSTERS_DIR, `poster${posterIdx}`);
  const htmlFile = path.join(pDir, 'poster.html');
  const pngFile = path.join(pDir, 'poster.png');
  const tmpDir = path.join(pDir, '.tmp_layers');

  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

  console.log(`\n========================================`);
  console.log(`🎬 Processando Poster ${posterIdx.toString().padStart(2, '0')}...`);

  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
  await page.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));

  // 1. Render complete master 300 DPI PNG
  const numberedPngFile = path.join(pDir, `poster${posterIdx}.png`);
  const consolidatedDir = path.join(POSTERS_DIR, 'posters_de_1_a_12');
  if (!fs.existsSync(consolidatedDir)) fs.mkdirSync(consolidatedDir, { recursive: true });

  await page.screenshot({
    path: numberedPngFile,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  fs.copyFileSync(numberedPngFile, path.join(consolidatedDir, `poster${posterIdx}.png`));
  console.log(`   📸 [Poster ${posterIdx.toString().padStart(2, '0')}] poster${posterIdx}.png gerado com sucesso.`);

  // 2. Extract layers
  for (const layer of cfg.layers) {
    const layerPage = await browser.newPage();
    await layerPage.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
    await layerPage.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });
    await layerPage.evaluateHandle('document.fonts.ready');

    await layerPage.evaluate((sel) => {
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

    const outLayerPath = path.join(tmpDir, `${layer.id}.png`);
    await layerPage.screenshot({
      path: outLayerPath,
      clip: { x: 0, y: 0, width: 1240, height: 1754 },
      omitBackground: true
    });
    await layerPage.close();
  }

  await page.close();
  console.log(`   🎨 [Poster ${posterIdx.toString().padStart(2, '0')}] Camadas extraídas para montagem do PSD.`);
}

async function main() {
  console.log('🚀 Iniciando pipeline de Renderização e PSDs (Fundo Claro com bg-if.svg, sem badges)...');

  // Save posters_psd_config.json
  const configJsonPath = path.join(PROJECT_ROOT, 'scripts', 'posters_psd_config.json');
  fs.writeFileSync(configJsonPath, JSON.stringify(POSTERS_CONFIG, null, 2), 'utf8');
  console.log(`📝 Configuração de camadas salva em: ${configJsonPath}`);

  // Step 2: Render & Extract layers with Puppeteer
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  for (let i = 1; i <= 12; i++) {
    await renderAndExtractLayers(browser, i);
  }

  await browser.close();
  console.log('\n✅ Todas as capturas em alta resolução foram finalizadas!');

  // Step 3: Run python PSD generator
  console.log('\n🐍 Chamando Python para montagem dos arquivos .PSD multi-camadas...');
  const pyScript = path.join(__dirname, 'generate-all-psds.py');
  execSync(`python3 "${pyScript}" "${configJsonPath}"`, { stdio: 'inherit' });

  console.log('\n🎉 SUCESSO TOTAL! Todos os 12 pôsteres possuem poster.png oficial com numeração e poster.psd com camadas editáveis!');
}

main().catch(err => {
  console.error('❌ Falha no pipeline:', err);
  process.exit(1);
});
