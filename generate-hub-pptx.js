/*!
 * Hub de Comunicação Científica Lab-Div V3.0
 * Script de Geração Automática da Apresentação em PowerPoint (16:9 Widescreen)
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 * Licença AGPLv3
 */

const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

async function buildHubPptx() {
  const pptx = new PptxGenJS();
  
  // Define Widescreen 16:9 explicit layout (10.0 x 5.625 inches)
  pptx.layout = 'LAYOUT_16x9';

  // Branding Palette
  const COLOR_BG = '09090B';
  const COLOR_CARD = '1E1E1E';
  const COLOR_YELLOW = 'FFCC00';
  const COLOR_BLUE = '0F4780';
  const COLOR_BLUE_ACCENT = '38BDF8';
  const COLOR_RED = 'F14343';
  const COLOR_WHITE = 'FFFFFF';
  const COLOR_GRAY = '9CA3AF';

  const bgSlidePath = path.join(__dirname, '../public/bg-if-slide.png');

  // Helper for Top 3 Brand Color Accent Lines & Background Image
  const setupSlideBgAndBar = (slide) => {
    if (fs.existsSync(bgSlidePath)) {
      slide.background = { path: bgSlidePath };
    } else {
      slide.background = { color: COLOR_BG };
    }

    slide.addShape(pptx.shapes.RECTANGLE, { x: 0, y: 0, w: 3.33, h: 0.08, fill: { color: COLOR_YELLOW } });
    slide.addShape(pptx.shapes.RECTANGLE, { x: 3.33, y: 0, w: 3.33, h: 0.08, fill: { color: COLOR_BLUE } });
    slide.addShape(pptx.shapes.RECTANGLE, { x: 6.66, y: 0, w: 3.34, h: 0.08, fill: { color: COLOR_RED } });
  };

  // SLIDE 1: Visão Geral & Conceito do HUB LabDiv
  {
    const slide = pptx.addSlide();
    setupSlideBgAndBar(slide);

    // Category Badge
    slide.addText('HUB LABDIV • IFUSP | ABERTURA & CONCEITO', {
      x: 0.5, y: 0.25, w: 7.0, h: 0.3,
      fontFace: 'Open Sans', fontSize: 9, bold: true, color: COLOR_YELLOW,
    });

    // Title
    slide.addText('Visão Geral & Conceito do HUB LabDiv', {
      x: 0.5, y: 0.55, w: 7.2, h: 0.55,
      fontFace: '29LT Bukra', fontSize: 20, bold: true, color: COLOR_WHITE,
    });

    // Subtitle
    slide.addText('O Super App de Comunicação Científica para romper os muros da Universidade', {
      x: 0.5, y: 1.15, w: 7.2, h: 0.35,
      fontFace: 'Open Sans', fontSize: 11, bold: true, color: COLOR_YELLOW,
    });

    // Logo Image
    const logoPath = path.join(__dirname, '../public/icone-HUBLabDiv-white.png');
    if (fs.existsSync(logoPath)) {
      slide.addImage({
        path: logoPath,
        x: 8.0, y: 0.35, w: 1.5, h: 1.25,
      });
    }

    // 4 Grid Cards
    const bullets = [
      'Super App: Reúne diversas funções em um único lugar (como 99, WeChat, Mercado Livre, etc.), acessível pela PlayStore (beta fechado) ou direto pelo navegador.',
      'Comunicação Dialógica: Rompe a mera "divulgação passiva", promovendo a co-construção de significado com base teórica em "Extensão ou Comunicação?" de Paulo Freire.',
      'Integração Acadêmica: Une o controle do semestre e evolução no curso, uma Wiki com todas as informações do IFUSP e a aba Comunidade para interagir com colegas.',
      'Código Aberto (AGPLv3): Projeto transparente hospedado no GitHub (JoaoStangorlini/HUB-LabDiv) pronto para ser replicado.'
    ];

    bullets.forEach((bullet, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = 0.5 + col * 4.6;
      const by = 1.65 + row * 1.55;
      const cardColor = idx % 3 === 0 ? COLOR_YELLOW : idx % 3 === 1 ? COLOR_BLUE_ACCENT : COLOR_RED;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: bx, y: by, w: 4.4, h: 1.45,
        fill: { color: COLOR_CARD },
        line: { color: cardColor, width: 1.5 },
      });

      slide.addText(bullet, {
        x: bx + 0.2, y: by + 0.1, w: 4.0, h: 1.25,
        fontFace: 'Open Sans', fontSize: 9.5, color: COLOR_WHITE, valign: 'top',
      });
    });

    // WebApp & PlayStore Links Bar at Bottom
    slide.addText('WebApp: https://hub-lab-div.vercel.app  |  PlayStore: https://play.google.com/store/apps/details?id=br.usp.ifusp.hublabdiv', {
      x: 0.5, y: 4.85, w: 9.0, h: 0.35,
      fontFace: 'Open Sans', fontSize: 8.5, bold: true, color: COLOR_YELLOW, align: 'center',
    });
  }

  // SLIDE 2: Divisão do HUB em 3 Eixos Principais
  {
    const slide = pptx.addSlide();
    setupSlideBgAndBar(slide);

    slide.addText('ESTRUTURA DOS 3 EIXOS | HUB LABDIV', {
      x: 0.5, y: 0.25, w: 9.0, h: 0.3,
      fontFace: 'Open Sans', fontSize: 9, bold: true, color: COLOR_YELLOW,
    });

    slide.addText('Divisão do HUB em 3 Eixos Principais', {
      x: 0.5, y: 0.55, w: 9.0, h: 0.55,
      fontFace: '29LT Bukra', fontSize: 20, bold: true, color: COLOR_WHITE,
    });

    slide.addText('As 3 Frentes Fundamentais da Plataforma HUB LabDiv', {
      x: 0.5, y: 1.15, w: 9.0, h: 0.35,
      fontFace: 'Open Sans', fontSize: 11, bold: true, color: COLOR_YELLOW,
    });

    const axes = [
      { title: '1. Eixo Social', tag: 'REDE SOCIAL & INTERAÇÕES', desc: 'Feed de comunicação científica dialógica, galeria de Arte, Logs de vivência e Central de Interações (Emaranhamento e Pergunte a um Cientista).', color: COLOR_BLUE_ACCENT },
      { title: '2. Eixo Informativo', tag: 'INFORMAÇÃO & WIKI', desc: 'Wiki institucional centralizada do IFUSP, manuais do curso, oportunidades (PUB/IC), iniciativas e mapa interativo com QR Code.', color: COLOR_RED },
      { title: '3. Eixo Ferramentas', tag: 'ESTUDO & PESQUISA', desc: 'Planejador de grade horária 1h:1h, acompanhamento de trilhas do curso e Match Acadêmico ("Quero uma IC").', color: COLOR_YELLOW }
    ];

    axes.forEach((axis, idx) => {
      const bx = 0.5 + idx * 3.1;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: bx, y: 1.65, w: 2.8, h: 3.45,
        fill: { color: COLOR_CARD },
        line: { color: axis.color, width: 1.5 },
      });

      slide.addText(axis.title, {
        x: bx + 0.2, y: 1.8, w: 2.4, h: 0.4,
        fontFace: '29LT Bukra', fontSize: 12, bold: true, color: COLOR_WHITE,
      });

      slide.addText(axis.tag, {
        x: bx + 0.2, y: 2.25, w: 2.4, h: 0.3,
        fontFace: 'Open Sans', fontSize: 8.5, bold: true, color: axis.color,
      });

      slide.addText(axis.desc, {
        x: bx + 0.2, y: 2.65, w: 2.4, h: 2.3,
        fontFace: 'Open Sans', fontSize: 10, color: COLOR_WHITE, valign: 'top',
      });
    });
  }

  // SLIDE 3: Aba Comunidade: Fluxo, Logs & Arte
  {
    const slide = pptx.addSlide();
    setupSlideBgAndBar(slide);

    slide.addText('EIXO 1 — COMUNIDADE | HUB LABDIV', {
      x: 0.5, y: 0.25, w: 9.0, h: 0.3,
      fontFace: 'Open Sans', fontSize: 9, bold: true, color: COLOR_YELLOW,
    });

    slide.addText('Aba Comunidade: Fluxo, Logs & Arte', {
      x: 0.5, y: 0.55, w: 9.0, h: 0.55,
      fontFace: '29LT Bukra', fontSize: 20, bold: true, color: COLOR_WHITE,
    });

    slide.addText('Descrição detalhada das 3 seções integradas do Eixo Comunidade', {
      x: 0.5, y: 1.15, w: 9.0, h: 0.35,
      fontFace: 'Open Sans', fontSize: 11, bold: true, color: COLOR_YELLOW,
    });

    const sections = [
      { title: '1. Fluxo', tag: 'COMUNICAÇÃO DIALÓGICA', desc: 'Feed principal onde o conteúdo científico é compartilhado com base teórica em "Extensão ou Comunicação?" de Paulo Freire, quizzes interativos, modo foco e narração em áudio.', color: COLOR_YELLOW },
      { title: '2. Logs', tag: 'VIVÊNCIA DISCENTE', desc: 'Espaço humanizado para diários de vivência acadêmica, trocas cotidianas e desabafos entre alunos com sistema de fios energizados que conectam a comunidade.', color: COLOR_BLUE_ACCENT },
      { title: '3. Arte', tag: 'EXPRESSÃO ARTÍSTICA', desc: 'Galeria autoral de expressão visual, fotográfica e poética integrada à ciência, transformando registros e percepções em manifestações artísticas.', color: COLOR_RED }
    ];

    sections.forEach((sec, idx) => {
      const bx = 0.5 + idx * 3.1;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: bx, y: 1.65, w: 2.8, h: 3.45,
        fill: { color: COLOR_CARD },
        line: { color: sec.color, width: 1.5 },
      });

      slide.addText(sec.title, {
        x: bx + 0.2, y: 1.8, w: 2.4, h: 0.4,
        fontFace: '29LT Bukra', fontSize: 12, bold: true, color: COLOR_WHITE,
      });

      slide.addText(sec.tag, {
        x: bx + 0.2, y: 2.25, w: 2.4, h: 0.3,
        fontFace: 'Open Sans', fontSize: 8.5, bold: true, color: sec.color,
      });

      slide.addText(sec.desc, {
        x: bx + 0.2, y: 2.65, w: 2.4, h: 2.3,
        fontFace: 'Open Sans', fontSize: 10, color: COLOR_WHITE, valign: 'top',
      });
    });
  }

  // SLIDE 4: Aba CGIF
  {
    const slide = pptx.addSlide();
    setupSlideBgAndBar(slide);

    slide.addText('EIXO 2 — CGIF | HUB LABDIV', {
      x: 0.5, y: 0.25, w: 9.0, h: 0.3,
      fontFace: 'Open Sans', fontSize: 9, bold: true, color: COLOR_BLUE_ACCENT,
    });

    slide.addText('Aba CGIF: Acesso à Informação & Wiki Institucional', {
      x: 0.5, y: 0.55, w: 9.0, h: 0.55,
      fontFace: '29LT Bukra', fontSize: 18, bold: true, color: COLOR_WHITE,
    });

    slide.addText('Centralização do Conhecimento & Memória do IFUSP', {
      x: 0.5, y: 1.15, w: 9.0, h: 0.35,
      fontFace: 'Open Sans', fontSize: 11, bold: true, color: COLOR_BLUE_ACCENT,
    });

    const cgifItems = [
      'Wiki CGIF: Manuais do curso, Projetos Político-Pedagógicos (PPPs), rotas de circulares e protocolos acadêmicos.',
      'Oportunidades & Iniciativas: Catálogo em tempo real de bolsas PUB, Iniciações Científicas, estágios e simpósios.',
      'Espaços & Mapa Interativo: Conexão direta dos laboratórios físicos do IFUSP via leitura de QR Codes.',
      'Influenciadores & Teste de Radiação: Divulgação de criadores do IFUSP e quiz interativo de fixação da Wiki.'
    ];

    cgifItems.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = 0.5 + col * 4.6;
      const by = 1.65 + row * 1.7;
      const cardColor = idx % 3 === 0 ? COLOR_YELLOW : idx % 3 === 1 ? COLOR_BLUE_ACCENT : COLOR_RED;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: bx, y: by, w: 4.4, h: 1.55,
        fill: { color: COLOR_CARD },
        line: { color: cardColor, width: 1.5 },
      });

      slide.addText(item, {
        x: bx + 0.2, y: by + 0.15, w: 4.0, h: 1.25,
        fontFace: 'Open Sans', fontSize: 10.5, color: COLOR_WHITE, valign: 'top',
      });
    });
  }

  // SLIDE 5: Aba Ferramentas
  {
    const slide = pptx.addSlide();
    setupSlideBgAndBar(slide);

    slide.addText('EIXO 3 — FERRAMENTAS | HUB LABDIV', {
      x: 0.5, y: 0.25, w: 9.0, h: 0.3,
      fontFace: 'Open Sans', fontSize: 9, bold: true, color: COLOR_RED,
    });

    slide.addText('Aba Ferramentas: Apoio ao Estudo & Pesquisa', {
      x: 0.5, y: 0.55, w: 9.0, h: 0.55,
      fontFace: '29LT Bukra', fontSize: 18, bold: true, color: COLOR_WHITE,
    });

    slide.addText('Produtividade acadêmica, retenção discente e aproximação com pesquisadores', {
      x: 0.5, y: 1.15, w: 9.0, h: 0.35,
      fontFace: 'Open Sans', fontSize: 11, bold: true, color: COLOR_RED,
    });

    const toolItems = [
      'Grade Horária (1h:1h): Planejador semanal de estudos que associa 1 hora de aula a 1 hora de estudo individual.',
      'Trilhas do Curso: Acompanhamento de disciplinas cursadas, pendências e pré-requisitos com sincronização.',
      'Match Acadêmico ("Quero uma IC"): Aproximação entre cartas de interesse de alunos e linhas de pesquisa do IFUSP.',
      'Como Ingressar & Observatório: Guia para vestibulandos, apoio à permanência e arena dos pesquisadores.'
    ];

    toolItems.forEach((item, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = 0.5 + col * 4.6;
      const by = 1.65 + row * 1.7;
      const cardColor = idx % 3 === 0 ? COLOR_YELLOW : idx % 3 === 1 ? COLOR_BLUE_ACCENT : COLOR_RED;

      slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
        x: bx, y: by, w: 4.4, h: 1.55,
        fill: { color: COLOR_CARD },
        line: { color: cardColor, width: 1.5 },
      });

      slide.addText(item, {
        x: bx + 0.2, y: by + 0.15, w: 4.0, h: 1.25,
        fontFace: 'Open Sans', fontSize: 10.5, color: COLOR_WHITE, valign: 'top',
      });
    });
  }

  const outputPath = path.join(__dirname, '../public/Apresentação - HUB LabDiv.pptx');
  await pptx.writeFile({ fileName: outputPath });
  console.log(`PPTX 16:9 com bg-if-slide.png criado com sucesso em: ${outputPath}`);
}

buildHubPptx().catch((err) => {
  console.error('Erro ao gerar PPTX:', err);
});
