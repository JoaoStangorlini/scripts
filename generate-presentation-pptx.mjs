/**
 * HUB LabDiv - Software Livre sob Licença AGPLv3.
 * Copyright (C) 2026 HUB LabDiv
 *
 * Este programa é um software livre; você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU como publicada pela
 * Free Software Foundation, versão 3 da Licença.
 */

import pptxgen from 'pptxgenjs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');
const outputDir = path.join(projectRoot, 'public', 'presentation');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Brand Colors (HEX without # for pptxgenjs)
const COLOR = {
  bgDark: '121212',
  surfaceDark: '1E1E1E',
  blue: '0F4780',
  red: 'F14343',
  yellow: 'FFCC00',
  white: 'FFFFFF',
  textLight: 'E0E0E0',
  textMuted: 'A0A0A0',
  glassBg: '181C24'
};

const bgCapaPath = path.join(outputDir, 'bg-if-slide-capa.png');
const bgDarkPath = path.join(outputDir, 'bg-if-slide-dark.png');
const bgConteudoPath = path.join(outputDir, 'bg-if-slide-conteudo.png');

async function createPresentation() {
  console.log('🚀 Criando apresentação em formato PPTX (Microsoft PowerPoint / Google Apresentações)...');

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = 'Plano de Aula: Processos Criativos - HUB LabDiv';
  pres.subject = 'Fotografia, Webdesign, Comunicação vs Extensão e HUB LabDiv';
  pres.author = 'HUB LabDiv • IF-USP';
  pres.company = 'Instituto de Física - Universidade de São Paulo';

  // -------------------------------------------------------------
  // SLIDE 1: Capa (Title Slide)
  // -------------------------------------------------------------
  let slide1 = pres.addSlide();
  slide1.background = { path: bgCapaPath };

  // -------------------------------------------------------------
  // SLIDE 2: Objetivos da Aula
  // -------------------------------------------------------------
  let slide2 = pres.addSlide();
  slide2.background = { path: bgConteudoPath };

  // Title
  slide2.addText('OBJETIVOS DA AULA', {
    x: 0.8, y: 0.6, w: 11.5, h: 0.8,
    fontSize: 28, bold: true, color: COLOR.yellow, fontFace: 'Open Sans'
  });

  // Card 1: Objetivo Geral
  slide2.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.5, w: 11.7, h: 1.6,
    fill: { color: '1E1E1E', transparency: 20 },
    line: { color: COLOR.blue, width: 1.5 },
    rectRadius: 0.1
  });
  slide2.addText([
    { text: 'OBJETIVO GERAL\n', options: { fontSize: 14, bold: true, color: COLOR.yellow } },
    { text: 'Estimular a expressão criativa através da fotografia e do webdesign, abordar o dilema Comunicação x Extensão na perspectiva freiriana e apresentar a plataforma HUB LabDiv como espaço para o envio e compartilhamento do Caderno do Artista.', options: { fontSize: 14, color: COLOR.textLight } }
  ], { x: 1.1, y: 1.6, w: 11.1, h: 1.4, fontFace: 'Open Sans', valign: 'top' });

  // Card 2: Objetivos Específicos
  slide2.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 3.3, w: 11.7, h: 3.5,
    fill: { color: '1E1E1E', transparency: 20 },
    line: { color: COLOR.yellow, width: 1.5 },
    rectRadius: 0.1
  });
  slide2.addText([
    { text: 'OBJETIVOS ESPECÍFICOS\n\n', options: { fontSize: 14, bold: true, color: COLOR.yellow } },
    { text: '• Mapeamento Inicial: ', options: { fontSize: 13, bold: true, color: COLOR.white } },
    { text: 'Aplicar o questionário piloto e registrar o Termo de Aceite do perfil dos primeiros usuários.\n', options: { fontSize: 13, color: COLOR.textLight } },
    { text: '• Fundamentação Teórica: ', options: { fontSize: 13, bold: true, color: COLOR.white } },
    { text: 'Diferenciar "Comunicação" de "Divulgação" com base no referencial de Paulo Freire.\n', options: { fontSize: 13, color: COLOR.textLight } },
    { text: '• Demonstração ao Vivo: ', options: { fontSize: 13, bold: true, color: COLOR.white } },
    { text: 'Exibir a criação de uma postagem espontânea ao vivo, expondo o raciocínio criativo.\n', options: { fontSize: 13, color: COLOR.textLight } },
    { text: '• Prática Hands-On: ', options: { fontSize: 13, bold: true, color: COLOR.white } },
    { text: 'Garantir que todos os alunos acessem o sistema e publiquem seu "post teste" com sucesso.', options: { fontSize: 13, color: COLOR.textLight } }
  ], { x: 1.1, y: 3.4, w: 11.1, h: 3.3, fontFace: 'Open Sans', valign: 'top' });


  // -------------------------------------------------------------
  // SLIDE 3: Cronograma da Aula (120 min)
  // -------------------------------------------------------------
  let slide3 = pres.addSlide();
  slide3.background = { path: bgConteudoPath };

  slide3.addText('CRONOGRAMA DA AULA (2 HORAS)', {
    x: 0.8, y: 0.6, w: 11.5, h: 0.8,
    fontSize: 28, bold: true, color: COLOR.yellow, fontFace: 'Open Sans'
  });

  const tableRows = [
    [
      { text: 'Tempo', options: { bold: true, color: COLOR.yellow, fill: '0F4780' } },
      { text: 'Fase', options: { bold: true, color: COLOR.yellow, fill: '0F4780' } },
      { text: 'Atividades & Dinâmica', options: { bold: true, color: COLOR.yellow, fill: '0F4780' } }
    ],
    [
      { text: '00:00 - 00:10\n(10 min)', options: { bold: true, color: COLOR.white } },
      { text: 'Aplicação do Questionário & Acolhimento', options: { bold: true, color: COLOR.textLight } },
      { text: 'Projeção do QR Code do formulário de pesquisa. Preenchimento do mapeamento demográfico pelos alunos.', options: { color: COLOR.textMuted } }
    ],
    [
      { text: '00:10 - 00:35\n(25 min)', options: { bold: true, color: COLOR.white } },
      { text: 'Introdução ao Webdesign & Fotografia', options: { bold: true, color: COLOR.textLight } },
      { text: 'Apresentação de portfólio (aurtistic.vercel.app), olhar fotográfico com celular e conceitos de HTML/CSS via CodePen.', options: { color: COLOR.textMuted } }
    ],
    [
      { text: '00:35 - 01:00\n(25 min)', options: { bold: true, color: COLOR.white } },
      { text: 'Base Teórica: Extensão ou Comunicação?', options: { bold: true, color: COLOR.textLight } },
      { text: 'Leitura de 5 trechos selecionados de Paulo Freire. Discussão de como o HUB surge da visão comunicativa.', options: { color: COLOR.textMuted } }
    ],
    [
      { text: '01:00 - 01:15\n(15 min)', options: { bold: true, color: COLOR.white } },
      { text: 'Demonstração Prática do HUB', options: { bold: true, color: COLOR.textLight } },
      { text: 'Criação de um post do zero ao vivo na plataforma HUB LabDiv, narrando a intenção e o raciocínio criativo.', options: { color: COLOR.textMuted } }
    ],
    [
      { text: '01:15 - 02:00\n(45 min)', options: { bold: true, color: COLOR.white } },
      { text: 'Execução Hands-On', options: { bold: true, color: COLOR.textLight } },
      { text: 'Alunos utilizam a plataforma para criar e publicar seu primeiro post (Caderno do Artista) com suporte facilitador.', options: { color: COLOR.textMuted } }
    ]
  ];

  slide3.addTable(tableRows, {
    x: 0.8, y: 1.5, w: 11.7, h: 5.2,
    colW: [2.2, 3.5, 6.0],
    border: { pt: 1, color: '333333' },
    fill: '1E1E1E',
    fontFace: 'Open Sans',
    fontSize: 12,
    align: 'left',
    valign: 'middle'
  });


  // -------------------------------------------------------------
  // SLIDE 4: Fotografia & Olhar Criativo
  // -------------------------------------------------------------
  let slide4 = pres.addSlide();
  slide4.background = { path: bgDarkPath };

  slide4.addText('FOTOGRAFIA & OLHAR CRIATIVO', {
    x: 0.8, y: 0.8, w: 11.5, h: 0.8,
    fontSize: 28, bold: true, color: COLOR.yellow, fontFace: 'Open Sans'
  });

  slide4.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 5.6, h: 4.8,
    fill: { color: '1E1E1E', transparency: 25 },
    line: { color: COLOR.blue, width: 1.5 },
    rectRadius: 0.1
  });
  slide4.addText([
    { text: 'A Câmera do Celular como Lente do Mundo\n\n', options: { fontSize: 16, bold: true, color: COLOR.yellow } },
    { text: '• Fotografia é uma forma prática e acessível de enxergar o mundo sob uma nova perspectiva no cotidiano.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '• Começar pelo celular facilita o aprendizado inicial por eliminar a sobrecarga técnica do triângulo de exposição.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '• Foco na composição, enquadramento e narrativa visual antes da técnica complexa.', options: { fontSize: 14, color: COLOR.textLight } }
  ], { x: 1.0, y: 2.0, w: 5.2, h: 4.4, fontFace: 'Open Sans', valign: 'top' });

  slide4.addShape(pres.ShapeType.rect, {
    x: 6.9, y: 1.8, w: 5.6, h: 4.8,
    fill: { color: '1E1E1E', transparency: 25 },
    line: { color: COLOR.red, width: 1.5 },
    rectRadius: 0.1
  });
  slide4.addText([
    { text: 'Portfólio de Referência\n\n', options: { fontSize: 16, bold: true, color: COLOR.yellow } },
    { text: '• Aplicação de projetos autorais unindo fotografia e webdesign:\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '  aurtistic.vercel.app\n\n', options: { fontSize: 15, bold: true, color: COLOR.yellow } },
    { text: '• O Caderno do Artista como registro contínuo de ensaios, testes visuais e impressões do cotidiano universitário.', options: { fontSize: 14, color: COLOR.textLight } }
  ], { x: 7.1, y: 2.0, w: 5.2, h: 4.4, fontFace: 'Open Sans', valign: 'top' });


  // -------------------------------------------------------------
  // SLIDE 5: Webdesign: Código como Pincel Digital
  // -------------------------------------------------------------
  let slide5 = pres.addSlide();
  slide5.background = { path: bgDarkPath };

  slide5.addText('WEBDESIGN: O CÓDIGO COMO PINCEL DIGITAL', {
    x: 0.8, y: 0.8, w: 11.5, h: 0.8,
    fontSize: 28, bold: true, color: COLOR.yellow, fontFace: 'Open Sans'
  });

  slide5.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 11.7, h: 4.8,
    fill: { color: '1E1E1E', transparency: 20 },
    line: { color: COLOR.yellow, width: 1.5 },
    rectRadius: 0.1
  });
  slide5.addText([
    { text: 'Programar para Expressar Idéias\n\n', options: { fontSize: 16, bold: true, color: COLOR.yellow } },
    { text: '• Arte Vetorial vs. Webdesign Programado: ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'No webdesign, aplicamos conceitos visuais de equilíbrio, hierarquia e harmonia, mas ao invés de um pincel estático, usamos código interativo.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '• HTML (Estrutura): ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'A página web começa como um documento de texto simples e organizado em blocos lógicos de conteúdo.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '• CSS (Estética & Sensação): ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'Camada responsável por transformar o documento bruto em uma experiência visual envolvente.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '• Prática Rápida no CodePen (codepen.io): ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'Demonstração de como algumas linhas de código alteram completamente a atmosfera de uma página.', options: { fontSize: 14, color: COLOR.textLight } }
  ], { x: 1.1, y: 2.0, w: 11.1, h: 4.4, fontFace: 'Open Sans', valign: 'top' });


  // -------------------------------------------------------------
  // SLIDE 6: Base Teórica: Extensão ou Comunicação?
  // -------------------------------------------------------------
  let slide6 = pres.addSlide();
  slide6.background = { path: bgDarkPath };

  slide6.addText('BASE TEÓRICA: EXTENSÃO OU COMUNICAÇÃO?', {
    x: 0.8, y: 0.8, w: 11.5, h: 0.8,
    fontSize: 28, bold: true, color: COLOR.yellow, fontFace: 'Open Sans'
  });

  slide6.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 11.7, h: 4.8,
    fill: { color: '1E1E1E', transparency: 20 },
    line: { color: COLOR.blue, width: 1.5 },
    rectRadius: 0.1
  });
  slide6.addText([
    { text: 'O Dilema Freiriano na Divulgação Científica\n\n', options: { fontSize: 16, bold: true, color: COLOR.yellow } },
    { text: '• Leitura Teórica: ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'Análise de 5 trechos fundamentais da obra "Extensão ou Comunicação?" de Paulo Freire.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '• Por que este dilema importa? ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'Muitas vezes a universidade apenas "estende" conteúdos para o público como uma entrega passiva, sem criar uma ponte dialógica real.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '• O Surgimento do HUB LabDiv: ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'A plataforma HUB LabDiv foi concebida justamente para superar essa divisão, oferecendo um espaço onde o autor e a comunidade se encontram para construir significados juntos.', options: { fontSize: 14, color: COLOR.textLight } }
  ], { x: 1.1, y: 2.0, w: 11.1, h: 4.4, fontFace: 'Open Sans', valign: 'top' });


  // -------------------------------------------------------------
  // SLIDE 7: Paulo Freire (Pág. 12): Extensão Passiva
  // -------------------------------------------------------------
  let slide7 = pres.addSlide();
  slide7.background = { path: bgDarkPath };

  slide7.addText('PAULO FREIRE — PÁGINA 12: EXTENSÃO PASSIVA', {
    x: 0.8, y: 0.8, w: 11.5, h: 0.8,
    fontSize: 26, bold: true, color: COLOR.yellow, fontFace: 'Open Sans'
  });

  slide7.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 11.7, h: 4.8,
    fill: { color: '1E1E1E', transparency: 20 },
    line: { color: COLOR.red, width: 1.5 },
    rectRadius: 0.1
  });
  slide7.addText([
    { text: 'O Risco da Transmissão Descontextualizada\n\n', options: { fontSize: 16, bold: true, color: COLOR.yellow } },
    { text: '“O termo extensão (assim como a palavra divulgação) muitas vezes significa que o pesquisador apenas transmite um objeto a alguém fora da universidade, separando o conteúdo de seu contexto real.”\n\n', options: { fontSize: 15, italic: true, color: COLOR.white } },
    { text: '• Consequências apontadas por Freire:\n', options: { fontSize: 14, bold: true, color: COLOR.yellow } },
    { text: '  1. O receptor é privado de assumir um papel ativo no aprendizado.\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '  2. O divulgador se isola e não acompanha como aquele conhecimento foi ressignificado.\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '  3. Torna-se impossível avaliar se houve de fato um aprendizado transformador.', options: { fontSize: 14, color: COLOR.textLight } }
  ], { x: 1.1, y: 2.0, w: 11.1, h: 4.4, fontFace: 'Open Sans', valign: 'top' });


  // -------------------------------------------------------------
  // SLIDE 8: Paulo Freire (Pág. 35): Divulgar vs. Comunicar
  // -------------------------------------------------------------
  let slide8 = pres.addSlide();
  slide8.background = { path: bgDarkPath };

  slide8.addText('PAULO FREIRE — PÁGINA 35: DIVULGAR VS. COMUNICAR', {
    x: 0.8, y: 0.8, w: 11.5, h: 0.8,
    fontSize: 26, bold: true, color: COLOR.yellow, fontFace: 'Open Sans'
  });

  slide8.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 5.6, h: 4.8,
    fill: { color: '1E1E1E', transparency: 25 },
    line: { color: COLOR.red, width: 1.5 },
    rectRadius: 0.1
  });
  slide8.addText([
    { text: 'DIVULGAR (Unilateral)\n\n', options: { fontSize: 16, bold: true, color: COLOR.red } },
    { text: '• Comunicar A SOBRE B para o público.\n\n', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: '• Relação de depósito: o emissor possui o saber e o receptor recebe passivamente.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '• Separação entre o sujeito que produz e o sujeito que consome a informação.', options: { fontSize: 14, color: COLOR.textLight } }
  ], { x: 1.0, y: 2.0, w: 5.2, h: 4.4, fontFace: 'Open Sans', valign: 'top' });

  slide8.addShape(pres.ShapeType.rect, {
    x: 6.9, y: 1.8, w: 5.6, h: 4.8,
    fill: { color: '1E1E1E', transparency: 25 },
    line: { color: COLOR.yellow, width: 1.5 },
    rectRadius: 0.1
  });
  slide8.addText([
    { text: 'COMUNICAR (Dialógico)\n\n', options: { fontSize: 16, bold: true, color: COLOR.yellow } },
    { text: '• Comunicar COM A SOBRE B.\n\n', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: '• Relação de co-construção: a realidade é refletida e debatida conjuntamente.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '• O HUB LabDiv adota esta perspectiva para os cadernos de artistas e postagens científicas.', options: { fontSize: 14, color: COLOR.textLight } }
  ], { x: 7.1, y: 2.0, w: 5.2, h: 4.4, fontFace: 'Open Sans', valign: 'top' });


  // -------------------------------------------------------------
  // SLIDE 9: Paulo Freire (Págs. 48 & 50): Realidade & Transformação
  // -------------------------------------------------------------
  let slide9 = pres.addSlide();
  slide9.background = { path: bgDarkPath };

  slide9.addText('PAULO FREIRE — PÁGS. 48 & 50: REALIDADE & TRANSFORMAÇÃO', {
    x: 0.8, y: 0.8, w: 11.5, h: 0.8,
    fontSize: 24, bold: true, color: COLOR.yellow, fontFace: 'Open Sans'
  });

  slide9.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 11.7, h: 4.8,
    fill: { color: '1E1E1E', transparency: 20 },
    line: { color: COLOR.blue, width: 1.5 },
    rectRadius: 0.1
  });
  slide9.addText([
    { text: 'Pensar o Objeto é Pensar a Realidade\n\n', options: { fontSize: 16, bold: true, color: COLOR.yellow } },
    { text: '• Página 48: ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: '“Pensar sobre aquele objeto é pensar na realidade daquele objeto em questão.” Não há conhecimento isolado da existência concreta.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '• Página 50: ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'A capacidade transformadora surge quando um conceito é verdadeiramente entendido em todo o seu contexto: nas relações Homem-Homem e Homem-Mundo.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '• Aplicação no HUB LabDiv: ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'Cada postagem no Caderno do Artista busca situar o conceito científico ou artístico dentro do contexto vivido pelo autor.', options: { fontSize: 14, color: COLOR.textLight } }
  ], { x: 1.1, y: 2.0, w: 11.1, h: 4.4, fontFace: 'Open Sans', valign: 'top' });


  // -------------------------------------------------------------
  // SLIDE 10: Paulo Freire (Pág. 52): A Importância da Práxis
  // -------------------------------------------------------------
  let slide10 = pres.addSlide();
  slide10.background = { path: bgDarkPath };

  slide10.addText('PAULO FREIRE — PÁGINA 52: A IMPORTÂNCIA DA PRÁXIS', {
    x: 0.8, y: 0.8, w: 11.5, h: 0.8,
    fontSize: 26, bold: true, color: COLOR.yellow, fontFace: 'Open Sans'
  });

  slide10.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 11.7, h: 4.8,
    fill: { color: '1E1E1E', transparency: 20 },
    line: { color: COLOR.yellow, width: 1.5 },
    rectRadius: 0.1
  });
  slide10.addText([
    { text: 'Por que a Capacidade Transformadora é Vital?\n\n', options: { fontSize: 16, bold: true, color: COLOR.yellow } },
    { text: '• O conhecimento só se torna libertador quando permite ao sujeito atuar sobre o seu meio e transformá-lo de forma consciente.\n\n', options: { fontSize: 15, color: COLOR.white } },
    { text: '• O ato de registrar o processo criativo no Caderno do Artista exige reflexão crítica sobre a própria produção.\n\n', options: { fontSize: 15, color: COLOR.textLight } },
    { text: '• Ao publicar no HUB LabDiv, o aluno deixa de ser mero espectador do conhecimento científico/artístico e se torna protagonista comunicador.', options: { fontSize: 15, color: COLOR.textLight } }
  ], { x: 1.1, y: 2.0, w: 11.1, h: 4.4, fontFace: 'Open Sans', valign: 'top' });


  // -------------------------------------------------------------
  // SLIDE 11: Demonstração do HUB LabDiv ao Vivo
  // -------------------------------------------------------------
  let slide11 = pres.addSlide();
  slide11.background = { path: bgDarkPath };

  slide11.addText('DEMONSTRAÇÃO PRÁTICA DO HUB LABDIV', {
    x: 0.8, y: 0.8, w: 11.5, h: 0.8,
    fontSize: 28, bold: true, color: COLOR.yellow, fontFace: 'Open Sans'
  });

  slide11.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.8, w: 11.7, h: 4.8,
    fill: { color: '1E1E1E', transparency: 20 },
    line: { color: COLOR.blue, width: 1.5 },
    rectRadius: 0.1
  });
  slide11.addText([
    { text: 'Criando um Post do Zero ao Vivo (15 min)\n\n', options: { fontSize: 16, bold: true, color: COLOR.yellow } },
    { text: '1. Apresentação da Interface: ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'Navegação pelos menus do HUB LabDiv e estrutura dos cadernos.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '2. Escolha do Tema: ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'Exposição oral da intenção criativa e da pergunta orientadora.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '3. Edição & Mídia: ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'Upload de foto/imagem e formatação do texto reflexivo.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '4. Publicação em Tempo Real: ', options: { fontSize: 14, bold: true, color: COLOR.white } },
    { text: 'Demonstração de como a postagem fica visível na rede do HUB.', options: { fontSize: 14, color: COLOR.textLight } }
  ], { x: 1.1, y: 2.0, w: 11.1, h: 4.4, fontFace: 'Open Sans', valign: 'top' });


  // -------------------------------------------------------------
  // SLIDE 12: Mão na Massa! Execução Hands-On
  // -------------------------------------------------------------
  let slide12 = pres.addSlide();
  slide12.background = { path: bgConteudoPath };

  slide12.addText('MÃO NA MASSA! ATIVIDADE PRÁTICA (45 MIN)', {
    x: 0.8, y: 0.6, w: 11.5, h: 0.8,
    fontSize: 28, bold: true, color: COLOR.yellow, fontFace: 'Open Sans'
  });

  slide12.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.5, w: 11.7, h: 5.2,
    fill: { color: '1E1E1E', transparency: 20 },
    line: { color: COLOR.yellow, width: 1.5 },
    rectRadius: 0.1
  });
  slide12.addText([
    { text: 'Criação e Envio do Primeiro Post / Caderno do Artista\n\n', options: { fontSize: 16, bold: true, color: COLOR.yellow } },
    { text: 'Passo 1: ', options: { fontSize: 14, bold: true, color: COLOR.yellow } },
    { text: 'Acesse a plataforma HUB LabDiv no notebook ou smartphone.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: 'Passo 2: ', options: { fontSize: 14, bold: true, color: COLOR.yellow } },
    { text: 'Escolha um registro visual (fotografia tirada por você ou imagem de referência).\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: 'Passo 3: ', options: { fontSize: 14, bold: true, color: COLOR.yellow } },
    { text: 'Escreva uma legenda/texto aplicando a perspectiva comunicativa: Qual a realidade por trás desta imagem?\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: 'Passo 4: ', options: { fontSize: 14, bold: true, color: COLOR.yellow } },
    { text: 'Publique seu "post teste" no sistema.\n\n', options: { fontSize: 14, color: COLOR.textLight } },
    { text: '💡 Suporte técnico e apoio facilitador disponíveis durante todo o tempo!', options: { fontSize: 14, bold: true, color: COLOR.white } }
  ], { x: 1.1, y: 1.7, w: 11.1, h: 4.8, fontFace: 'Open Sans', valign: 'top' });


  // -------------------------------------------------------------
  // SLIDE 13: Encerramento & Contato
  // -------------------------------------------------------------
  let slide13 = pres.addSlide();
  slide13.background = { path: bgCapaPath };

  // Save PPTX presentation
  const destPathPublic = path.join(projectRoot, 'public', 'Plano de Aula - HUB LabDiv.pptx');
  const destPathPresentation = path.join(outputDir, 'Plano de Aula - HUB LabDiv.pptx');

  await pres.writeFile({ fileName: destPathPublic });
  fs.copyFileSync(destPathPublic, destPathPresentation);

  console.log(`✨ Apresentação PPTX criada com sucesso!`);
  console.log(`  └─ Salvo em: ${destPathPublic}`);
  console.log(`  └─ Salvo em: ${destPathPresentation}`);
}

createPresentation().catch(err => {
  console.error('❌ Erro na criação da apresentação PPTX:', err);
  process.exit(1);
});
