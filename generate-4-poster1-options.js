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
const POSTER1_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/posters/poster1');
const ARTIFACT_DIR = (process.env.ARTIFACTS_DIR || './artifacts');

// Template base com cabeçalho azul oficial e rodapé QR + Segurança preservados
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
       padding: 12px 30px; font-size: 19.5px; font-weight: 900; border-radius: 999px;
       margin-bottom: 22px; text-transform: uppercase; letter-spacing: 0.6px;
       box-shadow: 0 4px 14px rgba(0,0,0,0.14);
    }
    .p12-header h1 {
       font-size: 56px; font-weight: 900; line-height: 1.12; letter-spacing: -1.2px;
    }
    .p12-subline {
       font-size: 32px; font-weight: 800; margin-top: 18px; color: #FFCC00; line-height: 1.32; max-width: 630px;
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

    /* RODAPÉ: QR CODE E SEGURANÇA */
    .bottom-third-plane {
      position: absolute;
      bottom: 35px; left: 45px; right: 45px;
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
      font-size: 19px; font-weight: 800; color: #0F4780;
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
    .inst-action-tag { font-size: 15px; font-weight: 800; text-transform: uppercase; }
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
    <div class="bg-math-pattern"></div>
    <div class="p12-diagonal"></div>

    <div class="p12-content">
      <!-- CABEÇALHO ESQUERDO -->
      <div class="p12-header">
        <div class="p12-badge font-bukra">LABORATÓRIO DE EXPRESSÃO E DIVULGAÇÃO DO IFUSP</div>
        <h1 class="font-bukra">HUB LabDiv:<br>Conectando você à<br>universidade.</h1>
        <p class="p12-subline font-open-sans">Comunidade, conhecimento e ferramentas na palma da mão.</p>
      </div>

      <!-- COLUNA HERO DIREITA -->
      <div class="p12-right-hero-col">
        <div class="p12-icon-wrapper">
          <div class="p12-icon-inner">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="capTopGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F4780" />
      <stop offset="48%" stop-color="#F14343" />
      <stop offset="100%" stop-color="#FFCC00" />
    </linearGradient>

    <linearGradient id="capBaseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0F4780" />
      <stop offset="50%" stop-color="#F14343" />
      <stop offset="100%" stop-color="#FFCC00" />
    </linearGradient>

    <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0F4780" />
      <stop offset="25%" stop-color="#0284C7" />
      <stop offset="55%" stop-color="#F14343" />
      <stop offset="100%" stop-color="#FFCC00" />
    </linearGradient>
  </defs>

  <g stroke="url(#waveGradient)" stroke-width="26" stroke-linecap="round" fill="none">
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

  <g>
    <path d="M 120 300 L 120 355 C 120 430, 392 430, 392 355 L 392 300 Z" fill="url(#capBaseGradient)" />
    <path d="M 120 316 L 236 365 Q 256 375 276 365 L 392 316 L 392 334 L 276 375 Q 256 383 236 375 L 120 334 Z" fill="#000000" opacity="0.35" />
    <path d="M 120 300 L 120 355 C 120 430, 392 430, 392 355 L 392 300 Z" fill="none" stroke="#000000" stroke-width="10" stroke-linejoin="round" />
  </g>

  <g>
    <path d="M 276 175 L 456 260 Q 476 270 456 280 L 276 365 Q 256 375 236 365 L 56 280 Q 36 270 56 260 L 236 175 Q 256 165 276 175 Z" fill="url(#capTopGradient)" stroke="#000000" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" />
  </g>

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

  <path d="M 56 270 L 236 183 Q 256 173 276 183 L 456 270" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round" opacity="0.3" />
</svg>
          </div>
        </div>

        <div class="p12-icon-branding">
          <div class="p12-brand-title font-bukra">
            <span class="hub-white">HUB</span> <span class="labdiv-gradient">LabDiv</span>
          </div>
        </div>
      </div>

      <!-- MIOLO DOS EIXOS ESPECÍFICO DE CADA OPÇÃO -->
      ${middleHtml}

    </div> <!-- /p12-content -->

    <!-- RODAPÉ COM QR CODE E SEGURANÇA -->
    <div class="bottom-third-plane">
      <div class="bottom-qr-col">
        <div class="qr-code-box" style="border-color: #0F478040;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 39 39" shape-rendering="crispEdges"><path fill="#ffffff" d="M0 0h39v39H0z"/><path stroke="#000000" d="M1 1.5h7m1 0h2m1 0h1m1 0h1m3 0h2m2 0h1m2 0h1m1 0h1m1 0h1m1 0h7M1 2.5h1m5 0h1m1 0h3m1 0h2m4 0h1m1 0h5m2 0h2m1 0h1m5 0h1M1 3.5h1m1 0h3m1 0h1m1 0h4m2 0h1m1 0h1m1 0h1m2 0h4m2 0h1m2 0h1m1 0h3m1 0h1M1 4.5h1m1 0h3m1 0h1m2 0h1m1 0h3m1 0h1m2 0h1m5 0h3m3 0h1m1 0h3m1 0h1M1 5.5h1m1 0h3m1 0h1m2 0h1m1 0h2m4 0h5m1 0h1m1 0h2m3 0h1m1 0h3m1 0h1M1 6.5h1m5 0h1m1 0h1m1 0h1m1 0h1m2 0h5m2 0h1m2 0h4m1 0h1m5 0h1M1 7.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M9 8.5h1m2 0h4m2 0h4m1 0h1m1 0h1m1 0h1m1 0h1M3 9.5h3m1 0h1m1 0h1m1 0h1m2 0h1m2 0h1m2 0h1m1 0h1m1 0h1m5 0h3m2 0h3M3 10.5h1m1 0h1m2 0h1m3 0h3m1 0h1m1 0h1m1 0h1m4 0h2m2 0h1m2 0h1m3 0h1M1 11.5h2m4 0h1m2 0h1m5 0h2m2 0h10m1 0h7M2 12.5h3m3 0h1m4 0h1m1 0h2m2 0h2m1 0h2m1 0h1m1 0h2m2 0h2m3 0h2M1 13.5h1m2 0h7m4 0h1m5 0h1m2 0h1m1 0h6m1 0h1m1 0h3M1 14.5h2m2 0h1m2 0h2m1 0h1m1 0h3m1 0h2m1 0h4m1 0h1m3 0h2m1 0h1m1 0h2M1 15.5h2m4 0h1m2 0h3m1 0h2m2 0h4m1 0h2m1 0h4m1 0h2m1 0h1m2 0h1M4 16.5h2m2 0h1m2 0h2m1 0h1m2 0h5m1 0h1m4 0h1m3 0h1M1 17.5h3m1 0h1m1 0h1m1 0h1m2 0h3m2 0h1m3 0h1m2 0h1m1 0h1m1 0h1m2 0h1m1 0h1m1 0h1m1 0h1M1 18.5h2m2 0h1m3 0h3m4 0h2m1 0h1m2 0h3m4 0h1m2 0h1m2 0h1M1 19.5h2m1 0h1m2 0h2m3 0h1m3 0h5m1 0h1m5 0h1m1 0h1m1 0h1m3 0h2M3 20.5h4m1 0h1m1 0h3m1 0h1m3 0h1m1 0h6m2 0h2m1 0h1m4 0h2M1 21.5h1m1 0h1m1 0h1m1 0h1m3 0h4m2 0h1m3 0h6m1 0h1m2 0h5M3 22.5h2m1 0h1m1 0h4m1 0h1m3 0h2m2 0h1m1 0h1m1 0h2m5 0h1m1 0h1m1 0h1M1 23.5h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h1m2 0h1m2 0h1m2 0h2m2 0h3m2 0h1m2 0h4M2 24.5h1m3 0h1m1 0h1m1 0h7m1 0h1m1 0h1m2 0h1m2 0h1m3 0h3m3 0h2M3 25.5h1m1 0h4m1 0h3m2 0h1m1 0h5m2 0h2m1 0h1m2 0h2m1 0h3M1 26.5h2m1 0h1m1 0h1m3 0h1m2 0h1m2 0h1m1 0h2m1 0h1m4 0h1m2 0h1m2 0h1M1 27.5h1m1 0h5m3 0h1m2 0h3m1 0h1m2 0h5m2 0h2m1 0h1m4 0h2M1 28.5h1m2 0h3m2 0h2m1 0h1m2 0h3m2 0h1m2 0h2m5 0h1m1 0h2M1 29.5h1m1 0h1m1 0h1m1 0h1m1 0h4m2 0h6m1 0h16M9 30.5h3m1 0h6m2 0h1m1 0h2m1 0h4m3 0h1M1 31.5h7m3 0h2m1 0h1m2 0h1m1 0h1m1 0h2m2 0h3m1 0h1m1 0h1m1 0h2m1 0h2M1 32.5h1m5 0h1m3 0h3m1 0h1m1 0h4m2 0h1m5 0h1m3 0h1m2 0h2M1 33.5h1m1 0h3m1 0h1m1 0h1m2 0h2m1 0h1m2 0h1m1 0h1m2 0h1m2 0h8m1 0h3M1 34.5h1m1 0h3m1 0h1m1 0h1m3 0h6m1 0h2m1 0h1m1 0h5m1 0h1m1 0h1m1 0h1M1 35.5h1m1 0h3m1 0h1m1 0h2m1 0h1m1 0h1m1 0h4m3 0h1m2 0h2m1 0h2m1 0h1m1 0h1m2 0h1M1 36.5h1m5 0h1m3 0h2m3 0h3m1 0h1m1 0h1m2 0h1m1 0h4m1 0h2m3 0h1M1 37.5h7m3 0h2m1 0h8m1 0h1m1 0h3m2 0h2m2 0h4"/></svg>
          <div class="qr-center-badge-img">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="qrCapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#0F4780" />
      <stop offset="48%" stop-color="#F14343" />
      <stop offset="100%" stop-color="#FFCC00" />
    </linearGradient>
  </defs>
  <g stroke="url(#qrCapGrad)" stroke-width="26" stroke-linecap="round" fill="none">
    <path d="M 53 225 C 27 168 27 104 53 50" />
    <path d="M 94 196 C 72 157 72 109 94 72" />
    <path d="M 138 183 C 120 153 120 118 138 88" />
    <path d="M 210 110 C 235 92 277 92 302 110" />
    <path d="M 238 146 C 248 136 264 136 274 146" />
    <path d="M 374 183 C 392 153 392 118 374 88" />
    <path d="M 418 196 C 440 157 440 109 418 72" />
    <path d="M 459 225 C 485 168 485 104 459 50" />
  </g>
  <g>
    <path d="M 120 300 L 120 355 C 120 430, 392 430, 392 355 L 392 300 Z" fill="url(#qrCapGrad)" />
  </g>
  <g>
    <path d="M 276 175 L 456 260 Q 476 270 456 280 L 276 365 Q 256 375 236 365 L 56 280 Q 36 270 56 260 L 236 175 Q 256 165 276 175 Z" fill="url(#qrCapGrad)" stroke="#000000" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" />
  </g>
</svg>
          </div>
        </div>
        <a class="qr-clean-link font-bukra" href="https://hub-lab-div.vercel.app/divulgacao">hub-lab-div.vercel.app/divulgacao</a>
      </div>
    
      <div class="bottom-inst-box">
        <div>
          <div class="inst-badge-line font-bukra">
            <div class="inst-badge-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <span>SEGURANÇA &amp; CONFORMIDADE LEGAL</span>
          </div>
          <p class="inst-desc-text font-open-sans">
            <span style="white-space: nowrap;">O <strong>HUB LabDiv</strong> respeita as <strong>leis, normas e decisões judiciais do Brasil</strong>,</span><br>
            além de ter todo o seu <strong>código aberto</strong> e um e-mail para <strong>suporte, sugestões e ideias da comunidade</strong>.
          </p>
        </div>

        <div class="inst-actions-row font-bukra">
          <div class="inst-action-card">
            <div class="inst-action-icon git-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
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
}

// --------------------------------------------------------------------------------------
// POSTER ORIGINAL: 3 CARDS ESCALONADOS (SEM BOTÕES NOS CARDS 1 E 3, FONTES AMPLIADAS)
// --------------------------------------------------------------------------------------
function buildPosterStandard() {
  const middleCss = `
    .eixos-master-container {
      position: absolute;
      left: 45px;
      right: 45px;
      bottom: 434px; /* 1320px */
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      align-items: flex-end;
      z-index: 28;
    }

    .eixo-card {
      background: #FFFFFF;
      border-radius: 26px;
      box-shadow: 0 16px 42px rgba(15, 71, 128, 0.12), 0 2px 8px rgba(0, 0, 0, 0.04);
      padding: 26px 22px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      box-sizing: border-box;
      overflow: hidden;
    }

    /* CARD 1 (SOCIAL): 630px de altura */
    .ec-1 {
      height: 630px;
      border: 2px solid rgba(15, 71, 128, 0.35);
    }

    /* CARD 2 (INFORMATIVO): 505px de altura */
    .ec-2 {
      height: 505px;
      border: 2px solid rgba(241, 67, 67, 0.35);
      padding: 24px 22px;
    }

    /* CARD 3 (FERRAMENTAS): 385px de altura */
    .ec-3 {
      height: 385px;
      border: 2.5px solid rgba(255, 204, 0, 0.6);
      padding: 14px 18px 10px 18px;
    }

    .ec-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
    }
    .ec-3 .ec-header { margin-bottom: 6px; }

    .ec-badge {
      font-size: 15px; font-weight: 900; text-transform: uppercase;
      padding: 5px 12px; border-radius: 8px; letter-spacing: 0.4px;
    }
    .ec-3 .ec-badge { font-size: 13.5px; padding: 4px 10px; }
    .ecb-blue { background: #EEF4FA; color: #0F4780; }
    .ecb-red { background: #FEF2F2; color: #F14343; }
    .ecb-yellow { background: #FEF9C3; color: #854D0E; }

    .ec-status {
      display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 800; color: #10B981;
    }
    .ec-3 .ec-status { font-size: 13px; }
    .ec-status-dot { width: 9px; height: 9px; border-radius: 50%; background: #10B981; }

    .ec-title {
      font-size: 40px; font-weight: 900; line-height: 1.1; color: #0F172A; margin-bottom: 6px;
    }
    .ec-2 .ec-title { font-size: 36px; }
    .ec-3 .ec-title { font-size: 28px; margin-bottom: 2px; }

    .ec-subtitle {
      font-size: 23px; font-weight: 700; color: #475569; line-height: 1.34; margin-bottom: 26px;
    }
    .ec-2 .ec-subtitle { font-size: 21px; margin-bottom: 18px; }
    .ec-3 .ec-subtitle { font-size: 16.5px; margin-bottom: 10px; line-height: 1.25; }

    .ec-points { display: flex; flex-direction: column; gap: 24px; }
    .ec-2 .ec-points { gap: 18px; }
    .ec-3 .ec-points { gap: 8px; }

    .ec-point {
      display: flex; align-items: flex-start; gap: 12px; font-size: 22.5px; line-height: 1.45; color: #1E293B;
    }
    .ec-2 .ec-point { font-size: 20px; line-height: 1.4; }
    .ec-3 .ec-point { font-size: 16.5px; line-height: 1.28; gap: 10px; }

    .ec-point strong { font-weight: 800; color: #0F172A; font-size: 23.5px; }
    .ec-2 .ec-point strong { font-size: 21px; }
    .ec-3 .ec-point strong { font-size: 17px; }

    .ec-icon-bullet {
      width: 26px; height: 26px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 4px; font-weight: 900; font-size: 15px;
    }
    .ec-3 .ec-icon-bullet { width: 20px; height: 20px; font-size: 12px; margin-top: 2px; }
  `;

  const middleHtml = `
    <!-- CONTEÚDO CENTRAL: 3 EIXOS NA ÁREA BRANCA (SEM BOTÕES NOS CARDS 1 E 3, FONTES AMPLIADAS, 3 TÓPICOS POR EIXO) -->
    <div class="eixos-master-container font-open-sans">
      <!-- Coluna 1: Comunidade (Social) -->
      <div class="eixo-card ec-1">
        <div class="ec-header font-bukra">
          <span class="ec-badge ecb-blue">EIXO 1 &bull; SOCIAL</span>
          <div class="ec-status"><div class="ec-status-dot"></div> ONLINE</div>
        </div>
        <h2 class="ec-title font-bukra">Comunidade</h2>
        <p class="ec-subtitle">Comunicação dialógica e permanência estudantil</p>

        <div class="ec-points">
          <div class="ec-point">
            <div class="ec-icon-bullet ecb-blue font-bukra">&bull;</div>
            <div><strong>Fluxo:</strong> feed científico dialógico com balões freirianos de afeto e escuta.</div>
          </div>
          <div class="ec-point">
            <div class="ec-icon-bullet ecb-blue font-bukra">&bull;</div>
            <div><strong>Registros:</strong> diários discentes de permanência, vivências e acolhimento humano.</div>
          </div>
          <div class="ec-point">
            <div class="ec-icon-bullet ecb-blue font-bukra">&bull;</div>
            <div><strong>Galeria:</strong> vitrine de astrofotografia, ilustrações científicas e arte autoral.</div>
          </div>
        </div>
      </div>

      <!-- Coluna 2: CGIF & Wiki (Informativo) -->
      <div class="eixo-card ec-2">
        <div class="ec-header font-bukra">
          <span class="ec-badge ecb-red">EIXO 2 &bull; INFORMATIVO</span>
          <div class="ec-status"><div class="ec-status-dot"></div> OFICIAL</div>
        </div>
        <h2 class="ec-title font-bukra">CGIF &amp; Wiki</h2>
        <p class="ec-subtitle">Central de conhecimento e memória do IFUSP</p>

        <div class="ec-points">
          <div class="ec-point">
            <div class="ec-icon-bullet ecb-red font-bukra">&bull;</div>
            <div><strong>Wiki Oficial:</strong> manuais de curso, PPPs consolidados e resoluções do IFUSP.</div>
          </div>
          <div class="ec-point">
            <div class="ec-icon-bullet ecb-red font-bukra">&bull;</div>
            <div><strong>Oportunidades:</strong> mural em tempo real de bolsas PUB, vagas de IC e estágios.</div>
          </div>
          <div class="ec-point">
            <div class="ec-icon-bullet ecb-red font-bukra">&bull;</div>
            <div><strong>Interativo:</strong> mapa do campus, salas de aula, 120+ docentes e laboratórios.</div>
          </div>
        </div>
      </div>

      <!-- Coluna 3: Ferramentas -->
      <div class="eixo-card ec-3">
        <div class="ec-header font-bukra">
          <span class="ec-badge ecb-yellow">EIXO 3 &bull; FERRAMENTAS</span>
          <div class="ec-status"><div class="ec-status-dot"></div> ÚTIL</div>
        </div>
        <h2 class="ec-title font-bukra">Ferramentas</h2>
        <p class="ec-subtitle">Produtividade acadêmica e apoio aos estudos</p>

        <div class="ec-points">
          <div class="ec-point">
            <div class="ec-icon-bullet ecb-yellow font-bukra">&bull;</div>
            <div><strong>Grade Horária (1h:1h):</strong> 1h aula = 1h estudo com controle semanal de faltas.</div>
          </div>
          <div class="ec-point">
            <div class="ec-icon-bullet ecb-yellow font-bukra">&bull;</div>
            <div><strong>Horas AEx &amp; Trilhas:</strong> calculadora curricular dos 10% de extensão do IFUSP.</div>
          </div>
          <div class="ec-point">
            <div class="ec-icon-bullet ecb-yellow font-bukra">&bull;</div>
            <div><strong>Match Acadêmico:</strong> conexão direta com orientadores de IC do instituto.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Poster 1: Eixos na Área Branca',
    middleCss,
    middleHtml
  });
}

// --------------------------------------------------------------------------------------
// OPÇÃO 1 BENTO: TOTALMENTE FORA DE CARDS (SEM BOTÕES NOS CARDS 1 E 3, FONTES AMPLIADAS)
// --------------------------------------------------------------------------------------
function buildOpcao4Aberto() {
  const middleCss = `
    .open-container {
      position: absolute;
      left: 45px; right: 45px;
      bottom: 434px; /* 1320px */
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 36px;
      align-items: flex-end;
      z-index: 28;
    }
    .open-col {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      box-sizing: border-box;
      background: transparent;
      padding: 0 4px;
    }
    .oc-1 { height: 610px; }
    .oc-2 { height: 505px; }
    .oc-3 { height: 385px; }

    .open-hero-number {
      font-size: 72px; font-weight: 900; line-height: 0.9; letter-spacing: -2.5px;
    }
    .oc-3 .open-hero-number { font-size: 44px; }
    .on-blue { color: #0F4780; }
    .on-red { color: #F14343; }
    .on-yellow { color: #D97706; }

    .open-accent-bar {
      width: 65px; height: 5px; border-radius: 999px; margin: 8px 0 14px 0;
    }
    .oc-3 .open-accent-bar { width: 50px; height: 4px; margin: 3px 0 6px 0; }
    .oab-blue { background: #0F4780; }
    .oab-red { background: #F14343; }
    .oab-yellow { background: #FFCC00; }

    .open-axis-tag {
      font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; display: inline-block;
    }
    .oc-3 .open-axis-tag { font-size: 13px; margin-bottom: 2px; }
    .oat-blue { color: #0F4780; }
    .oat-red { color: #F14343; }
    .oat-yellow { color: #854D0E; }

    .open-title {
      font-size: 44px; font-weight: 900; color: #0F172A; line-height: 1.1; margin-bottom: 6px;
    }
    .oc-2 .open-title { font-size: 38px; }
    .oc-3 .open-title { font-size: 28px; margin-bottom: 2px; }

    .open-sub {
      font-size: 23px; color: #475569; font-weight: 700; line-height: 1.34; margin-bottom: 26px;
    }
    .oc-2 .open-sub { font-size: 20.5px; margin-bottom: 18px; }
    .oc-3 .open-sub { font-size: 16px; margin-bottom: 8px; line-height: 1.25; }

    .open-list {
      display: flex; flex-direction: column; gap: 22px;
    }
    .oc-2 .open-list { gap: 16px; }
    .oc-3 .open-list { gap: 7px; }

    .open-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding-bottom: 14px; border-bottom: 1.5px solid rgba(148, 163, 184, 0.25);
    }
    .oc-2 .open-item { padding-bottom: 10px; }
    .oc-3 .open-item { padding-bottom: 5px; gap: 8px; }
    .open-item:last-child { border-bottom: none; }

    .open-dot {
      width: 12px; height: 12px; border-radius: 50%; margin-top: 8px; flex-shrink: 0;
    }
    .oc-3 .open-dot { width: 9px; height: 9px; margin-top: 5px; }

    .open-item-title {
      font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1.25;
    }
    .oc-2 .open-item-title { font-size: 21.5px; }
    .oc-3 .open-item-title { font-size: 17.5px; }

    .open-item-desc {
      font-size: 20px; color: #475569; font-weight: 600; line-height: 1.36; margin-top: 3px;
    }
    .oc-2 .open-item-desc { font-size: 18px; }
    .oc-3 .open-item-desc { font-size: 15px; line-height: 1.25; margin-top: 1px; }
  `;

  const middleHtml = `
    <!-- OPÇÃO 1 BENTO / ABERTO: TOTALMENTE FORA DE CARDS (SEM BOTÕES, FONTES AMPLIADAS, 3 TÓPICOS) -->
    <div class="open-container font-open-sans">
      <!-- Coluna 1: Social Aberto (610px) -->
      <div class="open-col oc-1">
        <div class="open-hero-number on-blue font-bukra">01</div>
        <div class="open-accent-bar oab-blue"></div>
        <span class="open-axis-tag oat-blue font-bukra">EIXO 1 &bull; SOCIAL</span>
        <h2 class="open-title font-bukra">Comunidade</h2>
        <p class="open-sub">Espaço vivo de diálogo e permanência estudantil</p>

        <div class="open-list">
          <div class="open-item">
            <div class="open-dot" style="background: #0F4780;"></div>
            <div>
              <div class="open-item-title font-bukra">Fluxo Científico</div>
              <div class="open-item-desc">Postagens dialógicas e balões freirianos de afeto e escuta ativa.</div>
            </div>
          </div>
          <div class="open-item">
            <div class="open-dot" style="background: #0F4780;"></div>
            <div>
              <div class="open-item-title font-bukra">Registros Discentes</div>
              <div class="open-item-desc">Diários de permanência, relatos reais e acolhimento humano no IFUSP.</div>
            </div>
          </div>
          <div class="open-item">
            <div class="open-dot" style="background: #0F4780;"></div>
            <div>
              <div class="open-item-title font-bukra">Galeria de Artes</div>
              <div class="open-item-desc">Vitrine de astrofotografia, ilustrações científicas e arte autoral.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coluna 2: Informativo Aberto (505px) -->
      <div class="open-col oc-2">
        <div class="open-hero-number on-red font-bukra">02</div>
        <div class="open-accent-bar oab-red"></div>
        <span class="open-axis-tag oat-red font-bukra">EIXO 2 &bull; INFORMATIVO</span>
        <h2 class="open-title font-bukra">CGIF &amp; Wiki</h2>
        <p class="open-sub">Memória histórica e normas consolidadas</p>

        <div class="open-list">
          <div class="open-item">
            <div class="open-dot" style="background: #F14343;"></div>
            <div>
              <div class="open-item-title font-bukra">Wiki &amp; Editais Oficiais</div>
              <div class="open-item-desc">PPPs, manuais de matrícula e resoluções unificadas do instituto.</div>
            </div>
          </div>
          <div class="open-item">
            <div class="open-dot" style="background: #F14343;"></div>
            <div>
              <div class="open-item-title font-bukra">Mural de Oportunidades</div>
              <div class="open-item-desc">Catálogo em tempo real de bolsas PUB, vagas de IC e estágios.</div>
            </div>
          </div>
          <div class="open-item">
            <div class="open-dot" style="background: #F14343;"></div>
            <div>
              <div class="open-item-title font-bukra">Mapa &amp; 120+ Docentes</div>
              <div class="open-item-desc">Localização de salas de aula, laboratórios e contatos diretos.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Coluna 3: Ferramentas Aberto (385px) -->
      <div class="open-col oc-3">
        <div class="open-hero-number on-yellow font-bukra">03</div>
        <div class="open-accent-bar oab-yellow"></div>
        <span class="open-axis-tag oat-yellow font-bukra">EIXO 3 &bull; FERRAMENTAS</span>
        <h2 class="open-title font-bukra">Ferramentas</h2>
        <p class="open-sub">Aceleradores para o dia a dia acadêmico</p>

        <div class="open-list">
          <div class="open-item">
            <div class="open-dot" style="background: #FFCC00;"></div>
            <div>
              <div class="open-item-title font-bukra">Grade Horária (1h:1h)</div>
              <div class="open-item-desc">1h aula = 1h estudo com controle semanal de faltas.</div>
            </div>
          </div>
          <div class="open-item">
            <div class="open-dot" style="background: #FFCC00;"></div>
            <div>
              <div class="open-item-title font-bukra">Horas AEx &amp; Trilhas</div>
              <div class="open-item-desc">Rastreamento curricular dos 10% de extensão do IFUSP.</div>
            </div>
          </div>
          <div class="open-item">
            <div class="open-dot" style="background: #FFCC00;"></div>
            <div>
              <div class="open-item-title font-bukra">Match Acadêmico</div>
              <div class="open-item-desc">Conexão direta com orientadores de IC do instituto.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 1 Bento / Aberto: Tipografia Sem Cards',
    middleCss,
    middleHtml
  });
}

// --------------------------------------------------------------------------------------
// OPÇÃO 2 BROWSER: JANELAS WEB OS (SEM BOTÕES NOS CARDS 1 E 3, FONTES AMPLIADAS)
// --------------------------------------------------------------------------------------
function buildOpcao2Ampliado() {
  const middleCss = `
    .browser-master-container {
      position: absolute;
      left: 45px; right: 45px;
      bottom: 434px; /* 1320px */
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
    .bw-1 { height: 630px; border-color: rgba(15, 71, 128, 0.4); }
    .bw-2 { height: 505px; border-color: rgba(241, 67, 67, 0.4); }
    .bw-3 { height: 385px; border-color: rgba(255, 204, 0, 0.6); }

    .bw-top-bar {
      background: #F1F5F9; border-bottom: 1.5px solid #E2E8F0;
      padding: 10px 14px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .bw-dots { display: flex; gap: 6px; }
    .bw-dot { width: 11px; height: 11px; border-radius: 50%; }
    .dot-close { background: #EF4444; }
    .dot-min { background: #F59E0B; }
    .dot-max { background: #10B981; }

    .bw-url-pill {
      background: #FFFFFF; border: 1px solid #CBD5E1; border-radius: 999px;
      padding: 3px 12px; font-size: 13.5px; font-weight: 700; color: #475569;
      display: flex; align-items: center; gap: 5px;
    }

    .bw-body {
      padding: 18px 18px 12px 18px; flex: 1; display: flex; flex-direction: column; justify-content: flex-start;
    }
    .bw-2 .bw-body { padding: 12px 15px 8px 15px; }
    .bw-3 .bw-body { padding: 10px 14px 6px 14px; }

    .bw-tag { font-size: 14.5px; font-weight: 900; text-transform: uppercase; margin-bottom: 3px; display: inline-block; }
    .bw-2 .bw-tag { font-size: 13.5px; margin-bottom: 2px; }
    .bw-3 .bw-tag { font-size: 12.5px; margin-bottom: 2px; }

    .bw-h2 { font-size: 38px; font-weight: 900; color: #0F172A; line-height: 1.15; margin-bottom: 3px; }
    .bw-2 .bw-h2 { font-size: 32px; margin-bottom: 2px; }
    .bw-3 .bw-h2 { font-size: 27px; margin-bottom: 2px; }

    .bw-desc { font-size: 21.5px; color: #475569; font-weight: 700; line-height: 1.32; margin-bottom: 16px; }
    .bw-2 .bw-desc { font-size: 18px; margin-bottom: 10px; line-height: 1.25; }
    .bw-3 .bw-desc { font-size: 16px; margin-bottom: 8px; line-height: 1.25; }

    .bw-item-card {
      background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px;
      padding: 11px 14px; margin-bottom: 12px;
    }
    .bw-2 .bw-item-card { padding: 8px 11px; margin-bottom: 7px; }
    .bw-3 .bw-item-card { padding: 6px 10px; margin-bottom: 6px; }

    .bw-item-title { font-size: 20.5px; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 8px; }
    .bw-2 .bw-item-title { font-size: 17.5px; }
    .bw-3 .bw-item-title { font-size: 16.5px; }

    .bw-item-detail { font-size: 17.5px; color: #475569; font-weight: 600; line-height: 1.3; margin-top: 2px; }
    .bw-2 .bw-item-detail { font-size: 15px; line-height: 1.25; margin-top: 1px; }
    .bw-3 .bw-item-detail { font-size: 14px; line-height: 1.25; margin-top: 2px; }
  `;

  const middleHtml = `
    <!-- OPÇÃO 2: JANELAS WEB OS (SEM BOTÕES NOS CARDS 1 E 3, FONTES AMPLIADAS, 3 TÓPICOS) -->
    <div class="browser-master-container font-open-sans">
      <!-- Janela 1: /comunidade (630px) -->
      <div class="browser-window bw-1">
        <div class="bw-top-bar">
          <div class="bw-dots">
            <div class="bw-dot dot-close"></div>
            <div class="bw-dot dot-min"></div>
            <div class="bw-dot dot-max"></div>
          </div>
          <div class="bw-url-pill font-open-sans">🔒 hub.usp.br/comunidade</div>
          <div style="font-size: 13px; font-weight: 900; color: #0F4780;">EIXO 1</div>
        </div>
        <div class="bw-body">
          <span class="bw-tag font-bukra" style="color: #0F4780;">SOCIAL &bull; DIÁLOGO</span>
          <h2 class="bw-h2 font-bukra">Comunidade</h2>
          <p class="bw-desc">Espaço vivo de permanência estudantil</p>

          <div class="bw-item-card" style="border-left: 5px solid #0F4780;">
            <div class="bw-item-title"><span>📱</span> Fluxo Científico</div>
            <div class="bw-item-detail">Feed vivo e balões freirianos com debates de escuta e afeto.</div>
          </div>
          <div class="bw-item-card" style="border-left: 5px solid #0F4780;">
            <div class="bw-item-title"><span>💬</span> Registros Discentes</div>
            <div class="bw-item-detail">Diários de permanência, relatos reais e acolhimento humano.</div>
          </div>
          <div class="bw-item-card" style="border-left: 5px solid #0F4780;">
            <div class="bw-item-title"><span>🎨</span> Galeria Visual</div>
            <div class="bw-item-detail">Astrofotografia, ilustrações científicas e produção artística.</div>
          </div>
        </div>
      </div>

      <!-- Janela 2: /cgif (505px) -->
      <div class="browser-window bw-2">
        <div class="bw-top-bar">
          <div class="bw-dots">
            <div class="bw-dot dot-close"></div>
            <div class="bw-dot dot-min"></div>
            <div class="bw-dot dot-max"></div>
          </div>
          <div class="bw-url-pill font-open-sans">🔒 hub.usp.br/cgif-wiki</div>
          <div style="font-size: 13px; font-weight: 900; color: #F14343;">EIXO 2</div>
        </div>
        <div class="bw-body">
          <span class="bw-tag font-bukra" style="color: #F14343;">INFORMATIVO &bull; OFICIAL</span>
          <h2 class="bw-h2 font-bukra">CGIF &amp; Wiki</h2>
          <p class="bw-desc">Enciclopédia acadêmica do IFUSP</p>

          <div class="bw-item-card" style="border-left: 5px solid #F14343;">
            <div class="bw-item-title"><span>📚</span> Wiki Oficial</div>
            <div class="bw-item-detail">Manuais de curso, PPPs consolidados e regimentos do IFUSP.</div>
          </div>
          <div class="bw-item-card" style="border-left: 5px solid #F14343;">
            <div class="bw-item-title"><span>🎓</span> Mural de Oportunidades</div>
            <div class="bw-item-detail">Catálogo em tempo real de bolsas PUB, IC e estágios.</div>
          </div>
          <div class="bw-item-card" style="border-left: 5px solid #F14343;">
            <div class="bw-item-title"><span>🏛️</span> Mapa &amp; Salas</div>
            <div class="bw-item-detail">Localização de salas de aula, 120+ docentes e laboratórios.</div>
          </div>
        </div>
      </div>

      <!-- Janela 3: /ferramentas (385px) -->
      <div class="browser-window bw-3">
        <div class="bw-top-bar" style="padding: 7px 12px;">
          <div class="bw-dots">
            <div class="bw-dot dot-close"></div>
            <div class="bw-dot dot-min"></div>
            <div class="bw-dot dot-max"></div>
          </div>
          <div class="bw-url-pill font-open-sans" style="font-size: 12px; padding: 2px 8px;">🔒 hub.usp.br/apps</div>
          <div style="font-size: 12px; font-weight: 900; color: #854D0E;">EIXO 3</div>
        </div>
        <div class="bw-body">
          <span class="bw-tag font-bukra" style="color: #854D0E;">FERRAMENTAS &bull; ROTINA</span>
          <h2 class="bw-h2 font-bukra">Ferramentas</h2>
          <p class="bw-desc">Apoio diário à pesquisa e aulas</p>

          <div class="bw-item-card" style="border-left: 4.5px solid #FFCC00;">
            <div class="bw-item-title"><span>⏱️</span> Grade Horária (1h:1h)</div>
            <div class="bw-item-detail">1h aula = 1h estudo com controle semanal de faltas.</div>
          </div>
          <div class="bw-item-card" style="border-left: 4.5px solid #FFCC00;">
            <div class="bw-item-title"><span>📊</span> Horas AEx &amp; Trilhas</div>
            <div class="bw-item-detail">Calculadora curricular dos 10% de extensão do IFUSP.</div>
          </div>
          <div class="bw-item-card" style="border-left: 4.5px solid #FFCC00;">
            <div class="bw-item-title"><span>🤝</span> Match Acadêmico</div>
            <div class="bw-item-detail">Conexão direta com orientadores de IC do instituto.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 2: Janelas Web OS (Sem Botões, Fontes Ampliadas)',
    middleCss,
    middleHtml
  });
}

// --------------------------------------------------------------------------------------
// OPÇÃO 3 MÉTRICAS: PAINÉIS EDITORIAIS COM MÉTRICAS (SEM BOTÕES, FONTES AMPLIADAS)
// --------------------------------------------------------------------------------------
function buildOpcao3Ampliado() {
  const middleCss = `
    .stats-master-container {
      position: absolute;
      left: 45px; right: 45px;
      bottom: 434px; /* 1320px */
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      align-items: flex-end;
      z-index: 28;
    }
    .stat-card {
      background: #FFFFFF;
      border-radius: 26px;
      padding: 26px 22px;
      box-shadow: 0 16px 40px rgba(15, 71, 128, 0.12), 0 2px 8px rgba(0,0,0,0.04);
      border: 2px solid #CBD5E1;
      display: flex; flex-direction: column; justify-content: flex-start;
      box-sizing: border-box;
      overflow: hidden;
    }
    .sc-1 { height: 630px; border-color: rgba(15, 71, 128, 0.4); }
    .sc-2 { height: 505px; border-color: rgba(241, 67, 67, 0.4); padding: 18px 22px 14px 22px; }
    .sc-3 { height: 385px; border-color: rgba(255, 204, 0, 0.6); padding: 12px 18px 8px 18px; }

    .stat-hero-number {
      font-size: 64px; font-weight: 900; line-height: 0.95; letter-spacing: -2px; margin-bottom: 2px;
    }
    .sc-2 .stat-hero-number { font-size: 56px; margin-bottom: 1px; }
    .sc-3 .stat-hero-number { font-size: 42px; margin-bottom: 0px; }
    .sn-blue { color: #0F4780; }
    .sn-red { color: #F14343; }
    .sn-yellow { color: #D97706; }

    .stat-hero-label {
      font-size: 15px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px;
    }
    .sc-2 .stat-hero-label { font-size: 13.5px; margin-bottom: 8px; }
    .sc-3 .stat-hero-label { font-size: 13px; margin-bottom: 6px; }
    .sl-blue { color: #0F4780; }
    .sl-red { color: #F14343; }
    .sl-yellow { color: #854D0E; }

    .stat-divider { width: 100%; height: 2.5px; background: #F1F5F9; margin-bottom: 14px; }
    .sc-2 .stat-divider { margin-bottom: 8px; }
    .sc-3 .stat-divider { margin-bottom: 6px; }

    .stat-h2 { font-size: 40px; font-weight: 900; color: #0F172A; line-height: 1.15; margin-bottom: 4px; }
    .sc-2 .stat-h2 { font-size: 33px; margin-bottom: 2px; }
    .sc-3 .stat-h2 { font-size: 27px; margin-bottom: 2px; }

    .stat-sub { font-size: 23px; color: #475569; font-weight: 700; line-height: 1.34; margin-bottom: 26px; }
    .sc-2 .stat-sub { font-size: 18.5px; margin-bottom: 12px; line-height: 1.25; }
    .sc-3 .stat-sub { font-size: 16px; margin-bottom: 8px; line-height: 1.25; }

    .stat-list { display: flex; flex-direction: column; gap: 24px; }
    .sc-2 .stat-list { gap: 10px; }
    .sc-3 .stat-list { gap: 7px; }

    .stat-item {
      display: flex; align-items: flex-start; gap: 10px; font-size: 22.5px; line-height: 1.45; color: #1E293B;
    }
    .sc-2 .stat-item { font-size: 18px; line-height: 1.32; }
    .sc-3 .stat-item { font-size: 16.5px; line-height: 1.28; }

    .stat-item strong { font-weight: 800; color: #0F172A; font-size: 23.5px; }
    .sc-2 .stat-item strong { font-size: 19px; }
    .sc-3 .stat-item strong { font-size: 17px; }

    .stat-bullet { font-weight: 900; font-size: 22px; line-height: 1; margin-top: 2px; }
    .sc-2 .stat-bullet { font-size: 19px; }
    .sc-3 .stat-bullet { font-size: 18px; margin-top: 1px; }
  `;

  const middleHtml = `
    <!-- OPÇÃO 3: PAINÉIS EDITORIAIS COM MÉTRICAS (SEM BOTÕES, FONTES AMPLIADAS, 3 TÓPICOS) -->
    <div class="stats-master-container font-open-sans">
      <!-- Card 1: Social Stat (630px) -->
      <div class="stat-card sc-1">
        <div class="stat-hero-number sn-blue font-bukra">01</div>
        <div class="stat-hero-label sl-blue font-bukra">EIXO SOCIAL &bull; FLUXO VIVO</div>
        <div class="stat-divider"></div>

        <h2 class="stat-h2 font-bukra">Comunidade</h2>
        <p class="stat-sub">Permanência estudantil e acolhimento dialógico</p>

        <div class="stat-list">
          <div class="stat-item">
            <span class="stat-bullet sn-blue">&bull;</span>
            <div><strong>Fluxo:</strong> feed científico com postagens e balões freirianos de afeto e escuta.</div>
          </div>
          <div class="stat-item">
            <span class="stat-bullet sn-blue">&bull;</span>
            <div><strong>Registros:</strong> diários discentes de permanência, relatos reais e acolhimento.</div>
          </div>
          <div class="stat-item">
            <span class="stat-bullet sn-blue">&bull;</span>
            <div><strong>Galeria:</strong> vitrine de astrofotografia, ilustrações científicas e arte autoral.</div>
          </div>
        </div>
      </div>

      <!-- Card 2: Informativo Stat (505px) -->
      <div class="stat-card sc-2">
        <div class="stat-hero-number sn-red font-bukra">120+</div>
        <div class="stat-hero-label sl-red font-bukra">DOCENTES, SALAS &amp; BOLSAS</div>
        <div class="stat-divider"></div>

        <h2 class="stat-h2 font-bukra">CGIF &amp; Wiki</h2>
        <p class="stat-sub">Memória histórica e normas consolidadas</p>

        <div class="stat-list">
          <div class="stat-item">
            <span class="stat-bullet sn-red">&bull;</span>
            <div><strong>Wiki Oficial:</strong> manuais, PPPs unificados e editais oficiais do IFUSP.</div>
          </div>
          <div class="stat-item">
            <span class="stat-bullet sn-red">&bull;</span>
            <div><strong>Oportunidades:</strong> mural em tempo real de bolsas PUB, vagas de IC e estágios.</div>
          </div>
          <div class="stat-item">
            <span class="stat-bullet sn-red">&bull;</span>
            <div><strong>Interativo:</strong> mapa do campus, salas de aula, 120+ docentes e laboratórios.</div>
          </div>
        </div>
      </div>

      <!-- Card 3: Ferramentas Stat (385px) -->
      <div class="stat-card sc-3">
        <div class="stat-hero-number sn-yellow font-bukra">10%</div>
        <div class="stat-hero-label sl-yellow font-bukra">AEX &bull; EXTENSÃO CURRICULAR</div>
        <div class="stat-divider"></div>

        <h2 class="stat-h2 font-bukra">Ferramentas</h2>
        <p class="stat-sub">Produtividade acadêmica e apoio aos estudos</p>

        <div class="stat-list">
          <div class="stat-item">
            <span class="stat-bullet sn-yellow">&bull;</span>
            <div><strong>Grade 1h:1h:</strong> 1h aula = 1h estudo com controle inteligente de faltas.</div>
          </div>
          <div class="stat-item">
            <span class="stat-bullet sn-yellow">&bull;</span>
            <div><strong>Horas AEx (10%):</strong> calculadora curricular de extensão do IFUSP.</div>
          </div>
          <div class="stat-item">
            <span class="stat-bullet sn-yellow">&bull;</span>
            <div><strong>Match Acadêmico:</strong> conexão direta com orientadores de IC do instituto.</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 3: Painéis Editoriais & Métricas (Sem Botões, Fontes Ampliadas)',
    middleCss,
    middleHtml
  });
}

// -------------------------------------------------------------
// EXECUÇÃO DO RENDERIZADOR COM PUPPETEER
// -------------------------------------------------------------
async function renderAll() {
  const tasks = [
    {
      name: 'poster',
      pngFilename: 'poster.png',
      fn: buildPosterStandard,
      title: 'Poster Original (Cards Escalonados)'
    },
    {
      name: 'poster1_opcao1_bento',
      pngFilename: 'poster1_opcao1_bento.png',
      fn: buildOpcao4Aberto,
      title: 'Opção 1 Bento (Colunas Abertas Sem Cards)'
    },
    {
      name: 'poster1_opcao2_browser',
      pngFilename: 'poster1_opcao2_browser.png',
      fn: buildOpcao2Ampliado,
      title: 'Opção 2 Browser (Janelas Web OS)'
    },
    {
      name: 'poster1_opcao3_metricas',
      pngFilename: 'poster1_opcao3_metricas.png',
      fn: buildOpcao3Ampliado,
      title: 'Opção 3 Métricas (Painéis Editoriais)'
    }
  ];

  console.log('Iniciando Puppeteer para renderizar os 4 posters solicitados com fontes ampliadas e sem botões nos cards 1 e 3...');
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  for (const t of tasks) {
    const html = t.fn();
    const htmlPath = path.join(POSTER1_DIR, `${t.name}.temp.html`);
    const pngPath = path.join(POSTER1_DIR, t.pngFilename);
    const previewPath = path.join(ARTIFACT_DIR, `${t.name}_preview.png`);

    fs.writeFileSync(htmlPath, html, 'utf8');

    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
    await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({
      path: pngPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1240, height: 1754 }
    });

    // Salva cópia de preview no diretório de artefatos
    fs.copyFileSync(pngPath, previewPath);
    console.log(`✅ ${t.pngFilename} (${t.title}) renderizado: ${pngPath}`);

    // Remove arquivo html temporário
    if (fs.existsSync(htmlPath)) {
      fs.unlinkSync(htmlPath);
    }

    await page.close();
  }

  await browser.close();
  console.log('🎉 Todos os 4 posters foram gerados e atualizados com sucesso!');
}

renderAll().catch(err => {
  console.error('❌ Erro na geração dos posters:', err);
  process.exit(1);
});
