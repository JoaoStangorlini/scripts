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
import { institutoData, Department, Researcher } from '../../src/data/institutoData';

interface OfficialPhotoEntry {
    nome: string;
    photo_url: string;
    source: string;
}

function normalizeName(name: string): string {
    return name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
}

async function main() {
    console.log('\x1b[34m[AVATAR APPLIER]\x1b[0m Iniciando aplicação de fotos oficiais e avatares acadêmicos...');

    const targetFile = path.resolve(process.cwd(), 'src/data/institutoData.ts');
    const officialPhotosPath = path.resolve(process.cwd(), 'scripts/scrapers/cache/official_photos.json');

    if (!fs.existsSync(officialPhotosPath)) {
        throw new Error(`Arquivo de fotos oficiais não encontrado: ${officialPhotosPath}`);
    }

    const officialPhotos: Record<string, OfficialPhotoEntry> = JSON.parse(
        fs.readFileSync(officialPhotosPath, 'utf-8')
    );

    // 1. Extração do Preâmbulo (AGPLv3 e interfaces)
    const currentCode = fs.readFileSync(targetFile, 'utf-8');
    const preambleMatch = currentCode.match(/^([\s\S]*?)(export const institutoData)/);
    if (!preambleMatch) {
        throw new Error('Falha crítica: Não foi possível localizar o preâmbulo do institutoData.ts');
    }
    const preamble = preambleMatch[1].trim();

    // 2. Backup de Segurança
    const backupDir = path.resolve(process.cwd(), 'scripts/scrapers/cache');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `institutoData.backup.avatars.${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(institutoData, null, 2), 'utf-8');
    console.log(`\x1b[32m✓\x1b[0m Backup prévio salvo em: ${backupFile}`);

    // 3. Atualização dos Pesquisadores com Fotos Reais e Avatares
    const updatedData: Record<string, Department> = {};
    let totalRealPhotos = 0;
    let totalGeneratedAvatars = 0;
    let totalResearchers = 0;

    for (const [deptKey, dept] of Object.entries(institutoData)) {
        const updatedPesquisadores: Researcher[] = dept.pesquisadores.map((p) => {
            totalResearchers++;
            const norm = normalizeName(p.nome);

            // 1. Busca por match exato nas fotos oficiais
            let official = officialPhotos[norm];

            // 2. Busca por substring se não encontrar exato
            if (!official) {
                for (const [k, entry] of Object.entries(officialPhotos)) {
                    if ((k.includes(norm) || norm.includes(k)) && k.length > 8) {
                        official = entry;
                        break;
                    }
                }
            }

            let avatarUrl: string;
            if (official && official.photo_url) {
                totalRealPhotos++;
                avatarUrl = official.photo_url
                    .replace('http://portal.if.usp.br', 'https://portal.if.usp.br')
                    .replace('//files/', '/files/');
            } else {
                totalGeneratedAvatars++;
                // Avatar padrão unificado de docente (sem gênero, local, performático e offline-friendly)
                avatarUrl = '/images/default-avatar-neutral.png';
            }

            return {
                ...p,
                avatar: avatarUrl
            };
        });

        updatedData[deptKey] = {
            ...dept,
            pesquisadores: updatedPesquisadores
        };
    }

    console.log(`\x1b[36m-> Estatísticas de Cobertura:\x1b[0m`);
    console.log(`   Total de Pesquisadores: ${totalResearchers}`);
    console.log(`   Fotos Oficiais USP aplicadas: ${totalRealPhotos}`);
    console.log(`   Avatares Acadêmicos gerados: ${totalGeneratedAvatars}`);
    console.log(`   Cobertura Total com Imagem: ${((totalRealPhotos + totalGeneratedAvatars) / totalResearchers * 100).toFixed(1)}%`);

    // 4. Gravação em Disco
    const code = `${preamble}\n\nexport const institutoData: Record<string, Department> = ${JSON.stringify(updatedData, null, 4)};\n`;
    fs.writeFileSync(targetFile, code, 'utf-8');
    console.log(`\x1b[32m✓\x1b[0m Arquivo ${targetFile} regravado com sucesso.`);

    // 5. Formatação Prettier
    try {
        console.log(`Formatando com Prettier...`);
        execSync(`npx prettier --write "${targetFile}"`, { stdio: 'inherit' });
        console.log(`\x1b[32m✓\x1b[0m Prettier concluído.`);
    } catch (err) {
        console.warn('Aviso: Falha na execução do Prettier:', err);
    }

    // 6. Validação TypeScript
    try {
        console.log(`Executando validação de tipos (npx tsc --noEmit)...`);
        execSync('npx tsc --noEmit', { stdio: 'inherit' });
        console.log(`\x1b[32m✓\x1b[0m TypeScript Check: 0 erros.`);
    } catch (err) {
        console.error('\x1b[31m✕ Erro de compilação TypeScript! Restaurando backup...\x1b[0m');
        fs.copyFileSync(backupFile, targetFile);
        process.exit(1);
    }

    console.log(`\x1b[32m[SUCESSO]\x1b[0m Todos os pesquisadores agora possuem fotinha/avatar ativo!`);
}

main().catch((err) => {
    console.error('Erro durante a execução de apply_avatars:', err);
    process.exit(1);
});
