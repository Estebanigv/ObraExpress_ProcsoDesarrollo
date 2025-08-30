#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Función para encontrar todos los archivos .tsx y .ts
function findFiles(dir, ext) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    for (let file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            results = results.concat(findFiles(filePath, ext));
        } else if (file.endsWith(ext)) {
            results.push(filePath);
        }
    }
    
    return results;
}

// Función para verificar imports faltantes
function checkImports() {
    console.log('🔍 VERIFICANDO IMPORTS/EXPORTS...\n');
    
    const files = [
        ...findFiles('./src', '.tsx'),
        ...findFiles('./src', '.ts')
    ];
    
    let errors = [];
    
    for (let file of files) {
        try {
            const content = fs.readFileSync(file, 'utf8');
            
            // Verificar safeDocument sin import (excluyendo definiciones)
            if (content.includes('safeDocument') && 
                !/import.*safeDocument/.test(content) && 
                !/export.*safeDocument/.test(content) &&
                !file.includes('client-utils.ts')) {
                const lines = content.split('\n');
                const lineNumbers = lines
                    .map((line, index) => line.includes('safeDocument') ? index + 1 : null)
                    .filter(num => num !== null);
                
                errors.push({
                    file: file,
                    error: 'safeDocument used without import',
                    lines: lineNumbers
                });
            }
            
            // Verificar safeWindow sin import (excluyendo definiciones)
            if (content.includes('safeWindow') && 
                !/import.*safeWindow/.test(content) && 
                !/export.*safeWindow/.test(content) &&
                !file.includes('client-utils.ts')) {
                const lines = content.split('\n');
                const lineNumbers = lines
                    .map((line, index) => line.includes('safeWindow') ? index + 1 : null)
                    .filter(num => num !== null);
                
                errors.push({
                    file: file,
                    error: 'safeWindow used without import',
                    lines: lineNumbers
                });
            }
            
            // Verificar navigate sin import (excluyendo definiciones)
            if (content.includes('navigate(') && 
                !/import.*navigate/.test(content) && 
                !/export.*navigate/.test(content) &&
                !file.includes('client-utils.ts')) {
                const lines = content.split('\n');
                const lineNumbers = lines
                    .map((line, index) => line.includes('navigate(') ? index + 1 : null)
                    .filter(num => num !== null);
                
                errors.push({
                    file: file,
                    error: 'navigate() used without import',
                    lines: lineNumbers
                });
            }
            
            // Verificar dynamic imports problemáticos (solo si no está comentado)
            const lines = content.split('\n');
            const lineNumbers = lines
                .map((line, index) => {
                    if (line.includes('.then(mod => ({ default: mod.') && 
                        !line.trim().startsWith('//') && 
                        !line.trim().startsWith('*')) {
                        return index + 1;
                    }
                    return null;
                })
                .filter(num => num !== null);
            
            if (lineNumbers.length > 0) {
                
                errors.push({
                    file: file,
                    error: 'Problematic dynamic import pattern',
                    lines: lineNumbers
                });
            }
            
        } catch (error) {
            console.error(`Error reading ${file}:`, error.message);
        }
    }
    
    if (errors.length === 0) {
        console.log('✅ NO IMPORT/EXPORT ERRORS FOUND\n');
        return true;
    } else {
        console.log('❌ IMPORT/EXPORT ERRORS FOUND:\n');
        errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error.file}`);
            console.log(`   Error: ${error.error}`);
            console.log(`   Lines: ${error.lines.join(', ')}\n`);
        });
        return false;
    }
}

// Ejecutar verificación
if (require.main === module) {
    checkImports();
}

module.exports = { checkImports };