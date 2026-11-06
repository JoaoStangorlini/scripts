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
 * 🧹 Hub de Comunicação Científica - V3.0 GOLDEN MASTER
 * Script de Higiene de Git (Cleanup sw.js)
 * Restaura o placeholder __BUILD_ID__ pós-build.
 */

const swPath = path.join(__dirname, '../public/sw.js');

try {
    if (fs.existsSync(swPath)) {
        let swContent = fs.readFileSync(swPath, 'utf8');
        const buildIdRegex = /const BUILD_ID = '.*';/;
        const placeholder = "const BUILD_ID = '__BUILD_ID__';";

        if (buildIdRegex.test(swContent)) {
            swContent = swContent.replace(buildIdRegex, placeholder);
            fs.writeFileSync(swPath, swContent);
            console.log('✅ [GOLDEN MASTER] sw.js higienizado: Placeholder __BUILD_ID__ restaurado.');
        }
    }
} catch (err) {
    console.error('⚠️ [GOLDEN MASTER] Erro na higienização do sw.js:', err.message);
    // Não sai com Erro 1 pois é apenas cleanup cosmético
}
