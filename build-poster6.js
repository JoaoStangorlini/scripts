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
const POSTER6_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/poster6');
const HTML_PATH = path.join(POSTER6_DIR, 'poster.html');

// Pure mathematical SVG vectors extracted with sub-pixel precision from the reference illustration
const SVG_FINGERS = [
  "M 283.0 303.0 L 294.0 304.0 L 298.0 307.0 L 300.0 307.0 L 302.0 309.0 L 335.0 325.0 L 337.0 327.0 L 337.0 392.0 L 335.0 392.0 L 329.0 389.0 L 327.0 387.0 L 325.0 387.0 L 313.0 381.0 L 311.0 379.0 L 309.0 379.0 L 303.0 375.0 L 301.0 375.0 L 297.0 372.0 L 295.0 372.0 L 293.0 370.0 L 283.0 366.0 L 281.0 364.0 L 272.0 360.0 L 265.0 353.0 L 260.0 343.0 L 260.0 337.0 L 259.0 336.0 L 261.0 322.0 L 264.0 316.0 L 271.0 308.0 L 278.0 304.0 L 282.0 304.0 Z",
  "M 284.0 379.0 L 291.0 379.0 L 292.0 380.0 L 295.0 380.0 L 301.0 383.0 L 303.0 383.0 L 305.0 385.0 L 316.0 390.0 L 318.0 392.0 L 320.0 392.0 L 337.0 401.0 L 337.0 466.0 L 336.0 467.0 L 335.0 466.0 L 333.0 466.0 L 331.0 464.0 L 319.0 458.0 L 317.0 458.0 L 315.0 456.0 L 308.0 453.0 L 306.0 451.0 L 304.0 451.0 L 298.0 447.0 L 296.0 447.0 L 292.0 444.0 L 288.0 443.0 L 282.0 439.0 L 280.0 439.0 L 269.0 431.0 L 265.0 425.0 L 261.0 415.0 L 261.0 400.0 L 262.0 399.0 L 262.0 397.0 L 264.0 394.0 L 264.0 392.0 L 267.0 388.0 L 269.0 387.0 L 269.0 386.0 L 279.0 380.0 L 283.0 380.0 Z",
  "M 293.0 456.0 L 297.0 456.0 L 298.0 457.0 L 305.0 458.0 L 335.0 473.0 L 337.0 475.0 L 339.0 475.0 L 341.0 477.0 L 343.0 477.0 L 346.0 480.0 L 351.0 481.0 L 360.0 487.0 L 361.0 486.0 L 361.0 487.0 L 368.0 493.0 L 372.0 499.0 L 375.0 507.0 L 375.0 522.0 L 374.0 523.0 L 374.0 526.0 L 370.0 533.0 L 369.0 533.0 L 364.0 539.0 L 359.0 542.0 L 356.0 542.0 L 355.0 543.0 L 342.0 543.0 L 339.0 541.0 L 338.0 542.0 L 336.0 541.0 L 334.0 539.0 L 321.0 533.0 L 319.0 531.0 L 317.0 531.0 L 305.0 525.0 L 303.0 523.0 L 301.0 523.0 L 297.0 521.0 L 295.0 519.0 L 293.0 519.0 L 291.0 517.0 L 284.0 514.0 L 280.0 511.0 L 276.0 507.0 L 271.0 499.0 L 271.0 497.0 L 269.0 493.0 L 269.0 488.0 L 268.0 487.0 L 269.0 478.0 L 273.0 468.0 L 280.0 461.0 L 288.0 457.0 L 292.0 457.0 Z",
  "M 300.0 531.0 L 309.0 532.0 L 317.0 536.0 L 319.0 536.0 L 320.0 538.0 L 322.0 538.0 L 328.0 541.0 L 330.0 543.0 L 332.0 543.0 L 336.0 545.0 L 337.0 547.0 L 339.0 547.0 L 359.0 557.0 L 359.0 558.0 L 364.0 562.0 L 367.0 566.0 L 371.0 576.0 L 371.0 592.0 L 369.0 595.0 L 369.0 597.0 L 367.0 601.0 L 364.0 605.0 L 361.0 608.0 L 352.0 613.0 L 348.0 613.0 L 347.0 614.0 L 338.0 613.0 L 300.0 594.0 L 298.0 592.0 L 296.0 592.0 L 292.0 590.0 L 283.0 583.0 L 280.0 579.0 L 276.0 569.0 L 276.0 561.0 L 275.0 560.0 L 276.0 559.0 L 276.0 554.0 L 280.0 544.0 L 282.0 541.0 L 287.0 537.0 L 287.0 536.0 L 290.0 534.0 L 292.0 534.0 L 296.0 532.0 L 299.0 532.0 Z"
];

