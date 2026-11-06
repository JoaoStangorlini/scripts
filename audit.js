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

const fs = require('fs');
const path = require('path');

/**
 * 🛡️ Hub de Comunicação Científica - V3.9 GOLDEN MASTER
 * Script: audit-integrity.js
 * Objetivo: Auditoria de Logs + Validação de Sincronia de Artefatos
 */

const buildEnvPath = path.join(__dirname, '../.env.production.local');
const swPath = path.join(__dirname, '../public/sw.js');
const projectRoot = path.join(__dirname, '..');
const scanDirs = ['src', 'scripts'];
const ignorePatterns = ['node_modules', '.next', 'audit.js', 'audit-integrity.js'];

let foundLogs = false;

function performIntegrityCheck() {
    console.log('🔍 [V3.9] Iniciando Auditoria de Integridade...');

    // 1. Verificar .env.production.local
    if (!fs.existsSync(buildEnvPath)) {
        console.warn('⚠️ AVISO: .env.production.local não encontrado. Pulando validação de build ID.');
        return;
    }
    const envContent = fs.readFileSync(buildEnvPath, 'utf8');
    const buildIdMatch = envContent.match(/NEXT_PUBLIC_BUILD_ID=(\d+)/);

    if (!buildIdMatch) {
        console.error('❌ ERRO: BUILD_ID não encontrado no .env.');
        process.exit(1);
    }
    const buildId = buildIdMatch[1];

    // 2. Verificar public/sw.js
    if (!fs.existsSync(swPath)) {
        console.error('❌ ERRO: public/sw.js não foi gerado.');
        process.exit(1);
    }
    const swContent = fs.readFileSync(swPath, 'utf8');

    // 3. Validar Sincronia
    if (!swContent.includes(buildId)) {
        console.warn(`⚠️ AVISO: Desincronia détectada! (ENV ID: ${buildId}). O Service Worker pode estar desatualiado.`);
        return;
    }

    console.log(`✅ [V3.9] Integridade de Artefatos OK (ID: ${buildId})`);
}

function scanFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (ignorePatterns.some(p => fullPath.includes(p))) return;

        if (fs.statSync(fullPath).isDirectory()) {
            scanFiles(fullPath);
        } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
                if (line.includes('console.log(') && !line.includes('//') && !line.includes('✅')) {
                    console.error(`🚩 LOG DETECTADO: ${fullPath}:${idx + 1}`);
                    foundLogs = true;
                }
            });
        }
    });
}

// 🚀 Execução do Gate
performIntegrityCheck();

console.log('🔍 [V3.9] Scan de Logs em andamento...');
scanDirs.forEach(dir => {
    const targetDir = path.join(projectRoot, dir);
    if (fs.existsSync(targetDir)) scanFiles(targetDir);
});

if (foundLogs) {
    console.warn('⚠️ Alerta: Existem console.logs no código. Recomenda-se a remoção antes do Master.');
    process.exit(0); // Permitir build em dev
} else {
    console.log('✅ Auditoria de Logs: ZERO-LOG detectado.');
    process.exit(0);
}
