@echo off
echo 🚀 Habilitando productos para la web...

REM Productos de Policarbonato Ondulado - Clear
echo.
echo 📦 Habilitando productos Ondulado Clear...

curl -X PUT "http://localhost:3010/api/admin/productos" -H "Content-Type: application/json" -d "{\"codigo\":\"111001101\",\"ruta_imagen\":\"/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp\",\"tiene_imagen\":true}"
curl -X POST "http://localhost:3010/api/admin/toggle-visibility" -H "Content-Type: application/json" -d "{\"codigo\":\"111001101\",\"visible\":true}"

curl -X PUT "http://localhost:3010/api/admin/productos" -H "Content-Type: application/json" -d "{\"codigo\":\"111002101\",\"ruta_imagen\":\"/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp\",\"tiene_imagen\":true}"
curl -X POST "http://localhost:3010/api/admin/toggle-visibility" -H "Content-Type: application/json" -d "{\"codigo\":\"111002101\",\"visible\":true}"

curl -X PUT "http://localhost:3010/api/admin/productos" -H "Content-Type: application/json" -d "{\"codigo\":\"111003101\",\"ruta_imagen\":\"/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp\",\"tiene_imagen\":true}"
curl -X POST "http://localhost:3010/api/admin/toggle-visibility" -H "Content-Type: application/json" -d "{\"codigo\":\"111003101\",\"visible\":true}"

REM Productos de Policarbonato Ondulado - Bronce
echo.
echo 📦 Habilitando productos Ondulado Bronce...

curl -X PUT "http://localhost:3010/api/admin/productos" -H "Content-Type: application/json" -d "{\"codigo\":\"111001102\",\"ruta_imagen\":\"/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp\",\"tiene_imagen\":true}"
curl -X POST "http://localhost:3010/api/admin/toggle-visibility" -H "Content-Type: application/json" -d "{\"codigo\":\"111001102\",\"visible\":true}"

curl -X PUT "http://localhost:3010/api/admin/productos" -H "Content-Type: application/json" -d "{\"codigo\":\"111002102\",\"ruta_imagen\":\"/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp\",\"tiene_imagen\":true}"
curl -X POST "http://localhost:3010/api/admin/toggle-visibility" -H "Content-Type: application/json" -d "{\"codigo\":\"111002102\",\"visible\":true}"

curl -X PUT "http://localhost:3010/api/admin/productos" -H "Content-Type: application/json" -d "{\"codigo\":\"111003102\",\"ruta_imagen\":\"/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp\",\"tiene_imagen\":true}"
curl -X POST "http://localhost:3010/api/admin/toggle-visibility" -H "Content-Type: application/json" -d "{\"codigo\":\"111003102\",\"visible\":true}"

REM Productos de Policarbonato Ondulado - Opal
echo.
echo 📦 Habilitando productos Ondulado Opal...

curl -X PUT "http://localhost:3010/api/admin/productos" -H "Content-Type: application/json" -d "{\"codigo\":\"111001103\",\"ruta_imagen\":\"/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp\",\"tiene_imagen\":true}"
curl -X POST "http://localhost:3010/api/admin/toggle-visibility" -H "Content-Type: application/json" -d "{\"codigo\":\"111001103\",\"visible\":true}"

curl -X PUT "http://localhost:3010/api/admin/productos" -H "Content-Type: application/json" -d "{\"codigo\":\"111002103\",\"ruta_imagen\":\"/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp\",\"tiene_imagen\":true}"
curl -X POST "http://localhost:3010/api/admin/toggle-visibility" -H "Content-Type: application/json" -d "{\"codigo\":\"111002103\",\"visible\":true}"

curl -X PUT "http://localhost:3010/api/admin/productos" -H "Content-Type: application/json" -d "{\"codigo\":\"111003103\",\"ruta_imagen\":\"/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp\",\"tiene_imagen\":true}"
curl -X POST "http://localhost:3010/api/admin/toggle-visibility" -H "Content-Type: application/json" -d "{\"codigo\":\"111003103\",\"visible\":true}"

echo.
echo ✅ Proceso completado! Los productos han sido habilitados para la web.
echo 🌐 Puedes verificar en: http://localhost:3010/productos
echo.
pause