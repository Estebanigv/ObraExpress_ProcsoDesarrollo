import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Función para obtener imagen por defecto basada en tipo y color
function getDefaultImage(tipo: string, color?: string): string {
  const imageMap: Record<string, Record<string, string>> = {
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
    'Perfil U': {
      'default': '/assets/images/productos/perfiles/perfil-u-policarbonato.webp'
    },
    'Perfil H': {
      'default': '/assets/images/productos/perfiles/perfil-h-policarbonato.webp'
    },
    'Perfil Clip': {
      'default': '/assets/images/productos/perfiles/perfil-clip-policarbonato.webp'
    },
    'Perfil Alveolar': {
      'default': '/assets/images/productos/perfiles/perfil-alveolar-policarbonato.webp'
    }
  };

  const tipoKey = Object.keys(imageMap).find(key => 
    tipo.toLowerCase().includes(key.toLowerCase())
  );

  if (!tipoKey) {
    // Si es un perfil genérico
    if (tipo.toLowerCase().includes('perfil')) {
      return '/assets/images/productos/perfiles/perfiles-policarbonato-generic.webp';
    }
    return '/assets/images/Productos/rollo_policarbonato_2mm_cristal.webp';
  }

  const colorOptions = imageMap[tipoKey];
  return colorOptions[color || 'default'] || colorOptions['default'];
}

// Función para formatear dimensiones para cliente (consistente con componente)
function formatDimensionClient(dimension: string): string {
  // Si es vacío, null o undefined, retornar vacío
  if (!dimension || dimension === '' || dimension === 'null' || dimension === 'undefined' || dimension === '0' || dimension === '0.0') {
    return '';
  }
  
  // Convertir a string y limpiar - manejar comas decimales chilenas
  let valorStr = dimension.toString().trim().replace(',', '.');
  
  // Si ya tiene formato correcto, devolverlo
  if (valorStr.match(/^\d+(\.\d+)?\s*(mm|cm|mts)$/)) return valorStr;
  
  const num = parseFloat(valorStr);
  if (!isNaN(num) && num > 0) {
    // Los valores en la base de datos YA están en metros
    // Decidir la mejor unidad para mostrar según el valor
    
    // Para valores muy pequeños (menos de 0.01 metros = 10mm)
    if (num < 0.01) {
      const mm = Math.round(num * 1000);
      return `${mm} mm`;
    } 
    // Para valores entre 0.01 y 0.99 metros, mostrar en centímetros para mayor claridad
    else if (num < 1) {
      const cm = Math.round(num * 100);
      return `${cm} cm`;
    }
    // Para valores de 1 metro o más, mostrar en metros
    else {
      // Si es un número entero, mostrarlo sin decimales
      // Si tiene decimales, usar formato chileno con coma
      const formatted = num % 1 === 0 ? num.toFixed(0) : num.toFixed(2).replace('.', ',');
      return `${formatted} mts`;
    }
  }
  return '';
}

