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

const ACTIVE_ARTIFACTS_DIR = (process.env.ARTIFACTS_DIR || './artifacts');
const CURRENT_ARTIFACTS_DIR = (process.env.ARTIFACTS_DIR || './artifacts');
const PREV_ARTIFACTS_DIR = (process.env.ARTIFACTS_DIR || './artifacts');
const ARTIFACTS_DIR = (process.env.ARTIFACTS_DIR || './artifacts');
const OLD_ARTIFACTS_DIR = (process.env.ARTIFACTS_DIR || './artifacts');
const CURRENT_CONV_ARTIFACTS_DIR = (process.env.ARTIFACTS_DIR || './artifacts');
const THIS_CONV_ARTIFACTS_DIR = (process.env.ARTIFACTS_DIR || './artifacts');
const PREV_THIS_CONV_ARTIFACTS_DIR = (process.env.ARTIFACTS_DIR || './artifacts');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const OUT_DIR = path.join(PUBLIC_DIR, 'divulgacao/posters');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

// 1. Read source assets
const bgIfSvg = fs.readFileSync(path.join(PUBLIC_DIR, 'bg-if.svg'), 'utf-8');
const iconHubSvg = fs.readFileSync(path.join(PUBLIC_DIR, 'icone-HUBLabDiv.svg'), 'utf-8');
const cleanedIconHub = iconHubSvg.replace(/<\?xml[^>]*\?>/gi, '').replace(/<!--[\s\S]*?-->/g, '').trim();
const playStoreImgPath = path.join(PUBLIC_DIR, 'divulgacao/google-play-app-listing.png');
const playStoreImgBase64 = fs.readFileSync(playStoreImgPath).toString('base64');

// High-contrast clean academic version of bg-if.svg for light mode
const bgIfLightSvg = bgIfSvg
  .replace(/fill="#0F4780"/g, 'fill="#0F4780"')
  .replace(/stroke="#0F4780"/g, 'stroke="#0F4780"')
  .replace(/fill="#F14343"/g, 'fill="#F14343"')
  .replace(/stroke="#F14343"/g, 'stroke="#F14343"')
  .replace(/fill="#FFCC00"/g, 'fill="#D97706"')
  .replace(/stroke="#FFCC00"/g, 'stroke="#D97706"')
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
  .replace(/rx="12" ry="4"/g, 'rx="18" ry="6"')
  .replace(/stroke-width="0\.6"/g, 'stroke-width="2.2"');

const bgIfLightBase64 = Buffer.from(bgIfLightSvg).toString('base64');

// Axis icons matching mobile navigation bar
const iconComunidadeSvg = `<svg width="26" height="26" viewBox="0 -960 960 960" fill="currentColor">
  <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/>
</svg>`;

const iconCgifSvg = `<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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

const iconFerramentasSvg = `<svg width="26" height="26" viewBox="0 -960 960 960" fill="currentColor">
  <path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z"/>
