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
const POSTER2_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/posters/poster2');

async function main() {
  console.log('🚀 Criando Poster 2 Inovador (Neo-Swiss Editorial Spectrum - Light Mode)...');

  if (!fs.existsSync(POSTER2_DIR)) {
    fs.mkdirSync(POSTER2_DIR, { recursive: true });
  }

  // Generate crisp QR code SVG
  const qrSvg = await QRCode.toString('https://hub.labdiv.com.br/divulgacao', {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HUB LabDiv - A Física na Palma da Mão (Poster 02)</title>
  <link rel="stylesheet" href="../../fonts/fonts.css">
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
           url('../../fonts/Outfit-Black.ttf') format('truetype');
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
      background: #FFFFFF;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      padding: 56px 64px 44px 64px;
      box-sizing: border-box;
    }

    /* Top Beam Gradient */
    .brand-gradient-line-top {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 8px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 33%, #F14343 66%, #FFCC00 100%);
      z-index: 50;
    }

    /* Subtle background grid pattern */
    .bg-math-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 1240px;
      height: 1754px;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjEyMDAiIGZpbGw9Im5vbmUiPgogIDwhLS0gRXF1YXRpb25zICYgRm9ybXVsYXMgLS0+CiAgPHRleHQgeD0iODAiIHk9IjYwIiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjMxIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKC0xMiA4MCA2MCkiPkUgPSBtY8KyPC90ZXh0PgogIDx0ZXh0IHg9IjY1MCIgeT0iMTIwIiBmaWxsPSIjRjE0MzQzIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjI1IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKDggNjUwIDEyMCkiPuKIgs+IL+KIgnQ8L3RleHQ+CiAgPHRleHQgeD0iMTAyMCIgeT0iODAiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzEiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTUgMTAyMCA4MCkiPuKEjzwvdGV4dD4KICA8dGV4dCB4PSIzNTAiIHk9IjIwMCIgZmlsbD0iI0Q5NzcwNiIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyOCIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iNjAwIiB0cmFuc2Zvcm09InJvdGF0ZSgxNSAzNTAgMjAwKSI+4oiHw5dCPC90ZXh0PgogIDx0ZXh0IHg9IjkwMCIgeT0iMjUwIiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjM0IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKC04IDkwMCAyNTApIj7iiKs8L3RleHQ+CiAgPHRleHQgeD0iMTUwIiB5PSIzNDAiIGZpbGw9IiNGMTQzNDMiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzEiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoNiAxNTAgMzQwKSI+zrsgPSBoL3A8L3RleHQ+CiAgPHRleHQgeD0iNTUwIiB5PSIzODAiIGZpbGw9IiMwRjQ3ODAiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMjUiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTEwIDU1MCAzODApIj7OozwvdGV4dD4KICA8dGV4dCB4PSIxMDUwIiB5PSI0MDAiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMTkiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoMTIgMTA1MCA0MDApIj7OlHjOlHAg4omlIOKEjy8yPC90ZXh0PgogIDx0ZXh0IHg9IjgwIiB5PSI1MDAiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTYgODAgNTAwKSI+z4A8L3RleHQ+CiAgPHRleHQgeD0iNDAwIiB5PSI1NTAiIGZpbGw9IiNGMTQzNDMiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzEiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoOSA0MDAgNTUwKSI+RiA9IG1hPC90ZXh0PgogIDx0ZXh0IHg9Ijc1MCIgeT0iNTIwIiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjMxIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKC0xNSA3NTAgNTIwKSI+4oiCwrJ1L+KIgnTCsjwvdGV4dD4KICA8dGV4dCB4PSIyMDAiIHk9IjY4MCIgZmlsbD0iIzBGNDc4MCIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyNSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iNjAwIiB0cmFuc2Zvcm09InJvdGF0ZSg0IDIwMCA2ODApIj7iiK4gRcK3ZGw8L3RleHQ+CiAgPHRleHQgeD0iNjAwIiB5PSI3MjAiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzEiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTcgNjAwIDcyMCkiPs+IKHgsdCk8L3RleHQ+CiAgPHRleHQgeD0iMTAwMCIgeT0iNjUwIiBmaWxsPSIjRjE0MzQzIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjI4IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKDExIDEwMDAgNjUwKSI+4oiePC90ZXh0PgogIDx0ZXh0IHg9IjEwMCIgeT0iODUwIiBmaWxsPSIjRjE0MzQzIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjE5IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKC05IDEwMCA4NTApIj5p4oSP4oiCz4gv4oiCdCA9IMSkz4g8L3RleHQ+CiAgPHRleHQgeD0iNDgwIiB5PSI5MDAiIGZpbGw9IiMwRjQ3ODAiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzEiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoNyA0ODAgOTAwKSI+zqk8L3RleHQ+CiAgPHRleHQgeD0iODUwIiB5PSI4NzAiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzEiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTEzIDg1MCA4NzApIj7iiIfCss+GPC90ZXh0PgogIDx0ZXh0IHg9IjMwMCIgeT0iMTA1MCIgZmlsbD0iI0Q5NzcwNiIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyNSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iNjAwIiB0cmFuc2Zvcm09InJvdGF0ZSg1IDMwMCAxMDUwKSI+zrEgzrIgzrM8L3RleHQ+CiAgPHRleHQgeD0iNzAwIiB5PSIxMDgwIiBmaWxsPSIjRjE0MzQzIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjE5IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKC04IDcwMCAxMDgwKSI+UyA9IGsgbG4gVzwvdGV4dD4KICA8dGV4dCB4PSIxMDgwIiB5PSIxMDAwIiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjI4IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKDEwIDEwODAgMTAwMCkiPuKIgi/iiIJ4PC90ZXh0PgogIDx0ZXh0IHg9IjUwIiB5PSIxMTUwIiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjMxIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKC00IDUwIDExNTApIj7OvOKCgM614oKAPC90ZXh0PgogIDx0ZXh0IHg9IjU1MCIgeT0iMTE1MCIgZmlsbD0iI0YxNDM0MyIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyNSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iNjAwIiB0cmFuc2Zvcm09InJvdGF0ZSgxNCA1NTAgMTE1MCkiPs+BPC90ZXh0PgogIDx0ZXh0IHg9Ijk1MCIgeT0iMTE1MCIgZmlsbD0iI0Q5NzcwNiIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIzMSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iNjAwIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTEgOTUwIDExNTApIj7OlDwvdGV4dD4KPC9zdmc+Cg==');
      background-repeat: repeat;
      background-size: 850px 850px;
      opacity: 0.12;
      pointer-events: none;
      z-index: 1;
    }

    /* Top Identity Header */
    .top-brand-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: relative;
      z-index: 10;
    }
    .brand-identity-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-logo-icon {
      width: 58px;
      height: 58px;
      background: #0F4780;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(15, 71, 128, 0.25);
    }
    .brand-logo-icon img {
      width: 40px;
      height: 40px;
      object-fit: contain;
    }
    .brand-titles-wrap {
      display: flex;
      flex-direction: column;
    }
    .brand-inst-tag {
      font-size: 13px;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: #64748B;
      font-weight: 700;
    }
    .brand-inst-name {
      font-size: 20px;
      font-weight: 800;
      color: #0F4780;
      letter-spacing: 0.05em;
    }

    /* Numbering badge (Nº 02 / 12) */
    .poster-edition-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #F1F5F9;
      border: 1.5px solid #CBD5E1;
      border-radius: 9999px;
      padding: 10px 22px;
      letter-spacing: 0.1em;
    }
    .poster-edition-badge .edition-num {
      font-size: 16px;
      font-weight: 900;
      color: #0F4780;
    }
    .poster-edition-badge .edition-total {
      font-size: 14px;
      font-weight: 700;
      color: #64748B;
    }

    /* Swiss Hero Section */
    .hero-swiss-zone {
      margin-top: 36px;
      position: relative;
      z-index: 10;
    }
    .hero-pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #EEF4FA;
      border: 1.5px solid #BFDBFE;
      border-radius: 9999px;
      padding: 8px 24px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.2em;
      color: #0F4780;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .hero-main-title {
      font-size: 76px;
      line-height: 1.05;
      font-weight: 900;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      color: #0F172A;
      margin-bottom: 20px;
    }
    .hero-main-title .gradient-text {
      background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #D97706 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-sub-desc {
      font-size: 22px;
      line-height: 1.5;
      color: #475569;
      max-width: 950px;
      font-weight: 400;
    }

    /* 3 Pillars Spectrum Grid */
    .spectrum-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 36px;
      margin-bottom: 36px;
      position: relative;
      z-index: 10;
    }
    .spectrum-card {
      border-radius: 24px;
      padding: 36px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
      border: 2px solid transparent;
    }

    /* Blue Card */
    .spectrum-card.card-blue {
      background: #F8FAFC;
      border-color: #BAE6FD;
      border-top: 6px solid #0F4780;
    }
    .spectrum-card.card-blue .spectrum-num { color: #0F4780; }
    .spectrum-card.card-blue .spectrum-title { color: #0F4780; }
    .spectrum-card.card-blue .spectrum-icon { background: #E0F2FE; color: #0284C7; }

    /* Red Card */
    .spectrum-card.card-red {
      background: #F8FAFC;
      border-color: #FECACA;
      border-top: 6px solid #F14343;
    }
    .spectrum-card.card-red .spectrum-num { color: #F14343; }
    .spectrum-card.card-red .spectrum-title { color: #F14343; }
    .spectrum-card.card-red .spectrum-icon { background: #FEE2E2; color: #DC2626; }

    /* Yellow Card */
    .spectrum-card.card-yellow {
      background: #F8FAFC;
      border-color: #FEF08A;
      border-top: 6px solid #FFCC00;
    }
    .spectrum-card.card-yellow .spectrum-num { color: #B45309; }
    .spectrum-card.card-yellow .spectrum-title { color: #854D0E; }
    .spectrum-card.card-yellow .spectrum-icon { background: #FEF9C3; color: #D97706; }

    .spectrum-top-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 18px;
    }
    .spectrum-icon {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .spectrum-num {
      font-size: 13px;
      font-weight: 900;
      letter-spacing: 0.15em;
    }
    .spectrum-title {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: -0.01em;
    }
    .spectrum-desc {
      font-size: 16px;
      line-height: 1.55;
      color: #334155;
      margin-bottom: 22px;
      flex-grow: 1;
    }
    .spectrum-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .spectrum-tag {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 6px 12px;
      border-radius: 8px;
      background: #FFFFFF;
      color: #334155;
      border: 1px solid #E2E8F0;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    /* Bottom Interactive Callout & QR Code */
    .bottom-interactive-box {
      background: #F8FAFC;
      border: 2px solid #E2E8F0;
      border-radius: 28px;
      padding: 32px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 36px;
      position: relative;
      z-index: 10;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.04);
    }
    .bottom-info-col {
      flex: 1;
    }
    .bottom-callout-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #0F4780;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .bottom-headline {
      font-size: 34px;
      font-weight: 900;
      color: #0F172A;
      line-height: 1.2;
      margin-bottom: 10px;
    }
    .bottom-features-list {
      display: flex;
      gap: 24px;
      font-size: 15px;
      color: #475569;
      margin-top: 14px;
    }
    .bottom-feature-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .bottom-feature-item svg {
      color: #059669;
    }

    /* QR Code Card */
    .qr-showcase-wrap {
      display: flex;
      align-items: center;
      gap: 24px;
      background: #FFFFFF;
      padding: 18px 24px;
      border-radius: 20px;
      border: 1.5px solid #CBD5E1;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
    }
    .qr-svg-container {
      width: 140px;
      height: 140px;
      position: relative;
    }
    .qr-svg-container svg {
      width: 100%;
      height: 100%;
      display: block;
    }
    .qr-badge-inner {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 38px;
      height: 38px;
      background: #0F4780;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #FFFFFF;
    }
    .qr-badge-inner img {
      width: 26px;
      height: 26px;
      object-fit: contain;
    }
    .qr-details-col {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .qr-scan-label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 4px;
    }
    .qr-action-text {
      font-size: 20px;
      font-weight: 900;
      color: #0F172A;
      line-height: 1.15;
      margin-bottom: 6px;
    }
    .qr-url-link {
      font-size: 13px;
      font-weight: 800;
      color: #0F4780;
      letter-spacing: 0.02em;
    }

    /* Footer Legal Line */
    .poster-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 18px;
      position: relative;
      z-index: 10;
      border-top: 1px solid #E2E8F0;
      font-size: 12px;
      color: #64748B;
    }
    .footer-left-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .footer-pill-agpl {
      background: #E2E8F0;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      padding: 3px 8px;
      font-weight: 700;
      color: #334155;
      font-size: 11px;
    }
  </style>
</head>
<body>

  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="bg-math-pattern"></div>

    <!-- 1. IDENTIDADE E NUMERAÇÃO OFICIAL -->
    <header class="top-brand-row">
      <div class="brand-identity-left">
        <div class="brand-logo-icon">
          <img src="../../icone-HUBLabDiv.svg" alt="HUB LabDiv Logo">
        </div>
        <div class="brand-titles-wrap">
          <span class="brand-inst-tag font-bukra">IFUSP • UNIVERSIDADE DE SÃO PAULO</span>
          <span class="brand-inst-name font-bukra">HUB LAB-DIV</span>
        </div>
      </div>

      <!-- Badge de Numeração (Task 2.2) -->
      <div class="poster-edition-badge font-bukra">
        <span class="edition-num">Nº 02</span>
        <span class="edition-total">/ 12</span>
      </div>
    </header>

    <!-- 2. HERO PRINCIPAL INNOVATIVE -->
    <section class="hero-swiss-zone">
      <div class="hero-pill-badge font-bukra">
        <span>A FÍSICA AO SEU ALCANCE</span>
      </div>
      <h1 class="hero-main-title font-bukra">
        A UNIVERSIDADE NA<br><span class="gradient-text">PALMA DA SUA MÃO</span>
      </h1>
      <p class="hero-sub-desc font-open-sans">
        O ecossistema universitário completo criado para conectar estudantes, pesquisadores e a sociedade através do conhecimento científico do Instituto de Física da USP.
      </p>
    </section>

    <!-- 3. OS 3 PILARES DO HUB LABDIV -->
    <section class="spectrum-grid">
      <!-- 01. SOCIAL -->
      <div class="spectrum-card card-blue">
        <div>
          <div class="spectrum-top-header">
            <div class="spectrum-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <span class="spectrum-num font-bukra">PILAR 01</span>
              <h2 class="spectrum-title font-bukra">Social</h2>
            </div>
          </div>
          <p class="spectrum-desc font-open-sans">
            Feed acadêmico colaborativo, grupos de estudo, discussões de matérias e troca de experiências entre calouros e pesquisadores do IFUSP.
          </p>
        </div>
        <div class="spectrum-tags-row font-bukra">
          <span class="spectrum-tag">Comunidades</span>
          <span class="spectrum-tag">Monitoria</span>
          <span class="spectrum-tag">Networking</span>
        </div>
      </div>

      <!-- 02. INFORMATIVO -->
      <div class="spectrum-card card-red">
        <div>
          <div class="spectrum-top-header">
            <div class="spectrum-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </div>
            <div>
              <span class="spectrum-num font-bukra">PILAR 02</span>
              <h2 class="spectrum-title font-bukra">Informativo</h2>
            </div>
          </div>
          <p class="spectrum-desc font-open-sans">
            Grande Colisor de Informações (GCIF), enciclopédia viva com resumos, guias de laboratório, listas resolvidas e acervo histórico.
          </p>
        </div>
        <div class="spectrum-tags-row font-bukra">
          <span class="spectrum-tag">Wiki IFUSP</span>
          <span class="spectrum-tag">Artigos</span>
          <span class="spectrum-tag">Acervo</span>
        </div>
      </div>

      <!-- 03. FERRAMENTAS -->
      <div class="spectrum-card card-yellow">
        <div>
          <div class="spectrum-top-header">
            <div class="spectrum-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <div>
              <span class="spectrum-num font-bukra">PILAR 03</span>
              <h2 class="spectrum-title font-bukra">Ferramentas</h2>
            </div>
          </div>
          <p class="spectrum-desc font-open-sans">
            Simuladores computacionais de física, calculadoras científicas, sincronização da grade horária do Júpiter e apoio estudantil.
          </p>
        </div>
        <div class="spectrum-tags-row font-bukra">
          <span class="spectrum-tag">Simuladores</span>
          <span class="spectrum-tag">JúpiterWeb</span>
          <span class="spectrum-tag">Apoio</span>
        </div>
      </div>
    </section>

    <!-- 4. BOTTOM INTERACTIVE & QR CODE -->
    <div class="bottom-interactive-box">
      <div class="bottom-info-col">
        <div class="bottom-callout-pill font-bukra">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>100% GRATUITO &amp; ABERTO</span>
        </div>
        <h3 class="bottom-headline font-bukra">Acesse pelo Navegador ou Android</h3>
        <p class="font-open-sans" style="color: #475569; font-size: 16px;">
          Explore a plataforma no celular ou computador com suporte offline para levar resumos e notas para qualquer lugar.
        </p>
        <div class="bottom-features-list font-open-sans">
          <div class="bottom-feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Sem anúncios</span>
          </div>
          <div class="bottom-feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Código Aberto</span>
          </div>
          <div class="bottom-feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Modo Offline</span>
          </div>
        </div>
      </div>

      <!-- QR Code Holder -->
      <div class="qr-showcase-wrap">
        <div class="qr-svg-container">
          ${qrSvg}
          <div class="qr-badge-inner">
            <img src="../../icone-HUBLabDiv.svg" alt="HUB">
          </div>
        </div>
        <div class="qr-details-col">
          <span class="qr-scan-label font-bukra">ESCANEAR CÓDIGO</span>
          <span class="qr-action-text font-bukra">ACESSE<br>AGORA</span>
          <span class="qr-url-link font-bukra">hub.labdiv.com.br</span>
        </div>
      </div>
    </div>

    <!-- 5. RODAPÉ INSTITUCIONAL -->
    <footer class="poster-footer-row font-open-sans">
      <div class="footer-left-meta">
        <span class="footer-pill-agpl">AGPLv3</span>
        <span>Software Livre desenvolvido pelo Laboratório de Divulgação Científica (LabDiv) - IFUSP</span>
      </div>
      <div>
        <span>São Paulo • 2026</span>
      </div>
    </footer>

  </div>

</body>
</html>`;

  const htmlPath = path.join(POSTER2_DIR, 'poster.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log(`✅ Arquivo HTML gerado em: ${htmlPath}`);

  // Launch Puppeteer to render 300 DPI PNG
  console.log('📸 Renderizando PNG em alta resolução (300 DPI)...');
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
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1000));

  const outPngPath = path.join(POSTER2_DIR, 'poster.png');
  await page.screenshot({
    path: outPngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Poster 2 em alta resolução gerado em: ${outPngPath}`);

  await browser.close();
  console.log('🎉 Poster 2 concluído com sucesso!');
}

main().catch(err => {
  console.error('❌ Erro no Poster 2:', err);
  process.exit(1);
});
