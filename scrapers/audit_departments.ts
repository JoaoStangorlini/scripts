/*!
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 * * Este programa é software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
 * publicada pela Free Software Foundation.
 * * Este programa é distribuído na esperança de que seja útil, mas SEM
 * QUALQUER GARANTIA; sem mesmo a garantia implícita de COMERCIALIZAÇÃO
 * ou ADEQUAÇÃO A UM DETERMINADO FIM.
 */

import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { institutoData, Researcher } from '../../src/data/institutoData';

// 1. Zod Schema v3 com Tipagem Estrita e Suporte a Laboratórios e 'Outros'
export const DocenteScrapedSchema = z.object({
    id: z.string(),
    nome: z.string().min(2),
    iniciais: z.string().min(2),
    role: z.string(),
    funcao_oficial: z.string().optional().default(''),
    funcao_detalhada: z.string().optional().default(''),
    dept_code: z.string(),
    predio: z.string().optional().default(''),
    sala: z.string().optional().default(''),
    telefone: z.string().optional().default(''),
    portal_profile_url: z.string().optional().default(''),
    email: z.string().optional().default(''),
    lattes: z.string().optional().default(''),
    avatar: z.string().optional().default(''),
    website: z.string().optional().default(''),
    google_scholar: z.string().optional().default(''),
    orcid: z.string().optional().default('')
});

export const LaboratoryScrapedSchema = z.object({
    id: z.string(),
    nome: z.string(),
    description: z.string().optional().default(''),
    website: z.string().optional().default('')
});

export const DepartmentScrapedSchema = z.object({
    slug: z.string(),
    sigla: z.string(),
    dept_code: z.string(),
    nome: z.string(),
    docentes_count: z.number(),
    docentes: z.array(DocenteScrapedSchema),
    laboratorios: z.array(LaboratoryScrapedSchema).optional().default([])
});

export const ScrapedPayloadSchema = z.object({
    metadata: z.object({
        extracted_at: z.string(),
        total_docentes: z.number(),
        source: z.string(),
        generator: z.string()
    }),
    departments: z.record(z.string(), DepartmentScrapedSchema)
});

export type ScrapedPayload = z.infer<typeof ScrapedPayloadSchema>;
export type DocenteScraped = z.infer<typeof DocenteScrapedSchema>;
export type LaboratoryScraped = z.infer<typeof LaboratoryScrapedSchema>;

// Cores ANSI
export const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgBlue: '\x1b[44m',
    bgYellow: '\x1b[43m\x1b[30m',
    bgGreen: '\x1b[42m\x1b[30m'
};

export const STOPWORDS = new Set(['de', 'da', 'do', 'dos', 'das', 'del', 'e', 'van', 'von', 'der']);

export function tokenizeName(name: string): string[] {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .split(/[^a-z0-9]+/)
        .filter(token => token.length > 0 && !STOPWORDS.has(token));
}

export function normalizeName(name: string): string {
    return tokenizeName(name).join('');
}

export interface LocalDocenteMinimal {
    id?: string;
    nome: string;
    email?: string;
    lattes?: string;
    role?: string;
    iniciais?: string;
    sala?: string;
    predio?: string;
    telefone?: string;
    avatar?: string;
}

/**
 * Cruzamento semântico flexível para evitar duplicações entre nomes curtos e civis completos.
 * Regra: Primeiro nome idêntico + subsequência ordenada completa de tokens do nome menor.
 * Cobre nomes com sufixos (Júnior, Filho, Neto) e sobrenomes maternos intermediários.
 */