</svg>`;

const commonHead = `
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    @page {
      size: 1240px 1754px;
      margin: 0;
    }
    html, body {
      width: 1240px;
      height: 1754px;
      margin: 0;
      padding: 0;
      overflow: hidden;
      font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .font-bukra {
      font-family: 'Outfit', 'Segoe UI', -apple-system, sans-serif;
      letter-spacing: -0.5px;
    }
    .poster-container {
      position: relative;
      width: 1240px;
      height: 1754px;
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  </style>
`;

function buildPosterHtml({ qrWebSvg, qrPlaySvg }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <title>HUB LabDiv - Cartaz Oficial A4 Modo Claro</title>
  ${commonHead}
  <style>
    body {
      background-color: #F8FAFC;
      color: #0F172A;
    }
    .poster-container {
      background-color: #F8FAFC;
    }
    .bg-math-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 1240px;
      height: 1754px;
      background-image: url('data:image/svg+xml;base64,${bgIfLightBase64}');
      background-repeat: repeat;
      background-size: 820px 820px;
      opacity: 0.55;
      pointer-events: none;
      z-index: 1;
    }
    .content-layer {
      position: relative;
      z-index: 10;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* MAIN BODY - SPACED HARMONIOUSLY BETWEEN TOP & FOOTER */
    .main-body {
      flex: 1;
      padding: 24px 52px 14px 52px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      gap: 0;
    }

    /* CRISP LIGHT TYPOGRAPHY & SHADOWS */
    .text-halo {
      text-shadow: 0 1px 3px rgba(255, 255, 255, 0.95), 0 0 10px rgba(255, 255, 255, 0.9);
    }
    .title-halo {
      text-shadow: 0 2px 10px rgba(15, 71, 128, 0.1), 0 0 2px rgba(255, 255, 255, 0.95);
    }

    /* HERO SECTION: PLAYSTORE APP SCREENSHOT + 1 APP (TOP ROW) / INÚMERAS VERSÕES (CENTERED BELOW) */
    .hero-section {
      display: flex;
      flex-direction: column;
      margin-top: 0;
      margin-bottom: 0;
    }
    .hero-top-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 44px;
    }
    .app-identity-card {
      width: 670px;
      border-radius: 26px;
      border: 2px solid rgba(15, 71, 128, 0.22);
      box-shadow: 0 10px 28px -4px rgba(15, 71, 128, 0.16), 0 4px 10px -2px rgba(15, 71, 128, 0.08);
      background: #FFFFFF;
      padding: 16px 24px 20px 24px;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }
    .app-identity-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
      background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #FFCC00 100%);
    }
    .card-play-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      padding-left: 2px;
    }
    .card-play-arrow {
      color: #444746;
      flex-shrink: 0;
    }
    .card-play-brand {
      font-size: 21px;
      font-weight: 600;
      color: #444746;
      letter-spacing: -0.2px;
    }
    .card-main-content {
      display: flex;
      align-items: center;
      gap: 20px;
      width: 100%;
    }
    .app-identity-icon {
      width: 96px;
      height: 96px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .app-identity-icon svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .card-right-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
    }
    .app-identity-title {
      font-size: 44px;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }
    .app-identity-title .hub-word {
      color: #0F172A;
    }
    .app-identity-title .labdiv-word {
      background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #D97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .app-identity-desc {
      font-size: 18px;
      line-height: 1.36;
      color: #334155;
      font-weight: 600;
      letter-spacing: 0.1px;
    }
    .card-install-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      background: #0b57d0;
      color: #FFFFFF;
      border-radius: 9999px;
      padding: 13px 24px;
      font-size: 19px;
      font-weight: 700;
      letter-spacing: 0.2px;
      box-shadow: 0 4px 12px rgba(11, 87, 208, 0.30);
      margin-top: 14px;
      width: 100%;
      box-sizing: border-box;
    }
    .hero-side-col {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-grow: 1;
    }
    .hero-1app {
      font-size: 125px;
      font-weight: 900;
      font-style: italic;
      text-transform: uppercase;
      line-height: 0.95;
      color: #0F4780;
      letter-spacing: 2px;
    }
    .hero-versoes-wrap {
      width: 100%;
      text-align: center;
      margin-top: 18px;
      margin-bottom: 0;
    }
    .hero-versoes {
      font-size: 74px;
      font-weight: 900;
      font-style: italic;
      text-transform: uppercase;
      line-height: 1.0;
      color: #0F172A;
      letter-spacing: 1.5px;
      display: inline-block;
    }
    .title-blue {
      color: #0F4780;
      text-shadow: 0 2px 14px rgba(15, 71, 128, 0.16), 0 0 2px rgba(255, 255, 255, 0.9);
    }
    .title-dark {
      color: #0F172A;
      text-shadow: 0 2px 14px rgba(15, 71, 128, 0.12), 0 0 2px rgba(255, 255, 255, 0.9);
    }

    /* 3 EIXOS SECTION - CARDS COMPACTOS E HARMONIOSOS (GAP 1 = 50px) */
    .axes-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
      margin-top: 50px;
    }
    .axis-card {
      background: #FFFFFF;
      border-radius: 22px;
      padding: 14px 18px 16px 18px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      box-shadow: 0 10px 26px -4px rgba(15, 71, 128, 0.14), 0 4px 10px -2px rgba(15, 71, 128, 0.06);
      position: relative;
      overflow: hidden;
      min-height: 265px;
    }
    .axis-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 7px;
    }
    .axis-social {
      border: 2px solid rgba(15, 71, 128, 0.28);
      box-shadow: 0 10px 26px -4px rgba(15, 71, 128, 0.16), 0 4px 10px -2px rgba(15, 71, 128, 0.08);
    }
    .axis-social::before {
      background: #0F4780;
    }
    .axis-informativo {
      border: 2px solid rgba(241, 67, 67, 0.28);
      box-shadow: 0 10px 26px -4px rgba(241, 67, 67, 0.16), 0 4px 10px -2px rgba(241, 67, 67, 0.08);
    }
    .axis-informativo::before {
      background: #F14343;
    }
    .axis-ferramentas {
      border: 2px solid rgba(245, 158, 11, 0.35);
      box-shadow: 0 10px 26px -4px rgba(217, 119, 6, 0.18), 0 4px 10px -2px rgba(217, 119, 6, 0.08);
    }
    .axis-ferramentas::before {
      background: #FFCC00;
    }
    .axis-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
    }
    .axis-number {
      font-size: 17px;
      font-weight: 900;
      padding: 7px 16px;
      border-radius: 12px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .axis-social .axis-number {
      background: rgba(15, 71, 128, 0.08);
      color: #0F4780;
    }
    .axis-informativo .axis-number {
      background: rgba(241, 67, 67, 0.08);
      color: #DC2626;
    }
    .axis-ferramentas .axis-number {
      background: rgba(255, 204, 0, 0.18);
      color: #B45309;
    }
    .axis-icon-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      border-radius: 14px;
    }
    .axis-social .axis-icon-badge {
      background: rgba(15, 71, 128, 0.08);
      color: #0F4780;
      border: 1.5px solid rgba(15, 71, 128, 0.2);
    }
    .axis-informativo .axis-icon-badge {
      background: rgba(241, 67, 67, 0.08);
      color: #DC2626;
      border: 1.5px solid rgba(241, 67, 67, 0.2);
    }
    .axis-ferramentas .axis-icon-badge {
      background: rgba(255, 204, 0, 0.16);
      color: #B45309;
      border: 1.5px solid rgba(245, 158, 11, 0.3);
    }
    .axis-title {
      font-size: 38px;
      font-weight: 900;
      color: #0F172A;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }
    .axis-subtitle {
      font-size: 17px;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 8px;
      letter-spacing: 0.2px;
      min-height: 44px;
    }
    .axis-social .axis-subtitle { color: #0284C7; }
    .axis-informativo .axis-subtitle { color: #E11D48; }
    .axis-ferramentas .axis-subtitle { color: #D97706; }

    .axis-features {
      list-style: none;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      flex-grow: 1;
      gap: 10px;
      margin-top: 4px;
    }
    .axis-feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 23px;
      line-height: 1.25;
      color: #1E293B;
    }
    .axis-feature-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      margin-top: 0;
      flex-shrink: 0;
    }
    .axis-social .axis-feature-dot { background: #0F4780; }
    .axis-informativo .axis-feature-dot { background: #F14343; }
    .axis-ferramentas .axis-feature-dot { background: #FFCC00; }
    .axis-feature-item strong {
      color: #0F172A;
      font-weight: 800;
      font-size: 23px;
      letter-spacing: 0.2px;
    }

    /* SECTION: EXPERIMENTE O HUB AGORA (GAP 2 = 50px) */
    .section-experimente {
      margin-top: 50px;
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-grow: 0;
      justify-content: flex-start;
    }
    .hub-section-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .hub-section-header.justify-center {
      justify-content: center;
    }
    .hub-section-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      flex-shrink: 0;
      color: #0F4780;
    }
    .hub-section-title {
      font-size: 50px;
      font-weight: 900;
      font-style: italic;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      line-height: 1.1;
      color: #0F172A;
    }
    .qr-cards-wrap {
      display: flex;
      justify-content: center;
      gap: 40px;
      margin-top: 50px;
    }
    .qr-card-item {
      background: linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(135deg, #0F4780 0%, #38BDF8 32%, #F14343 68%, #FFCC00 100%) border-box;
      border: 4px solid transparent;
      border-radius: 36px;
      padding: 22px 22px 24px 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 12px 32px -4px rgba(15, 71, 128, 0.16), 0 4px 12px -2px rgba(15, 71, 128, 0.08);
      width: 480px;
      text-align: center;
    }
    .qr-svg-holder {
      width: 420px;
      height: 420px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #FFFFFF;
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
      width: 98px;
      height: 98px;
      background: linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(135deg, #0F4780 0%, #F14343 50%, #FFCC00 100%) border-box;
      border: 3.5px solid transparent;
      border-radius: 22px;
      box-shadow: 0 0 0 4px #FFFFFF, 0 4px 14px rgba(0, 0, 0, 0.14);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 8px;
      z-index: 10;
    }
    .qr-center-icon {
      width: 78px;
      height: 78px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-card-label {
      margin-top: 16px;
      font-size: 30px;
      font-weight: 900;
      color: #0F172A;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
      white-space: nowrap;
    }
    .qr-card-sub {
      font-size: 20px;
      font-weight: 700;
      color: #64748B;
      margin-top: 4px;
      white-space: nowrap;
    }
    .experimente-perks-bottom {
      margin-top: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
      font-size: 22px;
      font-weight: 800;
      color: #0F4780;
      letter-spacing: 0.4px;
    }
    .perk-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .perk-check {
      color: #0284C7;
      font-weight: 900;
    }
    .perk-bullet {
      color: #CBD5E1;
      font-size: 22px;
    }

    /* SLENDER MODERN FOOTER WITH HORIZONTAL DEGRADÊ LINE */
    .footer-bar {
      width: 100%;
      background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);
      box-shadow: 0 -4px 20px rgba(15, 71, 128, 0.08);
      display: flex;
      flex-direction: column;
      position: relative;
    }
    .footer-gradient-divider {
      width: 100%;
      height: 3.5px;
      background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #FFCC00 100%);
    }
    .footer-content-wrap {
      padding: 18px 52px 12px 52px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .footer-main-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 36px;
    }
    .footer-legal-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
      flex: 1;
    }
    .footer-legal-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 900;
      color: #0F4780;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .footer-legal-text {
      font-size: 19px;
      color: #334155;
      line-height: 1.40;
      font-weight: 600;
      letter-spacing: 0.1px;
    }
    .footer-legal-text strong {
      color: #0F172A;
      font-weight: 800;
    }
    .footer-buttons-col {
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex-shrink: 0;
    }
    .footer-action-card {
      display: flex;
      align-items: center;
      gap: 14px;
      background: #FFFFFF;
      border-radius: 16px;
      padding: 9px 18px;
      box-shadow: 0 4px 14px rgba(15, 71, 128, 0.10), 0 1px 3px rgba(0, 0, 0, 0.04);
      min-width: 420px;
      box-sizing: border-box;
    }
    .footer-card-git {
      border: 1.8px solid rgba(15, 71, 128, 0.28);
    }
    .footer-card-email {
      border: 1.8px solid rgba(241, 67, 67, 0.28);
    }
    .footer-icon-holder {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-holder-git {
      background: rgba(15, 71, 128, 0.10);
      color: #0F4780;
      border: 1.5px solid rgba(15, 71, 128, 0.25);
    }
    .icon-holder-email {
      background: rgba(241, 67, 67, 0.10);
      color: #DC2626;
      border: 1.5px solid rgba(241, 67, 67, 0.25);
    }
    .footer-action-info {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .footer-action-tag {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      line-height: 1.1;
    }
    .tag-git {
      color: #0F4780;
    }
    .tag-email {
      color: #DC2626;
    }
    .footer-action-val {
      font-size: 18.5px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.2px;
      margin-top: 2px;
    }
    .footer-bottom-line {
      font-size: 14px;
      color: #64748B;
      font-weight: 600;
      text-align: center;
      padding-top: 8px;
      border-top: 1px solid #E2E8F0;
    }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="bg-math-pattern"></div>
    <div class="content-layer">
      <!-- Main body (Spaced evenly across poster) -->
      <main class="main-body">
        <!-- Hero Section: Playstore Screenshot + 1 APP (Row 1) / INÚMERAS VERSÕES (Row 2 Centralizado) -->
        <div class="hero-section">
          <div class="hero-top-row">
            <!-- Card de texto e ícone estilo Google Play do HUB LabDiv -->
            <div class="app-identity-card">
              <div class="card-play-header">
                <svg class="card-play-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#444746" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                <span class="card-play-brand font-open-sans">Google Play</span>
              </div>

              <div class="card-main-content">
                <div class="app-identity-icon">
                  ${cleanedIconHub}
                </div>
                <div class="card-right-col">
                  <div class="app-identity-title font-bukra">
                    <span class="hub-word">HUB</span> <span class="labdiv-word">LabDiv</span>
                  </div>
                  <div class="app-identity-desc font-open-sans">
                    O HUB de comunicação científica do Laboratório de expressão e divulgação do IFUSP
                  </div>
                </div>
              </div>

              <div class="card-install-btn font-open-sans">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Instalar</span>
              </div>
            </div>

            <!-- 1 APP ao lado -->
            <div class="hero-side-col">
              <div class="hero-1app font-bukra title-halo title-blue">1 APP</div>
            </div>
          </div>

          <!-- INÚMERAS FUNÇÕES centralizado abaixo -->
          <div class="hero-versoes-wrap">
            <div class="hero-versoes font-bukra title-halo title-dark">INÚMERAS FUNÇÕES</div>
          </div>
        </div>

        <!-- Os 3 Eixos -->
        <div class="axes-grid">
          <!-- Eixo 1: Social -->
          <div class="axis-card axis-social">
            <div class="axis-header font-bukra">
              <div class="axis-number">Eixo 1</div>
              <div class="axis-icon-badge">${iconComunidadeSvg}</div>
            </div>
            <h3 class="axis-title font-bukra">Social</h3>
            <div class="axis-subtitle font-open-sans">Rede social comunicativa &amp; mensageiro</div>
            <ul class="axis-features font-bukra">
              <li class="axis-feature-item">
                <span class="axis-feature-dot"></span>
                <div><strong>Fluxo</strong></div>
              </li>
              <li class="axis-feature-item">
                <span class="axis-feature-dot"></span>
                <div><strong>Registros &amp; Galeria</strong></div>
              </li>
              <li class="axis-feature-item">
                <span class="axis-feature-dot"></span>
                <div><strong>Central de Interações</strong></div>
              </li>
            </ul>
          </div>

          <!-- Eixo 2: Informativo -->
          <div class="axis-card axis-informativo">
            <div class="axis-header font-bukra">
              <div class="axis-number">Eixo 2</div>
              <div class="axis-icon-badge">${iconCgifSvg}</div>
            </div>
            <h3 class="axis-title font-bukra">Informativo</h3>
            <div class="axis-subtitle font-open-sans">Central de informações e uma Wiki da USP</div>
            <ul class="axis-features font-bukra">
              <li class="axis-feature-item">
                <span class="axis-feature-dot"></span>
                <div><strong>Wiki Central</strong></div>
              </li>
              <li class="axis-feature-item">
                <span class="axis-feature-dot"></span>
                <div><strong>O Instituto</strong></div>
              </li>
              <li class="axis-feature-item">
                <span class="axis-feature-dot"></span>
                <div><strong>Interativo</strong></div>
              </li>
            </ul>
          </div>

          <!-- Eixo 3: Ferramentas -->
          <div class="axis-card axis-ferramentas">
            <div class="axis-header font-bukra">
              <div class="axis-number">Eixo 3</div>
              <div class="axis-icon-badge">${iconFerramentasSvg}</div>
            </div>
            <h3 class="axis-title font-bukra">Ferramentas</h3>
            <div class="axis-subtitle font-open-sans">Acompanhamento/planejamento do curso &amp; semestre</div>
            <ul class="axis-features font-bukra">
              <li class="axis-feature-item">
                <span class="axis-feature-dot"></span>
                <div><strong>Grade &amp; Trilhas</strong></div>
              </li>
              <li class="axis-feature-item">
                <span class="axis-feature-dot"></span>
                <div><strong>Match Acadêmico</strong></div>
              </li>
              <li class="axis-feature-item">
                <span class="axis-feature-dot"></span>
                <div><strong>Central de Anotações</strong></div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Section: Experimente o HUB Agora -->
        <div class="section-experimente">
          <div class="hub-section-header justify-center">
            <div class="hub-section-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0F4780" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 3px rgba(15, 71, 128, 0.10));">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
              </svg>
            </div>
            <h2 class="hub-section-title font-bukra title-halo">
              <span class="title-dark">EXPERIMENTE O HUB AGORA</span>
            </h2>
          </div>

          <div class="qr-cards-wrap">
            <!-- QR Web -->
            <div class="qr-card-item">
              <div class="qr-svg-holder">
                ${qrWebSvg}
                <div class="qr-center-badge">
                  <div class="qr-center-icon">
                    ${cleanedIconHub}
                  </div>
                </div>
              </div>
              <div class="qr-card-label font-bukra">🌐 Acesse no Site</div>
              <div class="qr-card-sub font-open-sans">hub-lab-div.vercel.app</div>
            </div>

            <!-- QR PlayStore -->
            <div class="qr-card-item">
              <div class="qr-svg-holder">
                ${qrPlaySvg}
                <div class="qr-center-badge">
                  <div class="qr-center-icon">
                    ${cleanedIconHub}
                  </div>
                </div>
              </div>
              <div class="qr-card-label font-bukra">▶ Google Play</div>
              <div class="qr-card-sub font-open-sans">App Oficial Android</div>
            </div>
          </div>

          <!-- Perks BELOW QR codes -->
          <div class="experimente-perks-bottom font-bukra text-halo">
            <span class="perk-item"><span class="perk-check">✓</span> Sincronização em Nuvem</span>
            <span class="perk-bullet">&bull;</span>
            <span class="perk-item"><span class="perk-check">✓</span> Modo Offline</span>
            <span class="perk-bullet">&bull;</span>
            <span class="perk-item"><span class="perk-check">✓</span> 100% Gratuito</span>
          </div>
        </div>
      </main>

      <!-- Footer bar (Touches bottom, left, right edges) -->
      <footer class="footer-bar">
        <div class="footer-gradient-divider"></div>
        <div class="footer-content-wrap">
          <div class="footer-main-row">
            <!-- Texto de Segurança & Conformidade Legal -->
            <div class="footer-legal-col">
              <div class="footer-legal-badge font-bukra">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
                <span>SEGURANÇA &amp; CONFORMIDADE LEGAL</span>
              </div>
              <p class="footer-legal-text font-open-sans">
                O <strong>HUB LabDiv</strong> respeita as <strong>leis, normas e decisões judiciais do Brasil</strong>, além de ter todo o seu <strong>código aberto</strong> e um e-mail para <strong>suporte, sugestões e ideias da comunidade</strong>.
              </p>
            </div>

            <!-- Botões ao lado: Git e Email -->
            <div class="footer-buttons-col">
              <!-- Git / Software Livre -->
              <div class="footer-action-card footer-card-git">
                <div class="footer-icon-holder icon-holder-git">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                </div>
                <div class="footer-action-info font-bukra">
                  <span class="footer-action-tag tag-git">Código Aberto &bull; AGPLv3</span>
                  <span class="footer-action-val">github.com/HUB-LabDiv/HUB-LabDiv</span>
                </div>
              </div>

              <!-- Email / Suporte e Sugestões -->
              <div class="footer-action-card footer-card-email">
                <div class="footer-icon-holder icon-holder-email">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="3"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <div class="footer-action-info font-bukra">
                  <span class="footer-action-tag tag-email">Suporte, Sugestões &amp; Ideias</span>
                  <span class="footer-action-val">hublabdiv@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          <div class="footer-bottom-line font-bukra">
            <span>Licença AGPLv3 &bull; LabDiv &bull; Instituto de Física da Universidade de São Paulo (IFUSP)</span>
          </div>
        </div>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

async function main() {
  console.log('Generating high-tolerance QR codes with level H...');
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

  const posterHtml = buildPosterHtml({ qrWebSvg, qrPlaySvg });

  const htmlPath = path.join(OUT_DIR, 'poster.html');
  fs.writeFileSync(htmlPath, posterHtml, 'utf-8');
  console.log(`Saved HTML: ${htmlPath}`);

  console.log('Launching headless chromium via puppeteer-core...');
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
  await page.setViewport({
    width: 1240,
    height: 1754,
    deviceScaleFactor: 2
  });

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));

  // 1. Take PNG screenshot at 300 DPI
  const pngPath = path.join(OUT_DIR, 'poster.png');
  await page.screenshot({
    path: pngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`Rendered PNG: ${pngPath}`);

  const activeArtifactDirs = [
    (process.env.ARTIFACTS_DIR || './artifacts'),
    (process.env.ARTIFACTS_DIR || './artifacts'),
    (process.env.ARTIFACTS_DIR || './artifacts')
  ];
  for (const dir of activeArtifactDirs) {
    if (fs.existsSync(dir)) {
      fs.copyFileSync(pngPath, path.join(dir, 'poster.png'));
    }
  }

  // 2. Generate 300 DPI A4 PDF directly from PNG so the PDF is 100% identical to the PNG
  const pdfPath = path.join(OUT_DIR, 'poster.pdf');
  const pyPosterScript = `
from PIL import Image
poster = Image.open(r'${pngPath}').convert('RGB')
poster.save(r'${pdfPath}', 'PDF', resolution=300.0, quality=100)
`;
  execSync('python3', { input: pyPosterScript, stdio: ['pipe', 'inherit', 'inherit'] });
  console.log(`Rendered PDF (100% pixel-perfect identical to PNG): ${pdfPath}`);

  for (const dir of activeArtifactDirs) {
    if (fs.existsSync(dir)) {
      fs.copyFileSync(pdfPath, path.join(dir, 'poster.pdf'));
    }
  }

  await page.close();
  await browser.close();
  console.log('Poster generated successfully in Light Mode with 300 DPI quality!');
}

main().catch(err => {
  console.error('Generation error:', err);
  process.exit(1);
});