const SVG_PALM = "M 581.0 311.0 L 592.0 311.0 L 593.0 312.0 L 599.0 313.0 L 600.0 315.0 L 607.0 320.0 L 617.0 338.0 L 619.0 345.0 L 624.0 355.0 L 626.0 357.0 L 629.0 365.0 L 631.0 367.0 L 631.0 369.0 L 640.0 386.0 L 640.0 388.0 L 642.0 390.0 L 644.0 394.0 L 644.0 396.0 L 647.0 400.0 L 648.0 405.0 L 652.0 412.0 L 652.0 415.0 L 655.0 419.0 L 655.0 421.0 L 657.0 424.0 L 658.0 429.0 L 660.0 432.0 L 661.0 437.0 L 663.0 440.0 L 664.0 445.0 L 667.0 451.0 L 668.0 458.0 L 671.0 464.0 L 671.0 467.0 L 672.0 468.0 L 672.0 471.0 L 673.0 472.0 L 673.0 475.0 L 674.0 476.0 L 674.0 479.0 L 675.0 480.0 L 675.0 483.0 L 677.0 488.0 L 677.0 492.0 L 679.0 497.0 L 680.0 508.0 L 682.0 512.0 L 682.0 519.0 L 683.0 520.0 L 683.0 526.0 L 684.0 527.0 L 685.0 538.0 L 686.0 539.0 L 686.0 543.0 L 687.0 544.0 L 687.0 552.0 L 688.0 553.0 L 688.0 559.0 L 689.0 560.0 L 689.0 564.0 L 690.0 565.0 L 690.0 570.0 L 691.0 571.0 L 693.0 585.0 L 694.0 586.0 L 697.0 601.0 L 699.0 605.0 L 699.0 608.0 L 700.0 609.0 L 704.0 623.0 L 706.0 626.0 L 707.0 631.0 L 712.0 641.0 L 712.0 643.0 L 716.0 650.0 L 717.0 654.0 L 719.0 656.0 L 720.0 661.0 L 722.0 663.0 L 725.0 670.0 L 728.0 730.0 L 590.0 820.0 L 560.0 773.0 L 550.0 747.0 L 536.0 739.0 L 533.0 736.0 L 528.0 734.0 L 527.0 732.0 L 522.0 730.0 L 519.0 727.0 L 513.0 724.0 L 508.0 720.0 L 505.0 719.0 L 499.0 714.0 L 496.0 713.0 L 491.0 709.0 L 480.0 703.0 L 477.0 700.0 L 470.0 696.0 L 466.0 692.0 L 463.0 691.0 L 460.0 688.0 L 449.0 681.0 L 437.0 671.0 L 432.0 668.0 L 430.0 665.0 L 429.0 665.0 L 429.0 664.0 L 573.0 664.0 L 574.0 663.0 L 577.0 663.0 L 578.0 662.0 L 583.0 661.0 L 585.0 659.0 L 586.0 660.0 L 587.0 658.0 L 591.0 655.0 L 597.0 646.0 L 597.0 644.0 L 599.0 640.0 L 599.0 464.0 L 600.0 463.0 L 599.0 462.0 L 599.0 460.0 L 588.0 443.0 L 589.0 442.0 L 587.0 441.0 L 579.0 425.0 L 577.0 423.0 L 557.0 383.0 L 556.0 378.0 L 554.0 375.0 L 554.0 371.0 L 553.0 370.0 L 553.0 362.0 L 552.0 361.0 L 553.0 344.0 L 554.0 343.0 L 555.0 336.0 L 560.0 325.0 L 564.0 321.0 L 564.0 320.0 L 565.0 320.0 L 570.0 315.0 L 574.0 314.0 L 575.0 312.0 L 580.0 312.0 Z";

