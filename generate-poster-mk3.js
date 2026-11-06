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
const QRCode = require('qrcode');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public');
const POSTERS_DIR = path.join(PUBLIC_DIR, 'divulgacao/posters');
const TMP_LAYERS_DIR = path.join(POSTERS_DIR, '.tmp_mk3_layers');
const ARTIFACT_DIR = (process.env.ARTIFACTS_DIR || './artifacts');

if (!fs.existsSync(POSTERS_DIR)) fs.mkdirSync(POSTERS_DIR, { recursive: true });
if (!fs.existsSync(TMP_LAYERS_DIR)) fs.mkdirSync(TMP_LAYERS_DIR, { recursive: true });

// Read source assets
const bgIfSvg = fs.readFileSync(path.join(PUBLIC_DIR, 'bg-if.svg'), 'utf-8');
const iconHubSvg = fs.readFileSync(path.join(PUBLIC_DIR, 'icone-HUBLabDiv.svg'), 'utf-8');
const cleanedIconHub = iconHubSvg.replace(/<\?xml[^>]*\?>/gi, '').replace(/<!--[\s\S]*?-->/g, '').trim();

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

// Axis icons
const iconComunidadeSvg = `<svg width="34" height="34" viewBox="0 -960 960 960" fill="currentColor">
  <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/>
</svg>`;

const iconCgifSvg = `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

const iconFerramentasSvg = `<svg width="34" height="34" viewBox="0 -960 960 960" fill="currentColor">
  <path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z"/>
