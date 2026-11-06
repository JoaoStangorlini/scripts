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

// Template shell com fontes aumentadas no cabeçalho e mantendo tamanho do HUB LabDiv, QR Code e Segurança
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
      background-image: url('bg-if.svg');
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
       z-index: 20; padding: 70px 55px; box-sizing: border-box;
    }
    
    /* CABEÇALHO ESQUERDO COM FONTES AUMENTADAS */
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

    /* COLUNA DIREITA HERO: ÍCONE COM BORDA DEGRADÊ + "HUB LabDiv" (TAMANHO MANTIDO) */
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

    /* RODAPÉ QR CODE + SEGURANÇA (TAMANHO MANTIDO CONFORME PEDIDO) */
    .p12-footer-row {
       position: absolute; bottom: 42px; left: 45px; right: 45px;
       display: flex; align-items: stretch; gap: 24px;
       z-index: 30;
    }
    
    .p12-qr-card {
       width: 320px;
       background: #FFFFFF; border-radius: 28px;
       padding: 22px 20px 20px 20px;
       box-shadow: 0 16px 40px rgba(15, 71, 128, 0.12), 0 2px 8px rgba(0,0,0,0.04);
       border: 2px solid #CBD5E1;
       display: flex; flex-direction: column; align-items: center; justify-content: center;
       flex-shrink: 0; box-sizing: border-box;
    }
    .p12-qr-img {
       width: 240px; height: 240px; object-fit: contain;
       border-radius: 12px;
    }
    .p12-qr-url-pill {
       margin-top: 14px; width: 100%;
       background: #F1F5F9; border: 1.5px solid #CBD5E1; border-radius: 999px;
       padding: 8px 12px; font-size: 16.5px; font-weight: 800; color: #0F4780;
       text-align: center; text-decoration: underline; text-decoration-color: #0284C7;
       text-underline-offset: 4px; box-sizing: border-box;
    }

    .p12-security-card {
       flex: 1;
       background: #FFFFFF; border-radius: 28px;
       padding: 24px 30px;
       box-shadow: 0 16px 40px rgba(15, 71, 128, 0.12), 0 2px 8px rgba(0,0,0,0.04);
       border: 2px solid #CBD5E1;
       display: flex; flex-direction: column; justify-content: space-between;
       box-sizing: border-box;
    }
    .p12-sec-title-row {
       display: flex; align-items: center; gap: 12px;
    }
    .p12-sec-title {
       font-size: 20px; font-weight: 900; color: #0F4780;
       letter-spacing: 0.2px; text-transform: uppercase;
    }
    .p12-sec-text {
       font-size: 19px; line-height: 1.45; color: #334155; font-weight: 600;
       margin-top: 10px; margin-bottom: 14px;
    }
    .p12-sec-text strong {
       font-weight: 800; color: #0F172A;
    }
    .p12-sec-buttons-row {
       display: flex; gap: 16px; margin-bottom: 8px;
    }
    .p12-sec-pill-btn {
       flex: 1; background: #F8FAFC; border: 1.5px solid #CBD5E1; border-radius: 16px;
       padding: 10px 14px; display: flex; align-items: center; gap: 12px;
       box-sizing: border-box;
    }
    .p12-btn-icon-circle {
       width: 34px; height: 34px; border-radius: 50%;
       background: #EEF4FA; color: #0F4780;
       display: flex; align-items: center; justify-content: center;
       flex-shrink: 0;
    }
    .p12-btn-texts {
       display: flex; flex-direction: column; overflow: hidden;
    }
    .p12-btn-label {
       font-size: 11.5px; font-weight: 900; color: #64748B; text-transform: uppercase; letter-spacing: 0.3px;
    }
    .p12-btn-value {
       font-size: 15.5px; font-weight: 800; color: #0F172A; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .p12-sec-legal-footer {
       font-size: 13.5px; font-weight: 700; color: #64748B; text-align: center;
       border-top: 1px solid #E2E8F0; padding-top: 8px; margin-top: 6px;
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
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 40 C10 45, 10 55, 12 60" stroke="#0F4780" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M18 35 C15 45, 15 55, 18 65" stroke="#0284C7" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M24 30 C20 45, 20 55, 24 70" stroke="#0284C7" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M88 40 C90 45, 90 55, 88 60" stroke="#FFCC00" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M82 35 C85 45, 85 55, 82 65" stroke="#FFCC00" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M76 30 C80 45, 80 55, 76 70" stroke="#F14343" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M38 25 C44 21, 56 21, 62 25" stroke="#F14343" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M42 30 C46 27, 54 27, 58 30" stroke="#F14343" stroke-width="4.5" stroke-linecap="round"/>
              <path d="M50 42 L14 55 L50 68 L86 55 Z" fill="url(#capGrad)" stroke="#111827" stroke-width="3.5" stroke-linejoin="round"/>
              <path d="M28 60.5 V71 C28 77, 72 77, 72 71 V60.5" fill="#111827"/>
              <path d="M28 60.5 V71 C28 77, 72 77, 72 71 V60.5" fill="url(#capGrad)" stroke="#111827" stroke-width="3.5"/>
              <path d="M30 63 C30 63, 24 66, 24 72" stroke="#111827" stroke-width="3.5" stroke-linecap="round"/>
              <rect x="21" y="72" width="6" height="11" rx="2" fill="#111827"/>
              <defs>
                <linearGradient id="capGrad" x1="14" y1="55" x2="86" y2="55" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#0F4780"/>
                  <stop offset="35%" stop-color="#F14343"/>
                  <stop offset="100%" stop-color="#FFCC00"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <div class="p12-icon-branding font-bukra">
          <div class="p12-brand-title">
            <span class="hub-white">HUB</span> <span class="labdiv-gradient">LabDiv</span>
          </div>
        </div>
      </div>

      <!-- MIOLO DOS EIXOS ESPECÍFICO DE CADA OPÇÃO -->
      ${middleHtml}

      <!-- RODAPÉ QR CODE + SEGURANÇA -->
      <div class="p12-footer-row font-open-sans">
        <div class="p12-qr-card">
          <img src="qrcode.png" alt="QR Code HUB LabDiv" class="p12-qr-img">
          <div class="p12-qr-url-pill font-open-sans">hub-lab-div.vercel.app/divulgacao</div>
        </div>

        <div class="p12-security-card">
          <div>
            <div class="p12-sec-title-row font-bukra">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0F4780" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              <span class="p12-sec-title">SEGURANÇA &amp; CONFORMIDADE LEGAL</span>
            </div>
            <p class="p12-sec-text">
              O <strong>HUB LabDiv</strong> respeita as <strong>leis, normas e decisões judiciais do Brasil</strong>,
              além de ter todo o seu <strong>código aberto</strong> e um e-mail para <strong>suporte, sugestões e ideias da comunidade</strong>.
            </p>

            <div class="p12-sec-buttons-row">
              <div class="p12-sec-pill-btn">
                <div class="p12-btn-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                </div>
                <div class="p12-btn-texts">
                  <span class="p12-btn-label">CÓDIGO ABERTO &bull; AGPLV3</span>
                  <span class="p12-btn-value">github.com/HUB-LabDiv</span>
                </div>
              </div>

              <div class="p12-sec-pill-btn">
                <div class="p12-btn-icon-circle" style="background: #FEF2F2; color: #F14343;">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <div class="p12-btn-texts">
                  <span class="p12-btn-label" style="color: #F14343;">SUPORTE &amp; IDEIAS</span>
                  <span class="p12-btn-value">hublabdiv@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          <div class="p12-sec-legal-footer">
            Licença AGPLv3 &bull; LabDiv &bull; Instituto de Física da Universidade de São Paulo (IFUSP)
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// -------------------------------------------------------------
// OPÇÃO 1: FAIXAS HORIZONTAIS ESCALONADAS (HORIZONTAL RIBBONS)
// As informações dos 3 eixos são organizadas HORIZONTALMENTE
// -------------------------------------------------------------
function buildOpcao1Horizontal() {
  const middleCss = `
    .hr-container {
      position: absolute;
      left: 45px;
      z-index: 28;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .hr-strip {
      background: #FFFFFF;
      border-radius: 24px;
      box-shadow: 0 16px 36px rgba(15, 71, 128, 0.10), 0 2px 8px rgba(0,0,0,0.04);
      border: 2px solid #CBD5E1;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      gap: 24px;
      box-sizing: border-box;
    }
    .hr-strip-1 {
      position: absolute;
      top: 715px; left: 45px;
      width: 580px; height: 188px;
      border-left: 8px solid #0F4780;
    }
    .hr-strip-2 {
      position: absolute;
      top: 920px; left: 45px;
      width: 885px; height: 188px;
      border-left: 8px solid #F14343;
    }
    .hr-strip-3 {
      position: absolute;
      top: 1125px; left: 45px;
      width: 1150px; height: 188px;
      border-left: 8px solid #FFCC00;
    }

    .hr-brand-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex-shrink: 0;
    }
    .hr-badge {
      font-size: 13.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;
      padding: 4px 12px; border-radius: 999px; display: inline-flex; width: fit-content; margin-bottom: 6px;
    }
    .hrb-blue { background: #EEF4FA; color: #0F4780; }
    .hrb-red { background: #FEF2F2; color: #F14343; }
    .hrb-yellow { background: #FEF9C3; color: #854D0E; }

    .hr-title {
      font-size: 34px; font-weight: 900; color: #0F172A; line-height: 1.1; margin-bottom: 3px;
    }
    .hr-subtitle {
      font-size: 16px; font-weight: 700; color: #475569; line-height: 1.3;
    }

    .hr-divider-v {
      width: 2px; height: 100%; background: #E2E8F0; flex-shrink: 0;
    }

    .hr-items-row {
      display: flex;
      flex: 1;
      gap: 16px;
      align-items: stretch;
      height: 100%;
    }
    .hr-item-card {
      flex: 1;
      background: #F8FAFC;
      border: 1.5px solid #E2E8F0;
      border-radius: 16px;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .hr-item-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
    }
    .hr-item-icon {
      font-size: 20px;
    }
    .hr-item-title {
      font-size: 19px; font-weight: 800; color: #0F172A;
    }
    .hr-item-desc {
      font-size: 16px; color: #475569; font-weight: 600; line-height: 1.35;
    }
  `;

  const middleHtml = `
    <!-- OPÇÃO 1: FAIXAS HORIZONTAIS ESCALONADAS (HORIZONTAL RIBBONS) -->
    <!-- Faixa 1: Eixo Social (Horizontal) -->
    <div class="hr-strip hr-strip-1 font-open-sans">
      <div class="hr-brand-col" style="width: 210px;">
        <span class="hr-badge hrb-blue font-bukra">EIXO 1 &bull; SOCIAL</span>
        <h2 class="hr-title font-bukra">Comunidade</h2>
        <p class="hr-subtitle">Permanência e afeto</p>
      </div>
      <div class="hr-divider-v"></div>
      <div class="hr-items-row">
        <div class="hr-item-card" style="border-left: 4px solid #0F4780;">
          <div class="hr-item-header">
            <span class="hr-item-icon">📱</span>
            <span class="hr-item-title font-bukra">3 Feeds Vivos</span>
          </div>
          <p class="hr-item-desc">Aba Geral, Registros e Galeria científica ativa.</p>
        </div>
        <div class="hr-item-card" style="border-left: 4px solid #0F4780;">
          <div class="hr-item-header">
            <span class="hr-item-icon">💬</span>
            <span class="hr-item-title font-bukra">Diálogo &amp; XP</span>
          </div>
          <p class="hr-item-desc">Balões freirianos e dicas reais de permanência.</p>
        </div>
      </div>
    </div>

    <!-- Faixa 2: Eixo Informativo (Horizontal) -->
    <div class="hr-strip hr-strip-2 font-open-sans">
      <div class="hr-brand-col" style="width: 220px;">
        <span class="hr-badge hrb-red font-bukra">EIXO 2 &bull; INFORMATIVO</span>
        <h2 class="hr-title font-bukra">CGIF &amp; Wiki</h2>
        <p class="hr-subtitle">Memória acadêmica oficial</p>
      </div>
      <div class="hr-divider-v"></div>
      <div class="hr-items-row">
        <div class="hr-item-card" style="border-left: 4px solid #F14343;">
          <div class="hr-item-header">
            <span class="hr-item-icon">📚</span>
            <span class="hr-item-title font-bukra">Wiki Oficial</span>
          </div>
          <p class="hr-item-desc">Manuais e PPPs unificados do IFUSP.</p>
        </div>
        <div class="hr-item-card" style="border-left: 4px solid #F14343;">
          <div class="hr-item-header">
            <span class="hr-item-icon">🎓</span>
            <span class="hr-item-title font-bukra">Grades &amp; Bolsas</span>
          </div>
          <p class="hr-item-desc">Bacharelado, Licenciatura e PUB/IC.</p>
        </div>
        <div class="hr-item-card" style="border-left: 4px solid #F14343;">
          <div class="hr-item-header">
            <span class="hr-item-icon">🏛️</span>
            <span class="hr-item-title font-bukra">120+ Docentes</span>
          </div>
          <p class="hr-item-desc">Mapa de salas e contatos diretos.</p>
        </div>
      </div>
    </div>

    <!-- Faixa 3: Eixo Ferramentas (Horizontal Panorâmico) -->
    <div class="hr-strip hr-strip-3 font-open-sans">
      <div class="hr-brand-col" style="width: 230px;">
        <span class="hr-badge hrb-yellow font-bukra">EIXO 3 &bull; FERRAMENTAS</span>
        <h2 class="hr-title font-bukra">Ferramentas</h2>
        <p class="hr-subtitle">Rotina e apoio aos estudos</p>
      </div>
      <div class="hr-divider-v"></div>
      <div class="hr-items-row">
        <div class="hr-item-card" style="border-left: 4px solid #FFCC00;">
          <div class="hr-item-header">
            <span class="hr-item-icon">⏱️</span>
            <span class="hr-item-title font-bukra">Grade 1h:1h &bull; Faltas</span>
          </div>
          <p class="hr-item-desc">1h aula = 1h estudo + controle de faltas.</p>
        </div>
        <div class="hr-item-card" style="border-left: 4px solid #FFCC00;">
          <div class="hr-item-header">
            <span class="hr-item-icon">📊</span>
            <span class="hr-item-title font-bukra">Horas AEx 10%</span>
          </div>
          <p class="hr-item-desc">Calculadora de extensão curricular unificada.</p>
        </div>
        <div class="hr-item-card" style="border-left: 4px solid #FFCC00;">
          <div class="hr-item-header">
            <span class="hr-item-icon">🚌</span>
            <span class="hr-item-title font-bukra">Circulares &amp; Match IC</span>
          </div>
          <p class="hr-item-desc">Ônibus em tempo real e pesquisa científica.</p>
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 1: Faixas Horizontais Escalonadas',
    middleCss,
    middleHtml
  });
}

// -------------------------------------------------------------
// OPÇÃO 4: TOTALMENTE FORA DE CARDS (PURE OPEN TYPOGRAPHY)
// Sem caixas/containers, tipografia gigante e fluidez aberta
// -------------------------------------------------------------
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
      justify-content: space-between;
      box-sizing: border-box;
      /* ZERO CARDS: sem fundo, sem borda de caixa, sem sombra */
      background: transparent;
      padding: 0 4px;
    }
    .oc-1 { height: 630px; }
    .oc-2 { height: 495px; }
    .oc-3 { height: 355px; }

    .open-hero-number {
      font-size: 68px; font-weight: 900; line-height: 0.9; letter-spacing: -2.5px;
    }
    .on-blue { color: #0F4780; }
    .on-red { color: #F14343; }
    .on-yellow { color: #D97706; }

    .open-accent-bar {
      width: 60px; height: 5px; border-radius: 999px; margin: 8px 0 14px 0;
    }
    .oab-blue { background: #0F4780; }
    .oab-red { background: #F14343; }
    .oab-yellow { background: #FFCC00; }

    .open-axis-tag {
      font-size: 14.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px; display: inline-block;
    }
    .oat-blue { color: #0F4780; }
    .oat-red { color: #F14343; }
    .oat-yellow { color: #854D0E; }

    .open-title {
      font-size: 38px; font-weight: 900; color: #0F172A; line-height: 1.1; margin-bottom: 4px;
    }
    .open-sub {
      font-size: 18px; color: #475569; font-weight: 700; line-height: 1.32; margin-bottom: 18px;
    }

    .open-list {
      display: flex; flex-direction: column; gap: 14px;
    }
    .open-item {
      display: flex; align-items: flex-start; gap: 12px;
      padding-bottom: 12px; border-bottom: 1.5px solid rgba(148, 163, 184, 0.25);
    }
    .open-dot {
      width: 10px; height: 10px; border-radius: 50%; margin-top: 7px; flex-shrink: 0;
    }
    .open-item-title {
      font-size: 20px; font-weight: 800; color: #0F172A; line-height: 1.25;
    }
    .open-item-desc {
      font-size: 17px; color: #475569; font-weight: 600; line-height: 1.35; margin-top: 2px;
    }

    .open-pill-btn {
      width: fit-content; padding: 12px 24px; border-radius: 999px;
      font-size: 16.5px; font-weight: 900; display: inline-flex; align-items: center; gap: 8px;
      margin-top: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.10);
    }
  `;

  const middleHtml = `
    <!-- OPÇÃO 4: TOTALMENTE FORA DE CARDS (PURE OPEN TYPOGRAPHY) -->
    <div class="open-container font-open-sans">
      <!-- Coluna 1: Social Aberto (630px) -->
      <div class="open-col oc-1">
        <div>
          <div class="open-hero-number on-blue font-bukra">01</div>
          <div class="open-accent-bar oab-blue"></div>
          <span class="open-axis-tag oat-blue font-bukra">EIXO 1 &bull; SOCIAL</span>
          <h2 class="open-title font-bukra">Comunidade</h2>
          <p class="open-sub">Espaço vivo de diálogo e permanência estudantil</p>

          <div class="open-list">
            <div class="open-item">
              <div class="open-dot" style="background: #0F4780;"></div>
              <div>
                <div class="open-item-title font-bukra">3 Feeds Integrados</div>
                <div class="open-item-desc">Aba de Fluxo geral, Registros e Galeria científica em tempo real.</div>
              </div>
            </div>
            <div class="open-item">
              <div class="open-dot" style="background: #0F4780;"></div>
              <div>
                <div class="open-item-title font-bukra">Balões Freirianos</div>
                <div class="open-item-desc">Conversas e acolhimento pedagógico baseados na escuta ativa.</div>
              </div>
            </div>
            <div class="open-item">
              <div class="open-dot" style="background: #0F4780;"></div>
              <div>
                <div class="open-item-title font-bukra">Vivências Discentes</div>
                <div class="open-item-desc">Apoio mútuo, dicas de veteranos e gamificação colaborativa com XP.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="open-pill-btn font-bukra" style="background: #0F4780; color: #FFFFFF;">
          EXPLORAR COMUNIDADE &rarr;
        </div>
      </div>

      <!-- Coluna 2: Informativo Aberto (495px) -->
      <div class="open-col oc-2">
        <div>
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
                <div class="open-item-desc">PPPs, manuais de matrícula e resoluções unificadas do IFUSP.</div>
              </div>
            </div>
            <div class="open-item">
              <div class="open-dot" style="background: #F14343;"></div>
              <div>
                <div class="open-item-title font-bukra">Grades &amp; Oportunidades</div>
                <div class="open-item-desc">Bacharelado, Licenciatura, FisMed e mural de bolsas PUB/IC.</div>
              </div>
            </div>
            <div class="open-item">
              <div class="open-dot" style="background: #F14343;"></div>
              <div>
                <div class="open-item-title font-bukra">120+ Docentes &amp; Salas</div>
                <div class="open-item-desc">Contatos diretos e mapa das salas de aula do instituto.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="open-pill-btn font-bukra" style="background: #F14343; color: #FFFFFF;">
          CONSULTAR WIKI &rarr;
        </div>
      </div>

      <!-- Coluna 3: Ferramentas Aberto (355px) -->
      <div class="open-col oc-3">
        <div>
          <div class="open-hero-number on-yellow font-bukra" style="font-size: 58px;">03</div>
          <div class="open-accent-bar oab-yellow"></div>
          <span class="open-axis-tag oat-yellow font-bukra">EIXO 3 &bull; FERRAMENTAS</span>
          <h2 class="open-title font-bukra" style="font-size: 32px;">Ferramentas</h2>
          <p class="open-sub" style="font-size: 16.5px; margin-bottom: 10px;">Aceleradores para o dia a dia acadêmico</p>

          <div class="open-list" style="gap: 8px;">
            <div class="open-item" style="padding-bottom: 8px;">
              <div class="open-dot" style="background: #FFCC00;"></div>
              <div>
                <div class="open-item-title font-bukra" style="font-size: 18px;">Grade Horária 1h:1h &bull; Faltas</div>
                <div class="open-item-desc" style="font-size: 15px;">1h aula = 1h estudo + controle de presença.</div>
              </div>
            </div>
            <div class="open-item" style="padding-bottom: 8px;">
              <div class="open-dot" style="background: #FFCC00;"></div>
              <div>
                <div class="open-item-title font-bukra" style="font-size: 18px;">Horas AEx &amp; Trilhas (10%)</div>
                <div class="open-item-desc" style="font-size: 15px;">Rastreamento curricular de extensão unificado.</div>
              </div>
            </div>
            <div class="open-item" style="padding-bottom: 8px;">
              <div class="open-dot" style="background: #FFCC00;"></div>
              <div>
                <div class="open-item-title font-bukra" style="font-size: 18px;">Circulares &amp; Match IC</div>
                <div class="open-item-desc" style="font-size: 15px;">Ônibus em tempo real e pesquisa científica.</div>
              </div>
            </div>
          </div>
        </div>

        <div class="open-pill-btn font-bukra" style="background: #FFCC00; color: #0F172A; padding: 10px 20px; font-size: 15px;">
          ACESSAR APPS &rarr;
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 4: Totalmente Fora de Cards',
    middleCss,
    middleHtml
  });
}

// -------------------------------------------------------------
// OPÇÃO 5: FAIXAS ABERTAS COM CONEXÃO VISUAL (HORIZONTAL LANES FORA DE CARDS)
// Combina disposta HORIZONTALMENTE com FORA DE CARDS
// -------------------------------------------------------------
function buildOpcao5Lanes() {
  const middleCss = `
    .lanes-master {
      position: absolute;
      left: 45px;
      z-index: 28;
    }
    .lane-strip {
      display: flex;
      align-items: center;
      gap: 24px;
      /* FORA DE CARDS: sem fundo branco de cartão */
      background: rgba(255, 255, 255, 0.70);
      backdrop-filter: blur(8px);
      border-radius: 20px;
      border: 1.5px solid rgba(203, 213, 225, 0.6);
      padding: 16px 22px;
      box-sizing: border-box;
    }
    .ls-1 {
      position: absolute;
      top: 715px; left: 45px;
      width: 580px; height: 188px;
      border-bottom: 3.5px solid #0F4780;
    }
    .ls-2 {
      position: absolute;
      top: 920px; left: 45px;
      width: 885px; height: 188px;
      border-bottom: 3.5px solid #F14343;
    }
    .ls-3 {
      position: absolute;
      top: 1125px; left: 45px;
      width: 1150px; height: 188px;
      border-bottom: 3.5px solid #FFCC00;
    }

    .ls-node-col {
      display: flex;
      align-items: center;
      gap: 14px;
      width: 210px;
      flex-shrink: 0;
    }
    .ls-node-circle {
      width: 52px; height: 52px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; font-weight: 900; flex-shrink: 0;
    }
    .ls-texts {
      display: flex; flex-direction: column;
    }
    .ls-tag {
      font-size: 13px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px;
    }
    .ls-title {
      font-size: 30px; font-weight: 900; color: #0F172A; line-height: 1.05;
    }

    .ls-feature-grid {
      display: flex;
      flex: 1;
      gap: 14px;
    }
    .ls-feature-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .ls-f-title {
      font-size: 18.5px; font-weight: 800; color: #0F172A; margin-bottom: 3px; display: flex; align-items: center; gap: 6px;
    }
    .ls-f-desc {
      font-size: 15.5px; color: #475569; font-weight: 600; line-height: 1.35;
    }
  `;

  const middleHtml = `
    <!-- OPÇÃO 5: FAIXAS ABERTAS HORIZONTAIS FORA DE CARDS -->
    <div class="lane-strip ls-1 font-open-sans">
      <div class="ls-node-col">
        <div class="ls-node-circle font-bukra" style="background: #0F4780; color: #FFFFFF;">01</div>
        <div class="ls-texts">
          <span class="ls-tag font-bukra" style="color: #0F4780;">EIXO SOCIAL</span>
          <span class="ls-title font-bukra">Comunidade</span>
        </div>
      </div>
      <div style="width: 2px; height: 80%; background: #E2E8F0;"></div>
      <div class="ls-feature-grid">
        <div class="ls-feature-box">
          <div class="ls-f-title font-bukra"><span>📱</span> 3 Feeds Integrados</div>
          <div class="ls-f-desc">Fluxo em tempo real, Registros de conquistas e Galeria visual.</div>
        </div>
        <div class="ls-feature-box">
          <div class="ls-f-title font-bukra"><span>💬</span> Diálogo &amp; Afeto</div>
          <div class="ls-f-desc">Balões Freirianos e vivências discentes de permanência ativa.</div>
        </div>
      </div>
    </div>

    <div class="lane-strip ls-2 font-open-sans">
      <div class="ls-node-col">
        <div class="ls-node-circle font-bukra" style="background: #F14343; color: #FFFFFF;">02</div>
        <div class="ls-texts">
          <span class="ls-tag font-bukra" style="color: #F14343;">INFORMATIVO</span>
          <span class="ls-title font-bukra">CGIF &amp; Wiki</span>
        </div>
      </div>
      <div style="width: 2px; height: 80%; background: #E2E8F0;"></div>
      <div class="ls-feature-grid">
        <div class="ls-feature-box">
          <div class="ls-f-title font-bukra"><span>📚</span> Wiki Oficial</div>
          <div class="ls-f-desc">PPPs, manuais de matrícula e resoluções unificadas do IFUSP.</div>
        </div>
        <div class="ls-feature-box">
          <div class="ls-f-title font-bukra"><span>🎓</span> Grades &amp; Bolsas</div>
          <div class="ls-f-desc">Bacharelado, Licenciatura e mural de bolsas PUB/IC.</div>
        </div>
        <div class="ls-feature-box">
          <div class="ls-f-title font-bukra"><span>🏛️</span> 120+ Docentes</div>
          <div class="ls-f-desc">Contatos diretos e mapa das salas do instituto.</div>
        </div>
      </div>
    </div>

    <div class="lane-strip ls-3 font-open-sans">
      <div class="ls-node-col">
        <div class="ls-node-circle font-bukra" style="background: #FFCC00; color: #0F172A;">03</div>
        <div class="ls-texts">
          <span class="ls-tag font-bukra" style="color: #854D0E;">FERRAMENTAS</span>
          <span class="ls-title font-bukra">Ferramentas</span>
        </div>
      </div>
      <div style="width: 2px; height: 80%; background: #E2E8F0;"></div>
      <div class="ls-feature-grid">
        <div class="ls-feature-box">
          <div class="ls-f-title font-bukra"><span>⏱️</span> Grade 1h:1h</div>
          <div class="ls-f-desc">1h aula = 1h estudo + controle de faltas e presenças.</div>
        </div>
        <div class="ls-feature-box">
          <div class="ls-f-title font-bukra"><span>📊</span> Horas AEx (10%)</div>
          <div class="ls-f-desc">Calculadora curricular e rastreamento de extensão.</div>
        </div>
        <div class="ls-feature-box">
          <div class="ls-f-title font-bukra"><span>🚌</span> Ônibus &amp; Match IC</div>
          <div class="ls-f-desc">Circulares ao vivo e busca de pesquisa científica.</div>
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 5: Faixas Abertas Horizontais',
    middleCss,
    middleHtml
  });
}

