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
const ARTIFACT_DIR = (process.env.ARTIFACTS_DIR || './artifacts');

function buildPosterHtml({ qrSvg, capeloSvg }) {
  // Configuração das alturas e posições:
  // Card 1 (Social, esquerda): mais alto (380px) e subindo na diagonal (-210px) para preencher o vazio da esquerda
  // Card 2 (Informativo, centro): intermediário (320px) em -105px
  // Card 3 (Ferramentas, direita): compacto (260px) em 0px (o tamanho original que o usuário aprovou)
  const cardsGridTop = '966px';

  return `<!--
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
  <title>HUB LabDiv - Poster 1: Conectando você à universidade</title>
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
      background-color: #F8FAFC;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .bg-math-pattern {
      position: absolute;
      top: 0; left: 0;
      width: 1240px; height: 1754px;
      background-image: url('bg-if.svg');
      background-repeat: repeat;
      background-size: 1100px 1100px;
      opacity: 0.38;
      pointer-events: none;
      z-index: 1;
    }
    .brand-gradient-line-top {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 6px;
      background: linear-gradient(90deg, #0F4780 0%, #0284C7 35%, #F14343 70%, #FFCC00 100%);
      z-index: 50;
    }

    .p12-diagonal {
       position: absolute; top: 0; left: 0; width: 100%; height: 950px;
       background: #0F4780; 
       clip-path: polygon(0 0, 100% 0, 100% 100%, 0 55%);
       z-index: 10;
    }
    
    .p12-content {
       position: absolute; top: 0; left: 0; width: 100%; height: 1754px;
       z-index: 20; padding: 85px 60px; box-sizing: border-box;
    }
    
    /* CABEÇALHO ESQUERDO */
    .p12-header {
       color: #FFFFFF; max-width: 610px;
    }
    .p12-badge {
       display: inline-block; background: #FFCC00; color: #0F172A;
       padding: 10px 28px; font-size: 16.5px; font-weight: 900; border-radius: 999px;
       margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;
       box-shadow: 0 4px 14px rgba(0,0,0,0.14);
    }
    .p12-header h1 {
       font-size: 54px; font-weight: 900; line-height: 1.15; letter-spacing: -1.2px;
    }
    .p12-subline {
       font-size: 27px; font-weight: 800; margin-top: 18px; color: #FFCC00; line-height: 1.34; max-width: 600px;
    }
    
    /* COLUNA DIREITA HERO: ÍCONE COM DEGRADÊ + "HUB LabDiv" */
    .p12-right-hero-col {
       position: absolute; top: 45px; right: 45px;
       width: 500px;
       display: flex; flex-direction: column; align-items: center;
       z-index: 25;
    }
    .p12-icon-wrapper {
       width: 480px; height: 480px;
       border-radius: 50%;
       background: linear-gradient(90deg, #0F4780 0%, #0284C7 22%, #F14343 55%, #FFCC00 100%);
       padding: 6px;
       display: flex; align-items: center; justify-content: center;
       box-shadow: 0 30px 75px rgba(0,0,0,0.28), 0 0 0 3px rgba(255,255,255,0.20);
       flex-shrink: 0;
       box-sizing: border-box;
    }
    .p12-icon-inner {
       width: 100%; height: 100%;
       background: #FFFFFF;
       border-radius: 50%;
       display: flex; align-items: center; justify-content: center;
       overflow: hidden;
    }
    .p12-icon-inner svg {
       width: 355px; height: 355px;
       transform: translateY(12px);
    }

    .p12-icon-branding {
       margin-top: 14px;
       display: flex; flex-direction: column; align-items: center; text-align: center;
       width: 100%;
    }
    .p12-brand-title {
       font-size: 62px; font-weight: 900; line-height: 1.0; letter-spacing: -0.8px;
    }
    .p12-brand-title .hub-white {
       color: #FFFFFF;
       letter-spacing: -0.5px;
    }
    .p12-brand-title .labdiv-gradient {
       background: linear-gradient(90deg, #38BDF8 0%, #0284C7 20%, #F14343 55%, #FFCC00 100%);
       -webkit-background-clip: text;
       -webkit-text-fill-color: transparent;
       display: inline-block;
    }
    
    /* CARDS: POSICIONAMENTO E FORMATAÇÃO VISUAL DOS 3 EIXOS */
    .p12-cards-grid {
       position: absolute; top: ${cardsGridTop}; left: 55px; right: 55px;
       display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px;
       align-items: flex-start;
       z-index: 28;
    }
    .p12-card {
       background: #FFFFFF;
       padding: 24px 22px 20px 22px;
       border-radius: 26px;
       box-shadow: 0 20px 50px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.03);
       display: flex;
       flex-direction: column;
       align-items: center;
       text-align: center;
       position: relative;
       box-sizing: border-box;
       overflow: hidden;
    }
    .p12-card-accent-top {
       position: absolute; top: 0; left: 0; right: 0; height: 6px;
    }
    .accent-blue { background: #0F4780; }
    .accent-red { background: #F14343; }
    .accent-yellow { background: #FFCC00; }

    /* CARD 1 (SOCIAL): Mais alto (380px) e subindo na diagonal (-210px) para preencher o vazio da esquerda */
    .p12-card-1 {
       height: 380px;
       transform: translateY(-210px);
       border: 2px solid rgba(15, 71, 128, 0.22);
       box-shadow: 0 20px 45px -4px rgba(15, 71, 128, 0.18);
    }
    /* CARD 2 (INFORMATIVO): Intermediário (320px) em -105px */
    .p12-card-2 {
       height: 320px;
       transform: translateY(-105px);
       border: 2px solid rgba(241, 67, 67, 0.22);
       box-shadow: 0 18px 40px -4px rgba(241, 67, 67, 0.16);
    }
    /* CARD 3 (FERRAMENTAS): Compacto (260px) em 0px (o tamanho original aprovado) */
    .p12-card-3 {
       height: 260px;
       transform: translateY(0);
       border: 2.5px solid rgba(255, 204, 0, 0.45);
       box-shadow: 0 16px 36px -4px rgba(217, 119, 6, 0.16);
    }

    .p12-card-icon-badge {
       width: 56px; height: 56px; border-radius: 50%;
       display: flex; align-items: center; justify-content: center;
       margin-bottom: 8px;
       flex-shrink: 0;
    }
    .p12-card-icon-badge.badge-blue { background: rgba(15, 71, 128, 0.10); color: #0F4780; border: 1.5px solid rgba(15, 71, 128, 0.25); }
    .p12-card-icon-badge.badge-red { background: rgba(241, 67, 67, 0.10); color: #F14343; border: 1.5px solid rgba(241, 67, 67, 0.25); }
    .p12-card-icon-badge.badge-yellow { background: rgba(255, 204, 0, 0.22); color: #854D0E; border: 1.5px solid #FFCC00; }
    
    .p12-card h3 { font-size: 32px; font-weight: 900; line-height: 1.1; margin-bottom: 4px; }
    
    /* SUBTÍTULOS E DESTAQUES COM FONTES GRANDES E LEGÍVEIS À DISTÂNCIA */
    .p12-card-lead {
       font-size: 23px;
       font-weight: 800;
       color: #1E293B;
       line-height: 1.25;
       margin-bottom: 12px;
       max-width: 310px;
    }
    
    .p12-card-highlights {
       display: flex;
       flex-direction: column;
       gap: 9px;
       width: 100%;
       margin-top: 4px;
       text-align: left;
    }
    .p12-highlight-item {
       display: flex;
       align-items: flex-start;
       gap: 10px;
       font-size: 21.5px;
       font-weight: 700;
       line-height: 1.30;
       color: #334155;
    }
    .p12-highlight-bullet {
       width: 9px;
       height: 9px;
       border-radius: 50%;
       flex-shrink: 0;
       margin-top: 9px;
    }
    .bullet-blue { background: #0F4780; box-shadow: 0 0 0 3px rgba(15, 71, 128, 0.15); }
    .bullet-red { background: #F14343; box-shadow: 0 0 0 3px rgba(241, 67, 67, 0.15); }
    .bullet-yellow { background: #D97706; box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.20); }

    /* RODAPÉ: QR CODE E SEGURANÇA EM UMA LINHA */
    .bottom-third-plane {
      position: absolute;
      bottom: 35px; left: 45px; right: 45px;
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
      width: 315px;
    }
    .qr-code-box {
      width: 315px; height: 315px;
      background: #FFFFFF;
      padding: 14px;
      border-radius: 26px;
      border: 2.5px solid rgba(15, 71, 128, 0.22);
      box-shadow: 0 18px 45px -4px rgba(15, 71, 128, 0.18), 0 4px 14px rgba(0, 0, 0, 0.06);
      position: relative;
      display: flex; align-items: center; justify-content: center;
    }
    .qr-code-box svg { width: 100%; height: 100%; display: block; }
    .qr-center-badge-img {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 82px; height: 82px;
      display: flex; align-items: center; justify-content: center;
      background: #FFFFFF;
      border-radius: 18px;
      padding: 5px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    }
    .qr-center-badge-img svg { width: 100%; height: 100%; display: block; }
    .qr-clean-link {
      font-size: 19px; font-weight: 800; color: #0F4780;
      text-decoration: underline; text-underline-offset: 4px;
      background: rgba(255, 255, 255, 0.95);
      padding: 6px 16px;
      border-radius: 999px;
      border: 1.5px solid rgba(15, 71, 128, 0.20);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
      white-space: nowrap;
    }

    .bottom-inst-box {
      flex: 1; height: 375px;
      background: #F8FAFC;
      border-radius: 30px;
      border: 2px solid #E2E8F0;
      padding: 22px 28px 18px 28px;
      display: flex; flex-direction: column; justify-content: space-between;
      box-shadow: 0 10px 28px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .inst-badge-line {
      display: flex; align-items: center; gap: 14px;
      color: #0F4780; font-size: 21.5px; font-weight: 900;
      white-space: nowrap;
      margin-bottom: 8px;
    }
    .inst-badge-icon {
      width: 44px; height: 44px; border-radius: 12px;
      background: #EEF4FA; color: #0F4780;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      border: 1.5px solid rgba(15, 71, 128, 0.20);
    }
    .inst-desc-text {
      font-size: 19.5px; line-height: 1.45; color: #334155;
    }
    .inst-actions-row { display: flex; align-items: center; gap: 16px; }
    .inst-action-card {
      flex: 1; background: #FFFFFF; border: 1.5px solid #CBD5E1;
      padding: 12px 16px; border-radius: 14px;
      display: flex; align-items: center; gap: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }
    .inst-action-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .inst-action-icon.git-icon { background: #EEF4FA; color: #0F4780; }
    .inst-action-icon.email-icon { background: #FEF2F2; color: #F14343; }
    .inst-action-details { display: flex; flex-direction: column; gap: 3px; }
    .inst-action-tag { font-size: 15px; font-weight: 800; text-transform: uppercase; }
    .inst-action-tag.tag-git { color: #0F4780; }
    .inst-action-tag.tag-email { color: #F14343; }
    .inst-action-val { font-size: 19.5px; font-weight: 700; color: #0F172A; white-space: nowrap; }
    .inst-legal-copy {
      font-size: 16.5px; color: #64748B; font-weight: 600;
      border-top: 1.5px solid #E2E8F0; padding-top: 10px; text-align: center;
    }
  </style>
</head>
<body>
  <div class="poster-container">
    <div class="brand-gradient-line-top"></div>
    <div class="p12-diagonal"></div>
    <div class="bg-math-pattern"></div>

    <div class="p12-content">
      <!-- CABEÇALHO ESQUERDO -->
      <div class="p12-header">
        <div class="p12-badge font-bukra">Laboratório de Expressão e Divulgação do IFUSP</div>
        <h1 class="font-bukra">HUB LabDiv:<br>Conectando você à universidade.</h1>
        <p class="font-open-sans p12-subline">Comunidade, conhecimento e ferramentas na palma da mão.</p>
      </div>

      <!-- COLUNA HERO DIREITA: ÍCONE COM DEGRADÊ + "HUB LabDiv" -->
      <div class="p12-right-hero-col">
        <div class="p12-icon-wrapper">
          <div class="p12-icon-inner">
            ${capeloSvg}
          </div>
        </div>

        <div class="p12-icon-branding">
          <div class="p12-brand-title font-bukra">
            <span class="hub-white">HUB</span> <span class="labdiv-gradient">LabDiv</span>
          </div>
        </div>
      </div>

      <!-- CARDS COM ALTURAS PROGRESSIVAS E FONTES GRANDES DE ALTO IMPACTO -->
      <div class="p12-cards-grid">
        <!-- Eixo 1: Social (Mais alto e elevado para preencher o vazio da esquerda) -->
        <div class="p12-card p12-card-1">
          <div class="p12-card-accent-top accent-blue"></div>
          <div class="p12-card-icon-badge badge-blue">
            <svg width="32" height="32" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Z"/>
            </svg>
          </div>
          <h3 class="font-bukra" style="color: #0F4780;">Social</h3>
          <div class="font-bukra p12-card-lead">Rede comunicativa &amp; pedagógica</div>

          <div class="p12-card-highlights font-open-sans">
            <div class="p12-highlight-item">
              <span class="p12-highlight-bullet bullet-blue"></span>
              <span>Feeds de Artigos &amp; Logs</span>
            </div>
            <div class="p12-highlight-item">
              <span class="p12-highlight-bullet bullet-blue"></span>
              <span>Divulgação Gamificada</span>
            </div>
            <div class="p12-highlight-item">
              <span class="p12-highlight-bullet bullet-blue"></span>
              <span>Dicas Reais de Veteranos</span>
            </div>
          </div>
        </div>

        <!-- Eixo 2: Informativo (Intermediário) -->
        <div class="p12-card p12-card-2">
          <div class="p12-card-accent-top accent-red"></div>
          <div class="p12-card-icon-badge badge-red">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
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
          <h3 class="font-bukra" style="color: #F14343;">Informativo</h3>
          <div class="font-bukra p12-card-lead">Enciclopédia acadêmica viva</div>

          <div class="p12-card-highlights font-open-sans">
            <div class="p12-highlight-item">
              <span class="p12-highlight-bullet bullet-red"></span>
              <span>Grades dos 3 Cursos</span>
            </div>
            <div class="p12-highlight-item">
              <span class="p12-highlight-bullet bullet-red"></span>
              <span>Docentes, Salas &amp; Bolsas</span>
            </div>
            <div class="p12-highlight-item">
              <span class="p12-highlight-bullet bullet-red"></span>
              <span>Colóquios &amp; Notícias IF</span>
            </div>
          </div>
        </div>

        <!-- Eixo 3: Ferramentas (Tamanho compacto original de 260px) -->
        <div class="p12-card p12-card-3">
          <div class="p12-card-accent-top accent-yellow"></div>
          <div class="p12-card-icon-badge badge-yellow">
            <svg width="32" height="32" viewBox="0 -960 960 960" fill="currentColor">
              <path d="M756-120 537-339l84-84 219 219-84 84Zm-552 0-84-84 276-276-68-68-28 28-51-51v82l-28 28-121-121 28-28h82l-50-50 142-142q20-20 43-29t47-9q24 0 47 9t43 29l-92 92 50 50-28 28 68 68 90-90q-4-11-6.5-23t-2.5-24q0-59 40.5-99.5T701-841q15 0 28.5 3t27.5 9l-99 99 72 72 99-99q7 14 9.5 27.5T841-701q0 59-40.5 99.5T701-561q-12 0-24-2t-23-7L204-120Z"/>
            </svg>
          </div>
          <h3 class="font-bukra" style="color: #854D0E;">Ferramentas</h3>
          <div class="font-bukra p12-card-lead">Funções de apoio diário</div>

          <div class="p12-card-highlights font-open-sans">
            <div class="p12-highlight-item">
              <span class="p12-highlight-bullet bullet-yellow"></span>
              <span>Mapa &amp; Circulares USP</span>
            </div>
            <div class="p12-highlight-item">
              <span class="p12-highlight-bullet bullet-yellow"></span>
              <span>Simulador de Horas AEx</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TERCEIRO PLANO: QR CODE E SEGURANÇA EM UMA LINHA -->
    <div class="bottom-third-plane">
      
      <div class="bottom-qr-col">
        <div class="qr-code-box" style="border-color: #0F478040;">
          ${qrSvg}

          <div class="qr-center-badge-img">
            ${capeloSvg}
          </div>
        </div>
        <a class="qr-clean-link font-bukra" style="color: #0F4780;" href="https://hub-lab-div.vercel.app/divulgacao">hub-lab-div.vercel.app/divulgacao</a>
      </div>
    
      <div class="bottom-inst-box">
        <div>
          <!-- SEGURANÇA & CONFORMIDADE LEGAL EM UMA LINHA SÓ -->
          <div class="inst-badge-line font-bukra">
            <div class="inst-badge-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <span>SEGURANÇA &amp; CONFORMIDADE LEGAL</span>
          </div>
          <!-- TEXTO QUEBRADO NO BRASIL E CONTINUA EMBAIXO -->
          <p class="inst-desc-text font-open-sans">
            <span style="white-space: nowrap;">O <strong>HUB LabDiv</strong> respeita as <strong>leis, normas e decisões judiciais do Brasil</strong>,</span><br>
            além de ter todo o seu <strong>código aberto</strong> e um e-mail para <strong>suporte, sugestões e ideias da comunidade</strong>.
          </p>
        </div>

        <div class="inst-actions-row font-bukra">
          <div class="inst-action-card">
            <div class="inst-action-icon git-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
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
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
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
</html>`;
}

