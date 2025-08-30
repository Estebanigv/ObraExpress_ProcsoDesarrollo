# Sincronización Automática de Productos

## Configuración Completada

### Variables de Entorno
- **CRON_SECRET_TOKEN**: obraexpress-f7qil19jmfc2dl1wlx3odw
- **Hoja de Google Sheets**: 1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc
- **Frecuencia**: 0 */4 * * * (cada 4 horas)

### Endpoints Disponibles

#### Sincronización Manual
```
POST /api/admin/sync-sheets
Content-Type: application/json
{
  "sheetId": "1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc"
}
```

#### Sincronización Automática (Cron)
```
POST /api/cron/sync-products
Authorization: Bearer obraexpress-f7qil19jmfc2dl1wlx3odw
```

### Configuración del Servidor

#### Para Linux/macOS (cron):
1. Hacer ejecutable el script: `chmod +x scripts/auto-sync.sh`
2. Editar cron: `crontab -e`
3. Agregar línea: `0 */4 * * * /path/to/your/project/scripts/auto-sync.sh`

#### Para Windows (Task Scheduler):
1. Abrir Task Scheduler
2. Importar tarea: scripts/windows-task-scheduler.xml
3. Ajustar la ruta del proyecto si es necesario

### Para Servicios en la Nube

#### Vercel Cron Jobs
Agregar en `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-products",
      "schedule": "0 */4 * * *"
    }
  ]
}
```

#### Netlify Functions
Usar Netlify Functions con `@netlify/plugin-scheduled-functions`

### Prueba Manual
```bash
curl -X POST "http://localhost:3000/api/cron/sync-products" \
  -H "Authorization: Bearer obraexpress-f7qil19jmfc2dl1wlx3odw" \
  -H "Content-Type: application/json"
```

### Monitoreo
- Los logs se guardan en la consola del servidor
- Configurar webhooks para notificaciones (opcional)
- Verificar `/api/admin/sync-sheets` para ver el estado de la última sincronización

### Troubleshooting
1. Verificar que el servidor esté corriendo
2. Comprobar las variables de entorno
3. Validar que la Google Sheet sea accesible públicamente
4. Revisar los logs de la aplicación

### Seguridad
- El token de autorización está en las variables de entorno
- Cambiar el token regularmente en producción
- Considerar usar webhooks firmados para mayor seguridad
