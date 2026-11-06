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

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIVULGACAO_DIR = path.join(PROJECT_ROOT, 'public/divulgacao');
const POSTERS_DIR = path.join(DIVULGACAO_DIR, 'posters');

function main() {
  console.log('🔄 Iniciando reorganização e limpeza dos diretórios de pôsteres...');

  if (!fs.existsSync(POSTERS_DIR)) {
    fs.mkdirSync(POSTERS_DIR, { recursive: true });
  }

  // 1. Organizar Poster 1 (que estava solto em public/divulgacao/posters/)
  const poster1Dir = path.join(POSTERS_DIR, 'poster1');
  if (!fs.existsSync(poster1Dir)) fs.mkdirSync(poster1Dir, { recursive: true });

  const rootPosterHtml = path.join(POSTERS_DIR, 'poster.html');
  const rootPosterPng = path.join(POSTERS_DIR, 'poster.png');

  if (fs.existsSync(rootPosterHtml)) {
    fs.renameSync(rootPosterHtml, path.join(poster1Dir, 'poster.html'));
  }
  if (fs.existsSync(rootPosterPng)) {
    fs.renameSync(rootPosterPng, path.join(poster1Dir, 'poster.png'));
  }

  // Remover arquivos residuais da raiz de posters/
  const rootPsd = path.join(POSTERS_DIR, 'poster.psd');
  if (fs.existsSync(rootPsd)) fs.unlinkSync(rootPsd);
  const rootIcons = path.join(POSTERS_DIR, 'icons');
  if (fs.existsSync(rootIcons)) fs.rmSync(rootIcons, { recursive: true, force: true });

  // 2. Mover poster2 até poster12 para dentro de public/divulgacao/posters/
  for (let i = 2; i <= 12; i++) {
    const srcDir = path.join(DIVULGACAO_DIR, `poster${i}`);
    const destDir = path.join(POSTERS_DIR, `poster${i}`);

    if (fs.existsSync(srcDir)) {
      if (fs.existsSync(destDir)) {
        fs.rmSync(destDir, { recursive: true, force: true });
      }
      fs.renameSync(srcDir, destDir);
      console.log(`📁 Movido: poster${i} -> posters/poster${i}`);
    }
  }

  // 3. Limpar cada pasta para conter APENAS poster.html e poster.png
  for (let i = 1; i <= 12; i++) {
    const pDir = path.join(POSTERS_DIR, `poster${i}`);
    if (!fs.existsSync(pDir)) continue;

    const files = fs.readdirSync(pDir);
    for (const f of files) {
      if (f !== 'poster.html' && f !== 'poster.png') {
        const fullPath = path.join(pDir, f);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(fullPath);
        }
        console.log(`🧹 Removido arquivo excedente: poster${i}/${f}`);
      }
    }

    // Ajustar referências de fonte caso use ../fonts/fonts.css para ../../fonts/fonts.css
    const htmlFile = path.join(pDir, 'poster.html');
    if (fs.existsSync(htmlFile)) {
      let content = fs.readFileSync(htmlFile, 'utf8');
      if (content.includes('href="../fonts/fonts.css"')) {
        content = content.replace(/href="\.\.\/fonts\/fonts\.css"/g, 'href="../../fonts/fonts.css"');
        fs.writeFileSync(htmlFile, content, 'utf8');
      }
    }
  }

  console.log('✅ Reorganização das pastas concluída!');
}

main();