</svg>`;

function buildPosterHtml({ qrWebSvg, qrPlaySvg }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HUB LabDiv - Cartaz Oficial A4</title>
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
      src: local('29LT Bukra Semi Wide Bold'), local('29LT Bukra Bold'), local('29LTBukra-Bold');
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
      background-color: #F8FAFC;
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
      justify-content: space-between;
      overflow: hidden;
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

    /* TOP INSTALL CARD (FULL HORIZONTAL BANNER) */
    .top-install-banner {
      width: 100%;
      background: #FFFFFF;
      box-shadow: 0 10px 30px -4px rgba(15, 71, 128, 0.16), 0 4px 10px -2px rgba(15, 71, 128, 0.08);
      border-bottom: 2px solid rgba(15, 71, 128, 0.18);
      border-bottom-left-radius: 28px;
      border-bottom-right-radius: 28px;
      padding: 20px 52px 24px 52px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: relative;
      z-index: 15;
    }
    .banner-header-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .banner-arrow {
      stroke: #444746;
    }
    .banner-brand-text {
      font-size: 17px;
      font-weight: 600;
      color: #444746;
    }
    .banner-main-row {
      display: flex;
      align-items: center;
      gap: 22px;
      width: 100%;
    }
    .banner-app-icon {
      width: 92px;
      height: 92px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .banner-app-icon svg {
      width: 100%;
      height: 100%;
    }
    .banner-text-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
    }
    .banner-app-title {
      font-size: 42px;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 4px;
      letter-spacing: -0.5px;
    }
    .banner-app-title .hub-word {
      color: #0F172A;
    }
    .banner-app-title .labdiv-word {
      background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #D97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .banner-app-desc {
      font-size: 18px;
      line-height: 1.34;
      color: #334155;
      font-weight: 600;
    }
    .banner-install-btn {
      width: 100%;
      height: 54px;
      background: #0B57D0;
      color: #FFFFFF;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 0.3px;
      box-shadow: 0 4px 14px rgba(11, 87, 208, 0.32);
      margin-top: 4px;
    }

    /* TOP GRADIENT DIVIDER UNDER BANNER */
    .top-gradient-divider {
      width: 100%;
      height: 4.5px;
      background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #FFCC00 100%);
    }

    /* MAIN BODY (SPACIOUS INVERTED TRIANGLE HIERARCHY: 1 BANNER -> 2 QR CARDS -> 3 AXIS CARDS) */
    .main-body {
      flex: 1;
      padding: 30px 34px 10px 34px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
    }

    /* HEADER: VOCÊ CONHECE O HUB? (MAIOR DESTAQUE & MAIOR ESPAÇAMENTO AO TOPO) */
    .experimente-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 14px;
      margin-bottom: 24px;
      width: 100%;
      text-align: center;
    }
    .experimente-header .title-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
    }
    .experimente-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    .experimente-title {
      font-size: 68px;
      font-weight: 900;
      font-style: italic;
      color: #0F172A;
      letter-spacing: 1.8px;
      text-shadow: 0 3px 20px rgba(15, 71, 128, 0.16), 0 0 2px rgba(255, 255, 255, 0.95);
      white-space: nowrap;
      line-height: 1.1;
    }
    .experimente-subtitle {
      font-size: 25px;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.5px;
      margin: 0;
      line-height: 1.2;
    }
    .experimente-subtitle .hub-highlight {
      color: #0F4780;
      font-weight: 800;
    }

    /* ROW OF 2 BIG QR CARDS (WIDE TOP BASE OF INVERTED TRIANGLE) */
    .qr-cards-grid {
      display: flex;
      justify-content: center;
      gap: 76px;
      width: 100%;
      max-width: 1070px;
      margin: 0 auto;
    }
    .qr-card {
      width: 480px;
      min-height: 575px;
      background: #FFFFFF;
      border-radius: 32px;
      border: 3.5px solid transparent;
      background-image: linear-gradient(#FFFFFF, #FFFFFF), linear-gradient(135deg, #0F4780 0%, #0284C7 30%, #F14343 70%, #FFCC00 100%);
      background-origin: border-box;
      background-clip: padding-box, border-box;
      box-shadow: 0 16px 44px -4px rgba(15, 71, 128, 0.16), 0 6px 14px -2px rgba(15, 71, 128, 0.08);
      padding: 28px 20px 24px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      box-sizing: border-box;
    }
    .qr-svg-holder {
      width: 380px;
      height: 380px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .qr-svg-holder svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .qr-center-badge {
      position: absolute;
      width: 88px;
      height: 88px;
      background: #FFFFFF;
      border-radius: 20px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
      border: 3px solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
    }
    .qr-center-badge svg {
      width: 100%;
      height: 100%;
    }
    .qr-label-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 28px;
      font-weight: 900;
      color: #0F172A;
      margin-bottom: 6px;
    }
    /* USER REQUIREMENT: CLICKABLE BLUE LINK */
    .qr-link-blue {
      font-size: 22px;
      font-weight: 800;
      color: #0B57D0;
      text-decoration: underline;
      text-underline-offset: 4px;
      letter-spacing: 0.2px;
      display: inline-block;
      cursor: pointer;
    }
    .qr-sub-text {
      font-size: 21px;
      font-weight: 600;
      color: #475569;
    }

    /* ROW OF 3 CARDS IN INVERTED TRIANGLE (V-SHAPE)
       - NARROWER TOTAL SPAN (TAPERED INWARD FROM QR CARDS: 816px vs 1070px)
       - CENTER CARD (INFORMATIVO) IS DROPPED DOWN TO FORM THE APEX POINT! */
    .axes-triangle-row {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      gap: 26px;
      width: 100%;
      max-width: 816px;
      margin: 36px auto 14px auto;
    }
    .axis-card {
      width: 254px;
      height: 326px;
      box-sizing: border-box;
      background: #FFFFFF;
      border-radius: 24px;
      box-shadow: 0 10px 28px -4px rgba(15, 71, 128, 0.14), 0 3px 8px -2px rgba(15, 71, 128, 0.08);
      padding: 24px 14px 20px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    /* INVERTED TRIANGLE APEX: Informativo card drops down */
    .axis-card.card-info {
      margin-top: 40px;
    }
    .axis-top-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 6px;
    }
    .axis-icon-badge {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    .axis-title {
      font-size: 30px;
      font-weight: 900;
      margin-bottom: 8px;
      line-height: 1.15;
    }
    .axis-desc {
      font-size: 17px;
      font-weight: 600;
      color: #334155;
      line-height: 1.35;
      text-align: center;
    }

    /* THEMATIC COLORS */
    .card-social {
      border: 2px solid rgba(15, 71, 128, 0.22);
    }
    .card-social .axis-top-bar {
      background: #0F4780;
    }
    .card-social .axis-icon-badge {
      background: #EEF4FA;
      border: 1.5px solid rgba(15, 71, 128, 0.25);
      color: #0F4780;
    }
    .card-social .axis-title {
      color: #0F4780;
    }

    .card-info {
      border: 2px solid rgba(241, 67, 67, 0.26);
    }
    .card-info .axis-top-bar {
      background: #F14343;
    }
    .card-info .axis-icon-badge {
      background: #FEF2F2;
      border: 1.5px solid rgba(241, 67, 67, 0.26);
      color: #F14343;
    }
    .card-info .axis-title {
      color: #F14343;
    }

    .card-tools {
      border: 2px solid rgba(255, 204, 0, 0.45);
    }
    .card-tools .axis-top-bar {
      background: #FFCC00;
    }
    .card-tools .axis-icon-badge {
      background: #FEF9C3;
      border: 1.5px solid rgba(255, 204, 0, 0.4);
      color: #854D0E;
    }
    .card-tools .axis-title {
      color: #854D0E;
    }

    /* FOOTER BAR */
    .footer-bar {
      width: 100%;
      background: #F1F5F9;
      border-top: 1px solid #E2E8F0;
      position: relative;
      z-index: 20;
    }
    .footer-gradient-divider {
      height: 4.5px;
      width: 100%;
      background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #FFCC00 100%);
    }
    .footer-content-wrap {
      padding: 12px 52px 10px 52px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .footer-main-row {
      display: flex;
      align-items: stretch;
      justify-content: space-between;
      gap: 28px;
    }
    .footer-legal-col {
      flex: 1.25;
      background: #FFFFFF;
      border: 1.5px solid rgba(15, 71, 128, 0.20);
      border-radius: 16px;
      padding: 12px 18px;
      box-shadow: 0 4px 12px rgba(15, 71, 128, 0.06);
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
    }
    .footer-legal-badge {
      display: flex;
      align-items: center;
      gap: 7px;
      color: #0F4780;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.6px;
    }
    .footer-legal-text {
      font-size: 15px;
      line-height: 1.34;
      color: #334155;
    }
    .footer-buttons-col {
      flex: 0.95;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 8px;
    }
    .footer-action-card {
      background: #FFFFFF;
      border-radius: 12px;
      padding: 8px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 12px rgba(15, 71, 128, 0.06);
    }
    .footer-card-git {
      border: 1.5px solid rgba(15, 71, 128, 0.25);
    }
    .footer-card-email {
      border: 1.5px solid rgba(241, 67, 67, 0.25);
    }
    .footer-icon-holder {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .icon-holder-git {
      background: rgba(15, 71, 128, 0.10);
      color: #0F4780;
    }
    .icon-holder-email {
      background: rgba(241, 67, 67, 0.10);
      color: #F14343;
    }
    .footer-action-info {
      display: flex;
      flex-direction: column;
      line-height: 1.22;
    }
    .footer-action-tag {
      font-size: 12.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .tag-git {
      color: #0F4780;
    }
    .tag-email {
      color: #F14343;
    }
    .footer-action-val {
      font-size: 14.5px;
      font-weight: 700;
      color: #0F172A;
    }
    .footer-bottom-line {
      font-size: 14px;
      color: #64748B;
      font-weight: 600;
      text-align: center;
      padding-top: 6px;
      border-top: 1px solid #E2E8F0;
    }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="bg-math-pattern"></div>
    <div class="content-layer">
      <!-- 1. TOP INSTALL BANNER (FULL HORIZONTAL WIDTH) -->
      <div class="top-install-banner">
        <div class="banner-header-row">
          <svg class="banner-arrow" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span class="banner-brand-text font-open-sans">Google Play</span>
        </div>

        <div class="banner-main-row">
          <div class="banner-app-icon">
            ${cleanedIconHub}
          </div>
          <div class="banner-text-col">
            <div class="banner-app-title font-bukra">
              <span class="hub-word">HUB</span> <span class="labdiv-word">LabDiv</span>
            </div>
            <div class="banner-app-desc font-open-sans">
              O HUB de comunicação científica do Laboratório de expressão e divulgação do IFUSP
            </div>
          </div>
        </div>

        <div class="banner-install-btn font-open-sans">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          <span>Instalar</span>
        </div>
      </div>

      <!-- GRADIENT DIVIDER UNDER BANNER -->
      <div class="top-gradient-divider"></div>

      <!-- 2. MAIN BODY (INVERTED TRIANGLE HIERARCHY) -->
      <main class="main-body">
        <!-- HEADER: VOCÊ CONHECE O HUB? -->
        <div class="experimente-header">
          <div class="title-row">
            <div class="experimente-icon">
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#0F4780" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 0 4px rgba(15, 71, 128, 0.16));">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
                <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
                <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
              </svg>
            </div>
            <h2 class="experimente-title font-bukra">
              VOCÊ CONHECE O HUB?
            </h2>
          </div>
          <p class="experimente-subtitle font-open-sans">
            escaneie e descubra o <span class="hub-highlight">HUB</span> do universitário
          </p>
        </div>

        <!-- ROW OF 2 LARGE QR CARDS -->
        <div class="qr-cards-grid">
          <!-- QR Card 1: Web -->
          <div class="qr-card">
            <div class="qr-svg-holder">
              ${qrWebSvg}
              <div class="qr-center-badge">
                ${cleanedIconHub}
              </div>
            </div>
            <div class="qr-label-row font-bukra">
              <span>🌐</span> <span>ACESSE NO SITE</span>
            </div>
            <!-- USER REQUIREMENT: BLUE CLICKABLE-STYLE LINK -->
            <a class="qr-link-blue font-open-sans">
              hub-lab-div.vercel.app
            </a>
          </div>

          <!-- QR Card 2: Google Play -->
          <div class="qr-card">
            <div class="qr-svg-holder">
              ${qrPlaySvg}
              <div class="qr-center-badge">
                ${cleanedIconHub}
              </div>
            </div>
            <div class="qr-label-row font-bukra">
              <span>▶</span> <span>GOOGLE PLAY</span>
            </div>
            <div class="qr-sub-text font-open-sans">
              App Oficial Android
            </div>
          </div>
        </div>

        <!-- ROW OF 3 COMPACT AXIS CARDS (INVERTED TRIANGLE V-SHAPE: SOCIAL & TOOLS HIGHER, INFORMATIVO DROPPED DOWN) -->
        <div class="axes-triangle-row">
          <!-- Card 1: Social -->
          <div class="axis-card card-social">
            <div class="axis-top-bar"></div>
            <div class="axis-icon-badge">
              ${iconComunidadeSvg}
            </div>
            <h3 class="axis-title font-bukra">Social</h3>
            <p class="axis-desc font-open-sans">Rede comunicativa &amp; pedagógica</p>
          </div>

          <!-- Card 2: Informativo -->
          <div class="axis-card card-info">
            <div class="axis-top-bar"></div>
            <div class="axis-icon-badge">
              ${iconCgifSvg}
            </div>
            <h3 class="axis-title font-bukra">Informativo</h3>
            <p class="axis-desc font-open-sans">Enciclopédia acadêmica &amp; interativa</p>
          </div>

          <!-- Card 3: Ferramentas -->
          <div class="axis-card card-tools">
            <div class="axis-top-bar"></div>
            <div class="axis-icon-badge">
              ${iconFerramentasSvg}
            </div>
            <h3 class="axis-title font-bukra">Ferramentas</h3>
            <p class="axis-desc font-open-sans">Funções de auxílio ao universitário</p>
          </div>
        </div>
      </main>

      <!-- 3. FOOTER BAR -->
      <footer class="footer-bar">
        <div class="footer-gradient-divider"></div>
        <div class="footer-content-wrap">
          <div class="footer-main-row">
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

            <div class="footer-buttons-col">
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

// Configuração granular de TODAS as subcamadas isoladas para o PSD
const ISOLATED_LAYERS_CONFIG = [
  // 00. Fundo
  { id: '00_fundo_base', name: 'Fundo Base (#F8FAFC)', group: '00_Fundo_e_Textura', customCapture: 'base_bg' },
  { id: '01_padrao_matematico', name: 'Padrão Fórmulas Matemáticas', group: '00_Fundo_e_Textura', customCapture: 'math_pattern', opacity: 140 },

  // 01. Card Instalar Topo (Full Width)
  { id: '02_top_banner_bg', name: 'Fundo & Sombra do Card Topo', group: '01_Card_Topo_Google_Play', selector: '.top-install-banner', cleanBgOnly: true },
  { id: '03_top_banner_arrow', name: 'Ícone Seta (←)', group: '01_Card_Topo_Google_Play', selector: '.banner-arrow' },
  { id: '04_top_banner_brand_text', name: 'Texto: Google Play', group: '01_Card_Topo_Google_Play', selector: '.banner-brand-text' },
  { id: '05_top_banner_app_icon', name: 'Logo Capelo HUB LabDiv', group: '01_Card_Topo_Google_Play', selector: '.banner-app-icon' },
  { id: '06_top_banner_app_title', name: 'Título: HUB LabDiv', group: '01_Card_Topo_Google_Play', selector: '.banner-app-title' },
  { id: '07_top_banner_app_desc', name: 'Texto Descritivo do HUB', group: '01_Card_Topo_Google_Play', selector: '.banner-app-desc' },
  { id: '08_top_banner_install_btn', name: 'Botão Completo: Instalar', group: '01_Card_Topo_Google_Play', selector: '.banner-install-btn' },

  // 02. Header Central
  { id: '09_top_gradient_line', name: 'Linha Gradiente Superior', group: '02_Secao_Voce_Conhece_Hub', selector: '.top-gradient-divider' },
  { id: '10_experimente_icon', name: 'Ícone Foguete', group: '02_Secao_Voce_Conhece_Hub', selector: '.experimente-icon' },
  { id: '11_experimente_title', name: 'Título: VOCÊ CONHECE O HUB?', group: '02_Secao_Voce_Conhece_Hub', selector: '.experimente-title' },
  { id: '11b_experimente_subtitle', name: 'Subtítulo: Escaneie e descubra o HUB...', group: '02_Secao_Voce_Conhece_Hub', selector: '.experimente-subtitle' },

  // 03. Card QR Code Web (Cada sub-elemento isolado!)
  { id: '12_qr_web_card_bg', name: 'Fundo & Borda do Card QR Web', group: '03_Card_QR_Web', selector: '.qr-cards-grid > .qr-card:nth-child(1)', cardBgOnly: true },
  { id: '13_qr_web_code_matrix', name: 'Código QR Web (Matriz)', group: '03_Card_QR_Web', selector: '.qr-cards-grid > .qr-card:nth-child(1) .qr-svg-holder > svg' },
  { id: '14_qr_web_center_badge', name: 'Badge Central QR Web (Logo)', group: '03_Card_QR_Web', selector: '.qr-cards-grid > .qr-card:nth-child(1) .qr-center-badge' },
  { id: '15_qr_web_label', name: 'Título: 🌐 ACESSE NO SITE', group: '03_Card_QR_Web', selector: '.qr-cards-grid > .qr-card:nth-child(1) .qr-label-row' },
  { id: '16_qr_web_link_blue', name: 'Link Azul: hub-lab-div.vercel.app', group: '03_Card_QR_Web', selector: '.qr-cards-grid > .qr-card:nth-child(1) .qr-link-blue' },

  // 04. Card QR Code Play Store (Cada sub-elemento isolado!)
  { id: '17_qr_play_card_bg', name: 'Fundo & Borda do Card QR PlayStore', group: '04_Card_QR_PlayStore', selector: '.qr-cards-grid > .qr-card:nth-child(2)', cardBgOnly: true },
  { id: '18_qr_play_code_matrix', name: 'Código QR PlayStore (Matriz)', group: '04_Card_QR_PlayStore', selector: '.qr-cards-grid > .qr-card:nth-child(2) .qr-svg-holder > svg' },
  { id: '19_qr_play_center_badge', name: 'Badge Central QR PlayStore (Logo)', group: '04_Card_QR_PlayStore', selector: '.qr-cards-grid > .qr-card:nth-child(2) .qr-center-badge' },
  { id: '20_qr_play_label', name: 'Título: ▶ GOOGLE PLAY', group: '04_Card_QR_PlayStore', selector: '.qr-cards-grid > .qr-card:nth-child(2) .qr-label-row' },
  { id: '21_qr_play_sub_text', name: 'Subtítulo: App Oficial Android', group: '04_Card_QR_PlayStore', selector: '.qr-cards-grid > .qr-card:nth-child(2) .qr-sub-text' },

  // 05. Os 3 Eixos (Design Simples e Triangular)
  { id: '22_axis_social_card_bg', name: 'Card Social: Fundo & Barra Azul', group: '05_Eixo_1_Social', selector: '.card-social', cardBgOnly: true },
  { id: '23_axis_social_badge', name: 'Card Social: Ícone Comunidade', group: '05_Eixo_1_Social', selector: '.card-social .axis-icon-badge' },
  { id: '24_axis_social_title', name: 'Card Social: Título Social', group: '05_Eixo_1_Social', selector: '.card-social .axis-title' },
  { id: '25_axis_social_desc', name: 'Card Social: Descrição', group: '05_Eixo_1_Social', selector: '.card-social .axis-desc' },

  { id: '26_axis_info_card_bg', name: 'Card Info: Fundo & Barra Vermelha', group: '06_Eixo_2_Informativo', selector: '.card-info', cardBgOnly: true },
  { id: '27_axis_info_badge', name: 'Card Info: Ícone CGIF', group: '06_Eixo_2_Informativo', selector: '.card-info .axis-icon-badge' },
  { id: '28_axis_info_title', name: 'Card Info: Título Informativo', group: '06_Eixo_2_Informativo', selector: '.card-info .axis-title' },
  { id: '29_axis_info_desc', name: 'Card Info: Descrição', group: '06_Eixo_2_Informativo', selector: '.card-info .axis-desc' },

  { id: '30_axis_tools_card_bg', name: 'Card Ferramentas: Fundo & Barra Amarela', group: '07_Eixo_3_Ferramentas', selector: '.card-tools', cardBgOnly: true },
  { id: '31_axis_tools_badge', name: 'Card Ferramentas: Ícone Ferramentas', group: '07_Eixo_3_Ferramentas', selector: '.card-tools .axis-icon-badge' },
  { id: '32_axis_tools_title', name: 'Card Ferramentas: Título Ferramentas', group: '07_Eixo_3_Ferramentas', selector: '.card-tools .axis-title' },
  { id: '33_axis_tools_desc', name: 'Card Ferramentas: Descrição', group: '07_Eixo_3_Ferramentas', selector: '.card-tools .axis-desc' },

  // 06. Rodapé Oficial
  { id: '34_footer_bar_bg', name: 'Barra do Rodapé: Fundo Cinza', group: '08_Rodape_Oficial', selector: '.footer-bar', cardBgOnly: true },
  { id: '35_footer_gradient_divider', name: 'Linha Degradê do Rodapé', group: '08_Rodape_Oficial', selector: '.footer-gradient-divider' },
  { id: '36_footer_legal_badge', name: 'Bloco Legal: Ícone & Título', group: '08_Rodape_Oficial', selector: '.footer-legal-badge' },
  { id: '37_footer_legal_text', name: 'Bloco Legal: Texto de Conformidade', group: '08_Rodape_Oficial', selector: '.footer-legal-text' },
  { id: '38_footer_card_git', name: 'Botão: GitHub Código Aberto', group: '08_Rodape_Oficial', selector: '.footer-card-git' },
  { id: '39_footer_card_email', name: 'Botão: E-mail de Suporte', group: '08_Rodape_Oficial', selector: '.footer-card-email' },
  { id: '40_footer_bottom_line', name: 'Linha Copyright IFUSP & AGPLv3', group: '08_Rodape_Oficial', selector: '.footer-bottom-line' }
];

async function main() {
  console.log('🚀 Gerando Novo Cartaz Oficial A4 (Design Triangular Simplificado)...');

  // Generate QR codes with error correction H
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
  const htmlPath = path.join(POSTERS_DIR, 'poster.html');
  fs.writeFileSync(htmlPath, posterHtml, 'utf-8');
  console.log(`✅ HTML Oficial salvo em: ${htmlPath}`);

  // Launch Chromium
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

  // 1. Render official 300 DPI single PNG
  const finalPngPath = path.join(POSTERS_DIR, 'poster.png');
  await page.screenshot({
    path: finalPngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ PNG Oficial 300 DPI gerado em: ${finalPngPath}`);

  // 2. Render official vector PDF
  const finalPdfPath = path.join(POSTERS_DIR, 'poster.pdf');
  await page.pdf({
    path: finalPdfPath,
    width: '1240px',
    height: '1754px',
    printBackground: true,
    pageRanges: '1'
  });
  console.log(`✅ PDF Vetorial Oficial gerado em: ${finalPdfPath}`);

  // 3. Extract each isolated layer for Photoshop PSD
  console.log('\n🎨 Extraindo cada elemento, texto e ícone isoladamente para o PSD...');
  for (const cfg of ISOLATED_LAYERS_CONFIG) {
    await page.reload({ waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');

    if (cfg.customCapture === 'base_bg') {
      await page.evaluate(() => {
        document.querySelectorAll('*').forEach(el => el.style.visibility = 'hidden');
        document.body.style.visibility = 'visible';
        document.body.style.backgroundColor = '#F8FAFC';
        const c = document.querySelector('.poster-container');
        if (c) { c.style.visibility = 'visible'; c.style.backgroundColor = '#F8FAFC'; }
        const math = document.querySelector('.bg-math-pattern');
        if (math) math.style.display = 'none';
      });
    } else if (cfg.customCapture === 'math_pattern') {
      await page.evaluate(() => {
        document.body.style.backgroundColor = 'transparent';
        const c = document.querySelector('.poster-container');
        if (c) c.style.backgroundColor = 'transparent';
        const content = document.querySelector('.content-layer');
        if (content) content.style.display = 'none';
        const math = document.querySelector('.bg-math-pattern');
        if (math) { math.style.display = 'block'; math.style.opacity = '1.0'; }
      });
    } else if (cfg.cleanBgOnly || cfg.cardBgOnly) {
      await page.evaluate((sel) => {
        const style = document.createElement('style');
        style.innerHTML = `
          body, html, .poster-container, .content-layer, .main-body {
            background: transparent !important;
            box-shadow: none !important;
            border: none !important;
          }
          .bg-math-pattern { display: none !important; }
          .top-gradient-divider, .footer-gradient-divider { display: none !important; }
          * { visibility: hidden !important; }
          ${sel} { visibility: visible !important; }
          ${sel} * { visibility: hidden !important; }
          ${sel} .axis-top-bar { visibility: visible !important; }
        `;
        document.head.appendChild(style);
      }, cfg.selector);
    } else {
      await page.evaluate((sel) => {
        const style = document.createElement('style');
        style.innerHTML = `
          body, html, .poster-container, .content-layer, .main-body, .top-install-banner, .qr-card, .axis-card, .footer-bar, .footer-legal-col, .footer-action-card {
            background: transparent !important;
            background-image: none !important;
            box-shadow: none !important;
            border: none !important;
          }
          .bg-math-pattern { display: none !important; }
          .axis-top-bar { display: none !important; }
          * { visibility: hidden !important; }
          ${sel}, ${sel} * { visibility: visible !important; }
        `;
        document.head.appendChild(style);
      }, cfg.selector);
    }

    const outLayerRawPath = path.join(TMP_LAYERS_DIR, `${cfg.id}.png`);
    await page.screenshot({
      path: outLayerRawPath,
      clip: { x: 0, y: 0, width: 1240, height: 1754 },
      omitBackground: true
    });
  }

  await browser.close();
  console.log('✅ Todas as camadas foram extraídas!');

  // 4. Run Python script to assemble the layered PSD
  const pyScript = path.join(__dirname, 'assemble-poster-mk3-psd.py');
  console.log('\n🐍 Executando script Python para montagem do PSD...');
  execSync(`python3 "${pyScript}"`, { stdio: 'inherit' });

  // 5. Copy outputs to conversation artifacts directory
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(finalPngPath, path.join(ARTIFACT_DIR, 'poster.png'));
    fs.copyFileSync(finalPdfPath, path.join(ARTIFACT_DIR, 'poster.pdf'));
    fs.copyFileSync(path.join(POSTERS_DIR, 'poster.psd'), path.join(ARTIFACT_DIR, 'poster.psd'));
    console.log(`✅ Arquivos finais copiados para os artifacts!`);
  }

  console.log('\n🎉 Processo concluído com 100% de sucesso!');
}

main().catch(err => {
  console.error('❌ Erro na geração:', err);
  process.exit(1);
});
