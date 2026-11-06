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
import { C } from './audit_jupiter';

const CACHE_DIR = path.join(__dirname, 'cache');
const DISCIPLINES_PATH = path.join(CACHE_DIR, 'parsed_disciplines.json');
const CURRICULUM_PATH = path.join(CACHE_DIR, 'parsed_curriculum.json');

const TARGET_DISCIPLINES = path.join(__dirname, '../../src/data/disciplinesData.ts');
const TARGET_COURSES = path.join(__dirname, '../../src/data/coursesData.ts');

const AGPL_HEADER = `/*!
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
 */`;

export function runApply() {
    console.log(`\n${C.bold}${C.bgGreen} 🚀 APLICAÇÃO: MATRIZES CURRICULARES & JÚPITERWEB (--mode=apply) ${C.reset}\n`);

    if (!fs.existsSync(DISCIPLINES_PATH) || !fs.existsSync(CURRICULUM_PATH)) {
        console.error(`${C.red}[ERRO] Cache não encontrado. Execute scrape_jupiter.py e audit_jupiter.ts primeiro.${C.reset}`);
        process.exit(1);
    }

    const disciplines = JSON.parse(fs.readFileSync(DISCIPLINES_PATH, 'utf-8'));
    const curriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf-8'));

    // Cria backups com timestamp se arquivos já existirem
    const timestamp = Date.now();
    let oldDisciplinesContent = '';
    let oldCoursesContent = '';

    if (fs.existsSync(TARGET_DISCIPLINES)) {
        oldDisciplinesContent = fs.readFileSync(TARGET_DISCIPLINES, 'utf-8');
        const backupPath = path.join(CACHE_DIR, `disciplinesData.backup.${timestamp}.ts`);
        fs.writeFileSync(backupPath, oldDisciplinesContent, 'utf-8');
        console.log(`${C.dim}Backup salvo em: ${backupPath}${C.reset}`);
    }

    if (fs.existsSync(TARGET_COURSES)) {
        oldCoursesContent = fs.readFileSync(TARGET_COURSES, 'utf-8');
        const backupPath = path.join(CACHE_DIR, `coursesData.backup.${timestamp}.ts`);
        fs.writeFileSync(backupPath, oldCoursesContent, 'utf-8');
        console.log(`${C.dim}Backup salvo em: ${backupPath}${C.reset}`);
    }

    // 1. Gera src/data/disciplinesData.ts
    const disciplinesCode = `${AGPL_HEADER}

import { DisciplineItem } from '@/types/curriculum';

export const disciplinesData: Record<string, DisciplineItem> = ${JSON.stringify(disciplines, null, 2)};
`;

    // 2. Gera src/data/coursesData.ts
    const coursesCode = `${AGPL_HEADER}

import { CourseCurriculum, CourseId } from '@/types/curriculum';

export const coursesData: Record<CourseId, CourseCurriculum> = ${JSON.stringify(curriculum, null, 2)};
`;

    console.log(`${C.dim}Gravando ${TARGET_DISCIPLINES}...${C.reset}`);
    fs.writeFileSync(TARGET_DISCIPLINES, disciplinesCode, 'utf-8');

    console.log(`${C.dim}Gravando ${TARGET_COURSES}...${C.reset}`);
    fs.writeFileSync(TARGET_COURSES, coursesCode, 'utf-8');

    // 3. Formata com Prettier
    console.log(`${C.dim}Formatando com Prettier...${C.reset}`);
    try {
        execSync(`npx prettier --write "${TARGET_DISCIPLINES}" "${TARGET_COURSES}"`, { stdio: 'inherit' });
    } catch {
        console.warn(`${C.yellow}[AVISO] Falha ao rodar prettier. Continuando...${C.reset}`);
    }

    // 4. Validação TypeScript com Rollback
    console.log(`${C.dim}Validando tipagem com npx tsc --noEmit...${C.reset}`);
    try {
        execSync(`npx tsc --noEmit`, { stdio: 'inherit' });
        console.log(`\n${C.bold}${C.green}✓ SUCESSO: VALIDAÇÃO TSC PASSOU COM ZERO ERROS!${C.reset}\n`);
    } catch {
        console.error(`\n${C.bold}${C.red}[ERRO CRÍTICO] Falha na compilação do TypeScript após apply. Executando rollback...${C.reset}`);
        if (oldDisciplinesContent) {
            fs.writeFileSync(TARGET_DISCIPLINES, oldDisciplinesContent, 'utf-8');
        } else if (fs.existsSync(TARGET_DISCIPLINES)) {
            fs.unlinkSync(TARGET_DISCIPLINES);
        }
        if (oldCoursesContent) {
            fs.writeFileSync(TARGET_COURSES, oldCoursesContent, 'utf-8');
        } else if (fs.existsSync(TARGET_COURSES)) {
            fs.unlinkSync(TARGET_COURSES);
        }
        console.error(`${C.red}Rollback executado com sucesso.${C.reset}\n`);
        process.exit(1);
    }

    // 5. Relatório
    console.log(`${C.bold}--------------------------------------------------------------------------------------------------${C.reset}`);
    console.log(`${C.bold}📊 RELATÓRIO DE APLICAÇÃO CONCLUÍDA:${C.reset}`);
    console.log(`  • Disciplinas canônicas salvas em disciplinesData.ts: ${C.green}${Object.keys(disciplines).length}${C.reset}`);
    console.log(`  • Cursos com grades semestrais em coursesData.ts: ${C.green}${Object.keys(curriculum).length}${C.reset}`);
    console.log(`  • Turnos disponíveis: ${C.cyan}Bacharelado (Integral/Noturno), Licenciatura (Diurno/Noturno), Física Médica (Integral)${C.reset}`);
    console.log(`${C.bold}--------------------------------------------------------------------------------------------------${C.reset}\n`);
}

if (require.main === module || process.argv.includes('--mode=apply')) {
    runApply();
}
