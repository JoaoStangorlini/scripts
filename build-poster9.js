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
const POSTER9_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/poster9');
const HTML_PATH = path.join(POSTER9_DIR, 'poster.html');

async function main() {
  console.log('🚀 Construindo Poster 9 (Foco Utilitário: Ferramentas & Simuladores)...');

  // Ensure directories
  if (!fs.existsSync(POSTER9_DIR)) fs.mkdirSync(POSTER9_DIR, { recursive: true });
  const iconsDir = path.join(POSTER9_DIR, 'icons');
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  fs.copyFileSync(path.join(PROJECT_ROOT, 'public/icone-HUBLabDiv-white.png'), path.join(iconsDir, 'icone-HUBLabDiv-white.png'));
  fs.copyFileSync(path.join(PROJECT_ROOT, 'public/divulgacao/poster4/icons/qr-hub-logo-badge.png'), path.join(iconsDir, 'qr-hub-logo-badge.png'));

  // Generate crisp QR code SVG
  const qrSvg = await QRCode.toString('https://hub.labdiv.com.br/divulgacao', {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1
  });

  // Read official IFUSP mathematical equations background (public/bg-if.svg)
  const bgIfSvg = fs.readFileSync(path.join(PROJECT_ROOT, 'public/bg-if.svg'), 'utf8');

  // Enhance formula visibility against white paper
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

  // Read official HUB LabDiv vector icon
  const hubIconSvg = fs.readFileSync(path.join(PROJECT_ROOT, 'public/icone-HUBLabDiv.svg'), 'utf8')
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  const htmlContent = `<!--
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
  <title>HUB LabDiv - Seu Laboratório Virtual (Poster 9)</title>
  <link rel="stylesheet" href="../fonts/fonts.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    @font-face {
      font-family: '29LT Bukra';
      src: local('29LT Bukra Semi Wide Bold'), local('29LT Bukra Bold'), local('29LTBukra-Bold'),
           url('../fonts/Outfit-Black.ttf') format('truetype');
      font-weight: 700 900;
      font-display: swap;
    }
    .font-bukra {
      font-family: '29LT Bukra', 'Outfit', sans-serif;
    }
    .font-open-sans {
      font-family: 'Open Sans', sans-serif;
    }

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
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      overflow: hidden;
      padding: 0;
      box-sizing: border-box;
    }

    .bg-math-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 1240px;
      height: 1754px;
      background-image: url('data:image/svg+xml;base64,${bgIfBase64}');
      background-repeat: repeat;
      background-size: 1100px 1100px;
      opacity: 0.55;
      pointer-events: none;
      z-index: 1;
    }

    .brand-gradient-line-top {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, #D97706 0%, #0F4780 50%, #F14343 100%);
      z-index: 50;
    }

    /* 1. SEÇÃO DO HEADER: FOCO EM UTILITÁRIOS E LABORATÓRIO */
    .header-section {
      position: relative;
      z-index: 30;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 100%;
      padding-top: 115px;
      padding-left: 36px;
      padding-right: 36px;
    }

    .top-labdiv-badge {
      display: inline-flex;
      align-items: center;
      gap: 9px;
      background: #FEF9C3;
      border: 1.5px solid rgba(217, 119, 6, 0.35);
      border-radius: 9999px;
      padding: 7px 22px;
      margin-bottom: 20px;
      color: #92400E;
      font-size: 13.5px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.10);
    }
    .top-badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #D97706;
    }

    h1.hero-title {
      font-size: 88px;
      font-weight: 900;
      line-height: 1.10;
      color: #0F172A;
      letter-spacing: -1.8px;
      text-align: center;
      max-width: 1200px;
      margin: 0 auto 16px auto;
    }

    .title-highlight {
      color: #D97706;
      font-weight: 900;
      display: inline-block;
      text-shadow: 0 2px 14px rgba(217, 119, 6, 0.22);
    }

    p.hero-subtitle {
      font-size: 24px;
      font-weight: 600;
      color: #475569;
      max-width: 1080px;
      line-height: 1.35;
      text-align: center;
      margin: 0 auto;
    }

    /* 2. ZONA CENTRAL: ÍCONE NO CENTRO & EIXOS EM SEGUNDO PLANO */
    .central-system-zone {
      position: absolute;
      top: 450px;
      left: 0;
      width: 1240px;
      height: 760px;
      z-index: 20;
    }

    .orbital-network-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
    }

    /* CARD HERO CENTRAL: ÍCONE PROTAGONISTA DO HUB */
    .hub-center-podium {
      position: absolute;
      top: 55px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 25;
    }

    .hub-hero-badge {
      width: 320px;
      height: 320px;
      background: #FFFFFF;
      border-radius: 70px;
      border: 3.5px solid rgba(217, 119, 6, 0.25);
      box-shadow: 
        0 30px 65px -10px rgba(217, 119, 6, 0.25),
        0 10px 24px -4px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      padding: 24px;
      box-sizing: border-box;
    }

    .hub-hero-badge::before {
      content: '';
      position: absolute;
      inset: -14px;
      border-radius: 80px;
      background: radial-gradient(circle, rgba(217, 119, 6, 0.18) 0%, rgba(15, 71, 128, 0.08) 50%, rgba(241, 67, 67, 0.04) 75%, transparent 100%);
      z-index: -1;
      pointer-events: none;
    }

    .hub-hero-svg-holder {
      width: 240px;
      height: 240px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .hub-hero-svg-holder svg {
      width: 100%;
      height: 100%;
    }

    .hub-hero-caption {
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      text-align: center;
    }
    .hub-brand-title {
      font-size: 38px;
      font-weight: 900;
      letter-spacing: -0.6px;
      line-height: 1;
    }
    .hub-brand-title .hub-part { color: #0F172A; }
    .hub-brand-title .labdiv-part {
      background: linear-gradient(90deg, #D97706 0%, #0F4780 50%, #F14343 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hub-brand-tagline {
      font-size: 15px;
      font-weight: 700;
      color: #D97706;
      text-transform: uppercase;
      letter-spacing: 1.2px;
    }

    /* OS 3 EIXOS EM SEGUNDO PLANO */
    .axis-card {
      position: absolute;
      background: #FFFFFF;
      border-radius: 24px;
      box-sizing: border-box;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 15;
    }

    .axis-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .axis-header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .axis-pill {
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .pill-social { background: #EEF4FA; color: #0F4780; }
    .pill-info { background: #FEF2F2; color: #F14343; }
    .pill-tools { background: #FEF9C3; color: #854D0E; }

    .axis-icon-badge {
      width: 46px;
      height: 46px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .axis-name-title {
      font-size: 26px;
      font-weight: 900;
      line-height: 1;
    }

    .axis-desc-text {
      font-size: 15.5px;
      font-weight: 600;
      line-height: 1.40;
      color: #334155;
    }

    /* EIXO 3: FERRAMENTAS (COM DESTAQUE REFORÇADO) */
    .axis-card-tools {
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      width: 580px;
      border: 3.5px solid rgba(255, 204, 0, 0.60);
      border-top: 7px solid #FFCC00;
      box-shadow: 
        0 24px 52px -6px rgba(217, 119, 6, 0.28),
        0 6px 16px rgba(0, 0, 0, 0.06);
      padding: 20px 28px;
      z-index: 22;
    }
    .axis-card-tools .axis-icon-badge {
      background: #FEF9C3;
      color: #854D0E;
      border: 1.5px solid rgba(255, 204, 0, 0.65);
    }
    .axis-card-tools .axis-name-title { color: #854D0E; }

    /* EIXO 1: SOCIAL (AZUL - SEGUNDO PLANO) */
    .axis-card-social {
      top: 115px;
      left: 45px;
      width: 330px;
      border: 2px solid rgba(15, 71, 128, 0.20);
      border-top: 5px solid #0F4780;
      box-shadow: 
        0 16px 36px -6px rgba(15, 71, 128, 0.14),
        0 4px 12px rgba(0, 0, 0, 0.04);
      opacity: 0.95;
    }
    .axis-card-social .axis-icon-badge {
      background: #EEF4FA;
      color: #0F4780;
      border: 1.5px solid rgba(15, 71, 128, 0.20);
    }
    .axis-card-social .axis-name-title { color: #0F4780; }

    /* EIXO 2: INFORMATIVO (VERMELHO - SEGUNDO PLANO) */
    .axis-card-info {
      top: 115px;
      right: 45px;
      width: 330px;
      border: 2px solid rgba(241, 67, 67, 0.20);
      border-top: 5px solid #F14343;
      box-shadow: 
        0 16px 36px -6px rgba(241, 67, 67, 0.14),
        0 4px 12px rgba(0, 0, 0, 0.04);
      opacity: 0.95;
    }
    .axis-card-info .axis-icon-badge {
      background: #FEF2F2;
      color: #F14343;
      border: 1.5px solid rgba(241, 67, 67, 0.20);
    }
    .axis-card-info .axis-name-title { color: #F14343; }

    /* 3. TERCEIRO PLANO: PAINEL INFERIOR COM QR CODE E SEGURANÇA INSTITUCIONAL */
    .bottom-third-plane {
      position: absolute;
      bottom: 45px;
      left: 45px;
      right: 45px;
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
      width: 270px;
      height: 270px;
      background: #FFFFFF;
      padding: 12px;
      border-radius: 26px;
      border: 2.5px solid rgba(217, 119, 6, 0.25);
      box-shadow: 0 18px 40px -4px rgba(217, 119, 6, 0.16), 0 4px 14px rgba(0, 0, 0, 0.06);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }
    .qr-code-box svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .qr-center-badge-img {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .qr-center-badge-img img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .qr-clean-link {
      font-size: 20px;
      font-weight: 800;
      color: #D97706;
      text-decoration: underline;
      text-underline-offset: 5px;
      letter-spacing: -0.2px;
    }

    .bottom-inst-box {
      flex: 1;
      height: 270px;
      background: #F8FAFC;
      border-radius: 26px;
      border: 2px solid #E2E8F0;
      padding: 22px 26px 18px 26px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.05);
      box-sizing: border-box;
    }
    .inst-badge-line {
      display: flex;
      align-items: center;
      gap: 9px;
      color: #0F4780;
      font-size: 15.5px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .inst-desc-text {
      font-size: 15.5px;
      line-height: 1.44;
      color: #334155;
    }
    .inst-actions-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .inst-action-card {
      flex: 1;
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      padding: 8px 12px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    }
    .inst-action-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .inst-action-icon.git-icon {
      background: #EEF4FA;
      color: #0F4780;
    }
    .inst-action-icon.email-icon {
      background: #FEF2F2;
      color: #F14343;
    }
    .inst-action-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow: hidden;
    }
    .inst-action-tag {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .inst-action-tag.tag-git { color: #0F4780; }
    .inst-action-tag.tag-email { color: #F14343; }
    .inst-action-val {
      font-size: 13px;
      font-weight: 700;
      color: #0F172A;
      letter-spacing: -0.2px;
      white-space: nowrap;
    }
    .inst-legal-copy {
      font-size: 12.5px;
      color: #64748B;
      font-weight: 600;
      border-top: 1.5px solid #E2E8F0;
      padding-top: 8px;
      text-align: center;
    }
  </style>
</head>
<body>

  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="bg-math-pattern"></div>

    <!-- 1. HEADER SECTION: FOCO EM FERRAMENTAS & SIMULADORES -->
    <header class="header-section">
      <div class="top-labdiv-badge font-bukra">
        <span class="top-badge-dot"></span>
        <span>Laboratório de Expressão e Divulgação da Ciência &bull; IFUSP</span>
      </div>

      <h1 class="hero-title font-bukra">
        Seu Laboratório<br><span class="title-highlight">virtual de física</span>
      </h1>

      <p class="hero-subtitle font-open-sans">
        Simuladores interativos, calculadoras numéricas e utilitários acadêmicos para acelerar sua graduação.
      </p>
    </header>

    <!-- 2. ZONA CENTRAL: ÍCONE HERO CENTRALIZADO E EIXOS EM SEGUNDO PLANO -->
    <div class="central-system-zone">
      <svg class="orbital-network-svg" viewBox="0 0 1240 760">
        <defs>
          <linearGradient id="orbitGrad9" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FFCC00" stop-opacity="0.45" />
            <stop offset="50%" stop-color="#0F4780" stop-opacity="0.30" />
            <stop offset="100%" stop-color="#F14343" stop-opacity="0.30" />
          </linearGradient>
        </defs>

        <circle cx="620" cy="215" r="230" fill="none" stroke="url(#orbitGrad9)" stroke-width="1.8" stroke-dasharray="6 6" opacity="0.75" />
        <circle cx="620" cy="215" r="340" fill="none" stroke="url(#orbitGrad9)" stroke-width="1.5" stroke-dasharray="4 8" opacity="0.50" />

        <!-- Rota para Eixo Social -->
        <path d="M 460 215 C 400 215, 390 195, 375 195" fill="none" stroke="#0F4780" stroke-width="2.2" stroke-dasharray="4 4" opacity="0.55" />
        <circle cx="375" cy="195" r="4.5" fill="#0F4780" />

        <!-- Rota para Eixo Informativo -->
        <path d="M 780 215 C 840 215, 850 195, 865 195" fill="none" stroke="#F14343" stroke-width="2.2" stroke-dasharray="4 4" opacity="0.55" />
        <circle cx="865" cy="195" r="4.5" fill="#F14343" />

        <!-- Rota para Eixo Ferramentas (Em destaque) -->
        <path d="M 620 375 L 620 570" fill="none" stroke="#D97706" stroke-width="3.5" stroke-dasharray="4 4" opacity="0.85" />
        <circle cx="620" cy="570" r="5.5" fill="#D97706" />
      </svg>

      <!-- EIXO 1: SOCIAL (AZUL - SEGUNDO PLANO À ESQUERDA) -->
      <div class="axis-card axis-card-social">
        <div class="axis-card-header">
          <div class="axis-header-left">
            <div class="axis-icon-badge">
              <svg width="26" height="26" viewBox="0 -960 960 960" fill="currentColor">
                <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/>
              </svg>
            </div>
            <div>
              <h3 class="axis-name-title font-bukra">Social</h3>
            </div>
          </div>
          <span class="axis-pill pill-social font-bukra">EIXO 1</span>
        </div>
        <p class="axis-desc-text font-open-sans">
          Rede comunicativa e pedagógica para conectar estudantes, grupos de estudo e docentes do IFUSP.
        </p>
      </div>

      <!-- ÍCONE NO CENTRO: O HERÓI PROTAGONISTA -->
      <div class="hub-center-podium">
        <div class="hub-hero-badge">
          <div class="hub-hero-svg-holder">
            ${hubIconSvg}
          </div>
        </div>

        <div class="hub-hero-caption">
          <h2 class="hub-brand-title font-bukra">
            <span class="hub-part">HUB</span> <span class="labdiv-part">LabDiv</span>
          </h2>
          <span class="hub-brand-tagline font-bukra">A Plataforma Oficial da Física</span>
        </div>
      </div>

      <!-- EIXO 2: INFORMATIVO (VERMELHO - SEGUNDO PLANO À DIREITA) -->
      <div class="axis-card axis-card-info">
        <div class="axis-card-header">
          <div class="axis-header-left">
            <div class="axis-icon-badge">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="M4.93 4.93l2.83 2.83" />
                <path d="M16.24 16.24l2.83 2.83" />
                <path d="M4.93 19.07l2.83-2.83" />
                <path d="M16.24 7.76l2.83-2.83" />
                <circle cx="12" cy="12" r="9.5" stroke-dasharray="2 2" stroke-width="1.5" />
                <circle cx="12" cy="12" r="4.2" stroke-width="1.6" />
                <path d="M12 9.5v5M9.5 12h5" stroke-width="2" />
                <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
              </svg>
            </div>
            <div>
              <h3 class="axis-name-title font-bukra">Informativo</h3>
            </div>
          </div>
          <span class="axis-pill pill-info font-bukra">EIXO 2</span>
        </div>
        <p class="axis-desc-text font-open-sans">
          Enciclopédia acadêmica interativa, histórico da ciência, matérias e acervo da graduação.
        </p>
      </div>

      <!-- EIXO 3: FERRAMENTAS (DESTAQUE REFORÇADO) -->
      <div class="axis-card axis-card-tools">
        <div class="axis-card-header">
          <div class="axis-header-left">
            <div class="axis-icon-badge">
              <svg width="26" height="26" viewBox="0 -960 960 960" fill="currentColor">
                <path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z"/>
              </svg>
            </div>
            <div>
              <h3 class="axis-name-title font-bukra">Ferramentas</h3>
            </div>
          </div>
          <span class="axis-pill pill-tools font-bukra">DESTAQUE</span>
        </div>
        <p class="axis-desc-text font-open-sans">
          Simuladores numéricos, calculadoras, gerenciamento de notas e utilitários para o dia a dia universitário.
        </p>
      </div>
    </div>

    <!-- 3. TERCEIRO PLANO: PAINEL INFERIOR COM QR CODE E SEGURANÇA INSTITUCIONAL -->
    <div class="bottom-third-plane">
      <div class="bottom-qr-col">
        <div class="qr-code-box">
          ${qrSvg}
          <div class="qr-center-badge-img">
            <img src="icons/qr-hub-logo-badge.png" alt="HUB Badge" />
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
</html>
`;

  fs.writeFileSync(HTML_PATH, htmlContent, 'utf-8');
  console.log(`✅ Arquivo HTML gerado em: ${HTML_PATH}`);

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 1240,
      height: 1754,
      deviceScaleFactor: 2
    },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1000));

  const outPngPath = path.join(POSTER9_DIR, 'poster.png');
  await page.screenshot({
    path: outPngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Poster 9 em ultra-alta resolução (300 DPI, 2480x3508) gerado em: ${outPngPath}`);

  const previewPage = await browser.newPage();
  await previewPage.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });
  await previewPage.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });
  await previewPage.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 800));
  const previewPath = path.join(POSTER9_DIR, 'poster_preview.png');
  await previewPage.screenshot({
    path: previewPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Preview nítido do Poster 9 (1240x1754) gerado em: ${previewPath}`);

  const activeArtifactsDir = (process.env.ARTIFACTS_DIR || './artifacts');
  if (fs.existsSync(activeArtifactsDir)) {
    fs.copyFileSync(outPngPath, path.join(activeArtifactsDir, 'poster9.png'));
    fs.copyFileSync(previewPath, path.join(activeArtifactsDir, 'poster9_preview.png'));
  }

  await browser.close();
  console.log('🎉 Poster 9 criado e renderizado com sucesso!');
}

main().catch(err => {
  console.error('❌ Erro na geração do Poster 9:', err);
  process.exit(1);
});
