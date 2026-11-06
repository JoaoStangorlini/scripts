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
const QRCode = require('qrcode');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const POSTER10_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/posters/poster10');

async function main() {
  console.log('🎨 Refinando e renderizando o Poster 10 definitivo...');

  // 1. Assets base
  const bgIfSvg = fs.readFileSync(path.join(PROJECT_ROOT, 'public/bg-if.svg'), 'utf8');
  const bgIfContrastSvg = bgIfSvg
    .replace(/fill="#FFCC00"/g, 'fill="#D97706"')
    .replace(/stroke="#FFCC00"/g, 'stroke="#D97706"')
    .replace(/font-size="14"/g, 'font-size="19"')
    .replace(/font-size="16"/g, 'font-size="22"')
    .replace(/font-size="18"/g, 'font-size="25"')
    .replace(/font-size="20"/g, 'font-size="28"')
    .replace(/font-size="22"/g, 'font-size="31"')
    .replace(/font-size="24"/g, 'font-size="34"')
    .replace(/font-family="Georgia, serif"/g, 'font-family="Georgia, serif" font-weight="600"')
    .replace(/stroke-width="0\.6"/g, 'stroke-width="1.3"')
    .replace(/ r="1"/g, ' r="2"')
    .replace(/ r="1\.5"/g, ' r="2.8"')
    .replace(/ r="2"/g, ' r="3.5"');
  const bgIfBase64 = Buffer.from(bgIfContrastSvg).toString('base64');

  const hubIconSvg = fs.readFileSync(path.join(PROJECT_ROOT, 'public/icone-HUBLabDiv.svg'), 'utf8')
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  // QR Code base
  const qrSvg = await QRCode.toString('https://hub.labdiv.com.br/divulgacao', {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1
  });

  let qrBadgeBase64 = '';
  const qrBadgePath = path.join(PROJECT_ROOT, 'public/icone-HUBLabDiv-white.png');
  if (fs.existsSync(qrBadgePath)) {
    qrBadgeBase64 = fs.readFileSync(qrBadgePath).toString('base64');
  }

  // HTML da Proposta Principal (Option A: Título no Topo, Logo Hero no Centro, 3 Cards Ricos Azul-Vermelho-Amarelo)
  const htmlPoster10 = `<!--
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 * Este programa é software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3).
-->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HUB LabDiv - O Novo Hub da Física</title>
  <link rel="stylesheet" href="../../fonts/fonts.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @font-face {
      font-family: '29LT Bukra';
      src: local('29LT Bukra Semi Wide Bold'), local('29LT Bukra Bold'), local('29LTBukra-Bold'),
           url('../../fonts/Outfit-Black.ttf') format('truetype');
      font-weight: 700 900;
      font-display: swap;
    }
    .font-bukra { font-family: '29LT Bukra', 'Outfit', sans-serif; }
    .font-open-sans { font-family: 'Open Sans', sans-serif; }

    body {
      background-color: #FFFFFF;
      color: #0F172A;
      width: 1240px;
      height: 1754px;
      overflow: hidden;
      margin: 0;
      padding: 0;
    }
    .poster-container {
      width: 1240px;
      height: 1754px;
      position: relative;
      background-color: #FFFFFF;
      overflow: hidden;
    }
    .bg-math-pattern {
      position: absolute;
      top: 0; left: 0;
      width: 1240px; height: 1754px;
      background-image: url('data:image/svg+xml;base64,${bgIfBase64}');
      background-repeat: repeat;
      background-size: 1100px 1100px;
      opacity: 0.48;
      pointer-events: none;
      z-index: 1;
    }
    .brand-gradient-line-top {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 8px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 33%, #F14343 66%, #FFCC00 100%);
      z-index: 50;
    }

    /* 1. TÍTULO NO TOPO (HERO TYPOGRAPHY COM MÁXIMO IMPACTO & CLAREZA) */
    .p10-top-header {
      position: absolute; top: 58px; left: 60px; right: 60px;
      display: flex; flex-direction: column; align-items: center; text-align: center;
      z-index: 20;
    }
    .p10-tag {
      display: inline-flex; align-items: center; gap: 9px;
      background: rgba(238, 244, 250, 0.95);
      border: 1.5px solid rgba(15, 71, 128, 0.25);
      padding: 8px 26px; border-radius: 9999px;
      font-size: 14px; font-weight: 800; color: #0F4780; letter-spacing: 1.2px;
      text-transform: uppercase; margin-bottom: 14px;
      box-shadow: 0 4px 14px rgba(15, 71, 128, 0.08);
      backdrop-filter: blur(8px);
    }
    .p10-tag-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #0F4780;
    }
    .p10-title {
      font-size: 84px; font-weight: 900; line-height: 1.04; color: #0F172A;
      letter-spacing: -2.2px; margin-bottom: 10px;
      text-shadow: 0 0 18px #FFFFFF, 0 0 28px #FFFFFF, 0 2px 10px rgba(15, 71, 128, 0.12);
    }
    .p10-title span { color: #0F4780; }
    .p10-sub {
      font-size: 22px; font-weight: 600; color: #475569; max-width: 960px; line-height: 1.35;
      text-shadow: 0 0 14px #FFFFFF, 0 0 22px #FFFFFF;
    }

    /* 2. LOGO NO CENTRO (HERO ICON DESLOCADO PARA BAIXO DO TÍTULO COM HALO RADIAL) */
    .p10-center-logo-zone {
      position: absolute; top: 335px; left: 60px; right: 60px; height: 530px;
      display: flex; align-items: center; justify-content: center;
      z-index: 20;
    }
    .p10-radial-glow {
      position: absolute; width: 640px; height: 640px; border-radius: 50%;
      background: radial-gradient(circle, rgba(15, 71, 128, 0.08) 0%, rgba(241, 67, 67, 0.04) 40%, rgba(255, 204, 0, 0.05) 65%, transparent 75%);
      pointer-events: none; z-index: 1;
    }
    .p10-center-logo {
      width: 510px; height: 510px;
      display: flex; align-items: center; justify-content: center;
      position: relative; z-index: 2;
    }
    .p10-center-logo svg {
      width: 100%; height: 100%;
      filter: drop-shadow(0 26px 52px rgba(15, 71, 128, 0.22));
    }

    /* 3. TRÍPTICO DE ALTO IMPACTO: CORES BEM FORTES AZUL -> VERMELHO -> AMARELO */
    .p10-cards-container {
      position: absolute; top: 885px; left: 55px; right: 55px; height: 410px;
      display: flex; gap: 24px;
      z-index: 20;
    }
    .p10-card {
      flex: 1; height: 100%;
      border-radius: 28px;
      padding: 30px 24px 26px 24px;
      display: flex; flex-direction: column; justify-content: space-between;
      position: relative; overflow: hidden;
      box-shadow: 0 20px 44px -8px rgba(0,0,0,0.18), 0 4px 14px rgba(0,0,0,0.06);
    }
    .card-glow-bar {
      position: absolute; top: 0; left: 0; right: 0; height: 6px;
    }
    .card-header-row {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      margin-bottom: 14px;
    }
    .card-icon-bubble {
      width: 50px; height: 50px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
    }
    .card-badge {
      font-size: 13.5px; font-weight: 900; letter-spacing: 1.2px; text-transform: uppercase;
    }
    .card-title {
      font-size: 26px; font-weight: 900; margin-bottom: 10px; line-height: 1.15; letter-spacing: -0.5px;
    }
    .card-desc {
      font-size: 15.5px; font-weight: 600; line-height: 1.45; margin-bottom: 16px; flex: 1;
    }
    .card-tags-row {
      display: flex; flex-wrap: wrap; gap: 8px;
    }
    .card-tag {
      font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 999px;
    }

    /* CARD 1: AZUL LABDIV (#0F4780) */
    .card-blue {
      background: linear-gradient(160deg, #0F4780 0%, #082F57 100%);
      color: #FFFFFF;
      border: 2px solid rgba(255, 255, 255, 0.20);
      box-shadow: 0 20px 46px -6px rgba(15, 71, 128, 0.42), 0 4px 14px rgba(0, 0, 0, 0.08);
    }
    .card-blue .card-glow-bar { background: linear-gradient(90deg, #38BDF8, #60A5FA); }
    .card-blue .card-icon-bubble { background: rgba(255, 255, 255, 0.16); color: #FFCC00; }
    .card-blue .card-badge { color: #FFCC00; }
    .card-blue .card-title { color: #FFFFFF; }
    .card-blue .card-desc { color: #E2E8F0; }
    .card-blue .card-tag { background: rgba(255, 255, 255, 0.14); color: #BAE6FD; border: 1px solid rgba(255, 255, 255, 0.12); }

    /* CARD 2: VERMELHO LABDIV (#F14343) */
    .card-red {
      background: linear-gradient(160deg, #F14343 0%, #C92A2A 100%);
      color: #FFFFFF;
      border: 2px solid rgba(255, 255, 255, 0.20);
      box-shadow: 0 20px 46px -6px rgba(241, 67, 67, 0.42), 0 4px 14px rgba(0, 0, 0, 0.08);
    }
    .card-red .card-glow-bar { background: linear-gradient(90deg, #FCA5A5, #FECDD3); }
    .card-red .card-icon-bubble { background: rgba(255, 255, 255, 0.18); color: #FFFFFF; }
    .card-red .card-badge { color: #FFFFFF; }
    .card-red .card-title { color: #FFFFFF; }
    .card-red .card-desc { color: #FFF1F2; }
    .card-red .card-tag { background: rgba(255, 255, 255, 0.16); color: #FFE4E6; border: 1px solid rgba(255, 255, 255, 0.14); }

    /* CARD 3: AMARELO LABDIV (#FFCC00) */
    .card-yellow {
      background: linear-gradient(160deg, #FFCC00 0%, #E5B800 100%);
      color: #0F172A;
      border: 2px solid rgba(180, 83, 9, 0.22);
      box-shadow: 0 20px 46px -6px rgba(255, 204, 0, 0.45), 0 4px 14px rgba(0, 0, 0, 0.08);
    }
    .card-yellow .card-glow-bar { background: linear-gradient(90deg, #FEF08A, #FDE047); }
    .card-yellow .card-icon-bubble { background: rgba(15, 23, 42, 0.12); color: #0F172A; }
    .card-yellow .card-badge { color: #0F172A; }
    .card-yellow .card-title { color: #0F172A; }
    .card-yellow .card-desc { color: #1E293B; }
    .card-yellow .card-tag { background: rgba(15, 23, 42, 0.10); color: #0F172A; border: 1px solid rgba(15, 23, 42, 0.12); }

    /* 4. RODAPÉ INSTITUCIONAL & QR CODE */
    .bottom-third-plane {
      position: absolute;
      bottom: 45px; left: 55px; right: 55px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
      z-index: 30;
    }
    .bottom-qr-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .qr-code-box {
      width: 320px; height: 320px;
      background: #FFFFFF;
      padding: 14px;
      border-radius: 28px;
      border: 2.5px solid rgba(15, 71, 128, 0.22);
      box-shadow: 0 18px 40px -4px rgba(15, 71, 128, 0.16), 0 4px 14px rgba(0, 0, 0, 0.06);
      position: relative;
      display: flex; align-items: center; justify-content: center;
    }
    .qr-code-box svg { width: 100%; height: 100%; display: block; }
    .qr-center-badge-img {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 86px; height: 86px;
      display: flex; align-items: center; justify-content: center;
      background: #0F4780;
      border-radius: 20px;
      padding: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    }
    .qr-center-badge-img img { width: 100%; height: 100%; object-fit: contain; }
    .qr-clean-link {
      font-size: 23px; font-weight: 800; color: #0F4780;
      text-decoration: underline; text-underline-offset: 4px;
      background: rgba(255, 255, 255, 0.94);
      padding: 4px 18px;
      border-radius: 999px;
      border: 1.5px solid rgba(15, 71, 128, 0.16);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      white-space: nowrap;
    }

    .bottom-inst-box {
      flex: 1; height: 320px;
      background: #F8FAFC;
      border-radius: 28px;
      border: 2px solid #E2E8F0;
      padding: 26px 30px 22px 30px;
      display: flex; flex-direction: column; justify-content: space-between;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.05);
    }
    .inst-badge-line {
      display: flex; align-items: center; gap: 10px;
      color: #0F4780; font-size: 18px; font-weight: 800;
      margin-bottom: 8px;
    }
    .inst-desc-text {
      font-size: 18px; line-height: 1.45; color: #334155;
    }
    .inst-actions-row { display: flex; align-items: center; gap: 16px; }
    .inst-action-card {
      flex: 1; background: #FFFFFF; border: 1.5px solid #CBD5E1;
      padding: 10px 14px; border-radius: 14px;
      display: flex; align-items: center; gap: 12px;
    }
    .inst-action-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .inst-action-icon.git-icon { background: #EEF4FA; color: #0F4780; }
    .inst-action-icon.email-icon { background: #FEF2F2; color: #F14343; }
    .inst-action-details { display: flex; flex-direction: column; gap: 3px; }
    .inst-action-tag { font-size: 13px; font-weight: 800; text-transform: uppercase; }
    .inst-action-tag.tag-git { color: #0F4780; }
    .inst-action-tag.tag-email { color: #F14343; }
    .inst-action-val { font-size: 16px; font-weight: 700; color: #0F172A; white-space: nowrap; }
    .inst-legal-copy {
      font-size: 15px; color: #64748B; font-weight: 600;
      border-top: 1.5px solid #E2E8F0; padding-top: 12px; text-align: center;
    }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="bg-math-pattern"></div>

    <!-- 1. TÍTULO NO TOPO -->
    <div class="p10-top-header">
      <div class="p10-tag font-bukra">
        <span class="p10-tag-dot"></span>
        <span>Laboratório de Demonstrações • IFUSP</span>
      </div>
      <h1 class="p10-title font-bukra">O NOVO HUB DA <span>FÍSICA</span></h1>
      <p class="p10-sub font-open-sans">
        Tecnologia aberta e ciência conectada para transformar sua jornada acadêmica na USP.
      </p>
    </div>

    <!-- 2. LOGO NO CENTRO (JOGADA PARA BAIXO DO TÍTULO) -->
    <div class="p10-center-logo-zone">
      <div class="p10-radial-glow"></div>
      <div class="p10-center-logo">
        ${hubIconSvg}
      </div>
    </div>

    <!-- 3. TRÍPTICO DE CORES BEM FORTES (AZUL -> VERMELHO -> AMARELO) -->
    <div class="p10-cards-container">
      <!-- 01 • SOCIAL (AZUL #0F4780) -->
      <div class="p10-card card-blue">
        <div class="card-glow-bar"></div>
        <div class="card-header-row">
          <div class="card-icon-bubble">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <span class="card-badge font-bukra">01 • SOCIAL</span>
        </div>
        <h3 class="card-title font-bukra">Comunidade &amp; Fóruns</h3>
        <p class="card-desc font-open-sans">
          Tire dúvidas de física, conecte-se com veteranos e participe de grupos de estudo colaborativos entre turmas.
        </p>
        <div class="card-tags-row font-open-sans">
          <span class="card-tag">Fóruns de Dúvidas</span>
          <span class="card-tag">Grupos de Turma</span>
          <span class="card-tag">Conexão Acadêmica</span>
        </div>
      </div>

      <!-- 02 • INFORMATIVO (VERMELHO #F14343) -->
      <div class="p10-card card-red">
        <div class="card-glow-bar"></div>
        <div class="card-header-row">
          <div class="card-icon-bubble">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
          </div>
          <span class="card-badge font-bukra">02 • INFORMATIVO</span>
        </div>
        <h3 class="card-title font-bukra">Histórico &amp; Acervo</h3>
        <p class="card-desc font-open-sans">
          Memória científica do IFUSP, acervo oficial das matérias da graduação e guias de física experimental.
        </p>
        <div class="card-tags-row font-open-sans">
          <span class="card-tag">Memória IFUSP</span>
          <span class="card-tag">Acervo Aberto</span>
          <span class="card-tag">Guias Oficiais</span>
        </div>
      </div>

      <!-- 03 • FERRAMENTAS (AMARELO #FFCC00) -->
      <div class="p10-card card-yellow">
        <div class="card-glow-bar"></div>
        <div class="card-header-row">
          <div class="card-icon-bubble">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <span class="card-badge font-bukra">03 • FERRAMENTAS</span>
        </div>
        <h3 class="card-title font-bukra">Simuladores &amp; Lab</h3>
        <p class="card-desc font-open-sans">
          Simulações virtuais interativas de física e calculadoras científicas para seus relatórios de laboratório.
        </p>
        <div class="card-tags-row font-open-sans">
          <span class="card-tag">Simulações 3D</span>
          <span class="card-tag">Cálculos</span>
          <span class="card-tag">Laboratório</span>
        </div>
      </div>
    </div>

    <!-- 4. RODAPÉ INSTITUCIONAL & QR CODE -->
    <div class="bottom-third-plane">
      <div class="bottom-qr-col">
        <div class="qr-code-box">
          ${qrSvg}
          <div class="qr-center-badge-img">
            <img src="data:image/png;base64,${qrBadgeBase64}" alt="HUB Logo" />
          </div>
        </div>
        <a class="qr-clean-link font-bukra" href="https://hub.labdiv.com.br/divulgacao">hub.labdiv.com.br/divulgacao</a>
      </div>

      <div class="bottom-inst-box">
        <div>
          <div class="inst-badge-line font-bukra">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <span>SEGURANÇA &amp; CONFORMIDADE LEGAL</span>
          </div>
          <p class="inst-desc-text font-open-sans">
            O <strong>HUB LabDiv</strong> respeita as <strong>leis, normas e decisões judiciais do Brasil</strong>, além de ter todo o seu <strong>código aberto</strong> e um e-mail para <strong>suporte, sugestões e ideias da comunidade</strong>.
          </p>
        </div>

        <div class="inst-actions-row font-bukra">
          <div class="inst-action-card">
            <div class="inst-action-icon git-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </div>
            <div class="inst-action-details font-bukra">
              <span class="inst-action-tag tag-git">Código Aberto • AGPLv3</span>
              <span class="inst-action-val">github.com/HUB-LabDiv</span>
            </div>
          </div>

          <div class="inst-action-card">
            <div class="inst-action-icon email-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="3"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <div class="inst-action-details font-bukra">
              <span class="inst-action-tag tag-email">Suporte &amp; Ideias</span>
              <span class="inst-action-val">hublabdiv@gmail.com</span>
            </div>
          </div>
        </div>

        <div class="inst-legal-copy font-bukra">
          <span>Licença AGPLv3 &bull; LabDiv &bull; Instituto de Física da Universidade de São Paulo (IFUSP)</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const htmlPath = path.join(POSTER10_DIR, 'poster.html');
  fs.writeFileSync(htmlPath, htmlPoster10, 'utf8');

  // Renderizar a 300 DPI (2480x3508)
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 800));

  const pngPath = path.join(POSTER10_DIR, 'poster.png');
  await page.screenshot({
    path: pngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Poster 10 principal atualizado e renderizado em: ${pngPath}`);

  // Limpar arquivos residuais na pasta de pôsteres para manter limpo
  const files = fs.readdirSync(POSTER10_DIR);
  for (const f of files) {
    if (f !== 'poster.html' && f !== 'poster.png' && f !== 'poster_optionB.html' && f !== 'poster_optionB.png') {
      const fp = path.join(POSTER10_DIR, f);
      if (fs.statSync(fp).isDirectory()) {
        fs.rmSync(fp, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fp);
      }
    }
  }

  await browser.close();
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
