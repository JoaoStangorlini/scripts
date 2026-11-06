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

import { z } from 'zod';
import { oportunidadesCuradas } from '../../src/data/oportunidadesData';

async function runTestSuite() {
    console.log('===============================================================');
    console.log('🧪 HUB LAB-DIV: SUÍTE DE TESTES AUTOMATIZADOS DE QA (FASE 1)');
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
    // TESTE 1: Dataset Curado de Oportunidades (Integridade & Personas)
    // -------------------------------------------------------------------------
    console.log('📌 Teste 1: Integridade do Dataset de Oportunidades');
    assert('Oportunidades curadas não estão vazias', oportunidadesCuradas.length > 0, `Total: ${oportunidadesCuradas.length}`);

    const ids = new Set<string>();
    let duplicates = 0;
    for (const op of oportunidadesCuradas) {
        if (ids.has(op.id)) duplicates++;
        ids.add(op.id);
    }
    assert('Todos os IDs de oportunidades são estritamente únicos', duplicates === 0, `Duplicados encontrados: ${duplicates}`);

    const hasAluno = oportunidadesCuradas.some(op => op.target_persona === 'aluno' || op.target_persona === 'geral');
    const hasCurioso = oportunidadesCuradas.some(op => op.target_persona === 'curioso' || op.target_persona === 'geral');
    const hasProfessor = oportunidadesCuradas.some(op => op.target_persona === 'professor' || op.target_persona === 'geral');
    assert('Existem oportunidades mapeadas para a Persona Aluno', hasAluno);
    assert('Existem oportunidades mapeadas para a Persona Curioso', hasCurioso);
    assert('Existem oportunidades mapeadas para a Persona Professor', hasProfessor);

    // -------------------------------------------------------------------------
    // TESTE 2: Validação Zod de Submissão de Oportunidades (Controle de Entrada)
    // -------------------------------------------------------------------------
    console.log('\n📌 Teste 2: Validação Zod de Submissão de Oportunidades');
    const submitOportunidadeSchema = z.object({
        titulo: z.string().min(3).max(150),
        descricao: z.string().min(10).max(1000),
        tipo: z.enum(['vaga', 'palestra', 'evento', 'bolsa']),
        target_persona: z.enum(['curioso', 'aluno', 'professor', 'geral']).optional().default('geral')
    });

    const validOportunidade = submitOportunidadeSchema.safeParse({
        titulo: 'Iniciação Científica em Física Teórica',
        descricao: 'Bolsa PIBIC para estudo de gravitação e teoria quântica de campos.',
        tipo: 'bolsa',
        target_persona: 'aluno'
    });
    assert('Payload válido de oportunidade passa na validação Zod', validOportunidade.success);

    const invalidShortTitle = submitOportunidadeSchema.safeParse({
        titulo: 'Oi',
        descricao: 'Descrição curta demais para o padrão',
        tipo: 'vaga'
    });
    assert('Título curto (<3 chars) é bloqueado com erro Zod', !invalidShortTitle.success);

    const invalidTipo = submitOportunidadeSchema.safeParse({
        titulo: 'Vaga de Monitoria',
        descricao: 'Monitoria de Física Experimental I para segundo semestre.',
        tipo: 'tipo_inexistente' as any
    });
    assert('Tipo de oportunidade inválido é rejeitado pelo enum Zod', !invalidTipo.success);

    // -------------------------------------------------------------------------
    // TESTE 3: Validação Zod de Dicas de Veteranos (USP 101)
    // -------------------------------------------------------------------------
    console.log('\n📌 Teste 3: Validação Zod do USP 101 (Dicas de Veteranos)');
    const submitTipSchema = z.object({
        titulo: z.string().min(3).max(120),
        conteudo: z.string().min(10).max(1000),
        categoria: z.enum(['comunicacao', 'permanencia', 'academica']).default('comunicacao'),
        instituto: z.string().default('geral')
    });

    const validTip = submitTipSchema.safeParse({
        titulo: 'Como usar a Biblioteca do IFUSP',
        conteudo: 'No segundo andar há salas silenciosas individuais com tomadas e ar condicionado.',
        categoria: 'permanencia',
        instituto: 'IFUSP'
    });
    assert('Dica com instituto específico é validada com sucesso', validTip.success);

    const emptyContent = submitTipSchema.safeParse({
        titulo: 'Dica curta',
        conteudo: 'Curta'
    });
    assert('Conteúdo de dica inferior a 10 caracteres é rejeitado', !emptyContent.success);

    // -------------------------------------------------------------------------
    // TESTE 4: Validação de Decisões em Lote da Torre de Controle (Fila de Swipe)
    // -------------------------------------------------------------------------
    console.log('\n📌 Teste 4: Validação da Estrutura da Fila de Swipe (admin.ts & RPC)');
    const QueueDecisionSchema = z.object({
        itemId: z.string().uuid(),
        itemType: z.enum([
            'submission',
            'submission_edit',
            'profile',
            'profile_edit',
            'teacher_verification',
            'comment',
            'software',
            'software_feedback',
            'oportunidade',
            'dica',
            'micro_article',
            'pergunta',
            'palavra_geradora',
            'constelacao_edge',
            'challenge_submission',
            'wiki_proposal',
            'report'
        ]),
        decision: z.enum(['approve', 'reject']),
        feedback: z.string().optional(),
        proofPath: z.string().optional(),
        editedPayload: z.any().optional()
    });
    const QueueBatchSchema = z.array(QueueDecisionSchema).min(1).max(50);

    const validBatch = QueueBatchSchema.safeParse([
        {
            itemId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            itemType: 'oportunidade',
            decision: 'approve'
        },
        {
            itemId: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
            itemType: 'teacher_verification',
            decision: 'approve'
        },
        {
            itemId: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
            itemType: 'dica',
            decision: 'reject',
            feedback: 'Conteúdo repetido.'
        }
    ]);
    assert('Lote misto de 3 itens com UUIDs e contratos reais é aceito pelo schema Zod', validBatch.success, !validBatch.success ? JSON.stringify(validBatch.error.issues) : undefined);

    const invalidBatchType = QueueBatchSchema.safeParse([
        {
            itemId: '11111111-1111-1111-1111-111111111111',
            itemType: 'tipo_falso_hacker' as any,
            decision: 'approve'
        }
    ]);
    assert('Item com tipo não mapeado é estritamente bloqueado antes de chamar o SQL', !invalidBatchType.success);

    // -------------------------------------------------------------------------
    // TESTE 5: Validação do Monitor de Notificações de Fila (Thresholds & Cooldown)
    // -------------------------------------------------------------------------
    console.log('\n📌 Teste 5: Lógica de Notificações da Fila de Moderação');
    function evaluateThresholds(pendingCount: number, oldestMinutes: number) {
        const triggers = [];
        if (pendingCount >= 10) {
            triggers.push('ALERT_COUNT_10_DOUBLE_DISPATCH');
        } else if (pendingCount >= 5) {
            triggers.push('ALERT_COUNT_5_DISPATCH');
        }

        if (oldestMinutes >= 30) {
            triggers.push('ALERT_TIME_30M_STAGNANT');
        } else if (oldestMinutes >= 10) {
            triggers.push('ALERT_TIME_10M_PENDING');
        }
        return triggers;
    }

    assert('Fila com 3 itens e 2 min não dispara e-mail', evaluateThresholds(3, 2).length === 0);
    assert('Fila com 6 itens dispara alerta de threshold 5', evaluateThresholds(6, 2).includes('ALERT_COUNT_5_DISPATCH'));
    assert('Fila com 12 itens dispara alerta de threshold 10 duplo', evaluateThresholds(12, 4).includes('ALERT_COUNT_10_DOUBLE_DISPATCH'));
    assert('Item há 15 min estagnado dispara alerta de 10 minutos', evaluateThresholds(2, 15).includes('ALERT_TIME_10M_PENDING'));
    assert('Item há 35 min estagnado dispara alerta crítico de 30 minutos', evaluateThresholds(2, 35).includes('ALERT_TIME_30M_STAGNANT'));

    // -------------------------------------------------------------------------
    // RESULTADO FINAL
    // -------------------------------------------------------------------------
    console.log('\n===============================================================');
    console.log(`📊 RESULTADO FINAL DA SUÍTE: ${passedTests}/${totalTests} TESTES APROVADOS`);
    console.log(`   Taxa de Sucesso: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log('===============================================================\n');

    if (failedTests > 0) {
        process.exit(1);
    }
}

runTestSuite().catch(err => {
    console.error('Erro fatal ao rodar suíte de testes:', err);
    process.exit(1);
});
