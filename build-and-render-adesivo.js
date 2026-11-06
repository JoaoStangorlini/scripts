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
const ADESIVO_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/adesivo qrcode');
const HTML_PATH = path.join(ADESIVO_DIR, 'adesivo.html');
const PNG_PATH = path.join(ADESIVO_DIR, 'adesivo.png');
const ARTIFACT_DIR = (process.env.ARTIFACTS_DIR || './artifacts');

async function main() {
  console.log('🔄 Gerando Adesivo QR Code em Preto e Branco...');

  // 1. Gerar QR code SVG com nível máximo de correção de erro 'H' (30% de redundância)
  const qrSvgRaw = await QRCode.toString('https://hub.labdiv.com.br/divulgacao', {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1
  });
  const qrSvg = qrSvgRaw.replace(/<\?xml[^>]*\?>/gi, '').trim();

  // 2. Capelo Oficial LabDiv em Preto e Branco (Vetor Puro de Alto Contraste)
  const capeloBwSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
    <!-- Signal Waves (Preto Puro) -->
    <g stroke="#000000" stroke-linecap="round" fill="none">
      <g stroke-width="20">
        <path d="M 53 225 C 27 168 27 104 53 50" />
        <path d="M 94 196 C 72 157 72 109 94 72" />
        <path d="M 138 183 C 120 153 120 118 138 88" />
        <path d="M 178 165 C 164 145 164 125 178 105" />
        <path d="M 210 110 C 235 92 277 92 302 110" />
        <path d="M 224 128 C 242 114 270 114 288 128" />
        <path d="M 238 146 C 248 136 264 136 274 146" stroke-width="17" />
        <path d="M 334 165 C 348 145 348 125 334 105" />
        <path d="M 374 183 C 392 153 392 118 374 88" />
        <path d="M 418 196 C 440 157 440 109 418 72" />
        <path d="M 459 225 C 485 168 485 104 459 50" />
      </g>
    </g>

    <!-- Base do Capelo (Preto Puro) -->
    <g>
      <path d="M 120 300 L 120 355 C 120 430, 392 430, 392 355 L 392 300 Z" fill="#000000" stroke="#000000" stroke-width="6" stroke-linejoin="round" />
    </g>

    <!-- Superfície do Capelo com bisel branco nítido -->
    <g>
      <path d="M 276 175 L 456 260 Q 476 270 456 280 L 276 365 Q 256 375 236 365 L 56 280 Q 36 270 56 260 L 236 175 Q 256 165 276 175 Z"
            fill="#000000" stroke="#000000" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" />
      <!-- Destaque / Vértice Branco no topo -->
      <path d="M 56 270 L 236 183 Q 256 173 276 183 L 456 270" fill="none" stroke="#FFFFFF" stroke-width="10" stroke-linecap="round" />
    </g>

    <!-- Cordão e Borla (Preto com contorno branco para contraste) -->
    <g stroke-linejoin="round" stroke-linecap="round">
      <polygon points="57,270 73,277 73,321 57,321" fill="#000000" stroke="#FFFFFF" stroke-width="4" />
      <path d="M 49 346 L 39 408 Q 65 420 91 408 L 81 346 Z" fill="#000000" stroke="#FFFFFF" stroke-width="5" />
      <circle cx="65" cy="335" r="16" fill="#000000" stroke="#FFFFFF" stroke-width="5" />
    </g>
  </svg>`;

  // 3. Montar HTML da Folha A4 com 4 Adesivos
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
    <title>Adesivos QR Code HUB LabDiv - P&amp;B</title>
    <link rel="stylesheet" href="../fonts/fonts.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@600;700;800&family=Outfit:wght@700;900&display=swap" rel="stylesheet">
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
        .font-bukra { font-family: '29LT Bukra', 'Outfit', sans-serif; }
        .font-open-sans { font-family: 'Open Sans', sans-serif; }

        body {
            background-color: #FFFFFF;
            width: 2480px;
            height: 3508px;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            color: #000000;
        }

        .a4-sheet {
            width: 2480px;
            height: 3508px;
            background: #FFFFFF;
            padding: 130px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 120px;
            box-sizing: border-box;
        }

        .sticker {
            border: 18px solid #000000;
            border-radius: 95px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 65px;
            padding: 60px 50px;
            box-sizing: border-box;
            background: #FFFFFF;
            color: #000000;
            position: relative;
        }

        .sticker-title {
            font-size: 118px;
            font-weight: 900;
            text-align: center;
            line-height: 1.12;
            color: #000000;
            letter-spacing: -1.2px;
        }

        .qr-wrapper {
            position: relative;
            width: 830px;
            height: 830px;
            background: #FFFFFF;
            padding: 26px;
            border-radius: 68px;
            border: 18px solid #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }

        .qr-svg-container {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .qr-svg-container svg {
            width: 100%;
            height: 100%;
            display: block;
        }

        .qr-center-badge {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 200px;
            height: 200px;
            background: #FFFFFF;
            border: 9px solid #000000;
            border-radius: 42px;
            padding: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.18);
        }

        .qr-center-badge svg {
            width: 100%;
            height: 100%;
            display: block;
        }
    </style>
</head>
<body>

    <div class="a4-sheet">
        <!-- Sticker 1 -->
        <div class="sticker">
            <h1 class="sticker-title font-bukra">Já conhece o<br>HUB LabDiv?</h1>
            <div class="qr-wrapper">
                <div class="qr-svg-container">
                    ${qrSvg}
                </div>
                <div class="qr-center-badge">
                    ${capeloBwSvg}
                </div>
            </div>
        </div>

        <!-- Sticker 2 -->
        <div class="sticker">
            <h1 class="sticker-title font-bukra">Já conhece o<br>HUB LabDiv?</h1>
            <div class="qr-wrapper">
                <div class="qr-svg-container">
                    ${qrSvg}
                </div>
                <div class="qr-center-badge">
                    ${capeloBwSvg}
                </div>
            </div>
        </div>

        <!-- Sticker 3 -->
        <div class="sticker">
            <h1 class="sticker-title font-bukra">Já conhece o<br>HUB LabDiv?</h1>
            <div class="qr-wrapper">
                <div class="qr-svg-container">
                    ${qrSvg}
                </div>
                <div class="qr-center-badge">
                    ${capeloBwSvg}
                </div>
            </div>
        </div>

        <!-- Sticker 4 -->
        <div class="sticker">
            <h1 class="sticker-title font-bukra">Já conhece o<br>HUB LabDiv?</h1>
            <div class="qr-wrapper">
                <div class="qr-svg-container">
                    ${qrSvg}
                </div>
                <div class="qr-center-badge">
                    ${capeloBwSvg}
                </div>
            </div>
        </div>
    </div>

</body>
</html>`;

  fs.writeFileSync(HTML_PATH, htmlContent, 'utf8');
  console.log(`✅ Arquivo ${HTML_PATH} atualizado com sucesso!`);

  // 4. Renderizar PNG a 300 DPI (2480 x 3508)
  console.log('🚀 Renderizando Adesivos em alta resolução (2480x3508)...');
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: {
      width: 2480,
      height: 3508,
      deviceScaleFactor: 1
    },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 2480, height: 3508, deviceScaleFactor: 1 });
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({
    path: PNG_PATH,
    type: 'png',
    clip: { x: 0, y: 0, width: 2480, height: 3508 }
  });
  console.log(`✅ Adesivo PNG gerado em: ${PNG_PATH}`);

  // Preview para o agente
  if (fs.existsSync(ARTIFACT_DIR)) {
    const previewPath = path.join(ARTIFACT_DIR, 'adesivo_preview.png');
    await page.screenshot({
      path: previewPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 2480, height: 3508 }
    });
    console.log(`✅ Preview do adesivo salvo em: ${previewPath}`);
  }

  await browser.close();
  console.log('🎉 Adesivos P&B gerados com perfeição!');
}

main().catch(err => {
  console.error('❌ Erro no script de adesivos:', err);
  process.exit(1);
});