// -------------------------------------------------------------
// OPÇÃO 2: JANELAS WEB OS (COM FONTES AMPLIADAS)
// -------------------------------------------------------------
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
    .bw-2 { height: 495px; border-color: rgba(241, 67, 67, 0.4); }
    .bw-3 { height: 355px; border-color: rgba(255, 204, 0, 0.6); }

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
      padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;
    }
    .bw-tag { font-size: 14px; font-weight: 900; text-transform: uppercase; margin-bottom: 4px; display: inline-block; }
    .bw-h2 { font-size: 32px; font-weight: 900; color: #0F172A; line-height: 1.15; margin-bottom: 2px; }
    .bw-desc { font-size: 17px; color: #475569; font-weight: 600; line-height: 1.35; margin-bottom: 14px; }

    .bw-item-card {
      background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 14px;
      padding: 12px 14px; margin-bottom: 10px;
    }
    .bw-item-title { font-size: 18.5px; font-weight: 800; color: #0F172A; display: flex; align-items: center; gap: 8px; }
    .bw-item-detail { font-size: 15.5px; color: #475569; font-weight: 600; line-height: 1.35; margin-top: 3px; }

    .bw-btn {
      width: 100%; padding: 12px 16px; border-radius: 12px; font-size: 16px; font-weight: 900; text-align: center;
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
  `;

  const middleHtml = `
    <!-- OPÇÃO 2: JANELAS WEB OS (COM FONTES AMPLIADAS) -->
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
          <div style="font-size: 12px; font-weight: 900; color: #0F4780;">EIXO 1</div>
        </div>
        <div class="bw-body">
          <div>
            <span class="bw-tag font-bukra" style="color: #0F4780;">SOCIAL &bull; DIÁLOGO</span>
            <h2 class="bw-h2 font-bukra">Comunidade</h2>
            <p class="bw-desc">Espaço vivo de permanência estudantil</p>

            <div class="bw-item-card" style="border-left: 5px solid #0F4780;">
              <div class="bw-item-title"><span>📱</span> Feeds Integrados</div>
              <div class="bw-item-detail">3 abas ativas: Fluxo geral, Registros e Galeria científica.</div>
            </div>
            <div class="bw-item-card" style="border-left: 5px solid #0F4780;">
              <div class="bw-item-title"><span>💬</span> Balões Freirianos</div>
              <div class="bw-item-detail">Diálogo científico acolhedor com base no afeto e escuta.</div>
            </div>
            <div class="bw-item-card" style="border-left: 5px solid #0F4780;">
              <div class="bw-item-title"><span>🤝</span> Vivências Discentes</div>
              <div class="bw-item-detail">Troca de experiências, dicas de veteranos e XP comunitário.</div>
            </div>
          </div>

          <div class="bw-btn font-bukra" style="background: #0F4780; color: #FFFFFF;">
            ABRIR NAVEGADOR &rarr;
          </div>
        </div>
      </div>

      <!-- Janela 2: /cgif (495px) -->
      <div class="browser-window bw-2">
        <div class="bw-top-bar">
          <div class="bw-dots">
            <div class="bw-dot dot-close"></div>
            <div class="bw-dot dot-min"></div>
            <div class="bw-dot dot-max"></div>
          </div>
          <div class="bw-url-pill font-open-sans">🔒 hub.usp.br/cgif-wiki</div>
          <div style="font-size: 12px; font-weight: 900; color: #F14343;">EIXO 2</div>
        </div>
        <div class="bw-body">
          <div>
            <span class="bw-tag font-bukra" style="color: #F14343;">INFORMATIVO &bull; OFICIAL</span>
            <h2 class="bw-h2 font-bukra">CGIF &amp; Wiki</h2>
            <p class="bw-desc">Enciclopédia acadêmica do IFUSP</p>

            <div class="bw-item-card" style="border-left: 5px solid #F14343;">
              <div class="bw-item-title"><span>📚</span> Wiki &amp; Editais</div>
              <div class="bw-item-detail">PPPs, manuais e resoluções unificados do instituto.</div>
            </div>
            <div class="bw-item-card" style="border-left: 5px solid #F14343;">
              <div class="bw-item-title"><span>🎓</span> Grades &amp; Oportunidades</div>
              <div class="bw-item-detail">Bacharelado, Licenciatura, FisMed e bolsas PUB/IC.</div>
            </div>
            <div class="bw-item-card" style="border-left: 5px solid #F14343;">
              <div class="bw-item-title"><span>🏛️</span> 120+ Docentes &amp; Salas</div>
              <div class="bw-item-detail">Contatos diretos e mapa das salas do instituto.</div>
            </div>
          </div>

          <div class="bw-btn font-bukra" style="background: #F14343; color: #FFFFFF;">
            CONSULTAR WIKI &rarr;
          </div>
        </div>
      </div>

      <!-- Janela 3: /ferramentas (355px) -->
      <div class="browser-window bw-3">
        <div class="bw-top-bar" style="padding: 8px 12px;">
          <div class="bw-dots">
            <div class="bw-dot dot-close"></div>
            <div class="bw-dot dot-min"></div>
            <div class="bw-dot dot-max"></div>
          </div>
          <div class="bw-url-pill font-open-sans" style="font-size: 12.5px; padding: 2px 8px;">🔒 hub.usp.br/apps</div>
          <div style="font-size: 12px; font-weight: 900; color: #854D0E;">EIXO 3</div>
        </div>
        <div class="bw-body" style="padding: 12px 14px 10px 14px;">
          <div>
            <span class="bw-tag font-bukra" style="color: #854D0E; font-size: 12px;">FERRAMENTAS &bull; ROTINA</span>
            <h2 class="bw-h2 font-bukra" style="font-size: 26px;">Ferramentas</h2>
            <p class="bw-desc" style="font-size: 14.5px; margin-bottom: 8px;">Apoio diário à pesquisa e aulas</p>

            <div class="bw-item-card" style="border-left: 4px solid #FFCC00; padding: 7px 10px; margin-bottom: 6px;">
              <div class="bw-item-title" style="font-size: 15.5px;"><span>⏱️</span> Grade 1h:1h &bull; Faltas</div>
            </div>
            <div class="bw-item-card" style="border-left: 4px solid #FFCC00; padding: 7px 10px; margin-bottom: 6px;">
              <div class="bw-item-title" style="font-size: 15.5px;"><span>📊</span> Horas AEx &amp; Trilhas (10%)</div>
            </div>
            <div class="bw-item-card" style="border-left: 4px solid #FFCC00; padding: 7px 10px; margin-bottom: 6px;">
              <div class="bw-item-title" style="font-size: 15.5px;"><span>🚌</span> Circulares &amp; Match IC</div>
            </div>
          </div>

          <div class="bw-btn font-bukra" style="background: #FFCC00; color: #0F172A; padding: 9px 10px; font-size: 14.5px; margin-top: 4px;">
            ABRIR APLICATIVOS &rarr;
          </div>
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 2: Janelas Web OS (Fontes Ampliadas)',
    middleCss,
    middleHtml
  });
}

// -------------------------------------------------------------
// OPÇÃO 3: PAINÉIS EDITORIAIS & MÉTRICAS (COM FONTES AMPLIADAS)
// -------------------------------------------------------------
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
      padding: 24px 22px;
      box-shadow: 0 16px 40px rgba(15, 71, 128, 0.12), 0 2px 8px rgba(0,0,0,0.04);
      border: 2px solid #CBD5E1;
      display: flex; flex-direction: column; justify-content: space-between;
      box-sizing: border-box;
      overflow: hidden;
    }
    .sc-1 { height: 630px; border-color: rgba(15, 71, 128, 0.4); }
    .sc-2 { height: 495px; border-color: rgba(241, 67, 67, 0.4); }
    .sc-3 { height: 355px; border-color: rgba(255, 204, 0, 0.6); padding: 16px 18px 12px 18px; }

    .stat-hero-number {
      font-size: 60px; font-weight: 900; line-height: 0.95; letter-spacing: -2px; margin-bottom: 2px;
    }
    .sn-blue { color: #0F4780; }
    .sn-red { color: #F14343; }
    .sn-yellow { color: #D97706; }

    .stat-hero-label {
      font-size: 14.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 12px;
    }
    .sl-blue { color: #0F4780; }
    .sl-red { color: #F14343; }
    .sl-yellow { color: #854D0E; }

    .stat-divider { width: 100%; height: 2.5px; background: #F1F5F9; margin-bottom: 14px; }

    .stat-h2 { font-size: 32px; font-weight: 900; color: #0F172A; line-height: 1.15; margin-bottom: 2px; }
    .stat-sub { font-size: 17px; color: #475569; font-weight: 700; line-height: 1.35; margin-bottom: 14px; }

    .stat-list { display: flex; flex-direction: column; gap: 12px; }
    .stat-item {
      display: flex; align-items: flex-start; gap: 8px; font-size: 18px; line-height: 1.35; color: #1E293B;
    }
    .stat-item strong { font-weight: 800; color: #0F172A; }
    .stat-bullet { font-weight: 900; font-size: 20px; line-height: 1; margin-top: 1px; }

    .stat-btn {
      width: 100%; padding: 12px 16px; border-radius: 12px; font-size: 16px; font-weight: 900; text-align: center;
      display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 12px;
    }
  `;

  const middleHtml = `
    <!-- OPÇÃO 3: PAINÉIS EDITORIAIS COM MÉTRICAS (FONTES AMPLIADAS) -->
    <div class="stats-master-container font-open-sans">
      <!-- Card 1: Social Stat (630px) -->
      <div class="stat-card sc-1">
        <div>
          <div class="stat-hero-number sn-blue font-bukra">01</div>
          <div class="stat-hero-label sl-blue font-bukra">EIXO SOCIAL &bull; FLUXO VIVO</div>
          <div class="stat-divider"></div>

          <h2 class="stat-h2 font-bukra">Comunidade</h2>
          <p class="stat-sub">Permanência estudantil e acolhimento dialógico</p>

          <div class="stat-list">
            <div class="stat-item">
              <span class="stat-bullet sn-blue">&bull;</span>
              <div><strong>3 Feeds Ativos:</strong> Fluxo geral, Registros e Galeria científica.</div>
            </div>
            <div class="stat-item">
              <span class="stat-bullet sn-blue">&bull;</span>
              <div><strong>Balões Freirianos:</strong> trocas pedagógicas pautadas pelo afeto.</div>
            </div>
            <div class="stat-item">
              <span class="stat-bullet sn-blue">&bull;</span>
              <div><strong>Vivências Discentes:</strong> permanência contada por alunos reais.</div>
            </div>
            <div class="stat-item">
              <span class="stat-bullet sn-blue">&bull;</span>
              <div><strong>Gamificação com XP:</strong> níveis e sabedoria de veteranos.</div>
            </div>
          </div>
        </div>

        <div class="stat-btn font-bukra" style="background: #0F4780; color: #FFFFFF;">
          PARTICIPAR DA COMUNIDADE &rarr;
        </div>
      </div>

      <!-- Card 2: Informativo Stat (495px) -->
      <div class="stat-card sc-2">
        <div>
          <div class="stat-hero-number sn-red font-bukra">120+</div>
          <div class="stat-hero-label sl-red font-bukra">DOCENTES, SALAS &amp; BOLSAS</div>
          <div class="stat-divider"></div>

          <h2 class="stat-h2 font-bukra">CGIF &amp; Wiki</h2>
          <p class="stat-sub">Memória histórica e normas consolidadas</p>

          <div class="stat-list">
            <div class="stat-item">
              <span class="stat-bullet sn-red">&bull;</span>
              <div><strong>Wiki Oficial:</strong> manuais, PPPs unificados e editais do IFUSP.</div>
            </div>
            <div class="stat-item">
              <span class="stat-bullet sn-red">&bull;</span>
              <div><strong>Grades dos Cursos:</strong> Bacharelado, Licenciatura e FisMed.</div>
            </div>
            <div class="stat-item">
              <span class="stat-bullet sn-red">&bull;</span>
              <div><strong>Mural de Oportunidades:</strong> catálogo em tempo real de bolsas PUB/IC.</div>
            </div>
          </div>
        </div>

        <div class="stat-btn font-bukra" style="background: #F14343; color: #FFFFFF;">
          CONSULTAR CATÁLOGO &rarr;
        </div>
      </div>

      <!-- Card 3: Ferramentas Stat (355px) -->
      <div class="stat-card sc-3">
        <div>
          <div class="stat-hero-number sn-yellow font-bukra" style="font-size: 48px;">10%</div>
          <div class="stat-hero-label sl-yellow font-bukra">AEX &bull; HORAS DE EXTENSÃO</div>
          <div class="stat-divider" style="margin-bottom: 8px;"></div>

          <h2 class="stat-h2 font-bukra" style="font-size: 26px;">Ferramentas</h2>
          <div class="stat-list" style="gap: 6px;">
            <div class="stat-item" style="font-size: 16px;">
              <span class="stat-bullet sn-yellow">&bull;</span>
              <div><strong>Grade 1h:1h:</strong> 1h aula = 1h estudo + faltas.</div>
            </div>
            <div class="stat-item" style="font-size: 16px;">
              <span class="stat-bullet sn-yellow">&bull;</span>
              <div><strong>Horas AEx 10%:</strong> calculadora curricular.</div>
            </div>
            <div class="stat-item" style="font-size: 16px;">
              <span class="stat-bullet sn-yellow">&bull;</span>
              <div><strong>Circulares &amp; Match:</strong> mapa e busca de IC.</div>
            </div>
          </div>
        </div>

        <div class="stat-btn font-bukra" style="background: #FFCC00; color: #0F172A; padding: 10px 12px; font-size: 14.5px;">
          USAR FERRAMENTAS &rarr;
        </div>
      </div>
    </div>
  `;

  return getPosterShell({
    optionTitle: 'Opção 3: Painéis Editoriais & Métricas (Fontes Ampliadas)',
    middleCss,
    middleHtml
  });
}

async function renderAll() {
  const options = [
    { id: 1, name: 'opcao1_horizontal', fn: buildOpcao1Horizontal, title: 'Faixas Horizontais Escalonadas' },
    { id: 2, name: 'opcao2_browser', fn: buildOpcao2Ampliado, title: 'Janelas Web OS (Fontes Ampliadas)' },
    { id: 3, name: 'opcao3_metricas', fn: buildOpcao3Ampliado, title: 'Painéis Editoriais & Métricas (Fontes Ampliadas)' },
    { id: 4, name: 'opcao4_aberto', fn: buildOpcao4Aberto, title: 'Totalmente Fora de Cards (Open Flow)' },
    { id: 5, name: 'opcao5_lanes', fn: buildOpcao5Lanes, title: 'Faixas Abertas Horizontais' }
  ];

  console.log('Iniciando Puppeteer para renderizar as novas opções com fontes ampliadas...');
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  for (const opt of options) {
    const html = opt.fn();
    const htmlPath = path.join(POSTER1_DIR, `poster1_${opt.name}.html`);
    const pngPath = path.join(POSTER1_DIR, `poster1_${opt.name}.png`);
    const previewPath = path.join(ARTIFACT_DIR, `poster1_${opt.name}_preview.png`);

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

    // Salva cópia de preview no artifact dir
    fs.copyFileSync(pngPath, previewPath);
    console.log(`✅ Opção ${opt.id} (${opt.title}) renderizada: ${pngPath}`);
    await page.close();
  }

  // Define a nova Opção 1 (Faixas Horizontais) como o poster1.png principal
  const defaultOptionPng = path.join(POSTER1_DIR, 'poster1_opcao1_horizontal.png');
  const targetPoster1Png = path.join(POSTER1_DIR, 'poster1.png');
  fs.copyFileSync(defaultOptionPng, targetPoster1Png);

  // Também atualizamos o arquivo poster1_opcao1_bento.png para que todas as referências apontem para a nova versão
  const bentoTarget = path.join(POSTER1_DIR, 'poster1_opcao1_bento.png');
  fs.copyFileSync(defaultOptionPng, bentoTarget);

  // E substituímos poster1_opcao4_pills.png pela nova Opção 4 Fora de Cards
  const pillsTarget = path.join(POSTER1_DIR, 'poster1_opcao4_pills.png');
  const abertoPng = path.join(POSTER1_DIR, 'poster1_opcao4_aberto.png');
  fs.copyFileSync(abertoPng, pillsTarget);

  console.log(`✅ poster1.png atualizado com a Opção 1 (Faixas Horizontais)!`);
  console.log(`✅ poster1_opcao1_bento.png e poster1_opcao4_pills.png atualizados com os novos layouts!`);

  await browser.close();
  console.log('🎉 Todas as opções foram geradas com sucesso!');
}

renderAll().catch(err => {
  console.error('❌ Erro na geração:', err);
  process.exit(1);
});
