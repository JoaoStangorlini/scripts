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
import { execSync } from 'child_process';
import { 
    ScrapedPayloadSchema, 
    DocenteScraped, 
    LaboratoryScraped, 
    isSameDocente, 
    tokenizeName,
    C 
} from './audit_departments';
import { institutoData, Department, Researcher, Laboratory } from '../../src/data/institutoData';

// Escala hierárquica ordinal para preservação do maior cargo acadêmico
const ROLE_WEIGHT: Record<string, number> = {
    'Docente': 0,
    'Professor Doutor': 1,
    'Professor Associado': 2,
    'Professor Titular': 3,
    'Professor Sênior': 4,
    'Professor Emérito': 5
};

function getHighestRole(localRole: string, scrapedRole: string): string {
    const wLocal = ROLE_WEIGHT[localRole] ?? 0;
    const wScraped = ROLE_WEIGHT[scrapedRole] ?? 0;

    if (wLocal >= wScraped && wLocal > 0) {
        return localRole;
    }
    if (wScraped > wLocal && wScraped > 0) {
        return scrapedRole;
    }
    return localRole || scrapedRole || 'Docente';
}

// Stoplist específica para nomes de laboratórios (elimina falsos positivos de duplicatas)
const GENERIC_LAB_WORDS = new Set([
    'laboratorio', 'laboratorios', 'lab', 'grupo', 'grupos',
    'pesquisa', 'pesquisas', 'centro', 'nucleo', 'fisica',
    'em', 'no', 'na', 'para', 'de', 'da', 'do', 'dos', 'das', 'e'
]);

function getSpecificLabTokens(name: string): string[] {
    return tokenizeName(name).filter(t => !GENERIC_LAB_WORDS.has(t));
}

/**
 * Deduplicação Trifatorial Blindada de Laboratórios:
 * Retorna true se houver colisão por ID, Website ou similaridade de tokens específicos (não-genéricos).
 */
function isSameLaboratory(localLab: Laboratory, scrapedLab: LaboratoryScraped): boolean {
    // 1. Colisão por ID
    if (localLab.id.toLowerCase() === scrapedLab.id.toLowerCase()) return true;

    // 2. Colisão por Website
    if (localLab.website && scrapedLab.website) {
        try {
            const urlLocal = new URL(localLab.website.startsWith('http') ? localLab.website : `https://${localLab.website}`);
            const urlScraped = new URL(scrapedLab.website.startsWith('http') ? scrapedLab.website : `https://${scrapedLab.website}`);
            if (urlLocal.hostname === urlScraped.hostname && urlLocal.pathname === urlScraped.pathname) {
                return true;
            }
        } catch {
            if (localLab.website.trim().toLowerCase() === scrapedLab.website.trim().toLowerCase()) {
                return true;
            }
        }
    }

    // 3. Colisão por Tokens Específicos de Nome
    const tokensLocal = getSpecificLabTokens(localLab.nome);
    const tokensScraped = getSpecificLabTokens(scrapedLab.nome);
    if (tokensLocal.length >= 1 && tokensScraped.length >= 1) {
        const intersection = tokensLocal.filter(t => tokensScraped.includes(t));
        if (intersection.length >= Math.min(tokensLocal.length, tokensScraped.length) * 0.8) {
            return true;
        }
    }

    return false;
}

