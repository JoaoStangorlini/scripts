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
       font-size: 44px; line-height: 1.12; font-weight: 900; margin-bottom: 14px;
       letter-spacing: -0.5px;
    }
    .p12-subline {
       font-size: 20.5px; color: rgba(255, 255, 255, 0.95); line-height: 1.38; font-weight: 600;
       max-width: 580px;
    }

    /* COLUNA DIREITA HERO */
    .p12-right-hero-col {
       position: absolute; top: 75px; right: 60px;
       display: flex; flex-direction: column; align-items: center;
       z-index: 25;
    }
    .p12-icon-wrapper {
       width: 480px; height: 480px;
       background: #FFFFFF; border-radius: 50%;
       display: flex; align-items: center; justify-content: center;
       box-shadow: 0 24px 60px rgba(0,0,0,0.22);
    }
    .p12-icon-inner {
       width: 440px; height: 440px;
       display: flex; align-items: center; justify-content: center;
    }
    .p12-icon-inner svg {
       width: 100%; height: 100%; display: block;
    }
    .p12-icon-branding {
       margin-top: 10px; text-align: center;
    }
    .p12-brand-title {
       font-size: 48px; font-weight: 900; letter-spacing: -1px; line-height: 1;
    }
    .hub-white { color: #FFFFFF; }
    .labdiv-gradient {
       background: linear-gradient(90deg, #38BDF8 0%, #0F4780 40%, #F14343 70%, #FFCC00 100%);
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
// OPÇÃO 1: "Web Browser App Window" (Navegador Desktop Único e Imersivo)
// Inicia no azul da esquerda em y = 350px com uma barra de busca e abas ativas,
// e se expande em 3 colunas de componentes de interface web conectados!
// =========================================================================
function buildOption1({ qrSvg, capeloSvg }) {
  const extraCss = `
    .web-app-container {
      position: absolute;
      top: 355px; left: 50px; right: 50px;
      height: 940px;
      z-index: 28;
      display: flex;
      flex-direction: column;
    }

    /* Top Web Command / Search Bar no Azul */
    .web-top-search-dock {
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(14px);
      border-radius: 20px;
      border: 2px solid rgba(255, 255, 255, 0.8);
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.16);
      margin-bottom: 20px;
      width: 590px;
    }
    .wtsd-left {
      display: flex; align-items: center; gap: 12px;
      color: #0F4780; font-size: 19px; font-weight: 700;
    }
    .wtsd-left svg { flex-shrink: 0; }
    .wtsd-shortcut {
      background: #F1F5F9; border: 1.5px solid #CBD5E1;
      padding: 4px 10px; border-radius: 8px;
      font-size: 14px; font-weight: 800; color: #475569;
    }

    /* 3 Web Panels em Cascata Geometrizada */
    .web-triad-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      flex: 1;
    }

    .web-pillar-window {
      background: #FFFFFF;
      border-radius: 24px;
      border: 2px solid #E2E8F0;
      box-shadow: 0 20px 48px rgba(15, 71, 128, 0.16);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .wp-social {
      height: 830px;
      border-color: rgba(15, 71, 128, 0.35);
    }
    .wp-cgif {
      margin-top: 70px;
      height: 760px;
      border-color: rgba(241, 67, 67, 0.35);
    }
    .wp-ferramentas {
      margin-top: 190px;
      height: 640px;
      border-color: rgba(255, 204, 0, 0.55);
    }

    .wp-topbar {
      height: 48px;
      background: #F8FAFC;
      border-bottom: 2px solid #E2E8F0;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .wp-dots { display: flex; gap: 6px; }
    .wp-dot { width: 11px; height: 11px; border-radius: 50%; }
    .wp-dot.r { background: #EF4444; }
    .wp-dot.y { background: #F59E0B; }
    .wp-dot.g { background: #10B981; }

    .wp-route-tag {
      font-family: monospace;
      font-size: 14px;
      font-weight: 800;
      padding: 3px 10px;
      border-radius: 6px;
      border: 1px solid transparent;
    }
    .route-b { background: #EEF4FA; color: #0F4780; border-color: rgba(15, 71, 128, 0.2); }
    .route-r { background: #FEF2F2; color: #F14343; border-color: rgba(241, 67, 67, 0.2); }
    .route-y { background: #FEF9C3; color: #854D0E; border-color: rgba(255, 204, 0, 0.5); }

    .wp-body {
      padding: 24px 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
    }

    .wp-title-block { margin-bottom: 18px; }
    .wp-axis-badge {
      font-size: 13.5px; font-weight: 900; text-transform: uppercase;
      letter-spacing: 0.8px; margin-bottom: 6px; display: inline-block;
    }
    .wp-h2 {
      font-size: 29px; font-weight: 900; line-height: 1.15; color: #0F172A; margin-bottom: 6px;
    }
    .wp-subdesc {
      font-size: 17.5px; font-weight: 600; color: #475569; line-height: 1.35;
    }

    .wp-feature-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin: 10px 0 auto 0;
    }
    .wp-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .wp-bullet-icon {
      width: 28px; height: 28px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 2px;
      font-weight: 900; font-size: 15px;
    }
    .b-blue { background: #EEF4FA; color: #0F4780; }
    .b-red { background: #FEF2F2; color: #F14343; }
    .b-yellow { background: #FEF9C3; color: #854D0E; }

    .wp-item-text {
      font-size: 20px;
      line-height: 1.4;
      color: #1E293B;
    }
    .wp-item-text strong {
      font-weight: 800;
      color: #0F172A;
    }

    /* Web UI Mini Mockup no final do card */
    .wp-footer-action {
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1.5px solid #F1F5F9;
    }
    .wp-btn {
      width: 100%;
      padding: 13px 18px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
    }
    .btn-b { background: #0F4780; color: #FFFFFF; }
    .btn-r { background: #F14343; color: #FFFFFF; }
    .btn-y { background: #FFCC00; color: #0F172A; }
  `;

  const middleContentHtml = `
    <div class="web-app-container font-open-sans">
      <!-- Top Web Search Bar eliminando o vazio do azul -->
      <div class="web-top-search-dock">
        <div class="wtsd-left">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
          <span>Buscar no HUB: matérias, bolsas, salas...</span>
        </div>
        <div class="wtsd-shortcut font-bukra">Ctrl + K</div>
      </div>

      <!-- 3 Web Pillars em Cascata -->
      <div class="web-triad-grid">
        <!-- Eixo Social -->
        <div class="web-pillar-window wp-social">
          <div class="wp-topbar">
            <div class="wp-dots">
              <div class="wp-dot r"></div>
              <div class="wp-dot y"></div>
              <div class="wp-dot g"></div>
            </div>
            <div class="wp-route-tag route-b">GET /comunidade</div>
          </div>
          <div class="wp-body">
            <div>
              <div class="wp-title-block">
                <span class="wp-axis-badge font-bukra" style="color: #0F4780;">EIXO 1 &bull; SOCIAL</span>
                <h2 class="wp-h2 font-bukra">Comunidade</h2>
                <p class="wp-subdesc">Comunicação dialógica e permanência estudantil</p>
              </div>

              <div class="wp-feature-list">
                <div class="wp-item">
                  <div class="wp-bullet-icon b-blue font-bukra">&bull;</div>
                  <div class="wp-item-text"><strong>Feeds Integrados:</strong> 3 abas ativas — Fluxo, Registros e Galeria.</div>
                </div>
                <div class="wp-item">
                  <div class="wp-bullet-icon b-blue font-bukra">&bull;</div>
                  <div class="wp-item-text"><strong>Artigos com Balões Freirianos:</strong> debates científicos e reflexão crítica.</div>
                </div>
                <div class="wp-item">
                  <div class="wp-bullet-icon b-blue font-bukra">&bull;</div>
                  <div class="wp-item-text"><strong>Vivências &amp; Diários:</strong> relatos discentes de permanência e apoio mútuo.</div>
                </div>
                <div class="wp-item">
                  <div class="wp-bullet-icon b-blue font-bukra">&bull;</div>
                  <div class="wp-item-text"><strong>Gamificação &amp; XP:</strong> dicas de veteranos e recompensas de participação.</div>
                </div>
              </div>
            </div>

            <div class="wp-footer-action">
              <div class="wp-btn btn-b font-bukra">ACESSAR COMUNIDADE &rarr;</div>
            </div>
          </div>
        </div>

        <!-- Eixo Informativo -->
        <div class="web-pillar-window wp-cgif">
          <div class="wp-topbar">
            <div class="wp-dots">
              <div class="wp-dot r"></div>
              <div class="wp-dot y"></div>
              <div class="wp-dot g"></div>
            </div>
            <div class="wp-route-tag route-r">GET /cgif</div>
          </div>
          <div class="wp-body">
            <div>
              <div class="wp-title-block">
                <span class="wp-axis-badge font-bukra" style="color: #F14343;">EIXO 2 &bull; INFORMATIVO</span>
                <h2 class="wp-h2 font-bukra">CGIF &amp; Wiki</h2>
                <p class="wp-subdesc">Central de conhecimento e memória do IFUSP</p>
              </div>

              <div class="wp-feature-list">
                <div class="wp-item">
                  <div class="wp-bullet-icon b-red font-bukra">&bull;</div>
                  <div class="wp-item-text"><strong>Wiki Centralizada:</strong> manuais de curso, PPPs, editais e protocolos em um só lugar.</div>
                </div>
                <div class="wp-item">
                  <div class="wp-bullet-icon b-red font-bukra">&bull;</div>
                  <div class="wp-item-text"><strong>Grades Curriculares:</strong> Bacharelado (8 e 10 sem), Licenciatura e Física Médica.</div>
                </div>
                <div class="wp-item">
                  <div class="wp-bullet-icon b-red font-bukra">&bull;</div>
                  <div class="wp-item-text"><strong>Mural de Oportunidades:</strong> catálogo em tempo real de bolsas PUB, PAPFE e IC.</div>
                </div>
                <div class="wp-item">
                  <div class="wp-bullet-icon b-red font-bukra">&bull;</div>
                  <div class="wp-item-text"><strong>120+ Docentes &amp; Labs:</strong> catálogo completo com salas e contatos.</div>
                </div>
              </div>
            </div>

            <div class="wp-footer-action">
              <div class="wp-btn btn-r font-bukra">EXPLORAR WIKI &rarr;</div>
            </div>
          </div>
        </div>

        <!-- Eixo Ferramentas -->
        <div class="web-pillar-window wp-ferramentas">
          <div class="wp-topbar">
            <div class="wp-dots">
              <div class="wp-dot r"></div>
              <div class="wp-dot y"></div>
              <div class="wp-dot g"></div>
            </div>
            <div class="wp-route-tag route-y">GET /ferramentas</div>
          </div>
          <div class="wp-body">
            <div>
              <div class="wp-title-block">
                <span class="wp-axis-badge font-bukra" style="color: #854D0E;">EIXO 3 &bull; FERRAMENTAS</span>
                <h2 class="wp-h2 font-bukra">Ferramentas</h2>
                <p class="wp-subdesc">Produtividade acadêmica e apoio à pesquisa</p>
              </div>

              <div class="wp-feature-list">
                <div class="wp-item">
                  <div class="wp-bullet-icon b-yellow font-bukra">&bull;</div>
                  <div class="wp-item-text"><strong>Grade Horária 1h:1h:</strong> 1 hora de aula = 1 hora de estudo + contador de faltas.</div>
                </div>
                <div class="wp-item">
                  <div class="wp-bullet-icon b-yellow font-bukra">&bull;</div>
                  <div class="wp-item-text"><strong>Horas AEx &amp; Trilhas:</strong> cálculo dos 10% de extensão e pré-requisitos.</div>
                </div>
                <div class="wp-item">
                  <div class="wp-bullet-icon b-yellow font-bukra">&bull;</div>
                  <div class="wp-item-text"><strong>Match Acadêmico:</strong> "Quero uma IC" conectando alunos a pesquisadores.</div>
                </div>
                <div class="wp-item">
                  <div class="wp-bullet-icon b-yellow font-bukra">&bull;</div>
                  <div class="wp-item-text"><strong>Mobilidade &amp; Campus:</strong> Circulares USP em tempo real e mapas interativos.</div>
                </div>
              </div>
            </div>

            <div class="wp-footer-action">
              <div class="wp-btn btn-y font-bukra">ABRIR FERRAMENTAS &rarr;</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  return getHtmlShell({
    title: 'HUB LabDiv - Opção 1: Web Browser App Window',
    capeloSvg,
    qrSvg,
    middleContentHtml,
    extraCss
  });
}

// =========================================================================
// OPÇÃO 2: "Web Tab Bar & Interactive Modules" (Barra de Abas Web + 3 Módulos)
// Barra de navegação web com abas ativas no azul + 3 módulos de página web
// =========================================================================
function buildOption2({ qrSvg, capeloSvg }) {
  const extraCss = `
    .tabbar-master-container {
      position: absolute;
      top: 350px; left: 50px; right: 50px;
      height: 945px;
      z-index: 28;
      display: flex;
      flex-direction: column;
    }

    /* Web Tab Bar no Azul */
    .tabbar-nav-bar {
      background: #FFFFFF;
      border-radius: 20px;
      border: 2px solid rgba(15, 71, 128, 0.22);
      padding: 10px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 14px 36px rgba(15, 71, 128, 0.16);
      width: 590px;
      margin-bottom: 20px;
    }
    .tnb-brand {
      font-size: 16.5px; font-weight: 900; color: #0F4780; display: flex; align-items: center; gap: 8px;
    }
    .tnb-tabs { display: flex; gap: 6px; }
    .tnb-tab {
      padding: 6px 14px; border-radius: 10px; font-size: 13.5px; font-weight: 800;
      display: flex; align-items: center; gap: 6px;
    }
    .tt-b { background: #0F4780; color: #FFFFFF; }
    .tt-r { background: #FEF2F2; color: #F14343; border: 1px solid rgba(241, 67, 67, 0.25); }
    .tt-y { background: #FEF9C3; color: #854D0E; border: 1px solid rgba(255, 204, 0, 0.45); }

    /* 3 Colunas de Módulos Web em Cascata */
    .tabbar-columns {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      flex: 1;
    }

    .tabbar-card {
      background: #FFFFFF;
      border-radius: 26px;
      border: 2px solid #CBD5E1;
      box-shadow: 0 20px 48px rgba(15, 71, 128, 0.16);
      padding: 24px 22px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
    }
    .tc-1 {
      height: 835px;
      border-color: rgba(15, 71, 128, 0.35);
    }
    .tc-2 {
      margin-top: 80px;
      height: 755px;
      border-color: rgba(241, 67, 67, 0.35);
    }
    .tc-3 {
      margin-top: 190px;
      height: 645px;
      border-color: rgba(255, 204, 0, 0.55);
    }

    .tc-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
    }
    .tc-badge {
      font-size: 13px; font-weight: 900; text-transform: uppercase;
      padding: 4px 10px; border-radius: 6px;
    }
    .tcb-b { background: #EEF4FA; color: #0F4780; }
    .tcb-r { background: #FEF2F2; color: #F14343; }
    .tcb-y { background: #FEF9C3; color: #854D0E; }

    .tc-status {
      display: flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 800; color: #10B981;
    }
    .tc-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #10B981; }

    .tc-h2 { font-size: 29px; font-weight: 900; line-height: 1.15; color: #0F172A; margin-bottom: 4px; }
    .tc-subtitle { font-size: 17.5px; font-weight: 600; color: #475569; line-height: 1.35; margin-bottom: 16px; }

    .tc-points { display: flex; flex-direction: column; gap: 15px; }
    .tc-point {
      display: flex; align-items: flex-start; gap: 12px; font-size: 19.5px; line-height: 1.4; color: #1E293B;
    }
    .tc-point strong { font-weight: 800; color: #0F172A; }
    .tc-icon-box {
      width: 26px; height: 26px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 2px; font-weight: 900; font-size: 14px;
    }

    .tc-footer-row {
      border-top: 1.5px solid #F1F5F9; padding-top: 16px; margin-top: 16px;
    }
    .tc-btn {
      width: 100%; padding: 13px 16px; border-radius: 12px;
      font-size: 16px; font-weight: 800; text-align: center;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
  `;

  const middleContentHtml = `
    <div class="tabbar-master-container font-open-sans">
      <!-- Web Tab Bar no Azul -->
      <div class="tabbar-nav-bar">
        <div class="tnb-brand font-bukra">
          <span>&bull;</span> HUB LABDIV &bull; NAVEGAÇÃO
        </div>
        <div class="tnb-tabs font-bukra">
          <div class="tnb-tab tt-b">/comunidade</div>
          <div class="tnb-tab tt-r">/cgif</div>
          <div class="tnb-tab tt-y">/ferramentas</div>
        </div>
      </div>

      <!-- 3 Colunas de Módulos Web -->
      <div class="tabbar-columns">
        <!-- Coluna 1: Comunidade -->
        <div class="tabbar-card tc-1">
          <div>
            <div class="tc-header font-bukra">
              <span class="tc-badge tcb-b">EIXO 1 &bull; SOCIAL</span>
              <div class="tc-status"><div class="tc-status-dot"></div> ONLINE</div>
            </div>
            <h2 class="tc-h2 font-bukra">Comunidade</h2>
            <p class="tc-subtitle">Comunicação dialógica e permanência estudantil</p>

            <div class="tc-points">
              <div class="tc-point">
                <div class="tc-icon-box tcb-b font-bukra">&bull;</div>
                <div><strong>Feeds Integrados:</strong> 3 abas ativas — Fluxo, Registros e Galeria.</div>
              </div>
              <div class="tc-point">
                <div class="tc-icon-box tcb-b font-bukra">&bull;</div>
                <div><strong>Balões Freirianos:</strong> debates científicos baseados no afeto e na escuta.</div>
              </div>
              <div class="tc-point">
                <div class="tc-icon-box tcb-b font-bukra">&bull;</div>
                <div><strong>Vivências Discentes:</strong> diários de permanência e apoio mútuo no IFUSP.</div>
              </div>
              <div class="tc-point">
                <div class="tc-icon-box tcb-b font-bukra">&bull;</div>
                <div><strong>Gamificação com XP:</strong> níveis de participação e dicas de veteranos.</div>
              </div>
            </div>
          </div>

          <div class="tc-footer-row font-bukra">
            <div class="tc-btn btn-b">ACESSAR COMUNIDADE &rarr;</div>
          </div>
        </div>

        <!-- Coluna 2: CGIF & Wiki -->
        <div class="tabbar-card tc-2">
          <div>
            <div class="tc-header font-bukra">
              <span class="tc-badge tcb-r">EIXO 2 &bull; INFORMATIVO</span>
              <div class="tc-status"><div class="tc-status-dot"></div> OFICIAL</div>
            </div>
            <h2 class="tc-h2 font-bukra">CGIF &amp; Wiki</h2>
            <p class="tc-subtitle">Central de conhecimento e memória do IFUSP</p>

            <div class="tc-points">
              <div class="tc-point">
                <div class="tc-icon-box tcb-r font-bukra">&bull;</div>
                <div><strong>Wiki Oficial:</strong> manuais, PPPs, editais e protocolos unificados.</div>
              </div>
              <div class="tc-point">
                <div class="tc-icon-box tcb-r font-bukra">&bull;</div>
                <div><strong>Grades Curriculares:</strong> Bacharelado (8/10 sem), Licenciatura e FisMed.</div>
              </div>
              <div class="tc-point">
                <div class="tc-icon-box tcb-r font-bukra">&bull;</div>
                <div><strong>Mural de Oportunidades:</strong> catálogo em tempo real de bolsas PUB, PAPFE e IC.</div>
              </div>
              <div class="tc-point">
                <div class="tc-icon-box tcb-r font-bukra">&bull;</div>
                <div><strong>120+ Docentes &amp; Salas:</strong> catálogo completo com salas e contatos.</div>
              </div>
            </div>
          </div>

          <div class="tc-footer-row font-bukra">
            <div class="tc-btn btn-r">EXPLORAR WIKI &rarr;</div>
          </div>
        </div>

        <!-- Coluna 3: Ferramentas -->
        <div class="tabbar-card tc-3">
          <div>
            <div class="tc-header font-bukra">
              <span class="tc-badge tcb-y">EIXO 3 &bull; FERRAMENTAS</span>
              <div class="tc-status"><div class="tc-status-dot"></div> ÚTIL</div>
            </div>
            <h2 class="tc-h2 font-bukra">Ferramentas</h2>
            <p class="tc-subtitle">Produtividade acadêmica e apoio à pesquisa</p>

            <div class="tc-points">
              <div class="tc-point">
                <div class="tc-icon-box tcb-y font-bukra">&bull;</div>
                <div><strong>Grade Horária 1h:1h:</strong> 1h aula = 1h estudo + contador de faltas.</div>
              </div>
              <div class="tc-point">
                <div class="tc-icon-box tcb-y font-bukra">&bull;</div>
                <div><strong>Horas AEx &amp; Trilhas:</strong> acompanhamento dos 10% de extensão.</div>
              </div>
              <div class="tc-point">
                <div class="tc-icon-box tcb-y font-bukra">&bull;</div>
                <div><strong>Match Acadêmico:</strong> "Quero uma IC" conectando alunos a pesquisadores.</div>
              </div>
              <div class="tc-point">
                <div class="tc-icon-box tcb-y font-bukra">&bull;</div>
                <div><strong>Circulares USP ao Vivo:</strong> linhas de ônibus e mapas interativos.</div>
              </div>
            </div>
          </div>

          <div class="tc-footer-row font-bukra">
            <div class="tc-btn btn-y">ABRIR FERRAMENTAS &rarr;</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return getHtmlShell({
    title: 'HUB LabDiv - Opção 2: Web Tab Bar & Modules',
    capeloSvg,
    qrSvg,
    middleContentHtml,
    extraCss
  });
}

// =========================================================================
// OPÇÃO 3: "Web Tabs & Integrated Interactive Suite" (Dock de Navegação Web)
// Apresenta uma barra de navegação estilo Safari/Chrome unificada no topo do vão
// conectando diretamente a 3 cartões estendidos com alto detalhamento.
// =========================================================================
function buildOption3({ qrSvg, capeloSvg }) {
  const extraCss = `
    .suite-container {
      position: absolute;
      top: 350px; left: 50px; right: 50px;
      height: 945px;
      z-index: 28;
      display: flex;
      flex-direction: column;
    }

    /* Web Dock de Navegação Superior */
    .suite-nav-dock {
      background: #FFFFFF;
      border-radius: 22px;
      border: 2px solid rgba(15, 71, 128, 0.25);
      box-shadow: 0 16px 40px rgba(15, 71, 128, 0.18);
      padding: 10px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 590px;
      margin-bottom: 22px;
    }
    .snd-title {
      font-size: 17px; font-weight: 900; color: #0F4780; display: flex; align-items: center; gap: 8px;
    }
    .snd-badges { display: flex; gap: 8px; }
    .snd-badge {
      font-size: 13.5px; font-weight: 800; padding: 5px 12px; border-radius: 8px;
    }
    .sb-b { background: #0F4780; color: #FFFFFF; }
    .sb-r { background: #F14343; color: #FFFFFF; }
    .sb-y { background: #FFCC00; color: #0F172A; }

    /* 3 Painéis Alinhados em Escada Harmônica */
    .suite-columns {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      flex: 1;
    }

    .suite-panel {
      background: #FFFFFF;
      border-radius: 26px;
      border: 2px solid #CBD5E1;
      box-shadow: 0 22px 50px rgba(15, 71, 128, 0.16);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 26px 24px;
      overflow: hidden;
    }
    .sp-col1 {
      height: 835px;
      border-color: rgba(15, 71, 128, 0.35);
    }
    .sp-col2 {
      margin-top: 80px;
      height: 755px;
      border-color: rgba(241, 67, 67, 0.35);
    }
    .sp-col3 {
      margin-top: 190px;
      height: 645px;
      border-color: rgba(255, 204, 0, 0.55);
    }

    .sp-header-row {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
    }
    .sp-axis-tag {
      font-size: 14px; font-weight: 900; text-transform: uppercase;
      padding: 4px 12px; border-radius: 6px; letter-spacing: 0.5px;
    }
    .tag-blue { background: #EEF4FA; color: #0F4780; }
    .tag-red { background: #FEF2F2; color: #F14343; }
    .tag-yellow { background: #FEF9C3; color: #854D0E; }

    .sp-route-pill {
      font-family: monospace; font-size: 13.5px; font-weight: 700; color: #64748B;
    }

    .sp-h2 { font-size: 29px; font-weight: 900; color: #0F172A; line-height: 1.15; margin-bottom: 6px; }
    .sp-subtitle { font-size: 17.5px; font-weight: 600; color: #475569; line-height: 1.35; margin-bottom: 18px; }

    .sp-list { display: flex; flex-direction: column; gap: 16px; }
    .sp-row { display: flex; align-items: flex-start; gap: 12px; font-size: 19.5px; line-height: 1.4; color: #1E293B; }
    .sp-row strong { font-weight: 800; color: #0F172A; }
    .sp-bullet {
      width: 26px; height: 26px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 2px; font-weight: 900; font-size: 15px;
    }

    .sp-footer {
      border-top: 1.5px solid #F1F5F9; padding-top: 16px; margin-top: 16px;
    }
    .sp-btn-link {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 13px 16px; border-radius: 12px;
      font-size: 16px; font-weight: 800; text-align: center;
    }
  `;

  const middleContentHtml = `
    <div class="suite-container font-open-sans">
      <!-- Web Dock de Navegação Superior eliminando o vão azul -->
      <div class="suite-nav-dock">
        <div class="snd-title font-bukra">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
          <span>3 EIXOS DE ATUAÇÃO INTEGRADA</span>
        </div>
        <div class="snd-badges font-bukra">
          <span class="snd-badge sb-b">SOCIAL</span>
          <span class="snd-badge sb-r">INFORMATIVO</span>
          <span class="snd-badge sb-y">FERRAMENTAS</span>
        </div>
      </div>

      <!-- 3 Painéis Alinhados em Escada Harmônica -->
      <div class="suite-columns">
        <!-- Eixo Social -->
        <div class="suite-panel sp-col1">
          <div>
            <div class="sp-header-row">
              <span class="sp-axis-tag tag-blue font-bukra">EIXO 1 &bull; SOCIAL</span>
              <span class="sp-route-pill font-bukra">/comunidade</span>
            </div>
            <h2 class="sp-h2 font-bukra">Comunidade</h2>
            <p class="sp-subtitle">Comunicação dialógica e expressão no IFUSP</p>

            <div class="sp-list">
              <div class="sp-row">
                <div class="sp-bullet tag-blue font-bukra">&bull;</div>
                <div><strong>Fluxo:</strong> artigos e reflexões com balões dialógicos de Paulo Freire.</div>
              </div>
              <div class="sp-row">
                <div class="sp-bullet tag-blue font-bukra">&bull;</div>
                <div><strong>Registros:</strong> diários de vivência acadêmica e permanência estudantil.</div>
              </div>
              <div class="sp-row">
                <div class="sp-bullet tag-blue font-bukra">&bull;</div>
                <div><strong>Galeria:</strong> tirinhas, charges, poesias e artes feitas por alunos.</div>
              </div>
              <div class="sp-row">
                <div class="sp-bullet tag-blue font-bukra">&bull;</div>
                <div><strong>Gamificação &amp; XP:</strong> dicas de veteranos e recompensas de comunidade.</div>
              </div>
            </div>
          </div>

          <div class="sp-footer">
            <div class="sp-btn-link sb-b font-bukra">ACESSAR COMUNIDADE &rarr;</div>
          </div>
        </div>

        <!-- Eixo Informativo -->
        <div class="suite-panel sp-col2">
          <div>
            <div class="sp-header-row">
              <span class="sp-axis-tag tag-red font-bukra">EIXO 2 &bull; INFORMATIVO</span>
              <span class="sp-route-pill font-bukra">/cgif</span>
            </div>
            <h2 class="sp-h2 font-bukra">CGIF &amp; Wiki</h2>
            <p class="sp-subtitle">Central de conhecimento e memória do IFUSP</p>

            <div class="sp-list">
              <div class="sp-row">
                <div class="sp-bullet tag-red font-bukra">&bull;</div>
                <div><strong>Wiki Oficial:</strong> manuais de curso, PPPs, editais e protocolos unificados.</div>
              </div>
              <div class="sp-row">
                <div class="sp-bullet tag-red font-bukra">&bull;</div>
                <div><strong>Grades Curriculares:</strong> Bacharelado (8/10 sem), Licenciatura e FisMed.</div>
              </div>
              <div class="sp-row">
                <div class="sp-bullet tag-red font-bukra">&bull;</div>
                <div><strong>Mural de Oportunidades:</strong> catálogo em tempo real de bolsas PUB, PAPFE e IC.</div>
              </div>
              <div class="sp-row">
                <div class="sp-bullet tag-red font-bukra">&bull;</div>
                <div><strong>120+ Docentes &amp; Salas:</strong> catálogo completo com salas e contatos.</div>
              </div>
            </div>
          </div>

          <div class="sp-footer">
            <div class="sp-btn-link sb-r font-bukra">EXPLORAR WIKI &rarr;</div>
          </div>
        </div>

        <!-- Eixo Ferramentas -->
        <div class="suite-panel sp-col3">
          <div>
            <div class="sp-header-row">
              <span class="sp-axis-tag tag-yellow font-bukra">EIXO 3 &bull; FERRAMENTAS</span>
              <span class="sp-route-pill font-bukra">/ferramentas</span>
            </div>
            <h2 class="sp-h2 font-bukra">Ferramentas</h2>
            <p class="sp-subtitle">Produtividade acadêmica e apoio à pesquisa</p>

            <div class="sp-list">
              <div class="sp-row">
                <div class="sp-bullet tag-yellow font-bukra">&bull;</div>
                <div><strong>Grade Horária 1h:1h:</strong> 1h aula = 1h estudo individual + contador de faltas.</div>
              </div>
              <div class="sp-row">
                <div class="sp-bullet tag-yellow font-bukra">&bull;</div>
                <div><strong>Horas AEx &amp; Trilhas:</strong> acompanhamento dos 10% de extensão.</div>
              </div>
              <div class="sp-row">
                <div class="sp-bullet tag-yellow font-bukra">&bull;</div>
                <div><strong>Match Acadêmico:</strong> "Quero uma IC" conectando alunos a pesquisadores.</div>
              </div>
              <div class="sp-row">
                <div class="sp-bullet tag-yellow font-bukra">&bull;</div>
                <div><strong>Circulares USP ao Vivo:</strong> linhas de ônibus e mapas do campus.</div>
              </div>
            </div>
          </div>

          <div class="sp-footer">
            <div class="sp-btn-link sb-y font-bukra">ABRIR FERRAMENTAS &rarr;</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return getHtmlShell({
    title: 'HUB LabDiv - Opção 3: Web Tabs & Integrated Suite',
    capeloSvg,
    qrSvg,
    middleContentHtml,
    extraCss
  });
}

// =========================================================================
// OPÇÃO 4: "Dark Mode Web OS" (Estética Oficial #121212 do HUB LabDiv)
// Traz o contraste brutal do dark mode da plataforma com acentos neon
// =========================================================================
function buildOption4({ qrSvg, capeloSvg }) {
  const extraCss = `
    .dark-suite-container {
      position: absolute;
      top: 350px; left: 50px; right: 50px;
      height: 945px;
      z-index: 28;
      display: flex;
      flex-direction: column;
    }

    /* Dark Mode Web Bar no Azul */
    .dark-web-bar {
      background: #121212;
      border-radius: 20px;
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
      padding: 12px 22px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 590px;
      margin-bottom: 22px;
    }
    .dwb-left {
      display: flex; align-items: center; gap: 10px; color: #FFFFFF; font-size: 17.5px; font-weight: 800;
    }
    .dwb-dots { display: flex; gap: 6px; }
    .dwb-dot { width: 10px; height: 10px; border-radius: 50%; }
    .dwb-badge {
      background: rgba(255, 204, 0, 0.2); color: #FFCC00; border: 1px solid #FFCC00;
      padding: 4px 10px; border-radius: 6px; font-size: 13px; font-weight: 900;
    }

    /* 3 Dark Panels */
    .dark-panels-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      flex: 1;
    }

    .dark-panel {
      background: #18181B;
      border-radius: 26px;
      border: 2px solid #27272A;
      box-shadow: 0 24px 50px rgba(0, 0, 0, 0.28);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 26px 24px;
      overflow: hidden;
    }
    .dp-col1 {
      height: 835px;
      border-color: rgba(56, 189, 248, 0.5);
      box-shadow: 0 20px 50px rgba(56, 189, 248, 0.12), 0 10px 24px rgba(0,0,0,0.4);
    }
    .dp-col2 {
      margin-top: 80px;
      height: 755px;
      border-color: rgba(241, 67, 67, 0.5);
      box-shadow: 0 20px 50px rgba(241, 67, 67, 0.12), 0 10px 24px rgba(0,0,0,0.4);
    }
    .dp-col3 {
      margin-top: 190px;
      height: 645px;
      border-color: rgba(255, 204, 0, 0.5);
      box-shadow: 0 20px 50px rgba(255, 204, 0, 0.12), 0 10px 24px rgba(0,0,0,0.4);
    }

    .dp-header-row {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;
    }
    .dp-tag {
      font-size: 13.5px; font-weight: 900; text-transform: uppercase;
      padding: 4px 12px; border-radius: 6px; letter-spacing: 0.5px;
    }
    .dpt-b { background: rgba(56, 189, 248, 0.15); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .dpt-r { background: rgba(241, 67, 67, 0.15); color: #F87171; border: 1px solid rgba(241, 67, 67, 0.3); }
    .dpt-y { background: rgba(255, 204, 0, 0.15); color: #FBBF24; border: 1px solid rgba(255, 204, 0, 0.3); }

    .dp-route { font-family: monospace; font-size: 13.5px; font-weight: 700; color: #94A3B8; }

    .dp-h2 { font-size: 29px; font-weight: 900; color: #FFFFFF; line-height: 1.15; margin-bottom: 6px; }
    .dp-subtitle { font-size: 17.5px; font-weight: 600; color: #94A3B8; line-height: 1.35; margin-bottom: 18px; }

    .dp-list { display: flex; flex-direction: column; gap: 16px; }
    .dp-row { display: flex; align-items: flex-start; gap: 12px; font-size: 19.5px; line-height: 1.4; color: #E2E8F0; }
    .dp-row strong { font-weight: 800; color: #FFFFFF; }
    .dp-bullet {
      width: 26px; height: 26px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 2px; font-weight: 900; font-size: 15px;
    }

    .dp-footer {
      border-top: 1.5px solid #27272A; padding-top: 16px; margin-top: 16px;
    }
    .dp-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 13px 16px; border-radius: 12px;
      font-size: 16px; font-weight: 800; text-align: center;
    }
    .btn-dark-b { background: #0284C7; color: #FFFFFF; }
    .btn-dark-r { background: #DC2626; color: #FFFFFF; }
    .btn-dark-y { background: #EAB308; color: #0F172A; }
  `;

  const middleContentHtml = `
    <div class="dark-suite-container font-open-sans">
      <!-- Dark Web Bar no Azul -->
      <div class="dark-web-bar">
        <div class="dwb-left font-bukra">
          <div class="dwb-dots">
            <div class="dwb-dot" style="background: #EF4444;"></div>
            <div class="dwb-dot" style="background: #F59E0B;"></div>
            <div class="dwb-dot" style="background: #10B981;"></div>
          </div>
          <span>&nbsp;hub-labdiv.vercel.app</span>
        </div>
        <div class="dwb-badge font-bukra">MODO ESCURO OFICIAL</div>
      </div>

      <!-- 3 Dark Panels -->
      <div class="dark-panels-grid">
        <!-- Eixo Social -->
        <div class="dark-panel dp-col1">
          <div>
            <div class="dp-header-row">
              <span class="dp-tag dpt-b font-bukra">EIXO 1 &bull; SOCIAL</span>
              <span class="dp-route font-bukra">/comunidade</span>
            </div>
            <h2 class="dp-h2 font-bukra">Comunidade</h2>
            <p class="dp-subtitle">Comunicação dialógica e permanência no IFUSP</p>

            <div class="dp-list">
              <div class="dp-row">
                <div class="dp-bullet dpt-b font-bukra">&bull;</div>
                <div><strong>Fluxo:</strong> artigos e reflexões com balões dialógicos de Paulo Freire.</div>
              </div>
              <div class="dp-row">
                <div class="dp-bullet dpt-b font-bukra">&bull;</div>
                <div><strong>Registros:</strong> vivências acadêmicas e micro-relatos cotidianos.</div>
              </div>
              <div class="dp-row">
                <div class="dp-bullet dpt-b font-bukra">&bull;</div>
                <div><strong>Galeria:</strong> tirinhas, ilustrações, charges e poesias autorais.</div>
              </div>
              <div class="dp-row">
                <div class="dp-bullet dpt-b font-bukra">&bull;</div>
                <div><strong>Gamificação &amp; XP:</strong> conselhos de veteranos e engajamento discente.</div>
              </div>
            </div>
          </div>

          <div class="dp-footer">
            <div class="dp-btn btn-dark-b font-bukra">ACESSAR COMUNIDADE &rarr;</div>
          </div>
        </div>

        <!-- Eixo Informativo -->
        <div class="dark-panel dp-col2">
          <div>
            <div class="dp-header-row">
              <span class="dp-tag dpt-r font-bukra">EIXO 2 &bull; INFORMATIVO</span>
              <span class="dp-route font-bukra">/cgif</span>
            </div>
            <h2 class="dp-h2 font-bukra">CGIF &amp; Wiki</h2>
            <p class="dp-subtitle">Central de conhecimento e memória do IFUSP</p>

            <div class="dp-list">
              <div class="dp-row">
                <div class="dp-bullet dpt-r font-bukra">&bull;</div>
                <div><strong>Wiki Oficial:</strong> manuais de curso, PPPs, editais e protocolos unificados.</div>
              </div>
              <div class="dp-row">
                <div class="dp-bullet dpt-r font-bukra">&bull;</div>
                <div><strong>Grades Curriculares:</strong> Bacharelado (8/10 sem), Licenciatura e FisMed.</div>
              </div>
              <div class="dp-row">
                <div class="dp-bullet dpt-r font-bukra">&bull;</div>
                <div><strong>Mural de Oportunidades:</strong> catálogo em tempo real de bolsas PUB, PAPFE e IC.</div>
              </div>
              <div class="dp-row">
                <div class="dp-bullet dpt-r font-bukra">&bull;</div>
                <div><strong>120+ Docentes &amp; Salas:</strong> catálogo completo com laboratórios e contatos.</div>
              </div>
            </div>
          </div>

          <div class="dp-footer">
            <div class="dp-btn btn-dark-r font-bukra">EXPLORAR WIKI &rarr;</div>
          </div>
        </div>

        <!-- Eixo Ferramentas -->
        <div class="dark-panel dp-col3">
          <div>
            <div class="dp-header-row">
              <span class="dp-tag dpt-y font-bukra">EIXO 3 &bull; FERRAMENTAS</span>
              <span class="dp-route font-bukra">/ferramentas</span>
            </div>
            <h2 class="dp-h2 font-bukra">Ferramentas</h2>
            <p class="dp-subtitle">Produtividade acadêmica e apoio à pesquisa</p>

            <div class="dp-list">
              <div class="dp-row">
                <div class="dp-bullet dpt-y font-bukra">&bull;</div>
                <div><strong>Grade Horária 1h:1h:</strong> 1h aula = 1h estudo + contador de faltas.</div>
              </div>
              <div class="dp-row">
                <div class="dp-bullet dpt-y font-bukra">&bull;</div>
                <div><strong>Horas AEx &amp; Trilhas:</strong> acompanhamento dos 10% de extensão.</div>
              </div>
              <div class="dp-row">
                <div class="dp-bullet dpt-y font-bukra">&bull;</div>
                <div><strong>Match Acadêmico:</strong> "Quero uma IC" conectando alunos a pesquisadores.</div>
              </div>
              <div class="dp-row">
                <div class="dp-bullet dpt-y font-bukra">&bull;</div>
                <div><strong>Circulares USP ao Vivo:</strong> linhas de ônibus e mapas interativos.</div>
              </div>
            </div>
          </div>

          <div class="dp-footer">
            <div class="dp-btn btn-dark-y font-bukra">ABRIR FERRAMENTAS &rarr;</div>
          </div>
        </div>
      </div>
    </div>
  `;

  return getHtmlShell({
    title: 'HUB LabDiv - Opção 4: Dark Mode Web OS',
    capeloSvg,
    qrSvg,
    middleContentHtml,
    extraCss
  });
}

async function renderHtmlToPng(browser, htmlPath, outputPngPath, outputPreviewPath) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });

  await page.screenshot({
    path: outputPngPath,
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Gerado: ${outputPngPath}`);

  if (outputPreviewPath) {
    const previewPage = await browser.newPage();
    await previewPage.setViewport({ width: 620, height: 877, deviceScaleFactor: 1 });
    await previewPage.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
    await previewPage.addStyleTag({ content: 'body { transform: scale(0.5); transform-origin: top left; }' });
    await previewPage.screenshot({
      path: outputPreviewPath,
      clip: { x: 0, y: 0, width: 620, height: 877 }
    });
    console.log(`✅ Preview gerado: ${outputPreviewPath}`);
    await previewPage.close();
  }

  await page.close();
}

async function main() {
  console.log('🚀 Gerando as 4 opções refinadas com informações 100% fidedignas e eliminação do vão azul...');

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

  // Opção 1: Web Browser App Window (Search Dock + 3 Janelas em Cascata)
  const html1 = buildOption1({ qrSvg, capeloSvg });
  const html1Path = path.join(scratchDir, 'poster1_opcao1_browser_dashboard.html');
  fs.writeFileSync(html1Path, html1, 'utf8');

  // Opção 2: Web Bento Grid (Search/Nav Bar + Bento Layout Assimétrico)
  const html2 = buildOption2({ qrSvg, capeloSvg });
  const html2Path = path.join(scratchDir, 'poster1_opcao2_bento_grid.html');
  fs.writeFileSync(html2Path, html2, 'utf8');

  // Opção 3: Web Tabs & Integrated Suite (Nav Dock + 3 Painéis Alinhados)
  const html3 = buildOption3({ qrSvg, capeloSvg });
  const html3Path = path.join(scratchDir, 'poster1_opcao3_web_tabs.html');
  fs.writeFileSync(html3Path, html3, 'utf8');

  // Opção 4: Dark Mode Web OS (Estética Oficial #121212)
  const html4 = buildOption4({ qrSvg, capeloSvg });
  const html4Path = path.join(scratchDir, 'poster1_opcao4_dark_suite.html');
  fs.writeFileSync(html4Path, html4, 'utf8');

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  console.log('Renderizando Opção 1...');
  await renderHtmlToPng(
    browser,
    html1Path,
    path.join(ARTIFACT_DIR, 'poster1_opcao1_browser_dashboard.png'),
    path.join(ARTIFACT_DIR, 'poster1_opcao1_browser_dashboard_preview.png')
  );

  console.log('Renderizando Opção 2...');
  await renderHtmlToPng(
    browser,
    html2Path,
    path.join(ARTIFACT_DIR, 'poster1_opcao2_bento_grid.png'),
    path.join(ARTIFACT_DIR, 'poster1_opcao2_bento_grid_preview.png')
  );

  console.log('Renderizando Opção 3...');
  await renderHtmlToPng(
    browser,
    html3Path,
    path.join(ARTIFACT_DIR, 'poster1_opcao3_web_tabs.png'),
    path.join(ARTIFACT_DIR, 'poster1_opcao3_web_tabs_preview.png')
  );

  console.log('Renderizando Opção 4...');
  await renderHtmlToPng(
    browser,
    html4Path,
    path.join(ARTIFACT_DIR, 'poster1_opcao4_dark_suite.png'),
    path.join(ARTIFACT_DIR, 'poster1_opcao4_dark_suite_preview.png')
  );

  await browser.close();
  console.log('🎉 Todas as 4 opções refinadas foram renderizadas com sucesso!');
}

main().catch(err => {
  console.error('❌ Erro no script:', err);
  process.exit(1);
});