export function isSameDocente(localDoc: LocalDocenteMinimal, scrapedDoc: DocenteScraped): boolean {
    // a) Igualdade exata de nome normalizado
    const normLocal = normalizeName(localDoc.nome);
    const normScraped = normalizeName(scrapedDoc.nome);
    if (normLocal === normScraped) return true;

    // b) Igualdade de email ou lattes (se presentes em ambos e não-genéricos)
    if (localDoc.email && scrapedDoc.email && localDoc.email.includes('@') && scrapedDoc.email.includes('@')) {
        if (localDoc.email.toLowerCase().trim() === scrapedDoc.email.toLowerCase().trim()) return true;
    }
    
    const cleanLattesLocal = localDoc.lattes?.replace(/\/$/, '').trim().toLowerCase();
    const cleanLattesScraped = scrapedDoc.lattes?.replace(/\/$/, '').trim().toLowerCase();
    if (
        cleanLattesLocal && cleanLattesScraped &&
        cleanLattesLocal.length > 25 && cleanLattesScraped.length > 25 &&
        cleanLattesLocal !== 'http://lattes.cnpq.br' && cleanLattesLocal !== 'https://lattes.cnpq.br'
    ) {
        if (cleanLattesLocal === cleanLattesScraped) return true;
    }

    // c) Subsequência ordenada: Primeiro nome idêntico + todos os tokens do menor contidos no maior
    const tokensLocal = tokenizeName(localDoc.nome);
    const tokensScraped = tokenizeName(scrapedDoc.nome);

    if (tokensLocal.length >= 2 && tokensScraped.length >= 2) {
        const [shortTokens, longTokens] = tokensLocal.length <= tokensScraped.length 
            ? [tokensLocal, tokensScraped] 
            : [tokensScraped, tokensLocal];

        // Primeiro nome deve ser rigorosamente idêntico
        if (shortTokens[0] === longTokens[0]) {
            let lIdx = 0;
            let matched = 0;
            for (const sToken of shortTokens) {
                while (lIdx < longTokens.length) {
                    if (longTokens[lIdx] === sToken) {
                        matched++;
                        lIdx++;
                        break;
                    }
                    lIdx++;
                }
            }
            if (matched === shortTokens.length) {
                return true;
            }
        }
    }

    return false;
}

