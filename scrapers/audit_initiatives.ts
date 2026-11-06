/*!
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

import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { initiativesData } from '../../src/data/initiativesData';
import { Initiative, InitiativeCategory, InitiativeVisualTheme } from '../../src/types/initiatives';

// Cores ANSI para o terminal
export const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

// Helper Zod para links externos opcionais que aceitam string vazia ""
const optionalUrlSchema = z.string().url().or(z.literal('')).optional().transform(v => v === '' ? undefined : v);

// 1. Schema Zod Estrito para Iniciativa Raspada
export const ScrapedInitiativeSchema = z.object({
    id: z.string().min(2),
    nome: z.string().min(3),
    sigla: z.string().optional(),
    categoria: z.enum(['divulgacao', 'escolar', 'maker', 'inclusao', 'academica']),
    resumo: z.string().min(10),
    descricao: z.string().min(20),
    publicoAlvo: z.string().default('Comunidade geral e universitários'),
    coordenacao: z.string().optional(),
    comoParticipar: z.string().optional(),
    modalidadeBolsa: z.array(z.string()).default(['PUB', 'Voluntariado']),
    temaVisual: z.enum(['default', 'labdiv', 'show-da-fisica', 'hackerspace']).default('default'),
    contatos: z.object({
        email: z.string().email().or(z.literal('')).optional().transform(v => v === '' ? undefined : v),
        website: optionalUrlSchema,
        instagram: optionalUrlSchema,
        youtube: optionalUrlSchema,
        localizacao: z.string().optional()
    }).default({
        email: undefined,
        website: undefined,
        instagram: undefined,
        youtube: undefined,
        localizacao: undefined
    }),
    links: z.object({
        interno: z.string().startsWith('/').optional(),
        oficial: optionalUrlSchema,
        formulario: optionalUrlSchema
    }).default({
        interno: undefined,
        oficial: undefined,
        formulario: undefined
    }),
    destaque: z.boolean().default(false),
    tags: z.array(z.string()).default([])
});

export const ScrapedInitiativesPayloadSchema = z.object({
    metadata: z.object({
        source: z.string().url(),
        scraped_at: z.string(),
        total_initiatives: z.number()
    }),
    initiatives: z.array(ScrapedInitiativeSchema)
});

export type ScrapedInitiative = z.infer<typeof ScrapedInitiativeSchema>;

const STOP_WORDS = new Set(['de', 'da', 'do', 'dos', 'das', 'e', 'a', 'o', 'as', 'os', 'para', 'ao', 'aos']);

export function tokenizeInitiative(name: string): string[] {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

export function isSameInitiative(local: Initiative, scraped: ScrapedInitiative): boolean {
    if (local.id === scraped.id) return true;
    
    // Normalização sem preposições (ex: "show-da-fisica" vs "show-de-fisica")
    const idLocal = local.id.replace(/-(da|de|do|dos|das)-/g, '-');
    const idScraped = scraped.id.replace(/-(da|de|do|dos|das)-/g, '-');
    if (idLocal === idScraped) return true;

    // Tokens significativos comuns
    const tLocal = new Set(tokenizeInitiative(local.nome));
    const tScraped = new Set(tokenizeInitiative(scraped.nome));
    
    let intersection = 0;
    for (const t of tLocal) {
        if (tScraped.has(t)) intersection++;
    }
    const minSize = Math.min(tLocal.size, tScraped.size);
    return minSize > 0 && (intersection / minSize) >= 0.7;
}

export function auditInitiatives() {
    console.log(`\n${C.bold}${C.blue}╔════════════════════════════════════════════════════════════════════╗${C.reset}`);
    console.log(`${C.bold}${C.blue}║          AUDITORIA DE INICIATIVAS DE EXTENSÃO (CCEx-IFUSP)         ║${C.reset}`);
    console.log(`${C.bold}${C.blue}╚════════════════════════════════════════════════════════════════════╝${C.reset}\n`);

    const jsonPath = path.resolve(process.cwd(), 'scripts/scrapers/cache/parsed_initiatives.json');
    if (!fs.existsSync(jsonPath)) {
        console.error(`${C.red}✕ Erro: Arquivo de cache ${jsonPath} não encontrado!${C.reset}`);
        console.error(`Execute primeiro: python3 scripts/scrapers/scrape_initiatives.py\n`);
        process.exit(1);
    }

    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    // 1. Validação Zod do Payload
    console.log(`${C.dim}Validando payload com Zod Schema...${C.reset}`);
    const parseResult = ScrapedInitiativesPayloadSchema.safeParse(rawData);
    if (!parseResult.success) {
        console.error(`${C.red}✕ Erro de validação Zod no payload raspado:${C.reset}`);
        console.error(JSON.stringify(parseResult.error.format(), null, 2));
        process.exit(1);
    }

    const { metadata, initiatives: scrapedList } = parseResult.data;
    console.log(`${C.green}✓ Payload Zod 100% válido!${C.reset}`);
    console.log(`  Origem: ${C.cyan}${metadata.source}${C.reset}`);
    console.log(`  Data da Coleta: ${metadata.scraped_at}`);
    console.log(`  Total raspado da CCEx: ${scrapedList.length}\n`);

    // 2. Análise de Cruzamento com Base Local
    const localList = Object.values(initiativesData);
    console.log(`${C.bold}Status da Base Local Inicial:${C.reset}`);
    console.log(`  Iniciativas já cadastradas no HUB: ${C.cyan}${localList.length}${C.reset}\n`);

    let matchedCount = 0;
    let newCount = 0;
    const enrichments: Array<{ local: Initiative; scraped: ScrapedInitiative }> = [];
    const newInitiatives: ScrapedInitiative[] = [];

    for (const scraped of scrapedList) {
        const localMatch = localList.find(loc => isSameInitiative(loc, scraped));
        if (localMatch) {
            matchedCount++;
            enrichments.push({ local: localMatch, scraped });
        } else {
            newCount++;
            newInitiatives.push(scraped);
        }
    }

    // 3. Exibição Detalhada dos Matches e Enriquecimentos
    console.log(`${C.bold}${C.green}=== INICIATIVAS EXISTENTES (ENRIQUECIMENTO DE DADOS) ===${C.reset}`);
    for (const { local, scraped } of enrichments) {
        console.log(`  ${C.green}●${C.reset} [${local.id}] ${C.bold}${local.nome}${C.reset}`);
        console.log(`    Local: ${local.links.interno || 'sem link interno'} | Tema: ${local.temaVisual || 'default'}`);
        console.log(`    Enriquecido com CCEx: ${scraped.links.oficial || 'N/A'}`);
        if (scraped.contatos.email && !local.contatos.email) {
            console.log(`    ${C.cyan}+ Novo E-mail CCEx:${C.reset} ${scraped.contatos.email}`);
        }
    }

    // 4. Exibição das Novas Iniciativas a Adicionar
    console.log(`\n${C.bold}${C.yellow}=== NOVAS INICIATIVAS DA CCEX A SEREM INCORPORADAS ===${C.reset}`);
    for (const item of newInitiatives) {
        console.log(`  ${C.yellow}✚${C.reset} [${item.id}] ${C.bold}${item.nome}${C.reset} (${C.cyan}${item.categoria.toUpperCase()}${C.reset})`);
        console.log(`    Resumo: ${item.resumo.slice(0, 95)}...`);
        console.log(`    E-mail: ${item.contatos.email || 'N/A'} | Coord: ${item.coordenacao || 'N/A'}`);
        console.log(`    Oficial: ${item.links.oficial || 'N/A'}`);
    }

    // 5. Resumo Executivo
    console.log(`\n${C.bold}${C.cyan}=== RESUMO DA AUDITORIA ===${C.reset}`);
    console.log(`  Base local prévia:       ${localList.length} iniciativas`);
    console.log(`  Iniciativas coincidentes: ${matchedCount} (preservando páginas internas)`);
    console.log(`  Novas iniciativas CCEx:   ${newCount} prontas para inclusão`);
    console.log(`  ${C.bold}Total projetado pós-merge: ${localList.length + newCount} iniciativas${C.reset}`);

    return {
        matchedCount,
        newCount,
        totalProjected: localList.length + newCount
    };
}

if (require.main === module) {
    const isAudit = process.argv.includes('--mode=audit');
    if (!isAudit) {
        console.log(`Uso: npx tsx scripts/scrapers/audit_initiatives.ts --mode=audit`);
        process.exit(0);
    }
    auditInitiatives();
}
