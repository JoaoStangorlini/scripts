/*!
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 *
 * Este programa é software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
 * publicada pela Free Software Foundation.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { SpaceItem } from '../../src/types/spaces';

const SPACES_CACHE = path.join(__dirname, 'cache', 'parsed_spaces.json');
const SPACES_DEST = path.join(__dirname, '../../src/data/spacesData.ts');

const LICENSE_HEADER = `/*!
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 *
 * Este programa é software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
 * publicada pela Free Software Foundation.
 *
 * Este programa é distribuído na esperança de que seja útil, mas SEM
 * QUALQUER GARANTIA; sem mesmo a garantia implícita de COMERCIALIZAÇÃO
 * ou ADEQUAÇÃO A UM DETERMINADO FIM.
 */
`;

function backupFile(filepath: string) {
  if (fs.existsSync(filepath)) {
    const backupDir = path.join(__dirname, 'cache', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const filename = path.basename(filepath);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${filename}.${ts}.bak`);
    fs.copyFileSync(filepath, backupPath);
    console.log(`[BACKUP] Criado backup de ${filename} -> ${path.basename(backupPath)}`);
  }
}

function main() {
  const isApply = process.argv.includes('--mode=apply');

  console.log('='.repeat(60));
  console.log(`APPLY: INTEGRAÇÃO DE ESPAÇOS FÍSICOS (Modo: ${isApply ? 'APPLY' : 'DRY-RUN'})`);
  console.log('='.repeat(60));

  if (!fs.existsSync(SPACES_CACHE)) {
    console.error('[ERRO] Cache parsed_spaces.json não encontrado.');
    process.exit(1);
  }

  const rawSpaces: SpaceItem[] = JSON.parse(fs.readFileSync(SPACES_CACHE, 'utf-8'));
  console.log(`Processando ${rawSpaces.length} espaços físicos...`);

  const spacesRecord: Record<string, SpaceItem> = {};
  for (const sp of rawSpaces) {
    spacesRecord[sp.id] = sp;
  }

  if (!isApply) {
    console.log('\n[DRY-RUN] Nenhuma alteração gravada. Para aplicar, use:');
    console.log('npx tsx scripts/scrapers/apply_spaces.ts --mode=apply\n');
    return;
  }

  // Backup
  backupFile(SPACES_DEST);

  // Escrever spacesData.ts
  const spacesFileContent = `${LICENSE_HEADER}
import { SpaceItem } from '@/types/spaces';

export const spacesData: Record<string, SpaceItem> = ${JSON.stringify(spacesRecord, null, 2)};
`;
  fs.writeFileSync(SPACES_DEST, spacesFileContent, 'utf-8');
  console.log(`[OK] Gravado ${SPACES_DEST} com ${Object.keys(spacesRecord).length} espaços.`);

  // Prettier
  try {
    console.log('[PRETTIER] Formatando arquivo gerado...');
    execSync(`npx prettier --write "${SPACES_DEST}"`, { stdio: 'ignore' });
    console.log('[PRETTIER] Formatação concluída.');
  } catch (e) {
    console.warn('[WARN] Falha ao formatar com Prettier:', e);
  }

  console.log('\n[SUCESSO] Módulo D: Dados de infraestrutura e espaços consolidados!');
}

main();
