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

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';

// Neutralizar 'server-only' para execução direta no Node/tsx CLI
const Module = require('module');
const originalLoad = Module._load;
Module._load = function (request: string, parent: any, isMain: boolean) {
    if (request === 'server-only') return {};
    return originalLoad.apply(this, arguments);
};

// Carregar .env.local se existir
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [k, ...v] = trimmed.split('=');
            if (!process.env[k.trim()]) {
                process.env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
            }
        }
    }
}
process.env.NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fake-hub.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'fake-anon-key-qa-testing';

async function runHeadlessComponentTests() {
    const { SegmentedInterativoSection } = await import('../../src/components/gcif/SegmentedInterativoSection');
    const { NetflixFeed } = await import('../../src/components/shared/NetflixFeed');
    const { DepartmentGrid } = await import('../../src/components/wiki/instituto/DepartmentGrid');

    console.log('===============================================================');
    console.log('🖥️ HUB LAB-DIV: SUÍTE DE QA DE RENDERIZAÇÃO HEADLESS DE UI (FASE 2)');
    console.log('===============================================================\n');

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    function assert(name: string, condition: boolean, detail?: string) {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`  ✅ [PASS] ${name}`);
        } else {
            failedTests++;
            console.error(`  ❌ [FAIL] ${name}${detail ? ` -> ${detail}` : ''}`);
        }
    }

    // -------------------------------------------------------------------------
    // TESTE 1: SegmentedInterativoSection - Subseção 01 Oportunidades Horizontais
    // -------------------------------------------------------------------------
    console.log('📌 Teste 1: SegmentedInterativoSection - Subseção 01 (Oportunidades)');
    const htmlOportunidades = renderToStaticMarkup(
        <SegmentedInterativoSection
            dynamicOportunidades={[]}
            activePersona="aluno"
            onPersonaChange={() => {}}
            onOpenSubmitModal={() => {}}
        />
    );

    assert('Subseção 01 de Oportunidades é renderizada', htmlOportunidades.includes('Oportunidades para Todos'));
    assert('Carrossel horizontal possui overflow-x-auto', htmlOportunidades.includes('overflow-x-auto'));
    assert('Carrossel horizontal possui snap-x snap-mandatory', htmlOportunidades.includes('snap-x snap-mandatory'));
    assert('Carrossel horizontal oculta barra de rolagem (no-scrollbar)', htmlOportunidades.includes('no-scrollbar'));
    assert('Botões de navegação lateral para desktop estão presentes', 
        htmlOportunidades.includes('Rolar oportunidades para esquerda') && 
        htmlOportunidades.includes('Rolar oportunidades para direita')
    );
    assert('Botão de expansão/recolhimento está presente', htmlOportunidades.includes('Recolher Seção') || htmlOportunidades.includes('Expandir Seção'));

    // -------------------------------------------------------------------------
    // TESTE 2: SegmentedInterativoSection - Subseção 02 (Segmentação por Persona)
    // -------------------------------------------------------------------------
    console.log('\n📌 Teste 2: SegmentedInterativoSection - Alternância de Personas');
    
    // 2.1 Persona Aluno
    const htmlAluno = renderToStaticMarkup(
        <SegmentedInterativoSection
            dynamicOportunidades={[]}
            activePersona="aluno"
            onPersonaChange={() => {}}
            onOpenSubmitModal={() => {}}
        />
    );
    assert('Persona Aluno renderiza cabeçalho específico', htmlAluno.includes('Centrais &amp; Recursos para Alunos') || htmlAluno.includes('Centrais & Recursos para Alunos'));
    assert('Persona Aluno exibe categoria Bolsas Institucionais', htmlAluno.includes('Bolsas Institucionais'));

    // 2.2 Persona Docente / Professor
    const htmlProfessor = renderToStaticMarkup(
        <SegmentedInterativoSection
            dynamicOportunidades={[]}
            activePersona="professor"
            onPersonaChange={() => {}}
            onOpenSubmitModal={() => {}}
        />
    );
    assert('Persona Professor renderiza cabeçalho específico', htmlProfessor.includes('Centrais &amp; Recursos para Docentes') || htmlProfessor.includes('Centrais & Recursos para Docentes'));
    assert('Central de Formulários Docentes exibe Manutenção Predial', htmlProfessor.includes('Manutenção Predial'));
    assert('Central de Formulários Docentes exibe Suprimentos & Orçamentos', htmlProfessor.includes('Suprimentos &amp; Orçamentos') || htmlProfessor.includes('Suprimentos & Orçamentos'));
    assert('Central de Formulários Docentes exibe Fomento à Pesquisa', htmlProfessor.includes('Fomento à Pesquisa'));
    assert('Central de Formulários Docentes exibe Tecnologia da Informação', htmlProfessor.includes('Tecnologia da Informação'));

    // 2.3 Persona Curioso
    const htmlCurioso = renderToStaticMarkup(
        <SegmentedInterativoSection
            dynamicOportunidades={[]}
            activePersona="curioso"
            onPersonaChange={() => {}}
            onOpenSubmitModal={() => {}}
        />
    );
    assert('Persona Curioso renderiza cabeçalho específico', htmlCurioso.includes('Centrais &amp; Recursos para a Comunidade') || htmlCurioso.includes('Centrais & Recursos para a Comunidade'));
    assert('Persona Curioso exibe Show da Física e Extensão', htmlCurioso.includes('Show da Física'));

    // -------------------------------------------------------------------------
    // TESTE 3: NetflixFeed - Carrossel Horizontal Unificado
    // -------------------------------------------------------------------------
    console.log('\n📌 Teste 3: NetflixFeed - Layout Horizontal Padronizado M3');
    const htmlFeed = renderToStaticMarkup(
        <NetflixFeed title="Agenda &amp; Colóquios" subtitle="Seminários gerais do IFUSP">
            <div className="w-[300px]">Item de Teste 1</div>
            <div className="w-[300px]">Item de Teste 2</div>
        </NetflixFeed>
    );

    assert('NetflixFeed renderiza o título da seção', htmlFeed.includes('Agenda &amp; Colóquios') || htmlFeed.includes('Agenda & Colóquios'));
    assert('NetflixFeed aplica flex com overflow-x-auto', htmlFeed.includes('overflow-x-auto'));
    assert('NetflixFeed aplica snap-x snap-mandatory', htmlFeed.includes('snap-x snap-mandatory'));
    assert('NetflixFeed possui botões de scroll com aria-label', 
        htmlFeed.includes('aria-label="Rolar para esquerda"') && 
        htmlFeed.includes('aria-label="Rolar para direita"')
    );

    // -------------------------------------------------------------------------
    // TESTE 4: DepartmentGrid - Otimização Mobile 2x3
    // -------------------------------------------------------------------------
    console.log('\n📌 Teste 4: DepartmentGrid - Responsividade Mobile (Grid 2 colunas)');
    const htmlDepartments = renderToStaticMarkup(<DepartmentGrid />);
    
    assert('DepartmentGrid aplica grid de 2 colunas no mobile e 3 colunas em telas maiores', 
        htmlDepartments.includes('grid-cols-2') && htmlDepartments.includes('lg:grid-cols-3')
    );
    assert('DepartmentGrid renderiza os 6 departamentos oficiais', 
        htmlDepartments.includes('Física Aplicada') && 
        htmlDepartments.includes('Física dos Materiais') && 
        htmlDepartments.includes('Física Matemática') && 
        htmlDepartments.includes('Física Geral') && 
        htmlDepartments.includes('Física Nuclear') && 
        htmlDepartments.includes('Física Experimental')
    );

    // -------------------------------------------------------------------------
    // TESTE 5: Validação Estática dos Banners e Cores Oficiais LabDiv
    // -------------------------------------------------------------------------
    console.log('\n📌 Teste 5: OnboardingBanner & Disclaimer - Cores e Borda Cônica dos 3 Eixos');
    const onboardingSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/onboarding/OnboardingBanner.tsx'),
        'utf8'
    );
    const disclaimerSource = fs.readFileSync(
        path.resolve(process.cwd(), 'src/components/layout/EixoInformacaoDisclaimerBanner.tsx'),
        'utf8'
    );
    
    assert('OnboardingBanner mapeia a cor oficial do Eixo Social (Azul #0F4780)', onboardingSource.includes('#0F4780'));
    assert('OnboardingBanner mapeia a cor oficial do Eixo Ferramentas (Amarelo #FFCC00)', onboardingSource.includes('#FFCC00'));
    assert('OnboardingBanner mapeia a cor oficial do Eixo Informativo (Vermelho #F14343)', onboardingSource.includes('#F14343'));
    assert('OnboardingBanner aplica borda gradiente cônica com os 3 eixos', 
        onboardingSource.includes('conic-gradient') && 
        onboardingSource.includes('#0F4780') && 
        onboardingSource.includes('#F14343') && 
        onboardingSource.includes('#FFCC00')
    );
    assert('DisclaimerBanner possui botão com gradiente oficial (#F14343 até #FFCC00) sem vazamento', 
        disclaimerSource.includes('linear-gradient') && 
        disclaimerSource.includes('#F14343') && 
        disclaimerSource.includes('#FFCC00')
    );

    // -------------------------------------------------------------------------
    // RESULTADO FINAL
    // -------------------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`📊 RESULTADO DA AUDITORIA HEADLESS: ${passedTests}/${totalTests} TESTES APROVADOS`);
    console.log(`   Taxa de Conformidade do DOM: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('===============================================================\n');

    if (failedTests > 0) {
        process.exit(1);
    }
}

runHeadlessComponentTests().catch(err => {
    console.error('Erro na renderização headless de componentes:', err);
    process.exit(1);
});
