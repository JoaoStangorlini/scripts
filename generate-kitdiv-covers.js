/*!
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 *
 * Este programa é software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
 * publicada pela Free Software Foundation.
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const PUBLIC_KITDIV_DIR = path.resolve(__dirname, '../public/images/kitdiv');
if (!fs.existsSync(PUBLIC_KITDIV_DIR)) {
  fs.mkdirSync(PUBLIC_KITDIV_DIR, { recursive: true });
}

const COVERS = [
  {
    filename: 'palestras.webp',
    tag: 'KITDIV • APRESENTAÇÕES & ORATÓRIA',
    title: 'Palestras que inspiram',
    subtitle: 'Estrutura narrativa, oratória e técnicas práticas para apresentações científicas inesquecíveis.',
    accentColor: '#FFCC00',
    secondaryColor: '#0F4780',
    iconSvg: `<svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#FFCC00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
      <line x1="12" x2="12" y1="19" y2="22"/>
      <line x1="8" x2="16" y1="22" y2="22"/>
      <circle cx="12" cy="7" r="1" fill="#FFCC00"/>
      <path d="M4 4a16 16 0 0 1 16 0" stroke="#0F4780" stroke-width="1.2" opacity="0.6"/>
      <path d="M2 2a20 20 0 0 1 20 0" stroke="#0F4780" stroke-width="1.2" opacity="0.3"/>
    </svg>`
  },
  {
    filename: 'emails.webp',
    tag: 'KITDIV • COMUNICAÇÃO ACADÊMICA',
    title: 'Como escrever bons e-mails',
    subtitle: 'Etiqueta universitária, clareza, objetividade e como se comunicar com orientadores e docentes.',
    accentColor: '#0F4780',
    secondaryColor: '#F14343',
    iconSvg: `<svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#60A5FA" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="3"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      <path d="M7 15h4" stroke="#F14343" stroke-width="2"/>
      <path d="M7 11h2" stroke="#FFCC00" stroke-width="2"/>
      <circle cx="18" cy="15" r="2" fill="#60A5FA"/>
    </svg>`
  },
  {
    filename: 'caderno-dados.webp',
    tag: 'KITDIV • REGISTRO & METODOLOGIA',
    title: 'Caderno de dados brilhante',
    subtitle: 'Boas práticas de reprodutibilidade, organização de dados de bancada e diários de pesquisa.',
    accentColor: '#F14343',
    secondaryColor: '#FFCC00',
    iconSvg: `<svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#F14343" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
      <path d="M6 6h10"/>
      <path d="M6 10h10"/>
      <path d="M6 14h6"/>
      <path d="M14 14l2 2 4-4" stroke="#FFCC00" stroke-width="2"/>
      <circle cx="4" cy="4" r="1" fill="#F14343"/>
    </svg>`
  },
  {
    filename: 'slides.webp',
    tag: 'KITDIV • DESIGN VISUAL & SLIDES',
    title: 'Slides que funcionam',
    subtitle: 'Hierarquia visual, legibilidade, redução de ruído gráfico e contraste para projetores e telas.',
    accentColor: '#0F4780',
    secondaryColor: '#FFCC00',
    iconSvg: `<svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#FFCC00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="14" x="3" y="3" rx="2"/>
      <path d="M3 9h18"/>
      <path d="m9 16 3-3 3 3"/>
      <path d="M8 21h8"/>
      <path d="M12 17v4"/>
      <circle cx="6" cy="6" r="1" fill="#0F4780"/>
      <rect x="6" y="11" width="5" height="3" rx="1" fill="#0F4780" stroke="none"/>
    </svg>`
  },
  {
    filename: 'posteres.webp',
    tag: 'KITDIV • UX EM PÔSTERES CIENTÍFICOS',
    title: 'Pôsteres Impactantes',
    subtitle: 'Carga cognitiva, perfume informacional e como transformar muros de texto em experiências atraentes.',
    accentColor: '#FFCC00',
    secondaryColor: '#F14343',
    iconSvg: `<svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#FFCC00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="20" x="3" y="2" rx="2"/>
      <path d="M7 6h10" stroke="#F14343" stroke-width="2"/>
      <path d="M7 10h6"/>
      <rect x="7" y="13" width="10" height="5" rx="1" stroke="#38BDF8" stroke-dasharray="2 2"/>
      <circle cx="12" cy="15.5" r="1.5" fill="#38BDF8"/>
    </svg>`
  }
];

function buildHtml(cover) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px;
      height: 675px;
      background: #0B0F19;
      color: #F8FAFC;
      font-family: 'Open Sans', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
    }
    .mesh-glow {
      position: absolute;
      width: 650px;
      height: 650px;
      border-radius: 50%;
      background: radial-gradient(circle, ${cover.accentColor}25 0%, transparent 70%);
      top: -150px;
      right: -100px;
      pointer-events: none;
      filter: blur(60px);
    }
    .mesh-glow-2 {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, ${cover.secondaryColor}22 0%, transparent 70%);
      bottom: -150px;
      left: -100px;
      pointer-events: none;
      filter: blur(70px);
    }
    .grid-lines {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
    }
    .card-container {
      position: relative;
      z-index: 10;
      width: 1100px;
      height: 575px;
      background: rgba(18, 24, 38, 0.88);
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 28px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 48px 56px;
      overflow: hidden;
    }
    .header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .atom-badge {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, ${cover.accentColor}33, ${cover.secondaryColor}33);
      border: 1.5px solid ${cover.accentColor}66;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .brand-title {
      font-family: '29LT Bukra', 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #FFFFFF;
    }
    .brand-beta {
      background: #FFCC00;
      color: #0F172A;
      font-size: 11px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
      text-transform: uppercase;
      margin-left: 6px;
    }
    .tag-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 16px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.06);
      border: 1.5px solid ${cover.accentColor}88;
      color: ${cover.accentColor};
      font-family: '29LT Bukra', 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .body-content {
      display: grid;
      grid-template-columns: 1fr 220px;
      align-items: center;
      gap: 40px;
      margin-top: 10px;
    }
    .title {
      font-family: '29LT Bukra', 'Outfit', sans-serif;
      font-size: 52px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -1px;
      color: #FFFFFF;
      margin-bottom: 18px;
      text-shadow: 0 4px 16px rgba(0,0,0,0.5);
    }
    .subtitle {
      font-size: 20px;
      line-height: 1.45;
      color: #94A3B8;
      max-width: 680px;
      font-weight: 500;
    }
    .icon-box {
      width: 210px;
      height: 210px;
      border-radius: 28px;
      background: radial-gradient(circle at top left, rgba(255,255,255,0.06), rgba(255,255,255,0.01));
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 30px rgba(255,255,255,0.03), 0 12px 28px -6px rgba(0,0,0,0.5);
    }
    .footer-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 22px;
      font-size: 14px;
      color: #64748B;
      font-weight: 600;
    }
    .footer-highlight {
      color: #F8FAFC;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body>
  <div class="mesh-glow"></div>
  <div class="mesh-glow-2"></div>
  <div class="grid-lines"></div>

  <div class="card-container">
    <div class="header-bar">
      <div class="brand-group">
        <div class="atom-badge">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${cover.accentColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="2.5" fill="${cover.accentColor}"/>
            <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(30 12 12)"/>
            <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(-30 12 12)"/>
          </svg>
        </div>
        <div class="brand-title">
          HUB LabDiv<span class="brand-beta">BETA</span>
        </div>
      </div>
      <div class="tag-badge">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${cover.accentColor}; display: inline-block;"></span>
        ${cover.tag}
      </div>
    </div>

    <div class="body-content">
      <div>
        <h1 class="title">${cover.title}</h1>
        <p class="subtitle">${cover.subtitle}</p>
      </div>
      <div class="icon-box">
        ${cover.iconSvg}
      </div>
    </div>

    <div class="footer-bar">
      <div class="footer-highlight">
        <span>Laboratório de Expressão e Divulgação Científica</span>
        <span style="opacity: 0.4;">•</span>
        <span style="color: #94A3B8;">Instituto de Física da USP</span>
      </div>
      <div style="font-family: '29LT Bukra', 'Outfit', sans-serif; font-size: 13px; letter-spacing: 0.5px; color: ${cover.accentColor};">
        MATERIAL PEDAGÓGICO ABERTO
      </div>
    </div>
  </div>
</body>
</html>`;
}

const { createClient } = require('@supabase/supabase-js');

async function main() {
  console.log('Rendering 5 KitDiv covers with Puppeteer...');
  const executablePath = await chromium.executablePath();
  const browser = await puppeteer.launch({
    executablePath,
    args: chromium.args,
    defaultViewport: { width: 1200, height: 675, deviceScaleFactor: 2 },
    headless: chromium.headless
  });

  const page = await browser.newPage();

  for (const cover of COVERS) {
    const html = buildHtml(cover);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    const outPath = path.join(PUBLIC_KITDIV_DIR, cover.filename);
    await page.screenshot({ path: outPath, type: 'webp', quality: 95 });
    console.log(`Rendered: ${outPath}`);
  }

  await browser.close();
  console.log('All 5 KitDiv covers generated successfully!');

  // Upload to Supabase Storage & Update DB
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const supaUrlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
    const supaKeyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=([^\r\n]+)/);

    if (supaUrlMatch && supaKeyMatch) {
      const supaUrl = supaUrlMatch[1].trim().replace(/^["']|["']$/g, '');
      const supaKey = supaKeyMatch[1].trim().replace(/^["']|["']$/g, '');
      const supabase = createClient(supaUrl, supaKey);

      const mapping = [
        {
          id: 'cf81c883-dc4a-4590-a00b-77272edb141b',
          title: 'Palestras que inspiram',
          file: 'palestras.webp'
        },
        {
          id: 'efbfc69c-05f0-44a9-80b3-a29850cfff9b',
          title: 'Como escrever bons e-mails',
          file: 'emails.webp'
        },
        {
          id: '1bdc8d41-e35d-4933-b6cf-808613167b42',
          title: 'Caderno de dados brilhante',
          file: 'caderno-dados.webp'
        },
        {
          id: 'd3dfad4d-a064-47d2-93dd-dd5af259f1e3',
          title: 'Slides que funcionam',
          file: 'slides.webp'
        },
        {
          id: '437d51d3-ef22-4f5c-866f-7f7b09659a6e',
          title: 'Pôsteres Impactantes',
          file: 'posteres.webp'
        }
      ];

      for (const item of mapping) {
        const filePath = path.join(PUBLIC_KITDIV_DIR, item.file);
        const fileBuffer = fs.readFileSync(filePath);
        const storagePath = `media/kitdiv-${item.file}`;

        const { error: uploadErr } = await supabase.storage
          .from('submissions')
          .upload(storagePath, fileBuffer, {
            contentType: 'image/webp',
            upsert: true
          });

        if (uploadErr) {
          console.error(`Error uploading ${item.file}:`, uploadErr);
          continue;
        }

        const { data: publicUrlData } = supabase.storage
          .from('submissions')
          .getPublicUrl(storagePath);

        const newUrl = publicUrlData.publicUrl;
        console.log(`Uploaded ${item.title} -> ${newUrl}`);

        // Update post media_url in DB
        const { data: postData } = await supabase
          .from('submissions')
          .select('media_url')
          .eq('id', item.id)
          .single();

        if (postData && postData.media_url) {
          try {
            let blocks = JSON.parse(postData.media_url);
            if (Array.isArray(blocks)) {
              let imageReplaced = false;
              for (const block of blocks) {
                if (block.type === 'image' && block.content && !imageReplaced) {
                  block.content.url = newUrl;
                  imageReplaced = true;
                }
              }
              if (!imageReplaced) {
                blocks.unshift({
                  id: `cover-${Date.now()}`,
                  type: 'image',
                  content: { url: newUrl, caption: item.title }
                });
              }
              await supabase
                .from('submissions')
                .update({ media_url: JSON.stringify(blocks) })
                .eq('id', item.id);

              console.log(`Updated post "${item.title}" in DB!`);
            }
          } catch (e) {
            console.error(`Error updating JSON for ${item.title}:`, e);
          }
        }
      }
    }
  }
}

main().catch(err => {
  console.error('Error generating covers:', err);
  process.exit(1);
});
