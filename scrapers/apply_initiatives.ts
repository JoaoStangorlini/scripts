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
import { execSync } from 'child_process';
import { 
    ScrapedInitiativesPayloadSchema, 
    ScrapedInitiative, 
    isSameInitiative, 
    C 
} from './audit_initiatives';
import { initiativesData } from '../../src/data/initiativesData';
import { Initiative } from '../../src/types/initiatives';

async function applyInitiatives() {
    console.log(`\n${C.bold}${C.blue}╔════════════════════════════════════════════════════════════════════╗${C.reset}`);
    console.log(`${C.bold}${C.blue}║          APLICAÇÃO DE INICIATIVAS DE EXTENSÃO (CCEx-IFUSP)         ║${C.reset}`);
    console.log(`${C.bold}${C.blue}╚════════════════════════════════════════════════════════════════════╝${C.reset}\n`);

    const jsonPath = path.resolve(process.cwd(), 'scripts/scrapers/cache/parsed_initiatives.json');
    const targetFile = path.resolve(process.cwd(), 'src/data/initiativesData.ts');

    if (!fs.existsSync(jsonPath)) {
        throw new Error(`Arquivo de cache não encontrado: ${jsonPath}`);
    }

    const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const parseResult = ScrapedInitiativesPayloadSchema.safeParse(rawData);
    if (!parseResult.success) {
        throw new Error('Falha na validação Zod do payload raspado.');
    }

    const { initiatives: scrapedList } = parseResult.data;

    // 1. Backup de Segurança
    const backupDir = path.resolve(process.cwd(), 'scripts/scrapers/cache');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `initiativesData.backup.${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(initiativesData, null, 2), 'utf-8');
    console.log(`${C.green}✓${C.reset} Backup de segurança gravado em: ${backupFile}`);

    // 2. Extração do Preâmbulo (AGPLv3 + imports)
    const currentCode = fs.readFileSync(targetFile, 'utf-8');
    const preambleMatch = currentCode.match(/^([\s\S]*?)(export const initiativesData)/);
    if (!preambleMatch) {
        throw new Error('Não foi possível identificar o preâmbulo do initiativesData.ts');
    }
    const preamble = preambleMatch[1].trim();

    // 3. Deep Merge Blindado
    const updatedData: Record<string, Initiative> = {};
    let enrichedCount = 0;
    let addedCount = 0;

    // 3.1. Copia todas as iniciativas locais preservando identidade visual e rotas internas
    for (const [key, localInit] of Object.entries(initiativesData)) {
        updatedData[key] = { ...localInit };
    }

    // 3.2. Itera sobre a lista raspada da CCEx
    for (const scraped of scrapedList) {
        let matchedKey: string | null = null;
        for (const [key, localInit] of Object.entries(updatedData)) {
            if (isSameInitiative(localInit, scraped)) {
                matchedKey = key;
                break;
            }
        }

        if (matchedKey) {
            // Enriquecimento seguro: só preenche o que estiver vazio localmente
            enrichedCount++;
            const current = updatedData[matchedKey];
            updatedData[matchedKey] = {
                ...current,
                coordenacao: current.coordenacao || scraped.coordenacao,
                comoParticipar: current.comoParticipar || scraped.comoParticipar,
                contatos: {
                    ...scraped.contatos,
                    ...current.contatos,
                    // Garante que o e-mail oficial da CCEx entra se local não tiver
                    email: current.contatos.email || scraped.contatos.email
                },
                links: {
                    ...scraped.links,
                    ...current.links,
                    // Garante que o link oficial do portal entra
                    oficial: current.links.oficial || scraped.links.oficial
                },
                tags: Array.from(new Set([...current.tags, ...scraped.tags]))
            };
        } else {
            // Nova iniciativa da CCEx
            addedCount++;
            updatedData[scraped.id] = {
                id: scraped.id,
                nome: scraped.nome,
                sigla: scraped.sigla,
                categoria: scraped.categoria,
                resumo: scraped.resumo,
                descricao: scraped.descricao,
                publicoAlvo: scraped.publicoAlvo,
                coordenacao: scraped.coordenacao || 'Comissão de Cultura e Extensão (CCEx-IFUSP)',
                comoParticipar: scraped.comoParticipar,
                modalidadeBolsa: scraped.modalidadeBolsa,
                temaVisual: 'default',
                contatos: {
                    email: scraped.contatos.email,
                    website: scraped.contatos.website,
                    instagram: scraped.contatos.instagram,
                    youtube: scraped.contatos.youtube,
                    localizacao: scraped.contatos.localizacao
                },
                links: {
                    oficial: scraped.links.oficial,
                    formulario: scraped.links.formulario
                },
                destaque: false,
                tags: scraped.tags
            };
        }
    }

    console.log(`${C.dim}Consolidando estrutura TypeScript em disco...${C.reset}`);
    const code = `${preamble}\n\nexport const initiativesData: Record<string, Initiative> = ${JSON.stringify(updatedData, null, 2)};\n`;
    fs.writeFileSync(targetFile, code, 'utf-8');
    console.log(`${C.green}✓${C.reset} Arquivo ${targetFile} atualizado!`);

    // 4. Formatação Prettier
    try {
        console.log(`Formatando com Prettier...`);
        execSync(`npx prettier --write "${targetFile}"`, { stdio: 'inherit' });
        console.log(`${C.green}✓${C.reset} Prettier concluído.`);
    } catch (err) {
        console.warn('Aviso: Falha na execução do Prettier:', err);
    }

    // 5. Validação TypeScript com Rollback
    try {
        console.log(`Executando validação de tipos (npx tsc --noEmit)...`);
        execSync('npx tsc --noEmit', { stdio: 'inherit' });
        console.log(`${C.green}✓${C.reset} TypeScript Check: 0 erros.`);
    } catch (err) {
        console.error(`${C.red}✕ Erro de compilação TypeScript! Restaurando backup prévio...${C.reset}`);
        fs.writeFileSync(targetFile, currentCode, 'utf-8');
        process.exit(1);
    }

    console.log(`\n${C.bold}${C.green}=== APLICAÇÃO CONCLUÍDA COM SUCESSO ===${C.reset}`);
    console.log(`  Iniciativas locais enriquecidas: ${enrichedCount}`);
    console.log(`  Novas iniciativas adicionadas:   ${addedCount}`);
    console.log(`  Total no catálogo HUB LabDiv:    ${Object.keys(updatedData).length}`);
}

if (require.main === module) {
    const isApply = process.argv.includes('--mode=apply');
    if (!isApply) {
        console.log(`Uso: npx tsx scripts/scrapers/apply_initiatives.ts --mode=apply`);
        process.exit(0);
    }
    applyInitiatives().catch(err => {
        console.error('Erro na aplicação:', err);
        process.exit(1);
    });
}
