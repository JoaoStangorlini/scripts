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
const { execSync } = require('child_process');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const QRCode = require('qrcode');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const POSTER4_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/poster4');
const HTML_PATH = path.join(POSTER4_DIR, 'poster.html');

async function main() {
  console.log('🚀 Iniciando construção do Poster 4 com ícone de App e título ampliado...');

  // Ensure icons directory has the required assets
  const iconsDir = path.join(POSTER4_DIR, 'icons');
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
  fs.copyFileSync(path.join(PROJECT_ROOT, 'public/icone-HUBLabDiv-white.png'), path.join(iconsDir, 'icone-HUBLabDiv-white.png'));

  // Run python splatter generator
  execSync(`python3 "${path.join(__dirname, 'generate-poster4-splashes.py')}"`, { stdio: 'inherit' });
  const splashesSvg = fs.readFileSync(path.join(POSTER4_DIR, '.splashes_tmp.svg'), 'utf-8');

  // Generate crisp QR code SVG
  const qrSvg = await QRCode.toString('https://hub.labdiv.com.br/divulgacao', {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1
  });

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
  <title>HUB LabDiv - O poder de entender o ambiente acadêmico (Poster 4)</title>
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
      justify-content: space-between;
      overflow: hidden;
      padding: 0;
      box-sizing: border-box;
    }

    /* TEXTURA MATEMÁTICA / CIENTÍFICA EM MARCA D'ÁGUA */
    .bg-math-pattern {
      position: absolute;
      top: 0;
      left: 0;
      width: 1240px;
      height: 1754px;
      background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjEyMDAiIGZpbGw9Im5vbmUiPgogIDwhLS0gRXF1YXRpb25zICYgRm9ybXVsYXMgLS0+CiAgPHRleHQgeD0iODAiIHk9IjYwIiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjMyIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTIgODAgNjApIj5FID0gbWPCsjwvdGV4dD4KICA8dGV4dCB4PSI2NTAiIHk9IjEyMCIgZmlsbD0iI0YxNDM0MyIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyNiIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgdHJhbnNmb3JtPSJyb3RhdGUoOCA2NTAgMTIwKSI+4oiCz4gv4oiCdDwvdGV4dD4KICA8dGV4dCB4PSIxMDIwIiB5PSI4MCIgZmlsbD0iI0Q5NzcwNiIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyMyIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgdHJhbnNmb3JtPSJyb3RhdGUoLTUgMTAyMCA4MCkiPuKEjzwvdGV4dD4KICA8dGV4dCB4PSIzNTAiIHk9IjIwMCIgZmlsbD0iI0Q5NzcwNiIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyOSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgdHJhbnNmb3JtPSJyb3RhdGUoMTUgMzUwIDIwMCkiPuKIh8OXQjwvdGV4dD4KICA8dGV4dCB4PSI5MDAiIHk9IjI1MCIgZmlsbD0iIzBGNDc4MCIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIzNiIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgdHJhbnNmb3JtPSJyb3RhdGUoLTggOTAwIDI1MCkiPuKIqzwvdGV4dD4KICA8dGV4dCB4PSIxNTAiIHk9IjM0MCIgZmlsbD0iI0YxNDM0MyIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyMyIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgdHJhbnNmb3JtPSJyb3RhdGUoNiAxNTAgMzQwKSI+zrsgPSBoL3A8L3RleHQ+CiAgPHRleHQgeD0iNTUwIiB5PSIzODAiIGZpbGw9IiMwRjQ3ODAiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMjYiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRyYW5zZm9ybT0icm90YXRlKC0xMCA1NTAgMzgwKSI+zqM8L3RleHQ+CiAgPHRleHQgeD0iMTA1MCIgeT0iNDAwIiBmaWxsPSIjRDk3NzA2IiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjI5IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0cmFuc2Zvcm09InJvdGF0ZSgxMiAxMDUwIDQwMCkiPs6UeM6UcCDiiaUg4oSPLzI8L3RleHQ+CiAgPHRleHQgeD0iODAiIHk9IjUwMCIgZmlsbD0iI0Q5NzcwNiIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyOSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgdHJhbnNmb3JtPSJyb3RhdGUoLTYgODAgNTAwKSI+z4A8L3RleHQ+CiAgPHRleHQgeD0iNDAwIiB5PSI1NTAiIGZpbGw9IiNGMTQzNDMiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMjMiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRyYW5zZm9ybT0icm90YXRlKDkgNDAwIDU1MCkiPkYgPSBtYTwvdGV4dD4KICA8dGV4dCB4PSI3NTAiIHk9IjUyMCIgZmlsbD0iIzBGNDc4MCIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIzMiIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgdHJhbnNmb3JtPSJyb3RhdGUoLTE1IDc1MCA1MjApIj7iiILCsnUv4oiCdMKyPC90ZXh0PgogIDx0ZXh0IHg9IjIwMCIgeT0iNjgwIiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjI2IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0cmFuc2Zvcm09InJvdGF0ZSg0IDIwMCA2ODApIj7iiK4gRcK3ZGw8L3RleHQ+CiAgPHRleHQgeD0iNjAwIiB5PSI3MjAiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMjMiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRyYW5zZm9ybT0icm90YXRlKC03IDYwMCA3MjApIj7PiCh4LHQpPC90ZXh0PgogIDx0ZXh0IHg9IjEwMDAiIHk9IjY1MCIgZmlsbD0iI0YxNDM0MyIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyOSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgdHJhbnNmb3JtPSJyb3RhdGUoMTEgMTAwMCA2NTApIj7iiJ48L3RleHQ+CiAgPHRleHQgeD0iMTAwIiB5PSI4NTAiIGZpbGw9IiNGMTQzNDMiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMjkiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRyYW5zZm9ybT0icm90YXRlKC05IDEwMCA4NTApIj5p4oSP4oiCz4gv4oiCdCA9IMSkz4g8L3RleHQ+CiAgPHRleHQgeD0iNDgwIiB5PSI5MDAiIGZpbGw9IiMwRjQ3ODAiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRyYW5zZm9ybT0icm90YXRlKDcgNDgwIDkwMCkiPs6pPC90ZXh0PgogIDx0ZXh0IHg9Ijg1MCIgeT0iODcwIiBmaWxsPSIjRDk3NzA2IiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjIzIiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0cmFuc2Zvcm09InJvdGF0ZSgtMTMgODUwIDg3MCkiPuKIh8Kyz4Y8L3RleHQ+CiAgPHRleHQgeD0iMzAwIiB5PSIxMDUwIiBmaWxsPSIjRDk3NzA2IiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjI2IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0cmFuc2Zvcm09InJvdGF0ZSg1IDMwMCAxMDUwKSI+zrEgzrIgzrM8L3RleHQ+CiAgPHRleHQgeD0iNzAwIiB5PSIxMDgwIiBmaWxsPSIjRjE0MzQzIiBvcGFjaXR5PSIxIiBmb250LXNpemU9IjI5IiBmb250LWZhbWlseT0iR2VvcmdpYSwgc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIiB0cmFuc2Zvcm09InJvdGF0ZSgtOCA3MDAgMTA4MCkiPlMgPSBrIGxuIFc8L3RleHQ+CiAgPHRleHQgeD0iMTA4MCIgeT0iMTAwMCIgZmlsbD0iIzBGNDc4MCIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyOSIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgdHJhbnNmb3JtPSJyb3RhdGUoMTAgMTA4MCAxMDAwKSI+4oiCL+KIgng8L3RleHQ+CiAgPHRleHQgeD0iNTAiIHk9IjExNTAiIGZpbGw9IiMwRjQ3ODAiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMjMiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRyYW5zZm9ybT0icm90YXRlKC00IDUwIDExNTApIj7OvOKCgM614oKAPC90ZXh0PgogIDx0ZXh0IHg9IjU1MCIgeT0iMTE1MCIgZmlsbD0iI0YxNDM0MyIgb3BhY2l0eT0iMSIgZm9udC1zaXplPSIyNiIgZm9udC1mYW1pbHk9Ikdlb3JnaWEsIHNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgdHJhbnNmb3JtPSJyb3RhdGUoMTQgNTUwIDExNTApIj7PgTwvdGV4dD4KICA8dGV4dCB4PSI5NTAiIHk9IjExNTAiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiIGZvbnQtc2l6ZT0iMzIiIGZvbnQtZmFtaWx5PSJHZW9yZ2lhLCBzZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiIHRyYW5zZm9ybT0icm90YXRlKC0xMSA5NTAgMTE1MCkiPs6UPC90ZXh0PgoKICA8IS0tIFRpbnkgcGFydGljbGVzIC8gZG90cyAtLT4KICA8Y2lyY2xlIGN4PSIxMjAiIGN5PSIxMzAiIHI9IjMuNSIgZmlsbD0iIzBGNDc4MCIgb3BhY2l0eT0iMSIvPgogIDxjaXJjbGUgY3g9IjQ1MCIgY3k9IjkwIiByPSIyLjUiIGZpbGw9IiNGMTQzNDMiIG9wYWNpdHk9IjEiLz4KICA8Y2lyY2xlIGN4PSI3ODAiIGN5PSIxNzAiIHI9IjQiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiLz4KICA8Y2lyY2xlIGN4PSIzMDAiIGN5PSIzMDAiIHI9IjIuNSIgZmlsbD0iI0Q5NzcwNiIgb3BhY2l0eT0iMSIvPgogIDxjaXJjbGUgY3g9Ijk1MCIgY3k9IjMzMCIgcj0iMy41IiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIi8+CiAgPGNpcmNsZSBjeD0iNjAwIiBjeT0iNDUwIiByPSIyLjUiIGZpbGw9IiNGMTQzNDMiIG9wYWNpdHk9IjEiLz4KICA8Y2lyY2xlIGN4PSIxNjAiIGN5PSI2MDAiIHI9IjQiIGZpbGw9IiMwRjQ3ODAiIG9wYWNpdHk9IjEiLz4KICA8Y2lyY2xlIGN4PSI1MDAiIGN5PSI2NTAiIHI9IjIuNSIgZmlsbD0iI0Q5NzcwNiIgb3BhY2l0eT0iMSIvPgogIDxjaXJjbGUgY3g9Ijg1MCIgY3k9IjU4MCIgcj0iMy41IiBmaWxsPSIjRjE0MzQzIiBvcGFjaXR5PSIxIi8+CiAgPGNpcmNsZSBjeD0iMTEwMCIgY3k9IjU1MCIgcj0iMi41IiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIi8+CiAgPGNpcmNsZSBjeD0iMzMwIiBjeT0iNzgwIiByPSI0IiBmaWxsPSIjRDk3NzA2IiBvcGFjaXR5PSIxIi8+CiAgPGNpcmNsZSBjeD0iNzAwIiBjeT0iODAwIiByPSIyLjUiIGZpbGw9IiMwRjQ3ODAiIG9wYWNpdHk9IjEiLz4KICA8Y2lyY2xlIGN4PSIxMDUwIiBjeT0iNzgwIiByPSIzLjUiIGZpbGw9IiNGMTQzNDMiIG9wYWNpdHk9IjEiLz4KICA8Y2lyY2xlIGN4PSI4MCIgY3k9Ijk1MCIgcj0iMi41IiBmaWxsPSIjRjE0MzQzIiBvcGFjaXR5PSIxIi8+CiAgPGNpcmNsZSBjeD0iNDIwIiBjeT0iMTAwMCIgcj0iNCIgZmlsbD0iIzBGNDc4MCIgb3BhY2l0eT0iMSIvPgogIDxjaXJjbGUgY3g9Ijc1MCIgY3k9Ijk3MCIgcj0iMi41IiBmaWxsPSIjRDk3NzA2IiBvcGFjaXR5PSIxIi8+CiAgPGNpcmNsZSBjeD0iMTEwMCIgY3k9IjkwMCIgcj0iMy41IiBmaWxsPSIjRDk3NzA2IiBvcGFjaXR5PSIxIi8+CiAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTEwMCIgcj0iMi41IiBmaWxsPSIjMEY0NzgwIiBvcGFjaXR5PSIxIi8+CiAgPGNpcmNsZSBjeD0iNjUwIiBjeT0iMTEzMCIgcj0iNCIgZmlsbD0iI0YxNDM0MyIgb3BhY2l0eT0iMSIvPgogIDxjaXJjbGUgY3g9IjEwMDAiIGN5PSIxMTAwIiByPSIyLjUiIGZpbGw9IiNEOTc3MDYiIG9wYWNpdHk9IjEiLz4KPC9zdmc+');
      background-repeat: repeat;
      background-size: 820px 820px;
      opacity: 0.38;
      pointer-events: none;
      z-index: 1;
    }

    /* LINHAS GRADIENTE DE TOPO E BASE */
    .brand-gradient-line-top {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 35%, #F14343 70%, #FFCC00 100%);
      z-index: 50;
    }
    .brand-gradient-line-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 6px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 35%, #F14343 70%, #FFCC00 100%);
      z-index: 50;
    }

    /* 1. SEÇÃO DO HEADER (TÍTULO MOVIDO MAIS PARA BAIXO E AMPLIADO) */
    .header-section {
      position: relative;
      z-index: 30;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      width: 100%;
      padding-top: 80px;
      padding-left: 48px;
      padding-right: 48px;
    }

    /* TÍTULO AMPLIFICADO EM BUKRA */
    h1.hero-title {
      font-size: 84px;
      font-weight: 900;
      line-height: 1.12;
      color: #0F172A;
      letter-spacing: -1.8px;
      text-align: center;
      max-width: 1180px;
      margin: 0 auto 16px auto;
    }

    .palma-highlight {
      color: #D97706;
      font-weight: 900;
      display: inline-block;
      text-shadow: 0 2px 14px rgba(217, 119, 6, 0.28);
    }

    p.hero-subtitle {
      font-size: 25px;
      font-weight: 600;
      color: #475569;
      max-width: 1040px;
      line-height: 1.35;
      text-align: center;
      margin: 0 auto;
    }

    /* 2. CAMADA SVG DOS ESPIRROS DE TINTA */
    .splatters-svg-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 1240px;
      height: 1754px;
      pointer-events: none;
      z-index: 10;
      overflow: hidden;
    }

    /* 3. ÍCONE CENTRAL: ESTILO APP DE TELA INICIAL DE CELULAR (SQUIRCLE) */
    .center-app-icon-container {
      position: absolute;
      top: 855px;
      left: 620px;
      transform: translate(-50%, -50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 25;
    }

    .app-icon-squircle {
      width: 250px;
      height: 250px;
      border-radius: 56px;
      background: #FFFFFF;
      overflow: hidden;
      box-shadow: 
        0 24px 60px rgba(0, 0, 0, 0.24), 
        0 8px 20px rgba(0, 0, 0, 0.12),
        0 0 0 8px rgba(255, 255, 255, 0.85);
      border: 3px solid rgba(0, 0, 0, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .app-icon-squircle img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .app-icon-name {
      font-size: 26px;
      font-weight: 800;
      color: #0F172A;
      letter-spacing: -0.4px;
      margin-top: 14px;
      text-shadow: 0 1px 4px rgba(255, 255, 255, 0.95);
    }

    /* 4. CARDS DOS TRÊS EIXOS (EM CIMA DOS ESPIRROS DE TINTA) */
    .axis-splat-card {
      position: absolute;
      background: #FFFFFF;
      border-radius: 24px;
      padding: 20px 22px;
      box-shadow: 0 16px 36px -4px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.05);
      z-index: 20;
      width: 360px;
      height: 196px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
    }
    .axis-top-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .axis-icon-badge {
      width: 54px;
      height: 54px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .axis-card-title {
      font-size: 26px;
      font-weight: 900;
      line-height: 1.1;
    }
    .axis-card-desc {
      font-size: 16px;
      font-weight: 600;
      color: #334155;
      line-height: 1.30;
      margin-top: 8px;
      margin-bottom: 8px;
    }
    .axis-tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .axis-tag {
      font-size: 12.5px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: 9999px;
    }

    /* CARD SOCIAL (AZUL - SUPERIOR ESQUERDO) */
    .card-social-splat {
      top: 560px;
      left: 50px;
      border: 2.5px solid rgba(15, 71, 128, 0.25);
      border-top: 5px solid #0F4780;
    }
    .card-social-splat .axis-icon-badge {
      background: #EEF4FA;
      color: #0F4780;
      border: 1.5px solid rgba(15, 71, 128, 0.25);
    }
    .card-social-splat .axis-card-title { color: #0F4780; }
    .card-social-splat .axis-tag {
      background: #EEF4FA;
      color: #0F4780;
    }

    /* CARD INFORMATIVO (VERMELHO - SUPERIOR DIREITO) */
    .card-info-splat {
      top: 560px;
      right: 50px;
      border: 2.5px solid rgba(241, 67, 67, 0.25);
      border-top: 5px solid #F14343;
    }
    .card-info-splat .axis-icon-badge {
      background: #FEF2F2;
      color: #F14343;
      border: 1.5px solid rgba(241, 67, 67, 0.25);
    }
    .card-info-splat .axis-card-title { color: #F14343; }
    .card-info-splat .axis-tag {
      background: #FEF2F2;
      color: #F14343;
    }

    /* CARD FERRAMENTAS (AMARELO - INFERIOR ESQUERDO) */
    .card-tools-splat {
      top: 1140px;
      left: 50px;
      border: 2.5px solid rgba(255, 204, 0, 0.45);
      border-top: 5px solid #FFCC00;
    }
    .card-tools-splat .axis-icon-badge {
      background: #FEF9C3;
      color: #854D0E;
      border: 1.5px solid rgba(255, 204, 0, 0.45);
    }
    .card-tools-splat .axis-card-title { color: #854D0E; }
    .card-tools-splat .axis-tag {
      background: #FEF9C3;
      color: #854D0E;
    }

    /* 5. QR CODE ÚNICO SLIM (CANTO INFERIOR DIREITO) */
    .bottom-right-qr-clean {
      position: absolute;
      bottom: 50px;
      right: 50px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      z-index: 30;
    }
    .qr-code-box {
      width: 250px;
      height: 250px;
      background: #FFFFFF;
      padding: 12px;
      border-radius: 24px;
      border: 2.5px solid rgba(15, 71, 128, 0.20);
      box-shadow: 0 16px 36px -4px rgba(15, 71, 128, 0.16), 0 4px 12px rgba(0, 0, 0, 0.06);
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
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
      width: 68px;
      height: 68px;
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
    .qr-clean-link {
      font-size: 21px;
      font-weight: 800;
      color: #0F4780;
      text-decoration: underline;
      text-underline-offset: 4px;
      letter-spacing: -0.2px;
    }

    /* 6. NOTÍCIA INSTITUCIONAL NO CANTO INFERIOR ESQUERDO */
    .bottom-left-footer-box {
      position: absolute;
      bottom: 50px;
      left: 50px;
      width: 600px;
      height: 250px;
      background: #F8FAFC;
      border-radius: 24px;
      border: 1.5px solid #E2E8F0;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      z-index: 20;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
    }
    .footer-badge-line {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #0F4780;
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .footer-desc-text {
      font-size: 16.5px;
      line-height: 1.34;
      color: #334155;
    }
    .footer-actions-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .footer-tag-chip {
      background: #FFFFFF;
      border: 1.5px solid #CBD5E1;
      padding: 6px 14px;
      border-radius: 10px;
      font-size: 13.5px;
      font-weight: 700;
      color: #0F172A;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .footer-legal-copy {
      font-size: 12.5px;
      color: #64748B;
      font-weight: 600;
      border-top: 1px solid #E2E8F0;
      padding-top: 6px;
    }
  </style>
</head>
<body>

  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="brand-gradient-line-bottom"></div>
    <div class="bg-math-pattern"></div>

    <!-- 1. HEADER SECTION (SEM LOGO NO TOPO, TÍTULO DESCIDO E AMPLIADO) -->
    <header class="header-section">
      <h1 class="hero-title font-bukra">
        Entender a universidade está <span class="palma-highlight">à um clique de distância</span>
      </h1>

      <p class="hero-subtitle font-open-sans">
        A plataforma de comunicação científica e apoio da graduação do Instituto de Física da USP.
      </p>
    </header>

    <!-- 2. CAMADA SVG DOS ESPIRROS DE TINTA (SAINDO DE TRÁS DO ÍCONE CENTRAL) -->
    <svg class="splatters-svg-layer" viewBox="0 0 1240 1754" xmlns="http://www.w3.org/2000/svg">
      ${splashesSvg}
    </svg>

    <!-- 3. ÍCONE CENTRAL NO ESTILO DE APP NA TELA INICIAL DO CELULAR -->
    <div class="center-app-icon-container">
      <div class="app-icon-squircle">
        <img src="icons/icone-HUBLabDiv-white.png" alt="HUB LabDiv App" />
      </div>
      <span class="app-icon-name font-open-sans">HUB LabDiv</span>
    </div>

    <!-- 4. EIXO SOCIAL (EM CIMA DO ESPIRRO AZUL) -->
    <div class="axis-splat-card card-social-splat">
      <div>
        <div class="axis-top-header">
          <div class="axis-icon-badge">
            <svg width="30" height="30" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/>
            </svg>
          </div>
          <h2 class="axis-card-title font-bukra">Social</h2>
        </div>
        <p class="axis-card-desc font-open-sans">Rede comunicativa e pedagógica para conectar estudantes e pesquisadores.</p>
      </div>
      <div class="axis-tags-row font-bukra">
        <span class="axis-tag">#Comunidades</span>
        <span class="axis-tag">#GruposDeEstudo</span>
        <span class="axis-tag">#Feed</span>
      </div>
    </div>

    <!-- 4. EIXO INFORMATIVO (EM CIMA DO ESPIRRO VERMELHO) -->
    <div class="axis-splat-card card-info-splat">
      <div>
        <div class="axis-top-header">
          <div class="axis-icon-badge">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <h2 class="axis-card-title font-bukra">Informativo</h2>
        </div>
        <p class="axis-card-desc font-open-sans">Enciclopédia acadêmica interativa e acervo de matérias da graduação.</p>
      </div>
      <div class="axis-tags-row font-bukra">
        <span class="axis-tag">#Artigos</span>
        <span class="axis-tag">#WikiIFUSP</span>
        <span class="axis-tag">#HistóriaDaCiência</span>
      </div>
    </div>

    <!-- 4. EIXO FERRAMENTAS (EM CIMA DO ESPIRRO AMARELO) -->
    <div class="axis-splat-card card-tools-splat">
      <div>
        <div class="axis-top-header">
          <div class="axis-icon-badge">
            <svg width="30" height="30" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z"/>
            </svg>
          </div>
          <h2 class="axis-card-title font-bukra">Ferramentas</h2>
        </div>
        <p class="axis-card-desc font-open-sans">Utilidades para a rotina universitária: simuladores, notas e cronogramas.</p>
      </div>
      <div class="axis-tags-row font-bukra">
        <span class="axis-tag">#Simuladores</span>
        <span class="axis-tag">#Calculadoras</span>
        <span class="axis-tag">#ApoioEstudantil</span>
      </div>
    </div>

    <!-- 5. O QR CODE ÚNICO NO CANTO INFERIOR DIREITO (SLIM & DIRETO) -->
    <div class="bottom-right-qr-clean">
      <div class="qr-code-box">
        ${qrSvg}
        <div class="qr-center-badge-img">
          <img src="icons/qr-hub-logo-badge.png" alt="HUB Badge" />
        </div>
      </div>
      <a class="qr-clean-link font-bukra" href="https://hub.labdiv.com.br/divulgacao">hub.labdiv.com.br/divulgacao</a>
    </div>

    <!-- 6. NOTÍCIA INSTITUCIONAL NO CANTO INFERIOR ESQUERDO -->
    <div class="bottom-left-footer-box">
      <div>
        <div class="footer-badge-line font-bukra">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
          <span>SEGURANÇA &amp; CÓDIGO ABERTO (AGPLv3)</span>
        </div>
        <p class="footer-desc-text font-open-sans">
          O <strong>HUB LabDiv</strong> é uma iniciativa pública de software livre desenvolvida pelo <strong>Laboratório de Expressão e Divulgação Científica do IFUSP</strong> para a comunidade acadêmica.
        </p>
      </div>

      <div class="footer-actions-row font-bukra">
        <div class="footer-tag-chip">
          <span>GitHub: github.com/HUB-LabDiv</span>
        </div>
        <div class="footer-tag-chip">
          <span>E-mail: hublabdiv@gmail.com</span>
        </div>
      </div>

      <div class="footer-legal-copy font-bukra">
        <span>Licença AGPLv3 &bull; HUB LabDiv &bull; Instituto de Física da Universidade de São Paulo</span>
      </div>
    </div>
  </div>

</body>
</html>
`;

  fs.writeFileSync(HTML_PATH, htmlContent, 'utf-8');
  console.log(`✅ Arquivo HTML gerado em: ${HTML_PATH}`);

  // 2. Render to PNG using Puppeteer at 300 DPI (2480x3508 px)
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

  const outPngPath = path.join(POSTER4_DIR, 'poster.png');
  await page.screenshot({
    path: outPngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Poster 4 em alta resolução (300 DPI) gerado em: ${outPngPath}`);

  // Preview PNG (menor resolução para visualização rápida)
  const previewPage = await browser.newPage();
  await previewPage.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 0.5 });
  await previewPage.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });
  await previewPage.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 500));
  const previewPath = path.join(POSTER4_DIR, 'poster_preview.png');
  await previewPage.screenshot({
    path: previewPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Preview do Poster 4 gerado em: ${previewPath}`);

  // Copy to active artifacts directory
  const activeArtifactsDir = (process.env.ARTIFACTS_DIR || './artifacts');
  if (fs.existsSync(activeArtifactsDir)) {
    fs.copyFileSync(outPngPath, path.join(activeArtifactsDir, 'poster4.png'));
    fs.copyFileSync(previewPath, path.join(activeArtifactsDir, 'poster4_preview.png'));
    console.log(`✅ Deliverables copiados para artifacts dir: ${activeArtifactsDir}`);
  }

  await browser.close();
  console.log('🎉 Poster 4 atualizado com sucesso!');
}

main().catch(err => {
  console.error('❌ Erro na geração:', err);
  process.exit(1);
});
