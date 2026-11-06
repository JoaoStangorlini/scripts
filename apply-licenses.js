const fs = require('fs');
const path = require('path');

const licenseText = `/*!
 * Hub de Comunicação Científica Lab-Div V3.0
 * Copyright (C) 2026 João Paulo Stangorlini de Carvalho
 * * Este programa é software livre: você pode redistribuí-lo e/ou modificá-lo
 * sob os termos da Licença Pública Geral Affero GNU (AGPLv3) conforme
 * publicada pela Free Software Foundation.
 * * Este programa é distribuído na esperança de que seja útil, mas SEM
 * QUALQUER GARANTIA; sem mesmo a garantia implícita de COMERCIALIZAÇÃO
 * ou ADEQUAÇÃO A UM DETERMINADO FIM.
 */
`;

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            callback(path.join(dir, f));
        }
    });
}

const targetDirs = [path.join(__dirname, '../src')];

let count = 0;

targetDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    
    walkDir(dir, (filePath) => {
        if (!filePath.match(/\.(ts|tsx|js|jsx)$/)) return;
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Se já tem a licença, pula
        if (content.includes('Licença Pública Geral Affero GNU (AGPLv3)')) {
            return;
        }

        console.log(`Aplicando licença em: ${filePath}`);
        count++;
        
        // Tratar "use client" ou "use server"
        const lines = content.split('\n');
        let useDirective = '';
        if (lines[0].includes('use client') || lines[0].includes('use server')) {
            useDirective = lines[0] + '\n\n';
            lines.shift();
            content = lines.join('\n');
        }
        
        const newContent = useDirective + licenseText + '\n' + content;
        fs.writeFileSync(filePath, newContent, 'utf8');
    });
});

console.log(`Verificação de licenças concluída! Aplicada em ${count} arquivos.`);
