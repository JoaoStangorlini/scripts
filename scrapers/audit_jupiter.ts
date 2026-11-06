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

// Cores ANSI para saída no terminal
export const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    red: '\x1b[31m',
    bgGreen: '\x1b[42m\x1b[30m',
    bgYellow: '\x1b[43m\x1b[30m',
    bgBlue: '\x1b[44m\x1b[37m'
};

const CACHE_DIR = path.join(__dirname, 'cache');
const DISCIPLINES_PATH = path.join(CACHE_DIR, 'parsed_disciplines.json');
const CURRICULUM_PATH = path.join(CACHE_DIR, 'parsed_curriculum.json');

// 1. Zod Schema para Prerequisite
export const PrerequisiteSchema = z.object({
    tipo: z.enum(['forte', 'fraco']),
    disciplinas: z.array(z.string().min(1)),
    descricao: z.string().optional()
});

// 2. Zod Schema para DisciplineItem
export const DisciplineItemSchema = z.object({
    codigo: z.string().min(2),
    nome: z.string().min(2),
    unidade: z.enum(['IFUSP', 'IME', 'FMUSP', 'FEUSP', 'IQ', 'OUTRA']),
    departamento: z.string().optional().default('IFUSP'),
    creditosAula: z.number().nonnegative(),
    creditosTrabalho: z.number().nonnegative(),
    cargaHorariaTotal: z.number().positive(),
    horasExtensao: z.number().nonnegative().optional().default(0),
    tipo: z.enum(['obrigatoria', 'optativa-eletiva', 'optativa-livre']),
    ementa: z.string().min(10),
    objetivos: z.string().optional().default(''),
    bibliografia: z.array(z.string()).optional().default([]),
    preRequisitos: z.array(PrerequisiteSchema).optional().default([]),
    coRequisitos: z.array(z.string()).optional().default([]),
    liberaDisciplinas: z.array(z.string()).optional().default([]),
    linkJupiter: z.string().url().optional(),
    observacao: z.string().optional().default('')
});

// 3. Zod Schema para SemesterGrid
export const SemesterGridSchema = z.object({
    semestre: z.number().int().min(1).max(10),
    titulo: z.string().min(3),
    subtitulo: z.string().optional().default(''),
    totalCreditosAula: z.number().nonnegative(),
    totalCreditosTrabalho: z.number().nonnegative(),
    disciplinasCodigos: z.array(z.string())
});

// 4. Zod Schema para HabilitationGrid
export const HabilitationGridSchema = z.object({
    turno: z.enum(['integral', 'diurno', 'noturno']),
    nomeTurno: z.string().min(3),
    codigoHabilitacao: z.string().optional().default(''),
    duracaoSemestres: z.number().int().min(8).max(10),
    semestres: z.array(SemesterGridSchema).min(8).max(10)
});

// 5. Zod Schema para CourseCurriculum
export const CourseCurriculumSchema = z.object({
    id: z.enum(['bacharelado', 'licenciatura', 'fisica-medica']),
    nome: z.string().min(3),
    codigoCurso: z.string().min(3),
    turnosDisponiveis: z.array(z.enum(['integral', 'diurno', 'noturno'])).min(1),
    vagasAnuais: z.object({
        total: z.number().positive(),
        integral: z.number().optional(),
        diurno: z.number().optional(),
        noturno: z.number().optional()
    }),
    horasExtensaoAEx: z.number().positive(),
    horasEstagio: z.number().optional().nullable(),
    descricaoPedagogica: z.string().min(20),
    gradesPorTurno: z.record(z.string(), HabilitationGridSchema)
});

export type DisciplineItemParsed = z.infer<typeof DisciplineItemSchema>;
export type CourseCurriculumParsed = z.infer<typeof CourseCurriculumSchema>;

