/**
 * HUB LabDiv - Software Livre sob Licença AGPLv3.
 * Copyright (C) 2026 HUB LabDiv
 *
 * Este programa é um software livre; você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU como publicada pela
 * Free Software Foundation, versão 3 da Licença.
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const outputDir = path.join(projectRoot, 'public', 'presentation', 'slides');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Brand Colors
const BRAND = {
  bgDark: '#121212',
  surfaceDark: '#1E1E1E',
  surfaceCard: 'rgba(30, 30, 30, 0.85)',
  borderCard: 'rgba(255, 255, 255, 0.1)',
  blue: '#0F4780',
  red: '#F14343',
  yellow: '#FFCC00',
  textLight: '#E2E8F0',
  textMuted: '#94A3B8',
  white: '#FFFFFF'
};

const slides = [
  // -------------------------------------------------------------
  // SLIDE 01: Capa (Title Slide)
  // -------------------------------------------------------------
  {
    num: '01',
    name: 'slide-01-capa.png',
    title: 'Capa da Apresentação',
    renderHtml: () => `
      <div style="position: absolute; left: 120px; top: 200px; width: 920px; background: ${BRAND.surfaceCard}; backdrop-filter: blur(16px); border-radius: 20px; border: 1px solid ${BRAND.borderCard}; border-left: 8px solid ${BRAND.yellow}; padding: 50px; box-shadow: 0 25px 60px rgba(0,0,0,0.6);">
        <div style="display: inline-flex; align-items: center; gap: 10px; padding: 6px 18px; background: rgba(15, 71, 128, 0.4); border: 1px solid ${BRAND.blue}; color: ${BRAND.yellow}; font-size: 13px; font-weight: 700; border-radius: 20px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px;">
          HUB LABDIV • INSTITUTO DE FÍSICA - USP
        </div>
        <h1 style="color: ${BRAND.white}; font-size: 46px; font-weight: 800; line-height: 1.25; margin-bottom: 20px; text-shadow: 0 4px 12px rgba(0,0,0,0.4);">
          Processos Criativos: Fotografia, Webdesign e a Plataforma HUB LabDiv
        </h1>
        <p style="color: ${BRAND.textMuted}; font-size: 22px; font-weight: 400; line-height: 1.5; margin-bottom: 30px;">
          Comunicação vs. Extensão na Prática do Caderno do Artista
        </p>
        <div style="display: flex; align-items: center; gap: 15px; border-top: 1px solid ${BRAND.borderCard}; padding-top: 20px;">
          <div style="width: 42px; height: 42px; border-radius: 50%; background: ${BRAND.yellow}; color: ${BRAND.bgDark}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px;">IF</div>
          <div>
            <div style="color: ${BRAND.white}; font-size: 15px; font-weight: 700;">Laboratório de Divulgação Científica e Ensino de Física</div>
            <div style="color: ${BRAND.textMuted}; font-size: 13px;">Universidade de São Paulo</div>
          </div>
        </div>
      </div>
    `
  },

  // -------------------------------------------------------------
  // SLIDE 02: Objetivos da Aula
  // -------------------------------------------------------------
  {
    num: '02',
    name: 'slide-02-objetivos.png',
    title: 'Objetivos da Aula',
    renderHtml: () => `
      <div style="padding: 60px 100px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 35px;">
          <div>
            <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">01. DIRETRIZES DA AULA</div>
            <h2 style="color: ${BRAND.white}; font-size: 36px; font-weight: 800; margin-top: 4px;">Objetivos da Aula</h2>
          </div>
          <div style="padding: 6px 16px; background: rgba(255, 204, 0, 0.1); border: 1px solid ${BRAND.yellow}; color: ${BRAND.yellow}; font-size: 13px; font-weight: 700; border-radius: 20px;">2 HORAS / 120 MIN</div>
        </div>

        <!-- Card Geral -->
        <div style="background: ${BRAND.surfaceCard}; border-radius: 16px; border: 1px solid ${BRAND.borderCard}; border-left: 6px solid ${BRAND.blue}; padding: 28px; margin-bottom: 28px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">
          <div style="color: ${BRAND.yellow}; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">OBJETIVO GERAL</div>
          <p style="color: ${BRAND.textLight}; font-size: 18px; line-height: 1.5; font-weight: 500;">
            Estimular a expressão criativa através da fotografia e do webdesign, abordar o dilema Comunicação x Extensão na perspectiva freiriana e apresentar a plataforma HUB LabDiv como opção para o envio do caderno do artista.
          </p>
        </div>

        <!-- Grid Específicos -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div style="background: ${BRAND.surfaceCard}; border-radius: 14px; border: 1px solid ${BRAND.borderCard}; padding: 22px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span style="background: ${BRAND.blue}; color: ${BRAND.white}; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;">1</span>
              <span style="color: ${BRAND.white}; font-size: 16px; font-weight: 700;">Questionário & Aceite</span>
            </div>
            <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.4;">Aplicar o questionário piloto garantindo o Termo de Aceite e mapeamento do perfil dos usuários.</p>
          </div>

          <div style="background: ${BRAND.surfaceCard}; border-radius: 14px; border: 1px solid ${BRAND.borderCard}; padding: 22px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span style="background: ${BRAND.yellow}; color: ${BRAND.bgDark}; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;">2</span>
              <span style="color: ${BRAND.white}; font-size: 16px; font-weight: 700;">Base Teórica</span>
            </div>
            <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.4;">Diferenciar conceitualmente "Comunicação" de "Divulgação" com base em Paulo Freire.</p>
          </div>

          <div style="background: ${BRAND.surfaceCard}; border-radius: 14px; border: 1px solid ${BRAND.borderCard}; padding: 22px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span style="background: ${BRAND.red}; color: ${BRAND.white}; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;">3</span>
              <span style="color: ${BRAND.white}; font-size: 16px; font-weight: 700;">Demonstração ao Vivo</span>
            </div>
            <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.4;">Exibir a criação de uma postagem espontânea ao vivo, narrando o raciocínio criativo.</p>
          </div>

          <div style="background: ${BRAND.surfaceCard}; border-radius: 14px; border: 1px solid ${BRAND.borderCard}; padding: 22px;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <span style="background: ${BRAND.blue}; color: ${BRAND.white}; width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800;">4</span>
              <span style="color: ${BRAND.white}; font-size: 16px; font-weight: 700;">Post Teste dos Alunos</span>
            </div>
            <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.4;">Garantir que os alunos acessem o sistema e submetam um "post teste" com sucesso.</p>
          </div>
        </div>
      </div>
    `
  },

  // -------------------------------------------------------------
  // SLIDE 03: Cronograma da Aula
  // -------------------------------------------------------------
  {
    num: '03',
    name: 'slide-03-cronograma.png',
    title: 'Cronograma da Aula',
    renderHtml: () => `
      <div style="padding: 60px 100px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
          <div>
            <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">02. PLANEJAMENTO TEMPORAL</div>
            <h2 style="color: ${BRAND.white}; font-size: 36px; font-weight: 800; margin-top: 4px;">Cronograma da Aula (120 min)</h2>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Bloco 1 -->
          <div style="background: ${BRAND.surfaceCard}; border-radius: 14px; border: 1px solid ${BRAND.borderCard}; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="min-width: 140px; padding: 8px 14px; background: rgba(15, 71, 128, 0.5); border: 1px solid ${BRAND.blue}; color: ${BRAND.yellow}; font-size: 14px; font-weight: 800; border-radius: 10px; text-align: center;">00:00 - 00:10 (10 min)</div>
              <div>
                <div style="color: ${BRAND.white}; font-size: 17px; font-weight: 700;">Questionário & Preparação</div>
                <div style="color: ${BRAND.textMuted}; font-size: 13.5px;">Projeção do QR Code e formulário impresso. Mapeamento demográfico e acolhimento.</div>
              </div>
            </div>
            <div style="padding: 6px 14px; background: rgba(255,255,255,0.05); color: ${BRAND.textMuted}; font-size: 12px; font-weight: 600; border-radius: 20px;">Fase 1</div>
          </div>

          <!-- Bloco 2 -->
          <div style="background: ${BRAND.surfaceCard}; border-radius: 14px; border: 1px solid ${BRAND.borderCard}; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="min-width: 140px; padding: 8px 14px; background: rgba(255, 204, 0, 0.15); border: 1px solid ${BRAND.yellow}; color: ${BRAND.yellow}; font-size: 14px; font-weight: 800; border-radius: 10px; text-align: center;">00:10 - 00:35 (25 min)</div>
              <div>
                <div style="color: ${BRAND.white}; font-size: 17px; font-weight: 700;">Introdução ao Webdesign & Fotografia</div>
                <div style="color: ${BRAND.textMuted}; font-size: 13.5px;">Apresentação do portfólio (aurtistic.vercel.app), olhar com celular e HTML/CSS via CodePen.</div>
              </div>
            </div>
            <div style="padding: 6px 14px; background: rgba(255,255,255,0.05); color: ${BRAND.textMuted}; font-size: 12px; font-weight: 600; border-radius: 20px;">Fase 2</div>
          </div>

          <!-- Bloco 3 -->
          <div style="background: ${BRAND.surfaceCard}; border-radius: 14px; border: 1px solid ${BRAND.borderCard}; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="min-width: 140px; padding: 8px 14px; background: rgba(241, 67, 67, 0.2); border: 1px solid ${BRAND.red}; color: ${BRAND.white}; font-size: 14px; font-weight: 800; border-radius: 10px; text-align: center;">00:35 - 01:00 (25 min)</div>
              <div>
                <div style="color: ${BRAND.white}; font-size: 17px; font-weight: 700;">Base Teórica: Extensão ou Comunicação?</div>
                <div style="color: ${BRAND.textMuted}; font-size: 13.5px;">Leitura de 5 trechos da obra de Paulo Freire e o surgimento da perspectiva do HUB LabDiv.</div>
              </div>
            </div>
            <div style="padding: 6px 14px; background: rgba(255,255,255,0.05); color: ${BRAND.textMuted}; font-size: 12px; font-weight: 600; border-radius: 20px;">Fase 3</div>
          </div>

          <!-- Bloco 4 -->
          <div style="background: ${BRAND.surfaceCard}; border-radius: 14px; border: 1px solid ${BRAND.borderCard}; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="min-width: 140px; padding: 8px 14px; background: rgba(15, 71, 128, 0.5); border: 1px solid ${BRAND.blue}; color: ${BRAND.yellow}; font-size: 14px; font-weight: 800; border-radius: 10px; text-align: center;">01:00 - 01:15 (15 min)</div>
              <div>
                <div style="color: ${BRAND.white}; font-size: 17px; font-weight: 700;">Demonstração Prática da Plataforma</div>
                <div style="color: ${BRAND.textMuted}; font-size: 13.5px;">Navegação na interface do HUB e criação de um post do zero ao vivo narrando a intenção.</div>
              </div>
            </div>
            <div style="padding: 6px 14px; background: rgba(255,255,255,0.05); color: ${BRAND.textMuted}; font-size: 12px; font-weight: 600; border-radius: 20px;">Fase 4</div>
          </div>

          <!-- Bloco 5 -->
          <div style="background: ${BRAND.surfaceCard}; border-radius: 14px; border: 1px solid ${BRAND.borderCard}; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 20px;">
              <div style="min-width: 140px; padding: 8px 14px; background: rgba(255, 204, 0, 0.2); border: 1px solid ${BRAND.yellow}; color: ${BRAND.yellow}; font-size: 14px; font-weight: 800; border-radius: 10px; text-align: center;">01:15 - 02:00 (45 min)</div>
              <div>
                <div style="color: ${BRAND.white}; font-size: 17px; font-weight: 700;">Execução Hands-on dos Alunos</div>
                <div style="color: ${BRAND.textMuted}; font-size: 13.5px;">Alunos utilizam a plataforma para criar e publicar o primeiro post (Caderno do Artista).</div>
              </div>
            </div>
            <div style="padding: 6px 14px; background: rgba(255,255,255,0.05); color: ${BRAND.textMuted}; font-size: 12px; font-weight: 600; border-radius: 20px;">Fase 5</div>
          </div>
        </div>
      </div>
    `
  },

  // -------------------------------------------------------------
  // SLIDE 04: Fotografia & Olhar no Dia a Dia
  // -------------------------------------------------------------
  {
    num: '04',
    name: 'slide-04-fotografia.png',
    title: 'Fotografia e Olhar no Dia a Dia',
    renderHtml: () => `
      <div style="padding: 60px 100px;">
        <div style="margin-bottom: 35px;">
          <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">03. FOTOGRAFIA & EXPRESSÃO VISUAL</div>
          <h2 style="color: ${BRAND.white}; font-size: 36px; font-weight: 800; margin-top: 4px;">Fotografia e Olhar no Dia a Dia</h2>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
          <div style="background: ${BRAND.surfaceCard}; border-radius: 18px; border: 1px solid ${BRAND.borderCard}; padding: 36px; box-shadow: 0 15px 40px rgba(0,0,0,0.5);">
            <div style="display: inline-block; padding: 6px 14px; background: rgba(15,71,128,0.4); color: ${BRAND.yellow}; border: 1px solid ${BRAND.blue}; font-size: 12px; font-weight: 700; border-radius: 20px; margin-bottom: 20px; text-transform: uppercase;">PERCEPÇÃO PRÁTICA</div>
            <h3 style="color: ${BRAND.white}; font-size: 22px; font-weight: 700; margin-bottom: 16px;">O Olhar Através da Câmera do Celular</h3>
            <p style="color: ${BRAND.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
              Tirar fotos é uma forma prática de encarar o mundo de outra perspectiva. Começar pelo celular é mais simples justamente por eliminar a sobrecarga inicial do triângulo de exposição.
            </p>
            <p style="color: ${BRAND.textMuted}; font-size: 15px; line-height: 1.5;">
              O foco recai sobre o enquadramento, a luz do ambiente e a narrativa do sujeito.
            </p>
          </div>

          <div style="background: ${BRAND.surfaceCard}; border-radius: 18px; border: 1px solid ${BRAND.borderCard}; border-top: 4px solid ${BRAND.yellow}; padding: 36px; box-shadow: 0 15px 40px rgba(0,0,0,0.5);">
            <div style="display: inline-block; padding: 6px 14px; background: rgba(255,204,0,0.15); color: ${BRAND.yellow}; border: 1px solid ${BRAND.yellow}; font-size: 12px; font-weight: 700; border-radius: 20px; margin-bottom: 20px; text-transform: uppercase;">PORTFÓLIO DE REFERÊNCIA</div>
            <h3 style="color: ${BRAND.white}; font-size: 22px; font-weight: 700; margin-bottom: 12px;">aurtistic.vercel.app</h3>
            <p style="color: ${BRAND.textLight}; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              Apresentação de trabalhos autorais em fotografia e projetos de webdesign.
            </p>
            <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 18px; border: 1px dashed ${BRAND.borderCard};">
              <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; margin-bottom: 6px;">Caderno do Artista</div>
              <div style="color: ${BRAND.textMuted}; font-size: 13.5px;">Diário de bordo para registrar ensaios, testes visuais e reflexões durante a disciplina.</div>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // -------------------------------------------------------------
  // SLIDE 05: Webdesign: Código como Pincel Digital
  // -------------------------------------------------------------
  {
    num: '05',
    name: 'slide-05-webdesign.png',
    title: 'Webdesign: Código como Pincel Digital',
    renderHtml: () => `
      <div style="padding: 60px 100px;">
        <div style="margin-bottom: 30px;">
          <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">04. DESIGN PROGRAMADO</div>
          <h2 style="color: ${BRAND.white}; font-size: 36px; font-weight: 800; margin-top: 4px;">Webdesign: O Código como Pincel Digital</h2>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px;">
          <div style="background: ${BRAND.surfaceCard}; border-radius: 16px; border: 1px solid ${BRAND.borderCard}; padding: 28px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(15,71,128,0.4); color: ${BRAND.yellow}; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 16px;">&lt;&gt;</div>
            <h3 style="color: ${BRAND.white}; font-size: 18px; font-weight: 700; margin-bottom: 12px;">Arte Vetorial vs. Código</h3>
            <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.5;">
              Usamos os mesmos conceitos de design (harmonia, contraste, hierarquia), mas ao invés de mover um pincel estático, definimos regras através de código.
            </p>
          </div>

          <div style="background: ${BRAND.surfaceCard}; border-radius: 16px; border: 1px solid ${BRAND.borderCard}; padding: 28px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(255,204,0,0.15); color: ${BRAND.yellow}; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 16px;">HTML</div>
            <h3 style="color: ${BRAND.white}; font-size: 18px; font-weight: 700; margin-bottom: 12px;">Estrutura do Documento</h3>
            <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.5;">
              O HTML é a estrutura bruta de texto simples. É a organização hierárquica das ideias e conteúdos antes da camada estética.
            </p>
          </div>

          <div style="background: ${BRAND.surfaceCard}; border-radius: 16px; border: 1px solid ${BRAND.borderCard}; padding: 28px;">
            <div style="width: 40px; height: 40px; border-radius: 10px; background: rgba(241,67,67,0.2); color: ${BRAND.red}; display: flex; align-items: center; justify-content: center; font-weight: 800; margin-bottom: 16px;">CSS</div>
            <h3 style="color: ${BRAND.white}; font-size: 18px; font-weight: 700; margin-bottom: 12px;">Estética e Atmosfera</h3>
            <p style="color: ${BRAND.textMuted}; font-size: 14px; line-height: 1.5;">
              O CSS dá vida ao documento através de cores, tipografia, espaçamentos e transições, transformando o texto bruto em uma experiência visual.
            </p>
          </div>
        </div>

        <div style="margin-top: 24px; background: rgba(0,0,0,0.3); border-radius: 14px; padding: 20px 28px; border: 1px solid ${BRAND.borderCard}; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="color: ${BRAND.white}; font-size: 16px; font-weight: 700;">Prática Interativa no CodePen (codepen.io)</div>
            <div style="color: ${BRAND.textMuted}; font-size: 13.5px;">Montando uma estrutura HTML simples e transformando em tempo real com CSS.</div>
          </div>
          <div style="padding: 8px 20px; background: ${BRAND.yellow}; color: ${BRAND.bgDark}; font-size: 13px; font-weight: 800; border-radius: 20px; text-transform: uppercase;">Acessar CodePen</div>
        </div>
      </div>
    `
  },

  // -------------------------------------------------------------
  // SLIDE 06: Base Teórica: Extensão ou Comunicação?
  // -------------------------------------------------------------
  {
    num: '06',
    name: 'slide-06-teoria.png',
    title: 'Base Teórica: Extensão ou Comunicação?',
    renderHtml: () => `
      <div style="padding: 60px 100px;">
        <div style="margin-bottom: 35px;">
          <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">05. FUNDAMENTAÇÃO TEÓRICA</div>
          <h2 style="color: ${BRAND.white}; font-size: 36px; font-weight: 800; margin-top: 4px;">Extensão ou Comunicação? — Paulo Freire</h2>
        </div>

        <div style="background: ${BRAND.surfaceCard}; border-radius: 20px; border: 1px solid ${BRAND.borderCard}; border-left: 8px solid ${BRAND.yellow}; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
          <div style="color: ${BRAND.yellow}; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px;">O DILEMA FREIRIANO</div>
          <h3 style="color: ${BRAND.white}; font-size: 24px; font-weight: 700; line-height: 1.4; margin-bottom: 20px;">
            A diferença entre apenas "divulgar" conteúdos e verdadeiramente "comunicar" com o outro.
          </h3>
          <p style="color: ${BRAND.textLight}; font-size: 17px; line-height: 1.6; margin-bottom: 24px;">
            Através da leitura de 5 páginas selecionadas do livro de Paulo Freire, discutiremos como a plataforma <strong>HUB LabDiv</strong> surge para superar a entrega passiva e criar um ecossistema dialógico na divulgação científica e nos processos criativos.
          </p>

          <div style="display: flex; gap: 15px; flex-wrap: wrap;">
            <span style="padding: 6px 14px; background: rgba(255,255,255,0.06); border: 1px solid ${BRAND.borderCard}; color: ${BRAND.textMuted}; font-size: 13px; border-radius: 20px;">Página 12: A Relação de Extensão</span>
            <span style="padding: 6px 14px; background: rgba(255,255,255,0.06); border: 1px solid ${BRAND.borderCard}; color: ${BRAND.textMuted}; font-size: 13px; border-radius: 20px;">Página 35: Divulgar vs Comunicar</span>
            <span style="padding: 6px 14px; background: rgba(255,255,255,0.06); border: 1px solid ${BRAND.borderCard}; color: ${BRAND.textMuted}; font-size: 13px; border-radius: 20px;">Página 48: Pensar a Realidade</span>
            <span style="padding: 6px 14px; background: rgba(255,255,255,0.06); border: 1px solid ${BRAND.borderCard}; color: ${BRAND.textMuted}; font-size: 13px; border-radius: 20px;">Página 50: Capacidade Transformadora</span>
            <span style="padding: 6px 14px; background: rgba(255,255,255,0.06); border: 1px solid ${BRAND.borderCard}; color: ${BRAND.textMuted}; font-size: 13px; border-radius: 20px;">Página 52: Práxis Dialógica</span>
          </div>
        </div>
      </div>
    `
  },

  // -------------------------------------------------------------
  // SLIDE 07: Paulo Freire (Página 12): Extensão Passiva
  // -------------------------------------------------------------
  {
    num: '07',
    name: 'slide-07-freire-p12.png',
    title: 'Paulo Freire (Página 12): Extensão Passiva',
    renderHtml: () => `
      <div style="padding: 60px 100px;">
        <div style="margin-bottom: 30px;">
          <div style="color: ${BRAND.red}; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">06. PAULO FREIRE — PÁGINA 12</div>
          <h2 style="color: ${BRAND.white}; font-size: 36px; font-weight: 800; margin-top: 4px;">A Critica à Extensão Passiva</h2>
        </div>

        <div style="background: ${BRAND.surfaceCard}; border-radius: 18px; border: 1px solid ${BRAND.borderCard}; border-left: 6px solid ${BRAND.red}; padding: 36px; box-shadow: 0 15px 40px rgba(0,0,0,0.5);">
          <div style="color: ${BRAND.white}; font-size: 20px; font-weight: 600; font-style: italic; line-height: 1.5; margin-bottom: 24px;">
            "Onde o pesquisador ou aluno apenas transmite aquele objeto a alguém de fora da universidade, separando-o de seu contexto, não deixando o alvo da divulgação assumir um papel ativo."
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; border-top: 1px solid ${BRAND.borderCard}; padding-top: 24px;">
            <div>
              <div style="color: ${BRAND.red}; font-size: 15px; font-weight: 700; margin-bottom: 6px;">Passividade</div>
              <div style="color: ${BRAND.textMuted}; font-size: 13.5px; line-height: 1.4;">O receptor não assume papel ativo na construção daquele conhecimento.</div>
            </div>
            <div>
              <div style="color: ${BRAND.red}; font-size: 15px; font-weight: 700; margin-bottom: 6px;">Isolamento</div>
              <div style="color: ${BRAND.textMuted}; font-size: 13.5px; line-height: 1.4;">O divulgador fica privado de saber como o conteúdo foi realmente compreendido.</div>
            </div>
            <div>
              <div style="color: ${BRAND.red}; font-size: 15px; font-weight: 700; margin-bottom: 6px;">Sem Aprendizado Real</div>
              <div style="color: ${BRAND.textMuted}; font-size: 13.5px; line-height: 1.4;">Falta de mecanismos para avaliar a verdadeira apreensão do objeto.</div>
            </div>
          </div>
        </div>
      </div>
    `
  },

  // -------------------------------------------------------------
  // SLIDE 08: Paulo Freire (Página 35): Divulgar vs. Comunicar
  // -------------------------------------------------------------
  {
    num: '08',
    name: 'slide-08-freire-p35.png',
    title: 'Paulo Freire (Página 35): Divulgar vs. Comunicar',
    renderHtml: () => `
      <div style="padding: 60px 100px;">
        <div style="margin-bottom: 30px;">
          <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">07. PAULO FREIRE — PÁGINA 35</div>
          <h2 style="color: ${BRAND.white}; font-size: 36px; font-weight: 800; margin-top: 4px;">Divulgar vs. Comunicar</h2>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
          <div style="background: ${BRAND.surfaceCard}; border-radius: 18px; border: 1px solid ${BRAND.borderCard}; border-top: 4px solid ${BRAND.red}; padding: 32px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <span style="color: ${BRAND.red}; font-size: 18px; font-weight: 800; text-transform: uppercase;">DIVULGAR</span>
              <span style="padding: 4px 12px; background: rgba(241,67,67,0.2); color: ${BRAND.red}; font-size: 12px; font-weight: 700; border-radius: 12px;">UNILATERAL</span>
            </div>
            <h4 style="color: ${BRAND.white}; font-size: 20px; font-weight: 700; margin-bottom: 12px;">Comunicar A SOBRE B</h4>
            <p style="color: ${BRAND.textMuted}; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
              Relação de depósito: o emissor possui a verdade e a entrega para um receptor passivo.
            </p>
            <div style="color: ${BRAND.textMuted}; font-size: 13.5px; font-style: italic; border-top: 1px solid ${BRAND.borderCard}; padding-top: 12px;">
              Mantém a separação entre o universitário e a comunidade.
            </div>
          </div>

          <div style="background: ${BRAND.surfaceCard}; border-radius: 18px; border: 1px solid ${BRAND.borderCard}; border-top: 4px solid ${BRAND.yellow}; padding: 32px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <span style="color: ${BRAND.yellow}; font-size: 18px; font-weight: 800; text-transform: uppercase;">COMUNICAR</span>
              <span style="padding: 4px 12px; background: rgba(255,204,0,0.2); color: ${BRAND.yellow}; font-size: 12px; font-weight: 700; border-radius: 12px;">DIALÓGICO</span>
            </div>
            <h4 style="color: ${BRAND.white}; font-size: 20px; font-weight: 700; margin-bottom: 12px;">Comunicar COM A SOBRE B</h4>
            <p style="color: ${BRAND.textMuted}; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
              Relação de co-construção: a realidade e o objeto são debatidos e compreendidos conjuntamente.
            </p>
            <div style="color: ${BRAND.yellow}; font-size: 13.5px; font-weight: 600; border-top: 1px solid ${BRAND.borderCard}; padding-top: 12px;">
              Visão adotada pela plataforma HUB LabDiv.
            </div>
          </div>
        </div>
      </div>
    `
  },

  // -------------------------------------------------------------
  // SLIDE 09: Paulo Freire (Págs. 48 & 50): Realidade & Transformação
  // -------------------------------------------------------------
  {
    num: '09',
    name: 'slide-09-freire-p48-50.png',
    title: 'Paulo Freire (Págs. 48 & 50): Realidade & Transformação',
    renderHtml: () => `
      <div style="padding: 60px 100px;">
        <div style="margin-bottom: 30px;">
          <div style="color: ${BRAND.blue}; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">08. PAULO FREIRE — PÁGINAS 48 & 50</div>
          <h2 style="color: ${BRAND.white}; font-size: 36px; font-weight: 800; margin-top: 4px;">Pensar a Realidade e a Transformação</h2>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
          <div style="background: ${BRAND.surfaceCard}; border-radius: 18px; border: 1px solid ${BRAND.borderCard}; border-left: 6px solid ${BRAND.blue}; padding: 32px;">
            <div style="color: ${BRAND.yellow}; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 10px;">PÁGINA 48</div>
            <h3 style="color: ${BRAND.white}; font-size: 22px; font-weight: 700; margin-bottom: 14px;">Pensar o Objeto no seu Contexto</h3>
            <p style="color: ${BRAND.textLight}; font-size: 15.5px; line-height: 1.6;">
              "Pensar sobre aquele objeto é pensar na realidade daquele objeto em questão." Não existe conhecimento autêntico desvinculado do contexto vivido.
            </p>
          </div>

          <div style="background: ${BRAND.surfaceCard}; border-radius: 18px; border: 1px solid ${BRAND.borderCard}; border-left: 6px solid ${BRAND.yellow}; padding: 32px;">
            <div style="color: ${BRAND.yellow}; font-size: 13px; font-weight: 700; text-transform: uppercase; margin-bottom: 10px;">PÁGINA 50</div>
            <h3 style="color: ${BRAND.white}; font-size: 22px; font-weight: 700; margin-bottom: 14px;">Capacidade Transformadora</h3>
            <p style="color: ${BRAND.textLight}; font-size: 15.5px; line-height: 1.6;">
              Entender um conceito em sua totalidade (relações homem-homem e homem-mundo) confere ao sujeito a capacidade de transformar ativamente sua própria realidade.
            </p>
          </div>
        </div>
      </div>
    `
  },

  // -------------------------------------------------------------
  // SLIDE 10: Paulo Freire (Página 52): A Importância da Práxis
  // -------------------------------------------------------------
  {
    num: '10',
    name: 'slide-10-freire-p52.png',
    title: 'Paulo Freire (Página 52): A Importância da Práxis',
    renderHtml: () => `
      <div style="padding: 60px 100px;">
        <div style="margin-bottom: 30px;">
          <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">09. PAULO FREIRE — PÁGINA 52</div>
          <h2 style="color: ${BRAND.white}; font-size: 36px; font-weight: 800; margin-top: 4px;">A Importância da Práxis Dialógica</h2>
        </div>

        <div style="background: ${BRAND.surfaceCard}; border-radius: 20px; border: 1px solid ${BRAND.borderCard}; padding: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
          <h3 style="color: ${BRAND.yellow}; font-size: 24px; font-weight: 700; margin-bottom: 16px;">Por que essa capacidade transformadora é fundamental?</h3>
          <p style="color: ${BRAND.textLight}; font-size: 18px; line-height: 1.6; margin-bottom: 24px;">
            A práxis não é um mero exercício teórico. É a ação refletida que emancipa o aluno e o pesquisador, permitindo que eles registrem sua trajetória no Caderno do Artista não como consumidores, mas como autores conscientes de seu tempo.
          </p>

          <div style="background: rgba(15,71,128,0.3); border-radius: 12px; padding: 20px; border: 1px solid ${BRAND.blue};">
            <div style="color: ${BRAND.white}; font-size: 15px; font-weight: 700; margin-bottom: 4px;">O Caderno do Artista no HUB LabDiv</div>
            <div style="color: ${BRAND.textMuted}; font-size: 14px;">Espaço para expressão contínua, onde o conceito se conecta diretamente com a experiência de cada estudante.</div>
          </div>
        </div>
      </div>
    `
  },

  // -------------------------------------------------------------
  // SLIDE 11: Demonstração do HUB LabDiv ao Vivo
  // -------------------------------------------------------------
  {
    num: '11',
    name: 'slide-11-demonstracao.png',
    title: 'Demonstração do HUB LabDiv ao Vivo',
    renderHtml: () => `
      <div style="padding: 60px 100px;">
        <div style="margin-bottom: 30px;">
          <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">10. PRÁTICA GUIADA</div>
          <h2 style="color: ${BRAND.white}; font-size: 36px; font-weight: 800; margin-top: 4px;">Demonstração ao Vivo do HUB LabDiv (15 min)</h2>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 18px;">
          <div style="background: ${BRAND.surfaceCard}; border-radius: 16px; border: 1px solid ${BRAND.borderCard}; padding: 22px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${BRAND.blue}; color: ${BRAND.white}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; margin-bottom: 14px;">01</div>
            <h4 style="color: ${BRAND.white}; font-size: 16px; font-weight: 700; margin-bottom: 8px;">Navegação</h4>
            <p style="color: ${BRAND.textMuted}; font-size: 13px; line-height: 1.4;">Apresentação da interface do HUB e visualização das trilhas e cadernos.</p>
          </div>

          <div style="background: ${BRAND.surfaceCard}; border-radius: 16px; border: 1px solid ${BRAND.borderCard}; padding: 22px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${BRAND.yellow}; color: ${BRAND.bgDark}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; margin-bottom: 14px;">02</div>
            <h4 style="color: ${BRAND.white}; font-size: 16px; font-weight: 700; margin-bottom: 8px;">Intenção</h4>
            <p style="color: ${BRAND.textMuted}; font-size: 13px; line-height: 1.4;">Definição do tema e narrativa do raciocínio criativo por trás da escolha.</p>
          </div>

          <div style="background: ${BRAND.surfaceCard}; border-radius: 16px; border: 1px solid ${BRAND.borderCard}; padding: 22px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${BRAND.red}; color: ${BRAND.white}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; margin-bottom: 14px;">03</div>
            <h4 style="color: ${BRAND.white}; font-size: 16px; font-weight: 700; margin-bottom: 8px;">Edição ao Vivo</h4>
            <p style="color: ${BRAND.textMuted}; font-size: 13px; line-height: 1.4;">Criação de um post do zero combinando texto, reflexão e registro de imagem.</p>
          </div>

          <div style="background: ${BRAND.surfaceCard}; border-radius: 16px; border: 1px solid ${BRAND.borderCard}; padding: 22px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: ${BRAND.blue}; color: ${BRAND.white}; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; margin-bottom: 14px;">04</div>
            <h4 style="color: ${BRAND.white}; font-size: 16px; font-weight: 700; margin-bottom: 8px;">Publicação</h4>
            <p style="color: ${BRAND.textMuted}; font-size: 13px; line-height: 1.4;">Envio instantâneo para o feed do HUB demonstrando a resposta da plataforma.</p>
          </div>
        </div>
      </div>
    `
  },

  // -------------------------------------------------------------
  // SLIDE 12: Mão na Massa! Execução Hands-On (45 min)
  // -------------------------------------------------------------
  {
    num: '12',
    name: 'slide-12-handson.png',
    title: 'Mão na Massa! Execução Hands-On (45 min)',
    renderHtml: () => `
      <div style="padding: 60px 100px;">
        <div style="margin-bottom: 30px;">
          <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">11. HANDS-ON ALUNOS</div>
          <h2 style="color: ${BRAND.white}; font-size: 36px; font-weight: 800; margin-top: 4px;">Mão na Massa: Seu 1º Post no HUB (45 min)</h2>
        </div>

        <div style="background: ${BRAND.surfaceCard}; border-radius: 20px; border: 1px solid ${BRAND.borderCard}; border-left: 8px solid ${BRAND.yellow}; padding: 36px;">
          <h3 style="color: ${BRAND.white}; font-size: 22px; font-weight: 700; margin-bottom: 20px;">Roteiro da Atividade Prática</h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
            <div style="background: rgba(0,0,0,0.3); padding: 18px; border-radius: 12px; border: 1px solid ${BRAND.borderCard};">
              <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; margin-bottom: 6px;">Passo 1: Login no Sistema</div>
              <div style="color: ${BRAND.textMuted}; font-size: 13.5px;">Acesse a plataforma pelo computador ou smartphone.</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 18px; border-radius: 12px; border: 1px solid ${BRAND.borderCard};">
              <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; margin-bottom: 6px;">Passo 2: Escolha da Mídia</div>
              <div style="color: ${BRAND.textMuted}; font-size: 13.5px;">Selecione uma foto autoral ou criação feita por você.</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 18px; border-radius: 12px; border: 1px solid ${BRAND.borderCard};">
              <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; margin-bottom: 6px;">Passo 3: Texto Comunicativo</div>
              <div style="color: ${BRAND.textMuted}; font-size: 13.5px;">Escreva a reflexão contextualizando a imagem produzida.</div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 18px; border-radius: 12px; border: 1px solid ${BRAND.borderCard};">
              <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; margin-bottom: 6px;">Passo 4: Submissão do Post Teste</div>
              <div style="color: ${BRAND.textMuted}; font-size: 13.5px;">Envie seu primeiro post e veja ele no Caderno do Artista.</div>
            </div>
          </div>

          <div style="color: ${BRAND.white}; font-size: 14px; font-weight: 600; text-align: center; background: rgba(15,71,128,0.4); padding: 12px; border-radius: 10px; border: 1px solid ${BRAND.blue};">
            💡 O professor atuará como facilitador tirando dúvidas de interface e processo criativo.
          </div>
        </div>
      </div>
    `
  },

  // -------------------------------------------------------------
  // SLIDE 13: Encerramento & Próximos Passos
  // -------------------------------------------------------------
  {
    num: '13',
    name: 'slide-13-encerramento.png',
    title: 'Encerramento & Diálogo',
    renderHtml: () => `
      <div style="padding: 60px 100px;">
        <div style="margin-bottom: 35px;">
          <div style="color: ${BRAND.yellow}; font-size: 14px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">12. FINALIZAÇÃO</div>
          <h2 style="color: ${BRAND.white}; font-size: 36px; font-weight: 800; margin-top: 4px;">Encerramento & Diálogo</h2>
        </div>

        <div style="background: ${BRAND.surfaceCard}; border-radius: 20px; border: 1px solid ${BRAND.borderCard}; padding: 44px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.6);">
          <div style="display: inline-block; padding: 6px 18px; background: rgba(255,204,0,0.15); border: 1px solid ${BRAND.yellow}; color: ${BRAND.yellow}; font-size: 13px; font-weight: 700; border-radius: 20px; margin-bottom: 20px;">HUB LABDIV • IF-USP</div>
          <h3 style="color: ${BRAND.white}; font-size: 28px; font-weight: 800; margin-bottom: 16px;">Obrigado pela Participação!</h3>
          <p style="color: ${BRAND.textLight}; font-size: 18px; max-width: 700px; margin: 0 auto 30px auto; line-height: 1.5;">
            O HUB LabDiv é uma comunidade viva de criação e diálogo. Continue utilizando seu Caderno do Artista para registrar sua jornada!
          </p>
          <div style="color: ${BRAND.textMuted}; font-size: 14px;">Dúvidas ou feedbacks? Entre em contato com a equipe do laboratório.</div>
        </div>
      </div>
    `
  }
];

function buildFullHtml(slide) {
  const isCapa = slide.num === '01';
  const bgImageName = isCapa ? 'bg-if-slide-capa.png' : 'bg-if-slide-dark.png';
  const bgPath = path.join(projectRoot, 'public', 'presentation', bgImageName);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,600;0,700;0,800;1,400&display=swap">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background-color: ${BRAND.bgDark};
      background-image: url('file://${bgPath}');
      background-size: cover;
      background-position: center;
      overflow: hidden;
      font-family: 'Open Sans', sans-serif;
      position: relative;
    }
  </style>
</head>
<body>
  ${slide.renderHtml()}
</body>
</html>`;
}

async function renderAllSlides() {
  console.log('🚀 Inicializando Puppeteer para renderizar 13 slides PNG perfeitos...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  for (const slide of slides) {
    console.log(`📸 Renderizando Slide ${slide.num}: ${slide.title}...`);
    const html = buildFullHtml(slide);
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });

    const destPath = path.join(outputDir, slide.name);
    await page.screenshot({
      path: destPath,
      type: 'png'
    });
    console.log(`  ✓ Salvo em: ${destPath}`);
  }

  await browser.close();
  console.log('✨ Todos os 13 slides PNG foram gerados com sucesso!');
}

renderAllSlides().catch(err => {
  console.error('❌ Erro na renderização dos slides:', err);
  process.exit(1);
});
