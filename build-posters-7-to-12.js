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
const POSTERS_ROOT = path.join(PROJECT_ROOT, 'public/divulgacao/posters');
const ARTIFACTS_DIR = (process.env.ARTIFACTS_DIR || './artifacts');

async function main() {
  console.log('🎨 Iniciando geração das 6 Propostas de Design Únicas (Posters 7 a 12)...');
  console.log('🎯 Modelo: 1) Logo HUB em Destaque Máximo -> 2) Chamada/Título em Segundo Plano -> 3) Eixos & QR Code em Terceiro');

  // 1. Preparar assets base embutidos (100% self-contained)
  const bgIfSvg = fs.readFileSync(path.join(PROJECT_ROOT, 'public/bg-if.svg'), 'utf8');
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

  const hubIconSvg = fs.readFileSync(path.join(PROJECT_ROOT, 'public/icone-HUBLabDiv.svg'), 'utf8')
    .replace(/<\?xml[^>]*\?>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim();

  // QR Code base
  const qrSvg = await QRCode.toString('https://hub.labdiv.com.br/divulgacao', {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1
  });

  // Versão com IDs únicos para o QR code (evita colisão de IDs de gradiente no SVG)
  const hubIconQrSvg = hubIconSvg
    .replace(/id="([^"]+)"/g, 'id="$1_qr"')
    .replace(/url\(#([^)]+)\)/g, 'url(#$1_qr)');

  // Bloco institucional padronizado oficial (AGPLv3 & Conformidade Legal)
  function renderInstitutionalBox() {
    return `
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
    `;
  }

  function renderQrBox(color = '#0F4780') {
    return `
      <div class="bottom-qr-col">
        <div class="qr-code-box" style="border-color: ${color}40;">
          ${qrSvg}
          <div class="qr-center-badge-img">
            ${hubIconQrSvg}
          </div>
        </div>
        <a class="qr-clean-link font-bukra" style="color: ${color};" href="https://hub.labdiv.com.br/divulgacao">hub.labdiv.com.br/divulgacao</a>
      </div>
    `;
  }

  // Definições de Estilo CSS Compartilhado
  const baseHead = (title) => `
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
      background-color: #FFFFFF;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .bg-math-pattern {
      position: absolute;
      top: 0; left: 0;
      width: 1240px; height: 1754px;
      background-image: url('data:image/svg+xml;base64,${bgIfBase64}');
      background-repeat: repeat;
      background-size: 1100px 1100px;
      opacity: 0.52;
      pointer-events: none;
      z-index: 1;
    }
    .brand-gradient-line-top {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 6px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 35%, #F14343 70%, #FFCC00 100%);
      z-index: 50;
    }

    /* Rodapé institucional padrão */
    .bottom-third-plane {
      position: absolute;
      bottom: 45px; left: 45px; right: 45px;
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
    }
    .qr-code-box {
      width: 320px; height: 320px;
      background: #FFFFFF;
      padding: 14px;
      border-radius: 28px;
      border: 2.5px solid rgba(15, 71, 128, 0.20);
      box-shadow: 0 18px 40px -4px rgba(15, 71, 128, 0.16), 0 4px 14px rgba(0, 0, 0, 0.06);
      position: relative;
      display: flex; align-items: center; justify-content: center;
    }
    .qr-code-box svg { width: 100%; height: 100%; display: block; }
    .qr-center-badge-img {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 78px; height: 78px;
      display: flex; align-items: center; justify-content: center;
      background: #FFFFFF;
      border-radius: 12px;
      padding: 3px;
    }
    .qr-center-badge-img svg { width: 100%; height: 100%; display: block; }
    .qr-clean-link {
      font-size: 23px; font-weight: 800; color: #0F4780;
      text-decoration: underline; text-underline-offset: 4px;
      background: rgba(255, 255, 255, 0.94);
      padding: 4px 18px;
      border-radius: 999px;
      border: 1.5px solid rgba(15, 71, 128, 0.16);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      white-space: nowrap;
    }


    .bottom-inst-box {
      flex: 1; height: 320px;
      background: #F8FAFC;
      border-radius: 28px;
      border: 2px solid #E2E8F0;
      padding: 26px 30px 22px 30px;
      display: flex; flex-direction: column; justify-content: space-between;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.05);
    }
    .inst-badge-line {
      display: flex; align-items: center; gap: 10px;
      color: #0F4780; font-size: 18px; font-weight: 800;
      margin-bottom: 8px;
    }
    .inst-desc-text {
      font-size: 18px; line-height: 1.45; color: #334155;
    }
    .inst-actions-row { display: flex; align-items: center; gap: 16px; }
    .inst-action-card {
      flex: 1; background: #FFFFFF; border: 1.5px solid #CBD5E1;
      padding: 10px 14px; border-radius: 14px;
      display: flex; align-items: center; gap: 12px;
    }
    .inst-action-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .inst-action-icon.git-icon { background: #EEF4FA; color: #0F4780; }
    .inst-action-icon.email-icon { background: #FEF2F2; color: #F14343; }
    .inst-action-details { display: flex; flex-direction: column; gap: 3px; }
    .inst-action-tag { font-size: 13px; font-weight: 800; text-transform: uppercase; }
    .inst-action-tag.tag-git { color: #0F4780; }
    .inst-action-tag.tag-email { color: #F14343; }
    .inst-action-val { font-size: 16px; font-weight: 700; color: #0F172A; white-space: nowrap; }
    .inst-legal-copy {
      font-size: 15px; color: #64748B; font-weight: 600;
      border-top: 1.5px solid #E2E8F0; padding-top: 12px; text-align: center;
    }
  </style>
  `;

  // =========================================================================
  // PROPOSTA 7: "The Orbital Gravity Core" (Sistema Orbital Dinâmico com Núcleo Hero)
  // =========================================================================
  const htmlPoster7 = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${baseHead('HUB LabDiv - Proposta 7: Orbital Core')}
  <style>
    /* 1. TOPO: CHAMADA / TÍTULO EM SEGUNDO PLANO */
    .p7-header {
      position: relative; z-index: 25;
      text-align: center; padding-top: 95px; padding-left: 40px; padding-right: 40px;
    }
    .p7-badge {
      display: inline-flex; align-items: center; gap: 8px;
      background: #EEF4FA; border: 1.5px solid rgba(15, 71, 128, 0.22);
      border-radius: 9999px; padding: 6px 20px; margin-bottom: 16px;
      color: #0F4780; font-size: 13px; font-weight: 800; text-transform: uppercase;
    }
    .p7-title {
      font-size: 82px; font-weight: 900; line-height: 1.12; color: #0F172A;
      letter-spacing: -1.5px; margin-bottom: 12px;
    }
    .p7-title span { color: #0F4780; }
    .p7-subtitle {
      font-size: 23px; font-weight: 600; color: #475569; max-width: 980px; margin: 0 auto;
    }

    /* 2. CENTRO: O ÍCONE HERO É O DESTAQUE MÁXIMO ABSOLUTO */
    .p7-orbital-zone {
      position: absolute; top: 715px; left: 0; width: 1240px; height: 800px; z-index: 20;
    }
    .p7-hero-podium {
      position: absolute; top: 70px; left: 50%; transform: translateX(-50%);
      display: flex; flex-direction: column; align-items: center; z-index: 30;
    }
    .p7-hero-shield {
      width: 330px; height: 330px; background: #FFFFFF;
      border-radius: 75px; border: 4px solid rgba(15, 71, 128, 0.18);
      box-shadow: 0 35px 75px -10px rgba(15, 71, 128, 0.32), 0 10px 25px rgba(0,0,0,0.08);
      display: flex; align-items: center; justify-content: center; padding: 25px;
    }
    .p7-hero-shield svg { width: 245px; height: 245px; transform: translate(14px, -16px); }
    .p7-hero-name {
      margin-top: 24px; font-size: 58px; font-weight: 900; color: #0F172A; letter-spacing: -1px;
    }
    .p7-hero-name span {
      background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #D97706 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }

    /* 3. TERCEIRO PLANO: OS 3 EIXOS ORBITANDO O NÚCLEO */
    .p7-card {
      position: absolute; background: #FFFFFF; border-radius: 22px;
      padding: 18px 22px; box-sizing: border-box; z-index: 15;
    }
    .p7-card-social {
      top: 130px; left: 50px; width: 320px;
      border: 2.5px solid rgba(15, 71, 128, 0.25); border-top: 6px solid #0F4780;
      box-shadow: 0 18px 36px rgba(15, 71, 128, 0.12);
    }
    .p7-card-info {
      top: 130px; right: 50px; width: 320px;
      border: 2.5px solid rgba(241, 67, 67, 0.25); border-top: 6px solid #F14343;
      box-shadow: 0 18px 36px rgba(241, 67, 67, 0.12);
    }
    .p7-card-tools {
      top: -150px; left: 50%; transform: translateX(-50%); width: 320px;
      border: 2.5px solid rgba(255, 204, 0, 0.45); border-top: 6px solid #FFCC00;
      box-shadow: 0 18px 36px rgba(217, 119, 6, 0.15);
    }
    .p7-card-title { font-size: 24px; font-weight: 900; margin-bottom: 6px; }
    .p7-card-desc { font-size: 15px; font-weight: 600; color: #334155; line-height: 1.35; }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="bg-math-pattern"></div>

    <!-- SEGUNDO PLANO: CHAMADA / TÍTULO -->
    <header class="p7-header">
      <div class="p7-badge font-bukra">IFUSP &bull; Laboratório de Expressão e Divulgação da Ciência</div>
      <h1 class="p7-title font-bukra">Entender a universidade está<br><span>à um clique de distância</span></h1>
      <p class="p7-subtitle font-open-sans">A plataforma de comunicação científica e apoio acadêmico que une os estudantes de física.</p>
    </header>

    <!-- PLANO 1 (HERO DESTAQUE MÁXIMO): ÍCONE DO HUB -->
    <div class="p7-orbital-zone">
      <svg style="position: absolute; width: 100%; height: 100%; pointer-events: none;" viewBox="0 0 1240 800">
        <circle cx="620" cy="235" r="240" fill="none" stroke="#0F4780" stroke-width="1.8" stroke-dasharray="6 6" opacity="0.35" />
        <circle cx="620" cy="235" r="350" fill="none" stroke="#F14343" stroke-width="1.4" stroke-dasharray="5 7" opacity="0.25" />
        <path d="M 450 235 L 370 215" stroke="#0F4780" stroke-width="2.5" stroke-dasharray="4 4" opacity="0.6" />
        <path d="M 790 235 L 870 215" stroke="#F14343" stroke-width="2.5" stroke-dasharray="4 4" opacity="0.6" />
        <path d="M 620 70 L 620 -15" stroke="#D97706" stroke-width="2.5" stroke-dasharray="4 4" opacity="0.6" />
      </svg>

      <div class="p7-hero-podium">
        <div class="p7-hero-shield">
          ${hubIconSvg}
        </div>
        <div class="p7-hero-name font-bukra">HUB <span>LabDiv</span></div>
      </div>

      <!-- TERCEIRO PLANO: OS 3 EIXOS -->
      <div class="p7-card p7-card-social">
        <h3 class="p7-card-title font-bukra" style="color: #0F4780;">Eixo Social</h3>
        <p class="p7-card-desc font-open-sans">Rede pedagógica para conectar estudantes, grupos de estudo e docentes do IFUSP.</p>
      </div>

      <div class="p7-card p7-card-info">
        <h3 class="p7-card-title font-bukra" style="color: #F14343;">Eixo Informativo</h3>
        <p class="p7-card-desc font-open-sans">Enciclopédia acadêmica interativa, histórico da ciência e acervo oficial das matérias.</p>
      </div>

      <div class="p7-card p7-card-tools">
        <h3 class="p7-card-title font-bukra" style="color: #854D0E;">Eixo Ferramentas</h3>
        <p class="p7-card-desc font-open-sans">Simuladores numéricos, calculadoras interativas e utilitários acadêmicos para a rotina universitária.</p>
      </div>
    </div>

    <!-- TERCEIRO PLANO: QR CODE & SEGURANÇA -->
    <div class="bottom-third-plane">
      ${renderQrBox('#0F4780')}
      ${renderInstitutionalBox()}
    </div>
  </div>
</body>
</html>`;

  // =========================================================================
  // PROPOSTA 8: "The Monumental Pillar & Tri-Column Grid" (Monólito Hero Superior & Colunas Verticais)
  // =========================================================================
  const htmlPoster8 = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${baseHead('HUB LabDiv - Proposta 8: Monumental Pillar')}
  <style>
    /* 1. PLANO 1 (HERO DESTAQUE MÁXIMO): LOGO DO HUB MONUMENTAL NO TOPO */
    .p8-hero-zone {
      position: relative; z-index: 30;
      display: flex; flex-direction: column; align-items: center;
      padding-top: 365px;
    }
    .p8-hero-box {
      width: 360px; height: 360px; background: #FFFFFF;
      border-radius: 80px; border: 4px solid rgba(15, 71, 128, 0.22);
      box-shadow: 0 40px 85px -12px rgba(15, 71, 128, 0.35), 0 12px 30px rgba(0,0,0,0.09);
      display: flex; align-items: center; justify-content: center; padding: 28px;
    }
    .p8-hero-box svg { width: 280px; height: 280px; }

    /* 2. PLANO 2 (SEGUNDO PLANO): CHAMADA / TÍTULO LOGO ABAIXO DO ÍCONE */
    .p8-headline-zone {
      position: relative; z-index: 25; text-align: center; margin-top: 28px;
      padding-left: 40px; padding-right: 40px;
    }
    .p8-title {
      font-size: 78px; font-weight: 900; line-height: 1.10; color: #0F172A; letter-spacing: -1.6px;
    }
    .p8-title-grad {
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 50%, #F14343 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .p8-subtitle {
      font-size: 23px; font-weight: 600; color: #475569; margin-top: 10px; max-width: 1000px; margin-left: auto; margin-right: auto;
    }

    /* 3. PLANO 3 (TERCEIRO PLANO): 3 COLUNAS VERTICAIS LADO A LADO */
    .p8-tri-grid {
      position: relative; z-index: 20;
      display: flex; justify-content: space-between; gap: 24px;
      margin: 36px 45px 0 45px;
    }
    .p8-col-card {
      flex: 1; background: #FFFFFF; border-radius: 24px; padding: 22px 20px;
      box-shadow: 0 16px 36px rgba(0,0,0,0.06); display: flex; flex-direction: column; gap: 8px;
    }
    .p8-col-card.social { border: 2px solid rgba(15, 71, 128, 0.25); border-top: 6px solid #0F4780; }
    .p8-col-card.info { border: 2px solid rgba(241, 67, 67, 0.25); border-top: 6px solid #F14343; }
    .p8-col-card.tools { border: 2px solid rgba(255, 204, 0, 0.45); border-top: 6px solid #FFCC00; }
    .p8-col-title { font-size: 24px; font-weight: 900; }
    .p8-col-desc { font-size: 15px; font-weight: 600; color: #334155; line-height: 1.4; }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="bg-math-pattern"></div>

    <!-- PLANO 1 (HERO DESTAQUE MÁXIMO): LOGO DO HUB -->
    <div class="p8-hero-zone">
      <div class="p8-hero-box">
        ${hubIconSvg}
      </div>
    </div>

    <!-- PLANO 2 (SEGUNDO PLANO): CHAMADA / TÍTULO -->
    <div class="p8-headline-zone">
      <h1 class="p8-title font-bukra">
        A Plataforma Oficial<br><span class="p8-title-grad">da Graduação da USP</span>
      </h1>
      <p class="p8-subtitle font-open-sans">
        O ambiente completo de apoio acadêmico, ciência aberta e colaboração universitária.
      </p>
    </div>

    <!-- PLANO 3 (TERCEIRO PLANO): OS 3 EIXOS EM GRID MODULAR -->
    <div class="p8-tri-grid">
      <div class="p8-col-card social">
        <h3 class="p8-col-title font-bukra" style="color: #0F4780;">1. Social</h3>
        <p class="p8-col-desc font-open-sans">Conexão direta entre estudantes, grupos de estudos e docentes da física.</p>
      </div>
      <div class="p8-col-card info">
        <h3 class="p8-col-title font-bukra" style="color: #F14343;">2. Informativo</h3>
        <p class="p8-col-desc font-open-sans">Histórico da ciência, enciclopédia acadêmica e banco de materiais didáticos.</p>
      </div>
      <div class="p8-col-card tools">
        <h3 class="p8-col-title font-bukra" style="color: #854D0E;">3. Ferramentas</h3>
        <p class="p8-col-desc font-open-sans">Simuladores numéricos, calculadoras de física e utilitários para acelerar o curso.</p>
      </div>
    </div>

    <!-- PLANO 3 (TERCEIRO PLANO): QR CODE & SEGURANÇA -->
    <div class="bottom-third-plane">
      ${renderQrBox('#0F4780')}
      ${renderInstitutionalBox()}
    </div>
  </div>
</body>
</html>`;

  // =========================================================================
  // PROPOSTA 9: "The Scientific Prism / Triangular Symmetry" (Prisma Óptico & Feixes Geométricos)
  // =========================================================================
  const htmlPoster9 = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${baseHead('HUB LabDiv - Proposta 9: Scientific Prism')}
  <style>
    /* 1. LAYOUT ASIMÉTRICO (SPLIT LEFT/RIGHT) */
    .p9-layout {
      position: absolute; top: 110px; left: 65px; right: 65px; height: 1220px;
      display: flex; gap: 50px; z-index: 20;
    }

    /* COLUNA ESQUERDA: TÍTULO, SUBTÍTULO E ÍCONE GIGANTE */
    .p9-left {
      flex: 1.1; display: flex; flex-direction: column; z-index: 20;
    }
    .p9-badge {
      display: inline-flex; align-items: center; justify-content: center;
      background: #0F4780; color: #FFFFFF; border-radius: 9999px; padding: 12px 26px;
      font-size: 16px; font-weight: 800; text-transform: uppercase; align-self: flex-start;
      margin-bottom: 35px;
    }
    .p9-title {
      font-size: 88px; font-weight: 900; line-height: 1.05; color: #0F172A; letter-spacing: -2px;
      margin-bottom: 26px;
    }
    .p9-title span { color: #F14343; }
    .p9-subtitle {
      font-size: 26px; font-weight: 600; color: #475569; line-height: 1.45; max-width: 500px;
    }
    .p9-hero-icon {
      margin-top: 50px; margin-bottom: auto;
      width: 540px; height: 540px;
      background: #FFFFFF; border-radius: 65px;
      border: 4px solid rgba(15, 71, 128, 0.12);
      box-shadow: 0 40px 80px rgba(15, 71, 128, 0.15);
      display: flex; align-items: center; justify-content: center;
    }
    .p9-hero-icon svg { width: 420px; height: 420px; }

    /* COLUNA DIREITA: STACK DE CARDS VERTICAIS */
    .p9-right {
      flex: 0.9; display: flex; flex-direction: column; gap: 40px; justify-content: flex-end;
      padding-bottom: 40px; z-index: 20;
    }
    .p9-stack-card {
      background: #FFFFFF; border-radius: 26px; padding: 35px 35px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.06);
      display: flex; flex-direction: column; justify-content: center;
      position: relative; overflow: hidden;
    }
    .p9-stack-card::before {
      content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 14px;
    }
    .p9-card-social { border: 2.5px solid rgba(15, 71, 128, 0.2); }
    .p9-card-social::before { background: #0F4780; }
    .p9-card-info { border: 2.5px solid rgba(241, 67, 67, 0.2); }
    .p9-card-info::before { background: #F14343; }
    .p9-card-tools { border: 2.5px solid rgba(255, 204, 0, 0.4); }
    .p9-card-tools::before { background: #FFCC00; }
    
    .p9-card-title { font-size: 30px; font-weight: 900; margin-bottom: 10px; }
    .p9-card-social .p9-card-title { color: #0F4780; }
    .p9-card-info .p9-card-title { color: #F14343; }
    .p9-card-tools .p9-card-title { color: #854D0E; }
    
    .p9-card-desc { font-size: 19px; font-weight: 600; color: #334155; line-height: 1.45; }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="bg-math-pattern"></div>

    <div class="p9-layout">
      <!-- ESQUERDA -->
      <div class="p9-left">
        <div class="p9-badge font-bukra">Comunicação Científica</div>
        <h1 class="p9-title font-bukra">A Plataforma<br>Oficial da<br><span>USP</span></h1>
        <p class="p9-subtitle font-open-sans">Acesse todo o histórico da ciência, matérias detalhadas e ferramentas de estudo em um só lugar.</p>
        
        <div class="p9-hero-icon">
          ${hubIconSvg}
        </div>
      </div>
      
      <!-- DIREITA -->
      <div class="p9-right">
        <div class="p9-stack-card p9-card-social">
          <h3 class="p9-card-title font-bukra">1. Eixo Social</h3>
          <p class="p9-card-desc font-open-sans">Espaço de diálogo, compartilhamento de experiências e conexão viva entre as turmas.</p>
        </div>

        <div class="p9-stack-card p9-card-info">
          <h3 class="p9-card-title font-bukra">2. Eixo Informativo</h3>
          <p class="p9-card-desc font-open-sans">O repositório completo da física: artigos, história da ciência e resumos das disciplinas.</p>
        </div>

        <div class="p9-stack-card p9-card-tools">
          <h3 class="p9-card-title font-bukra">3. Ferramentas</h3>
          <p class="p9-card-desc font-open-sans">Simuladores interativos e calculadoras científicas projetadas para laboratórios e provas.</p>
        </div>
      </div>
    </div>

    <!-- TERCEIRO PLANO: QR CODE & SEGURANÇA -->
    <div class="bottom-third-plane">
      ${renderQrBox('#F14343')}
      ${renderInstitutionalBox()}
    </div>
  </div>
</body>
</html>`;

  // =========================================================================
  // PROPOSTA 3: "The Quantum Nexus & Split Horizon" (Arquitetura Revolucionária)
  // =========================================================================
  const htmlPoster3 = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${baseHead('HUB LabDiv - Proposta 3: The Quantum Nexus')}
  <style>
    .poster-container {
      background: #FFFFFF !important;
      position: relative;
      width: 1240px;
      height: 1754px;
      overflow: hidden;
    }
    .brand-gradient-line-top {
      position: absolute; top: 0; left: 0; width: 100%; height: 8px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 33%, #F14343 66%, #FFCC00 100%);
      z-index: 50;
    }

    /* 1. SEÇÃO SUPERIOR: SPLIT HORIZON (EDITORIAL NA ESQUERDA + QR CODE DE ACESSO IMEDIATO NO TOPO DIREITO) */
    .p3-top-section {
      position: absolute; top: 55px; left: 60px; right: 60px; height: 380px;
      display: flex; justify-content: space-between; align-items: stretch; gap: 40px;
      z-index: 20;
    }
    .p3-top-left {
      flex: 1.25; display: flex; flex-direction: column; justify-content: center;
    }
    .p3-top-tag {
      display: inline-flex; align-items: center; gap: 8px;
      background: #EEF4FA; border: 1.5px solid rgba(15, 71, 128, 0.22);
      padding: 6px 20px; border-radius: 9999px;
      font-size: 13px; font-weight: 800; color: #0F4780; letter-spacing: 1.2px;
      text-transform: uppercase; margin-bottom: 16px; align-self: flex-start;
    }
    .p3-hero-title {
      font-size: 64px; font-weight: 900; line-height: 1.08; color: #0F172A;
      letter-spacing: -1.8px; margin-bottom: 16px;
    }
    .p3-hero-title span { color: #0F4780; }
    .p3-hero-sub {
      font-size: 20px; font-weight: 600; color: #475569; line-height: 1.45; max-width: 680px;
    }

    /* CARD DE ACESSO IMEDIATO NO TOPO DIREITO (INOVAÇÃO ERGONÔMICA: ESCANEAMENTO NA ALTURA DOS OLHOS) */
    .p3-top-right-qr {
      width: 320px; flex-shrink: 0;
      background: #FFFFFF;
      border: 2.5px solid rgba(15, 71, 128, 0.20);
      border-radius: 24px;
      padding: 18px 20px;
      box-shadow: 0 16px 36px rgba(15, 71, 128, 0.08);
      display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;
      position: relative; overflow: hidden;
    }
    .p3-top-right-qr::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 6px;
      background: linear-gradient(90deg, #0F4780, #F14343, #FFCC00);
    }
    .p3-qr-badge-header {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 900; color: #0F4780; text-transform: uppercase; letter-spacing: 1.2px;
      margin-bottom: 10px;
    }
    .p3-qr-box {
      width: 190px; height: 190px; position: relative;
      background: #FFFFFF; border-radius: 16px; padding: 6px;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06); margin-bottom: 10px;
    }
    .p3-qr-box svg { width: 100%; height: 100%; display: block; }
    .p3-qr-center-icon {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 46px; height: 46px; background: #FFFFFF; border-radius: 8px; padding: 2px;
      display: flex; align-items: center; justify-content: center;
    }
    .p3-qr-center-icon svg { width: 100%; height: 100%; display: block; }
    .p3-qr-url {
      font-size: 13.5px; font-weight: 900; color: #0F4780; letter-spacing: 0.2px;
    }

    /* 2. ZONA HERO: O ÍCONE MONUMENTAL DO HUB LABDIV (570px) COM TOTAL PROTAGONISMO */
    .p3-hero-section {
      position: absolute; top: 455px; left: 60px; right: 60px; height: 600px;
      display: flex; align-items: center; justify-content: center;
      z-index: 20;
    }
    .p3-hero-icon {
      width: 570px; height: 570px;
      display: flex; align-items: center; justify-content: center;
    }
    .p3-hero-icon svg {
      width: 570px; height: 570px;
      filter: drop-shadow(0 28px 56px rgba(15, 71, 128, 0.20));
    }

    /* 3. BASE: TRÍPTICO DOS 3 EIXOS & BLOCO INSTITUCIONAL INTEGRADO */
    .p3-bottom-section {
      position: absolute; top: 1075px; left: 60px; right: 60px; height: 600px;
      display: flex; flex-direction: column; justify-content: flex-start; gap: 24px;
      z-index: 20;
    }
    .p3-triptych-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; height: 260px;
    }
    .p3-triptych-card {
      background: #FFFFFF; border-radius: 20px; padding: 24px 22px;
      border: 1.5px solid #E2E8F0;
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.05);
      display: flex; flex-direction: column; position: relative; overflow: hidden;
    }
    .p3-triptych-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 7px;
    }
    .p3-card-social::before { background: #0F4780; }
    .p3-card-social .p3-card-badge { color: #0F4780; }
    .p3-card-social .p3-card-title { color: #0F4780; }

    .p3-card-info::before { background: #F14343; }
    .p3-card-info .p3-card-badge { color: #F14343; }
    .p3-card-info .p3-card-title { color: #F14343; }

    .p3-card-tools::before { background: #FFCC00; }
    .p3-card-tools .p3-card-badge { color: #B45309; }
    .p3-card-tools .p3-card-title { color: #B45309; }

    .p3-card-badge {
      font-size: 13px; font-weight: 900; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 8px;
    }
    .p3-card-title {
      font-size: 24px; font-weight: 900; margin-bottom: 8px; line-height: 1.2;
    }
    .p3-card-desc {
      font-size: 16px; font-weight: 600; color: #475569; line-height: 1.45;
    }

    /* BLOCO INSTITUCIONAL & SEGURANÇA NA BASE */
    .p3-inst-wrapper {
      height: 280px;
    }
    .p3-inst-wrapper .bottom-inst-box {
      margin: 0; width: 100%; height: 100%; box-sizing: border-box;
      display: flex; flex-direction: column; justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="bg-math-pattern"></div>

    <!-- 1. TOPO: SPLIT HORIZON (EDITORIAL + QR DE ACESSO IMEDIATO) -->
    <div class="p3-top-section">
      <div class="p3-top-left">
        <div class="p3-top-tag font-bukra">Instituto de Física da USP • LabDiv</div>
        <h1 class="p3-hero-title font-bukra">
          O PONTO DE ENCONTRO<br>
          <span>DA FÍSICA NA USP.</span>
        </h1>
        <p class="p3-hero-sub font-open-sans">
          A plataforma colaborativa criada pela comunidade para conectar estudantes, preservar a história da ciência e impulsionar a graduação.
        </p>
      </div>

      <!-- CARD DE ACESSO IMEDIATO NO TOPO DIREITO -->
      <div class="p3-top-right-qr">
        <div class="p3-qr-badge-header font-bukra">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/>
            <path d="M12 18h.01"/>
          </svg>
          <span>ACESSO DIRETO</span>
        </div>
        <div class="p3-qr-box">
          ${qrSvg}
          <div class="p3-qr-center-icon">
            ${hubIconQrSvg}
          </div>
        </div>
        <div class="p3-qr-url font-bukra">hub.labdiv.com.br/divulgacao</div>
      </div>
    </div>

    <!-- 2. ZONA HERO CENTRAL: ÍCONE MONUMENTAL (570px) COM RESPIRO TOTAL -->
    <div class="p3-hero-section">
      <div class="p3-hero-icon">
        ${hubIconSvg}
      </div>
    </div>

    <!-- 3. BASE: TRÍPTICO DOS 3 EIXOS & INSTITUCIONAL DE SEGURANÇA -->
    <div class="p3-bottom-section">
      <div class="p3-triptych-grid">
        <div class="p3-triptych-card p3-card-social">
          <div class="p3-card-badge font-bukra">01 // Social</div>
          <h3 class="p3-card-title font-bukra">Comunidade &amp; Fóruns</h3>
          <p class="p3-card-desc font-open-sans">
            Tire dúvidas de física, conecte-se com veteranos e troque experiências entre turmas.
          </p>
        </div>

        <div class="p3-triptych-card p3-card-info">
          <div class="p3-card-badge font-bukra">02 // Informativo</div>
          <h3 class="p3-card-title font-bukra">História &amp; Acervo</h3>
          <p class="p3-card-desc font-open-sans">
            Memória científica do IFUSP, matérias detalhadas e resumos acadêmicos oficiais.
          </p>
        </div>

        <div class="p3-triptych-card p3-card-tools">
          <div class="p3-card-badge font-bukra">03 // Ferramentas</div>
          <h3 class="p3-card-title font-bukra">Simuladores &amp; Lab</h3>
          <p class="p3-card-desc font-open-sans">
            Simulações interativas de experimentos e calculadoras científicas para relatórios.
          </p>
        </div>
      </div>

      <div class="p3-inst-wrapper">
        ${renderInstitutionalBox()}
      </div>
    </div>
  </div>
</body>
</html>`;


  // =========================================================================
  // PROPOSTA 10: "The Editorial Focus & Solid Medallions"
  // (Título no Topo, Ícones Sólidos Sem Cards e Logo Hero Monumental Abaixo)
  // =========================================================================
  const htmlPoster10 = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${baseHead('HUB LabDiv - O Novo Hub da Física (Poster 10)')}
  <style>
    .poster-container {
      background: #FFFFFF !important;
      position: relative;
      width: 1240px;
      height: 1754px;
      overflow: hidden;
    }
    .brand-gradient-line-top {
      position: absolute; top: 0; left: 0; width: 100%; height: 8px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 33%, #F14343 66%, #FFCC00 100%);
      z-index: 50;
    }

    /* 1. TÍTULO NO TOPO (HERO TYPOGRAPHY) */
    .p10-top-header {
      position: absolute; top: 56px; left: 60px; right: 60px;
      display: flex; flex-direction: column; align-items: center; text-align: center;
      z-index: 20;
    }
    .p10-tag {
      display: inline-flex; align-items: center; gap: 9px;
      background: rgba(238, 244, 250, 0.95);
      border: 1.5px solid rgba(15, 71, 128, 0.25);
      padding: 7px 24px; border-radius: 9999px;
      font-size: 13.5px; font-weight: 800; color: #0F4780; letter-spacing: 1.2px;
      text-transform: uppercase; margin-bottom: 12px;
      box-shadow: 0 4px 12px rgba(15, 71, 128, 0.08);
      backdrop-filter: blur(8px);
    }
    .p10-tag-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #0F4780;
    }
    .p10-title {
      font-size: 82px; font-weight: 900; line-height: 1.05; color: #0F172A;
      letter-spacing: -2.2px; margin-bottom: 8px;
      text-shadow: 0 0 18px #FFFFFF, 0 0 28px #FFFFFF, 0 2px 10px rgba(15, 71, 128, 0.12);
    }
    .p10-title span { color: #0F4780; }
    .p10-sub {
      font-size: 21.5px; font-weight: 600; color: #475569; max-width: 980px; line-height: 1.35;
      text-shadow: 0 0 14px #FFFFFF, 0 0 22px #FFFFFF;
    }

    /* 2. OS 3 EIXOS SEM CARDS: ÍCONES EM CORES SÓLIDAS + TIPOGRAFIA EDITORIAL */
    .p10-pillars-row {
      position: absolute; top: 310px; left: 60px; right: 60px; height: 215px;
      display: flex; gap: 40px;
      z-index: 20;
      background: radial-gradient(ellipse 95% 85% at 50% 50%, rgba(255, 255, 255, 0.94) 0%, rgba(255, 255, 255, 0.82) 55%, transparent 100%);
      padding: 0 10px;
    }
    .p10-pillar-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
    }

    .pillar-icon-medallion {
      width: 72px; height: 72px; border-radius: 22px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 14px;
      position: relative;
    }
    .medallion-blue {
      background-color: #0F4780; color: #FFFFFF;
      box-shadow: 0 12px 28px -4px rgba(15, 71, 128, 0.42);
      border: 2px solid rgba(255, 255, 255, 0.95);
    }
    .badge-blue { color: #0F4780; }

    .medallion-red {
      background-color: #F14343; color: #FFFFFF;
      box-shadow: 0 12px 28px -4px rgba(241, 67, 67, 0.42);
      border: 2px solid rgba(255, 255, 255, 0.95);
    }
    .badge-red { color: #F14343; }

    .medallion-yellow {
      background-color: #FFCC00; color: #0F172A;
      box-shadow: 0 12px 28px -4px rgba(255, 204, 0, 0.48);
      border: 2px solid rgba(255, 255, 255, 0.95);
    }
    .badge-yellow { color: #B45309; }

    .pillar-badge {
      font-size: 13.5px; font-weight: 900; letter-spacing: 1.4px; text-transform: uppercase;
      margin-bottom: 6px;
      text-shadow: 0 0 10px #FFFFFF, 0 0 18px #FFFFFF;
    }
    .pillar-title {
      font-size: 24px; font-weight: 900; line-height: 1.15; color: #0F172A;
      letter-spacing: -0.4px; margin-bottom: 6px;
      text-shadow: 0 0 12px #FFFFFF, 0 0 20px #FFFFFF;
    }
    .pillar-desc {
      font-size: 15px; font-weight: 600; line-height: 1.45; color: #475569;
      max-width: 320px;
      text-shadow: 0 0 10px #FFFFFF, 0 0 18px #FFFFFF;
    }

    .pillar-divider {
      position: absolute; top: 15px; bottom: 15px; width: 1.5px;
      background: linear-gradient(180deg, transparent, rgba(15, 71, 128, 0.12) 30%, rgba(15, 71, 128, 0.12) 70%, transparent);
    }
    .divider-1 { left: calc(33.333% - 20px); }
    .divider-2 { left: calc(66.666% - 20px); }

    /* 3. LOGO HERO MONUMENTAL CENTRAL ABAIXO */
    .p10-center-logo-zone {
      position: absolute; top: 545px; left: 60px; right: 60px; height: 780px;
      display: flex; align-items: center; justify-content: center;
      z-index: 20;
    }
    .p10-radial-glow {
      position: absolute; width: 820px; height: 820px; border-radius: 50%;
      background: radial-gradient(circle, rgba(15, 71, 128, 0.08) 0%, rgba(241, 67, 67, 0.04) 40%, rgba(255, 204, 0, 0.05) 65%, transparent 75%);
      pointer-events: none; z-index: 1;
    }
    .p10-center-logo {
      width: 650px; height: 650px;
      display: flex; align-items: center; justify-content: center;
      position: relative; z-index: 2;
    }
    .p10-center-logo svg {
      width: 100%; height: 100%;
      filter: drop-shadow(0 32px 64px rgba(15, 71, 128, 0.22));
    }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="bg-math-pattern"></div>

    <!-- 1. TÍTULO NO TOPO -->
    <div class="p10-top-header">
      <div class="p10-tag font-bukra">
        <span class="p10-tag-dot"></span>
        <span>Laboratório de Demonstrações • IFUSP</span>
      </div>
      <h1 class="p10-title font-bukra">O NOVO HUB DA <span>FÍSICA</span></h1>
      <p class="p10-sub font-open-sans">
        Tecnologia aberta e ciência conectada para transformar sua jornada acadêmica na USP.
      </p>
    </div>

    <!-- 2. OS 3 EIXOS SEM CARDS -->
    <div class="p10-pillars-row">
      <div class="pillar-divider divider-1"></div>
      <div class="pillar-divider divider-2"></div>

      <div class="p10-pillar-col">
        <div class="pillar-icon-medallion medallion-blue">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <span class="pillar-badge badge-blue font-bukra">01 • SOCIAL</span>
        <h3 class="pillar-title font-bukra">Comunidade &amp; Fóruns</h3>
        <p class="pillar-desc font-open-sans">
          Fóruns de dúvidas, grupos de estudo e troca de experiências entre turmas.
        </p>
      </div>

      <div class="p10-pillar-col">
        <div class="pillar-icon-medallion medallion-red">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </div>
        <span class="pillar-badge badge-red font-bukra">02 • INFORMATIVO</span>
        <h3 class="pillar-title font-bukra">Histórico &amp; Acervo</h3>
        <p class="pillar-desc font-open-sans">
          Memória científica do IFUSP, roteiros de laboratório e acervo das matérias.
        </p>
      </div>

      <div class="p10-pillar-col">
        <div class="pillar-icon-medallion medallion-yellow">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </div>
        <span class="pillar-badge badge-yellow font-bukra">03 • FERRAMENTAS</span>
        <h3 class="pillar-title font-bukra">Simuladores &amp; Lab</h3>
        <p class="pillar-desc font-open-sans">
          Simulações interativas de experimentos e calculadoras científicas para relatórios.
        </p>
      </div>
    </div>

    <!-- 3. LOGO HERO MONUMENTAL CENTRAL ABAIXO -->
    <div class="p10-center-logo-zone">
      <div class="p10-radial-glow"></div>
      <div class="p10-center-logo">
        ${hubIconSvg}
      </div>
    </div>

    <!-- 4. RODAPÉ INSTITUCIONAL & QR CODE -->
    <div class="bottom-third-plane">
      ${renderQrBox('#0F4780')}
      ${renderInstitutionalBox()}
    </div>
  </div>
</body>
</html>`;

  // =========================================================================
  // PROPOSTA 11: "The Asymmetric Editorial Blueprint" (Tipografia Esquerda + Ícone Gigante Direita)
  // =========================================================================
  const htmlPoster11 = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${baseHead('HUB LabDiv - Proposta 11: The Asymmetric Editorial Blueprint')}
  <style>
    .poster-container {
      background: #FFFFFF !important;
      position: relative;
      width: 1240px;
      height: 1754px;
      overflow: hidden;
    }
    .brand-gradient-line-top {
      position: absolute; top: 0; left: 0; width: 100%; height: 8px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 33%, #F14343 66%, #FFCC00 100%);
      z-index: 50;
    }

    /* LAYOUT ASSIMÉTRICO EDITORIAL (DIVIDIDO EM DUAS COLUNAS FLUIDAS) */
    .p11-editorial-split {
      position: absolute; top: 75px; left: 55px; right: 55px; height: 1100px;
      display: flex; gap: 40px; align-items: center;
      z-index: 20;
    }

    /* COLUNA ESQUERDA: TIPOGRAFIA MONUMENTAL BUKRA + 3 PILS FLUTUANTES */
    .p11-left-col {
      flex: 1.15;
      display: flex; flex-direction: column; justify-content: center;
    }
    .p11-tag {
      display: inline-flex; align-items: center; gap: 8px; align-self: flex-start;
      background: #EEF4FA; border: 1.5px solid rgba(15, 71, 128, 0.22);
      padding: 6px 20px; border-radius: 9999px;
      font-size: 13px; font-weight: 800; color: #0F4780; letter-spacing: 1.2px;
      text-transform: uppercase; margin-bottom: 22px;
    }
    .p11-title {
      font-size: 78px; font-weight: 900; line-height: 1.04; letter-spacing: -2px; margin-bottom: 18px;
    }
    .p11-blue { color: #0F4780; }
    .p11-dark { color: #0F172A; }
    .p11-red { color: #F14343; }
    .p11-sub {
      font-size: 21px; font-weight: 600; color: #475569; line-height: 1.45; margin-bottom: 34px; max-width: 540px;
    }

    /* 3 PÍLULAS HORIZONTAIS EMPILHADAS (POUCOS ELEMENTOS, ELEGANTE) */
    .p11-pills-list {
      display: flex; flex-direction: column; gap: 14px; max-width: 530px;
    }
    .p11-pill-row {
      display: flex; align-items: center; gap: 16px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      border: 1.5px solid #CBD5E1;
      border-radius: 999px;
      padding: 12px 22px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.03);
    }
    .p11-pill-row.social { border-left: 6px solid #0F4780; }
    .p11-pill-row.info { border-left: 6px solid #F14343; }
    .p11-pill-row.tools { border-left: 6px solid #FFCC00; }

    .p11-pill-num {
      font-size: 16px; font-weight: 900; flex-shrink: 0;
    }
    .p11-pill-row.social .p11-pill-num { color: #0F4780; }
    .p11-pill-row.info .p11-pill-num { color: #F14343; }
    .p11-pill-row.tools .p11-pill-num { color: #B45309; }

    .p11-pill-text {
      font-size: 16px; font-weight: 600; color: #334155; line-height: 1.35;
    }
    .p11-pill-text strong { font-weight: 800; color: #0F172A; }

    /* COLUNA DIREITA: O ÍCONE HERO MONUMENTAL (500px) TOTALMENTE LIVRE NO FUNDO DAS EQUAÇÕES */
    .p11-right-col {
      flex: 1.05;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      position: relative;
    }
    .p11-hero-icon-wrap {
      width: 520px; height: 520px;
      display: flex; align-items: center; justify-content: center;
    }
    .p11-hero-icon-wrap svg {
      width: 500px; height: 500px;
      filter: drop-shadow(0 26px 48px rgba(15, 71, 128, 0.22));
    }
    .p11-tech-label {
      margin-top: 18px;
      display: flex; align-items: center; gap: 10px;
      font-size: 13px; font-weight: 800; color: #64748B; letter-spacing: 1.5px; text-transform: uppercase;
    }
    .p11-tech-dot { width: 8px; height: 8px; border-radius: 50%; background: #0F4780; }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="bg-math-pattern"></div>

    <div class="p11-editorial-split">
      <!-- ESQUERDA: TIPOGRAFIA MONUMENTAL + 3 PÍLULAS -->
      <div class="p11-left-col">
        <div class="p11-tag font-bukra">Instituto de Física da USP • LabDiv</div>
        <h1 class="p11-title font-bukra">
          <span class="p11-blue">CIÊNCIA</span><br>
          <span class="p11-dark">LIVRE.</span><br>
          <span class="p11-red">CÓDIGO</span><br>
          <span class="p11-blue">ABERTO.</span>
        </h1>
        <p class="p11-sub font-open-sans">
          A plataforma oficial criada pela comunidade para apoiar o aprendizado e transformar a graduação no IFUSP.
        </p>

        <div class="p11-pills-list">
          <div class="p11-pill-row social">
            <span class="p11-pill-num font-bukra">01</span>
            <div class="p11-pill-text font-open-sans"><strong>Eixo Social:</strong> Fóruns e diálogo com veteranos</div>
          </div>

          <div class="p11-pill-row info">
            <span class="p11-pill-num font-bukra">02</span>
            <div class="p11-pill-text font-open-sans"><strong>Informativo:</strong> Acervo histórico e ementas do curso</div>
          </div>

          <div class="p11-pill-row tools">
            <span class="p11-pill-num font-bukra">03</span>
            <div class="p11-pill-text font-open-sans"><strong>Ferramentas:</strong> Simuladores gráficos de física</div>
          </div>
        </div>
      </div>

      <!-- DIREITA: O ÍCONE HERO MONUMENTAL FLUTUANTE (500px) -->
      <div class="p11-right-col">
        <div class="p11-hero-icon-wrap">
          ${hubIconSvg}
        </div>
        <div class="p11-tech-label font-bukra">
          <span class="p11-tech-dot"></span>
          <span>IFUSP • LabDiv V3.0 • AGPLv3</span>
        </div>
      </div>
    </div>

    <!-- TERCEIRO PLANO: QR CODE & SEGURANÇA INSTITUCIONAL -->
    <div class="bottom-third-plane">
      ${renderQrBox('#0F4780')}
      ${renderInstitutionalBox()}
    </div>
  </div>
</body>
</html>`;

  // =========================================================================
  // PROPOSTA 12: "The Diagonal Split" (Assimetria Cortada, Estilo Institucional Futurista)
  // =========================================================================
  const htmlPoster12 = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  ${baseHead('HUB LabDiv - Proposta 12: The Diagonal Split')}
  <style>
    .poster-container { background: #F8FAFC !important; }
    
    .p12-diagonal {
       position: absolute; top: 0; left: 0; width: 100%; height: 950px;
       background: #0F4780; 
       clip-path: polygon(0 0, 100% 0, 100% 100%, 0 55%);
       z-index: 10;
    }
    
    .p12-content {
       position: absolute; top: 0; left: 0; width: 100%; height: 1280px;
       z-index: 20; padding: 90px 60px; box-sizing: border-box;
    }
    
    .p12-header {
       color: #FFFFFF; max-width: 600px;
    }
    .p12-badge {
       display: inline-block; background: #FFCC00; color: #0F172A;
       padding: 8px 24px; font-size: 15px; font-weight: 900; border-radius: 999px;
       margin-bottom: 24px; text-transform: uppercase;
    }
    .p12-header h1 { font-size: 85px; font-weight: 900; line-height: 1.05; letter-spacing: -2px; }
    .p12-header p { font-size: 24px; font-weight: 600; margin-top: 24px; color: #CBD5E1; line-height: 1.4; }
    
    .p12-icon-wrapper {
       position: absolute; top: 120px; right: 60px;
       width: 480px; height: 480px; background: #FFFFFF; border-radius: 50%;
       display: flex; align-items: center; justify-content: center;
       box-shadow: 0 40px 100px rgba(0,0,0,0.25);
       border: 8px solid rgba(255,255,255,0.2); background-clip: padding-box;
    }
    .p12-icon-wrapper svg { width: 360px; height: 360px; }
    
    .p12-cards-grid {
       position: absolute; bottom: 0; left: 60px; right: 60px;
       display: grid; grid-template-columns: repeat(3, 1fr); gap: 30px;
    }
    .p12-card {
       background: #FFFFFF; padding: 45px 35px; border-radius: 20px;
       box-shadow: 0 20px 50px rgba(0,0,0,0.1);
       border-bottom: 10px solid;
    }
    .p12-card-1 { border-color: #0F4780; }
    .p12-card-2 { border-color: #F14343; }
    .p12-card-3 { border-color: #FFCC00; }
    
    .p12-card-icon {
       width: 60px; height: 60px; background: #F1F5F9; border-radius: 14px;
       display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 900;
       margin-bottom: 24px; color: #0F172A;
    }
    .p12-card h3 { font-size: 26px; font-weight: 900; margin-bottom: 12px; color: #0F172A; }
    .p12-card p { font-size: 17px; font-weight: 600; color: #475569; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="p12-diagonal"></div>
    <div class="bg-math-pattern"></div>

    <div class="p12-content">
      <div class="p12-header">
        <div class="p12-badge font-bukra">Tecnologia Livre AGPLv3</div>
        <h1 class="font-bukra">Ciência Livre.<br>Código Aberto.</h1>
        <p class="font-open-sans">A plataforma oficial da graduação desenvolvida para acelerar a comunicação científica e garantir autonomia estudantil no IFUSP.</p>
      </div>

      <div class="p12-icon-wrapper">
        ${hubIconSvg}
      </div>

      <div class="p12-cards-grid">
        <div class="p12-card p12-card-1">
          <div class="p12-card-icon font-bukra">01</div>
          <h3 class="font-bukra">Eixo Social</h3>
          <p class="font-open-sans">Rede pedagógica aberta para aproximar calouros, veteranos e toda a equipe docente do instituto.</p>
        </div>
        <div class="p12-card p12-card-2">
          <div class="p12-card-icon font-bukra">02</div>
          <h3 class="font-bukra">Eixo Informativo</h3>
          <p class="font-open-sans">Enciclopédia viva de física com resumos e história da ciência ao seu alcance imediato.</p>
        </div>
        <div class="p12-card p12-card-3">
          <div class="p12-card-icon font-bukra">03</div>
          <h3 class="font-bukra">Ferramentas</h3>
          <p class="font-open-sans">Simuladores computacionais, calculadoras analíticas e gerenciamento de notas.</p>
        </div>
      </div>
    </div>

    <!-- TERCEIRO PLANO: QR CODE & SEGURANÇA -->
    <div class="bottom-third-plane">
      ${renderQrBox('#0F4780')}
      ${renderInstitutionalBox()}
    </div>
  </div>
</body>
</html>`;

  // Mapeamento dos pôsteres
  const posters = [
    { num: 3, html: htmlPoster3, title: 'Proposta 3: The Minimalist Manifesto' },
    { num: 7, html: htmlPoster7, title: 'Proposta 7: Orbital Gravity Core' },
    { num: 8, html: htmlPoster8, title: 'Proposta 8: Monumental Pillar' },
    { num: 9, html: htmlPoster9, title: 'Proposta 9: Scientific Prism' },
    { num: 10, html: htmlPoster10, title: 'Proposta 10: The Circular Lens' },
    { num: 11, html: htmlPoster11, title: 'Proposta 11: The Bauhaus Pavilion' },
    { num: 12, html: htmlPoster12, title: 'Proposta 12: The Diagonal Split' },
  ];

  // Iniciar Puppeteer para renderização a 300 DPI (2480x3508)
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

  for (const item of posters) {
    const posterDir = path.join(POSTERS_ROOT, `poster${item.num}`);
    if (!fs.existsSync(posterDir)) fs.mkdirSync(posterDir, { recursive: true });

    const htmlPath = path.join(posterDir, 'poster.html');
    fs.writeFileSync(htmlPath, item.html, 'utf8');
    console.log(`📝 Salvo HTML do Poster ${item.num}: ${htmlPath}`);

    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await page.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 800));

    const outPngPath = path.join(posterDir, 'poster.png');
    await page.screenshot({
      path: outPngPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1240, height: 1754 }
    });
    console.log(`✅ [300 DPI] Poster ${item.num} (${item.title}) gerado em: ${outPngPath}`);

    // Limpar arquivos residuais na pasta para garantir que tem APENAS poster.html e poster.png
    const files = fs.readdirSync(posterDir);
    for (const f of files) {
      if (f !== 'poster.html' && f !== 'poster.png') {
        const fp = path.join(posterDir, f);
        if (fs.statSync(fp).isDirectory()) {
          fs.rmSync(fp, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fp);
        }
      }
    }

    // Copiar para artifacts da sessão para permitir pré-visualização no IDE
    if (fs.existsSync(ARTIFACTS_DIR)) {
      fs.copyFileSync(outPngPath, path.join(ARTIFACTS_DIR, `poster${item.num}.png`));
    }

    await page.close();
  }

  await browser.close();
  console.log('🎉 Todas as 6 propostas de design exclusivas (Posters 7 a 12) foram criadas e renderizadas com sucesso absoluto!');
}

main().catch(err => {
  console.error('❌ Erro na geração dos pôsteres:', err);
  process.exit(1);
});