export function runAudit() {
    console.log(`\n${C.bold}${C.bgBlue} 🔍 AUDITORIA ZOD V3: MATRIZES CURRICULARES & JÚPITERWEB ${C.reset}\n`);

    if (!fs.existsSync(DISCIPLINES_PATH) || !fs.existsSync(CURRICULUM_PATH)) {
        console.error(`${C.red}[ERRO] Arquivos de cache não encontrados. Execute scrape_jupiter.py primeiro!${C.reset}`);
        process.exit(1);
    }

    const rawDisciplines = JSON.parse(fs.readFileSync(DISCIPLINES_PATH, 'utf-8'));
    const rawCurriculum = JSON.parse(fs.readFileSync(CURRICULUM_PATH, 'utf-8'));

    // Validação Disciplines
    console.log(`${C.dim}Validando catálogo de disciplinas (${Object.keys(rawDisciplines).length} itens)...${C.reset}`);
    let disciplineErrors = 0;
    const validatedDisciplines: Record<string, DisciplineItemParsed> = {};

    for (const [code, item] of Object.entries(rawDisciplines)) {
        const res = DisciplineItemSchema.safeParse(item);
        if (!res.success) {
            console.error(`${C.red}  ✗ Erro em disciplina ${code}:${C.reset}`, res.error.format());
            disciplineErrors++;
        } else {
            validatedDisciplines[code] = res.data;
        }
    }

    if (disciplineErrors === 0) {
        console.log(`  ${C.green}✓ Todas as ${Object.keys(validatedDisciplines).length} disciplinas foram aprovadas no Zod Schema!${C.reset}`);
    } else {
        console.error(`${C.red}  ✗ Total de erros em disciplinas: ${disciplineErrors}${C.reset}`);
    }

    // Validação Curriculum
    console.log(`\n${C.dim}Validando matrizes dos cursos (${Object.keys(rawCurriculum).length} cursos)...${C.reset}`);
    let curriculumErrors = 0;
    const validatedCurriculum: Record<string, CourseCurriculumParsed> = {};

    for (const [courseId, item] of Object.entries(rawCurriculum)) {
        const res = CourseCurriculumSchema.safeParse(item);
        if (!res.success) {
            console.error(`${C.red}  ✗ Erro no curso ${courseId}:${C.reset}`, res.error.format());
            curriculumErrors++;
        } else {
            validatedCurriculum[courseId] = res.data;
            // Validações semânticas adicionais:
            const course = res.data;
            console.log(`  • Curso: ${C.bold}${course.nome}${C.reset} (${course.id})`);
            for (const [turno, grade] of Object.entries(course.gradesPorTurno)) {
                console.log(`    - Turno: ${C.cyan}${grade.nomeTurno}${C.reset} (${grade.duracaoSemestres} semestres, ${grade.semestres.length} grades semestrais mapeadas)`);
                // Verifica códigos de disciplinas
                for (const sem of grade.semestres) {
                    for (const discCode of sem.disciplinasCodigos) {
                        if (!validatedDisciplines[discCode]) {
                            console.warn(`      ${C.yellow}[AVISO] Disciplina ${discCode} referenciada no semestre ${sem.semestre} mas não encontrada no catálogo canônico.${C.reset}`);
                        }
                    }
                }
            }
        }
    }

    // Validação de Grafo Bidirecional
    console.log(`\n${C.dim}Validando integridade do Grafo Bidirecional de Pré-requisitos...${C.reset}`);
    let bidirectionalErrors = 0;
    for (const [code, disc] of Object.entries(validatedDisciplines)) {
        for (const targetCode of disc.liberaDisciplinas || []) {
            const target = validatedDisciplines[targetCode];
            if (target) {
                const hasReverse = target.preRequisitos?.some(r => r.disciplinas.includes(code));
                if (!hasReverse) {
                    console.warn(`  ${C.yellow}[AVISO] Inconsistência de grafo: ${code} libera ${targetCode}, mas ${targetCode} não lista ${code} em preRequisitos.${C.reset}`);
                    bidirectionalErrors++;
                }
            }
        }
    }

    if (bidirectionalErrors === 0) {
        console.log(`  ${C.green}✓ Grafo de dependências bidirecional 100% consistente!${C.reset}`);
    }

    console.log(`\n${C.bold}--------------------------------------------------------------------------------------------------${C.reset}`);
    console.log(`${C.bold}📊 RESUMO DA AUDITORIA:${C.reset}`);
    console.log(`  • Disciplinas no catálogo: ${C.green}${Object.keys(validatedDisciplines).length}${C.reset}`);
    console.log(`  • Cursos estruturados: ${C.green}${Object.keys(validatedCurriculum).length}${C.reset}`);
    console.log(`  • Turnos/Habilitações avaliados: ${C.green}${Object.values(validatedCurriculum).reduce((acc, c) => acc + Object.keys(c.gradesPorTurno).length, 0)}${C.reset}`);
    console.log(`  • Erros Zod: ${disciplineErrors + curriculumErrors === 0 ? C.green + '0 (Zero Falhas)' : C.red + (disciplineErrors + curriculumErrors)}${C.reset}`);
    console.log(`${C.bold}--------------------------------------------------------------------------------------------------${C.reset}\n`);

    if (disciplineErrors + curriculumErrors > 0) {
        process.exit(1);
    }
}

if (require.main === module) {
    runAudit();
}
