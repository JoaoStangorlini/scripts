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
const { execSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const QRCode = require('qrcode');

const ACTIVE_CONV_ARTIFACTS_DIR = (process.env.ARTIFACTS_DIR || './artifacts');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const OUT_DIR = path.join(PUBLIC_DIR, 'divulgacao/panfletos');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// 1. Read source assets
const bgIfSvg = fs.readFileSync(path.join(PUBLIC_DIR, 'bg-if.svg'), 'utf-8');
const iconHubSvg = fs.readFileSync(path.join(PUBLIC_DIR, 'icone-HUBLabDiv.svg'), 'utf-8');
const cleanedIconHub = iconHubSvg.replace(/<\?xml[^>]*\?>/gi, '').replace(/<!--[\s\S]*?-->/g, '').trim();

// High-contrast clean academic version of bg-if.svg for light mode
const bgIfLightSvg = bgIfSvg
  .replace(/fill="#0F4780"/g, 'fill="#0F4780"')
  .replace(/stroke="#0F4780"/g, 'stroke="#0F4780"')
  .replace(/fill="#F14343"/g, 'fill="#F14343"')
  .replace(/stroke="#F14343"/g, 'stroke="#F14343"')
  .replace(/fill="#FFCC00"/g, 'fill="#FFCC00"')
  .replace(/stroke="#FFCC00"/g, 'stroke="#FFCC00"')
  .replace(/font-size="14"/g, 'font-size="20"')
  .replace(/font-size="16"/g, 'font-size="23"')
  .replace(/font-size="18"/g, 'font-size="26"')
  .replace(/font-size="20"/g, 'font-size="29"')
  .replace(/font-size="22"/g, 'font-size="32"')
  .replace(/font-size="24"/g, 'font-size="36"')
  .replace(/font-family="Georgia, serif"/g, 'font-family="Georgia, serif" font-weight="bold"')
  .replace(/ r="1"/g, ' r="2.5"')
  .replace(/ r="1\.5"/g, ' r="3.5"')
  .replace(/ r="2"/g, ' r="4"')
  .replace(/rx="18" ry="6"/g, 'rx="24" ry="8"')
  .replace(/rx="14" ry="5"/g, 'rx="20" ry="7"')
  .replace(/rx="16" ry="5\.5"/g, 'rx="22" ry="7.5"');

const base64BgLightSvg = Buffer.from(bgIfLightSvg).toString('base64');

// Icons
const iconComunidadeSvg = `<svg width="28" height="28" viewBox="0 -960 960 960" fill="currentColor">
  <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/>
</svg>`;

const iconCgifSvg = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
</svg>`;

const iconFerramentasSvg = `<svg width="28" height="28" viewBox="0 -960 960 960" fill="currentColor">
  <path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z"/>
</svg>`;

// SVG Icons for Face 2 (Replacing emojis with official vector icons)
const iconLabPessoalSvg = `<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-4px; margin-right:8px;"><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/></svg>`;
const iconInteracaoSvg = `<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-4px; margin-right:8px;"><rect width="6" height="6" x="9" y="2" rx="1"/><path d="m5 16 4-4"/><path d="m19 16-4-4"/><rect width="6" height="6" x="2" y="16" rx="1"/><rect width="6" height="6" x="16" y="16" rx="1"/></svg>`;
const iconArteSvg = `<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-4px; margin-right:8px;"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`;
const iconDialogoSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-4px; margin-right:8px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;
const iconWikiSvg = `<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-4px; margin-right:8px;"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
const iconInstitutoSvg = `<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-4px; margin-right:8px;"><line x1="2" y1="22" x2="22" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`;
const iconInterativoSvg = `<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-4px; margin-right:8px;"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
const iconDescomplicadoSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-4px; margin-right:8px;"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>`;
const iconDiscentesSvg = `<svg width="25" height="25" viewBox="0 -960 960 960" fill="currentColor" style="display:inline-block; vertical-align:-4px; margin-right:8px;"><path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z"/></svg>`;
const iconDocentesSvg = `<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-4px; margin-right:8px;"><path d="m10.065 12.493-6.18 1.318a.934.934 0 0 1-1.108-.702l-.537-2.15a1.07 1.07 0 0 1 .691-1.265l13.504-4.44"/><path d="m13.56 11.747 4.332-.924"/><path d="m16 21-3.105-6.21"/><path d="M16.485 5.94a2 2 0 0 1 1.455-2.425l1.09-.272a1 1 0 0 1 1.212.727l1.515 6.06a1 1 0 0 1-.727 1.213l-1.09.272a2 2 0 0 1-2.425-1.455z"/><path d="m6.155 8.653-3.308 1.05a1 1 0 0 0-.69 1.264l.537 2.15a.934.934 0 0 0 1.108.702l3.308-1.05"/><path d="m8 21 3.105-6.21"/></svg>`;
const iconCuriososSvg = `<svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-4px; margin-right:8px;"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`;
const iconMetodologiaSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:-4px; margin-right:8px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const iconFogueteSvg = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0F4780" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`;

// Common CSS for Light Mode Tri-Fold (3 Panels per face)
function getCommonCss() {
  return `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    @page {
      size: 1754px 1240px;
      margin: 0;
    }
    html, body {
      width: 1754px;
      height: 1240px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: #F8FAFC;
      color: #0F172A;
    }
    .font-open-sans {
      font-family: 'Open Sans', -apple-system, sans-serif;
    }
    .font-bukra {
      font-family: '29LT Bukra', 'Outfit', -apple-system, sans-serif;
      letter-spacing: -0.3px;
    }
    .tri-sheet {
      position: relative;
      width: 1754px;
      height: 1240px;
      overflow: hidden;
      display: grid;
      grid-template-columns: calc(100% / 3) calc(100% / 3) calc(100% / 3);
      background-color: #F8FAFC;
    }
    .bg-math-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 1754px;
      height: 1240px;
      background-image: url('data:image/svg+xml;base64,${base64BgLightSvg}');
      background-repeat: repeat;
      background-size: 820px 820px;
      opacity: 0.50;
      pointer-events: none;
      z-index: 1;
    }
    .panel {
      position: relative;
      z-index: 10;
      box-sizing: border-box;
      padding: 34px 32px 28px 32px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    /* REINFORCED VERTICAL FOLD LINES (DOBRAS DO PANFLETO - EXCLUSIVAS DA FACE INTERNA: 1/3 E 2/3) */
    .fold-guide {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 0;
      border-left: 2.5px dashed rgba(15, 71, 128, 0.45);
      z-index: 60;
      pointer-events: none;
      transform: translateX(-50%);
    }
    .fold-guide::before {
      content: '';
      position: absolute;
      top: 0;
      left: -5px;
      width: 10px;
      height: 16px;
      background: #0F4780;
      clip-path: polygon(0 0, 100% 0, 50% 100%);
    }
    .fold-guide::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: -5px;
      width: 10px;
      height: 16px;
      background: #0F4780;
      clip-path: polygon(50% 0, 0 100%, 100% 100%);
    }
    .fold-guide-1 {
      left: calc(100% / 3);
    }
    .fold-guide-2 {
      left: calc(100% * 2 / 3);
    }
    .tri-sheet.face-1 .panel {
      height: 1240px;
      padding: 20px 38px 16px 38px;
    }
    .tri-sheet.face-2 .panel {
      height: calc(1240px - 54px - 132px);
      padding: 12px 34px 8px 34px;
    }

    /* Badges & Labels */
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      width: fit-content;
    }
    .badge-blue {
      background: rgba(15, 71, 128, 0.08);
      color: #0F4780;
      border: 1.5px solid rgba(15, 71, 128, 0.25);
    }
    .badge-red {
      background: rgba(241, 67, 67, 0.08);
      color: #F14343;
      border: 1.5px solid rgba(241, 67, 67, 0.28);
    }
    .badge-yellow {
      background: rgba(255, 204, 0, 0.22);
      color: #854D0E;
      border: 1.5px solid #FFCC00;
    }

    /* Mini Cards for 3-Card Panels (Face 2 - 3 Eixos) */
    .mini-card {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 14px 20px;
      box-shadow: 0 8px 22px -3px rgba(15, 71, 128, 0.14), 0 3px 8px -2px rgba(15, 71, 128, 0.08);
      border: 1.8px solid rgba(15, 71, 128, 0.15);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 10px;
    }

    /* Footer Bar Unificado na Face 2 (Linha em Degradê Contínua + 3 Cards Coloridos) */
    .sheet-footer-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 20;
      background: #F8FAFC;
      display: flex;
      flex-direction: column;
    }
    .sheet-footer-divider {
      height: 2.5px;
      width: 100%;
      background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #FFCC00 100%);
    }
    .sheet-footer-cards {
      display: grid;
      grid-template-columns: calc(100% / 3) calc(100% / 3) calc(100% / 3);
      padding: 8px 0 10px 0;
      gap: 0;
    }
    .panel-footer-card {
      margin: 0 34px;
      background: #FFFFFF;
      border-radius: 16px;
      padding: 8px 16px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 6px 18px -3px rgba(15, 71, 128, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 78px;
    }
    .card-footer-blue {
      border: 1.8px solid rgba(15, 71, 128, 0.25);
      border-top: 4.5px solid #0F4780;
      box-shadow: 0 6px 18px -3px rgba(15, 71, 128, 0.14), 0 2px 6px -1px rgba(15, 71, 128, 0.06);
    }
    .card-footer-red {
      border: 1.8px solid rgba(241, 67, 67, 0.28);
      border-top: 4.5px solid #F14343;
      box-shadow: 0 6px 18px -3px rgba(241, 67, 67, 0.14), 0 2px 6px -1px rgba(241, 67, 67, 0.06);
    }
    .card-footer-yellow {
      border: 1.8px solid rgba(255, 204, 0, 0.55);
      border-top: 4.5px solid #FFCC00;
      box-shadow: 0 6px 18px -3px rgba(217, 119, 6, 0.16), 0 2px 6px -1px rgba(217, 119, 6, 0.06);
    }
    .sheet-footer-license {
      text-align: center;
      font-size: 16px;
      color: #64748B;
      font-weight: 600;
      padding: 4px 0 10px 0;
    }
    .panel-footer-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 17.5px;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .panel-footer-body {
      font-size: 15.5px;
      color: #475569;
      line-height: 1.32;
      font-weight: 600;
    }
    .mini-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
    }
    .mini-card.card-blue {
      border: 1.8px solid rgba(15, 71, 128, 0.22);
      box-shadow: 0 8px 22px -3px rgba(15, 71, 128, 0.15), 0 3px 8px -2px rgba(15, 71, 128, 0.08);
    }
    .mini-card.card-blue::before { background: #0F4780; }
    .mini-card.card-red {
      border: 1.8px solid rgba(241, 67, 67, 0.25);
      box-shadow: 0 8px 22px -3px rgba(241, 67, 67, 0.15), 0 3px 8px -2px rgba(241, 67, 67, 0.08);
    }
    .mini-card.card-red::before { background: #F14343; }
    .mini-card.card-yellow {
      border: 1.8px solid rgba(255, 204, 0, 0.50);
      box-shadow: 0 8px 22px -3px rgba(217, 119, 6, 0.18), 0 3px 8px -2px rgba(217, 119, 6, 0.08);
    }
    .mini-card.card-yellow::before { background: #FFCC00; }

    .mini-card-title {
      font-size: 25px;
      font-weight: 900;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 10px;
      line-height: 1.2;
    }
    .mini-card-title.title-blue { color: #0F4780; }
    .mini-card-title.title-red { color: #F14343; }
    .mini-card-title.title-yellow { color: #854D0E; }

    .mini-feature-item {
      display: flex;
      align-items: flex-start;
      gap: 9px;
      margin-bottom: 0;
    }
    .mini-bullet {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 5px;
      flex-shrink: 0;
    }
    .bullet-blue { background: #0F4780; }
    .bullet-red { background: #F14343; }
    .bullet-yellow { background: #FFCC00; box-shadow: 0 0 0 1.2px #D97706; }

    .mini-text {
      font-size: 17.5px;
      line-height: 1.32;
      color: #334155;
    }
    .mini-text strong {
      color: #0F172A;
      font-weight: 800;
    }

    /* Text Helpers & Anti-Conflict Background Shields */
    .title-halo {
      text-shadow:
        0 0 22px #FFFFFF,
        0 0 16px #FFFFFF,
        0 0 10px #FFFFFF,
        0 0 6px #FFFFFF,
        0 0 3px #FFFFFF,
        0 2px 8px rgba(255, 255, 255, 0.98);
    }
    .text-shield {
      text-shadow:
        0 0 18px #FFFFFF,
        0 0 12px #FFFFFF,
        0 0 8px #FFFFFF,
        0 0 4px #FFFFFF,
        0 0 2px #FFFFFF,
        0 1px 3px rgba(255, 255, 255, 0.98);
    }
    .title-blue { color: #0F4780; }
    .title-red { color: #F14343; }
    .title-yellow { color: #854D0E; }
    .title-dark { color: #0F172A; }
    .text-gradient-brand {
      background: linear-gradient(135deg, #0F4780 0%, #F14343 50%, #FFCC00 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: inline-block;
      text-shadow: none !important;
      filter: drop-shadow(0 0 12px #FFFFFF) drop-shadow(0 0 6px #FFFFFF);
    }

    /* Content Cards */
    .clean-card {
      background: #FFFFFF;
      border-radius: 20px;
      padding: 16px 18px;
      box-shadow: 0 8px 22px -3px rgba(15, 71, 128, 0.14), 0 3px 8px -2px rgba(15, 71, 128, 0.08);
      border: 1.8px solid rgba(15, 71, 128, 0.14);
      position: relative;
      overflow: hidden;
    }
    .clean-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
    }
    .card-accent-blue::before { background: #0F4780; }
    .card-accent-red::before { background: #F14343; }
    .card-accent-yellow::before { background: #FFCC00; }

    /* Feature Item in Cards */
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      margin-bottom: 9px;
    }
    .feature-item:last-child {
      margin-bottom: 0;
    }
    .feature-bullet {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-top: 6px;
      flex-shrink: 0;
    }

    .feature-text {
      font-size: 18px;
      line-height: 1.4;
      color: #334155;
    }
    .feature-text strong {
      color: #0F172A;
      font-weight: 800;
    }

    /* Google Play Card */
    .play-card-wrap {
      background: #FFFFFF;
      border-radius: 18px;
      border: 1.8px solid rgba(15, 71, 128, 0.22);
      box-shadow: 0 8px 22px -3px rgba(15, 71, 128, 0.14), 0 3px 8px -2px rgba(15, 71, 128, 0.08);
      padding: 12px 16px 14px 16px;
      position: relative;
      overflow: hidden;
      width: 100%;
    }
    .play-card-wrap::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4.5px;
      background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #FFCC00 100%);
    }
    .play-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .play-card-brand {
      font-size: 16px;
      font-weight: 700;
      color: #444746;
    }
    .play-card-body {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .play-card-icon {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
    }
    .play-card-title {
      font-size: 21px;
      font-weight: 900;
      color: #0F172A;
      line-height: 1.1;
    }
    .play-card-sub {
      font-size: 14px;
      color: #64748B;
      font-weight: 600;
      margin-top: 2px;
    }
    .play-install-btn {
      margin-top: 10px;
      background: #0F4780;
      color: #FFFFFF;
      border-radius: 999px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 700;
      box-shadow: 0 3px 10px rgba(15, 71, 128, 0.25);
    }

    /* QR Code Card - Disposição Vertical com Degrade Superior */
    .qr-card-box {
      background: #FFFFFF;
      border-radius: 18px;
      border: 1.8px solid rgba(15, 71, 128, 0.18);
      box-shadow: 0 8px 24px -3px rgba(15, 71, 128, 0.14), 0 3px 8px -2px rgba(15, 71, 128, 0.08);
      padding: 7px 12px 8px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 6px;
      position: relative;
      overflow: hidden;
    }
    .qr-card-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4.5px;
      background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #FFCC00 100%);
    }
    .qr-svg-holder {
      position: relative;
      width: 265px;
      height: 265px;
      flex-shrink: 0;
      border-radius: 18px;
      overflow: hidden;
      border: 1.5px solid #CBD5E1;
      background: #FFFFFF;
      box-shadow: 0 2px 6px rgba(15, 71, 128, 0.03);
    }
    .qr-svg-holder svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .qr-center-badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 66px;
      height: 66px;
      background: #FFFFFF;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 0 3px #FFFFFF, 0 3px 10px rgba(0, 0, 0, 0.14);
      border: 2.2px solid #0F4780;
      padding: 4px;
    }
    .qr-info-title {
      font-size: 24px;
      font-weight: 900;
      color: #0F172A;
      line-height: 1.2;
    }
    .qr-info-sub {
      font-size: 19px;
      font-weight: 700;
      color: #0F4780;
      margin-top: 2px;
    }
    .qr-info-note {
      font-size: 17px;
      color: #475569;
      margin-top: 4px;
      line-height: 1.34;
    }

    /* Top & Bottom Banners */
    .sheet-header-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 54px;
      z-index: 20;
      background: #FFFFFF;
      border-bottom: 2px solid #E2E8F0;
      display: grid;
      grid-template-columns: calc(100% / 3) calc(100% / 3) calc(100% / 3);
      padding: 0;
      box-shadow: 0 4px 14px rgba(15, 71, 128, 0.08);
      box-sizing: border-box;
    }
    .sheet-header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .sheet-header-title {
      font-size: 25px;
      font-weight: 900;
    }
    .sheet-header-sub {
      font-size: 16.5px;
      color: #64748B;
      font-weight: 600;
    }
    .sheet-header-right {
      font-size: 22px;
      font-weight: 900;
      color: #0F4780;
      font-style: italic;
    }

  `;
}

// 2. Build HTML for Face 1 (Externa - 3 Panels: Sobre o LabDiv, QR Code, Capa Logo)
function buildFace1Html({ qrWebSvg, qrPlaySvg, qrLabDivSvg }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>HUB LabDiv - Panfleto Dobrável em 3 (Face 1: Externa)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    ${getCommonCss()}
    .tri-sheet.face-1 {
      padding-top: 0;
      padding-bottom: 0;
    }
  </style>
</head>
<body>
  <div class="tri-sheet face-1">
    <div class="bg-math-pattern"></div>

    <!-- PAINEL 1: SOBRE O LABDIV (DADOS OFICIAIS & MODELO MIT) -->
    <div class="panel panel-1 font-open-sans" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <span class="badge-pill badge-red font-bukra">LABORATÓRIO CRIADOR</span>
        <h2 class="font-bukra title-halo title-dark" style="font-size: 42px; font-weight: 900; margin-top: 8px; line-height: 1.12;">
          SOBRE O LABDIV
        </h2>
        <p class="text-shield" style="font-size: 18.5px; color: #475569; font-weight: 600; margin-top: 4px; line-height: 1.32;">
          Laboratório de Expressão e Divulgação da Ciência &bull; IFUSP
        </p>
        <div class="font-bukra text-shield" style="font-size: 16px; font-weight: 800; color: #F14343; font-style: italic; margin-top: 4px;">
          "Escrita, apresentação e design para cientistas — por cientistas"
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: space-evenly; margin: 4px 0;">
        <!-- Card 1: Mentorias LabDiv (Inspirado no MIT Communication Lab) - Vermelho LabDiv #F14343 -->
        <div class="clean-card card-accent-red" style="padding: 10px 16px;">
          <div class="font-bukra" style="font-size: 23px; font-weight: 900; color: #F14343; margin-bottom: 4px;">
            Mentorias LabDiv
          </div>
          <p style="font-size: 17px; color: #334155; line-height: 1.30; margin-bottom: 5px;">
            Inspirado no consagrado modelo do <strong>Communication Lab do MIT</strong> (<em>Massachusetts Institute of Technology</em>), o LabDiv auxilia cientistas do IFUSP a comunicarem suas pesquisas com clareza, impacto e rigor.
          </p>
          <div class="feature-item" style="margin-bottom: 4px;">
            <div class="feature-bullet bullet-red"></div>
            <div class="feature-text" style="font-size: 16.5px; line-height: 1.30;"><strong>Funcionamento das Mentorias:</strong> Sessões individuais com feedback técnico qualificado entre pares (cientistas formando cientistas) para aprimorar a escrita, o design e a oratória.</div>
          </div>
          <div class="feature-item">
            <div class="feature-bullet bullet-red"></div>
            <div class="feature-text" style="font-size: 16.5px; line-height: 1.30;"><strong>Como Podemos te Ajudar:</strong> Apoio prático gratuito em relatórios, seminários, artigos, teses, pôsteres e entrevistas, além de auxílio com Canva, LaTeX e MATLAB.</div>
          </div>
        </div>

        <!-- Card 2: Projetos & Frentes de Atuação - Azul LabDiv #0F4780 -->
        <div class="clean-card card-accent-blue" style="padding: 10px 16px;">
          <div class="font-bukra" style="font-size: 23px; font-weight: 900; color: #0F4780; margin-bottom: 4px;">
            Projetos &amp; Frentes de Atuação
          </div>
          <div class="feature-item" style="margin-bottom: 4px;">
            <div class="feature-bullet bullet-blue"></div>
            <div class="feature-text" style="font-size: 16.5px; line-height: 1.30;"><strong>KitDiv:</strong> Coleção de guias e dicas práticas sobre comunicação científica (escrita, design e apresentações) com exemplos reais comentados.</div>
          </div>
          <div class="feature-item" style="margin-bottom: 4px;">
            <div class="feature-bullet bullet-blue"></div>
            <div class="feature-text" style="font-size: 16.5px; line-height: 1.30;"><strong>Dublagem Científica:</strong> Tradução e dublagem de canais de referência mundial (como o <em>3Blue1Brown</em>) para o português.</div>
          </div>
          <div class="feature-item" style="margin-bottom: 4px;">
            <div class="feature-bullet bullet-blue"></div>
            <div class="feature-text" style="font-size: 16.5px; line-height: 1.30;"><strong>HUB LabDiv:</strong> O novo aplicativo integrado de comunicação, rede social e ferramentas acadêmicas do IFUSP.</div>
          </div>
          <div class="feature-item">
            <div class="feature-bullet bullet-blue"></div>
            <div class="feature-text" style="font-size: 16.5px; line-height: 1.30;"><strong>Em Breve:</strong> Produção de <em>podcasts científicos</em> e muito mais!</div>
          </div>
        </div>

        <!-- Card 3: DigitaLab (Estúdio Multimídia Oficial) - Amarelo LabDiv #FFCC00 -->
        <div class="clean-card card-accent-yellow" style="padding: 10px 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <div class="font-bukra" style="font-size: 23px; font-weight: 900; color: #854D0E;">
              DigitaLab: Estúdio Multimídia
            </div>
            <span class="badge-pill badge-yellow font-bukra" style="font-size: 13.5px; padding: 3px 10px;">ÁUDIO &amp; VÍDEO</span>
          </div>
          <p style="font-size: 16.5px; color: #334155; line-height: 1.30;">
            Espaço de gravação profissional do IFUSP com <strong>4 microfones profissionais, tratamento acústico, iluminação de estúdio e chroma key</strong> para podcasts, videoaulas e divulgação científica. Agendamento gratuito via site!
          </p>
        </div>
      </div>

      <!-- Localização & Contato Oficial do LabDiv + QR Code para sites.google.com/usp.br/labdiv -->
      <div style="background: #FFFFFF; border: 1.8px solid rgba(15, 71, 128, 0.20); border-radius: 16px; padding: 8px 14px; box-shadow: 0 8px 22px -3px rgba(15, 71, 128, 0.14), 0 3px 8px -2px rgba(15, 71, 128, 0.08); position: relative; overflow: hidden; display: flex; align-items: center; gap: 12px;">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #FFCC00 100%);"></div>
        <div style="width: 68px; height: 68px; flex-shrink: 0; border-radius: 10px; overflow: hidden; border: 1.5px solid #CBD5E1; background: #FFFFFF; display: flex; align-items: center; justify-content: center; position: relative;">
          ${qrLabDivSvg}
        </div>
        <div style="display: flex; flex-direction: column; justify-content: center; gap: 1.5px; font-size: 15px; color: #475569; line-height: 1.28;">
          <div class="font-bukra" style="font-size: 19px; font-weight: 900; color: #0F172A;">Conheça o LabDiv</div>
          <div style="color: #0F4780; font-weight: 700; font-size: 16px;">sites.google.com/usp.br/labdiv</div>
          <div>📍 <strong>Edifício Novo Milênio</strong> &bull; IFUSP</div>
          <div>✉️ Contato para sugestões: <span style="color: #0F4780; font-weight: 700;">hublabdiv@gmail.com</span></div>
        </div>
      </div>
    </div>

    <!-- PAINEL 2: QR CODES & ACESSO IMEDIATO (DISPOSIÇÃO VERTICAL & MODO OFFLINE) -->
    <div class="panel panel-2 font-open-sans" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <span class="badge-pill badge-blue font-bukra">ACESSO IMEDIATO</span>
        <h2 class="font-bukra title-halo title-blue" style="font-size: 42px; font-weight: 900; margin-top: 8px; line-height: 1.12;">
          EXPERIMENTE O HUB
        </h2>
      </div>

      <div style="display: flex; flex-direction: column; justify-content: space-evenly; flex: 1; margin: 6px 0; gap: 10px;">
        <!-- QR Web (Vertical Layout: QR Top, Text Below) -->
        <div class="qr-card-box">
          <div class="qr-svg-holder">
            ${qrWebSvg}
            <div class="qr-center-badge">
              ${cleanedIconHub}
            </div>
          </div>
          <div style="width: 100%;">
            <div style="display: flex; justify-content: center; margin-bottom: 4px;">
              <span class="badge-pill badge-blue font-bukra" style="font-size: 14.5px; padding: 3px 12px;">🌐 WEB PWA &bull; NAVEGADOR</span>
            </div>
            <div class="qr-info-title font-bukra" style="font-size: 25px;">Acesse no Navegador</div>
            <div class="qr-info-sub font-bukra" style="font-size: 19px; word-break: break-all;">hub-lab-div.vercel.app</div>
            <div class="qr-info-note font-open-sans" style="font-size: 17.5px; margin-top: 4px;">
              Acesso instantâneo em qualquer PC, celular ou tablet sem instalar nada.
            </div>
          </div>
        </div>

        <!-- QR PlayStore + Botão Instalar Unificados -->
        <div class="qr-card-box">
          <div class="qr-svg-holder">
            ${qrPlaySvg}
            <div class="qr-center-badge">
              ${cleanedIconHub}
            </div>
          </div>
          <div style="width: 100%;">
            <!-- Card Google Play estilo Poster com botão Instalar à direita -->
            <div style="width: 100%; background: #F8FAFC; border: 1.6px solid #CBD5E1; border-radius: 16px; padding: 10px 14px; display: flex; flex-direction: column; gap: 7px; text-align: left;">
              <!-- Header com seta e Google Play -->
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#444746" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span class="font-open-sans" style="font-size: 16px; font-weight: 600; color: #444746;">Google Play</span>
              </div>

              <!-- Linha principal: Ícone HUB + Textos + Botão Instalar à direita -->
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%;">
                <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                  <div style="width: 48px; height: 48px; flex-shrink: 0;">
                    ${cleanedIconHub}
                  </div>
                  <div style="display: flex; flex-direction: column; justify-content: center;">
                    <div class="font-bukra" style="font-size: 23px; font-weight: 900; line-height: 1.1; margin-bottom: 2px;">
                      <span style="color: #0F172A;">HUB</span> <span class="text-gradient-brand">LabDiv</span>
                    </div>
                    <div class="font-open-sans" style="font-size: 15.5px; line-height: 1.25; color: #475569; font-weight: 600;">
                      O HUB de comunicação científica do Laboratório de expressão e divulgação do IFUSP
                    </div>
                  </div>
                </div>

                <!-- Botão Instalar à direita -->
                <div style="background: #0F4780; color: #FFFFFF; border-radius: 10px; padding: 9px 16px; font-size: 17px; font-weight: 700; display: flex; align-items: center; gap: 6px; flex-shrink: 0; box-shadow: 0 2px 6px rgba(15, 71, 128, 0.20);">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Instalar</span>
                </div>
              </div>
            </div>

            <div class="qr-info-note font-open-sans" style="margin-top: 6px; font-size: 17.5px; line-height: 1.34;">
              <strong>Modo offline nativo:</strong> consulte sua grade personalizada, procure informações na wiki e acesse diversas funções do app mesmo sem conexão com a internet!
            </div>
          </div>
        </div>

        <!-- Card: Em Desenvolvimento (iOS & Desktop) com Ícone Vetorial SVG -->
        <div style="background: #FFFFFF; border: 1.8px dashed rgba(15, 71, 128, 0.35); border-radius: 16px; padding: 12px 18px; display: flex; align-items: center; gap: 14px; box-shadow: 0 4px 14px rgba(15, 71, 128, 0.08);">
          <div style="flex-shrink: 0; display: flex; align-items: center;">${iconFogueteSvg}</div>
          <div style="text-align: left;">
            <div class="font-bukra" style="font-size: 18px; font-weight: 800; color: #0F4780; text-transform: uppercase;">Em Desenvolvimento</div>
            <div style="font-size: 16.5px; color: #475569; font-weight: 600; line-height: 1.32; margin-top: 2px;">
              Versões nativas para <strong>iOS (Apple App Store)</strong> e <strong>Desktop</strong> (Windows, Mac e Linux) a caminho!
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- PAINEL 3: CAPA OFICIAL (LOGO DO HUB + IDV #0F4780, #F14343, #FFCC00) -->
    <div class="panel panel-3 font-open-sans" style="align-items: center; text-align: center; justify-content: space-between;">
      <!-- Topo Institucional -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;">
        <div class="font-bukra text-shield" style="font-size: 17.5px; font-weight: 800; color: #0F4780; letter-spacing: 1.2px; text-transform: uppercase;">
          Instituto de Física da USP &bull; LabDiv
        </div>
        <div style="width: 140px; height: 3.5px; border-radius: 999px; background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #FFCC00 100%);"></div>
      </div>

      <!-- Hero Central: Capelo + Marca HUB LabDiv -->
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; width: 100%;">
        <div style="width: 230px; height: 230px; margin: 0 auto 16px auto; display: flex; align-items: center; justify-content: center;">
          ${cleanedIconHub}
        </div>

        <div class="font-bukra" style="font-size: 72px; font-weight: 900; line-height: 1.0; letter-spacing: -1px; margin-bottom: 8px; text-align: center; width: 100%;">
          <span class="title-halo" style="color: #0F172A;">HUB</span> <span class="text-gradient-brand">LabDiv</span>
        </div>

        <div class="font-bukra title-halo" style="font-size: 24.5px; font-weight: 900; color: #F14343; letter-spacing: 0.2px; margin-bottom: 12px; text-align: center;">
          Conectando você à universidade
        </div>

        <p class="text-shield" style="font-size: 18.5px; color: #334155; font-weight: 600; line-height: 1.38; width: 100%; text-align: center; margin-bottom: 22px;">
          Uma aplicação desenvolvida para aprimorar a comunicação entre discentes, docentes e conectar o ambiente acadêmico à sociedade. Unindo rede social, enciclopédia interativa e ferramentas acadêmicas em uma plataforma aberta.
        </p>

        <!-- OS 3 EIXOS COM ÍCONES OFICIAIS (VISÃO IMEDIATA DO QUE É O APP) -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; width: 100%; max-width: 490px;">
          <!-- Eixo 1: Social -->
          <div style="background: #FFFFFF; border-radius: 18px; border: 1.8px solid rgba(15, 71, 128, 0.22); box-shadow: 0 8px 20px -3px rgba(15, 71, 128, 0.16), 0 3px 8px -2px rgba(15, 71, 128, 0.08); padding: 16px 10px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; overflow: hidden; min-height: 185px;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4.5px; background: #0F4780;"></div>
            <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(15, 71, 128, 0.10); border: 1.5px solid rgba(15, 71, 128, 0.25); display: flex; align-items: center; justify-content: center; color: #0F4780; margin-bottom: 8px;">
              ${iconComunidadeSvg}
            </div>
            <div class="font-bukra" style="font-size: 22px; font-weight: 900; color: #0F4780; margin-bottom: 4px; line-height: 1.15;">
              Social
            </div>
            <div style="font-size: 15.5px; color: #475569; font-weight: 600; line-height: 1.25;">
              Rede comunicativa &amp; pedagógica
            </div>
          </div>

          <!-- Eixo 2: Informativo -->
          <div style="background: #FFFFFF; border-radius: 18px; border: 1.8px solid rgba(241, 67, 67, 0.25); box-shadow: 0 8px 20px -3px rgba(241, 67, 67, 0.16), 0 3px 8px -2px rgba(241, 67, 67, 0.08); padding: 16px 10px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; overflow: hidden; min-height: 185px;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4.5px; background: #F14343;"></div>
            <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(241, 67, 67, 0.10); border: 1.5px solid rgba(241, 67, 67, 0.25); display: flex; align-items: center; justify-content: center; color: #F14343; margin-bottom: 8px;">
              ${iconCgifSvg}
            </div>
            <div class="font-bukra" style="font-size: 22px; font-weight: 900; color: #F14343; margin-bottom: 4px; line-height: 1.15;">
              Informativo
            </div>
            <div style="font-size: 15.5px; color: #475569; font-weight: 600; line-height: 1.25;">
              Enciclopédia acadêmica &amp; interativa
            </div>
          </div>

          <!-- Eixo 3: Ferramentas -->
          <div style="background: #FFFFFF; border-radius: 18px; border: 1.8px solid rgba(255, 204, 0, 0.55); box-shadow: 0 8px 20px -3px rgba(217, 119, 6, 0.18), 0 3px 8px -2px rgba(217, 119, 6, 0.08); padding: 16px 10px; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; overflow: hidden; min-height: 185px;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4.5px; background: #FFCC00;"></div>
            <div style="width: 54px; height: 54px; border-radius: 50%; background: rgba(255, 204, 0, 0.22); border: 1.5px solid #FFCC00; display: flex; align-items: center; justify-content: center; color: #854D0E; margin-bottom: 8px;">
              ${iconFerramentasSvg}
            </div>
            <div class="font-bukra" style="font-size: 22px; font-weight: 900; color: #854D0E; margin-bottom: 4px; line-height: 1.15;">
              Ferramentas
            </div>
            <div style="font-size: 15.5px; color: #475569; font-weight: 600; line-height: 1.25;">
              Funções de auxílio ao universitário
            </div>
          </div>
        </div>
      </div>

      <!-- Rodapé Oficial da Capa (Identico ao do Poster) -->
      <div style="width: 100%; border-top: 1.5px solid #E2E8F0; padding-top: 10px; display: flex; flex-direction: column; align-items: center; gap: 3px; text-align: center;">
        <div class="font-bukra text-shield" style="font-size: 16px; color: #64748B; font-weight: 600; letter-spacing: 0.2px;">
          Licença AGPLv3 &bull; LabDiv &bull; Instituto de Física da Universidade de São Paulo (IFUSP)
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// 3. Build HTML for Face 2 (Interna - 3 Panels: OS 3 EIXOS: Social, Informativo, Ferramentas)
function buildFace2Html() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>HUB LabDiv - Panfleto Dobrável em 3 (Face 2: Interna - Os 3 Eixos)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    ${getCommonCss()}
    .tri-sheet.face-2 {
      padding-top: 54px;
      padding-bottom: 0px;
    }
  </style>
</head>
<body>
  <div class="tri-sheet face-2">
    <div class="bg-math-pattern"></div>
    <!-- Linhas Verticais de Dobra (Face Interna: exatamente em 1/3 e 2/3 da folha) -->
    <div class="fold-guide fold-guide-1"></div>
    <div class="fold-guide fold-guide-2"></div>

    <!-- Header Superior Unificado (Exatamente 3 Partes de 1/3 da Folha) -->
    <header class="sheet-header-bar font-bukra" style="border-bottom: 2.5px solid transparent; background: linear-gradient(white, white) padding-box, linear-gradient(90deg, #0F4780 0%, #F14343 50%, #FFCC00 100%) border-box;">
      <!-- Coluna 1 (0 a 1/3 da folha): Identidade HUB LabDiv -->
      <div style="display: flex; align-items: center; gap: 12px; padding: 0 34px;">
        <div style="width: 36px; height: 36px; flex-shrink: 0;">${cleanedIconHub}</div>
        <div style="display: flex; flex-direction: column; line-height: 1.05; text-align: left;">
          <div style="display: flex; align-items: baseline; gap: 5px;">
            <span style="font-size: 24px; font-weight: 900; color: #0F172A; text-transform: uppercase;">HUB</span>
            <span class="text-gradient-brand" style="font-size: 24px; font-weight: 900;">LabDiv</span>
            <span style="font-size: 10.5px; font-weight: 900; background: rgba(15, 71, 128, 0.10); color: #0F4780; padding: 2px 7px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase;">BETA</span>
          </div>
          <span style="font-size: 10px; font-weight: 800; color: #94A3B8; letter-spacing: 1.5px; text-transform: uppercase; margin-top: 1px;">IFUSP</span>
        </div>
      </div>

      <!-- Coluna 2 (1/3 a 2/3 da folha): Descrição Institucional -->
      <div style="display: flex; align-items: center; justify-content: center; padding: 0 34px; text-align: center;">
        <div class="sheet-header-sub font-open-sans text-shield" style="font-size: 14.5px; color: #475569; font-weight: 600; line-height: 1.22;">
          O HUB de comunicação científica do Laboratório de Expressão e Divulgação do IFUSP
        </div>
      </div>

      <!-- Coluna 3 (2/3 a 3/3 da folha): Slogan das Funções -->
      <div style="display: flex; align-items: center; justify-content: flex-end; padding: 0 34px;">
        <div class="sheet-header-right font-bukra text-shield" style="font-size: 20px; font-weight: 900; color: #0F4780; font-style: italic;">
          1 APP &bull; INÚMERAS FUNÇÕES
        </div>
      </div>
    </header>

    <!-- PAINEL 1: SOCIAL (EIXO 1 - AZUL #0F4780) -->
    <div class="panel panel-int-1 font-open-sans">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span class="badge-pill badge-blue font-bukra">EIXO 1</span>
          <div style="color: #0F4780;">${iconComunidadeSvg}</div>
        </div>
        <h2 class="font-bukra title-halo title-dark" style="font-size: 42px; font-weight: 900; line-height: 1.1;">
          Social
        </h2>
        <div class="font-open-sans text-shield title-blue" style="font-size: 21px; font-weight: 800; margin-top: 3px;">
          Rede comunicativa &amp; mensageiro
        </div>
        <div class="font-open-sans text-shield" style="font-size: 17.5px; font-weight: 400; color: #0F172A; line-height: 1.34; margin-top: 5px;">
          Conexão com outros usuários com foco em criar uma relação comunicativa, segura e educativa.
        </div>
      </div>

      <!-- 3 Cards Modulares (Comunidade no Topo, Central de Interações no Meio, Lab Pessoal Abaixo) -->
      <div style="display: flex; flex-direction: column; gap: 14px; flex: 1; margin: 8px 0 0 0;">
        <!-- Card 1: Comunidade (Fluxo, Registros e Galeria) -->
        <div class="mini-card card-blue">
          <div class="mini-card-title title-blue font-bukra">
            ${iconComunidadeSvg}
            <span>Comunidade</span>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-blue"></div>
            <div class="mini-text"><strong>Fluxo:</strong> Feed de comunicação dialógica onde o conteúdo científico é compartilhado com foco em métricas pedagógicas e não de vaidade.</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-blue"></div>
            <div class="mini-text"><strong>Registros:</strong> Espaço de registro de vivências da comunidade acadêmica com foco na humanização de quem faz a ciência.</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-blue"></div>
            <div class="mini-text"><strong>Galeria:</strong> Galeria de expressões artísticas da comunidade para mostrar que cada cientista não só é humano, mas também é um ser único com suas criações e expressões.</div>
          </div>
        </div>

        <!-- Card 2: Central de Interações -->
        <div class="mini-card card-blue">
          <div class="mini-card-title title-blue font-bukra">
            ${iconInteracaoSvg}
            <span>Central de Interações</span>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-blue"></div>
            <div class="mini-text"><strong>Emaranhamento:</strong> Mensageiro criptografado para conversas diretas ou grupos de estudo com sigilo e foco acadêmico.</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-blue"></div>
            <div class="mini-text"><strong>Pergunte a um Cientista:</strong> Envie sua dúvida sobre ciência e o LabDiv conecta você a um pesquisador para respondê-la, tornando a ciência acessível e aproximando os cientistas da sociedade.</div>
          </div>
        </div>

        <!-- Card 3: Lab Pessoal -->
        <div class="mini-card card-blue">
          <div class="mini-card-title title-blue font-bukra">
            ${iconLabPessoalSvg}
            <span>Lab Pessoal</span>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-blue"></div>
            <div class="mini-text"><strong>Meu Feed:</strong> Acesso às suas publicações no Fluxo, registros e galeria.</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-blue"></div>
            <div class="mini-text"><strong>Constelação:</strong> Coleção pessoal de publicações, referências e conexões científicas favoritas salvas.</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-blue"></div>
            <div class="mini-text"><strong>Radiação:</strong> Medidor de contribuição comunicativa/aprendizado. Sistema de gamificação da plataforma.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- PAINEL 2: INFORMATIVO (EIXO 2 - VERMELHO #F14343) -->
    <div class="panel panel-int-2 font-open-sans">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span class="badge-pill badge-red font-bukra">EIXO 2</span>
          <div style="color: #F14343;">${iconCgifSvg}</div>
        </div>
        <h2 class="font-bukra title-halo title-dark" style="font-size: 42px; font-weight: 900; line-height: 1.1;">
          Informativo
        </h2>
        <div class="font-open-sans text-shield title-red" style="font-size: 21px; font-weight: 800; margin-top: 3px;">
          Central de gestão &amp; informação do IFUSP
        </div>
        <div class="font-open-sans text-shield" style="font-size: 17.5px; font-weight: 400; color: #0F172A; line-height: 1.34; margin-top: 5px;">
          Acesso rápido a oportunidades, editais, guias práticos e informações do instituto e universidade.
        </div>
      </div>

      <!-- 3 Cards Modulares: Wiki, Instituto e Interativo (Mesmo padrão amplo e harmonioso de Ferramentas) -->
      <div style="display: flex; flex-direction: column; gap: 14px; flex: 1; margin: 8px 0 0 0;">
        <!-- Card 1: Wiki (Tópicos de Conhecimento, USP 101 & Guia Metodológico) -->
        <div class="mini-card card-red">
          <div class="mini-card-title title-red font-bukra">
            ${iconWikiSvg}
            <span>Wiki Central</span>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-red"></div>
            <div class="mini-text"><strong>Tópicos de Conhecimento:</strong> Uma enciclopédia viva que reúne em tópicos todas as informações acadêmicas antes espalhadas pelo Júpiter, editais, portais, PPPs...</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-red"></div>
            <div class="mini-text"><strong>USP 101:</strong> Guia de vivência, dicas de sobrevivência e conselhos de veteranos para todos os institutos da USP.</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-red"></div>
            <div class="mini-text"><strong>Guia Metodológico:</strong> Diretrizes de metodologia científica, escrita acadêmica e guias práticos de como pesquisar, avaliar e ler artigos.</div>
          </div>
        </div>

        <!-- Card 2: Instituto (Iniciativas, Espaços & Influencers, Mapa Interativo, Conheça o IFUSP) -->
        <div class="mini-card card-red">
          <div class="mini-card-title title-red font-bukra">
            ${iconInstitutoSvg}
            <span>O Instituto</span>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-red"></div>
            <div class="mini-text"><strong>Iniciativas, Espaços &amp; Influencers:</strong> Coletivos de impacto (Lab-Div, Show da Física), espaços de convivência e divulgadores do IFUSP.</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-red"></div>
            <div class="mini-text"><strong>Mapa Interativo:</strong> Localização precisa de prédios, salas e pontos de interesse no campus.</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-red"></div>
            <div class="mini-text"><strong>Conheça o IFUSP:</strong> História, estrutura institucional, departamentos e funcionamento.</div>
          </div>
        </div>

        <!-- Card 3: Interativo (Oportunidades Ativas, Teste de Radiação & SAC) -->
        <div class="mini-card card-red">
          <div class="mini-card-title title-red font-bukra">
            ${iconInterativoSvg}
            <span>Interativo</span>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-red"></div>
            <div class="mini-text"><strong>Oportunidades Ativas:</strong> Mural atualizado de bolsas PUB, IC(s), estágios, eventos, cursos e vagas.</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-red"></div>
            <div class="mini-text"><strong>Teste de Radiação:</strong> Quizzes da Wiki e uma das formas de subir seu nível de radiação (sistema de gamificação).</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-red"></div>
            <div class="mini-text"><strong>SAC LabDiv:</strong> Respostas para os questionamentos frequentes feitos pela comunidade.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- PAINEL 3: FERRAMENTAS (EIXO 3 - AMARELO #FFCC00) -->
    <div class="panel panel-int-3 font-open-sans">
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span class="badge-pill badge-yellow font-bukra">EIXO 3</span>
          <div style="color: #854D0E;">${iconFerramentasSvg}</div>
        </div>
        <h2 class="font-bukra title-halo title-dark" style="font-size: 42px; font-weight: 900; line-height: 1.1;">
          Ferramentas
        </h2>
        <div class="font-open-sans text-shield title-yellow" style="font-size: 21px; font-weight: 800; margin-top: 3px;">
          Grade interativa, anotações &amp; recursos
        </div>
        <div class="font-open-sans text-shield" style="font-size: 17.5px; font-weight: 400; color: #0F172A; line-height: 1.34; margin-top: 5px;">
          Recursos práticos para organizar estudos, montar sua grade horária e explorar softwares.
        </div>
      </div>

      <!-- 3 Cards Modulares por Público -->
      <div style="display: flex; flex-direction: column; gap: 14px; flex: 1; margin: 8px 0 0 0;">
        <!-- Card 1: Discentes -->
        <div class="mini-card card-yellow">
          <div class="mini-card-title title-yellow font-bukra">
            ${iconDiscentesSvg}
            <span>Para Discentes</span>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-yellow"></div>
            <div class="mini-text"><strong>Grade Horária Interativa &amp; Trilhas:</strong> Montagem visual de rotina, controle de faltas e navegação da grade curricular em trilhas.</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-yellow"></div>
            <div class="mini-text"><strong>Central de Anotações &amp; Softwares:</strong> Espaço onde a comunidade compartilha anotações das disciplinas e softwares (aplicações, scripts e sites desenvolvidos).</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-yellow"></div>
            <div class="mini-text"><strong>Match Acadêmico:</strong> Une discentes em grupos de estudo e sistema de adoção, e conecta discentes com docentes no Quero uma IC.</div>
          </div>
        </div>

        <!-- Card 2: Docentes -->
        <div class="mini-card card-yellow">
          <div class="mini-card-title title-yellow font-bukra">
            ${iconDocentesSvg}
            <span>Para Docentes</span>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-yellow"></div>
            <div class="mini-text"><strong>Quero um Ajudante:</strong> Conexão direta com discentes para apoio em projetos de pesquisa, monitorias didáticas e laboratórios.</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-yellow"></div>
            <div class="mini-text"><strong>Desafios:</strong> Competições saudáveis entre departamentos e pesquisadores (quem didatiza melhor, quem comunica mais e dinâmicas colaborativas).</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-yellow"></div>
            <div class="mini-text"><strong>Adaptar para uma Disciplina:</strong> Personalização e integração dos recursos da plataforma para as necessidades da sua matéria.</div>
          </div>
        </div>

        <!-- Card 3: Para Curiosos (Ingresso IFUSP & Visitas) -->
        <div class="mini-card card-yellow">
          <div class="mini-card-title title-yellow font-bukra">
            ${iconCuriososSvg}
            <span>Para Curiosos</span>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-yellow"></div>
            <div class="mini-text"><strong>Como Ingressar:</strong> Guia completo de formas de ingresso no IFUSP (FUVEST, ENEM-USP, Provão Paulista e Olimpíadas).</div>
          </div>
          <div class="mini-feature-item">
            <div class="mini-bullet bullet-yellow"></div>
            <div class="mini-text"><strong>Visitas &amp; Extensão:</strong> Divulgação de iniciativas e espaços USP abertos ao público.</div>
          </div>
        </div>
      </div>
    </div>

    <!-- FOOTER UNIFICADO (Face 2: Linha contínua em degradê + 3 cards coloridos + licença) -->
    <footer class="sheet-footer-bar">
      <div class="sheet-footer-divider"></div>
      <div class="sheet-footer-cards">
        <!-- Card 1: Social / Segurança & Privacidade (Azul #0F4780) -->
        <div class="panel-footer-card card-footer-blue">
          <div class="panel-footer-header font-bukra" style="color: #0F4780;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Segurança &amp; Privacidade</span>
          </div>
          <div class="panel-footer-body font-open-sans">
            Proteção rigorosa de dados (<strong>LGPD</strong>), sigilo absoluto e portabilidade <strong>Takeout</strong> com soberania total do usuário.
          </div>
        </div>

        <!-- Card 2: Informativo / Conformidade Legal & Ética (Vermelho #F14343) -->
        <div class="panel-footer-card card-footer-red">
          <div class="panel-footer-header font-bukra" style="color: #F14343;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="m9 12 2 2 4-4"/>
            </svg>
            <span>Conformidade Legal &amp; Ética</span>
          </div>
          <div class="panel-footer-body font-open-sans">
            Em conformidade com o <strong>Marco Civil da Internet</strong> (Lei 12.965/14) e <strong>ECA Digital</strong>: neutralidade e livre de retenção tóxica.
          </div>
        </div>

        <!-- Card 3: Ferramentas / Open Source & Licença AGPLv3 (Amarelo #FFCC00) -->
        <div class="panel-footer-card card-footer-yellow">
          <div class="panel-footer-header font-bukra" style="color: #854D0E;">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="16 18 22 12 16 6"/>
              <polyline points="8 6 2 12 8 18"/>
            </svg>
            <span>Open Source &amp; Licença AGPLv3</span>
          </div>
          <div class="panel-footer-body font-open-sans">
            Código livre e auditável: <strong>github.com/HUB-LabDiv/HUB-LabDiv</strong> &bull; Contato para sugestões: <strong>hublabdiv@gmail.com</strong>
          </div>
        </div>
      </div>
    </footer>
  </div>
</body>
</html>`;
}

// 4. Build HTML for Combined (2 Pages for PDF Print)
function buildCombinedHtml({ qrWebSvg, qrPlaySvg, qrLabDivSvg }) {
  const face1Body = buildFace1Html({ qrWebSvg, qrPlaySvg, qrLabDivSvg })
    .replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*?<\/html>/i, '');

  const face2Body = buildFace2Html()
    .replace(/<!DOCTYPE html>[\s\S]*?<body[^>]*>/i, '')
    .replace(/<\/body>[\s\S]*?<\/html>/i, '');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>HUB LabDiv - Panfleto Dobrável em 3 (Tri-Fold 2 Páginas A4 Paisagem)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    ${getCommonCss()}
    @page {
      size: 1754px 1240px;
      margin: 0;
    }
    body {
      background: #CBD5E1;
      padding: 30px 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
      height: auto !important;
      overflow: auto !important;
    }
    .sheet-wrapper {
      width: 1754px;
      height: 1240px;
      background: #FFFFFF;
      box-shadow: 0 16px 40px rgba(0,0,0,0.18);
      position: relative;
      overflow: hidden;
      page-break-after: always;
      break-after: page;
      flex-shrink: 0;
    }
    .sheet-wrapper:last-child {
      page-break-after: avoid;
      break-after: avoid;
    }
    .tri-sheet.face-1 {
      padding-top: 0;
      padding-bottom: 0;
    }
    .tri-sheet.face-2 {
      padding-top: 54px;
      padding-bottom: 0px;
    }
    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
        gap: 0 !important;
      }
      .sheet-wrapper {
        box-shadow: none !important;
      }
    }
  </style>
</head>
<body>
  <!-- PÁGINA 1: EXTERNO -->
  <div class="sheet-wrapper">
    ${face1Body}
  </div>
  <!-- PÁGINA 2: INTERNO -->
  <div class="sheet-wrapper">
    ${face2Body}
  </div>
</body>
</html>`;
}

async function main() {
  console.log('Generating QR codes with central badge...');
  const qrWebSvg = await QRCode.toString('https://hub-lab-div.vercel.app', {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1
  });

  const qrPlaySvg = await QRCode.toString('https://play.google.com/store/apps/details?id=br.usp.ifusp.hublabdiv', {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1
  });

  const qrLabDivSvg = await QRCode.toString('https://sites.google.com/usp.br/labdiv', {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1
  });

  // 1. Write HTML files
  const htmlExterno = buildFace1Html({ qrWebSvg, qrPlaySvg, qrLabDivSvg });
  const htmlInterno = buildFace2Html();
  const htmlCombined = buildCombinedHtml({ qrWebSvg, qrPlaySvg, qrLabDivSvg });

  const pathExterno = path.join(OUT_DIR, '2Dpanfleto-externo.html');
  const pathInterno = path.join(OUT_DIR, '2Dpanfleto-interno.html');
  const pathCombined = path.join(OUT_DIR, '2Dpanfleto-combined.html');

  fs.writeFileSync(pathExterno, htmlExterno, 'utf-8');
  fs.writeFileSync(pathInterno, htmlInterno, 'utf-8');
  fs.writeFileSync(pathCombined, htmlCombined, 'utf-8');
  console.log('Saved 2Dpanfleto HTML files: 2Dpanfleto-externo.html, 2Dpanfleto-interno.html, 2Dpanfleto-combined.html');

  // 2. Launch Puppeteer with Chromium
  console.log('Launching Chromium with Puppeteer to render 300 DPI graphics for 2Dpanfleto...');
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

  // Render Face 1 PNG (Ultra-HD / 450 DPI) & Vector PDF (Page 1)
  const pageExterno = await browser.newPage();
  await pageExterno.setViewport({ width: 1754, height: 1240, deviceScaleFactor: 3 });
  await pageExterno.goto(`file://${pathExterno}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await pageExterno.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 800));

  const pathPngExterno = path.join(OUT_DIR, '2Dpanfleto-externo.png');
  await pageExterno.screenshot({
    path: pathPngExterno,
    type: 'png',
    clip: { x: 0, y: 0, width: 1754, height: 1240 }
  });
  console.log('Rendered Ultra-HD PNG Face 1 (5262x3720): ' + pathPngExterno);

  const pathPdfExterno = path.join(OUT_DIR, '2Dpanfleto-externo.temp.pdf');
  await pageExterno.pdf({
    path: pathPdfExterno,
    width: '1754px',
    height: '1240px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await pageExterno.close();

  // Render Face 2 PNG (Ultra-HD / 450 DPI) & Vector PDF (Page 2)
  const pageInterno = await browser.newPage();
  await pageInterno.setViewport({ width: 1754, height: 1240, deviceScaleFactor: 3 });
  await pageInterno.goto(`file://${pathInterno}`, { waitUntil: 'networkidle0', timeout: 60000 });
  await pageInterno.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 800));

  const pathPngInterno = path.join(OUT_DIR, '2Dpanfleto-interno.png');
  await pageInterno.screenshot({
    path: pathPngInterno,
    type: 'png',
    clip: { x: 0, y: 0, width: 1754, height: 1240 }
  });
  console.log('Rendered Ultra-HD PNG Face 2 (5262x3720): ' + pathPngInterno);

  const pathPdfInterno = path.join(OUT_DIR, '2Dpanfleto-interno.temp.pdf');
  await pageInterno.pdf({
    path: pathPdfInterno,
    width: '1754px',
    height: '1240px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });
  await pageInterno.close();

  await browser.close();

  // 3. Generate 2-Page Ultra-HD PDF directly from PNGs (100% identical pixel-perfect to PNGs)
  const pathPdf = path.join(OUT_DIR, '2Dpanfleto.pdf');
  const pyCmd = `python3 -c "
from PIL import Image
p1 = Image.open(r'${pathPngExterno}').convert('RGB')
p2 = Image.open(r'${pathPngInterno}').convert('RGB')
p1.save(r'${pathPdf}', 'PDF', save_all=True, append_images=[p2], resolution=450.0)
print('Generated 100% PNG-Identical PDF: ${pathPdf}')
"`;
  execSync(pyCmd, { stdio: 'inherit' });

  // 4. Mirror deliverables to active conversation artifacts dirs
  const activeArtifactDirs = [
    (process.env.ARTIFACTS_DIR || './artifacts'),
    (process.env.ARTIFACTS_DIR || './artifacts'),
    ACTIVE_CONV_ARTIFACTS_DIR
  ];
  for (const dir of activeArtifactDirs) {
    if (fs.existsSync(dir)) {
      fs.copyFileSync(pathPngExterno, path.join(dir, '2Dpanfleto-externo.png'));
      fs.copyFileSync(pathPngInterno, path.join(dir, '2Dpanfleto-interno.png'));
      fs.copyFileSync(pathPdf, path.join(dir, '2Dpanfleto.pdf'));
      console.log('Copied 2D deliverables to active artifacts dir: ' + dir);
    }
  }

  console.log('Panfleto 2D (2 dobras / 3 partes) gerado com sucesso em Modo Claro!');
}

main().catch(err => {
  console.error('Error generating tri-fold panfleto:', err);
  process.exit(1);
});
