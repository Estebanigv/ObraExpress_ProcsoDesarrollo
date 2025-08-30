#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { checkImports } = require('./check-imports.js');

console.log('🚀 INICIANDO CHECKEO COMPLETO DEL SITIO...\n');

let totalErrors = 0;
let checkResults = [];

// Función helper para ejecutar comandos
function runCommand(command, description) {
    return new Promise((resolve, reject) => {
        console.log(`🔍 ${description}...`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`❌ ${description} FAILED:`);
                console.log(stderr || error.message);
                totalErrors++;
                checkResults.push({ check: description, status: 'FAILED', error: stderr || error.message });
                resolve(false);
            } else {
                console.log(`✅ ${description} OK`);
                checkResults.push({ check: description, status: 'OK' });
                resolve(true);
            }
        });
    });
}

// Función para verificar URLs
function checkURL(url, description) {
    return new Promise((resolve) => {
        console.log(`🔍 ${description}...`);
        exec(`curl -sI "${url}"`, (error, stdout, stderr) => {
            if (error || !stdout.includes('200 OK')) {
                console.log(`❌ ${description} FAILED - No HTTP 200`);
                totalErrors++;
                checkResults.push({ check: description, status: 'FAILED', error: 'No HTTP 200' });
                resolve(false);
            } else {
                console.log(`✅ ${description} OK`);
                checkResults.push({ check: description, status: 'OK' });
                resolve(true);
            }
        });
    });
}

// Función principal de checkeo
async function fullCheck() {
    console.log('===== FASE 1: ANÁLISIS ESTÁTICO =====\n');
    
    // 1. Verificar imports/exports
    const importsOK = checkImports();
    if (!importsOK) totalErrors++;
    checkResults.push({ 
        check: 'Import/Export verification', 
        status: importsOK ? 'OK' : 'FAILED' 
    });
    
    console.log('===== FASE 2: VERIFICACIÓN DE BUILD =====\n');
    
    // 2. Limpiar y build
    await runCommand('rm -rf .next', 'Clean build cache');
    await runCommand('npm run build', 'Production build');
    
    console.log('===== FASE 3: VERIFICACIÓN DEL SERVIDOR =====\n');
    
    // 3. Iniciar servidor en background
    console.log('🔍 Starting development server...');
    const serverProcess = spawn('npm', ['run', 'dev'], { 
        stdio: 'pipe',
        detached: false 
    });
    
    let serverReady = false;
    let serverErrors = [];
    
    serverProcess.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Ready in')) {
            serverReady = true;
        }
        if (output.includes('Error') || output.includes('Failed')) {
            serverErrors.push(output);
        }
    });
    
    serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Ready in')) {
            serverReady = true;
        }
    });
    
    // Esperar a que el servidor esté listo
    await new Promise(resolve => {
        const checkReady = setInterval(() => {
            if (serverReady) {
                clearInterval(checkReady);
                resolve();
            }
        }, 1000);
        
        setTimeout(() => {
            clearInterval(checkReady);
            resolve();
        }, 30000); // timeout después de 30s
    });
    
    if (serverErrors.length > 0) {
        console.log('❌ Server errors detected:');
        serverErrors.forEach(error => console.log(error));
        totalErrors++;
        checkResults.push({ check: 'Server startup', status: 'FAILED', error: serverErrors.join('\\n') });
    } else {
        console.log('✅ Server started OK');
        checkResults.push({ check: 'Server startup', status: 'OK' });
    }
    
    console.log('===== FASE 4: VERIFICACIÓN HTTP =====\n');
    
    // 4. Verificar páginas principales
    await checkURL('http://localhost:3000/', 'Homepage');
    await checkURL('http://localhost:3000/productos', 'Products page');
    await checkURL('http://localhost:3000/nosotros', 'About page');
    await checkURL('http://localhost:3000/contacto', 'Contact page');
    await checkURL('http://localhost:3000/admin', 'Admin page');
    
    // 5. Verificar APIs
    await checkURL('http://localhost:3000/api/productos-publico', 'Products API');
    
    console.log('===== FASE 5: VERIFICACIÓN JAVASCRIPT =====\n');
    
    // 6. Ejecutar test de JavaScript (esto requeriría puppeteer o similar)
    console.log('🔍 JavaScript client-side testing...');
    console.log('📝 Para test completo de JavaScript, abrir: http://localhost:3000/../test-client-js.html');
    console.log('📝 O usar herramientas como Puppeteer/Playwright para automatizar');
    
    // 7. Cerrar servidor
    console.log('🔍 Stopping server...');
    serverProcess.kill('SIGTERM');
    
    console.log('\\n===== RESUMEN FINAL =====\\n');
    
    console.log('📊 RESULTADOS POR CATEGORÍA:');
    checkResults.forEach((result, index) => {
        const icon = result.status === 'OK' ? '✅' : '❌';
        console.log(`${index + 1}. ${icon} ${result.check}: ${result.status}`);
        if (result.error) {
            console.log(`   └── Error: ${result.error.substring(0, 100)}...`);
        }
    });
    
    if (totalErrors === 0) {
        console.log('\\n🎉 ¡CHECKEO COMPLETO EXITOSO! NO SE ENCONTRARON ERRORES');
        process.exit(0);
    } else {
        console.log(`\\n⚠️  CHECKEO COMPLETADO CON ${totalErrors} ERRORES ENCONTRADOS`);
        console.log('\\n📋 PRÓXIMOS PASOS:');
        console.log('1. Revisar y corregir todos los errores mostrados arriba');
        console.log('2. Ejecutar manualmente test-client-js.html para verificar JavaScript');
        console.log('3. Volver a ejecutar este script hasta que no haya errores');
        process.exit(1);
    }
}

// Ejecutar checkeo completo
fullCheck().catch(error => {
    console.error('💥 Error during check:', error);
    process.exit(1);
});