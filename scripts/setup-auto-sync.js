#!/usr/bin/env node

/**
 * Script de configuración para la sincronización automática de productos
 * Este script ayuda a configurar cron jobs o servicios programados
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando sincronización automática de productos...\n');

// Configuración por defecto
const config = {
  sheetId: '1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc',
  cronExpression: '0 */4 * * *', // Cada 4 horas
  authToken: generateSecureToken(),
  webhookUrl: '',
  errorWebhookUrl: ''
};

// Generar token seguro
function generateSecureToken() {
  return 'obraexpress-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Crear archivo de configuración para variables de entorno
function createEnvConfig() {
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Agregar o actualizar variables necesarias
  const envVars = {
    'CRON_SECRET_TOKEN': config.authToken,
    'NEXT_PUBLIC_SHEETS_SYNC_ENABLED': 'true',
    'NOTIFICATION_WEBHOOK_URL': config.webhookUrl,
    'ERROR_WEBHOOK_URL': config.errorWebhookUrl
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  });
  
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log('✅ Configuración de variables de entorno actualizada');
}

// Crear script de cron para sistemas Unix/Linux
function createCronScript() {
  const cronScript = `#!/bin/bash

# Script de sincronización automática para ObraExpress
# Ejecuta cada ${config.cronExpression}

SITE_URL="http://localhost:3000"
if [ "$NODE_ENV" = "production" ]; then
    SITE_URL="https://tu-dominio.com"
fi

echo "$(date): Iniciando sincronización automática de productos..."

curl -X POST "$SITE_URL/api/cron/sync-products" \\
  -H "Authorization: Bearer ${config.authToken}" \\
  -H "Content-Type: application/json" \\
  >> /var/log/obraexpress-sync.log 2>&1

echo "$(date): Sincronización completada"
`;

  const scriptsDir = path.join(process.cwd(), 'scripts');
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }
  
  fs.writeFileSync(path.join(scriptsDir, 'auto-sync.sh'), cronScript);
  console.log('✅ Script de cron creado en scripts/auto-sync.sh');
}

// Crear configuración para Task Scheduler de Windows
function createWindowsTask() {
  const taskXml = `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo>
    <Date>2024-01-01T00:00:00</Date>
    <Author>ObraExpress</Author>
    <Description>Sincronización automática de productos desde Google Sheets</Description>
  </RegistrationInfo>
  <Triggers>
    <CalendarTrigger>
      <Repetition>
        <Interval>PT4H</Interval>
        <StopAtDurationEnd>false</StopAtDurationEnd>
      </Repetition>
      <StartBoundary>2024-01-01T09:00:00</StartBoundary>
      <Enabled>true</Enabled>
    </CalendarTrigger>
  </Triggers>
  <Principals>
    <Principal id="Author">
      <LogonType>InteractiveToken</LogonType>
      <RunLevel>LeastPrivilege</RunLevel>
    </Principal>
  </Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>true</RunOnlyIfNetworkAvailable>
    <IdleSettings>
      <StopOnIdleEnd>true</StopOnIdleEnd>
      <RestartOnIdle>false</RestartOnIdle>
    </IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT1H</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions>
    <Exec>
      <Command>powershell</Command>
      <Arguments>-Command "Invoke-RestMethod -Uri 'http://localhost:3000/api/cron/sync-products' -Method POST -Headers @{'Authorization'='Bearer ${config.authToken}'; 'Content-Type'='application/json'}"</Arguments>
    </Exec>
  </Actions>
</Task>`;

  const scriptsDir = path.join(process.cwd(), 'scripts');
  fs.writeFileSync(path.join(scriptsDir, 'windows-task-scheduler.xml'), taskXml);
  console.log('✅ Configuración de Task Scheduler creada en scripts/windows-task-scheduler.xml');
}

// Crear documentación
function createDocumentation() {
  const doc = `# Sincronización Automática de Productos

## Configuración Completada

### Variables de Entorno
- **CRON_SECRET_TOKEN**: ${config.authToken}
- **Hoja de Google Sheets**: ${config.sheetId}
- **Frecuencia**: ${config.cronExpression} (cada 4 horas)

### Endpoints Disponibles

#### Sincronización Manual
\`\`\`
POST /api/admin/sync-sheets
Content-Type: application/json
{
  "sheetId": "${config.sheetId}"
}
\`\`\`

#### Sincronización Automática (Cron)
\`\`\`
POST /api/cron/sync-products
Authorization: Bearer ${config.authToken}
\`\`\`

### Configuración del Servidor

#### Para Linux/macOS (cron):
1. Hacer ejecutable el script: \`chmod +x scripts/auto-sync.sh\`
2. Editar cron: \`crontab -e\`
3. Agregar línea: \`${config.cronExpression} /path/to/your/project/scripts/auto-sync.sh\`

#### Para Windows (Task Scheduler):
1. Abrir Task Scheduler
2. Importar tarea: scripts/windows-task-scheduler.xml
3. Ajustar la ruta del proyecto si es necesario

### Para Servicios en la Nube

#### Vercel Cron Jobs
Agregar en \`vercel.json\`:
\`\`\`json
{
  "crons": [
    {
      "path": "/api/cron/sync-products",
      "schedule": "${config.cronExpression}"
    }
  ]
}
\`\`\`

#### Netlify Functions
Usar Netlify Functions con \`@netlify/plugin-scheduled-functions\`

### Prueba Manual
\`\`\`bash
curl -X POST "http://localhost:3000/api/cron/sync-products" \\
  -H "Authorization: Bearer ${config.authToken}" \\
  -H "Content-Type: application/json"
\`\`\`

### Monitoreo
- Los logs se guardan en la consola del servidor
- Configurar webhooks para notificaciones (opcional)
- Verificar \`/api/admin/sync-sheets\` para ver el estado de la última sincronización

### Troubleshooting
1. Verificar que el servidor esté corriendo
2. Comprobar las variables de entorno
3. Validar que la Google Sheet sea accesible públicamente
4. Revisar los logs de la aplicación

### Seguridad
- El token de autorización está en las variables de entorno
- Cambiar el token regularmente en producción
- Considerar usar webhooks firmados para mayor seguridad
`;

  fs.writeFileSync(path.join(process.cwd(), 'SYNC_SETUP.md'), doc);
  console.log('✅ Documentación creada en SYNC_SETUP.md');
}

// Ejecutar configuración
async function setup() {
  try {
    createEnvConfig();
    createCronScript();
    createWindowsTask();
    createDocumentation();
    
    console.log('\n🎉 ¡Configuración completada exitosamente!');
    console.log('\n📋 Próximos pasos:');
    console.log('1. Revisar el archivo SYNC_SETUP.md para instrucciones detalladas');
    console.log('2. Configurar el cron job o Task Scheduler según tu sistema operativo');
    console.log('3. Probar la sincronización manual desde el admin');
    console.log('4. Verificar que los productos se actualicen correctamente');
    
    console.log('\n🔑 Token de autorización generado:', config.authToken);
    console.log('💡 Guarda este token de forma segura');
    
  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setup();
}

module.exports = { setup, config };