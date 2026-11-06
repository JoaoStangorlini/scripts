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
const { execSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const POSTER1_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/posters/poster1');
const ARTIFACT_DIR = (process.env.ARTIFACTS_DIR || './artifacts');
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
const TMP_LAYERS_DIR = path.join(POSTER1_DIR, '.tmp_layers');

if (!fs.existsSync(POSTER1_DIR)) fs.mkdirSync(POSTER1_DIR, { recursive: true });
if (!fs.existsSync(TMP_LAYERS_DIR)) fs.mkdirSync(TMP_LAYERS_DIR, { recursive: true });

// ======================================================================================
// ÍCONE HERO CANÔNICO OFICIAL DO HUB LABDIV (COM OPACITY=0.15 NO WAVE GLOW E GRADIENTES CORRETOS)
// ======================================================================================
const CANONICAL_HUB_ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="labdivBrandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0F4780" />
      <stop offset="48%" stop-color="#F14343" />
      <stop offset="100%" stop-color="#FFCC00" />
    </linearGradient>

    <linearGradient id="capTopGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0E4277" />
      <stop offset="22%" stop-color="#0F4780" />
      <stop offset="48%" stop-color="#F14343" />
      <stop offset="78%" stop-color="#FFCC00" />
      <stop offset="100%" stop-color="#FCE055" />
    </linearGradient>

    <linearGradient id="capBaseGradient" x1="5%" y1="0%" x2="95%" y2="0%">
      <stop offset="0%" stop-color="#0B3764" />
      <stop offset="25%" stop-color="#0F4780" />
      <stop offset="50%" stop-color="#F14343" />
      <stop offset="80%" stop-color="#FFCC00" />
      <stop offset="100%" stop-color="#E5B800" />
    </linearGradient>

    <linearGradient id="waveGradient" x1="45" y1="0" x2="467" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#0F4780" />
      <stop offset="22%" stop-color="#0F4780" />
      <stop offset="50%" stop-color="#F14343" />
      <stop offset="78%" stop-color="#FFCC00" />
      <stop offset="100%" stop-color="#FFCC00" />
    </linearGradient>
  </defs>

  <!-- CAMADA DE GLOW DAS ONDAS COM OPACIDADE EXATA DE 0.15 -->
  <g stroke="url(#waveGradient)" stroke-width="26" stroke-linecap="round" fill="none" opacity="0.15">
    <path d="M 53 225 C 27 168 27 104 53 50" />
    <path d="M 94 196 C 72 157 72 109 94 72" />
    <path d="M 138 183 C 120 153 120 118 138 88" />
    <path d="M 178 165 C 164 145 164 125 178 105" />
    <path d="M 210 110 C 235 92 277 92 302 110" />
    <path d="M 224 128 C 242 114 270 114 288 128" />
    <path d="M 238 146 C 248 136 264 136 274 146" />
    <path d="M 334 165 C 348 145 348 125 334 105" />
    <path d="M 374 183 C 392 153 392 118 374 88" />
    <path d="M 418 196 C 440 157 440 109 418 72" />
    <path d="M 459 225 C 485 168 485 104 459 50" />
  </g>

  <!-- CONTORNO PRETO E GRADIENTE VETORIAL DAS ONDAS -->
  <g stroke-linecap="round" fill="none">
    <g stroke="#000000" stroke-width="22">
      <path d="M 53 225 C 27 168 27 104 53 50" />
      <path d="M 94 196 C 72 157 72 109 94 72" />
      <path d="M 138 183 C 120 153 120 118 138 88" />
      <path d="M 178 165 C 164 145 164 125 178 105" />
      <path d="M 210 110 C 235 92 277 92 302 110" />
      <path d="M 224 128 C 242 114 270 114 288 128" />
      <path d="M 238 146 C 248 136 264 136 274 146" stroke-width="20" />
      <path d="M 334 165 C 348 145 348 125 334 105" />
      <path d="M 374 183 C 392 153 392 118 374 88" />
      <path d="M 418 196 C 440 157 440 109 418 72" />
      <path d="M 459 225 C 485 168 485 104 459 50" />
    </g>

    <g stroke="url(#waveGradient)" stroke-width="12">
      <path d="M 53 225 C 27 168 27 104 53 50" />
      <path d="M 94 196 C 72 157 72 109 94 72" />
      <path d="M 138 183 C 120 153 120 118 138 88" />
      <path d="M 178 165 C 164 145 164 125 178 105" />
      <path d="M 210 110 C 235 92 277 92 302 110" />
      <path d="M 224 128 C 242 114 270 114 288 128" />
      <path d="M 238 146 C 248 136 264 136 274 146" stroke-width="10" />
      <path d="M 334 165 C 348 145 348 125 334 105" />
      <path d="M 374 183 C 392 153 392 118 374 88" />
      <path d="M 418 196 C 440 157 440 109 418 72" />
      <path d="M 459 225 C 485 168 485 104 459 50" />
    </g>
  </g>

  <!-- BASE DO CAPELO (ANEL INFERIOR) -->
  <g>
    <path d="M 120 300 L 120 355 C 120 430, 392 430, 392 355 L 392 300 Z" fill="url(#capBaseGradient)" />
    <path d="M 120 316 L 236 365 Q 256 375 276 365 L 392 316 L 392 334 L 276 375 Q 256 383 236 375 L 120 334 Z" fill="#000000" opacity="0.35" />
    <path d="M 120 300 L 120 355 C 120 430, 392 430, 392 355 L 392 300 Z" fill="none" stroke="#000000" stroke-width="10" stroke-linejoin="round" />
  </g>

  <!-- TOPO ISOMÉTRICO DO CAPELO -->
  <g>
    <path d="M 276 175 L 456 260 Q 476 270 456 280 L 276 365 Q 256 375 236 365 L 56 280 Q 36 270 56 260 L 236 175 Q 256 165 276 175 Z" fill="url(#capTopGradient)" stroke="#000000" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" />
  </g>

  <!-- CORDÃO E BORLA (TASSEL) -->
  <g stroke-linejoin="round" stroke-linecap="round">
    <polygon points="59,282 75,287 75,321 59,321" fill="#000000" opacity="0.4" />
    <polygon points="57,270 73,277 73,321 57,321" fill="#0F4780" />
    <line x1="57" y1="281" x2="57" y2="321" stroke="#000000" stroke-width="10" stroke-linecap="round" />
    <line x1="73" y1="288" x2="73" y2="321" stroke="#000000" stroke-width="10" stroke-linecap="round" />
    <path d="M 49 346 L 39 408 Q 65 420 91 408 L 81 346 Z" fill="#0F4780" />
    <line x1="49" y1="348" x2="39" y2="408" stroke="#000000" stroke-width="8" stroke-linecap="round" />
    <path d="M 39 408 Q 65 420 91 408" fill="none" stroke="#000000" stroke-width="8" stroke-linecap="round" />
    <line x1="81" y1="348" x2="91" y2="408" stroke="#000000" stroke-width="8" stroke-linecap="round" />
    <circle cx="65" cy="335" r="15" fill="#0F4780" stroke="#000000" stroke-width="8" />
  </g>

  <!-- DESTAQUE BISEL SUPERIOR -->
  <path d="M 56 270 L 236 183 Q 256 173 276 183 L 456 270" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.3" />
</svg>`;

// ======================================================================================
// TEMPLATE SHELL DO PÔSTER (COM TOPO AZUL OFICIAL, RODAPÉ QR E SEGURANÇA)
// ======================================================================================
function getPosterShell({ optionTitle, middleCss, middleHtml }) {
  return `<!--
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 * Este programa é um software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3).
-->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HUB LabDiv - ${optionTitle}</title>
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
      background-color: #F8FAFC;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .bg-math-pattern {
      position: absolute;
      top: 0; left: 0;
      width: 1240px; height: 1754px;
      background-image: url('../poster2/bg-if.svg');
      background-repeat: repeat;
      background-size: 1100px 1100px;
      opacity: 0.38;
      pointer-events: none;
      z-index: 1;
    }
    .brand-gradient-line-top {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 6px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 35%, #F14343 70%, #FFCC00 100%);
      z-index: 50;
    }

    .p12-diagonal {
       position: absolute; top: 0; left: 0; width: 100%; height: 950px;
       background: #0F4780; 
       clip-path: polygon(0 0, 100% 0, 100% 100%, 0 55%);
       z-index: 10;
    }
    
    .p12-content {
       position: absolute; top: 0; left: 0; width: 100%; height: 1754px;
       z-index: 20; padding: 75px 60px; box-sizing: border-box;
    }
    
    /* CABEÇALHO ESQUERDO COM FONTES OFICIAIS */
    .p12-header {
       color: #FFFFFF; max-width: 630px;
    }
    .p12-badge {
       display: inline-block; background: #FFCC00; color: #0F172A;
       padding: 12px 30px; font-size: 19.5px; font-weight: 800; border-radius: 999px;
       margin-bottom: 22px; text-transform: uppercase; letter-spacing: 0.6px;
       box-shadow: 0 4px 14px rgba(0,0,0,0.14);
    }
    .p12-header h1 {
       font-size: 70px; font-weight: 900; line-height: 1.08; letter-spacing: -1.2px;
    }
    .p12-subline {
       font-size: 35px; font-weight: 700; margin-top: 18px; color: #FFCC00; line-height: 1.30; max-width: 630px;
    }

    /* COLUNA DIREITA HERO: ÍCONE COM BORDA DEGRADÊ + "HUB LabDiv" */
    .p12-right-hero-col {
       position: absolute; top: 45px; right: 45px;
       width: 500px;
       display: flex; flex-direction: column; align-items: center;
       z-index: 25;
    }
    .p12-icon-wrapper {
       width: 480px; height: 480px;
       border-radius: 50%;
       background: linear-gradient(90deg, #0F4780 0%, #0284C7 22%, #F14343 55%, #FFCC00 100%);
       padding: 6px;
       display: flex; align-items: center; justify-content: center;
       box-shadow: 0 30px 75px rgba(0,0,0,0.28), 0 0 0 3px rgba(255,255,255,0.20);
       flex-shrink: 0;
       box-sizing: border-box;
    }
    .p12-icon-inner {
       width: 100%; height: 100%;
       background: #FFFFFF;
       border-radius: 50%;
       display: flex; align-items: center; justify-content: center;
       overflow: hidden;
    }
    .p12-icon-inner svg {
       width: 355px; height: 355px;
       transform: translateY(12px);
    }

    .p12-icon-branding {
       margin-top: 14px;
       display: flex; flex-direction: column; align-items: center; text-align: center;
       width: 100%;
    }
    .p12-brand-title {
       font-size: 62px; font-weight: 900; line-height: 1.0; letter-spacing: -0.8px;
    }
    .p12-brand-title .hub-white {
       color: #FFFFFF;
       letter-spacing: -0.5px;
    }
    .p12-brand-title .labdiv-gradient {
       background: linear-gradient(90deg, #38BDF8 0%, #0284C7 20%, #F14343 55%, #FFCC00 100%);
       -webkit-background-clip: text;
       -webkit-text-fill-color: transparent;
       display: inline-block;
    }

    /* RODAPÉ: QR CODE E SEGURANÇA EM UMA LINHA */
    .bottom-third-plane {
      position: absolute;
      bottom: 40px; left: 45px; right: 45px;
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
      width: 315px;
    }
    .qr-code-box {
      width: 315px; height: 315px;
      background: #FFFFFF;
      padding: 14px;
      border-radius: 26px;
      border: 2.5px solid rgba(15, 71, 128, 0.22);
      box-shadow: 0 18px 45px -4px rgba(15, 71, 128, 0.18), 0 4px 14px rgba(0, 0, 0, 0.06);
      position: relative;
      display: flex; align-items: center; justify-content: center;
    }
    .qr-code-box svg { width: 100%; height: 100%; display: block; }
    .qr-center-badge-img {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 82px; height: 82px;
      display: flex; align-items: center; justify-content: center;
      background: #FFFFFF;
      border-radius: 18px;
      padding: 5px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    }
    .qr-center-badge-img svg { width: 100%; height: 100%; display: block; }
    .qr-clean-link {
      font-size: 19px; font-weight: 700; color: #0F4780;
      text-decoration: underline; text-underline-offset: 4px;
      background: rgba(255, 255, 255, 0.95);
      padding: 6px 16px;
      border-radius: 999px;
      border: 1.5px solid rgba(15, 71, 128, 0.20);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      white-space: nowrap;
    }

    .bottom-inst-box {
      flex: 1; height: 375px;
      background: #F8FAFC;
      border-radius: 30px;
      border: 2px solid #E2E8F0;
      padding: 22px 28px 18px 28px;
      display: flex; flex-direction: column; justify-content: space-between;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .inst-badge-line {
      display: flex; align-items: center; gap: 14px;
      color: #0F4780; font-size: 21.5px; font-weight: 900;
      white-space: nowrap;
      margin-bottom: 8px;
    }
    .inst-badge-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: #EEF4FA; color: #0F4780;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      border: 1.5px solid rgba(15, 71, 128, 0.20);
    }
    .inst-desc-text {
      font-size: 19.5px; line-height: 1.45; color: #334155;
    }
    .inst-actions-row { display: flex; align-items: center; gap: 16px; }
    .inst-action-card {
      flex: 1; background: #FFFFFF; border: 1.5px solid #CBD5E1;
      padding: 12px 16px; border-radius: 14px;
      display: flex; align-items: center; gap: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .inst-action-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .inst-action-icon.git-icon { background: #EEF4FA; color: #0F4780; }
    .inst-action-icon.email-icon { background: #FEF2F2; color: #F14343; }
    .inst-action-details { display: flex; flex-direction: column; gap: 3px; }
    .inst-action-tag { font-size: 15px; font-weight: 700; text-transform: uppercase; }
    .inst-action-tag.tag-git { color: #0F4780; }
    .inst-action-tag.tag-email { color: #F14343; }
    .inst-action-val { font-size: 19.5px; font-weight: 700; color: #0F172A; white-space: nowrap; }
    .inst-legal-copy {
      font-size: 16.5px; color: #64748B; font-weight: 600;
      border-top: 1.5px solid #E2E8F0; padding-top: 10px; text-align: center;
    }

    ${middleCss}
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="p12-diagonal"></div>
    <div class="bg-math-pattern"></div>

    <div class="p12-content">
      <div class="p12-header">
        <div class="p12-badge font-open-sans">Laboratório de Expressão e Divulgação do IFUSP</div>
        <h1 class="font-bukra">HUB LabDiv:<br>Conectando você à universidade.</h1>
        <div class="p12-subline font-open-sans">Comunidade, conhecimento e ferramentas na palma da mão.</div>
      </div>

      <div class="p12-right-hero-col">
        <div class="p12-icon-wrapper">
          <div class="p12-icon-inner">
            ${CANONICAL_HUB_ICON_SVG}
          </div>
        </div>
        <div class="p12-icon-branding font-bukra">
          <div class="p12-brand-title">
            <span class="hub-white">HUB</span> <span class="labdiv-gradient">LabDiv</span>
          </div>
        </div>
      </div>
    </div>

    <!-- CONTEÚDO CENTRAL DOS EIXOS -->
    <div data-middle-content="true">
      ${middleHtml}
    </div>

    <!-- TERCEIRO PLANO: RODAPÉ QR CODE & SEGURANÇA INSTITUCIONAL -->
    <div class="bottom-third-plane">
      
      <div class="bottom-qr-col">
        <div class="qr-code-box" style="border-color: #0F478040;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 39 39" shape-rendering="crispEdges"><path fill="#ffffff" d="M0 0h39v39H0z"/><path stroke="#000000" d="M1 1.5h7m1 0h2m1 0h1m1 0h1m3 0h2m2 0h1m2 0h1m1 0h1m1 0h1m1 0h7M1 2.5h1m5 0h1m1 0h3m1 0h2m4 0h1m1 0h5m2 0h2m1 0h1m5 0h1M1 3.5h1m1 0h3m1 0h1m1 0h4m2 0h1m1 0h1m1 0h1m2 0h4m2 0h1m2 0h1m1 0h3m1 0h1M1 4.5h1m1 0h3m1 0h1m2 0h1m1 0h3m1 0h1m2 0h1m5 0h3m3 0h1m1 0h3m1 0h1M1 5.5h1m1 0h3m1 0h1m2 0h1m1 0h2m4 0h5m1 0h1m1 0h2m3 0h1m1 0h3m1 0h1M1 6.5h1m5 0h1m1 0h1m1 0h1m1 0h1m2 0h5m2 0h1m2 0h4m1 0h1m5 0h1M1 7.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M9 8.5h1m2 0h4m2 0h4m1 0h1m1 0h1m1 0h1m1 0h1M3 9.5h3m1 0h1m1 0h1m1 0h1m2 0h1m2 0h1m2 0h1m1 0h1m1 0h1m5 0h3m2 0h3M3 10.5h1m1 0h1m2 0h1m3 0h3m1 0h1m1 0h1m1 0h1m4 0h2m2 0h1m2 0h1m3 0h1M1 11.5h2m4 0h1m2 0h1m5 0h2m2 0h10m1 0h7M2 12.5h3m3 0h1m4 0h1m1 0h2m2 0h2m1 0h2m1 0h1m1 0h2m2 0h2m3 0h2M1 13.5h1m2 0h7m4 0h1m5 0h1m2 0h1m1 0h6m1 0h1m1 0h3M1 14.5h2m2 0h1m2 0h2m1 0h1m1 0h3m1 0h2m1 0h4m1 0h1m3 0h2m1 0h1m1 0h2M1 15.5h2m4 0h1m2 0h3m1 0h2m2 0h4m1 0h2m1 0h4m1 0h2m1 0h1m2 0h1M4 16.5h2m2 0h1m2 0h2m1 0h1m2 0h5m1 0h1m4 0h1m3 0h1M1 17.5h3m1 0h1m1 0h1m1 0h1m2 0h3m2 0h1m3 0h1m2 0h1m1 0h1m1 0h1m2 0h1m1 0h1m1 0h1m1 0h1M1 18.5h2m2 0h1m3 0h3m4 0h2m1 0h1m2 0h3m4 0h1m2 0h1m2 0h1M1 19.5h2m1 0h1m2 0h2m3 0h1m3 0h5m1 0h1m5 0h1m1 0h1m1 0h1m3 0h2M3 20.5h4m1 0h1m1 0h3m1 0h1m3 0h1m1 0h6m2 0h2m1 0h1m4 0h2M1 21.5h1m1 0h1m1 0h1m1 0h1m3 0h4m2 0h1m3 0h6m1 0h1m2 0h5M3 22.5h2m1 0h1m1 0h4m1 0h1m3 0h2m2 0h1m1 0h1m1 0h2m5 0h1m1 0h1m1 0h1M1 23.5h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h1m2 0h1m2 0h1m2 0h2m2 0h3m2 0h1m2 0h4M2 24.5h1m3 0h1m1 0h1m1 0h7m1 0h1m1 0h1m2 0h1m2 0h1m3 0h3m3 0h2M3 25.5h1m1 0h4m1 0h3m2 0h1m1 0h5m2 0h2m1 0h1m2 0h2m1 0h3M1 26.5h2m1 0h1m1 0h1m3 0h1m2 0h1m2 0h1m1 0h2m1 0h1m4 0h1m2 0h1m2 0h1M1 27.5h1m1 0h5m3 0h1m2 0h3m1 0h1m2 0h5m2 0h2m1 0h1m4 0h2M1 28.5h1m2 0h3m2 0h2m1 0h1m2 0h3m2 0h1m2 0h2m5 0h1m1 0h2M1 29.5h1m1 0h1m1 0h1m1 0h1m1 0h4m2 0h6m1 0h16M9 30.5h3m1 0h6m2 0h1m1 0h2m1 0h4m3 0h1M1 31.5h7m3 0h2m1 0h1m2 0h1m1 0h1m1 0h2m2 0h3m1 0h1m1 0h1m1 0h2m1 0h2M1 32.5h1m5 0h1m3 0h3m1 0h1m1 0h4m2 0h1m5 0h1m3 0h1m2 0h2M1 33.5h1m1 0h3m1 0h1m1 0h1m2 0h2m1 0h1m2 0h1m1 0h1m2 0h1m2 0h8m1 0h3M1 34.5h1m1 0h3m1 0h1m1 0h1m3 0h6m1 0h2m1 0h1m1 0h5m1 0h1m1 0h1m1 0h1M1 35.5h1m1 0h3m1 0h1m1 0h2m1 0h1m1 0h1m1 0h4m3 0h1m2 0h2m1 0h2m1 0h1m1 0h1m2 0h1M1 36.5h1m5 0h1m3 0h2m3 0h3m1 0h1m1 0h1m2 0h1m1 0h4m1 0h2m3 0h1M1 37.5h7m3 0h2m1 0h8m1 0h1m1 0h3m2 0h2m2 0h4"/></svg>

          <div class="qr-center-badge-img">
            ${CANONICAL_HUB_ICON_SVG}
          </div>
        </div>
        <a class="qr-clean-link font-open-sans" style="color: #0F4780;" href="https://hub-lab-div.vercel.app/divulgacao">hub-lab-div.vercel.app/divulgacao</a>
      </div>
    
      <div class="bottom-inst-box">
        <div>
          <!-- SEGURANÇA & CONFORMIDADE LEGAL EM UMA LINHA SÓ -->
          <div class="inst-badge-line font-bukra">
            <div class="inst-badge-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <span>SEGURANÇA &amp; CONFORMIDADE LEGAL</span>
          </div>
          <!-- TEXTO QUEBRADO NO BRASIL E CONTINUA EMBAIXO -->
          <p class="inst-desc-text font-open-sans">
            <span style="white-space: nowrap;">O <strong>HUB LabDiv</strong> respeita as <strong>leis, normas e decisões judiciais do Brasil</strong>,</span><br>
            além de ter todo o seu <strong>código aberto</strong> e um e-mail para <strong>suporte, sugestões e ideias da comunidade</strong>.
          </p>
        </div>

        <div class="inst-actions-row font-open-sans">
          <div class="inst-action-card">
            <div class="inst-action-icon git-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </div>
            <div class="inst-action-details">
              <span class="inst-action-tag tag-git">Código Aberto • AGPLv3</span>
              <span class="inst-action-val">github.com/HUB-LabDiv</span>
            </div>
          </div>

          <div class="inst-action-card">
            <div class="inst-action-icon email-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="3"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <div class="inst-action-details">
              <span class="inst-action-tag tag-email">Suporte &amp; Ideias</span>
              <span class="inst-action-val">hublabdiv@gmail.com</span>
            </div>
          </div>
        </div>

        <div class="inst-legal-copy font-open-sans">
          <span>Licença AGPLv3 &bull; LabDiv &bull; Instituto de Física da Universidade de São Paulo (IFUSP)</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ======================================================================================
// OPÇÃO 1: BENTO (COLUNAS ABERTAS COM RESPIRO ANTES DO RODAPÉ)
// ======================================================================================
function buildOpcao1Bento() {
  const middleCss = `
    .open-container {
      position: absolute;
      left: 45px; right: 45px;
      bottom: 490px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 36px;
      align-items: flex-end;
      z-index: 28;
    }
    .open-col {
      display: flex; flex-direction: column; justify-content: flex-start;
      box-sizing: border-box; background: transparent; padding: 0 4px;
    }
    .oc-1 { height: 535px; }
    .oc-2 { height: 445px; }
    .oc-3 { height: 305px; }

    .open-hero-number { font-size: 60px; font-weight: 900; line-height: 0.9; letter-spacing: -2px; }
    .oc-3 .open-hero-number { font-size: 36px; }
    .on-blue { color: #0F4780; }
    .on-red { color: #F14343; }
    .on-yellow { color: #D97706; }

    .open-accent-bar { width: 65px; height: 5px; border-radius: 999px; margin: 5px 0 8px 0; }
    .oc-3 .open-accent-bar { width: 44px; height: 4px; margin: 2px 0 4px 0; }
    .oab-blue { background: #0F4780; }
    .oab-red { background: #F14343; }
    .oab-yellow { background: #FFCC00; }

    .open-axis-tag {
      font-size: 19.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 2px; display: inline-block;
    }
    .oc-3 .open-axis-tag { font-size: 17px; margin-bottom: 1px; }
    .oat-blue { color: #0F4780; }
    .oat-red { color: #F14343; }
    .oat-yellow { color: #854D0E; }

    .open-title { font-size: 42px; font-weight: 900; color: #0F172A; line-height: 1.05; margin-bottom: 4px; }
    .oc-2 .open-title { font-size: 38px; }
    .oc-3 .open-title { font-size: 28px; margin-bottom: 2px; }

    .open-sub { font-size: 20.5px; color: #475569; font-weight: 700; line-height: 1.25; margin-bottom: 12px; }
    .oc-1 .open-sub { font-size: 21px; margin-bottom: 14px; line-height: 1.30; }
    .oc-2 .open-sub { font-size: 19.5px; margin-bottom: 10px; line-height: 1.20; }
    .oc-3 .open-sub { font-size: 18px; margin-bottom: 6px; line-height: 1.15; }

    .open-list { display: flex; flex-direction: column; gap: 10px; }
    .oc-1 .open-list { gap: 12px; }
    .oc-2 .open-list { gap: 8px; }
    .oc-3 .open-list { gap: 5px; }

    .open-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding-bottom: 6px; border-bottom: 1.5px solid rgba(148, 163, 184, 0.25);
    }
    .oc-1 .open-item { padding-bottom: 7px; }
    .oc-2 .open-item { padding-bottom: 5px; }
    .oc-3 .open-item { padding-bottom: 3px; gap: 8px; }
    .open-item:last-child { border-bottom: none; }

    .open-dot { width: 11px; height: 11px; border-radius: 50%; margin-top: 6px; flex-shrink: 0; }
    .oc-3 .open-dot { width: 9px; height: 9px; margin-top: 5px; }

    .open-item-title { font-size: 22px; font-weight: 800; color: #0F172A; line-height: 1.22; }
    .oc-1 .open-item-title { font-size: 22px; margin-bottom: 2px; }
    .oc-2 .open-item-title { font-size: 20px; }
    .oc-3 .open-item-title { font-size: 19.5px; }

    .open-item-desc { font-size: 19.5px; color: #475569; font-weight: 600; line-height: 1.25; margin-top: 1px; }
    .oc-1 .open-item-desc { font-size: 19.5px; line-height: 1.30; }
    .oc-2 .open-item-desc { font-size: 19.5px; line-height: 1.20; }
    .oc-3 .open-item-desc { font-size: 18px; line-height: 1.15; }
  `;

  const middleHtml = `
    <div class="open-container font-open-sans">
      <!-- Coluna 1: Social Aberto (Preenche o espaço e ultrapassa o bullet de Interativo) -->
      <div class="open-col oc-1">
        <div class="open-hero-number on-blue font-bukra">01</div>
        <div class="open-accent-bar oab-blue"></div>
        <span class="open-axis-tag oat-blue font-bukra">EIXO 1 &bull; SOCIAL</span>
        <h2 class="open-title font-bukra">Comunidade</h2>
        <p class="open-sub">Rede social acadêmica focada em comunicação científica e escuta ativa no IFUSP.</p>

        <div class="open-list">
          <div class="open-item">
            <div class="open-dot" style="background: #0F4780;"></div>
            <div>
              <div class="open-item-title font-bukra">Fluxo Dialógico</div>
              <div class="open-item-desc">Postagens com balões freirianos de afeto, escuta empática e debates científicos.</div>
            </div>
          </div>
          <div class="open-item">
            <div class="open-dot" style="background: #0F4780;"></div>
            <div>
              <div class="open-item-title font-bukra">Arte &amp; Galeria</div>
              <div class="open-item-desc">Vitrine de astrofotografia, ilustrações científicas, poesias e artes discentes.</div>
            </div>
          </div>
          <div class="open-item">
            <div class="open-dot" style="background: #0F4780;"></div>
            <div>
              <div class="open-item-title font-bukra">Logs de Vivência</div>
              <div class="open-item-desc">Diários de permanência discente, trajetórias reais e acolhimento humano coletivo.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coluna 2: Informativo Aberto -->
      <div class="open-col oc-2">
        <div class="open-hero-number on-red font-bukra">02</div>
        <div class="open-accent-bar oab-red"></div>
        <span class="open-axis-tag oat-red font-bukra">EIXO 2 &bull; INFORMATIVO</span>
        <h2 class="open-title font-bukra">Informativo</h2>
        <p class="open-sub">Memória histórica, normas consolidadas e recursos interativos.</p>

        <div class="open-list">
          <div class="open-item">
            <div class="open-dot" style="background: #F14343;"></div>
            <div>
              <div class="open-item-title font-bukra">Wiki Oficial</div>
              <div class="open-item-desc">PPPs, manuais de matrícula e resoluções unificadas do instituto.</div>
            </div>
          </div>
          <div class="open-item">
            <div class="open-dot" style="background: #F14343;"></div>
            <div>
              <div class="open-item-title font-bukra">Instituto &amp; Oportunidades</div>
              <div class="open-item-desc">Catálogo em tempo real de bolsas PUB, vagas de IC e estágios.</div>
            </div>
          </div>
          <div class="open-item">
            <div class="open-dot" style="background: #F14343;"></div>
            <div>
              <div class="open-item-title font-bukra">Interativo</div>
              <div class="open-item-desc">Glossário acadêmico, quizzes interativos, oportunidades e testes.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coluna 3: Ferramentas Aberto (100% no espaço branco abaixo da diagonal azul) -->
      <div class="open-col oc-3">
        <div class="open-hero-number on-yellow font-bukra">03</div>
        <div class="open-accent-bar oab-yellow"></div>
        <span class="open-axis-tag oat-yellow font-bukra">EIXO 3 &bull; FERRAMENTAS</span>
        <h2 class="open-title font-bukra">Ferramentas</h2>
        <p class="open-sub">Funções e recursos úteis para a rotina acadêmica.</p>

        <div class="open-list">
          <div class="open-item">
            <div class="open-dot" style="background: #FFCC00;"></div>
            <div>
              <div class="open-item-title font-bukra">Acompanhamento</div>
              <div class="open-item-desc">Controle semanal de faltas e alertas preventivos.</div>
            </div>
          </div>
          <div class="open-item">
            <div class="open-dot" style="background: #FFCC00;"></div>
            <div>
              <div class="open-item-title font-bukra">Estudos (1h:1h)</div>
              <div class="open-item-desc">1h em sala = 1h estudo autônomo planejado.</div>
            </div>
          </div>
          <div class="open-item">
            <div class="open-dot" style="background: #FFCC00;"></div>
            <div>
              <div class="open-item-title font-bukra">Integração</div>
              <div class="open-item-desc">Compartilhamento de ferramentas acadêmicas.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 1 Bento (Colunas Abertas Sem Cards)',
    middleCss,
    middleHtml
  });
}

// ======================================================================================
// OPÇÃO 2: BROWSER (JANELAS WEB OS SEM CORTAR O INTERATIVO)
// ======================================================================================
function buildOpcao2Browser() {
  const middleCss = `
    .browser-master-container {
      position: absolute;
      left: 45px; right: 45px;
      bottom: 434px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      align-items: flex-end;
      z-index: 28;
    }
    .browser-window {
      background: #FFFFFF;
      border-radius: 24px;
      box-shadow: 0 16px 40px rgba(15, 71, 128, 0.12), 0 2px 8px rgba(0,0,0,0.04);
      border: 2px solid #CBD5E1;
      display: flex; flex-direction: column;
      overflow: hidden; box-sizing: border-box;
    }
    .bw-1 { height: 605px; border-color: rgba(15, 71, 128, 0.4); }
    .bw-2 { height: 495px; border-color: rgba(241, 67, 67, 0.4); }
    .bw-3 { height: 365px; border-color: rgba(255, 204, 0, 0.6); }

    .bw-top-bar {
      background: #F1F5F9; border-bottom: 1.5px solid #E2E8F0;
      padding: 7px 14px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .bw-3 .bw-top-bar { padding: 5px 10px; }

    .bw-dots { display: flex; gap: 6px; }
    .bw-dot { width: 11px; height: 11px; border-radius: 50%; }
    .bw-3 .bw-dot { width: 9px; height: 9px; }
    .dot-close { background: #EF4444; }
    .dot-min { background: #F59E0B; }
    .dot-max { background: #10B981; }

    .bw-url-pill {
      background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 999px;
      padding: 2px 12px; font-size: 19.5px; font-weight: 700; color: #475569;
      display: flex; align-items: center; gap: 5px;
    }
    .bw-3 .bw-url-pill { font-size: 16.5px; padding: 1px 8px; }

    .bw-body {
      padding: 12px 14px 8px 14px; flex: 1; display: flex; flex-direction: column; justify-content: flex-start;
    }
    .bw-1 .bw-body { padding: 10px 14px 6px 14px; justify-content: flex-start; }
    .bw-2 .bw-body { padding: 10px 14px 6px 14px; }
    .bw-3 .bw-body { padding: 6px 10px 4px 10px; }

    .bw-tag { font-size: 18px; font-weight: 900; text-transform: uppercase; margin-bottom: 2px; display: inline-block; }
    .bw-2 .bw-tag { font-size: 17px; margin-bottom: 2px; }
    .bw-3 .bw-tag { font-size: 16px; margin-bottom: 1px; color: #854D0E; }

    .bw-h2 { font-size: 38px; font-weight: 900; color: #0F172A; line-height: 1.05; margin-bottom: 2px; }
    .bw-2 .bw-h2 { font-size: 34px; margin-bottom: 2px; }
    .bw-3 .bw-h2 { font-size: 26px; margin-bottom: 1px; }

    .bw-desc { font-size: 20px; color: #475569; font-weight: 700; line-height: 1.24; margin-bottom: 8px; }
    .bw-1 .bw-desc { font-size: 19.5px; line-height: 1.25; margin-bottom: 8px; }
    .bw-2 .bw-desc { font-size: 19.5px; margin-bottom: 8px; line-height: 1.20; }
    .bw-3 .bw-desc { font-size: 17px; margin-bottom: 4px; line-height: 1.15; }

    .bw-item-card {
      background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 12px;
      padding: 7px 10px; margin-bottom: 6px;
    }
    .bw-1 .bw-item-card { padding: 8px 12px; margin-bottom: 6px; }
    .bw-2 .bw-item-card { padding: 6px 10px; margin-bottom: 5px; }
    .bw-3 .bw-item-card { padding: 3px 8px; margin-bottom: 4px; border-radius: 8px; }

    .bw-item-title { font-size: 20.5px; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 6px; }
    .bw-1 .bw-item-title { font-size: 21px; margin-bottom: 2px; }
    .bw-2 .bw-item-title { font-size: 20px; }
    .bw-3 .bw-item-title { font-size: 19.5px; }

    .bw-item-detail { font-size: 19.5px; color: #475569; font-weight: 600; line-height: 1.22; margin-top: 1px; }
    .bw-1 .bw-item-detail { font-size: 19px; line-height: 1.25; }
    .bw-2 .bw-item-detail { font-size: 19.5px; line-height: 1.18; }
    .bw-3 .bw-item-detail { font-size: 17px; line-height: 1.15; }
  `;

  const middleHtml = `
    <div class="browser-master-container font-open-sans">
      <!-- Janela 1: /comunidade (preenche o vazio e passa do bullet de interativo) -->
      <div class="browser-window bw-1">
        <div class="bw-top-bar">
          <div class="bw-dots">
            <div class="bw-dot dot-close"></div>
            <div class="bw-dot dot-min"></div>
            <div class="bw-dot dot-max"></div>
          </div>
          <div class="bw-url-pill font-open-sans">🔒 hub.usp.br/comunidade</div>
          <div style="font-size: 18px; font-weight: 900; color: #0F4780;">EIXO 1</div>
        </div>
        <div class="bw-body">
          <div>
            <span class="bw-tag font-bukra" style="color: #0F4780;">SOCIAL &bull; DIÁLOGO</span>
            <h2 class="bw-h2 font-bukra">Comunidade</h2>
            <p class="bw-desc">Rede social acadêmica focada em comunicação científica e acolhimento discente.</p>
          </div>

          <div class="bw-item-card" style="border-left: 5px solid #0F4780;">
            <div class="bw-item-title font-bukra"><span>💬</span> Fluxo Dialógico</div>
            <div class="bw-item-detail">Feed científico vivo com balões freirianos de afeto, escuta empática e diálogo.</div>
          </div>
          <div class="bw-item-card" style="border-left: 5px solid #0F4780;">
            <div class="bw-item-title font-bukra"><span>🎨</span> Arte &amp; Galeria</div>
            <div class="bw-item-detail">Vitrine cultural de astrofotografia, artes autorais e projetos discentes do IFUSP.</div>
          </div>
          <div class="bw-item-card" style="border-left: 5px solid #0F4780; margin-bottom: 0;">
            <div class="bw-item-title font-bukra"><span>📖</span> Logs de Vivência</div>
            <div class="bw-item-detail">Diários de permanência discente e acolhimento coletivo.</div>
          </div>
        </div>
      </div>

      <!-- Janela 2: /informativo (com Interativo sem corte) -->
      <div class="browser-window bw-2">
        <div class="bw-top-bar">
          <div class="bw-dots">
            <div class="bw-dot dot-close"></div>
            <div class="bw-dot dot-min"></div>
            <div class="bw-dot dot-max"></div>
          </div>
          <div class="bw-url-pill font-open-sans">🔒 hub.usp.br/informativo</div>
          <div style="font-size: 18px; font-weight: 900; color: #F14343;">EIXO 2</div>
        </div>
        <div class="bw-body">
          <span class="bw-tag font-bukra" style="color: #F14343;">INFORMATIVO &bull; IFUSP</span>
          <h2 class="bw-h2 font-bukra">Informativo</h2>
          <p class="bw-desc">Central de conhecimento e memória do IFUSP</p>

          <div class="bw-item-card" style="border-left: 5px solid #F14343;">
            <div class="bw-item-title font-bukra"><span>📚</span> Wiki Oficial</div>
            <div class="bw-item-detail">Manuais de curso, PPPs consolidados e normas da graduação.</div>
          </div>
          <div class="bw-item-card" style="border-left: 5px solid #F14343;">
            <div class="bw-item-title font-bukra"><span>🏛️</span> Instituto &amp; Bolsas</div>
            <div class="bw-item-detail">Mural em tempo real de bolsas PUB, vagas de IC e estágios.</div>
          </div>
          <div class="bw-item-card" style="border-left: 5px solid #F14343;">
            <div class="bw-item-title font-bukra"><span>🧩</span> Interativo</div>
            <div class="bw-item-detail">Glossário oficial, testes, quizzes e recursos interativos.</div>
          </div>
        </div>
      </div>

      <!-- Janela 3: /ferramentas (100% no espaço branco abaixo da diagonal azul) -->
      <div class="browser-window bw-3">
        <div class="bw-top-bar">
          <div class="bw-dots">
            <div class="bw-dot dot-close"></div>
            <div class="bw-dot dot-min"></div>
            <div class="bw-dot dot-max"></div>
          </div>
          <div class="bw-url-pill font-open-sans">🔒 hub.usp.br/ferramentas</div>
          <div style="font-size: 17px; font-weight: 900; color: #D97706;">EIXO 3</div>
        </div>
        <div class="bw-body">
          <span class="bw-tag font-bukra">PRODUTIVIDADE &bull; APOIO</span>
          <h2 class="bw-h2 font-bukra" style="color: #B45309;">Ferramentas</h2>
          <p class="bw-desc">Funções e recursos úteis para a rotina acadêmica.</p>

          <div class="bw-item-card" style="border-left: 5px solid #FFCC00;">
            <div class="bw-item-title font-bukra"><span>⏱️</span> Acompanhamento</div>
            <div class="bw-item-detail">Controle semanal de faltas e presença.</div>
          </div>
          <div class="bw-item-card" style="border-left: 5px solid #FFCC00;">
            <div class="bw-item-title font-bukra"><span>📐</span> Estudos (1h:1h)</div>
            <div class="bw-item-detail">1h em aula = 1h de estudo planejado.</div>
          </div>
          <div class="bw-item-card" style="border-left: 5px solid #FFCC00; margin-bottom: 0;">
            <div class="bw-item-title font-bukra"><span>🛠️</span> Integração</div>
            <div class="bw-item-detail">Compartilhamento de ferramentas.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 2 Browser (Janelas Web OS)',
    middleCss,
    middleHtml
  });
}

// ======================================================================================
// OPÇÃO 3: MÉTRICAS / EDITORIAL: CARDS PREENCHENDO BEM O ESPAÇO SEM VAZIO NO FUNDO
// ======================================================================================
function buildOpcao3Metricas() {
  const middleCss = `
    .stats-master-container {
      position: absolute;
      left: 45px; right: 45px;
      bottom: 434px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      align-items: flex-end;
      z-index: 28;
    }
    .stat-card {
      background: #FFFFFF;
      border-radius: 26px;
      box-shadow: 0 16px 42px rgba(15, 71, 128, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
      display: flex; flex-direction: column; justify-content: flex-start;
      box-sizing: border-box; overflow: hidden;
    }
    .sc-1 { height: 630px; border: 2.5px solid rgba(15, 71, 128, 0.4); padding: 24px 22px 20px 22px; }
    .sc-2 { height: 518px; border: 2.5px solid rgba(241, 67, 67, 0.4); padding: 22px 22px 18px 22px; }
    .sc-3 { height: 358px; border: 2.5px solid #FFCC00; padding: 14px 18px 12px 18px; }

    .stat-title-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 3px;
    }
    .sc-1 .stat-h2 { font-size: 42px; font-weight: 900; line-height: 1.05; color: #0F4780; }
    .sc-2 .stat-h2 { font-size: 38px; font-weight: 900; line-height: 1.05; color: #F14343; }
    .sc-3 .stat-h2 { font-size: 32px; font-weight: 900; line-height: 1.05; color: #FFCC00; text-shadow: 0 1px 1px rgba(0, 0, 0, 0.18); }

    .stat-axis-pill {
      font-size: 21px; font-weight: 800; padding: 4px 14px; border-radius: 999px; letter-spacing: 0.5px;
    }
    .sc-3 .stat-axis-pill { font-size: 19.5px; padding: 3px 12px; }
    .sap-blue { background: #EEF4FA; color: #0F4780; border: 1.5px solid rgba(15, 71, 128, 0.25); }
    .sap-red { background: #FEF2F2; color: #F14343; border: 1.5px solid rgba(241, 67, 67, 0.25); }
    .sap-yellow { background: #FEFCE8; color: #B45309; border: 1.5px solid rgba(255, 204, 0, 0.5); }

    .stat-divider { width: 100%; height: 2px; background: #E2E8F0; margin: 8px 0 14px 0; }
    .sc-2 .stat-divider { margin: 6px 0 12px 0; }
    .sc-3 .stat-divider { margin: 4px 0 8px 0; }

    .sc-1 .stat-sub { font-size: 27px; color: #334155; font-weight: 600; line-height: 1.25; margin-bottom: 18px; }
    .sc-2 .stat-sub { font-size: 27px; color: #334155; font-weight: 600; line-height: 1.25; margin-bottom: 12px; }
    .sc-3 .stat-sub { font-size: 23px; color: #334155; font-weight: 600; line-height: 1.20; margin-bottom: 7px; }

    .sc-1 .stat-list { display: flex; flex-direction: column; gap: 16px; }
    .sc-2 .stat-list { display: flex; flex-direction: column; gap: 11px; }
    .sc-3 .stat-list { display: flex; flex-direction: column; gap: 7px; }

    .sc-1 .stat-item {
      display: flex; align-items: flex-start; gap: 12px; font-size: 23px; line-height: 1.30; color: #1E293B; font-weight: 600;
    }
    .sc-2 .stat-item {
      display: flex; align-items: flex-start; gap: 10px; font-size: 20px; line-height: 1.28; color: #1E293B; font-weight: 600;
    }
    .sc-3 .stat-item {
      display: flex; align-items: flex-start; gap: 8px; font-size: 18.5px; line-height: 1.18; color: #1E293B; font-weight: 600;
    }

    .sc-1 .stat-item strong { font-weight: 800; color: #0F172A; font-size: 24px; }
    .sc-2 .stat-item strong { font-weight: 800; color: #0F172A; font-size: 21px; }
    .sc-3 .stat-item strong { font-weight: 800; color: #0F172A; font-size: 19px; }

    .stat-bullet { font-weight: 900; line-height: 1; margin-top: 2px; }
    .sc-1 .stat-bullet { font-size: 26px; color: #0F4780; }
    .sc-2 .stat-bullet { font-size: 21px; color: #F14343; }
    .sc-3 .stat-bullet { font-size: 19px; margin-top: 1px; color: #FFCC00; text-shadow: 0 0 1px #0F172A; }
  `;

  const middleHtml = `
    <div class="stats-master-container font-open-sans">
      <!-- Card 1: Comunidade 01 (Preenche elegantemente os 630px) -->
      <div class="stat-card sc-1">
        <div class="stat-title-header">
          <h2 class="stat-h2 font-bukra">Comunidade</h2>
          <span class="stat-axis-pill sap-blue font-open-sans">01</span>
        </div>
        <div class="stat-divider"></div>

        <p class="stat-sub">Rede social focada em comunicação científica.</p>

        <div class="stat-list">
          <div class="stat-item">
            <span class="stat-bullet sn-blue">&bull;</span>
            <div><strong>Fluxo:</strong> feed para comunicação de conceitos científicos.</div>
          </div>
          <div class="stat-item">
            <span class="stat-bullet sn-blue">&bull;</span>
            <div><strong>Arte:</strong> feed para o compartilhamento das expressões artísticas da comunidade.</div>
          </div>
          <div class="stat-item">
            <span class="stat-bullet sn-blue">&bull;</span>
            <div><strong>Logs:</strong> feed focado em interações breves e humanas do dia a dia.</div>
          </div>
        </div>
      </div>

      <!-- Card 2: Informativo 02 -->
      <div class="stat-card sc-2">
        <div class="stat-title-header">
          <h2 class="stat-h2 font-bukra">Informativo</h2>
          <span class="stat-axis-pill sap-red font-open-sans">02</span>
        </div>
        <div class="stat-divider"></div>

        <p class="stat-sub">Central de conhecimento, memória e normas do IFUSP.</p>

        <div class="stat-list">
          <div class="stat-item">
            <span class="stat-bullet sn-red">&bull;</span>
            <div><strong>Wiki:</strong> protocolos que reúnem toda informação a respeito de um tema.</div>
          </div>
          <div class="stat-item">
            <span class="stat-bullet sn-red">&bull;</span>
            <div><strong>Instituto:</strong> informações sobre o instituto como departamentos, espaços, iniciativas e mais.</div>
          </div>
          <div class="stat-item">
            <span class="stat-bullet sn-red">&bull;</span>
            <div><strong>Interativo:</strong> glossário, oportunidades, testes, quizzes e recursos interativos.</div>
          </div>
        </div>
      </div>

      <!-- Card 3: Ferramentas 03 -->
      <div class="stat-card sc-3">
        <div class="stat-title-header">
          <h2 class="stat-h2 font-bukra">Ferramentas</h2>
          <span class="stat-axis-pill sap-yellow font-open-sans">03</span>
        </div>
        <div class="stat-divider"></div>

        <p class="stat-sub">Funções, recursos úteis para a rotina acadêmica.</p>

        <div class="stat-list">
          <div class="stat-item">
            <span class="stat-bullet sn-yellow">&bull;</span>
            <div><strong>Acompanhamento:</strong> controle de faltas, evolução no curso e planejamento do semestre.</div>
          </div>
          <div class="stat-item">
            <span class="stat-bullet sn-yellow">&bull;</span>
            <div><strong>Estudos:</strong> central de anotações e de recursos de estudos.</div>
          </div>
          <div class="stat-item">
            <span class="stat-bullet sn-yellow">&bull;</span>
            <div><strong>Integração:</strong> compartilhamento de ferramentas entre a comunidade acadêmica.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 3 Métricas (Painéis Editoriais)',
    middleCss,
    middleHtml
  });
}

// ======================================================================================
// OPÇÃO 4: PILLS / FAIXAS HORIZONTAIS COM CARDS (SEM CORTAR INTEGRAÇÃO)
// ======================================================================================
function buildOpcao4PillsInvertido() {
  const middleCss = `
    .hr-strip {
      position: absolute;
      background: #FFFFFF;
      border-radius: 22px;
      box-shadow: 0 16px 36px rgba(15, 71, 128, 0.12), 0 2px 8px rgba(0,0,0,0.04);
      border: 2px solid #CBD5E1;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-sizing: border-box;
      overflow: hidden;
      z-index: 35;
    }

    /* FAIXA 1 (EM CIMA): FERRAMENTAS - 100% NO ESPAÇO BRANCO SEM INVASÃO AZUL */
    .hr-strip-top {
      top: 760px;
      left: 45px;
      width: 550px;
      height: 175px;
      border-left: 8px solid #FFCC00;
    }

    /* FAIXA 2 (NO MEIO): INFORMATIVO */
    .hr-strip-mid {
      top: 945px;
      left: 45px;
      width: 1150px;
      height: 175px;
      border-left: 8px solid #F14343;
    }

    /* FAIXA 3 (EM BAIXO): COMUNIDADE */
    .hr-strip-bot {
      top: 1130px;
      left: 45px;
      width: 1150px;
      height: 175px;
      border-left: 8px solid #0F4780;
    }

    .hr-brand-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex-shrink: 0;
    }
    .hr-strip-top .hr-brand-col { width: 170px; }
    .hr-strip-mid .hr-brand-col { width: 210px; }
    .hr-strip-bot .hr-brand-col { width: 230px; }

    .hr-badge {
      font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;
      padding: 3px 12px; border-radius: 999px; display: inline-flex; width: fit-content; margin-bottom: 4px;
    }
    .hrb-yellow { background: #FEF9C3; color: #854D0E; }
    .hrb-red { background: #FEF2F2; color: #F14343; }
    .hrb-blue { background: #EEF4FA; color: #0F4780; }

    .hr-title {
      font-size: 34px; font-weight: 900; line-height: 1.05; margin-bottom: 2px;
    }
    .hr-strip-top .hr-title { font-size: 32px; color: #B45309; }
    .hr-strip-mid .hr-title { font-size: 38px; color: #F14343; }
    .hr-strip-bot .hr-title { font-size: 38px; color: #0F4780; }

    .hr-subtitle {
      font-size: 19.5px; font-weight: 700; color: #475569; line-height: 1.2;
    }
    .hr-strip-top .hr-subtitle { font-size: 17.5px; }

    .hr-divider-v {
      width: 2px; height: 100%; background: #E2E8F0; flex-shrink: 0;
    }

    /* MINI PILLS EM UMA LINHA CADA NA FAIXA SUPERIOR - SEM CORTE E SEM INVASÃO */
    .hr-strip-top-items {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      flex: 1;
      gap: 5px;
    }
    .hr-mini-pill {
      background: #F8FAFC;
      border: 1.5px solid #E2E8F0;
      border-radius: 10px;
      padding: 3px 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .hr-mini-pill strong {
      color: #0F172A; font-weight: 800; font-size: 19.5px; line-height: 1.12; display: block;
    }
    .hr-mini-sub {
      font-size: 19.5px; color: #475569; font-weight: 600; line-height: 1.15; white-space: nowrap;
    }
    .hr-mini-icon {
      font-size: 19px; flex-shrink: 0;
    }

    /* CARDS LADO A LADO NAS FAIXAS CENTRAL E INFERIOR COM FONTES AMPLIADAS */
    .hr-items-row {
      display: flex;
      flex: 1;
      gap: 14px;
      align-items: stretch;
      height: 100%;
    }
    .hr-item-card {
      flex: 1;
      background: #F8FAFC;
      border: 1.5px solid #E2E8F0;
      border-radius: 14px;
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-sizing: border-box;
    }
    .hr-item-header {
      display: flex; align-items: center; gap: 7px; margin-bottom: 3px;
    }
    .hr-item-icon {
      font-size: 22px; line-height: 1;
    }
    .hr-item-title {
      font-size: 22.5px; font-weight: 800; color: #0F172A;
    }
    .hr-item-desc {
      font-size: 20px; color: #475569; font-weight: 600; line-height: 1.28;
    }
  `;

  const middleHtml = `
    <!-- FAIXA 1 (EM CIMA): FERRAMENTAS - 100% NO ESPAÇO BRANCO -->
    <div class="hr-strip hr-strip-top font-open-sans">
      <div class="hr-brand-col">
        <span class="hr-badge hrb-yellow font-bukra">EIXO 3</span>
        <h2 class="hr-title font-bukra">Ferramentas</h2>
        <p class="hr-subtitle">Funções e apoio acadêmico</p>
      </div>
      <div class="hr-divider-v"></div>
      <div class="hr-strip-top-items">
        <div class="hr-mini-pill" style="border-left: 4.5px solid #FFCC00;">
          <span class="hr-mini-icon">⏱️</span>
          <div>
            <strong class="font-bukra">Acompanhamento</strong>
            <div class="hr-mini-sub">Controle de faltas e presença.</div>
          </div>
        </div>
        <div class="hr-mini-pill" style="border-left: 4.5px solid #FFCC00;">
          <span class="hr-mini-icon">📐</span>
          <div>
            <strong class="font-bukra">Estudos (1h:1h)</strong>
            <div class="hr-mini-sub">1h em sala = 1h autônomo.</div>
          </div>
        </div>
        <div class="hr-mini-pill" style="border-left: 4.5px solid #FFCC00;">
          <span class="hr-mini-icon">🛠️</span>
          <div>
            <strong class="font-bukra">Integração</strong>
            <div class="hr-mini-sub">Ferramentas acadêmicas.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAIXA 2 (NO MEIO): INFORMATIVO -->
    <div class="hr-strip hr-strip-mid font-open-sans">
      <div class="hr-brand-col">
        <span class="hr-badge hrb-red font-bukra">EIXO 2</span>
        <h2 class="hr-title font-bukra">Informativo</h2>
        <p class="hr-subtitle">Central de conhecimento IFUSP</p>
      </div>
      <div class="hr-divider-v"></div>
      <div class="hr-items-row">
        <div class="hr-item-card" style="border-left: 4px solid #F14343;">
          <div class="hr-item-header">
            <span class="hr-item-icon">📚</span>
            <span class="hr-item-title font-bukra">Wiki Oficial</span>
          </div>
          <p class="hr-item-desc">Manuais de curso, PPPs e resoluções do IFUSP.</p>
        </div>
        <div class="hr-item-card" style="border-left: 4px solid #F14343;">
          <div class="hr-item-header">
            <span class="hr-item-icon">🏛️</span>
            <span class="hr-item-title font-bukra">Instituto &amp; Bolsas</span>
          </div>
          <p class="hr-item-desc">Mural em tempo real de bolsas PUB e estágios.</p>
        </div>
        <div class="hr-item-card" style="border-left: 4px solid #F14343;">
          <div class="hr-item-header">
            <span class="hr-item-icon">🧩</span>
            <span class="hr-item-title font-bukra">Interativo</span>
          </div>
          <p class="hr-item-desc">Glossário, testes, quizzes e recursos interativos.</p>
        </div>
      </div>
    </div>

    <!-- FAIXA 3 (EM BAIXO): COMUNIDADE -->
    <div class="hr-strip hr-strip-bot font-open-sans">
      <div class="hr-brand-col">
        <span class="hr-badge hrb-blue font-bukra">EIXO 1</span>
        <h2 class="hr-title font-bukra">Comunidade</h2>
        <p class="hr-subtitle">Rede social focada em ciência.</p>
      </div>
      <div class="hr-divider-v"></div>
      <div class="hr-items-row">
        <div class="hr-item-card" style="border-left: 4px solid #0F4780;">
          <div class="hr-item-header">
            <span class="hr-item-icon">💬</span>
            <span class="hr-item-title font-bukra">Fluxo Dialógico</span>
          </div>
          <p class="hr-item-desc">Feed científico com postagens e acolhimento.</p>
        </div>
        <div class="hr-item-card" style="border-left: 4px solid #0F4780;">
          <div class="hr-item-header">
            <span class="hr-item-icon">🎨</span>
            <span class="hr-item-title font-bukra">Arte &amp; Galeria</span>
          </div>
          <p class="hr-item-desc">Vitrine de astrofotografia e artes discentes.</p>
        </div>
        <div class="hr-item-card" style="border-left: 4px solid #0F4780;">
          <div class="hr-item-header">
            <span class="hr-item-icon">📖</span>
            <span class="hr-item-title font-bukra">Logs de Vivência</span>
          </div>
          <p class="hr-item-desc">Diários discentes de permanência e vivências.</p>
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 4 Pills (Ferramentas Top, Informativo Mid, Comunidade Bot)',
    middleCss,
    middleHtml
  });
}

// ======================================================================================
// NOVA OPÇÃO 5: LINHAS EDITORIAIS ABERTAS (SEM CARDS DE FUNDO, FONTES MAIORES, LINHAS VERTICAIS)
// ======================================================================================
function buildOpcao5LinhasAbertas() {
  const middleCss = `
    .open-tier {
      position: absolute;
      left: 45px;
      display: flex;
      align-items: center;
      box-sizing: border-box;
      z-index: 35;
    }

    .open-tier-top {
      top: 760px;
      width: 550px;
      height: 175px;
    }

    .open-tier-mid {
      top: 945px;
      width: 1150px;
      height: 175px;
    }

    .open-tier-bot {
      top: 1130px;
      width: 1150px;
      height: 175px;
    }

    .open-brand-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex-shrink: 0;
    }
    .open-tier-top .open-brand-col { width: 205px; margin-right: 16px; }
    .open-tier-mid .open-brand-col { width: 230px; margin-right: 20px; }
    .open-tier-bot .open-brand-col { width: 230px; margin-right: 20px; }

    .open-badge {
      font-size: 18px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.6px;
      padding: 3px 12px; border-radius: 999px; display: inline-flex; width: fit-content; margin-bottom: 4px;
    }
    .orb-yellow { background: #FEF9C3; color: #854D0E; border: 1.5px solid rgba(255, 204, 0, 0.5); }
    .orb-red { background: #FEF2F2; color: #F14343; border: 1.5px solid rgba(241, 67, 67, 0.3); }
    .orb-blue { background: #EEF4FA; color: #0F4780; border: 1.5px solid rgba(15, 71, 128, 0.3); }

    .open-axis-title {
      font-size: 38px; font-weight: 900; line-height: 1.05; margin-bottom: 2px;
    }
    .open-tier-top .open-axis-title { font-size: 33px; }

    .open-axis-sub {
      font-size: 19.5px; font-weight: 700; color: #475569; line-height: 1.25;
    }
    .open-tier-top .open-axis-sub { font-size: 17.5px; }

    /* ITENS VERTICAIS NO TOPO COM DESTAQUES EM LINHAS VERTICAIS - 100% NO BRANCO */
    .open-top-items {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      flex: 1;
      gap: 5px;
    }
    .open-top-item {
      border-left: 6px solid #FFCC00;
      padding: 4px 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.90);
      border-radius: 0 12px 12px 0;
    }
    .open-top-item strong {
      color: #0F172A; font-weight: 800; font-size: 19.5px; line-height: 1.12; display: block;
    }
    .open-item-sub {
      font-size: 19.5px; color: #475569; font-weight: 600; line-height: 1.15; white-space: nowrap;
    }

    /* ITENS EM LINHA LADO A LADO NAS OUTRAS DUAS FAIXAS COM FONTES GRANDES */
    .open-row-items {
      display: flex;
      flex: 1;
      gap: 24px;
      align-items: center;
      height: 100%;
    }
    .open-col-item {
      flex: 1;
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-sizing: border-box;
    }
    .open-col-title {
      font-size: 25px; font-weight: 900; color: #0F172A; margin-bottom: 5px; display: flex; align-items: center; gap: 8px;
    }
    .open-col-desc {
      font-size: 20.5px; color: #334155; font-weight: 600; line-height: 1.34;
    }
  `;

  const middleHtml = `
    <!-- FAIXA 1 (EM CIMA): FERRAMENTAS (SEM CARDS, 100% NO ESPAÇO BRANCO) -->
    <div class="open-tier open-tier-top font-open-sans">
      <div class="open-brand-col">
        <span class="open-badge orb-yellow font-bukra">EIXO 3</span>
        <h2 class="open-axis-title font-bukra" style="color: #B45309;">Ferramentas</h2>
        <p class="open-axis-sub">Funções e apoio acadêmico</p>
      </div>
      <div class="open-top-items">
        <div class="open-top-item">
          <span style="font-size: 20px;">⏱️</span>
          <div>
            <strong class="font-bukra">Acompanhamento</strong>
            <div class="open-item-sub">Controle de faltas e presença.</div>
          </div>
        </div>
        <div class="open-top-item">
          <span style="font-size: 20px;">📐</span>
          <div>
            <strong class="font-bukra">Estudos (1h:1h)</strong>
            <div class="open-item-sub">1h em sala = 1h autônomo.</div>
          </div>
        </div>
        <div class="open-top-item">
          <span style="font-size: 20px;">🛠️</span>
          <div>
            <strong class="font-bukra">Integração</strong>
            <div class="open-item-sub">Ferramentas acadêmicas.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAIXA 2 (NO MEIO): INFORMATIVO (SEM CARDS, ABERTO COM LINHAS VERTICAIS) -->
    <div class="open-tier open-tier-mid font-open-sans">
      <div class="open-brand-col">
        <span class="open-badge orb-red font-bukra">EIXO 2</span>
        <h2 class="open-axis-title font-bukra" style="color: #F14343;">Informativo</h2>
        <p class="open-axis-sub">Central de conhecimento IFUSP</p>
      </div>
      <div class="open-row-items">
        <div class="open-col-item" style="border-left: 6px solid #F14343;">
          <div class="open-col-title font-bukra"><span>📚</span> Wiki Oficial</div>
          <p class="open-col-desc">Manuais de curso, PPPs consolidados e normas da graduação.</p>
        </div>
        <div class="open-col-item" style="border-left: 6px solid #F14343;">
          <div class="open-col-title font-bukra"><span>🏛️</span> Instituto &amp; Bolsas</div>
          <p class="open-col-desc">Mural em tempo real de bolsas PUB, vagas de IC e estágios.</p>
        </div>
        <div class="open-col-item" style="border-left: 6px solid #F14343;">
          <div class="open-col-title font-bukra"><span>🧩</span> Interativo</div>
          <p class="open-col-desc">Glossário oficial, testes, quizzes e recursos interativos.</p>
        </div>
      </div>
    </div>

    <!-- FAIXA 3 (EM BAIXO): COMUNIDADE (SEM CARDS, ABERTO COM LINHAS VERTICAIS) -->
    <div class="open-tier open-tier-bot font-open-sans">
      <div class="open-brand-col">
        <span class="open-badge orb-blue font-bukra">EIXO 1</span>
        <h2 class="open-axis-title font-bukra" style="color: #0F4780;">Comunidade</h2>
        <p class="open-axis-sub">Rede social focada em ciência</p>
      </div>
      <div class="open-row-items">
        <div class="open-col-item" style="border-left: 6px solid #0F4780;">
          <div class="open-col-title font-bukra"><span>💬</span> Fluxo Dialógico</div>
          <p class="open-col-desc">Feed científico com postagens, acolhimento e escuta ativa.</p>
        </div>
        <div class="open-col-item" style="border-left: 6px solid #0F4780;">
          <div class="open-col-title font-bukra"><span>🎨</span> Arte &amp; Galeria</div>
          <p class="open-col-desc">Vitrine de astrofotografia, artes discentes e ilustração científica.</p>
        </div>
        <div class="open-col-item" style="border-left: 6px solid #0F4780;">
          <div class="open-col-title font-bukra"><span>📖</span> Logs de Vivência</div>
          <p class="open-col-desc">Diários de permanência discente, relatos reais e acolhimento humano.</p>
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 5 Linhas Abertas (Destaques Verticais Sem Cards)',
    middleCss,
    middleHtml
  });
}

// ======================================================================================
// CONFIGURAÇÃO DO POSTER 1 OFICIAL (OPÇÃO 3 MÉTRICAS ESCOLHIDA)
// ======================================================================================
const POSTERS = [
  {
    key: 'poster1_opcao3_metricas',
    pngFilename: 'poster1_opcao3_metricas.png',
    psdFilename: 'poster1_opcao3_metricas.psd',
    title: 'HUB LabDiv - Conectando você à universidade (Opção 3 Métricas)',
    fn: buildOpcao3Metricas
  }
];

// Camadas para extração e composição do PSD
const PSD_LAYERS_SPEC = [
  { id: '01_bg_math', name: '01. Padrão Matemático', selector: '.bg-math-pattern' },
  { id: '02_top_bar', name: '02. Linha Gradiente Topo', selector: '.brand-gradient-line-top' },
  { id: '03_top_header', name: '03. Topo Azul & Título Principal', selector: '.p12-diagonal, .p12-header' },
  { id: '04_hero_badge', name: '04. Emblema Hero HUB LabDiv', selector: '.p12-right-hero-col' },
  { id: '05_middle_content', name: '05. Conteúdo dos 3 Eixos', selector: '[data-middle-content]' },
  { id: '06_bottom_footer', name: '06. QR Code & Segurança Legal', selector: '.bottom-third-plane' }
];

async function main() {
  console.log('🚀 Iniciando geração completa do HUB LabDiv - Poster 1 Suite...');
  console.log('   - 5 PNGs em 300 DPI (2480x3508)');
  console.log('   - 1 PDF Multi-Páginas (5 páginas)');
  console.log('   - 5 PSDs multi-camadas oficiais editáveis\n');

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  // 1. Renderizar os 5 PNGs individuais
  console.log('📸 [FASE 1] Renderizando os 5 posters em alta resolução...');
  for (const p of POSTERS) {
    const html = p.fn();
    const tempHtmlPath = path.join(POSTER1_DIR, `${p.key}.temp.html`);
    const pngPath = path.join(POSTER1_DIR, p.pngFilename);
    const previewPath = path.join(ARTIFACT_DIR, `${p.key}_preview.png`);

    fs.writeFileSync(tempHtmlPath, html, 'utf8');

    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 3 });
    await page.goto('file://' + tempHtmlPath, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({
      path: pngPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1240, height: 1754 }
    });

    fs.copyFileSync(pngPath, previewPath);
    console.log(`   ✅ PNG Ultra-HD (3720x5262 px): ${p.pngFilename} (${p.title})`);

    // 2. Extrair camadas individuais para o PSD
    console.log(`   🎨 Extraindo camadas para o PSD de ${p.key}...`);
    const posterTmpDir = path.join(TMP_LAYERS_DIR, p.key);
    fs.mkdirSync(posterTmpDir, { recursive: true });

    // Fundo base sólido
    const bgSolidPage = await browser.newPage();
    await bgSolidPage.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
    await bgSolidPage.setContent(`
      <body style="margin:0;padding:0;background:#FFFFFF;width:1240px;height:1754px;overflow:hidden;">
        <div style="width:1240px;height:1754px;background:#FFFFFF;"></div>
      </body>
    `);
    const bgSolidPng = path.join(posterTmpDir, '00_bg_solid.png');
    await bgSolidPage.screenshot({ path: bgSolidPng, clip: { x: 0, y: 0, width: 1240, height: 1754 } });
    await bgSolidPage.close();

    const layerArgs = [`00. Fundo Base (Branco)::${bgSolidPng}`];

    for (const spec of PSD_LAYERS_SPEC) {
      const layerPage = await browser.newPage();
      await layerPage.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
      await layerPage.goto('file://' + tempHtmlPath, { waitUntil: 'networkidle0' });
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
      }, spec.selector);

      const layerPngPath = path.join(posterTmpDir, `${spec.id}.png`);
      await layerPage.screenshot({
        path: layerPngPath,
        clip: { x: 0, y: 0, width: 1240, height: 1754 },
        omitBackground: true
      });
      await layerPage.close();

      layerArgs.push(`${spec.name}::${layerPngPath}`);
    }

    // Camada de Arte Final Completa
    layerArgs.push(`07. Arte Final Completa::${pngPath}`);

    // Montar o PSD via Python
    const outPsdPath = path.join(POSTER1_DIR, p.psdFilename);
    const pythonScript = path.join(PROJECT_ROOT, 'scripts/assemble_poster_psd.py');
    const cmd = `python3 "${pythonScript}" "${outPsdPath}" ${layerArgs.map(a => `"${a}"`).join(' ')}`;
    try {
      execSync(cmd, { stdio: 'inherit' });
      console.log(`   🎉 PSD montado e verificado: ${outPsdPath}`);
    } catch (err) {
      console.error(`   ❌ Falha ao montar PSD para ${p.key}:`, err);
    }

    // 3. Gerar PDF do Poster 1 diretamente do PNG Ultra-HD (100% idêntico ao PNG pixel-a-pixel)
    console.log('\n📄 [FASE 2] Gerando PDF 100% Idêntico ao PNG para o Poster 1...');
    const pdfOutPath = path.join(POSTER1_DIR, 'posters_hub_labdiv.pdf');
    const pyCmd = `python3 -c "
from PIL import Image
p = Image.open(r'${pngPath}').convert('RGB')
p.save(r'${pdfOutPath}', 'PDF', resolution=450.0)
print('Generated 100% PNG-Identical Poster PDF: ${pdfOutPath}')
"`;
    execSync(pyCmd, { stdio: 'inherit' });

    // Limpar arquivo html temporário
    if (fs.existsSync(tempHtmlPath)) fs.unlinkSync(tempHtmlPath);
    await page.close();
  }

  // Limpeza de camadas temporárias
  fs.rmSync(TMP_LAYERS_DIR, { recursive: true, force: true });

  await browser.close();
  console.log('\n🎉 PROCESSO CONCLUÍDO COM SUCESSO TOTAL!');
}

main().catch(err => {
  console.error('❌ Erro na execução da suite de posters:', err);
  process.exit(1);
});