export async function GET(request: NextRequest) {
  console.log('🔄 API productos-publico iniciado');
  
  try {
    // Importar configuración de categorías visibles con timeout
    let categoriasVisibles = ['Policarbonato']; // Fallback por defecto
    
    try {
      const categoriesModule = await Promise.race([
        import('@/config/categories-visibility'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1000))
      ]);
      categoriasVisibles = (categoriesModule as any).getVisibleCategories?.() || ['Policarbonato'];
      console.log('📊 Categorías visibles cargadas:', categoriasVisibles);
    } catch (categoriesError) {
      console.warn('⚠️ Error cargando categorías, usando fallback:', categoriesError);
    }
    
    let productos = null;
    let error = null;
    
    // Solo intentar Supabase si está configurado y tenemos categorías
    if (supabase && typeof window === 'undefined' && categoriasVisibles.length > 0) {
      try {
        console.log('📊 Consultando Supabase con timeout...');
        
        // Consulta con timeout para evitar cuelgues
        const queryPromise = supabase
          .from('productos')
          .select(`
            id,
            codigo,
            nombre,
            categoria,
            tipo,
            espesor,
            ancho,
            largo,
            color,
            uso,
            precio_con_iva,
            precio_neto,
            stock,
            ruta_imagen,
            pestaña_origen,
            orden_original,
            created_at,
            updated_at,
            disponible_en_web
          `)
          .in('categoria', categoriasVisibles)
          .not('precio_con_iva', 'is', null)
          .gt('precio_con_iva', 0)
          .limit(500) // Limitar resultados para evitar sobrecarga
          .order('updated_at', { ascending: false }) // Ordenar por más recientes primero
          .order('pestaña_origen', { ascending: true })
          .order('orden_original', { ascending: true });
          
        // Timeout de 5 segundos
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), 5000);
        });
        
        const result = await Promise.race([queryPromise, timeoutPromise]);
        productos = (result as any).data;
        error = (result as any).error;
        
        console.log('✅ Supabase respondió:', productos?.length || 0, 'productos');
        if (error) console.log('❌ Error Supabase:', error.message);
        if (productos && productos.length > 0) {
          console.log('📊 Primer producto:', {
            codigo: productos[0].codigo,
            categoria: productos[0].categoria,
            disponible_en_web: productos[0].disponible_en_web,
            stock: productos[0].stock,
            precio: productos[0].precio_con_iva
          });
        }
      } catch (supabaseError) {
        console.warn('⚠️ Error/timeout con Supabase, usando fallback JSON:', supabaseError);
        error = supabaseError;
      }
    } else {
      console.log('⚠️ Supabase no disponible o sin categorías, usando fallback directo a JSON');
      error = new Error('Supabase not configured or no categories');
    }

    if (error || !productos || productos.length === 0) {
      console.error('Error obteniendo productos públicos desde Supabase, usando JSON fallback:', error?.message);
      
      // Fallback a JSON si Supabase falla
      try {
        console.log('📄 Intentando fallback JSON...');
        const filePath = path.join(process.cwd(), 'src', 'data', 'productos-policarbonato.json');
        
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const fallbackData = JSON.parse(fileContent);
          console.log('📄 JSON cargado, procesando categorías visibles:', categoriasVisibles);
          
          // Filtrar solo por categorías visibles desde el admin
          const productosPublicos = {};
          
          Object.entries(fallbackData.productos_por_categoria || {}).forEach(([categoria, productos]) => {
            // Solo procesar categorías que están visibles en el admin
            if (!categoriasVisibles.includes(categoria)) {
              return;
            }
            
            (productos as any[]).forEach(producto => {
              const variantesPublicas = producto.variantes
                .filter(v => v.disponible_en_web && v.stock > 0)
                .slice(0, 50) // Limitar variantes para evitar sobrecarga
                .map(v => ({
                  codigo: v.codigo,
                  nombre: v.nombre,
                  descripcion: v.nombre,
                  categoria: categoria,
                  tipo: producto.tipo,
                  espesor: v.espesor,
                  ancho: v.ancho,
                  largo: v.largo,
                  color: v.color,
                  uso: v.uso,
                  precio_con_iva: v.precio_con_iva,
                  stock: v.stock,
                  stock_disponible: v.stock > 10 ? 'Disponible' : 'Stock limitado',
                  imagen: v.ruta_imagen || getDefaultImage(producto.tipo, v.color),
                  garantia: v.garantia || '10 años',
                  uv_protection: v.uv_protection !== null ? v.uv_protection : true
                }));
              
              if (variantesPublicas.length > 0) {
                if (!productosPublicos[categoria]) {
                  productosPublicos[categoria] = [];
                }
                productosPublicos[categoria].push({
                  ...producto,
                  variantes: variantesPublicas
                });
              }
            });
          });
          
          const totalProductos = Object.values(productosPublicos).flat().reduce((sum, p: any) => sum + p.variantes.length, 0);
          console.log('✅ Fallback JSON procesado:', totalProductos, 'productos de categorías visibles');
          
          return NextResponse.json({
            success: true,
            data: { productos_por_categoria: productosPublicos },
            fuente: 'json_fallback',
            categorias_visibles: categoriasVisibles,
            total: totalProductos
          });
        } else {
          console.warn('📄 Archivo JSON de productos no encontrado');
        }
      } catch (fallbackError) {
        console.error('Error en fallback JSON:', fallbackError);
      }
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!productos || productos.length === 0) {
      return NextResponse.json({
        success: true,
        data: { productos_por_categoria: {} },
        message: 'No hay productos disponibles',
        total: 0
      });
    }

    // Agrupar productos para el cliente (sin información de costos)
    const productosPorCategoria = productos.reduce((acc, producto) => {
      const categoria = producto.categoria || 'Productos';
      const tipo = producto.tipo || 'General';
      
      // Crear categoria completa para agrupación, evitando duplicaciones
      let categoriaCompleta;
      if (categoria === 'Perfiles Alveolar') {
        // Para perfiles, usar solo el tipo específico como nombre
        categoriaCompleta = tipo; 
      } else {
        // Para policarbonatos, usar "Policarbonato Tipo"
        categoriaCompleta = `${categoria} ${tipo}`;
      }

      if (!acc[categoriaCompleta]) {
        acc[categoriaCompleta] = [];
      }

      // Buscar producto existente por tipo dentro de la categoria completa
      let productoExistente = acc[categoriaCompleta].find(p => p.tipo === tipo);

      if (!productoExistente) {
        // Crear descripción más detallada según el tipo
        let descripcionDetallada = '';
        let usos = [];
        
        if (tipo === 'Ondulado') {
          descripcionDetallada = `Policarbonato ondulado de alta resistencia, ideal para cubiertas y techos. Ofrece excelente transmisión lumínica y protección UV garantizada.`;
          usos = ['Cubiertas residenciales', 'Invernaderos', 'Pérgolas', 'Techos comerciales'];
        } else if (tipo === 'Alveolar') {
          descripcionDetallada = `Policarbonato alveolar multicelda con excelente aislamiento térmico y acústico. Perfect para estructuras que requieren eficiencia energética.`;
          usos = ['Lucernarios', 'Cubiertas aislantes', 'Cerramientos', 'Ventanas industriales'];
        } else if (tipo === 'Compacto') {
          descripcionDetallada = `Policarbonato compacto de alta transparencia y resistencia al impacto. Ideal para aplicaciones que requieren máxima claridad óptica.`;
          usos = ['Mamparas', 'Ventanas de seguridad', 'Cubiertas transparentes', 'Protecciones industriales'];
        } else {
          descripcionDetallada = `${tipo} de ${categoria} con alta calidad, garantía extendida y protección UV incluida.`;
          usos = ['Uso general', 'Construcción', 'Industria'];
        }

        productoExistente = {
          id: `${categoria.toLowerCase().replace(/\s+/g, '-')}-${tipo.toLowerCase().replace(/\s+/g, '-')}`,
          nombre: categoriaCompleta,
          descripcion: descripcionDetallada,
          descripcion_corta: `${tipo} de ${categoria} con garantía y protección UV`,
          categoria: categoriaCompleta,
          tipo: tipo,
          usos_principales: usos,
          caracteristicas: [
            'Protección UV garantizada',
            'Resistente a impactos',
            'Garantía extendida',
            'Fácil instalación'
          ],
          variantes: [],
          colores: [],
          espesores: [],
          dimensiones: [],
          precio_desde: Infinity,
          stock_total: 0,
          variantes_count: 0,
          imagen: getDefaultImage(tipo, 'default')
        };
        acc[categoriaCompleta].push(productoExistente);
      }

      // Añadir variante con información completa para cliente
      productoExistente.variantes.push({
        codigo: producto.codigo,
        nombre: producto.nombre,
        descripcion: producto.nombre,
        categoria: producto.categoria,
        tipo: producto.tipo,
        
        // INFORMACIÓN TÉCNICA (Visible para cliente)
        espesor: producto.espesor || '',
        ancho: producto.ancho ? formatDimensionClient(producto.ancho) : '',
        largo: producto.largo ? formatDimensionClient(producto.largo) : '',
        color: producto.color || 'No especificado',
        uso: producto.uso || 'Uso general',
        dimensiones: producto.ancho && producto.largo ? `${formatDimensionClient(producto.ancho)} x ${formatDimensionClient(producto.largo)}` : '',
        
        // PRECIO PÚBLICO (Solo precio final con IVA)
        precio_con_iva: producto.precio_con_iva || 0,
        precio_neto: producto.precio_neto || 0,
        precio: producto.precio_con_iva || 0,
        precio_formateado: `$${(producto.precio_con_iva || 0).toLocaleString('es-CL')}`,
        
        // STOCK REAL - Controlado por admin
        stock: producto.stock || 0,
        
        // DISPONIBILIDAD
        disponible: true,
        disponible_en_web: true,
        stock_disponible: producto.stock > 10 ? 'Disponible' : producto.stock > 0 ? 'Stock limitado' : 'Sin stock',
        
        // INFORMACIÓN ADICIONAL DEL PRODUCTO
        imagen: producto.ruta_imagen || getDefaultImage(producto.tipo, producto.color),
        ruta_imagen: producto.ruta_imagen,
        garantia: "10 años",
        uv_protection: true,
        
        // METADATOS
        created_at: producto.created_at,
        updated_at: producto.updated_at,
        
        // CAMPOS OCULTOS - NO incluir información de costos
        // costo_proveedor: OCULTO
        // ganancia: OCULTO  
        // margen_ganancia: OCULTO
        // proveedor: OCULTO
      });

      // Actualizar estadísticas del grupo
      productoExistente.precio_desde = Math.min(productoExistente.precio_desde, producto.precio_con_iva || 0);
      productoExistente.stock_total += (producto.stock || 0);
      productoExistente.variantes_count += 1;
      
      // Actualizar imagen del grupo con la primera imagen válida encontrada
      if (producto.ruta_imagen && !productoExistente.imagen_principal) {
        productoExistente.imagen_principal = producto.ruta_imagen;
      }
      
      // Actualizar imagen por defecto si no hay imagen principal
      if (!productoExistente.imagen_principal && !productoExistente.imagen) {
        productoExistente.imagen = getDefaultImage(producto.tipo, producto.color);
      }

      return acc;
    }, {} as Record<string, any[]>);

    // Después del agrupamiento, calcular arrays únicos para cada categoría
    Object.keys(productosPorCategoria).forEach(categoria => {
      productosPorCategoria[categoria].forEach(grupo => {
        // Extraer valores únicos de todas las variantes del grupo
        const colores = [...new Set(grupo.variantes.map(v => v.color).filter(Boolean))];
        const espesores = [...new Set(grupo.variantes.map(v => v.espesor).filter(Boolean))];
        const dimensiones = [...new Set(grupo.variantes.map(v => v.dimensiones).filter(Boolean))];
        
        // Asignar arrays únicos al grupo
        grupo.colores = colores;
        grupo.espesores = espesores;
        grupo.dimensiones = dimensiones;
        
        // Corregir precio_desde si quedó en Infinity
        if (grupo.precio_desde === Infinity) {
          grupo.precio_desde = 0;
        }
        
        // Asegurar que hay imagen del grupo
        if (!grupo.imagen && !grupo.imagen_principal) {
          grupo.imagen = getDefaultImage(grupo.tipo, colores[0] || 'default');
        }
        
        // Si hay imagen principal, usar esa como imagen del grupo
        if (grupo.imagen_principal) {
          grupo.imagen = grupo.imagen_principal;
        }
        
        // Agregar metadatos adicionales
        grupo.total_variantes = grupo.variantes.length;
        grupo.stock_disponible = grupo.stock_total > 10 ? 'Disponible' : grupo.stock_total > 0 ? 'Stock limitado' : 'Sin stock';
        grupo.precio_maximo = Math.max(...grupo.variantes.map(v => v.precio_con_iva || 0));
        grupo.colores_disponibles = colores.length;
        grupo.dimensiones_disponibles = dimensiones.length;
      });
    });


    // Estadísticas públicas
    const stats = {
      totalProductos: productos.length,
      categorias: Object.keys(productosPorCategoria).length,
      ultimaActualizacion: productos.length > 0 ? 
        Math.max(...productos.map(p => new Date(p.created_at).getTime())) : Date.now()
    };

    const response = NextResponse.json({
      success: true,
      data: {
        productos_por_categoria: productosPorCategoria,
        // Mantener compatibilidad
        productos_policarbonato: productosPorCategoria['Policarbonato'] || []
      },
      stats,
      fuente: 'supabase_publico',
      total: productos.length,
      mensaje: 'Productos con precios IVA incluido',
      timestamp: Date.now() // Para forzar actualizaciones
    });

    // Headers para evitar cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    
    return response;

  } catch (error) {
    console.error('Error en API productos público:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}