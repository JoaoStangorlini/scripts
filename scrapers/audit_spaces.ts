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

const SPACES_JSON_PATH = path.join(__dirname, 'cache', 'parsed_spaces.json');
const REPORT_PATH = path.join(__dirname, 'audit_spaces_report.json');

const SpaceContactSchema = z.object({
  email: z.string().optional(),
  telefone: z.string().optional(),
  ramal: z.string().optional(),
  responsavel: z.string().optional()
});

const SpaceLinksSchema = z.object({
  oficial: z.string().optional().or(z.literal('')),
  agendamento: z.string().optional().or(z.literal('')),
  mapaUrl: z.string().optional().or(z.literal(''))
});

const SpaceItemSchema = z.object({
  id: z.string().min(2),
  nome: z.string().min(3),
  sigla: z.string().optional(),
  categoria: z.enum([
    'estudo-biblioteca',
    'auditorio',
    'maker-convivencia',
    'oficina-tecnica',
    'servico-alimentacao',
    'laboratorio-pesquisa'
  ]),
  predio: z.string().min(3),
  andar: z.string().optional(),
  sala: z.string().optional(),
  capacidade: z.string().optional(),
  horario: z.string().min(3),
  descricao: z.string().min(10),
  recursos: z.array(z.string()),
  comoAcessar: z.string().min(5),
  contato: SpaceContactSchema.optional(),
  links: SpaceLinksSchema,
  destaque: z.boolean().optional(),
  icone: z.string()
});

async function runAudit() {
  console.log('='.repeat(60));
  console.log('AUDITORIA ZOD: ESPAÇOS FÍSICOS & INFRAESTRUTURA DO IFUSP');
  console.log('='.repeat(60));

  if (!fs.existsSync(SPACES_JSON_PATH)) {
    console.error(`[ERRO] Arquivo não encontrado: ${SPACES_JSON_PATH}`);
    process.exit(1);
  }

  const rawSpaces = JSON.parse(fs.readFileSync(SPACES_JSON_PATH, 'utf-8'));
  console.log(`Carregados ${rawSpaces.length} espaços físicos do IFUSP.\n`);

  let validCount = 0;
  const errors: any[] = [];
  const distribution: Record<string, number> = {};

  for (const space of rawSpaces) {
    const res = SpaceItemSchema.safeParse(space);
    if (res.success) {
      validCount++;
      distribution[space.categoria] = (distribution[space.categoria] || 0) + 1;
    } else {
      errors.push({ id: space.id, nome: space.nome, errors: res.error.format() });
    }
  }

  console.log('--- RESUMO DA AUDITORIA DE ESPAÇOS ---');
  console.log(`Espaços Válidos: ${validCount}/${rawSpaces.length}`);
  console.log('Distribuição por Categoria:', distribution);

  if (errors.length > 0) {
    console.warn(`[AVISO] ${errors.length} espaços com falha Zod.`);
  }

  const report = {
    timestamp: new Date().toISOString(),
    total: rawSpaces.length,
    valid: validCount,
    distribution,
    errors
  };

  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf-8');
  console.log(`\nRelatório salvo em: ${REPORT_PATH}`);

  if (errors.length === 0) {
    console.log('\n[SUCESSO] 100% dos espaços físicos passaram na validação Zod!');
  } else {
    console.log('\n[AVISO] Ajustes necessários.');
  }
}

runAudit();
