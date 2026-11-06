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
import { z } from 'zod';

const EVENTS_JSON_PATH = path.join(__dirname, 'cache', 'parsed_events.json');
const NEWS_JSON_PATH = path.join(__dirname, 'cache', 'parsed_news.json');
const REPORT_PATH = path.join(__dirname, 'audit_events_news_report.json');

// --- ZOD SCHEMAS ---

const EventSpeakerSchema = z.object({
  nome: z.string().min(2),
  afiliacao: z.string().optional(),
  titulacao: z.string().optional(),
  lattes: z.string().optional()
});

const EventLocationSchema = z.object({
  nome: z.string().min(2),
  sala: z.string().optional(),
  formato: z.enum(['presencial', 'hibrido', 'online'])
});

const EventLinksSchema = z.object({
  oficial: z.string().min(1),
  transmissao: z.string().optional().or(z.literal('')),
  anexoPdf: z.string().optional().or(z.literal('')),
  inscricao: z.string().optional().or(z.literal(''))
});

const EventItemSchema = z.object({
  id: z.string().min(2),
  titulo: z.string().min(3),
  tipo: z.enum(['coloquio', 'convite-fisica', 'seminario', 'workshop', 'institucional']),
  data: z.string().min(4),
  horario: z.string().optional(),
  dataFim: z.string().optional(),
  horarioFim: z.string().optional(),
  local: EventLocationSchema,
  palestrante: EventSpeakerSchema.optional().nullable(),
  resumo: z.string().min(10),
  links: EventLinksSchema,
  destaque: z.boolean().optional(),
  tags: z.array(z.string())
});

const NewsItemSchema = z.object({
  id: z.string().min(2),
  titulo: z.string().min(3),
  subtitulo: z.string().optional(),
  data: z.string().min(4),
  resumo: z.string().min(10),
  conteudo: z.string().optional(),
  categoria: z.string().min(2),
  imagem: z.string().optional().or(z.literal('')),
  linkOficial: z.string().min(1),
  autor: z.string().optional(),
  tags: z.array(z.string())
});

async function runAudit() {
  console.log('='.repeat(60));
  console.log('AUDITORIA ZOD: EVENTOS, COLÓQUIOS E NOTÍCIAS DO IFUSP');
  console.log('='.repeat(60));

  if (!fs.existsSync(EVENTS_JSON_PATH)) {
    console.error(`[ERRO] Arquivo de eventos não encontrado: ${EVENTS_JSON_PATH}`);
    process.exit(1);
  }

  if (!fs.existsSync(NEWS_JSON_PATH)) {
    console.error(`[ERRO] Arquivo de notícias não encontrado: ${NEWS_JSON_PATH}`);
    process.exit(1);
  }

  const rawEvents = JSON.parse(fs.readFileSync(EVENTS_JSON_PATH, 'utf-8'));
  const rawNews = JSON.parse(fs.readFileSync(NEWS_JSON_PATH, 'utf-8'));

  console.log(`Carregados ${rawEvents.length} eventos e ${rawNews.length} notícias raspadas.\n`);

  // Auditar Eventos
  let validEventsCount = 0;
  const eventErrors: any[] = [];
  const eventTypesSummary: Record<string, number> = {};

  for (const evt of rawEvents) {
    const parseResult = EventItemSchema.safeParse(evt);
    if (parseResult.success) {
      validEventsCount++;
      eventTypesSummary[evt.tipo] = (eventTypesSummary[evt.tipo] || 0) + 1;
    } else {
      eventErrors.push({ id: evt.id, titulo: evt.titulo, errors: parseResult.error.format() });
    }
  }

  // Auditar Notícias
  let validNewsCount = 0;
  const newsErrors: any[] = [];
  const newsCategoriesSummary: Record<string, number> = {};

  for (const n of rawNews) {
    const parseResult = NewsItemSchema.safeParse(n);
    if (parseResult.success) {
      validNewsCount++;
      newsCategoriesSummary[n.categoria] = (newsCategoriesSummary[n.categoria] || 0) + 1;
    } else {
      newsErrors.push({ id: n.id, titulo: n.titulo, errors: parseResult.error.format() });
    }
  }

  console.log('--- RESUMO DA AUDITORIA DE EVENTOS ---');
  console.log(`Eventos Válidos: ${validEventsCount}/${rawEvents.length}`);
  console.log('Distribuição por Tipo:', eventTypesSummary);
  if (eventErrors.length > 0) {
    console.warn(`[AVISO] ${eventErrors.length} eventos com falha Zod.`);
  }

  console.log('\n--- RESUMO DA AUDITORIA DE NOTÍCIAS ---');
  console.log(`Notícias Válidas: ${validNewsCount}/${rawNews.length}`);
  console.log('Distribuição por Categoria:', newsCategoriesSummary);
  if (newsErrors.length > 0) {
    console.warn(`[AVISO] ${newsErrors.length} notícias com falha Zod.`);
  }

  const report = {
    timestamp: new Date().toISOString(),
    events: {
      total: rawEvents.length,
      valid: validEventsCount,
      distribution: eventTypesSummary,
      errors: eventErrors
    },
    news: {
      total: rawNews.length,
      valid: validNewsCount,
      distribution: newsCategoriesSummary,
      errors: newsErrors
    }
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nRelatório salvo em: ${REPORT_PATH}`);

  if (eventErrors.length === 0 && newsErrors.length === 0) {
    console.log('\n[SUCESSO] 100% dos dados passaram na validação Zod!');
  } else {
    console.log('\n[AVISO] Há pendências a ajustar no parser.');
  }
}

runAudit();