export function runApply() {
    console.log(`\n${C.bold}${C.bgBlue} === HUB LAB-DIV: MOTOR DE APLICAÇÃO E DEEP MERGE (MÓDULO A) === ${C.reset}\n`);

    const targetFile = path.resolve(__dirname, '../../src/data/institutoData.ts');
    const jsonPath = path.resolve(__dirname, 'cache/parsed_departments.json');
    const backupDir = path.resolve(__dirname, 'cache');

    if (!fs.existsSync(jsonPath)) {
        console.error(`${C.red}[ERRO] Cache ${jsonPath} não encontrado.${C.reset}`);
        process.exit(1);
    }

    if (!fs.existsSync(targetFile)) {
        console.error(`${C.red}[ERRO] Arquivo de destino ${targetFile} não encontrado.${C.reset}`);
        process.exit(1);
    }

    // 1. Leitura e Validação Zod do Payload
    console.log(`${C.dim}Lendo dados raspados oficiais...${C.reset}`);
    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const parseResult = ScrapedPayloadSchema.safeParse(rawData);
    if (!parseResult.success) {
        console.error(`${C.red}[ERRO CRÍTICO] Payload inválido no Zod.${C.reset}`);
        process.exit(1);
    }
    const scraped = parseResult.data;
    const allScrapedDocentes = Object.values(scraped.departments).flatMap(d => d.docentes);

    // 2. Snapshot de Salvaguarda dentro de scripts/scrapers/cache/ (mantém src/data limpo)
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.resolve(backupDir, `institutoData.backup.${timestamp}.json`);
    console.log(`${C.dim}Criando snapshot de salvaguarda:${C.reset} ${backupPath}`);
    fs.writeFileSync(backupPath, JSON.stringify(institutoData, null, 2), 'utf-8');

    // 3. Extração e Preservação Estrita do Preâmbulo (Licença AGPLv3 e Interfaces Exportadas)
    const originalFileContent = fs.readFileSync(targetFile, 'utf-8');
    const exportMarker = 'export const institutoData: Record<string, Department> = {';
    const markerIndex = originalFileContent.indexOf(exportMarker);

    if (markerIndex === -1) {
        console.error(`${C.red}[ERRO CRÍTICO] Ponto de ancoragem '${exportMarker}' não encontrado no arquivo.${C.reset}`);
        process.exit(1);
    }

    const preamble = originalFileContent.substring(0, markerIndex).trimEnd();
    console.log(`${C.green}✓ Preâmbulo original preservado intacto (${preamble.split('\n').length} linhas incluindo interfaces exportadas).${C.reset}`);

    // 4. Execução do Deep Merge com Spread Operators de Segurança
    const updatedData: Record<string, Department> = {};
    let totalEnrichedDocentes = 0;
    let totalAddedDocentes = 0;
    let totalAddedLabs = 0;

    for (const [slug, dept] of Object.entries(institutoData)) {
        const scrapedDept = scraped.departments[slug];
        const newPesquisadores: Researcher[] = [];
        const seenDocenteIds = new Set<string>();

        // 4.1. Processar Docentes Existentes (Preservação Rígida com ...localP + Enriquecimento)
        for (const localP of dept.pesquisadores) {
            let match = scrapedDept?.docentes.find(doc => isSameDocente(localP, doc));
            if (!match) {
                match = allScrapedDocentes.find(doc => isSameDocente(localP, doc));
            }

            if (match) {
                totalEnrichedDocentes++;
                const enriched: Researcher = {
                    ...localP, // Preserva todos os campos opcionais e customizados pré-existentes
                    role: getHighestRole(localP.role, match.role),
                    iniciais: localP.iniciais || match.iniciais,
                    ...(localP.avatar ? { avatar: localP.avatar } : (match.avatar ? { avatar: match.avatar } : {})),
                    // Lattes: se o local for placeholder genérico, substitui pelo verificado
                    lattes: (localP.lattes && localP.lattes.length > 25 && localP.lattes !== 'http://lattes.cnpq.br/')
                        ? localP.lattes
                        : (match.lattes || localP.lattes || ''),
                    email: localP.email || match.email || undefined,
                    sala: localP.sala || match.sala || undefined,
                    predio: localP.predio || match.predio || undefined,
                    telefone: localP.telefone || match.telefone || undefined
                };
                newPesquisadores.push(enriched);
                seenDocenteIds.add(enriched.id);
            } else {
                // Docente local não encontrado na tabela oficial (preserva 100% como está)
                newPesquisadores.push({ ...localP });
                seenDocenteIds.add(localP.id);
            }
        }

        // 4.2. Inserir Novos Docentes Oficiais Raspados
        if (scrapedDept) {
            for (const doc of scrapedDept.docentes) {
                const alreadyPresent = newPesquisadores.some(p => isSameDocente(p, doc));
                if (!alreadyPresent) {
                    totalAddedDocentes++;
                    let newId = doc.id;
                    if (seenDocenteIds.has(newId)) {
                        newId = `${newId}-${doc.dept_code.toLowerCase()}`;
                    }
                    seenDocenteIds.add(newId);

                    const newDoc: Researcher = {
                        id: newId,
                        nome: doc.nome,
                        role: doc.role,
                        iniciais: doc.iniciais,
                        ...(doc.lattes ? { lattes: doc.lattes } : {}),
                        ...(doc.email ? { email: doc.email } : {}),
                        ...(doc.sala ? { sala: doc.sala } : {}),
                        ...(doc.predio ? { predio: doc.predio } : {}),
                        ...(doc.telefone ? { telefone: doc.telefone } : {}),
                        ...(doc.avatar ? { avatar: doc.avatar } : {})
                    };
                    newPesquisadores.push(newDoc);
                }
            }
        }

        // 4.3. Processar Laboratórios (Deduplicação Trifatorial com Termos Específicos)
        const updatedLabs: Laboratory[] = [...dept.laboratorios];
        if (scrapedDept && scrapedDept.laboratorios) {
            for (const sLab of scrapedDept.laboratorios) {
                const isDuplicate = updatedLabs.some(localLab => isSameLaboratory(localLab, sLab));
                if (!isDuplicate && sLab.nome && sLab.nome.length > 3) {
                    totalAddedLabs++;
                    updatedLabs.push({
                        id: sLab.id,
                        nome: sLab.nome,
                        description: sLab.description || `Laboratório credenciado no ${dept.nome}.`,
                        ...(sLab.website ? { website: sLab.website } : {})
                    });
                }
            }
        }

        // Monta departamento consolidado utilizando spread de segurança ...dept
        updatedData[slug] = {
            ...dept,
            laboratorios: updatedLabs,
            pesquisadores: newPesquisadores
        };
    }

    // 5. Montagem do Novo Código TypeScript
    console.log(`${C.dim}Serializando estrutura TypeScript consolidada...${C.reset}`);
    const code = `${preamble}\n\nexport const institutoData: Record<string, Department> = ${JSON.stringify(updatedData, null, 4)};\n`;

    // 6. Gravação em Disco
    fs.writeFileSync(targetFile, code, 'utf-8');
    console.log(`${C.green}✓ Arquivo ${targetFile} atualizado com sucesso!${C.reset}`);

    // 7. Formatação Prettier e Validação TypeScript com Rollback Automático
    console.log(`${C.dim}Formatando com Prettier...${C.reset}`);
    try {
        execSync(`npx prettier --write "${targetFile}"`, { stdio: 'inherit' });
    } catch {
        console.warn(`${C.yellow}[AVISO] Falha ao rodar prettier. Continuando...${C.reset}`);
    }

    console.log(`${C.dim}Validando integridade de tipos com npx tsc --noEmit...${C.reset}`);
    try {
        execSync(`npx tsc --noEmit`, { stdio: 'inherit' });
        console.log(`\n${C.bold}${C.bgGreen} ✓ SUCESSO: VALIDAÇÃO TSC PASSOU COM ZERO ERROS! ${C.reset}\n`);
    } catch {
        console.error(`\n${C.bold}${C.red}[ERRO CRÍTICO] npx tsc --noEmit falhou após a aplicação.${C.reset}`);
        console.error(`${C.yellow}Iniciando rollback automático a partir do backup...${C.reset}`);
        fs.writeFileSync(targetFile, originalFileContent, 'utf-8');
        console.error(`${C.red}Rollback concluído. O arquivo original foi restaurado.${C.reset}\n`);
        process.exit(1);
    }

    // 8. Relatório Final de Aplicação
    console.log(`${C.bold}--------------------------------------------------------------------------------------------------${C.reset}`);
    console.log(`${C.bold}📊 RELATÓRIO DE APLICAÇÃO CONCLUÍDA (--mode=apply):${C.reset}`);
    console.log(`  • Docentes locais enriquecidos (contatos/lattes): ${C.green}${totalEnrichedDocentes}${C.reset}`);
    console.log(`  • Novos docentes oficiais adicionados: ${C.green}+${totalAddedDocentes}${C.reset}`);
    console.log(`  • Total de docentes no repositório agora: ${C.bold}${Object.values(updatedData).reduce((acc, d) => acc + d.pesquisadores.length, 0)}${C.reset}`);
    console.log(`  • Laboratórios oficiais adicionados (sem duplicatas): ${C.green}+${totalAddedLabs}${C.reset}`);
    console.log(`  • Total de laboratórios preservados e ativos: ${C.bold}${Object.values(updatedData).reduce((acc, d) => acc + d.laboratorios.length, 0)}${C.reset}`);
    console.log(`${C.bold}--------------------------------------------------------------------------------------------------${C.reset}\n`);
}

// Executa se chamado diretamente
if (require.main === module || process.argv.includes('--mode=apply')) {
    runApply();
}
