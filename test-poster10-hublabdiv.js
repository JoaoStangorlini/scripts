/**
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 * Este programa é software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3).
 */
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const QRCode = require('qrcode');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const POSTER10_DIR = path.join(PROJECT_ROOT, 'public/divulgacao/posters/poster10');
const ARTIFACTS_DIR = (process.env.ARTIFACTS_DIR || './artifacts');

async function main() {
  const bgIfSvg = fs.readFileSync(path.join(PROJECT_ROOT, 'public/bg-if.svg'), 'utf8');
  const bgIfContrastSvg = bgIfSvg
    .replace(/fill="#FFCC00"/g, 'fill="#D97706"')
    .replace(/opacity="0\.12"/g, 'opacity="0.32"')
    .replace(/opacity="0\.15"/g, 'opacity="0.36"')
    .replace(/opacity="0\.18"/g, 'opacity="0.40"')
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

  const hubIconQrSvg = hubIconSvg
    .replace(/id="([^"]+)"/g, 'id="$1_qr"')
    .replace(/url\(#([^)]+)\)/g, 'url(#$1_qr)');

  const qrSvg = await QRCode.toString('https://hub.labdiv.com.br/divulgacao', {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1
  });

  const sharedCss = `
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
      margin: 0; padding: 0;
    }
    .poster-container {
      width: 1240px;
      height: 1754px;
      position: relative;
      background-color: #FFFFFF;
      overflow: hidden;
    }
    .bg-math-pattern {
      position: absolute;
      top: 0; left: 0;
      width: 1240px; height: 1754px;
      background-image: url('data:image/svg+xml;base64,${bgIfBase64}');
      background-repeat: repeat;
      background-size: 1100px 1100px;
      opacity: 0.44;
      pointer-events: none;
      z-index: 1;
    }
    .brand-gradient-line-top {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 8px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 33%, #F14343 66%, #FFCC00 100%);
      z-index: 50;
    }

    /* GRADIENTE OFICIAL LABDIV */
    .brand-gradient-text {
      background: linear-gradient(90deg, #0F4780 0%, #F14343 50%, #FFCC00 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
      display: inline-block;
    }

    /* OS 3 EIXOS SEM CARDS: ÍCONES EM CORES SÓLIDAS + TIPOGRAFIA EDITORIAL */
    .p10-pillars-row {
      position: absolute; top: 1075px; left: 60px; right: 60px; height: 235px;
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

    /* RODAPÉ INSTITUCIONAL & QR CODE */
    .bottom-third-plane {
      position: absolute;
      bottom: 45px; left: 55px; right: 55px;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 24px;
      z-index: 30;
    }
    .bottom-qr-col {
      display: flex; flex-direction: column; align-items: center; gap: 10px; flex-shrink: 0;
    }
    .qr-code-box {
      width: 320px; height: 320px;
      background: #FFFFFF; padding: 14px; border-radius: 28px;
      border: 2.5px solid rgba(15, 71, 128, 0.22);
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
      padding: 4px 18px; border-radius: 999px;
      border: 1.5px solid rgba(15, 71, 128, 0.16);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      white-space: nowrap;
    }
    .bottom-inst-box {
      flex: 1; height: 320px;
      background: #F8FAFC;
      border-radius: 28px; border: 2px solid #E2E8F0;
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
      font-size: 16px; line-height: 1.5; color: #334155; font-weight: 500;
    }
    .inst-desc-text strong { color: #0F172A; font-weight: 700; }
    .inst-actions-row { display: flex; gap: 16px; margin-top: 10px; }
    .inst-action-card {
      flex: 1; background: #FFFFFF; border-radius: 16px;
      border: 1.5px solid #E2E8F0; padding: 12px 18px;
      display: flex; align-items: center; gap: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
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
  `;

  const renderSharedBody = () => `
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
        <p class="pillar-desc font-open-sans">Fóruns de dúvidas, grupos de estudo e troca de experiências entre turmas.</p>
      </div>

      <div class="p10-pillar-col">
        <div class="pillar-icon-medallion medallion-red">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
          </svg>
        </div>
        <span class="pillar-badge badge-red font-bukra">02 • INFORMATIVO</span>
        <h3 class="pillar-title font-bukra">Histórico &amp; Acervo</h3>
        <p class="pillar-desc font-open-sans">Memória científica do IFUSP, roteiros de laboratório e acervo das matérias.</p>
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
        <p class="pillar-desc font-open-sans">Simulações interativas de experimentos e calculadoras científicas para relatórios.</p>
      </div>
    </div>

    <div class="bottom-third-plane">
      <div class="bottom-qr-col">
        <div class="qr-code-box">
          ${qrSvg}
          <div class="qr-center-badge-img">
            ${hubIconQrSvg}
          </div>
        </div>
        <a class="qr-clean-link font-bukra" href="https://hub.labdiv.com.br/divulgacao">hub.labdiv.com.br/divulgacao</a>
      </div>

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
  `;

  // =========================================================================
  // VARIAÇÃO 1: "HUB LabDiv" NO CENTRO LOGO COM O EMBLEMA (LOCKUP MONUMENTAL)
  // =========================================================================
  const htmlCenterBrand = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>HUB LabDiv - Center Brand Lockup</title>
  <link rel="stylesheet" href="../../fonts/fonts.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    ${sharedCss}
    .p10-top-header {
      position: absolute; top: 54px; left: 60px; right: 60px;
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
    .p10-tag-dot { width: 8px; height: 8px; border-radius: 50%; background: #0F4780; }
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

    /* CENTRO: EMBLEMA + LOCKUP HUB LABDIV */
    .p10-center-hero-zone {
      position: absolute; top: 310px; left: 60px; right: 60px; height: 720px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      z-index: 20;
    }
    .p10-radial-glow {
      position: absolute; width: 800px; height: 800px; border-radius: 50%;
      background: radial-gradient(circle, rgba(15, 71, 128, 0.08) 0%, rgba(241, 67, 67, 0.04) 40%, rgba(255, 204, 0, 0.05) 65%, transparent 75%);
      pointer-events: none; z-index: 1;
    }
    .p10-center-logo-box {
      width: 480px; height: 480px;
      display: flex; align-items: center; justify-content: center;
      position: relative; z-index: 2;
    }
    .p10-center-logo-box svg {
      width: 100%; height: 100%;
      filter: drop-shadow(0 28px 56px rgba(15, 71, 128, 0.22));
    }
    .p10-brand-lockup {
      display: flex; flex-direction: column; align-items: center;
      margin-top: -10px; position: relative; z-index: 5;
    }
    .p10-brand-row {
      display: flex; align-items: baseline; gap: 14px;
    }
    .p10-brand-hub {
      font-size: 72px; font-weight: 900; color: #0F172A; letter-spacing: -1.5px; line-height: 1;
      text-shadow: 0 0 20px #FFFFFF;
    }
    .p10-brand-labdiv {
      font-size: 72px; font-weight: 900; letter-spacing: -1.5px; line-height: 1;
    }
    .p10-brand-beta {
      font-size: 15px; font-weight: 900; letter-spacing: 1.8px; text-transform: uppercase;
      padding: 5px 14px; border-radius: 8px;
      background: rgba(15, 71, 128, 0.10); color: #0F4780;
      border: 1.5px solid rgba(15, 71, 128, 0.22);
      transform: translateY(-8px);
    }
    .p10-brand-ifusp {
      font-size: 16px; font-weight: 800; color: #94A3B8; letter-spacing: 8px; text-transform: uppercase;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="bg-math-pattern"></div>

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

    <div class="p10-center-hero-zone">
      <div class="p10-radial-glow"></div>
      <div class="p10-center-logo-box">
        ${hubIconSvg}
      </div>
      <div class="p10-brand-lockup font-bukra">
        <div class="p10-brand-row">
          <span class="p10-brand-hub">HUB</span>
          <span class="p10-brand-labdiv brand-gradient-text">LabDiv</span>
          <span class="p10-brand-beta">BETA</span>
        </div>
        <span class="p10-brand-ifusp">IFUSP</span>
      </div>
    </div>

    ${renderSharedBody()}
  </div>
</body>
</html>`;

  // =========================================================================
  // VARIAÇÃO 2: "HUB LabDiv" NO TÍTULO PRINCIPAL DO TOPO (IDÊNTICO AO SITE)
  // =========================================================================
  const htmlTopBrand = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>HUB LabDiv - Top Brand Title</title>
  <link rel="stylesheet" href="../../fonts/fonts.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    ${sharedCss}
    .p10-top-header {
      position: absolute; top: 48px; left: 60px; right: 60px;
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
    .p10-tag-dot { width: 8px; height: 8px; border-radius: 50%; background: #0F4780; }

    .p10-brand-main-title {
      display: flex; align-items: baseline; justify-content: center; gap: 18px;
      margin-bottom: 4px;
    }
    .p10-main-hub {
      font-size: 104px; font-weight: 900; color: #0F172A; letter-spacing: -2.8px; line-height: 1;
      text-shadow: 0 0 24px #FFFFFF;
    }
    .p10-main-labdiv {
      font-size: 104px; font-weight: 900; letter-spacing: -2.8px; line-height: 1;
    }
    .p10-main-beta {
      font-size: 20px; font-weight: 900; letter-spacing: 2.2px; text-transform: uppercase;
      padding: 6px 18px; border-radius: 10px;
      background: rgba(15, 71, 128, 0.10); color: #0F4780;
      border: 2px solid rgba(15, 71, 128, 0.25);
      transform: translateY(-16px);
    }
    .p10-main-ifusp {
      font-size: 19px; font-weight: 800; color: #94A3B8; letter-spacing: 10px; text-transform: uppercase;
      margin-bottom: 14px;
    }
    .p10-campaign-badge {
      font-size: 22px; font-weight: 800; color: #0F4780; letter-spacing: 1.2px; text-transform: uppercase;
      margin-bottom: 6px;
    }
    .p10-sub {
      font-size: 20px; font-weight: 600; color: #475569; max-width: 980px; line-height: 1.35;
      text-shadow: 0 0 14px #FFFFFF;
    }

    /* CENTRO: EMBLEMA HERO MONUMENTAL */
    .p10-center-hero-zone {
      position: absolute; top: 380px; left: 60px; right: 60px; height: 650px;
      display: flex; align-items: center; justify-content: center;
      z-index: 20;
    }
    .p10-radial-glow {
      position: absolute; width: 780px; height: 780px; border-radius: 50%;
      background: radial-gradient(circle, rgba(15, 71, 128, 0.08) 0%, rgba(241, 67, 67, 0.04) 40%, rgba(255, 204, 0, 0.05) 65%, transparent 75%);
      pointer-events: none; z-index: 1;
    }
    .p10-center-logo-box {
      width: 580px; height: 580px;
      display: flex; align-items: center; justify-content: center;
      position: relative; z-index: 2;
    }
    .p10-center-logo-box svg {
      width: 100%; height: 100%;
      filter: drop-shadow(0 32px 64px rgba(15, 71, 128, 0.22));
    }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="bg-math-pattern"></div>

    <div class="p10-top-header">
      <div class="p10-tag font-bukra">
        <span class="p10-tag-dot"></span>
        <span>Laboratório de Demonstrações • IFUSP</span>
      </div>
      <div class="p10-brand-main-title font-bukra">
        <span class="p10-main-hub">HUB</span>
        <span class="p10-main-labdiv brand-gradient-text">LabDiv</span>
        <span class="p10-main-beta">BETA</span>
      </div>
      <div class="p10-main-ifusp font-bukra">IFUSP</div>
      <p class="p10-sub font-open-sans">
        <strong>O Novo Hub da Física</strong> &bull; Tecnologia aberta e ciência conectada para transformar sua jornada acadêmica na USP.
      </p>
    </div>

    <div class="p10-center-hero-zone">
      <div class="p10-radial-glow"></div>
      <div class="p10-center-logo-box">
        ${hubIconSvg}
      </div>
    </div>

    ${renderSharedBody()}
  </div>
</body>
</html>`;

  // Salvar arquivos temporários para render
  const pathCenter = path.join(POSTER10_DIR, 'test_center_brand.html');
  const pathTop = path.join(POSTER10_DIR, 'test_top_brand.html');
  fs.writeFileSync(pathCenter, htmlCenterBrand, 'utf8');
  fs.writeFileSync(pathTop, htmlTopBrand, 'utf8');

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });

  // 1. Render Center Brand
  await page.goto(`file://${pathCenter}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));
  const pngCenterPath = path.join(POSTER10_DIR, 'test_center_brand.png');
  await page.screenshot({ path: pngCenterPath, type: 'png' });
  fs.copyFileSync(pngCenterPath, path.join(ARTIFACTS_DIR, 'test_center_brand.png'));
  console.log(`✅ Rendered Center Brand: ${pngCenterPath}`);

  // 2. Render Top Brand
  await page.goto(`file://${pathTop}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));
  const pngTopPath = path.join(POSTER10_DIR, 'test_top_brand.png');
  await page.screenshot({ path: pngTopPath, type: 'png' });
  fs.copyFileSync(pngTopPath, path.join(ARTIFACTS_DIR, 'test_top_brand.png'));
  console.log(`✅ Rendered Top Brand: ${pngTopPath}`);

  await browser.close();
}

main().catch(err => {
  console.error('❌ Erro:', err);
  process.exit(1);
});
