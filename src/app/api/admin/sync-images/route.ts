import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Función para buscar imagen para un producto
function buscarImagenProducto(codigo: string, categoria: string, tipo: string): { tieneImagen: boolean, rutaImagen?: string } {
  const basePath = path.join(process.cwd(), 'public', 'assets', 'images', 'Productos');
  
  // Mapear categorías a carpetas
  const carpetasPorCategoria: Record<string, any> = {
    'Policarbonato': {
      'Alveolar': 'Policarbonato Alveolar',
      'Compacto': 'Policarbonato Compacto', 
      'Ondulado': 'Policarnato Ondulado' // Nota: hay typo en la carpeta existente
    },
    'Perfiles Alveolar': 'Perfiles Alveolar',
    'Perfiles': 'Perfiles',
    'Accesorios': 'Accesorios',
    'Rollos': 'Rollo'
  };
  
  // Obtener carpeta destino
  let carpetaProducto = '';
  if (categoria === 'Policarbonato') {
    const subcarpetas = carpetasPorCategoria['Policarbonato'];
    carpetaProducto = subcarpetas[tipo] || categoria;
  } else if (carpetasPorCategoria[categoria]) {
    carpetaProducto = carpetasPorCategoria[categoria];
  } else {
    carpetaProducto = categoria;
  }
  
  const carpetaCompleta = path.join(basePath, carpetaProducto);
  
  // Si la carpeta no existe, no hay imágenes
  if (!fs.existsSync(carpetaCompleta)) {
    console.log(`❌ Carpeta no existe: ${carpetaCompleta}`);
    return { tieneImagen: false };
  }
  
  // Extensiones de imagen comunes
  const extensiones = ['.webp', '.jpg', '.jpeg', '.png'];
  
  // Primero buscar imagen específica por código SKU
  for (const ext of extensiones) {
    const rutaImagen = path.join(carpetaCompleta, `${codigo}${ext}`);
    if (fs.existsSync(rutaImagen)) {
      console.log(`✅ Imagen encontrada por SKU: ${codigo}${ext}`);
      return {
        tieneImagen: true,
        rutaImagen: `/assets/images/Productos/${carpetaProducto}/${codigo}${ext}`
      };
    }
  }
  
  // Buscar imágenes compartidas por tipo de producto
  const imagenesCompartidas = {
    'Policarbonato': {
      'Ondulado': ['policarbonato-ondulado-general', 'ondulado'],
      'Alveolar': ['policarbonato-alveolar-general', 'alveolar'],
      'Compacto': ['policarbonato-compacto-general', 'compacto']
    }
    // Perfiles Alveolar y Perfiles usan imágenes individuales por SKU, no compartidas
  };
  
  const nombresImagenCompartida = imagenesCompartidas[categoria]?.[tipo];
  if (nombresImagenCompartida) {
    // Buscar imagen compartida específica
    for (const nombreImagen of nombresImagenCompartida) {
      for (const ext of extensiones) {
        const rutaImagen = path.join(carpetaCompleta, `${nombreImagen}${ext}`);
        if (fs.existsSync(rutaImagen)) {
          console.log(`✅ Imagen compartida encontrada para ${categoria} ${tipo}: ${nombreImagen}${ext}`);
          return {
            tieneImagen: true,
            rutaImagen: `/assets/images/Productos/${carpetaProducto}/${nombreImagen}${ext}`
          };
        }
      }
    }
    
    // Buscar cualquier imagen que contenga el tipo
    try {
      const archivos = fs.readdirSync(carpetaCompleta);
      const imagenPorTipo = archivos.find(archivo => {
        const archivoLower = archivo.toLowerCase();
        return tipo && archivoLower.includes(tipo.toLowerCase()) && 
               extensiones.some(ext => archivo.endsWith(ext));
      });
      
      if (imagenPorTipo) {
        console.log(`✅ Imagen por tipo encontrada: ${imagenPorTipo}`);
        return {
          tieneImagen: true,
          rutaImagen: `/assets/images/Productos/${carpetaProducto}/${imagenPorTipo}`
        };
      }
    } catch (error) {
      console.error(`Error buscando imágenes en ${carpetaCompleta}:`, error);
    }
  }
  
  // Para otros productos, buscar imágenes genéricas
  const nombresGenericos = [
    `policarbonato_${tipo?.toLowerCase() || ''}`,
    `policarbonato ${tipo?.toLowerCase() || ''}`,
    `${tipo?.toLowerCase() || ''}`,
    `${categoria?.toLowerCase() || ''}_${tipo?.toLowerCase() || ''}`,
    `${categoria?.toLowerCase() || ''} ${tipo?.toLowerCase() || ''}`,
    categoria?.toLowerCase() || ''
  ];
  
  for (const nombreGenerico of nombresGenericos) {
    if (!nombreGenerico) continue;
    
    for (const ext of extensiones) {
      const rutaImagen = path.join(carpetaCompleta, `${nombreGenerico}${ext}`);
      if (fs.existsSync(rutaImagen)) {
        console.log(`✅ Imagen genérica encontrada: ${nombreGenerico}${ext}`);
        return {
          tieneImagen: true,
          rutaImagen: `/assets/images/Productos/${carpetaProducto}/${nombreGenerico}${ext}`
        };
      }
    }
  }
  
  // Buscar cualquier imagen en la carpeta que coincida parcialmente
  try {
    const archivos = fs.readdirSync(carpetaCompleta);
    const tipoLower = tipo?.toLowerCase() || '';
    
    // Buscar imagen que contenga el tipo
    if (tipoLower) {
      const imagenPorTipo = archivos.find(archivo => 
        archivo.toLowerCase().includes(tipoLower) && 
        extensiones.some(ext => archivo.endsWith(ext))
      );
      
      if (imagenPorTipo) {
        console.log(`✅ Imagen por tipo encontrada: ${imagenPorTipo}`);
        return {
          tieneImagen: true,
          rutaImagen: `/assets/images/Productos/${carpetaProducto}/${imagenPorTipo}`
        };
      }
    }
    
    // Para productos que no usan imagen compartida (como Perfiles Alveolar),
    // NO asignar imagen genérica - solo si hay imagen específica por SKU
    // La lógica de "primera imagen" solo debe aplicar a productos con imagen compartida
    console.log(`❌ No se encontró imagen específica por SKU para: ${codigo}`);
  } catch (error) {
    console.error(`Error leyendo carpeta ${carpetaCompleta}:`, error);
  }
  
  console.log(`❌ No se encontró imagen para: ${codigo} (${categoria} - ${tipo})`);
  return { tieneImagen: false };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando sincronización de imágenes existentes...');
    
    // Obtener todos los productos de la base de datos
    const { data: productos, error } = await supabase
      .from('productos')
      .select('codigo, categoria, tipo, tiene_imagen, ruta_imagen');
    
    if (error) {
      console.error('Error obteniendo productos:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Error obteniendo productos de la base de datos' 
      }, { status: 500 });
    }
    
    if (!productos || productos.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No se encontraron productos en la base de datos' 
      }, { status: 404 });
    }
    
    console.log(`📦 Procesando ${productos.length} productos...`);
    
    let actualizados = 0;
    let conImagen = 0;
    let sinImagen = 0;
    const productosActualizados = [];
    
    // Procesar cada producto
    for (const producto of productos) {
      const { codigo, categoria, tipo } = producto;
      const imagenInfo = buscarImagenProducto(codigo, categoria, tipo);
      
      // Si el estado de imagen cambió, actualizar en la BD
      if (imagenInfo.tieneImagen !== producto.tiene_imagen || 
          (imagenInfo.tieneImagen && imagenInfo.rutaImagen !== producto.ruta_imagen)) {
        
        const { error: updateError } = await supabase
          .from('productos')
          .update({
            tiene_imagen: imagenInfo.tieneImagen,
            ruta_imagen: imagenInfo.rutaImagen || null,
            updated_at: new Date().toISOString()
          })
          .eq('codigo', codigo);
        
        if (!updateError) {
          actualizados++;
          productosActualizados.push({
            codigo,
            categoria,
            tipo,
            tiene_imagen: imagenInfo.tieneImagen,
            ruta_imagen: imagenInfo.rutaImagen
          });
          console.log(`✅ Actualizado: ${codigo} - ${imagenInfo.tieneImagen ? 'CON' : 'SIN'} imagen`);
        } else {
          console.error(`❌ Error actualizando ${codigo}:`, updateError);
        }
      }
      
      if (imagenInfo.tieneImagen) {
        conImagen++;
      } else {
        sinImagen++;
      }
    }
    
    const resumen = {
      total_productos: productos.length,
      productos_con_imagen: conImagen,
      productos_sin_imagen: sinImagen,
      productos_actualizados: actualizados,
      detalles_actualizados: productosActualizados.slice(0, 10) // Primeros 10 para muestra
    };
    
    console.log('✅ Sincronización de imágenes completada:', resumen);
    
    return NextResponse.json({
      success: true,
      message: 'Sincronización de imágenes completada',
      resumen
    });
    
  } catch (error) {
    console.error('Error en sincronización de imágenes:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}