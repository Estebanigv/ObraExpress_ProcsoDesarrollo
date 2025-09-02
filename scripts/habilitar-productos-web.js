// Script para habilitar productos en la web con imágenes apropiadas
const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3010';

// Mapeo de tipos de producto a imágenes
const imageMap = {
  'Ondulado': {
    'Clear': '/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp',
    'Bronce': '/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp',
    'Opal': '/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp',
    'default': '/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp'
  },
  'Alveolar': {
    'Clear': '/assets/images/Productos/Policarbonato Alveolar/policarbonato_alveolar_clear.webp',
    'Bronce': '/assets/images/Productos/Policarbonato Alveolar/policarbonato_alveolar_bronce.webp',
    'default': '/assets/images/Productos/Policarbonato Alveolar/policarbonato_alveolar.webp'
  },
  'Compacto': {
    'Clear': '/assets/images/Productos/Policarbonato Compacto/policarbonato_compacto Clear.webp',
    'Solid': '/assets/images/Productos/Policarbonato Compacto/policarbonato_compacto Solid.webp',
    'default': '/assets/images/Productos/Policarbonato Compacto/policarbonato_compacto.webp'
  },
  'Perfiles': {
    'default': '/assets/images/Productos/Perfiles/perfiles.webp'
  }
};

// Función para obtener imagen apropiada
function getImagePath(tipo, color) {
  const tipoKey = Object.keys(imageMap).find(key => 
    tipo.toLowerCase().includes(key.toLowerCase())
  );
  
  if (!tipoKey) {
    console.log(`⚠️  Tipo no encontrado: ${tipo}`);
    return '/assets/images/Productos/rollo_policarbonato_2mm_cristal.webp'; // fallback
  }
  
  const colorOptions = imageMap[tipoKey];
  return colorOptions[color] || colorOptions['default'];
}

// Función para habilitar un producto
async function enableProduct(codigo) {
  try {
    const response = await fetch(`${baseUrl}/api/admin/toggle-visibility`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        codigo: codigo,
        visible: true
      })
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error(`Error habilitando producto ${codigo}:`, error);
    return false;
  }
}

// Función para asignar imagen a un producto
async function assignImage(codigo, imagePath) {
  try {
    const response = await fetch(`${baseUrl}/api/admin/productos`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        codigo: codigo,
        ruta_imagen: imagePath,
        tiene_imagen: true
      })
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error(`Error asignando imagen a producto ${codigo}:`, error);
    return false;
  }
}

// Función principal
async function processProducts() {
  try {
    console.log('🚀 Obteniendo productos...');
    
    // Obtener productos del admin
    const response = await fetch(`${baseUrl}/api/admin/productos`);
    const data = await response.json();
    
    if (!data.success) {
      console.error('Error obteniendo productos:', data.error);
      return;
    }
    
    let processed = 0;
    let enabled = 0;
    
    // Procesar cada categoría
    for (const [categoria, productos] of Object.entries(data.data.productos_por_categoria)) {
      console.log(`\n📦 Procesando categoría: ${categoria}`);
      
      for (const producto of productos) {
        for (const variante of producto.variantes) {
          // Solo procesar productos con stock suficiente y dimensiones completas
          if (variante.stock >= 10 && 
              variante.espesor && 
              variante.ancho && 
              variante.largo &&
              !variante.disponible_en_web) {
            
            console.log(`\n🔧 Procesando: ${variante.codigo} - ${variante.nombre}`);
            console.log(`   Stock: ${variante.stock}, Tipo: ${variante.tipo}, Color: ${variante.color}`);
            
            // Obtener imagen apropiada
            const imagePath = getImagePath(variante.tipo, variante.color);
            console.log(`   Imagen asignada: ${imagePath}`);
            
            // Asignar imagen
            const imageSuccess = await assignImage(variante.codigo, imagePath);
            if (!imageSuccess) {
              console.log(`   ❌ Error asignando imagen`);
              continue;
            }
            
            // Habilitar para web
            const enableSuccess = await enableProduct(variante.codigo);
            if (enableSuccess) {
              console.log(`   ✅ Producto habilitado para web`);
              enabled++;
            } else {
              console.log(`   ❌ Error habilitando producto`);
            }
            
            processed++;
          }
        }
      }
    }
    
    console.log(`\n🎉 Proceso completado:`);
    console.log(`   📊 Productos procesados: ${processed}`);
    console.log(`   ✅ Productos habilitados: ${enabled}`);
    console.log(`\n🌐 Ahora puedes verificar la web pública en: ${baseUrl}/productos`);
    
  } catch (error) {
    console.error('❌ Error en el proceso principal:', error);
  }
}

// Ejecutar script
console.log('🚀 Iniciando proceso de habilitación de productos...');
processProducts();