export function runAudit() {
    console.log(`\n${C.bold}${C.bgBlue} === HUB LAB-DIV: AUDITORIA DE DADOS DO EIXO INFORMATIVO (PIPELINE v5) === ${C.reset}\n`);

    const jsonPath = path.resolve(__dirname, 'cache/parsed_departments.json');
    if (!fs.existsSync(jsonPath)) {
        console.error(`${C.red}[ERRO] Arquivo de cache estruturado não encontrado em:${C.reset} ${jsonPath}`);
        console.error(`Execute primeiro: ${C.cyan}python3 scripts/scrapers/scrape_departments.py${C.reset}\n`);
        process.exit(1);
    }

    console.log(`${C.dim}Lendo payload estruturado:${C.reset} ${jsonPath}`);
    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    // Validação com Zod
    const parseResult = ScrapedPayloadSchema.safeParse(rawData);
    if (!parseResult.success) {
        console.error(`${C.red}[FALHA NA VALIDAÇÃO ZOD]: O JSON coletado não cumpre o contrato de tipos v5.${C.reset}`);
        console.error(parseResult.error.format());
        process.exit(1);
    }

    const scraped = parseResult.data;
    console.log(`${C.green}✓ Schema Zod v5 validado com sucesso!${C.reset} Fonte: ${scraped.metadata.source}`);
    console.log(`${C.dim}Extração realizada em: ${scraped.metadata.extracted_at} | Total no portal: ${scraped.metadata.total_docentes} docentes.${C.reset}\n`);

    // Todos os docentes oficiais raspados (para busca cruzada global)
    const allScrapedDocentes = Object.values(scraped.departments).flatMap(d => d.docentes);

    let totalLocalDocentes = 0;
    let totalScrapedDocentes = 0;
    let totalNewDocentes = 0;
    let totalWithLattes = 0;
    let totalWithEmail = 0;
    let totalLocalLabs = 0;
    let totalScrapedLabs = 0;

    console.log(`${C.bold}---------------------------------------------------------------------------------------------------------------------${C.reset}`);
    console.log(`${C.bold}${'DEPARTAMENTO'.padEnd(32)} | ${'ATUAL'.padEnd(7)} | ${'OFICIAL'.padEnd(7)} | ${'NOVOS'.padEnd(7)} | ${'LATTES VÁLIDO'.padEnd(14)} | ${'E-MAIL'.padEnd(8)} | ${'LABS (ATUAL/OFIC)'.padEnd(17)}${C.reset}`);
    console.log(`${C.bold}---------------------------------------------------------------------------------------------------------------------${C.reset}`);

    const auditResults: Record<string, {
        slug: string;
        nome: string;
        novos: DocenteScraped[];
        ausentes: string[];
        cruzadosComOutros: { localNome: string; scrapedNome: string; deptOrigem: string }[];
        lattesEncontrados: number;
        emailsEncontrados: number;
        localLabsCount: number;
        scrapedLabsCount: number;
    }> = {};

    for (const [slug, dept] of Object.entries(scraped.departments)) {
        if (slug === 'outros') continue;

        const localDept = institutoData[slug];
        const localPesquisadores: Researcher[] = localDept ? localDept.pesquisadores : [];

        const novos: DocenteScraped[] = [];
        let lattesCount = 0;
        let emailsCount = 0;

        for (const doc of dept.docentes) {
            // Usa o cruzamento semântico flexível isSameDocente
            const isAlreadyPresent = localPesquisadores.some(localP => isSameDocente(localP, doc));
            if (!isAlreadyPresent) {
                novos.push(doc);
            }

            if (doc.lattes && (doc.lattes.includes('lattes.cnpq.br/') || doc.lattes.includes('buscatextual.cnpq.br/'))) {
                lattesCount++;
                totalWithLattes++;
            }
            if (doc.email && doc.email.includes('@')) {
                emailsCount++;
                totalWithEmail++;
            }
        }

        // Identifica ausentes no departamento
        const ausentesDept = localPesquisadores.filter(
            localP => !dept.docentes.some(scrapedD => isSameDocente(localP, scrapedD))
        );

        // Busca Cruzada Global: verifica se os ausentes deste departamento estão em 'outros' ou em outro departamento oficial
        const cruzadosComOutros: { localNome: string; scrapedNome: string; deptOrigem: string }[] = [];
        const ausentesFinais: string[] = [];

        for (const localP of ausentesDept) {
            const matchGlobal = allScrapedDocentes.find(scrapedD => isSameDocente(localP, scrapedD));
            if (matchGlobal) {
                cruzadosComOutros.push({
                    localNome: localP.nome,
                    scrapedNome: matchGlobal.nome,
                    deptOrigem: matchGlobal.dept_code
                });
            } else {
                ausentesFinais.push(localP.nome);
            }
        }

        totalLocalDocentes += localPesquisadores.length;
        totalScrapedDocentes += dept.docentes.length;
        totalNewDocentes += novos.length;

        const localLabsCount = localDept ? localDept.laboratorios.length : 0;
        const scrapedLabsCount = dept.laboratorios ? dept.laboratorios.length : 0;
        totalLocalLabs += localLabsCount;
        totalScrapedLabs += scrapedLabsCount;

        auditResults[slug] = {
            slug,
            nome: dept.nome,
            novos,
            ausentes: ausentesFinais,
            cruzadosComOutros,
            lattesEncontrados: lattesCount,
            emailsEncontrados: emailsCount,
            localLabsCount,
            scrapedLabsCount
        };

        const labsDisplay = `${localLabsCount} / ${scrapedLabsCount}`;

        console.log(
            `${C.cyan}${dept.nome.padEnd(32)}${C.reset} | ` +
            `${String(localPesquisadores.length).padStart(7)} | ` +
            `${C.bold}${String(dept.docentes.length).padStart(7)}${C.reset} | ` +
            `${C.yellow}${('+' + novos.length).padStart(7)}${C.reset} | ` +
            `${C.green}${String(lattesCount).padStart(14)}${C.reset} | ` +
            `${C.green}${String(emailsCount).padStart(8)}${C.reset} | ` +
            `${labsDisplay.padStart(17)}`
        );
    }

    console.log(`${C.bold}---------------------------------------------------------------------------------------------------------------------${C.reset}`);
    console.log(
        `${C.bold}${'TOTAL DEPARTAMENTOS PRINCIPAIS'.padEnd(32)} | ` +
        `${String(totalLocalDocentes).padStart(7)} | ` +
        `${C.bold}${String(totalScrapedDocentes).padStart(7)}${C.reset} | ` +
        `${C.yellow}${('+' + totalNewDocentes).padStart(7)}${C.reset} | ` +
        `${C.green}${String(totalWithLattes).padStart(14)}${C.reset} | ` +
        `${C.green}${String(totalWithEmail).padStart(8)}${C.reset} | ` +
        `${`${totalLocalLabs} / ${totalScrapedLabs}`.padStart(17)}${C.reset}\n`
    );

    // Seção para 'Outros' (docentes sem departamento mapeado)
    if (scraped.departments['outros'] && scraped.departments['outros'].docentes.length > 0) {
        const outros = scraped.departments['outros'];
        console.log(`${C.bold}${C.yellow}⚠️  DOCENTES EM 'OUTROS' (Tabela Mestra Oficial):${C.reset}`);
        for (const doc of outros.docentes) {
            console.log(`    • ${C.white}${doc.nome}${C.reset} [Dept Code: ${doc.dept_code}] - Sala: ${doc.sala || 's/n'} | Email: ${doc.email || 's/ email'} | Lattes: ${doc.lattes || 's/ lattes'}`);
        }
        console.log('');
    }

    // Seção de Cruzamento Global (Docentes locais encontrados em outro departamento ou em 'Outros')
    let hasCruzados = false;
    for (const [slug, res] of Object.entries(auditResults)) {
        if (res.cruzadosComOutros.length > 0) {
            if (!hasCruzados) {
                console.log(`${C.bold}${C.green}🔄 DOCENTES LOCAIS ENCONTRADOS EM OUTRA LOTAÇÃO OFICIAL (Match Cruzado Global):${C.reset}`);
                hasCruzados = true;
            }
            console.log(`  ${C.bold}Departamento Local ${res.nome} (${slug.toUpperCase()}):${C.reset}`);
            for (const cr of res.cruzadosComOutros) {
                console.log(`    • ${C.cyan}${cr.localNome}${C.reset} localmente -> Oficial: ${C.green}${cr.scrapedNome}${C.reset} (Lotação Oficial: ${cr.deptOrigem})`);
            }
        }
    }
    if (hasCruzados) console.log('');

    // Seção de Ausentes Efetivos (Docentes locais não encontrados em nenhum lugar da tabela mestra oficial)
    let hasAusentes = false;
    for (const [slug, res] of Object.entries(auditResults)) {
        if (res.ausentes.length > 0) {
            if (!hasAusentes) {
                console.log(`${C.bold}${C.red}⚠️  DOCENTES LOCAIS EFETIVAMENTE AUSENTES NO PORTAL (Aposentadoria / Homônimos não mapeados):${C.reset}`);
                hasAusentes = true;
            }
            console.log(`  ${C.bold}Departamento ${res.nome} (${slug.toUpperCase()}):${C.reset}`);
            for (const nomeAusente of res.ausentes) {
                console.log(`    • ${C.red}${nomeAusente}${C.reset} (permanece em institutoData.ts sem alteração)`);
            }
        }
    }
    if (hasAusentes) console.log('');

    // Cálculo da Completude Atual
    const matchedDocentes = totalScrapedDocentes - totalNewDocentes;
    const completudePercent = Math.round((matchedDocentes / totalScrapedDocentes) * 100);

    // Diagnóstico de Conclusão da Auditoria
    console.log(`\n${C.bold}📊 DIAGNÓSTICO DA AUDITORIA (v5):${C.reset}`);
    console.log(`  1. Cobertura Atual no Repositório: ${C.cyan}${totalLocalDocentes} docentes locais${C.reset} (${matchedDocentes} casados com o portal oficial).`);
    console.log(`  2. Cobertura Oficial no Portal IFUSP: ${C.green}${totalScrapedDocentes} docentes ativos nos 6 departamentos${C.reset}.`);
    console.log(`  3. Gap de Informação: ${C.yellow}${totalNewDocentes} novos docentes reais a integrar (${completudePercent}% de completude atual)${C.reset}.`);
    console.log(`  4. Contatos Válidos Sanitizados: ${C.green}${totalWithEmail} e-mails limpos${C.reset} e ${C.green}${totalWithLattes} perfis Lattes sem CAPTCHA${C.reset}.`);
    console.log(`  5. Laboratórios Mapeados: ${C.cyan}${totalLocalLabs} locais (preservados integralmente)${C.reset} e ${C.green}${totalScrapedLabs} referências oficiais raspadas${C.reset}.`);

    console.log(`\n${C.bold}${C.green}✓ Auditoria v5 Concluída com Sucesso! Pronto para o Módulo de Aplicação.${C.reset}\n`);
}

// Executa se chamado diretamente
if (require.main === module || process.argv.includes('--mode=audit')) {
    runAudit();
}
