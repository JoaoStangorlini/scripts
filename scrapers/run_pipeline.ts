#!/usr/bin/env npx tsx

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

import { spawnSync } from 'child_process';
import path from 'path';

interface ModuleStep {
    id: string;
    name: string;
    pythonScript?: string;
    auditScript: string;
    applyScript: string;
    auditArgs?: string[];
    applyArgs?: string[];
}

const MODULES: ModuleStep[] = [
    {
        id: 'departments',
        name: 'Departamentos & Docentes',
        pythonScript: 'scripts/scrapers/scrape_departments.py',
        auditScript: 'scripts/scrapers/audit_departments.ts',
        applyScript: 'scripts/scrapers/apply_departments.ts',
        auditArgs: ['--mode=audit'],
        applyArgs: ['--mode=apply']
    },
    {
        id: 'initiatives',
        name: 'Iniciativas de Extensão (CCEx)',
        pythonScript: 'scripts/scrapers/scrape_initiatives.py',
        auditScript: 'scripts/scrapers/audit_initiatives.ts',
        applyScript: 'scripts/scrapers/apply_initiatives.ts',
        auditArgs: ['--mode=audit'],
        applyArgs: ['--mode=apply']
    },
    {
        id: 'events_news',
        name: 'Eventos, Colóquios & Notícias',
        pythonScript: 'scripts/scrapers/scrape_events_and_news.py',
        auditScript: 'scripts/scrapers/audit_events_and_news.ts',
        applyScript: 'scripts/scrapers/apply_events_and_news.ts',
        auditArgs: ['--mode=audit'],
        applyArgs: ['--mode=apply']
    },
    {
        id: 'spaces',
        name: 'Espaços, Auditórios & Labs Didáticos',
        pythonScript: 'scripts/scrapers/scrape_spaces.py',
        auditScript: 'scripts/scrapers/audit_spaces.ts',
        applyScript: 'scripts/scrapers/apply_spaces.ts',
        auditArgs: ['--mode=audit'],
        applyArgs: ['--mode=apply']
    },
    {
        id: 'jupiter',
        name: 'Matrizes Curriculares & JúpiterWeb',
        pythonScript: 'scripts/scrapers/scrape_jupiter.py',
        auditScript: 'scripts/scrapers/audit_jupiter.ts',
        applyScript: 'scripts/scrapers/apply_jupiter.ts',
        auditArgs: ['--mode=audit'],
        applyArgs: ['--mode=apply']
    }
];

async function main() {
    const args = process.argv.slice(2);
    const isApply = args.includes('--mode=apply') || args.includes('--apply');
    const skipScrape = args.includes('--skip-scrape');

    console.log('\n\x1b[1m\x1b[34m====================================================================\x1b[0m');
    console.log(`\x1b[1m\x1b[33m  HUB LAB-DIV V3.0 — PIPELINE UNIFICADO DE DADOS IFUSP\x1b[0m`);
    console.log(`  Modo de Execução: \x1b[1m${isApply ? '\x1b[31mAPLICAÇÃO (ESCRITA EM SRC/DATA/)\x1b[0m' : '\x1b[32mDRY-RUN AUDIT (LEITURA & VALIDAÇÃO)\x1b[0m'}`);
    console.log('\x1b[1m\x1b[34m====================================================================\x1b[0m\n');

    const results: { module: string; status: 'SUCCESS' | 'FAILED' | 'SKIPPED'; duration: number }[] = [];

    for (const mod of MODULES) {
        console.log(`\x1b[1m\x1b[36m▶ Processando: ${mod.name}...\x1b[0m`);
        const startTime = Date.now();

        // 1. Scrape (se não for explicitamente pulado)
        if (!skipScrape && mod.pythonScript) {
            console.log(`  [1/2] Executando scraper python: ${mod.pythonScript}...`);
            const pyRes = spawnSync('python3', [mod.pythonScript], { stdio: 'inherit' });
            if (pyRes.status !== 0) {
                console.warn(`  \x1b[33m⚠️ Scraper python retornou aviso/falha (usando cache local existente)\x1b[0m`);
            }
        }

        // 2. Auditoria ou Aplicação
        const targetScript = isApply ? mod.applyScript : mod.auditScript;
        const targetArgs = isApply ? (mod.applyArgs || []) : (mod.auditArgs || []);
        console.log(`  [2/2] Validando com TypeScript: ${targetScript} ${targetArgs.join(' ')}...`);

        const tsRes = spawnSync('npx', ['tsx', targetScript, ...targetArgs], { stdio: 'inherit' });
        const duration = Math.round((Date.now() - startTime) / 100) / 10;

        if (tsRes.status === 0) {
            console.log(`  \x1b[32m✓ ${mod.name}: Concluído com sucesso (${duration}s)\x1b[0m\n`);
            results.push({ module: mod.name, status: 'SUCCESS', duration });
        } else {
            console.error(`  \x1b[31m✗ ${mod.name}: Falha na validação (${duration}s)\x1b[0m\n`);
            results.push({ module: mod.name, status: 'FAILED', duration });
        }
    }

    // Resumo Final
    console.log('\n\x1b[1m\x1b[34m--------------------------------------------------------------------\x1b[0m');
    console.log('\x1b[1m\x1b[37m  RESUMO DA EXECUÇÃO DO PIPELINE:\x1b[0m');
    console.log('\x1b[1m\x1b[34m--------------------------------------------------------------------\x1b[0m');
    results.forEach(r => {
        const icon = r.status === 'SUCCESS' ? '\x1b[32m✅ SUCESSO\x1b[0m' : '\x1b[31m❌ FALHA\x1b[0m';
        console.log(`  • ${r.module.padEnd(40)} ${icon} (${r.duration}s)`);
    });
    console.log('\x1b[1m\x1b[34m--------------------------------------------------------------------\x1b[0m\n');

    const hasFailure = results.some(r => r.status === 'FAILED');
    if (hasFailure) {
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Erro fatal no pipeline:', err);
    process.exit(1);
});
