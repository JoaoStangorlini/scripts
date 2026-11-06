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
import { EventItem } from '../../src/types/events';
import { NewsItem } from '../../src/types/news';

const EVENTS_CACHE = path.join(__dirname, 'cache', 'parsed_events.json');
const NEWS_CACHE = path.join(__dirname, 'cache', 'parsed_news.json');

const EVENTS_DEST = path.join(__dirname, '../../src/data/eventsData.ts');
const NEWS_DEST = path.join(__dirname, '../../src/data/newsData.ts');

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
    osEnsureDir(backupDir);
    const filename = path.basename(filepath);
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `${filename}.${ts}.bak`);
    fs.copyFileSync(filepath, backupPath);
    console.log(`[BACKUP] Criado backup de ${filename} -> ${path.basename(backupPath)}`);
  }
}

function osEnsureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  const isApply = process.argv.includes('--mode=apply');

  console.log('='.repeat(60));
  console.log(`APPLY: INTEGRAÇÃO DE EVENTOS E NOTÍCIAS (Modo: ${isApply ? 'APPLY' : 'DRY-RUN'})`);
  console.log('='.repeat(60));

  if (!fs.existsSync(EVENTS_CACHE) || !fs.existsSync(NEWS_CACHE)) {
    console.error('[ERRO] Caches parsed_events.json ou parsed_news.json não encontrados.');
    process.exit(1);
  }

  const rawEvents: EventItem[] = JSON.parse(fs.readFileSync(EVENTS_CACHE, 'utf-8'));
  const rawNews: NewsItem[] = JSON.parse(fs.readFileSync(NEWS_CACHE, 'utf-8'));

  console.log(`Processando ${rawEvents.length} eventos e ${rawNews.length} notícias...`);

  // Transformar eventos em dicionário Record<string, EventItem>
  const eventsRecord: Record<string, EventItem> = {};
  for (const evt of rawEvents) {
    eventsRecord[evt.id] = evt;
  }

  if (!isApply) {
    console.log('\n[DRY-RUN] Nenhuma alteração gravada. Para aplicar, use:');
    console.log('npx tsx scripts/scrapers/apply_events_and_news.ts --mode=apply\n');
    return;
  }

  // Backup
  backupFile(EVENTS_DEST);
  backupFile(NEWS_DEST);

  // Escrever eventsData.ts
  const eventsFileContent = `${LICENSE_HEADER}
import { EventItem } from '@/types/events';

export const eventsData: Record<string, EventItem> = ${JSON.stringify(eventsRecord, null, 2)};
`;
  fs.writeFileSync(EVENTS_DEST, eventsFileContent, 'utf-8');
  console.log(`[OK] Gravado ${EVENTS_DEST} com ${Object.keys(eventsRecord).length} eventos.`);

  // Escrever newsData.ts
  const newsFileContent = `${LICENSE_HEADER}
import { NewsItem } from '@/types/news';

export const newsData: NewsItem[] = ${JSON.stringify(rawNews, null, 2)};
`;
  fs.writeFileSync(NEWS_DEST, newsFileContent, 'utf-8');
  console.log(`[OK] Gravado ${NEWS_DEST} com ${rawNews.length} notícias.`);

  // Prettier
  try {
    console.log('[PRETTIER] Formatando arquivos gerados...');
    execSync(`npx prettier --write "${EVENTS_DEST}" "${NEWS_DEST}"`, { stdio: 'ignore' });
    console.log('[PRETTIER] Formatação concluída.');
  } catch (e) {
    console.warn('[WARN] Falha ao formatar com Prettier:', e);
  }

  console.log('\n[SUCESSO] Módulo C: Dados consolidados no repositório!');
}

main();