async function main() {
  console.log('🚀 Construindo Poster 6 com smartphone centralizado (X=620), rebaixado, manga/braço natural e painel QR/Segurança ampliado...');

  // Ensure directories
  if (!fs.existsSync(POSTER6_DIR)) fs.mkdirSync(POSTER6_DIR, { recursive: true });
  const iconsDir = path.join(POSTER6_DIR, 'icons');
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

  // Enhance formula visibility against white paper: tune yellow to brand amber, scale sizes slightly for A4 legibility
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
  <title>HUB LabDiv - Entender a universidade à um clique de distância (Poster 6)</title>
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

    /* PADRÃO MATEMÁTICO OFICIAL DO IFUSP (bg-if.svg) COM CONTRASTE REFORÇADO */
    .bg-math-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 1240px;
      height: 1754px;
      background-image: url('data:image/svg+xml;base64,${bgIfBase64}');
      background-repeat: repeat;
      background-size: 1100px 1100px;
      opacity: 0.65;
      pointer-events: none;
      z-index: 1;
    }

    /* LINHA GRADIENTE DE TOPO */
    .brand-gradient-line-top {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 35%, #F14343 70%, #FFCC00 100%);
      z-index: 50;
    }

    /* 1. SEÇÃO DO HEADER */
    .header-section {
      position: relative;
      z-index: 30;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 100%;
      padding-top: 160px;
      padding-left: 36px;
      padding-right: 36px;
    }

    h1.hero-title {
      font-size: 88px;
      font-weight: 900;
      line-height: 1.12;
      color: #0F172A;
      letter-spacing: -1.8px;
      text-align: center;
      max-width: 1200px;
      margin: 0 auto 18px auto;
    }

    .palma-highlight {
      color: #0F4780;
      font-weight: 900;
      display: inline-block;
      text-shadow: 0 2px 14px rgba(15, 71, 128, 0.22);
    }

    p.hero-subtitle {
      font-size: 25px;
      font-weight: 600;
      color: #475569;
      max-width: 1100px;
      line-height: 1.35;
      text-align: center;
      margin: 0 auto;
    }

    /* 2. ILUSTRAÇÃO VETORIAL DA MÃO SEGURANDO SMARTPHONE */
    .illustration-wrap {
      position: absolute;
      top: 0;
      left: 0;
      width: 1240px;
      height: 1754px;
      z-index: 15;
      pointer-events: none;
    }

    .illustration-wrap svg.hand-phone-svg {
      width: 100%;
      height: 100%;
      display: block;
    }

    /* CONTEÚDO DA TELA DE LOADING DO HUB LABDIV NO SMARTPHONE */
    .phone-screen-loading {
      width: 100%;
      height: 100%;
      background: #0B0F19;
      background-image: radial-gradient(circle at 50% 36%, rgba(15, 71, 128, 0.55) 0%, rgba(11, 15, 25, 0.98) 78%);
      color: #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 14px 14px 12px 14px;
      box-sizing: border-box;
      position: relative;
      font-family: 'Open Sans', sans-serif;
      border-radius: 8px;
    }

    .screen-status-bar {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 4px;
      z-index: 5;
    }
    .status-time {
      font-size: 11px;
      font-weight: 700;
      color: #E2E8F0;
      letter-spacing: -0.2px;
    }
    .status-notch {
      width: 52px;
      height: 12px;
      background: #000000;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .status-notch-cam {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #111827;
      border: 1px solid #1F2937;
    }
    .status-icons {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #E2E8F0;
    }

    .screen-loading-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: -6px;
      text-align: center;
      width: 100%;
    }

    .screen-brand-icon-box {
      width: 74px;
      height: 74px;
      border-radius: 19px;
      background: #FFFFFF;
      padding: 3px;
      box-shadow: 
        0 14px 30px rgba(15, 71, 128, 0.50),
        0 0 20px rgba(241, 67, 67, 0.35),
        0 0 0 3px rgba(255, 255, 255, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 11px;
    }
    .screen-hub-icon {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 16px;
    }

    .screen-brand-name {
      font-size: 19.5px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      margin-bottom: 2px;
      text-shadow: 0 2px 8px rgba(0,0,0,0.7);
    }
    .screen-brand-sub {
      font-size: 10.5px;
      font-weight: 600;
      color: #94A3B8;
      letter-spacing: 0.2px;
      margin-bottom: 16px;
    }

    .screen-loader-track {
      width: 160px;
      height: 6px;
      background: rgba(255, 255, 255, 0.14);
      border-radius: 9999px;
      overflow: hidden;
      position: relative;
    }
    .screen-loader-fill {
      width: 84%;
      height: 100%;
      border-radius: 9999px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 35%, #F14343 70%, #FFCC00 100%);
      box-shadow: 0 0 10px rgba(255, 204, 0, 0.7);
    }

    .screen-loader-caption {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 10px;
    }
    .loading-pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #FFCC00;
      box-shadow: 0 0 6px #FFCC00;
    }
    .loading-text {
      font-size: 10px;
      font-weight: 600;
      color: #CBD5E1;
    }

    .screen-bottom-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      width: 100%;
    }
    .screen-version {
      font-size: 9.5px;
      font-weight: 700;
      color: #64748B;
      letter-spacing: 0.2px;
    }
    .screen-home-indicator {
      width: 80px;
      height: 3px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 9999px;
    }

    /* 3. OS TRÊS BALÕES DE NOTIFICAÇÕES */
    .notif-balloon {
      position: absolute;
      z-index: 30;
      background: #FFFFFF;
      border-radius: 22px;
      padding: 20px 22px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .notif-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .notif-identity {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .notif-icon-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .notif-meta-text {
      display: flex;
      flex-direction: column;
    }
    .notif-app-source {
      font-size: 12px;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      line-height: 1;
      margin-bottom: 3px;
    }
    .notif-axis-name {
      font-size: 26px;
      font-weight: 900;
      line-height: 1;
    }
    .notif-time-badge {
      font-size: 12px;
      font-weight: 700;
      color: #94A3B8;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .notif-unread-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }

    .notif-body {
      font-size: 19px;
      font-weight: 600;
      color: #334155;
      line-height: 1.35;
      margin-bottom: 0;
    }

    /* BALÃO 1: SOCIAL (AZUL - SUPERIOR ESQUERDO) */
    .balloon-social {
      top: 610px;
      left: 40px;
      width: 325px;
      border: 2.5px solid rgba(15, 71, 128, 0.28);
      border-top: 5.5px solid #0F4780;
      box-shadow: 
        0 20px 42px -6px rgba(15, 71, 128, 0.22),
        0 4px 14px rgba(0, 0, 0, 0.06);
    }
    .balloon-social .notif-icon-badge {
      background: #EEF4FA;
      color: #0F4780;
      border: 1.5px solid rgba(15, 71, 128, 0.25);
    }
    .balloon-social .notif-axis-name { color: #0F4780; }
    .balloon-social .notif-unread-dot { background: #0F4780; }
    .balloon-social::after {
      content: '';
      position: absolute;
      right: -14px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-left: 14px solid #0F4780;
    }

    /* BALÃO 2: INFORMATIVO (VERMELHO - SUPERIOR DIREITO) */
    .balloon-info {
      top: 610px;
      right: 40px;
      width: 325px;
      border: 2.5px solid rgba(241, 67, 67, 0.28);
      border-top: 5.5px solid #F14343;
      box-shadow: 
        0 20px 42px -6px rgba(241, 67, 67, 0.22),
        0 4px 14px rgba(0, 0, 0, 0.06);
    }
    .balloon-info .notif-icon-badge {
      background: #FEF2F2;
      color: #F14343;
      border: 1.5px solid rgba(241, 67, 67, 0.25);
    }
    .balloon-info .notif-axis-name { color: #F14343; }
    .balloon-info .notif-unread-dot { background: #F14343; }
    .balloon-info::after {
      content: '';
      position: absolute;
      left: -14px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-right: 14px solid #F14343;
    }

    /* BALÃO 3: FERRAMENTAS (AMARELO - ESQUERDA) */
    .balloon-tools {
      top: 805px;
      left: 40px;
      width: 325px;
      border: 2.5px solid rgba(255, 204, 0, 0.50);
      border-top: 5.5px solid #FFCC00;
      box-shadow: 
        0 20px 42px -6px rgba(217, 119, 6, 0.26),
        0 4px 14px rgba(0, 0, 0, 0.06);
    }
    .balloon-tools .notif-icon-badge {
      background: #FEF9C3;
      color: #854D0E;
      border: 1.5px solid rgba(255, 204, 0, 0.50);
    }
    .balloon-tools .notif-axis-name { color: #854D0E; }
    .balloon-tools .notif-unread-dot { background: #D97706; }
    .balloon-tools::after {
      content: '';
      position: absolute;
      right: -14px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: 10px solid transparent;
      border-bottom: 10px solid transparent;
      border-left: 14px solid #FFCC00;
    }

    /* 4. PAINEL INFERIOR ESQUERDO AMPLIADO: QR CODE E SEGURANÇA INSTITUCIONAL */
    .bottom-left-panel {
      position: absolute;
      bottom: 45px;
      left: 45px;
      display: flex;
      align-items: flex-end;
      gap: 24px;
      z-index: 30;
    }

    .qr-code-box {
      width: 270px;
      height: 270px;
      background: #FFFFFF;
      padding: 12px;
      border-radius: 26px;
      border: 2.5px solid rgba(15, 71, 128, 0.20);
      box-shadow: 0 18px 40px -4px rgba(15, 71, 128, 0.16), 0 4px 14px rgba(0, 0, 0, 0.06);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      flex-shrink: 0;
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

    .bottom-qr-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }
    .qr-clean-link {
      font-size: 20px;
      font-weight: 800;
      color: #0F4780;
      text-decoration: underline;
      text-underline-offset: 5px;
      letter-spacing: -0.2px;
    }

    /* BLOCO INSTITUCIONAL AMPLIADO */
    .bottom-inst-box {
      width: 500px;
      height: 270px;
      background: #F8FAFC;
      border-radius: 26px;
      border: 2px solid #E2E8F0;
      padding: 20px 24px 18px 24px;
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
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .inst-desc-text {
      font-size: 14.5px;
      line-height: 1.40;
      color: #334155;
    }
    .inst-actions-row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .inst-action-card {
      flex: 1;
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      padding: 8px 10px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 9px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    }
    .inst-action-icon {
      width: 32px;
      height: 32px;
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
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .inst-action-tag.tag-git { color: #0F4780; }
    .inst-action-tag.tag-email { color: #F14343; }
    .inst-action-val {
      font-size: 12px;
      font-weight: 700;
      color: #0F172A;
      letter-spacing: -0.2px;
      white-space: nowrap;
    }
    .inst-legal-copy {
      font-size: 12px;
      color: #64748B;
      font-weight: 600;
      border-top: 1.5px solid #E2E8F0;
      padding-top: 7px;
      text-align: center;
    }
  </style>
</head>
<body>

  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="bg-math-pattern"></div>

    <!-- 1. HEADER SECTION -->
    <header class="header-section">
      <h1 class="hero-title font-bukra">
        Entender a universidade<br><span class="palma-highlight">à um clique de distância</span>
      </h1>

      <p class="hero-subtitle font-open-sans">
        A plataforma de comunicação científica e apoio da graduação do Laboratório de Expressão e Divulgação do IFUSP.
      </p>
    </header>

    <!-- 2. ILUSTRAÇÃO VETORIAL DA MÃO SEGURANDO SMARTPHONE (EXATAMENTE NO CENTRO GEOMÉTRICO X=620) -->
    <div class="illustration-wrap">
      <svg class="hand-phone-svg" viewBox="0 0 1240 1754" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="phone-drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="-8" dy="18" stdDeviation="16" flood-color="rgba(15,71,128,0.22)" />
          </filter>
        </defs>

        <!-- Smartphone e mão perfeitamente centralizados horizontalmente no centro geométrico (X=620) e abaixados para Y=445 -->
        <g transform="translate(57.8, 454) scale(1.20)">
          
          <!-- Camada 1: 4 Dedos na Esquerda (Sob o telefone) -->
          ${SVG_FINGERS.map(d => `<path d="${d}" fill="#EFBA8E" />`).join('\n          ')}

          <!-- Camada 2: Chassi do Smartphone -->
          <g filter="url(#phone-drop-shadow)">
            <rect x="339" y="171" width="260" height="492" rx="28" fill="#3D3A3A" stroke="#222121" stroke-width="2" />
          </g>

          <!-- Camada 3: Tela de Loading Interativa via ForeignObject -->
          <foreignObject x="362" y="200" width="213" height="414">
            <div xmlns="http://www.w3.org/1999/xhtml" class="phone-screen-loading">
              <!-- Barra de status -->
              <div class="screen-status-bar">
                <span class="status-time">12:00</span>
                <div class="status-notch">
                  <div class="status-notch-cam"></div>
                </div>
                <div class="status-icons">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4z"/>
                  </svg>
                  <svg width="16" height="10" viewBox="0 0 24 14" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="1" y="1" width="19" height="12" rx="3" fill="none"/>
                    <rect x="3" y="3" width="13" height="8" rx="1.5" fill="currentColor"/>
                    <path d="M22 5v4" stroke-linecap="round"/>
                  </svg>
                </div>
              </div>

              <!-- Corpo central: Ícone squircle + Marca + Barra de progresso -->
              <div class="screen-loading-body">
                <div class="screen-brand-icon-box">
                  <img src="icons/icone-HUBLabDiv-white.png" alt="HUB LabDiv" class="screen-hub-icon" />
                </div>

                <h2 class="screen-brand-name font-bukra">HUB LabDiv</h2>
                <p class="screen-brand-sub font-open-sans">Comunicação Científica IFUSP</p>

                <!-- Barra de loading colorida -->
                <div class="screen-loader-track">
                  <div class="screen-loader-fill"></div>
                </div>

                <div class="screen-loader-caption">
                  <span class="loading-pulse-dot"></span>
                  <span class="loading-text font-open-sans">Iniciando plataforma acadêmica...</span>
                </div>
              </div>

              <!-- Rodapé da tela do celular -->
              <div class="screen-bottom-bar">
                <span class="screen-version font-open-sans">v3.0 • Software Livre (AGPLv3)</span>
                <div class="screen-home-indicator"></div>
              </div>
            </div>
          </foreignObject>

          <!-- Camada 4: Detalhes Frontais do Smartphone -->
          <rect x="435" y="183" width="66" height="5" rx="2.5" fill="#A2A19F" />
          <circle cx="468.5" cy="635.5" r="11.5" fill="#8E8C8D" />

          <!-- Camada 5: Palma e Polegar (Sobrepõe o chassi à direita) -->
          <path d="${SVG_PALM}" fill="#EFBA8E" />

          <!-- Camada 6: Manga Vermelha Autêntica (Antebraço cilíndrico angulado com largura natural) -->
          <polygon points="751,673 560,773 815,1450 1120,1450 751,673" fill="#E51B27" />

        </g>
      </svg>
    </div>

    <!-- 3. TRÊS BALÕES DE NOTIFICAÇÕES -->
    
    <!-- BALÃO 1: SOCIAL (AZUL - SUPERIOR ESQUERDO) -->
    <div class="notif-balloon balloon-social">
      <div class="notif-top-row">
        <div class="notif-identity">
          <div class="notif-icon-badge">
            <svg width="24" height="24" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/>
            </svg>
          </div>
          <div class="notif-meta-text">
            <span class="notif-app-source font-open-sans">HUB LabDiv</span>
            <span class="notif-axis-name font-bukra">Social</span>
          </div>
        </div>
        <div class="notif-time-badge font-open-sans">
          <span class="notif-unread-dot"></span>
          <span>agora</span>
        </div>
      </div>
      <p class="notif-body font-open-sans">Rede comunicativa &amp; pedagógica para conectar estudantes.</p>
    </div>

    <!-- BALÃO 2: INFORMATIVO (VERMELHO - SUPERIOR DIREITO) -->
    <div class="notif-balloon balloon-info">
      <div class="notif-top-row">
        <div class="notif-identity">
          <div class="notif-icon-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <div class="notif-meta-text">
            <span class="notif-app-source font-open-sans">HUB LabDiv</span>
            <span class="notif-axis-name font-bukra">Informativo</span>
          </div>
        </div>
        <div class="notif-time-badge font-open-sans">
          <span class="notif-unread-dot"></span>
          <span>há 3 min</span>
        </div>
      </div>
      <p class="notif-body font-open-sans">Enciclopédia acadêmica interativa e acervo da graduação.</p>
    </div>

    <!-- BALÃO 3: FERRAMENTAS (AMARELO - ESQUERDA) -->
    <div class="notif-balloon balloon-tools">
      <div class="notif-top-row">
        <div class="notif-identity">
          <div class="notif-icon-badge">
            <svg width="24" height="24" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z"/>
            </svg>
          </div>
          <div class="notif-meta-text">
            <span class="notif-app-source font-open-sans">HUB LabDiv</span>
            <span class="notif-axis-name font-bukra">Ferramentas</span>
          </div>
        </div>
        <div class="notif-time-badge font-open-sans">
          <span class="notif-unread-dot"></span>
          <span>há 8 min</span>
        </div>
      </div>
      <p class="notif-body font-open-sans">Funções e utilidades de auxílio: simuladores, notas e rotina.</p>
    </div>

    <!-- 4. PAINEL INFERIOR ESQUERDO AMPLIADO: QR CODE E SEGURANÇA INSTITUCIONAL -->
    <div class="bottom-left-panel">
      <!-- Coluna QR Code Ampliada -->
      <div class="bottom-qr-col">
        <div class="qr-code-box">
          ${qrSvg}
          <div class="qr-center-badge-img">
            <img src="icons/qr-hub-logo-badge.png" alt="HUB Badge" />
          </div>
        </div>
        <a class="qr-clean-link font-bukra" href="https://hub.labdiv.com.br/divulgacao">hub.labdiv.com.br/divulgacao</a>
      </div>

      <!-- Bloco Institucional Ampliado (Texto e Formato Oficial de Segurança e Código Aberto) -->
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

  // Render to PNG using Puppeteer at 300 DPI (2480x3508 px)
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
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1000));

  const outPngPath = path.join(POSTER6_DIR, 'poster.png');
  await page.screenshot({
    path: outPngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Poster 6 em ultra-alta resolução (300 DPI, 2480x3508) gerado em: ${outPngPath}`);

  // Preview PNG rendered at full 1:1 scale (1240x1754 px) for razor-sharp IDE inspection
  const previewPage = await browser.newPage();
  await previewPage.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });
  await previewPage.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });
  await previewPage.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 800));
  const previewPath = path.join(POSTER6_DIR, 'poster_preview.png');
  await previewPage.screenshot({
    path: previewPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Preview nítido do Poster 6 (1240x1754) gerado em: ${previewPath}`);

  // Copy to active artifacts directory
  const activeArtifactsDir = (process.env.ARTIFACTS_DIR || './artifacts');
  if (fs.existsSync(activeArtifactsDir)) {
    fs.copyFileSync(outPngPath, path.join(activeArtifactsDir, 'poster6.png'));
    fs.copyFileSync(previewPath, path.join(activeArtifactsDir, 'poster6_preview.png'));
    console.log(`✅ Deliverables copiados para artifacts dir: ${activeArtifactsDir}`);
  }

  await browser.close();
  console.log('🎉 Poster 6 atualizado e renderizado com máxima definição!');
}

main().catch(err => {
  console.error('❌ Erro na geração do Poster 6:', err);
  process.exit(1);
});
