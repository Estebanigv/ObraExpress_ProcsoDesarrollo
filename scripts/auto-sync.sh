#!/bin/bash

# Script de sincronización automática para ObraExpress
# Ejecuta cada 0 */4 * * *

SITE_URL="http://localhost:3000"
if [ "$NODE_ENV" = "production" ]; then
    SITE_URL="https://tu-dominio.com"
fi

echo "$(date): Iniciando sincronización automática de productos..."

curl -X POST "$SITE_URL/api/cron/sync-products" \
  -H "Authorization: Bearer obraexpress-f7qil19jmfc2dl1wlx3odw" \
  -H "Content-Type: application/json" \
  >> /var/log/obraexpress-sync.log 2>&1

echo "$(date): Sincronización completada"
