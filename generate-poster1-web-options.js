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
const ARTIFACT_DIR = (process.env.ARTIFACTS_DIR || './artifacts');

function getHtmlShell({ title, capeloSvg, qrSvg, middleContentHtml, extraCss = '' }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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
       z-index: 20; padding: 75px 60px; box-sizing: border-box;
    }
    
    /* CABEÇALHO ESQUERDO */
    .p12-header {
       color: #FFFFFF; max-width: 610px;
    }
    .p12-badge {
       display: inline-block; background: #FFCC00; color: #0F172A;
       padding: 9px 26px; font-size: 16px; font-weight: 900; border-radius: 999px;
       margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;
       box-shadow: 0 4px 14px rgba(0,0,0,0.14);
    }
    .p12-header h1 {
       font-size: 53px; font-weight: 900; line-height: 1.15; letter-spacing: -1.2px;
    }
    .p12-subline {
       font-size: 26px; font-weight: 800; margin-top: 14px; color: #FFCC00; line-height: 1.32; max-width: 600px;
    }
    
    /* COLUNA DIREITA HERO */
    .p12-right-hero-col {
       position: absolute; top: 45px; right: 45px;
       width: 480px;
       display: flex; flex-direction: column; align-items: center;
       z-index: 25;
    }
    .p12-icon-wrapper {
       width: 450px; height: 450px;
       border-radius: 50%;
       background: linear-gradient(90deg, #0F4780 0%, #0284C7 22%, #F14343 55%, #FFCC00 100%);
       padding: 6px;
       display: flex; align-items: center; justify-content: center;
       box-shadow: 0 28px 70px rgba(0,0,0,0.28), 0 0 0 3px rgba(255,255,255,0.20);
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
       width: 335px; height: 335px;
       transform: translateY(12px);
    }

    .p12-icon-branding {
       margin-top: 12px;
       display: flex; flex-direction: column; align-items: center; text-align: center;
       width: 100%;
    }
    .p12-brand-title {
       font-size: 58px; font-weight: 900; line-height: 1.0; letter-spacing: -0.8px;
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

    ${extraCss}
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="p12-diagonal"></div>
    <div class="bg-math-pattern"></div>

    <div class="p12-content">
      <!-- CABEÇALHO ESQUERDO -->
      <div class="p12-header">
        <div class="p12-badge font-bukra">Laboratório de Expressão e Divulgação do IFUSP</div>
        <h1 class="font-bukra">HUB LabDiv:<br>Conectando você à universidade.</h1>
        <p class="font-open-sans p12-subline">Comunidade, conhecimento e ferramentas na palma da mão.</p>
      </div>

      <!-- COLUNA DIREITA HERO -->
      <div class="p12-right-hero-col">
        <div class="p12-icon-wrapper">
          <div class="p12-icon-inner">
            ${capeloSvg}
          </div>
        </div>

        <div class="p12-icon-branding">
          <div class="p12-brand-title font-bukra">
            <span class="hub-white">HUB</span> <span class="labdiv-gradient">LabDiv</span>
          </div>
        </div>
      </div>

      <!-- CONTEÚDO CENTRAL ESPECÍFICO DESTA OPÇÃO -->
      ${middleContentHtml}

    </div> <!-- /p12-content -->

    <!-- RODAPÉ COM QR CODE E SEGURANÇA -->
    <div class="bottom-third-plane">
      <div class="bottom-qr-col">
        <div class="qr-code-box" style="border-color: #0F478040;">
          ${qrSvg}
          <div class="qr-center-badge-img">
            ${capeloSvg}
          </div>
        </div>
        <a class="qr-clean-link font-bukra" style="color: #0F4780;" href="https://hub-lab-div.vercel.app/divulgacao">hub-lab-div.vercel.app/divulgacao</a>
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

// =========================================================================
// OPÇÃO 1: Três Janelas Web Escalonadas (Cascading Web Browser Windows)
// Col 1 começa em y = 430px (ocupando o azul vazio da esquerda!)
// Col 2 em y = 540px
// Col 3 em y = 650px (abaixo do "HUB LabDiv" do hero)
// =========================================================================
function buildOption1({ qrSvg, capeloSvg }) {
  const extraCss = `
    .cascading-browser-grid {
      position: absolute;
      top: 0; left: 55px; right: 55px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 26px;
      z-index: 28;
    }
    .browser-window-card {
      background: #FFFFFF;
      border-radius: 24px;
      border: 2px solid #CBD5E1;
      box-shadow: 0 24px 60px rgba(15, 71, 128, 0.20), 0 4px 14px rgba(0,0,0,0.06);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .bw-card-1 {
      margin-top: 430px;
      height: 520px;
      border-color: rgba(15, 71, 128, 0.35);
    }
    .bw-card-2 {
      margin-top: 540px;
      height: 520px;
      border-color: rgba(241, 67, 67, 0.35);
    }
    .bw-card-3 {
      margin-top: 650px;
      height: 520px;
      border-color: rgba(255, 204, 0, 0.55);
    }

    .bw-topbar {
      height: 48px;
      background: #F1F5F9;
      border-bottom: 2px solid #E2E8F0;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-shrink: 0;
    }
    .bw-dots {
      display: flex; gap: 6px; align-items: center;
    }
    .bw-dot { width: 10px; height: 10px; border-radius: 50%; }
    .bwd-r { background: #EF4444; }
    .bwd-y { background: #F59E0B; }
    .bwd-g { background: #10B981; }

    .bw-url-chip {
      background: #FFFFFF;
      border: 1px solid #CBD5E1;
      border-radius: 999px;
      padding: 3px 12px;
      font-size: 13.5px;
      font-weight: 800;
      font-family: monospace;
      color: #0F172A;
      display: flex; align-items: center; gap: 6px;
    }

    .bw-body {
      padding: 24px 20px 20px 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
    }
    .bw-header-row {
      display: flex; align-items: center; gap: 12px; margin-bottom: 8px;
    }
    .bw-icon-badge {
      width: 50px; height: 50px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .badge-b { background: rgba(15, 71, 128, 0.12); color: #0F4780; border: 1.5px solid rgba(15, 71, 128, 0.25); }
    .badge-r { background: rgba(241, 67, 67, 0.12); color: #F14343; border: 1.5px solid rgba(241, 67, 67, 0.25); }
    .badge-y { background: rgba(255, 204, 0, 0.22); color: #854D0E; border: 1.5px solid #FFCC00; }

    .bw-title { font-size: 29px; font-weight: 900; line-height: 1.1; }
    .bw-subtitle { font-size: 18px; font-weight: 700; color: #475569; line-height: 1.35; margin-bottom: 16px; }

    .bw-list {
      display: flex; flex-direction: column; gap: 11px;
    }
    .bw-list-item {
      display: flex; align-items: flex-start; gap: 10px;
      font-size: 20px; font-weight: 800; color: #0F172A; line-height: 1.25;
    }
    .bw-bullet {
      width: 8px; height: 8px; border-radius: 50%; margin-top: 8px; flex-shrink: 0;
    }

    .bw-footer-tag {
      margin-top: 14px;
      padding: 9px 12px;
      border-radius: 12px;
      font-size: 14.5px;
      font-weight: 800;
      text-transform: uppercase;
      text-align: center;
      letter-spacing: 0.5px;
    }
    .tag-b { background: rgba(15, 71, 128, 0.08); color: #0F4780; border: 1px solid rgba(15, 71, 128, 0.20); }
    .tag-r { background: rgba(241, 67, 67, 0.08); color: #F14343; border: 1px solid rgba(241, 67, 67, 0.20); }
    .tag-y { background: rgba(255, 204, 0, 0.20); color: #854D0E; border: 1px solid rgba(217, 119, 6, 0.30); }
  `;

  const middleContentHtml = `
      <!-- OPÇÃO 1: JANELAS DE NAVEGADOR EM CASCATA -->
      <div class="cascading-browser-grid">
        <!-- Janela 1: Eixo Social (Elevada a 430px, preenchendo o azul da esquerda) -->
        <div class="browser-window-card bw-card-1">
          <div class="bw-topbar">
            <div class="bw-dots">
              <span class="bw-dot bwd-r"></span>
              <span class="bw-dot bwd-y"></span>
              <span class="bw-dot bwd-g"></span>
            </div>
            <div class="bw-url-chip">
              <span>🔒</span>
              <span>hub-labdiv.vercel.app/</span>
            </div>
            <div style="width: 20px;"></div>
          </div>
          <div class="bw-body">
            <div>
              <div class="bw-header-row">
                <div class="bw-icon-badge badge-b">
                  <svg width="28" height="28" viewBox="0 -960 960 960" fill="currentColor">
                    <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/>
                  </svg>
                </div>
                <h3 class="font-bukra bw-title" style="color: #0F4780;">Eixo Social</h3>
              </div>
              <p class="font-open-sans bw-subtitle">Comunicação dialógica &amp; vivências</p>

              <div class="bw-list font-open-sans">
                <div class="bw-list-item">
                  <span class="bw-bullet" style="background: #0F4780;"></span>
                  <span>Feeds Fluxo, Galeria &amp; Logs</span>
                </div>
                <div class="bw-list-item">
                  <span class="bw-bullet" style="background: #0F4780;"></span>
                  <span>Artigos com Balões de Reflexão</span>
                </div>
                <div class="bw-list-item">
                  <span class="bw-bullet" style="background: #0F4780;"></span>
                  <span>Gamificação, XP &amp; Comunidade</span>
                </div>
                <div class="bw-list-item">
                  <span class="bw-bullet" style="background: #0F4780;"></span>
                  <span>Dicas Reais de Veteranos</span>
                </div>
              </div>
            </div>

            <div class="bw-footer-tag tag-b font-bukra">
              REDE DIALÓGICA &bull; 3 FEEDS
            </div>
          </div>
        </div>

        <!-- Janela 2: Eixo Informativo (Em 540px) -->
        <div class="browser-window-card bw-card-2">
          <div class="bw-topbar">
            <div class="bw-dots">
              <span class="bw-dot bwd-r"></span>
              <span class="bw-dot bwd-y"></span>
              <span class="bw-dot bwd-g"></span>
            </div>
            <div class="bw-url-chip">
              <span>🔒</span>
              <span>hub-labdiv.vercel.app/gcif</span>
            </div>
            <div style="width: 20px;"></div>
          </div>
          <div class="bw-body">
            <div>
              <div class="bw-header-row">
                <div class="bw-icon-badge badge-r">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    <circle cx="12" cy="12" r="9.5" stroke-dasharray="2 2" stroke-width="1.5" />
                    <circle cx="12" cy="12" r="4.2" stroke-width="1.6" />
                  </svg>
                </div>
                <h3 class="font-bukra bw-title" style="color: #F14343;">Informativo</h3>
              </div>
              <p class="font-open-sans bw-subtitle">Central CGIF, memória &amp; pesquisa</p>

              <div class="bw-list font-open-sans">
                <div class="bw-list-item">
                  <span class="bw-bullet" style="background: #F14343;"></span>
                  <span>Matrizes de Bach., Lic. &amp; FisMed</span>
                </div>
                <div class="bw-list-item">
                  <span class="bw-bullet" style="background: #F14343;"></span>
                  <span>120+ Docentes, Salas &amp; Labs</span>
                </div>
                <div class="bw-list-item">
                  <span class="bw-bullet" style="background: #F14343;"></span>
                  <span>Mural de Bolsas (PUB, PAPFE, IC)</span>
                </div>
                <div class="bw-list-item">
                  <span class="bw-bullet" style="background: #F14343;"></span>
                  <span>Colóquios Gerais &amp; Notícias IF</span>
                </div>
              </div>
            </div>

            <div class="bw-footer-tag tag-r font-bukra">
              CENTRAL CGIF &bull; WIKI VIVA
            </div>
          </div>
        </div>

        <!-- Janela 3: Eixo Ferramentas (Em 650px, abaixo do hero icon) -->
        <div class="browser-window-card bw-card-3">
          <div class="bw-topbar">
            <div class="bw-dots">
              <span class="bw-dot bwd-r"></span>
              <span class="bw-dot bwd-y"></span>
              <span class="bw-dot bwd-g"></span>
            </div>
            <div class="bw-url-chip">
              <span>🔒</span>
              <span>.../ferramentas</span>
            </div>
            <div style="width: 20px;"></div>
          </div>
          <div class="bw-body">
            <div>
              <div class="bw-header-row">
                <div class="bw-icon-badge badge-y">
                  <svg width="28" height="28" viewBox="0 -960 960 960" fill="currentColor">
                    <path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z"/>
                  </svg>
                </div>
                <h3 class="font-bukra bw-title" style="color: #854D0E;">Ferramentas</h3>
              </div>
              <p class="font-open-sans bw-subtitle">Produtividade acadêmica diária</p>

              <div class="bw-list font-open-sans">
                <div class="bw-list-item">
                  <span class="bw-bullet" style="background: #D97706;"></span>
                  <span>Grade 1h:1h &amp; Horas AEx</span>
                </div>
                <div class="bw-list-item">
                  <span class="bw-bullet" style="background: #D97706;"></span>
                  <span>Mapa &amp; Circulares USP ao Vivo</span>
                </div>
                <div class="bw-list-item">
                  <span class="bw-bullet" style="background: #D97706;"></span>
                  <span>Toolkit LabDiv de Pôsteres</span>
                </div>
                <div class="bw-list-item">
                  <span class="bw-bullet" style="background: #D97706;"></span>
                  <span>Softwares &amp; Simuladores Livres</span>
                </div>
              </div>
            </div>

            <div class="bw-footer-tag tag-y font-bukra">
              UTILITÁRIOS &bull; SUPORTE REAL
            </div>
          </div>
        </div>
      </div>
  `;

  return getHtmlShell({
    title: 'HUB LabDiv - Opção 1 (Janelas de Navegador em Cascata)',
    capeloSvg,
    qrSvg,
    middleContentHtml,
    extraCss
  });
}

// =========================================================================
// OPÇÃO 2: Barra de Navegação Superior Web + Três Painéis Conectados
// Barra flutuante em y = 435px (no azul) e 3 painéis web limpos abaixo
// =========================================================================
function buildOption2({ qrSvg, capeloSvg }) {
  const extraCss = `
    .web-navbar-container {
      position: absolute;
      top: 435px;
      left: 55px;
      right: 55px;
      z-index: 28;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }
    .web-main-nav {
      background: rgba(15, 23, 42, 0.90);
      backdrop-filter: blur(16px);
      border: 1.5px solid rgba(255, 255, 255, 0.20);
      border-radius: 999px;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #FFFFFF;
      box-shadow: 0 16px 36px rgba(0,0,0,0.22);
    }
    .web-nav-brand {
      display: flex; align-items: center; gap: 10px;
      font-size: 18px; font-weight: 900;
    }
    .web-nav-links {
      display: flex; align-items: center; gap: 10px;
    }
    .nav-btn-link {
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 14px;
      font-weight: 800;
      display: flex; align-items: center; gap: 6px;
    }
    .nl-blue { background: #0F4780; color: #FFFFFF; border: 1px solid #38BDF8; }
    .nl-red { background: #F14343; color: #FFFFFF; border: 1px solid #FCA5A5; }
    .nl-yellow { background: #FFCC00; color: #0F172A; border: 1px solid #FEF08A; }

    .cascading-web-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    .web-panel {
      background: #FFFFFF;
      border-radius: 26px;
      padding: 26px 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 20px 50px rgba(0,0,0,0.08);
      position: relative;
      overflow: hidden;
    }
    .wp-1 {
      height: 480px;
      border: 2px solid rgba(15, 71, 128, 0.30);
      box-shadow: 0 20px 45px rgba(15, 71, 128, 0.15);
    }
    .wp-2 {
      margin-top: 100px;
      height: 480px;
      border: 2px solid rgba(241, 67, 67, 0.30);
      box-shadow: 0 20px 45px rgba(241, 67, 67, 0.15);
    }
    .wp-3 {
      margin-top: 200px;
      height: 480px;
      border: 2.5px solid rgba(255, 204, 0, 0.50);
      box-shadow: 0 20px 45px rgba(217, 119, 6, 0.15);
    }

    .wp-accent-line {
      position: absolute; top: 0; left: 0; right: 0; height: 6px;
    }
    .accent-blue { background: #0F4780; }
    .accent-red { background: #F14343; }
    .accent-yellow { background: #FFCC00; }

    .wp-route-badge {
      font-size: 13px; font-weight: 800; font-family: monospace;
      padding: 4px 12px; border-radius: 8px; margin-bottom: 12px;
      display: inline-block; width: fit-content;
    }
    .wp-title { font-size: 30px; font-weight: 900; line-height: 1.1; margin-bottom: 6px; }
    .wp-sub { font-size: 17.5px; font-weight: 700; color: #475569; line-height: 1.35; margin-bottom: 18px; }

    .wp-items { display: flex; flex-direction: column; gap: 11px; }
    .wp-item-row {
      display: flex; align-items: flex-start; gap: 10px;
      font-size: 20px; font-weight: 800; color: #0F172A; line-height: 1.25;
    }
    .wp-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 8px; flex-shrink: 0; }

    .wp-action-button {
      width: 100%; padding: 12px; border-radius: 14px;
      font-size: 15.5px; font-weight: 900; text-transform: uppercase;
      text-align: center; letter-spacing: 0.5px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
  `;

  const middleContentHtml = `
      <!-- OPÇÃO 2: BARRA DE NAVEGAÇÃO WEB + PAINÉIS ESCALONADOS -->
      <div class="web-navbar-container">
        <!-- Barra de Navegação Web Flutuante -->
        <div class="web-main-nav font-bukra">
          <div class="web-nav-brand">
            <span style="color: #FFCC00;">●</span>
            <span>HUB LABDIV &bull; NAVEGAÇÃO EM 3 EIXOS</span>
          </div>
          <div class="web-nav-links font-bukra">
            <span class="nav-btn-link nl-blue">EIXO SOCIAL (/)</span>
            <span class="nav-btn-link nl-red">INFORMATIVO (/gcif)</span>
            <span class="nav-btn-link nl-yellow">FERRAMENTAS (/ferramentas)</span>
          </div>
        </div>

        <!-- Três Painéis Web em Cascata -->
        <div class="cascading-web-grid">
          <!-- Painel 1: Social -->
          <div class="web-panel wp-1">
            <div class="wp-accent-line accent-blue"></div>
            <div>
              <span class="wp-route-badge font-bukra" style="background: rgba(15, 71, 128, 0.10); color: #0F4780;">ROTA: /</span>
              <h3 class="font-bukra wp-title" style="color: #0F4780;">Eixo Social</h3>
              <p class="font-open-sans wp-sub">Rede dialógica &amp; vivências científicas</p>

              <div class="wp-items font-open-sans">
                <div class="wp-item-row">
                  <span class="wp-dot" style="background: #0F4780;"></span>
                  <span>Feeds Fluxo, Galeria &amp; Registros</span>
                </div>
                <div class="wp-item-row">
                  <span class="wp-dot" style="background: #0F4780;"></span>
                  <span>Artigos com Balões de Reflexão</span>
                </div>
                <div class="wp-item-row">
                  <span class="wp-dot" style="background: #0F4780;"></span>
                  <span>Gamificação &amp; Dicas de Veteranos</span>
                </div>
              </div>
            </div>

            <div class="wp-action-button font-bukra" style="background: rgba(15, 71, 128, 0.10); color: #0F4780; border: 1.5px solid rgba(15, 71, 128, 0.25);">
              <span>Acessar Comunidade &rarr;</span>
            </div>
          </div>

          <!-- Painel 2: Informativo -->
          <div class="web-panel wp-2">
            <div class="wp-accent-line accent-red"></div>
            <div>
              <span class="wp-route-badge font-bukra" style="background: rgba(241, 67, 67, 0.10); color: #F14343;">ROTA: /gcif</span>
              <h3 class="font-bukra wp-title" style="color: #F14343;">Informativo</h3>
              <p class="font-open-sans wp-sub">Central CGIF, memória &amp; oportunidades</p>

              <div class="wp-items font-open-sans">
                <div class="wp-item-row">
                  <span class="wp-dot" style="background: #F14343;"></span>
                  <span>Matrizes de Bach., Lic. &amp; FisMed</span>
                </div>
                <div class="wp-item-row">
                  <span class="wp-dot" style="background: #F14343;"></span>
                  <span>120+ Docentes, Salas &amp; Labs</span>
                </div>
                <div class="wp-item-row">
                  <span class="wp-dot" style="background: #F14343;"></span>
                  <span>Mural de Bolsas (PUB, PAPFE, IC)</span>
                </div>
              </div>
            </div>

            <div class="wp-action-button font-bukra" style="background: rgba(241, 67, 67, 0.10); color: #F14343; border: 1.5px solid rgba(241, 67, 67, 0.25);">
              <span>Consultar Wiki &rarr;</span>
            </div>
          </div>

          <!-- Painel 3: Ferramentas -->
          <div class="web-panel wp-3">
            <div class="wp-accent-line accent-yellow"></div>
            <div>
              <span class="wp-route-badge font-bukra" style="background: rgba(255, 204, 0, 0.25); color: #854D0E;">ROTA: /ferramentas</span>
              <h3 class="font-bukra wp-title" style="color: #854D0E;">Ferramentas</h3>
              <p class="font-open-sans wp-sub">Produtividade acadêmica diária</p>

              <div class="wp-items font-open-sans">
                <div class="wp-item-row">
                  <span class="wp-dot" style="background: #D97706;"></span>
                  <span>Grade Horária 1h:1h &amp; Horas AEx</span>
                </div>
                <div class="wp-item-row">
                  <span class="wp-dot" style="background: #D97706;"></span>
                  <span>Mapa do Campus &amp; Circulares USP</span>
                </div>
                <div class="wp-item-row">
                  <span class="wp-dot" style="background: #D97706;"></span>
                  <span>Toolkit de Pôsteres &amp; Softwares</span>
                </div>
              </div>
            </div>

            <div class="wp-action-button font-bukra" style="background: rgba(255, 204, 0, 0.25); color: #854D0E; border: 1.5px solid #FFCC00;">
              <span>Abrir Ferramentas &rarr;</span>
            </div>
          </div>
        </div>
      </div>
  `;

  return getHtmlShell({
    title: 'HUB LabDiv - Opção 2 (Barra de Navegação Web + Painéis em Cascata)',
    capeloSvg,
    qrSvg,
    middleContentHtml,
    extraCss
  });
}

// =========================================================================
// OPÇÃO 3: Dark Mode Web Components (Visual Oficial do HUB: #1E1E1E)
// Painéis na estética escura oficial do site, com alto contraste e presença
// =========================================================================
function buildOption3({ qrSvg, capeloSvg }) {
  const extraCss = `
    .dark-web-grid {
      position: absolute;
      top: 0; left: 55px; right: 55px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 26px;
      z-index: 28;
    }
    .dark-panel-card {
      background: #1E1E1E;
      border-radius: 26px;
      box-shadow: 0 30px 70px rgba(0, 0, 0, 0.35), 0 4px 14px rgba(0,0,0,0.20);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      padding: 28px 22px;
      color: #FFFFFF;
      position: relative;
    }
    .dp-1 {
      margin-top: 430px;
      height: 520px;
      border: 2px solid #0284C7;
      box-shadow: 0 25px 60px rgba(2, 132, 199, 0.25);
    }
    .dp-2 {
      margin-top: 540px;
      height: 520px;
      border: 2px solid #F14343;
      box-shadow: 0 25px 60px rgba(241, 67, 67, 0.25);
    }
    .dp-3 {
      margin-top: 650px;
      height: 520px;
      border: 2px solid #FFCC00;
      box-shadow: 0 25px 60px rgba(255, 204, 0, 0.25);
    }

    .dp-header-bar {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 14px;
    }
    .dp-route-badge {
      font-size: 13px; font-weight: 800; font-family: monospace;
      padding: 4px 12px; border-radius: 8px;
    }
    .dp-tag-b { background: rgba(2, 132, 199, 0.25); color: #38BDF8; border: 1px solid #0284C7; }
    .dp-tag-r { background: rgba(241, 67, 67, 0.25); color: #FCA5A5; border: 1px solid #F14343; }
    .dp-tag-y { background: rgba(255, 204, 0, 0.25); color: #FEF08A; border: 1px solid #FFCC00; }

    .dp-status-dot {
      display: flex; align-items: center; gap: 6px;
      font-size: 11.5px; font-weight: 800; text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-active { color: #10B981; }

    .dp-title { font-size: 30px; font-weight: 900; line-height: 1.1; margin-bottom: 6px; color: #FFFFFF; }
    .dp-sub { font-size: 17.5px; font-weight: 600; color: #94A3B8; line-height: 1.35; margin-bottom: 20px; }

    .dp-items { display: flex; flex-direction: column; gap: 12px; }
    .dp-item-row {
      display: flex; align-items: flex-start; gap: 10px;
      font-size: 19.5px; font-weight: 800; color: #F8FAFC; line-height: 1.25;
    }
    .dp-bullet { width: 8px; height: 8px; border-radius: 50%; margin-top: 8px; flex-shrink: 0; }

    .dp-action-pill {
      margin-top: 14px;
      padding: 11px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 900;
      text-transform: uppercase;
      text-align: center;
      letter-spacing: 0.5px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #FFFFFF;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
  `;

  const middleContentHtml = `
      <!-- OPÇÃO 3: COMPONENTES DARK MODE WEB DO HUB -->
      <div class="dark-web-grid">
        <!-- Card 1: Social Dark Mode -->
        <div class="dark-panel-card dp-1">
          <div>
            <div class="dp-header-bar">
              <span class="dp-route-badge dp-tag-b font-bukra">ROTA: /</span>
              <span class="dp-status-dot status-active font-bukra">&bull; ATIVO</span>
            </div>
            <h3 class="font-bukra dp-title">Eixo Social</h3>
            <p class="font-open-sans dp-sub">Rede dialógica &amp; vivências científicas</p>

            <div class="dp-items font-open-sans">
              <div class="dp-item-row">
                <span class="dp-bullet" style="background: #38BDF8;"></span>
                <span>Feeds Fluxo, Galeria &amp; Logs</span>
              </div>
              <div class="dp-item-row">
                <span class="dp-bullet" style="background: #38BDF8;"></span>
                <span>Artigos com Balões Freirianos</span>
              </div>
              <div class="dp-item-row">
                <span class="dp-bullet" style="background: #38BDF8;"></span>
                <span>Gamificação &amp; Dicas de Veteranos</span>
              </div>
            </div>
          </div>

          <div class="dp-action-pill font-bukra">
            <span>Acessar Comunidade &rarr;</span>
          </div>
        </div>

        <!-- Card 2: Informativo Dark Mode -->
        <div class="dark-panel-card dp-2">
          <div>
            <div class="dp-header-bar">
              <span class="dp-route-badge dp-tag-r font-bukra">ROTA: /gcif</span>
              <span class="dp-status-dot status-active font-bukra">&bull; ATIVO</span>
            </div>
            <h3 class="font-bukra dp-title">Informativo</h3>
            <p class="font-open-sans dp-sub">Central CGIF, memória &amp; pesquisa no IF</p>

            <div class="dp-items font-open-sans">
              <div class="dp-item-row">
                <span class="dp-bullet" style="background: #F87171;"></span>
                <span>Matrizes de Bach., Lic. &amp; FisMed</span>
              </div>
              <div class="dp-item-row">
                <span class="dp-bullet" style="background: #F87171;"></span>
                <span>120+ Docentes, Salas &amp; Labs</span>
              </div>
              <div class="dp-item-row">
                <span class="dp-bullet" style="background: #F87171;"></span>
                <span>Mural de Bolsas (PUB, PAPFE, IC)</span>
              </div>
            </div>
          </div>

          <div class="dp-action-pill font-bukra">
            <span>Consultar Wiki CGIF &rarr;</span>
          </div>
        </div>

        <!-- Card 3: Ferramentas Dark Mode -->
        <div class="dark-panel-card dp-3">
          <div>
            <div class="dp-header-bar">
              <span class="dp-route-badge dp-tag-y font-bukra">ROTA: /ferramentas</span>
              <span class="dp-status-dot status-active font-bukra">&bull; ATIVO</span>
            </div>
            <h3 class="font-bukra dp-title">Ferramentas</h3>
            <p class="font-open-sans dp-sub">Produtividade acadêmica diária</p>

            <div class="dp-items font-open-sans">
              <div class="dp-item-row">
                <span class="dp-bullet" style="background: #FBBF24;"></span>
                <span>Grade Horária 1h:1h &amp; Horas AEx</span>
              </div>
              <div class="dp-item-row">
                <span class="dp-bullet" style="background: #FBBF24;"></span>
                <span>Mapa do Campus &amp; Circulares USP</span>
              </div>
              <div class="dp-item-row">
                <span class="dp-bullet" style="background: #FBBF24;"></span>
                <span>Toolkit LabDiv &amp; Softwares Livres</span>
              </div>
            </div>
          </div>

          <div class="dp-action-pill font-bukra">
            <span>Abrir Utilitários &rarr;</span>
          </div>
        </div>
      </div>
  `;

  return getHtmlShell({
    title: 'HUB LabDiv - Opção 3 (Dark Mode Web Components do HUB)',
    capeloSvg,
    qrSvg,
    middleContentHtml,
    extraCss
  });
}

async function renderHtmlToPng(browser, htmlPath, outPngPath, previewPath = null) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: outPngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Gerado: ${outPngPath}`);

  if (previewPath) {
    const previewPage = await browser.newPage();
    await previewPage.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 0.5 });
    await previewPage.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await previewPage.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 400));
    await previewPage.screenshot({
      path: previewPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1240, height: 1754 }
    });
    await previewPage.close();
    console.log(`✅ Preview gerado: ${previewPath}`);
  }

  await page.close();
}

async function main() {
  console.log('🚀 Gerando 3 opções refinadas que eliminam o vazio do azul e remetem a elementos de site...');

  const qrSvgRaw = await QRCode.toString('https://hub-lab-div.vercel.app/divulgacao', {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1
  });
  const qrSvg = qrSvgRaw.replace(/<\?xml[^>]*\?>/gi, '').trim();

  const capeloSvgPath = path.join(PROJECT_ROOT, 'public/icone-HUBLabDiv.svg');
  let capeloSvg = '';
  if (fs.existsSync(capeloSvgPath)) {
    capeloSvg = fs.readFileSync(capeloSvgPath, 'utf8')
      .replace(/<\?xml[^>]*\?>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
  }

  const scratchDir = path.join(ARTIFACT_DIR, 'scratch');
  fs.mkdirSync(scratchDir, { recursive: true });

  // Opção 1: Janelas de Navegador em Cascata
  const html1 = buildOption1({ qrSvg, capeloSvg });
  const html1Path = path.join(scratchDir, 'poster1_opcao1_browsers.html');
  fs.writeFileSync(html1Path, html1, 'utf8');

  // Opção 2: Barra de Navegação Web + Painéis
  const html2 = buildOption2({ qrSvg, capeloSvg });
  const html2Path = path.join(scratchDir, 'poster1_opcao2_navbar.html');
  fs.writeFileSync(html2Path, html2, 'utf8');

  // Opção 3: Dark Mode Web Components (Visual do site)
  const html3 = buildOption3({ qrSvg, capeloSvg });
  const html3Path = path.join(scratchDir, 'poster1_opcao3_darkmode.html');
  fs.writeFileSync(html3Path, html3, 'utf8');

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  console.log('Renderizando Opção 1 (Janelas de Navegador em Cascata)...');
  await renderHtmlToPng(
    browser,
    html1Path,
    path.join(ARTIFACT_DIR, 'poster1_opcao1_browsers.png'),
    path.join(ARTIFACT_DIR, 'poster1_opcao1_browsers_preview.png')
  );

  console.log('Renderizando Opção 2 (Barra de Navegação Web + Painéis)...');
  await renderHtmlToPng(
    browser,
    html2Path,
    path.join(ARTIFACT_DIR, 'poster1_opcao2_navbar.png'),
    path.join(ARTIFACT_DIR, 'poster1_opcao2_navbar_preview.png')
  );

  console.log('Renderizando Opção 3 (Dark Mode Web Components)...');
  await renderHtmlToPng(
    browser,
    html3Path,
    path.join(ARTIFACT_DIR, 'poster1_opcao3_darkmode.png'),
    path.join(ARTIFACT_DIR, 'poster1_opcao3_darkmode_preview.png')
  );

  await browser.close();
  console.log('🎉 Todas as 3 opções refinadas foram renderizadas com sucesso!');
}

main().catch(err => {
  console.error('❌ Erro no script:', err);
  process.exit(1);
});
