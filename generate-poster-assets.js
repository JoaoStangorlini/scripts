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
const POSTERS_DIR = path.join(PUBLIC_DIR, 'divulgacao/posters');
const OUTPUT_DIR = path.join(POSTERS_DIR, 'editavel_photoshop_illustrator');
const PNG_DIR = path.join(OUTPUT_DIR, 'elementos_png_300dpi');
const SVG_DIR = path.join(OUTPUT_DIR, 'elementos_vetoriais_svg');
const TMP_RAW_LAYERS_DIR = path.join(OUTPUT_DIR, '.tmp_raw_layers');

const ARTIFACT_DIR = (process.env.ARTIFACTS_DIR || './artifacts');

[OUTPUT_DIR, PNG_DIR, SVG_DIR, TMP_RAW_LAYERS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const LAYERS_CONFIG = [
  // Fundo
  {
    id: '01_fundo_padrao_matematico',
    name: 'Padrão Matemático (Fórmulas)',
    group: '01_Fundo',
    customCapture: 'math_pattern'
  },
  // Hero & Topo
  {
    id: '02_hero_card_google_play',
    name: 'Card Google Play HUB LabDiv',
    group: '02_Hero_Topo',
    selector: '.app-identity-card'
  },
  {
    id: '03_hero_texto_1app',
    name: 'Texto 1 APP',
    group: '02_Hero_Topo',
    selector: '.hero-1app'
  },
  {
    id: '04_hero_texto_inumeras_funcoes',
    name: 'Texto INÚMERAS FUNÇÕES',
    group: '02_Hero_Topo',
    selector: '.hero-versoes'
  },
  // Sub-elementos do Card para edição fina
  {
    id: '05_hero_card_icone_labdiv',
    name: 'Ícone HUB LabDiv (Card)',
    group: '02_Hero_Topo_SubElementos',
    selector: '.app-identity-card .app-identity-icon'
  },
  {
    id: '06_hero_card_botao_instalar',
    name: 'Botão Instalar (Card)',
    group: '02_Hero_Topo_SubElementos',
    selector: '.app-identity-card .card-install-btn'
  },
  // Eixos Temáticos
  {
    id: '07_eixo_1_social',
    name: 'Card Eixo 1 - Social',
    group: '03_Eixos_Tematicos',
    selector: '.axis-card.axis-social'
  },
  {
    id: '08_eixo_2_informativo',
    name: 'Card Eixo 2 - Informativo',
    group: '03_Eixos_Tematicos',
    selector: '.axis-card.axis-informativo'
  },
  {
    id: '09_eixo_3_ferramentas',
    name: 'Card Eixo 3 - Ferramentas',
    group: '03_Eixos_Tematicos',
    selector: '.axis-card.axis-ferramentas'
  },
  // Seção Experimente
  {
    id: '10_experimente_titulo_foguete',
    name: 'Título Experimente Agora (com Foguete)',
    group: '04_Secao_Experimente',
    selector: '.section-experimente .hub-section-header'
  },
  {
    id: '11_qr_card_site_web',
    name: 'Card QR Code Site Web',
    group: '04_Secao_Experimente',
    selector: '.qr-card-item:nth-of-type(1)'
  },
  {
    id: '12_qr_card_google_play',
    name: 'Card QR Code Google Play',
    group: '04_Secao_Experimente',
    selector: '.qr-card-item:nth-of-type(2)'
  },
  {
    id: '13_experimente_perks',
    name: 'Benefícios (Nuvem, Offline, Gratuito)',
    group: '04_Secao_Experimente',
    selector: '.experimente-perks-bottom'
  },
  // Rodapé
  {
    id: '14_rodape_barra_fundo',
    name: 'Barra do Rodapé (Fundo & Gradiente)',
    group: '05_Rodape',
    customCapture: 'footer_bg'
  },
  {
    id: '15_rodape_bloco_seguranca',
    name: 'Bloco Segurança & Conformidade Legal',
    group: '05_Rodape',
    selector: '.footer-legal-col'
  },
  {
    id: '16_rodape_botao_github',
    name: 'Botão GitHub (Código Aberto AGPLv3)',
    group: '05_Rodape',
    selector: '.footer-card-git'
  },
  {
    id: '17_rodape_botao_email',
    name: 'Botão E-mail (Suporte e Sugestões)',
    group: '05_Rodape',
    selector: '.footer-card-email'
  },
  {
    id: '18_rodape_linha_copyright',
    name: 'Linha Direitos IFUSP & Licença AGPLv3',
    group: '05_Rodape',
    selector: '.footer-bottom-line'
  }
];

async function extractLayers() {
  console.log('🚀 Iniciando extração dos elementos e camadas do pôster...');

  const htmlPath = path.join(POSTERS_DIR, 'poster.html');
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Arquivo poster.html não encontrado em ${htmlPath}`);
  }

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
  await new Promise(r => setTimeout(r, 600));

  // 1. Export Vector PDF directly from Chrome for Illustrator
  const vectorPdfPath = path.join(OUTPUT_DIR, 'poster_illustrator_vetorial.pdf');
  await page.pdf({
    path: vectorPdfPath,
    width: '1240px',
    height: '1754px',
    printBackground: true,
    pageRanges: '1'
  });
  console.log(`✅ PDF Vetorial para Illustrator gerado: ${vectorPdfPath}`);

  // 2. Export base background (#F8FAFC)
  const baseBgPath = path.join(TMP_RAW_LAYERS_DIR, '00_fundo_base.png');
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(el => el.style.visibility = 'hidden');
    document.body.style.visibility = 'visible';
    document.body.style.backgroundColor = '#F8FAFC';
    const cont = document.querySelector('.poster-container');
    if (cont) {
      cont.style.visibility = 'visible';
      cont.style.backgroundColor = '#F8FAFC';
    }
    const math = document.querySelector('.bg-math-pattern');
    if (math) math.style.display = 'none';
  });
  await page.screenshot({
    path: baseBgPath,
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });

  // 3. Export each layer
  for (const cfg of LAYERS_CONFIG) {
    console.log(`📸 Capturando camada: ${cfg.name} (${cfg.id})...`);
    await page.reload({ waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

    if (cfg.customCapture === 'math_pattern') {
      await page.evaluate(() => {
        document.body.style.backgroundColor = 'transparent';
        const cont = document.querySelector('.poster-container');
        if (cont) cont.style.backgroundColor = 'transparent';
        const content = document.querySelector('.content-layer');
        if (content) content.style.display = 'none';
        const math = document.querySelector('.bg-math-pattern');
        if (math) {
          math.style.display = 'block';
          math.style.opacity = '1.0'; // export full opacity so designer controls in PS
        }
      });
    } else if (cfg.customCapture === 'footer_bg') {
      await page.evaluate(() => {
        const style = document.createElement('style');
        style.innerHTML = `
          body, html, .poster-container, .content-layer, .main-body {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
          }
          .bg-math-pattern { display: none !important; }
          .main-body { display: none !important; }
          .footer-content-wrap > * { visibility: hidden !important; }
          .footer-bar {
            visibility: visible !important;
          }
          .footer-gradient-divider {
            visibility: visible !important;
            display: block !important;
          }
        `;
        document.head.appendChild(style);
      });
    } else {
      await page.evaluate((sel) => {
        const style = document.createElement('style');
        style.innerHTML = `
          body, html, .poster-container, .content-layer, .main-body, .footer-bar, .footer-content-wrap {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
          }
          .bg-math-pattern { display: none !important; }
          .footer-gradient-divider { display: none !important; }
          * { visibility: hidden !important; }
          ${sel}, ${sel} * { visibility: visible !important; }
        `;
        document.head.appendChild(style);
      }, cfg.selector);
    }

    const outLayerRawPath = path.join(TMP_RAW_LAYERS_DIR, `${cfg.id}.png`);
    await page.screenshot({
      path: outLayerRawPath,
      clip: { x: 0, y: 0, width: 1240, height: 1754 },
      omitBackground: true
    });
  }

  await browser.close();
  console.log('✅ Todas as capturas em alta resolução foram concluídas.');
}

// 4. Export SVG vector assets
function exportSvgAssets() {
  console.log('🎨 Exportando ativos vetoriais (.SVG)...');
  const svgs = [
    { src: path.join(PUBLIC_DIR, 'icone-HUBLabDiv.svg'), dest: 'icone-HUBLabDiv.svg' },
    { src: path.join(PUBLIC_DIR, 'bg-if.svg'), dest: 'bg-if-padrao-matematico.svg' },
    { src: path.join(PUBLIC_DIR, 'divulgacao/qr-web.svg'), dest: 'qr-hub-web.svg' },
    { src: path.join(PUBLIC_DIR, 'divulgacao/qr-playstore.svg'), dest: 'qr-google-play.svg' }
  ];

  // Specific UI icons
  const iconComunidade = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#0F4780"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/></svg>`;
  const iconCgif = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#F14343" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4" /><path d="M12 18v4" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" /><circle cx="12" cy="12" r="9.5" stroke-dasharray="2 2" stroke-width="1.5" /><circle cx="12" cy="12" r="4.2" stroke-width="1.6" /><path d="M12 9.5v5M9.5 12h5" stroke-width="2" /><circle cx="12" cy="12" r="1.3" fill="#F14343" stroke="none" /></svg>`;
  const iconFerramentas = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="#D97706"><path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z"/></svg>`;
  const iconFoguete = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0F4780" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`;
  const iconEscudo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0F4780" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`;

  svgs.forEach(s => {
    if (fs.existsSync(s.src)) {
      fs.copyFileSync(s.src, path.join(SVG_DIR, s.dest));
    }
  });

  fs.writeFileSync(path.join(SVG_DIR, 'icone-eixo-social.svg'), iconComunidade, 'utf-8');
  fs.writeFileSync(path.join(SVG_DIR, 'icone-eixo-cgif.svg'), iconCgif, 'utf-8');
  fs.writeFileSync(path.join(SVG_DIR, 'icone-eixo-ferramentas.svg'), iconFerramentas, 'utf-8');
  fs.writeFileSync(path.join(SVG_DIR, 'icone-foguete.svg'), iconFoguete, 'utf-8');
  fs.writeFileSync(path.join(SVG_DIR, 'icone-escudo-seguranca.svg'), iconEscudo, 'utf-8');

  console.log('✅ SVGs exportados com sucesso!');
}

async function run() {
  await extractLayers();
  exportSvgAssets();

  // Call python processor to assemble PSD, crop PNGs, and build ZIP
  const pyScript = path.join(__dirname, 'process-poster-psd.py');
  console.log('🐍 Executando script Python para montagem do PSD e corte dos PNGs...');
  execSync(`python3 "${pyScript}"`, { stdio: 'inherit' });
  console.log('🎉 Todo o kit do pôster foi gerado com sucesso!');
}

run().catch(err => {
  console.error('❌ Erro na geração:', err);
  process.exit(1);
});
