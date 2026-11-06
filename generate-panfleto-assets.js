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
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const PANFLETOS_DIR = path.join(PUBLIC_DIR, 'divulgacao/panfletos');
const OUTPUT_DIR = path.join(PANFLETOS_DIR, 'editavel_photoshop_illustrator');
const PNG_DIR = path.join(OUTPUT_DIR, 'elementos_png_300dpi');
const PNG_EXTERNA_DIR = path.join(PNG_DIR, 'face_externa');
const PNG_INTERNA_DIR = path.join(PNG_DIR, 'face_interna');
const SVG_DIR = path.join(OUTPUT_DIR, 'elementos_vetoriais_svg');
const TMP_RAW_DIR = path.join(OUTPUT_DIR, '.tmp_raw_layers');
const TMP_EXTERNA_DIR = path.join(TMP_RAW_DIR, 'externa');
const TMP_INTERNA_DIR = path.join(TMP_RAW_DIR, 'interna');

[OUTPUT_DIR, PNG_DIR, PNG_EXTERNA_DIR, PNG_INTERNA_DIR, SVG_DIR, TMP_RAW_DIR, TMP_EXTERNA_DIR, TMP_INTERNA_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Configuração das camadas da FACE EXTERNA (Capa, Verso, Sobre o LabDiv)
const LAYERS_EXTERNA = [
  // Fundo & Guias
  { id: '01_fundo_padrao_matematico', name: 'Padrão Fórmulas Matemáticas', group: '01_Fundo_e_Guias', customCapture: 'math_pattern' },
  { id: '02_guias_de_dobra', name: 'Guias de Dobra (Linhas Tracejadas)', group: '01_Fundo_e_Guias', selector: '.fold-guide' },

  // Painel 1: Sobre o LabDiv (Esquerda)
  { id: '03_p1_topo_titulos', name: 'Painel 1: Títulos & Slogan LabDiv', group: '02_Painel_1_Sobre_LabDiv', selector: '.panel-1 > div:nth-child(1)' },
  { id: '04_p1_card_mentorias', name: 'Painel 1: Card Mentorias (MIT Model)', group: '02_Painel_1_Sobre_LabDiv', selector: '.panel-1 .card-accent-red' },
  { id: '05_p1_card_projetos', name: 'Painel 1: Card Projetos & Frentes', group: '02_Painel_1_Sobre_LabDiv', selector: '.panel-1 .card-accent-blue' },
  { id: '06_p1_card_digitalab', name: 'Painel 1: Card DigitaLab (Estúdio)', group: '02_Painel_1_Sobre_LabDiv', selector: '.panel-1 .card-accent-yellow' },
  { id: '07_p1_card_contato_qr', name: 'Painel 1: Card Localização, Contato & QR', group: '02_Painel_1_Sobre_LabDiv', selector: '.panel-1 > div:last-child' },

  // Painel 2: Verso & QR Codes (Centro)
  { id: '08_p2_topo_titulo', name: 'Painel 2: Título Acesso Imediato', group: '03_Painel_2_Acesso_e_QRCodes', selector: '.panel-2 > div:nth-child(1)' },
  { id: '09_p2_card_qr_web', name: 'Painel 2: Card QR Code Web PWA', group: '03_Painel_2_Acesso_e_QRCodes', selector: '.panel-2 .qr-card-box:nth-of-type(1)' },
  { id: '10_p2_card_qr_playstore', name: 'Painel 2: Card QR Google Play & Instalar', group: '03_Painel_2_Acesso_e_QRCodes', selector: '.panel-2 .qr-card-box:nth-of-type(2)' },
  { id: '11_p2_card_em_desenvolvimento', name: 'Painel 2: Card iOS & Desktop a caminho', group: '03_Painel_2_Acesso_e_QRCodes', selector: '.panel-2 > div:nth-child(2) > div:last-child' },

  // Painel 3: Capa Oficial (Direita)
  { id: '12_p3_topo_institucional', name: 'Capa: Topo IFUSP & LabDiv', group: '04_Painel_3_Capa_Oficial', selector: '.panel-3 > div:nth-child(1)' },
  { id: '13_p3_logo_capelo', name: 'Capa: Símbolo Capelo LabDiv', group: '04_Painel_3_Capa_Oficial', selector: '.panel-3 > div:nth-child(2) > div:nth-child(1)' },
  { id: '14_p3_titulo_hub_labdiv', name: 'Capa: Título HUB LabDiv', group: '04_Painel_3_Capa_Oficial', selector: '.panel-3 > div:nth-child(2) > div:nth-child(2)' },
  { id: '15_p3_slogan_1app', name: 'Capa: Slogan 1 APP • INÚMERAS FUNÇÕES', group: '04_Painel_3_Capa_Oficial', selector: '.panel-3 > div:nth-child(2) > div:nth-child(3)' },
  { id: '16_p3_texto_descritivo', name: 'Capa: Texto Descritivo da Plataforma', group: '04_Painel_3_Capa_Oficial', selector: '.panel-3 > div:nth-child(2) > p' },
  { id: '17_p3_mini_card_social', name: 'Capa: Mini-card Eixo 1 Social', group: '04_Painel_3_Capa_Oficial', selector: '.panel-3 > div:nth-child(2) > div:last-child > div:nth-child(1)' },
  { id: '18_p3_mini_card_informativo', name: 'Capa: Mini-card Eixo 2 Informativo', group: '04_Painel_3_Capa_Oficial', selector: '.panel-3 > div:nth-child(2) > div:last-child > div:nth-child(2)' },
  { id: '19_p3_mini_card_ferramentas', name: 'Capa: Mini-card Eixo 3 Ferramentas', group: '04_Painel_3_Capa_Oficial', selector: '.panel-3 > div:nth-child(2) > div:last-child > div:nth-child(3)' },
  { id: '20_p3_rodape_capa', name: 'Capa: Linha de Licença AGPLv3 IFUSP', group: '04_Painel_3_Capa_Oficial', selector: '.panel-3 > div:nth-child(3)' }
];

// Configuração das camadas da FACE INTERNA (Os 3 Eixos Temáticos + Rodapé)
const LAYERS_INTERNA = [
  // Fundo & Guias
  { id: '01_fundo_padrao_matematico', name: 'Padrão Fórmulas Matemáticas', group: '01_Fundo_e_Guias', customCapture: 'math_pattern' },
  { id: '02_guias_de_dobra', name: 'Guias de Dobra (Linhas Tracejadas)', group: '01_Fundo_e_Guias', selector: '.fold-guide' },

  // Header superior
  { id: '03_header_unificado', name: 'Topo Geral: HUB LabDiv & Slogan', group: '02_Topo_Geral', selector: '.sheet-header-bar' },

  // Painel 1: Eixo Social (Esquerda)
  { id: '04_p1_social_header', name: 'Eixo 1: Cabeçalho & Descrição', group: '03_Eixo_1_Social', selector: '.panel-int-1 > div:nth-child(1)' },
  { id: '05_p1_card_comunidade', name: 'Eixo 1: Card Comunidade (Fluxo/Galeria)', group: '03_Eixo_1_Social', selector: '.panel-int-1 .mini-card:nth-of-type(1)' },
  { id: '06_p1_card_interacoes', name: 'Eixo 1: Card Central de Interações', group: '03_Eixo_1_Social', selector: '.panel-int-1 .mini-card:nth-of-type(2)' },
  { id: '07_p1_card_lab_pessoal', name: 'Eixo 1: Card Lab Pessoal', group: '03_Eixo_1_Social', selector: '.panel-int-1 .mini-card:nth-of-type(3)' },

  // Painel 2: Eixo Informativo (Centro)
  { id: '08_p2_info_header', name: 'Eixo 2: Cabeçalho & Descrição', group: '04_Eixo_2_Informativo', selector: '.panel-int-2 > div:nth-child(1)' },
  { id: '09_p2_card_wiki', name: 'Eixo 2: Card Wiki Central da USP', group: '04_Eixo_2_Informativo', selector: '.panel-int-2 .mini-card:nth-of-type(1)' },
  { id: '10_p2_card_instituto', name: 'Eixo 2: Card O Instituto', group: '04_Eixo_2_Informativo', selector: '.panel-int-2 .mini-card:nth-of-type(2)' },
  { id: '11_p2_card_interativo', name: 'Eixo 2: Card Interativo & FAQ', group: '04_Eixo_2_Informativo', selector: '.panel-int-2 .mini-card:nth-of-type(3)' },

  // Painel 3: Eixo Ferramentas (Direita)
  { id: '12_p3_tools_header', name: 'Eixo 3: Cabeçalho & Descrição', group: '05_Eixo_3_Ferramentas', selector: '.panel-int-3 > div:nth-child(1)' },
  { id: '13_p3_card_planejamento', name: 'Eixo 3: Card Planejamento Acadêmico', group: '05_Eixo_3_Ferramentas', selector: '.panel-int-3 .mini-card:nth-of-type(1)' },
  { id: '14_p3_card_match', name: 'Eixo 3: Card Match & Parcerias', group: '05_Eixo_3_Ferramentas', selector: '.panel-int-3 .mini-card:nth-of-type(2)' },
  { id: '15_p3_card_produtividade', name: 'Eixo 3: Card Produtividade Científica', group: '05_Eixo_3_Ferramentas', selector: '.panel-int-3 .mini-card:nth-of-type(3)' },

  // Rodapé Unificado
  { id: '16_footer_linha_gradiente', name: 'Rodapé: Linha Degradê Contínua', group: '06_Rodape_Unificado', selector: '.sheet-footer-divider' },
  { id: '17_footer_card_discentes', name: 'Rodapé: Card Para Discentes (Azul)', group: '06_Rodape_Unificado', selector: '.sheet-footer-cards .card-footer-blue' },
  { id: '18_footer_card_docentes', name: 'Rodapé: Card Para Docentes (Vermelho)', group: '06_Rodape_Unificado', selector: '.sheet-footer-cards .card-footer-red' },
  { id: '19_footer_card_sociedade', name: 'Rodapé: Card Para Sociedade (Amarelo)', group: '06_Rodape_Unificado', selector: '.sheet-footer-cards .card-footer-yellow' }
];

async function extractFaceLayers(browser, htmlPath, layersConfig, tmpOutDir, pdfOutName) {
  console.log(`\n📄 Processando página: ${path.basename(htmlPath)}...`);
  const page = await browser.newPage();
  await page.setViewport({ width: 1754, height: 1240, deviceScaleFactor: 2 });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));

  // 1. Export Vector PDF directly from Chrome
  const vectorPdfPath = path.join(OUTPUT_DIR, pdfOutName);
  await page.pdf({
    path: vectorPdfPath,
    width: '1754px',
    height: '1240px',
    printBackground: true,
    pageRanges: '1'
  });
  console.log(`✅ PDF Vetorial gerado: ${vectorPdfPath}`);

  // 2. Export base background (#F8FAFC)
  const baseBgPath = path.join(tmpOutDir, '00_fundo_base.png');
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(el => el.style.visibility = 'hidden');
    document.body.style.visibility = 'visible';
    document.body.style.backgroundColor = '#F8FAFC';
    const cont = document.querySelector('.tri-sheet');
    if (cont) {
      cont.style.visibility = 'visible';
      cont.style.backgroundColor = '#F8FAFC';
    }
    const math = document.querySelector('.bg-math-pattern');
    if (math) math.style.display = 'none';
  });
  await page.screenshot({
    path: baseBgPath,
    clip: { x: 0, y: 0, width: 1754, height: 1240 }
  });

  // 3. Export each layer
  for (const cfg of layersConfig) {
    console.log(`  📸 Capturando camada: ${cfg.name} (${cfg.id})...`);
    await page.reload({ waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

    if (cfg.customCapture === 'math_pattern') {
      await page.evaluate(() => {
        document.body.style.backgroundColor = 'transparent';
        const cont = document.querySelector('.tri-sheet');
        if (cont) cont.style.backgroundColor = 'transparent';
        document.querySelectorAll('.panel, .sheet-header-bar, .sheet-footer-bar, .fold-guide').forEach(el => {
          el.style.display = 'none';
        });
        const math = document.querySelector('.bg-math-pattern');
        if (math) {
          math.style.display = 'block';
          math.style.opacity = '1.0';
        }
      });
    } else {
      await page.evaluate((sel) => {
        const style = document.createElement('style');
        style.innerHTML = `
          body, html, .tri-sheet, .sheet-footer-cards {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
          }
          .bg-math-pattern { display: none !important; }
          * { visibility: hidden !important; }
          ${sel}, ${sel} * { visibility: visible !important; }
        `;
        document.head.appendChild(style);
      }, cfg.selector);
    }

    const outLayerRawPath = path.join(tmpOutDir, `${cfg.id}.png`);
    await page.screenshot({
      path: outLayerRawPath,
      clip: { x: 0, y: 0, width: 1754, height: 1240 },
      omitBackground: true
    });
  }

  await page.close();
}

// Export SVG assets
function exportSvgAssets() {
  console.log('\n🎨 Exportando ativos vetoriais (.SVG) para o panfleto...');
  const svgs = [
    { src: path.join(PUBLIC_DIR, 'icone-HUBLabDiv.svg'), dest: 'icone-HUBLabDiv.svg' },
    { src: path.join(PUBLIC_DIR, 'bg-if.svg'), dest: 'bg-if-padrao-matematico.svg' },
    { src: path.join(PUBLIC_DIR, 'divulgacao/qr-web.svg'), dest: 'qr-hub-web.svg' },
    { src: path.join(PUBLIC_DIR, 'divulgacao/qr-playstore.svg'), dest: 'qr-google-play.svg' }
  ];

  svgs.forEach(s => {
    if (fs.existsSync(s.src)) {
      fs.copyFileSync(s.src, path.join(SVG_DIR, s.dest));
    }
  });

  const icons = {
    'icone-social-comunidade.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#0F4780"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/></svg>`,
    'icone-informativo-cgif.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F14343" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4" /><path d="M12 18v4" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" /><circle cx="12" cy="12" r="9.5" stroke-dasharray="2 2" stroke-width="1.5" /><circle cx="12" cy="12" r="4.2" stroke-width="1.6" /><path d="M12 9.5v5M9.5 12h5" stroke-width="2" /><circle cx="12" cy="12" r="1.3" fill="#F14343" stroke="none" /></svg>`,
    'icone-ferramentas.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#D97706"><path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z"/></svg>`,
    'icone-foguete.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0F4780" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`,
    'icone-lab-pessoal.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0F4780" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>`,
    'icone-interacao.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0F4780" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><rect width="6" height="6" x="9" y="2" rx="1"/><path d="m5 16 4-4"/><path d="m19 16-4-4"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="16" y="16" rx="1"/></svg>`,
    'icone-wiki.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F14343" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    'icone-instituto.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F14343" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><line x1="2" y1="22" x2="22" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`
  };

  Object.entries(icons).forEach(([filename, content]) => {
    fs.writeFileSync(path.join(SVG_DIR, filename), content, 'utf-8');
  });

  console.log('✅ SVGs adicionais exportados com sucesso!');
}

async function run() {
  console.log('🚀 Iniciando extração dos elementos e camadas do PANFLETO (Tri-Fold A4)...');

  const pathExterno = path.join(PANFLETOS_DIR, '2Dpanfleto-externo.html');
  const pathInterno = path.join(PANFLETOS_DIR, '2Dpanfleto-interno.html');

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1754,
      height: 1240,
      deviceScaleFactor: 2 // 3508 x 2480 px (300 DPI A4 landscape)
    },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  // Extract Face Externa
  await extractFaceLayers(browser, pathExterno, LAYERS_EXTERNA, TMP_EXTERNA_DIR, 'panfleto_face_externa_illustrator.pdf');

  // Extract Face Interna
  await extractFaceLayers(browser, pathInterno, LAYERS_INTERNA, TMP_INTERNA_DIR, 'panfleto_face_interna_illustrator.pdf');

  await browser.close();

  // Export SVGs
  exportSvgAssets();

  // Call Python processor to build PSDs and ZIP
  const pyScript = path.join(__dirname, 'process-panfleto-psd.py');
  console.log('\n🐍 Executando script Python para montagem dos PSDs e empacotamento...');
  execSync(`python3 "${pyScript}"`, { stdio: 'inherit' });
  console.log('🎉 Todo o kit do panfleto foi gerado com sucesso!');
}

run().catch(err => {
  console.error('❌ Erro na geração:', err);
  process.exit(1);
});
