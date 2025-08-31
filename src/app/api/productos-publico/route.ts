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
    }
  };

  const tipoKey = Object.keys(imageMap).find(key => 
    tipo.toLowerCase().includes(key.toLowerCase())
  );

  if (!tipoKey) {
    return '/assets/images/Productos/rollo_policarbonato_2mm_cristal.webp';
  }

  const colorOptions = imageMap[tipoKey];
  return colorOptions[color || 'default'] || colorOptions['default'];
}

export async function GET(request: NextRequest) {
  try {
    // Filtrar solo los 4 productos específicos permitidos
    const productosPermitidos = ['Alveolar', 'Ondulado', 'Compacto', 'Perfiles'];
    
    let productos = null;
    let error = null;
    
    // Solo intentar Supabase si está configurado
    if (supabase && typeof window === 'undefined') {
      try {
        console.log('📊 Intentando obtener productos desde Supabase...');
        const result = await supabase
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
            stock,
            ruta_imagen,
            pestaña_origen,
            orden_original,
            created_at
          `)
          .eq('disponible_en_web', true)
          .eq('dimensiones_completas', true)
          .eq('cumple_stock_minimo', true) 
          .gte('stock', 10) // Stock mínimo de 10 unidades
          .in('tipo', productosPermitidos) // Solo permitir los 4 tipos específicos
          .order('pestaña_origen', { ascending: true })
          .order('orden_original', { ascending: true });
          
        productos = result.data;
        error = result.error;
      } catch (supabaseError) {
        console.warn('⚠️ Error con Supabase, usando fallback JSON:', supabaseError);
        error = supabaseError;
      }
    } else {
      console.log('⚠️ Supabase no disponible, usando fallback directo a JSON');
      error = new Error('Supabase not configured');
    }

    if (error || !productos || productos.length === 0) {
      console.error('Error obteniendo productos públicos desde Supabase, usando JSON fallback:', error?.message);
      
      // Fallback a JSON si Supabase falla
      try {
        // Usar filesystem directamente en el servidor
        const filePath = path.join(process.cwd(), 'src', 'data', 'productos-policarbonato.json');
        
        if (fs.existsSync(filePath)) {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const fallbackData = JSON.parse(fileContent);
          console.log('📄 Usando fallback JSON para productos públicos');
          
          // Filtrar y limpiar datos del JSON para cliente - Solo 4 productos específicos
          const productosPermitidos = ['Alveolar', 'Ondulado', 'Compacto', 'Perfiles'];
          const productosPublicos = {};
          Object.entries(fallbackData.productos_por_categoria || {}).forEach(([categoria, productos]) => {
            (productos as any[]).forEach(producto => {
              // Solo procesar productos permitidos
              if (!productosPermitidos.includes(producto.tipo)) {
                return;
              }
              
              const variantesPublicas = producto.variantes
                .filter(v => v.disponible_en_web && v.stock > 0)
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
                  precio_final: v.precio_con_iva, // Solo precio con IVA
                  stock_disponible: v.stock > 10 ? 'Disponible' : 'Stock limitado',
                  imagen: v.ruta_imagen || getDefaultImage(producto.tipo, v.color),
                  garantia: v.garantia,
                  uv_protection: v.uv_protection
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
          
          return NextResponse.json({
            success: true,
            data: { productos_por_categoria: productosPublicos },
            fuente: 'json_fallback',
            total: Object.values(productosPublicos).flat().reduce((sum, p: any) => sum + p.variantes.length, 0)
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
      
      // Crear categoria completa para agrupación (ej: "Policarbonato Ondulado")
      const categoriaCompleta = `${categoria} ${tipo}`;

      if (!acc[categoriaCompleta]) {
        acc[categoriaCompleta] = [];
      }

      // Buscar producto existente por tipo dentro de la categoria completa
      let productoExistente = acc[categoriaCompleta].find(p => p.tipo === tipo);

      if (!productoExistente) {
        productoExistente = {
          id: `${categoria.toLowerCase().replace(/\s+/g, '-')}-${tipo.toLowerCase().replace(/\s+/g, '-')}`,
          nombre: categoriaCompleta, // Usar categoria completa como nombre
          descripcion: `${tipo} de ${categoria} con garantía y protección UV`,
          categoria: categoriaCompleta, // Categoria completa
          tipo: tipo,
          variantes: [],
          colores: [],
          espesores: [],
          dimensiones: [],
          precio_desde: Infinity, // Inicializar para encontrar el mínimo
          stock_total: 0,
          variantes_count: 0
        };
        acc[categoriaCompleta].push(productoExistente);
      }

      // Añadir variante con SOLO información pública
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
        precio: producto.precio_con_iva || 0,
        precio_formateado: `$${(producto.precio_con_iva || 0).toLocaleString('es-CL')}`,
        
        // STOCK REAL - Controlado por admin
        stock: producto.stock || 0,
        
        // DISPONIBILIDAD
        disponible: true,
        stock_disponible: producto.stock > 10 ? 'Disponible' : 'Stock limitado',
        
        // INFORMACIÓN ADICIONAL
        imagen: producto.ruta_imagen || getDefaultImage(producto.tipo, producto.color),
        garantia: "10 años",
        uv_protection: true,
        
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
      });
    });

    // Función para formatear dimensiones para cliente (consistente con product-validation)
    function formatDimensionClient(dimension: string): string {
      // Si es vacío, null o undefined, retornar vacío
      if (!dimension || dimension === '' || dimension === 'null' || dimension === 'undefined') {
        return '';
      }
      
      // Convertir a string y limpiar
      let valorStr = dimension.toString().trim();
      
      // Si ya tiene formato correcto, devolverlo
      if (valorStr.match(/^\d+(\.\d+)?mm$/)) return valorStr; // ej: "4mm", "0.5mm"  
      if (valorStr.match(/^\d+(\.\d+)?cm$/)) return valorStr; // ej: "81cm"
      if (valorStr.match(/^\d+(\.\d+)?m$/)) return valorStr;  // ej: "2.10m"
      
      const num = parseFloat(dimension);
      if (!isNaN(num)) {
        // Si es exactamente 0, probablemente es un dato no especificado
        if (num === 0) {
          return '';
        }
        
        // LÓGICA CORREGIDA: 
        // - Si el valor es < 1, interpretarlo como centímetros (0.81 = 81cm)
        // - Si el valor es >= 1, interpretarlo como metros (2.10 = 2.10m)
        if (num < 1) {
          const centimetros = Math.round(num * 100);
          return `${centimetros}cm`;
        } else {
          return `${num.toFixed(2)}m`;
        }
      }
      return dimension;
    }

    // Estadísticas públicas
    const stats = {
      totalProductos: productos.length,
      categorias: Object.keys(productosPorCategoria).length,
      ultimaActualizacion: productos.length > 0 ? 
        Math.max(...productos.map(p => new Date(p.created_at).getTime())) : Date.now()
    };

    return NextResponse.json({
      success: true,
      data: {
        productos_por_categoria: productosPorCategoria,
        // Mantener compatibilidad
        productos_policarbonato: productosPorCategoria['Policarbonato'] || []
      },
      stats,
      fuente: 'supabase_publico',
      total: productos.length,
      mensaje: 'Productos con precios IVA incluido'
    });

  } catch (error) {
    console.error('Error en API productos público:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}