async function renderHtmlToPng(browser, htmlPath, outPngPath, previewPath = null) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 2 });
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: outPngPath,
    type: 'png',
    clip: { x: 0, y: 0, width: 1240, height: 1754 }
  });
  console.log(`✅ Gerado: ${outPngPath}`);

  if (previewPath) {
    const previewPage = await browser.newPage();
    await previewPage.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 0.5 });
    await previewPage.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await previewPage.evaluateHandle('document.fonts.ready');
    await new Promise(r => setTimeout(r, 400));
    await previewPage.screenshot({
      path: previewPath,
      type: 'png',
      clip: { x: 0, y: 0, width: 1240, height: 1754 }
    });
    await previewPage.close();
    console.log(`✅ Preview gerado: ${previewPath}`);
  }

  await page.close();
}

async function main() {
  console.log('🔄 Processando versão única oficial do Poster 1 com fontes grandes e card esquerdo expandido...');

  // 1. Gerar QR code SVG com alta correção de erro
  const qrSvgRaw = await QRCode.toString('https://hub-lab-div.vercel.app/divulgacao', {
    type: 'svg',
    errorCorrectionLevel: 'H',
    margin: 1
  });
  const qrSvg = qrSvgRaw.replace(/<\?xml[^>]*\?>/gi, '').trim();

  // 2. Ler Capelo SVG oficial
  const capeloSvgPath = path.join(PROJECT_ROOT, 'public/icone-HUBLabDiv.svg');
  let capeloSvg = '';
  if (fs.existsSync(capeloSvgPath)) {
    capeloSvg = fs.readFileSync(capeloSvgPath, 'utf8')
      .replace(/<\?xml[^>]*\?>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .trim();
  }

  // 3. Montar e salvar arquivo HTML oficial do Poster 1
  const htmlPoster1 = buildPosterHtml({ qrSvg, capeloSvg });
  const htmlPoster1Path = path.join(POSTER1_DIR, 'poster.html');
  fs.writeFileSync(htmlPoster1Path, htmlPoster1, 'utf8');
  console.log('✅ Arquivo poster.html atualizado com sucesso!');

  // 4. Iniciar Puppeteer para renderizar a 300 DPI (deviceScaleFactor: 2)
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1240, height: 1754, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });

  console.log('🚀 Renderizando Poster 1 oficial em alta resolução (300 DPI)...');
  const pngPath = path.join(POSTER1_DIR, 'poster1.png');
  const previewPath = path.join(ARTIFACT_DIR, 'poster1_preview.png');
  await renderHtmlToPng(browser, htmlPoster1Path, pngPath, previewPath);

  await browser.close();
  console.log('🎉 Poster 1 gerado com sucesso!');
}

main().catch(err => {
  console.error('❌ Erro no script:', err);
  process.exit(1);
});
