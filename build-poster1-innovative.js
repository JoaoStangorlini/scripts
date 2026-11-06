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
const POSTER1_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/posters/poster1');

async function main() {
  console.log('🚀 Criando Poster 1 Inovador (Cybernetic Quantum Lab - Dark Mode)...');

  if (!fs.existsSync(POSTER1_DIR)) {
    fs.mkdirSync(POSTER1_DIR, { recursive: true });
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
  <title>HUB LabDiv - O Ponto de Encontro da Física na USP (Poster 01)</title>
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
      background-color: #0B0E14;
      color: #F8FAFC;
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
      background: radial-gradient(circle at 50% 0%, #151C2C 0%, #0B0E14 70%);
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

    /* Background Math Formula Texture */
    .bg-math-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 1240px;
      height: 1754px;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjEyMDAiIGZpbGw9Im5vbmUiPgogIDwhLS0gRXF1YXRpb25zICYgRm9ybXVsYXMgLS0+CiAgPHRleHQgeD0iODAiIHk9IjYwIiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjMxIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKC0xMiA4MCA2MCkiPkUgPSBtY8KyPC90ZXh0PgogIDx0ZXh0IHg9IjY1MCIgeT0iMTIwIiBmaWxsPSIjRjE0MzQzIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjI1IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKDggNjUwIDEyMCkiPuKIgs+IL+KIgnQ8L3RleHQ+CiAgPHRleHQgeD0iMTAyMCIgeT0iODAiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzEiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTUgMTAyMCA4MCkiPuKEjzwvdGV4dD4KICA8dGV4dCB4PSIzNTAiIHk9IjIwMCIgZmlsbD0iI0Q5NzcwNiIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyOCIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iNjAwIiB0cmFuc2Zvcm09InJvdGF0ZSgxNSAzNTAgMjAwKSI+4oiHw5dCPC90ZXh0PgogIDx0ZXh0IHg9IjkwMCIgeT0iMjUwIiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjM0IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKC04IDkwMCAyNTApIj7iiKs8L3RleHQ+CiAgPHRleHQgeD0iMTUwIiB5PSIzNDAiIGZpbGw9IiNGMTQzNDMiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzEiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoNiAxNTAgMzQwKSI+zrsgPSBoL3A8L3RleHQ+CiAgPHRleHQgeD0iNTUwIiB5PSIzODAiIGZpbGw9IiMwRjQ3ODAiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMjUiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTEwIDU1MCAzODApIj7OozwvdGV4dD4KICA8dGV4dCB4PSIxMDUwIiB5PSI0MDAiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMTkiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoMTIgMTA1MCA0MDApIj7OlHjOlHAg4omlIOKEjy8yPC90ZXh0PgogIDx0ZXh0IHg9IjgwIiB5PSI1MDAiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMjgiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTYgODAgNTAwKSI+z4A8L3RleHQ+CiAgPHRleHQgeD0iNDAwIiB5PSI1NTAiIGZpbGw9IiNGMTQzNDMiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzEiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoOSA0MDAgNTUwKSI+RiA9IG1hPC90ZXh0PgogIDx0ZXh0IHg9Ijc1MCIgeT0iNTIwIiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjMxIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKC0xNSA3NTAgNTIwKSI+4oiCwrJ1L+KIgnTCsjwvdGV4dD4KICA8dGV4dCB4PSIyMDAiIHk9IjY4MCIgZmlsbD0iIzBGNDc4MCIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyNSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iNjAwIiB0cmFuc2Zvcm09InJvdGF0ZSg0IDIwMCA2ODApIj7iiK4gRcK3ZGw8L3RleHQ+CiAgPHRleHQgeD0iNjAwIiB5PSI3MjAiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzEiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTcgNjAwIDcyMCkiPs+IKHgsdCk8L3RleHQ+CiAgPHRleHQgeD0iMTAwMCIgeT0iNjUwIiBmaWxsPSIjRjE0MzQzIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjI4IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKDExIDEwMDAgNjUwKSI+4oiePC90ZXh0PgogIDx0ZXh0IHg9IjEwMCIgeT0iODUwIiBmaWxsPSIjRjE0MzQzIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjE5IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKC05IDEwMCA4NTApIj5p4oSP4oiCz4gv4oiCdCA9IMSkz4g8L3RleHQ+CiAgPHRleHQgeD0iNDgwIiB5PSI5MDAiIGZpbGw9IiMwRjQ3ODAiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzEiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoNyA0ODAgOTAwKSI+zqk8L3RleHQ+CiAgPHRleHQgeD0iODUwIiB5PSI4NzAiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzEiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9IjYwMCIgdHJhbnNmb3JtPSJyb3RhdGUoLTEzIDg1MCA4NzApIj7iiIfCss+GPC90ZXh0PgogIDx0ZXh0IHg9IjMwMCIgeT0iMTA1MCIgZmlsbD0iI0Q5NzcwNiIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyNSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iNjAwIiB0cmFuc2Zvcm09InJvdGF0ZSg1IDMwMCAxMDUwKSI+zrEgzrIgzrM8L3RleHQ+CiAgPHRleHQgeD0iNzAwIiB5PSIxMDgwIiBmaWxsPSIjRjE0MzQzIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjE5IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKC04IDcwMCAxMDgwKSI+UyA9IGsgbG4gVzwvdGV4dD4KICA8dGV4dCB4PSIxMDgwIiB5PSIxMDAwIiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjI4IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKDEwIDEwODAgMTAwMCkiPuKIgi/iiIJ4PC90ZXh0PgogIDx0ZXh0IHg9IjUwIiB5PSIxMTUwIiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjMxIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSI2MDAiIHRyYW5zZm9ybT0icm90YXRlKC00IDUwIDExNTApIj7OvOKCgM614oKAPC90ZXh0PgogIDx0ZXh0IHg9IjU1MCIgeT0iMTE1MCIgZmlsbD0iI0YxNDM0MyIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyNSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iNjAwIiB0cmFuc2Zvcm09InJvdGF0ZSgxNCA1NTAgMTE1MCkiPs+BPC90ZXh0PgogIDx0ZXh0IHg9Ijk1MCIgeT0iMTE1MCIgZmlsbD0iI0Q5NzcwNiIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIzMSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iNjAwIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTEgOTUwIDExNTApIj7OlDwvdGV4dD4KPC9zdmc+Cg==');
      background-repeat: repeat;
      background-size: 900px 900px;
      opacity: 0.18;
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
      background: #181F2F;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid rgba(255, 204, 0, 0.4);
      box-shadow: 0 0 24px rgba(255, 204, 0, 0.2);
    }
    .brand-logo-icon img {
      width: 42px;
      height: 42px;
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
      color: #94A3B8;
      font-weight: 700;
    }
    .brand-inst-name {
      font-size: 20px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 0.05em;
    }

    /* Numbering badge (Nº 01 / 12) */
    .poster-edition-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.06);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(12px);
      border-radius: 9999px;
      padding: 10px 22px;
      letter-spacing: 0.1em;
    }
    .poster-edition-badge .edition-num {
      font-size: 16px;
      font-weight: 900;
      color: #FFCC00;
    }
    .poster-edition-badge .edition-total {
      font-size: 14px;
      font-weight: 700;
      color: #94A3B8;
    }

    /* Hero Section */
    .hero-quantum-zone {
      margin-top: 36px;
      position: relative;
      z-index: 10;
      text-align: center;
    }
    .hero-pill-badge {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(90deg, rgba(15, 71, 128, 0.4), rgba(241, 67, 67, 0.4));
      border: 1.5px solid rgba(255, 204, 0, 0.5);
      border-radius: 9999px;
      padding: 8px 24px;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.2em;
      color: #FFCC00;
      text-transform: uppercase;
      margin-bottom: 24px;
      box-shadow: 0 0 20px rgba(255, 204, 0, 0.15);
    }
    .hero-main-title {
      font-size: 78px;
      line-height: 1.05;
      font-weight: 900;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }
    .hero-main-title .gradient-text {
      background: linear-gradient(90deg, #0284C7 0%, #F14343 50%, #FFCC00 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-sub-desc {
      font-size: 22px;
      line-height: 1.5;
      color: #CBD5E1;
      max-width: 900px;
      margin: 0 auto;
      font-weight: 400;
    }

    /* 3 Central Futuristic Pillars */
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      margin-top: 40px;
      margin-bottom: 36px;
      position: relative;
      z-index: 10;
    }
    .pillar-card {
      background: rgba(22, 27, 38, 0.7);
      backdrop-filter: blur(16px);
      border-radius: 24px;
      padding: 36px 28px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
      transition: all 0.3s ease;
    }
    .pillar-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
    }
    
    /* Social Card */
    .pillar-card.card-social {
      border: 1px solid rgba(15, 71, 128, 0.4);
    }
    .pillar-card.card-social::before {
      background: #0284C7;
      box-shadow: 0 0 16px #0284C7;
    }
    .pillar-card.card-social .pillar-icon-box {
      background: rgba(2, 132, 199, 0.15);
      color: #38BDF8;
      border: 1px solid rgba(2, 132, 199, 0.3);
    }

    /* Informativo Card */
    .pillar-card.card-info {
      border: 1px solid rgba(241, 67, 67, 0.4);
    }
    .pillar-card.card-info::before {
      background: #F14343;
      box-shadow: 0 0 16px #F14343;
    }
    .pillar-card.card-info .pillar-icon-box {
      background: rgba(241, 67, 67, 0.15);
      color: #F87171;
      border: 1px solid rgba(241, 67, 67, 0.3);
    }

    /* Ferramentas Card */
    .pillar-card.card-tools {
      border: 1px solid rgba(255, 204, 0, 0.4);
    }
    .pillar-card.card-tools::before {
      background: #FFCC00;
      box-shadow: 0 0 16px #FFCC00;
    }
    .pillar-card.card-tools .pillar-icon-box {
      background: rgba(255, 204, 0, 0.15);
      color: #FDE047;
      border: 1px solid rgba(255, 204, 0, 0.3);
    }

    .pillar-top-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 20px;
    }
    .pillar-icon-box {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .pillar-num {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.15em;
      opacity: 0.6;
    }
    .pillar-title {
      font-size: 26px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.01em;
    }
    .pillar-desc {
      font-size: 16px;
      line-height: 1.55;
      color: #94A3B8;
      margin-bottom: 24px;
      flex-grow: 1;
    }
    .pillar-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .pillar-tag {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 6px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.05);
      color: #E2E8F0;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* Bottom Interactive & QR Code Showcase */
    .bottom-interactive-box {
      background: rgba(18, 22, 32, 0.85);
      backdrop-filter: blur(20px);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 28px;
      padding: 32px 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 36px;
      position: relative;
      z-index: 10;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
    }
    .bottom-info-col {
      flex: 1;
    }
    .bottom-callout-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: #38BDF8;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .bottom-headline {
      font-size: 34px;
      font-weight: 900;
      color: #FFFFFF;
      line-height: 1.2;
      margin-bottom: 10px;
    }
    .bottom-features-list {
      display: flex;
      gap: 20px;
      font-size: 14px;
      color: #94A3B8;
      margin-top: 14px;
    }
    .bottom-feature-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .bottom-feature-item svg {
      color: #10B981;
    }

    /* QR Code Card inside bottom box */
    .qr-showcase-wrap {
      display: flex;
      align-items: center;
      gap: 24px;
      background: #FFFFFF;
      padding: 18px 24px;
      border-radius: 20px;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
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
      background: #0B0E14;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #FFCC00;
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
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 12px;
      color: #64748B;
    }
    .footer-left-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .footer-pill-agpl {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 6px;
      padding: 3px 8px;
      font-weight: 700;
      color: #94A3B8;
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
        <span class="edition-num">Nº 01</span>
        <span class="edition-total">/ 12</span>
      </div>
    </header>

    <!-- 2. HERO PRINCIPAL INNOVATIVE -->
    <section class="hero-quantum-zone">
      <div class="hero-pill-badge font-bukra">
        <span>O PONTO DE ENCONTRO DA FÍSICA</span>
      </div>
      <h1 class="hero-main-title font-bukra">
        CONECTE-SE AO <span class="gradient-text">HUB</span>
      </h1>
      <p class="hero-sub-desc font-open-sans">
        A plataforma digital aberta do Instituto de Física da USP criada para integrar pesquisa acadêmica, rotina universitária e comunicação científica em um só ecossistema.
      </p>
    </section>

    <!-- 3. OS 3 PILARES DO HUB LABDIV -->
    <section class="pillars-grid">
      <!-- 01. SOCIAL -->
      <div class="pillar-card card-social">
        <div>
          <div class="pillar-top-header">
            <div class="pillar-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <span class="pillar-num font-bukra">PILAR 01</span>
              <h2 class="pillar-title font-bukra">Social</h2>
            </div>
          </div>
          <p class="pillar-desc font-open-sans">
            Comunidade colaborativa com feed de micro-artigos, grupos de estudo por matéria, fóruns de dúvidas e integração direta com veteranos e pesquisadores.
          </p>
        </div>
        <div class="pillar-tags-row font-bukra">
          <span class="pillar-tag">Comunidades</span>
          <span class="pillar-tag">Grupos</span>
          <span class="pillar-tag">Networking</span>
        </div>
      </div>

      <!-- 02. INFORMATIVO -->
      <div class="pillar-card card-info">
        <div>
          <div class="pillar-top-header">
            <div class="pillar-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </div>
            <div>
              <span class="pillar-num font-bukra">PILAR 02</span>
              <h2 class="pillar-title font-bukra">Informativo</h2>
            </div>
          </div>
          <p class="pillar-desc font-open-sans">
            Grande Colisor de Informações (GCIF), enciclopédia viva de física com guias de laboratório, resumos revisados e divulgação científica de ponta.
          </p>
        </div>
        <div class="pillar-tags-row font-bukra">
          <span class="pillar-tag">Wiki IFUSP</span>
          <span class="pillar-tag">Artigos</span>
          <span class="pillar-tag">Acervo</span>
        </div>
      </div>

      <!-- 03. FERRAMENTAS -->
      <div class="pillar-card card-tools">
        <div>
          <div class="pillar-top-header">
            <div class="pillar-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <div>
              <span class="pillar-num font-bukra">PILAR 03</span>
              <h2 class="pillar-title font-bukra">Ferramentas</h2>
            </div>
          </div>
          <p class="pillar-desc font-open-sans">
            Simuladores computacionais interativos, calculadoras acadêmicas, sincronização com grade horária do Júpiter e ferramentas de apoio ao estudante.
          </p>
        </div>
        <div class="pillar-tags-row font-bukra">
          <span class="pillar-tag">Simuladores</span>
          <span class="pillar-tag">JúpiterWeb</span>
          <span class="pillar-tag">Cálculos</span>
        </div>
      </div>
    </section>

    <!-- 4. BOTTOM INTERACTIVE & QR CODE -->
    <div class="bottom-interactive-box">
      <div class="bottom-info-col">
        <div class="bottom-callout-pill font-bukra">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>ACESSO IMEDIATO</span>
        </div>
        <h3 class="bottom-headline font-bukra">Disponível na Web &amp; Android</h3>
        <p class="font-open-sans" style="color: #94A3B8; font-size: 16px;">
          Navegue pelo navegador em qualquer dispositivo ou instale o aplicativo oficial para receber notificações de provas e aulas.
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

  const htmlPath = path.join(POSTER1_DIR, 'poster.html');
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

  const outPngPath = path.join(POSTER1_DIR, 'poster.png');
  await page.screenshot({
    path: outPngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Poster 1 em alta resolução gerado em: ${outPngPath}`);

  await browser.close();
  console.log('🎉 Poster 1 concluído com sucesso!');
}

main().catch(err => {
  console.error('❌ Erro no Poster 1:', err);
  process.exit(1);
});
