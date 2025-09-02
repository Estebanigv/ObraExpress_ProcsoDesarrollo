import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const SHEET_ID = '1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc';

// Parsear precios en formato chileno ($7.942 = 7942)
function parsearPrecioChileno(precioStr: string): number {
  if (!precioStr) return 0;
  
  // Remover símbolo $ y espacios
  let limpio = precioStr.trim().replace('$', '');
  
  // Manejar formato chileno: punto como separador de miles, coma como decimal
  if (limpio.includes('.') && limpio.includes(',')) {
    // Caso: $1.234,56 -> remover puntos (miles), convertir coma a punto (decimal)
    limpio = limpio.replace(/\./g, '').replace(',', '.');
  } else if (limpio.includes('.')) {
    // Caso: $7.942 (sin decimales) -> es separador de miles, remover
    if (limpio.length <= 7) { // Números hasta 999.999
      limpio = limpio.replace(/\./g, '');
    }
  } else if (limpio.includes(',')) {
    // Caso: $100,50 -> es decimal, convertir a punto
    limpio = limpio.replace(',', '.');
  }
  
  return parseFloat(limpio) || 0;
}

// Formatear medidas: convierte metros a milímetros cuando sea apropiado
function formatearMedida(medidaStr: string): string {
  if (!medidaStr) return '';
  
  const medidaLimpia = medidaStr.trim().replace(',', '.');
  const medidaNum = parseFloat(medidaLimpia);
  
  if (isNaN(medidaNum)) return medidaStr;
  
  // Si es menor a 0.1 (100mm), probablemente son metros y los convertimos a mm
  if (medidaNum < 0.1) {
    const mm = Math.round(medidaNum * 1000);
    return `${mm}mm`;
  }
  
  // Si es mayor, probablemente ya están en la unidad correcta
  if (medidaNum < 10) {
    return `${medidaNum}m`;
  }
  
  // Si es un número grande, probablemente ya son mm
  return `${Math.round(medidaNum)}mm`;
}

// SISTEMA DE VALIDACIÓN DE REQUISITOS WEB
function validarRequisitosProd(producto: any): { aprobado: boolean, razones: string[] } {
  const razones: string[] = [];
  
  // 1. Debe tener imagen - TEMPORALMENTE DESACTIVADO para permitir productos sin imagen
  // if (!producto.tiene_imagen && !producto.ruta_imagen) {
  //   razones.push('Sin imagen del producto');
  // }
  
  // 2. Datos básicos completos
  if (!producto.nombre || producto.nombre.trim().length === 0) {
    razones.push('Sin nombre de producto');
  }
  
  if (!producto.codigo || producto.codigo.trim().length === 0) {
    razones.push('Sin código SKU');
  }
  
  if (producto.precio_neto <= 0) {
    razones.push('Sin precio válido');
  }
  
  // 3. Stock mínimo
  if (producto.stock < 5) {
    razones.push('Stock insuficiente (mín. 5 unidades)');
  }
  
  // 4. Información técnica mínima
  if (!producto.tipo || producto.tipo.trim().length === 0) {
    razones.push('Sin tipo de producto especificado');
  }
  
  // 5. Dimensiones para productos que las requieren
  const categoriasConDimensiones = ['Policarbonato', 'Perfiles Alveolar', 'Rollos'];
  if (categoriasConDimensiones.includes(producto.categoria)) {
    if (!producto.ancho || producto.ancho.trim().length === 0) {
      razones.push('Sin dimensión de ancho');
    }
    if (!producto.largo || producto.largo.trim().length === 0) {
      razones.push('Sin dimensión de largo');
    }
  }
  
  const aprobado = razones.length === 0;
  
  if (!aprobado) {
    console.log(`❌ Producto ${producto.codigo} rechazado para web:`, razones);
  } else {
    console.log(`✅ Producto ${producto.codigo} aprobado para web`);
  }
  
  return { aprobado, razones };
}

// Parser CSV robusto que maneja correctamente campos multilínea
function parseCSVComplete(csvText: string): string[][] {
  const rows: string[][] = [];
  const lines = csvText.split('\n');
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    let j = 0;

    while (j < line.length) {
      const char = line[j];

      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          // Comilla doble escapada
          currentField += '"';
          j += 2;
          continue;
        }
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        currentRow.push(currentField.trim().replace(/^"|"$/g, ''));
        currentField = '';
      } else {
        currentField += char;
      }
      j++;
    }

    // Si estamos fuera de comillas, terminamos la fila
    if (!inQuotes) {
      currentRow.push(currentField.trim().replace(/^"|"$/g, ''));
      if (currentRow.some(field => field.length > 0)) {
        rows.push([...currentRow]);
      }
      currentRow = [];
      currentField = '';
    } else {
      // Si estamos en quotes, agregamos salto de línea al campo actual
      currentField += '\n';
    }

    i++;
  }

  return rows;
}

// Parser de línea simple (mantenido para compatibilidad)
function parseCSVLineSeguro(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i++;
  }

  result.push(current.trim());
  return result.map(field => field.replace(/^"|"$/g, ''));
}

// Mapear índices de columnas por nombre de header
function mapearIndicesColumnas(headers: string[], sheetName: string): { mapping: Record<string, number>, errores: string[] } {
  const mapping: Record<string, number> = {};
  const errores: string[] = [];
  
  // Validar que hay headers
  if (!headers || headers.length < 5) {
    errores.push(`❌ ESTRUCTURA INVÁLIDA: La pestaña "${sheetName}" tiene muy pocas columnas (${headers?.length || 0}). Se requieren al menos: SKU, Producto, Precio Neto, Costo, Stock.`);
    return { mapping, errores };
  }
  
  headers.forEach((header, index) => {
    const headerLower = header.toLowerCase().trim();
    
    if (headerLower.includes('sku') || headerLower.includes('código')) {
      mapping.sku = index;
    } else if ((headerLower.includes('nombre') && headerLower.includes('producto')) || 
               headerLower === 'producto' || 
               headerLower === 'nombre de producto') {
      mapping.nombre = index;
    } else if (headerLower.includes('tipo')) {
      mapping.tipo = index;
    } else if (headerLower.includes('espesor')) {
      mapping.espesor = index;
    } else if (headerLower.includes('ancho')) {
      mapping.ancho = index;
    } else if (headerLower.includes('largo')) {
      mapping.largo = index;
    } else if (headerLower.includes('color')) {
      mapping.color = index;
    } else if (headerLower.includes('uso')) {
      mapping.uso = index;
    } else if (headerLower.includes('precio') && headerLower.includes('neto')) {
      mapping.precioNeto = index;
    } else if (headerLower.includes('costo') && headerLower.includes('proveedor')) {
      mapping.costoProveedor = index;
    } else if (headerLower.includes('iva') && headerLower.includes('incluido')) {
      mapping.precioConIva = index;
    } else if (headerLower.includes('ganancia') && !headerLower.includes('margen')) {
      mapping.ganancia = index;
    } else if (headerLower.includes('stock')) {
      mapping.stock = index;
    } else if (headerLower.includes('proveedor') && !headerLower.includes('costo')) {
      mapping.proveedor = index;
    }
  });

  // Validar columnas críticas
  if (mapping.sku === undefined) {
    errores.push(`❌ COLUMNA FALTANTE: La pestaña "${sheetName}" no tiene columna "SKU" o "Código". Headers encontrados: ${headers.slice(0, 5).join(', ')}`);
  }
  if (mapping.nombre === undefined) {
    errores.push(`❌ COLUMNA FALTANTE: La pestaña "${sheetName}" no tiene columna "Producto" o "Nombre de Producto". Headers encontrados: ${headers.slice(0, 5).join(', ')}`);
  }
  if (mapping.precioNeto === undefined) {
    errores.push(`❌ COLUMNA FALTANTE: La pestaña "${sheetName}" no tiene columna "Precio Neto". Headers encontrados: ${headers.slice(0, 10).join(', ')}`);
  }

  return { mapping, errores };
}

// Procesar una pestaña con máxima seguridad
async function procesarPestañaSegura(sheetName: string) {
  console.log(`🔒 Procesando pestaña segura: ${sheetName}`);
  
  const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  
  try {
    const response = await fetch(csvUrl, {
      redirect: 'follow',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/csv,application/csv,text/plain'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const csvData = await response.text();
    
    if (!csvData || csvData.trim().length === 0) {
      throw new Error('Datos CSV vacíos');
    }

    // Usar el parser CSV completo que maneja campos multilínea
    const allRows = parseCSVComplete(csvData.trim());
    
    if (allRows.length < 2) {
      throw new Error(`Solo ${allRows.length} filas encontradas`);
    }

    // Parsear headers desde la primera fila
    const headers = allRows[0];
    console.log(`📋 Headers detectados (${headers.length}):`, headers.slice(0, 10));
    
    // Mapear índices de columnas con validación
    const { mapping: indices, errores: erroresEstructura } = mapearIndicesColumnas(headers, sheetName);
    
    // Si hay errores críticos de estructura, retornar inmediatamente
    if (erroresEstructura.length > 0) {
      console.error(`❌ ERRORES DE ESTRUCTURA en ${sheetName}:`, erroresEstructura);
      return {
        sheetName,
        success: false,
        errorType: 'ESTRUCTURA',
        errores: erroresEstructura,
        productosInsertados: 0,
        productosActualizados: 0
      };
    }
    
    console.log('🎯 Mapeo de columnas exitoso:', indices);

    const productos: any[] = [];
    const erroresFilas: string[] = [];
    const productosAprobados: any[] = [];
    const productosRechazados: any[] = [];

    // Procesar cada fila con validación estricta
    for (let i = 1; i < allRows.length; i++) {
      try {
        const cols = allRows[i];
        
        // Detectar líneas de continuación de descripción (sin SKU válido)
        const codigo = cols[indices.sku]?.trim() || '';
        
        // Si no hay código, podría ser línea de continuación - saltarla
        if (!codigo) {
          continue; // Saltar líneas vacías o de continuación
        }
        
        // Verificar formato de SKU más flexible
        if (!/^\d{6,}$/.test(codigo)) {
          erroresFilas.push(`Fila ${i + 1}: SKU inválido (${codigo})`);
          continue;
        }
        
        // Verificar columnas después de confirmar que es una fila válida
        if (cols.length < headers.length / 2) {
          erroresFilas.push(`Fila ${i + 1}: Muy pocas columnas (${cols.length})`);
          continue;
        }

        const nombre = cols[indices.nombre]?.trim() || '';
        if (!nombre) {
          erroresFilas.push(`Fila ${i + 1}: Nombre vacío`);
          continue;
        }

        // Determinar categoría con nombres exactos
        let categoria = 'Productos';
        if (sheetName.toLowerCase().includes('policarbonato')) {
          categoria = 'Policarbonato';
        } else if (sheetName.toLowerCase().includes('perfiles alveolar') || sheetName.toLowerCase().includes('perfil alveolar')) {
          categoria = 'Perfiles Alveolar';
        } else if (sheetName.toLowerCase().includes('accesorio')) {
          categoria = 'Accesorios';
        } else if (sheetName.toLowerCase().includes('rollo')) {
          categoria = 'Rollos';
        } else if (sheetName.toLowerCase().includes('industrial')) {
          categoria = 'Industriales';
        } else if (sheetName.toLowerCase().includes('perfil')) {
          categoria = 'Perfiles';
        }

        // Parsear precios con formato chileno (puntos como separador de miles)
        const precioNetoRaw = cols[indices.precioNeto] || '0';
        const costoProveedorRaw = cols[indices.costoProveedor] || '0';
        const precioConIvaRaw = cols[indices.precioConIva] || '0';
        const gananciaRaw = cols[indices.ganancia] || '0';
        const stockRaw = cols[indices.stock] || '0';

        const precioNeto = parsearPrecioChileno(precioNetoRaw);
        const costoProveedor = parsearPrecioChileno(costoProveedorRaw);
        const precioConIva = parsearPrecioChileno(precioConIvaRaw);
        const ganancia = parsearPrecioChileno(gananciaRaw);
        const stock = parseInt(stockRaw.replace(/[^0-9]/g, '')) || 0;

        // Calcular ganancia correcta
        const gananciaCalculada = ganancia > 0 ? ganancia : (precioNeto > 0 && costoProveedor > 0 ? Math.round(precioNeto - costoProveedor) : 0);
        
        const producto = {
          codigo: codigo,
          nombre: nombre,
          categoria: categoria,
          tipo: cols[indices.tipo]?.trim() || '',
          espesor: cols[indices.espesor]?.trim() || '',
          ancho: formatearMedida(cols[indices.ancho]) || '',
          largo: formatearMedida(cols[indices.largo]) || '',
          color: cols[indices.color]?.trim() || 'Clear',
          uso: cols[indices.uso]?.trim() || '',
          precio_neto: precioNeto,
          costo_proveedor: costoProveedor,
          precio_con_iva: precioConIva > 0 ? precioConIva : Math.round(precioNeto * 1.19),
          ganancia: gananciaCalculada,
          margen_ganancia: precioNeto > 0 ? `${Math.round((gananciaCalculada / precioNeto) * 100)}%` : '0%',
          stock: stock,
          proveedor: cols[indices.proveedor]?.trim() || 'Leker',
          disponible_en_web: stock >= 10,
          tiene_imagen: false,
          ruta_imagen: null,
          pestaña_origen: sheetName,
          orden_original: i,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        // SISTEMA DE APROBACIÓN AUTOMÁTICA PARA WEB
        const cumpleRequisitosWeb = validarRequisitosProd(producto);
        
        // Usar 'disponible_en_web' como campo de aprobación automática
        // Solo estará disponible en web si cumple todos los requisitos
        producto.disponible_en_web = cumpleRequisitosWeb.aprobado;
        
        // Log de razones de rechazo para diagnóstico (sin guardar en BD)
        if (!cumpleRequisitosWeb.aprobado) {
          console.log(`❌ Producto ${producto.codigo} NO APROBADO para web:`, cumpleRequisitosWeb.razones);
          productosRechazados.push({
            codigo: producto.codigo,
            nombre: producto.nombre,
            razones: cumpleRequisitosWeb.razones
          });
        } else {
          console.log(`✅ Producto ${producto.codigo} APROBADO para web`);
          productosAprobados.push({
            codigo: producto.codigo,
            nombre: producto.nombre
          });
        }

        // Validación final
        if (producto.precio_neto <= 0 && producto.costo_proveedor <= 0) {
          erroresFilas.push(`Fila ${i + 1}: Sin precios válidos`);
          continue;
        }

        productos.push(producto);

      } catch (error) {
        erroresFilas.push(`Fila ${i + 1}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log(`✅ ${sheetName}: ${productos.length} productos procesados exitosamente`);
    console.log(`🌐 ${sheetName}: ${productosAprobados.length} aprobados para web, ${productosRechazados.length} rechazados`);
    
    if (erroresFilas.length > 0) {
      console.log(`⚠️ ${sheetName}: ${erroresFilas.length} filas con errores`);
      // Mostrar los primeros 5 errores para diagnóstico
      erroresFilas.slice(0, 5).forEach(error => {
        console.log(`  🔸 ${error}`);
      });
      if (erroresFilas.length > 5) {
        console.log(`  ... y ${erroresFilas.length - 5} errores más`);
      }
    }

    return {
      sheetName,
      success: true,
      productos,
      errores: erroresFilas.slice(0, 10), // Solo primeros 10 errores
      totalFilasOriginales: allRows.length - 1,
      totalProcesadas: productos.length,
      totalErrores: erroresFilas.length,
      aprobacionWeb: {
        aprobados: productosAprobados.length,
        rechazados: productosRechazados.length,
        detalleRechazos: productosRechazados.slice(0, 5) // Primeros 5 para diagnóstico
      }
    };

  } catch (error) {
    console.error(`❌ Error procesando ${sheetName}:`, error);
    return {
      sheetName,
      success: false,
      productos: [],
      errores: [error instanceof Error ? error.message : 'Error desconocido'],
      totalFilasOriginales: 0,
      totalProcesadas: 0,
      totalErrores: 1,
      aprobacionWeb: {
        aprobados: 0,
        rechazados: 0,
        detalleRechazos: []
      }
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 SINCRONIZACIÓN COMPLETA SEGURA INICIADA');
    const startTime = Date.now();

    // Leer categorías a sincronizar desde el body del request
    let categoriasASincronizar: string[] = [];
    try {
      const body = await request.json();
      categoriasASincronizar = body.categorias || [];
    } catch (e) {
      console.log('⚠️ No se recibieron categorías específicas, sincronizando todas por defecto');
    }

    // TODAS las pestañas disponibles del Excel
    const todasLasPestañas = [
      'Policarbonato',      // Pestañas principales
      'Perfiles Alveolar',  // Perfiles para alveolar
      'Accesorios',         // Accesorios generales
      'Rollos',             // Rollos de material
      'Industriales',       // Productos industriales
    ];
    
    // Solo sincronizar las categorías solicitadas, o todas si no se especifican
    const pestañas = categoriasASincronizar.length > 0 ? 
      categoriasASincronizar.filter(cat => todasLasPestañas.includes(cat)) : 
      todasLasPestañas;
    
    console.log(`📋 Categorías a sincronizar: ${pestañas.join(', ')}`);
    console.log(`📋 Total pestañas a procesar: ${pestañas.length}`);
    const todosLosProductos: any[] = [];
    const reporteCompleto: any = {};

    // Procesar todas las pestañas
    for (const pestaña of pestañas) {
      console.log(`\n🔄 Procesando pestaña: ${pestaña}`);
      const resultado = await procesarPestañaSegura(pestaña);
      
      // Si hay error de estructura, agregarlo al reporte con detalle
      if (resultado.errorType === 'ESTRUCTURA') {
        console.error(`❌ ERROR DE ESTRUCTURA en ${pestaña}:`, resultado.errores);
        reporteCompleto[pestaña] = {
          ...resultado,
          mensaje: `ESTRUCTURA INVÁLIDA: ${resultado.errores.join('; ')}`
        };
        continue; // No procesar más esta pestaña
      }
      
      // Solo agregar productos si el resultado fue exitoso
      if (resultado.success && resultado.productos && resultado.productos.length > 0) {
        todosLosProductos.push(...resultado.productos);
        console.log(`✅ ${pestaña}: ${resultado.productos.length} productos procesados`);
      } else {
        console.warn(`⚠️ ${pestaña}: Sin productos válidos`);
      }
      
      reporteCompleto[pestaña] = resultado;
    }

    if (todosLosProductos.length === 0) {
      // Verificar si hay errores estructurales específicos
      const erroresEstructurales = Object.entries(reporteCompleto)
        .filter(([, datos]: [string, any]) => datos.errorType === 'ESTRUCTURA')
        .length > 0;
      
      const errorMessage = erroresEstructurales 
        ? 'Errores de estructura en Google Sheets - Verifica las columnas'
        : 'No se procesaron productos válidos - Verifica que las pestañas tengan datos';
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        reportePorPestaña: reporteCompleto
      });
    }

    console.log(`📦 Total productos para sincronizar: ${todosLosProductos.length}`);

    // PASO CRÍTICO: Limpiar tabla antes de insertar (opcional - solo si se especifica)
    const { limpiarAntes } = await request.json().catch(() => ({}));
    
    if (limpiarAntes) {
      console.log('🧹 Limpiando tabla productos...');
      const { error: deleteError } = await supabaseAdmin
        .from('productos')
        .delete()
        .neq('codigo', ''); // Eliminar todos los registros

      if (deleteError) {
        console.error('❌ Error limpiando tabla:', deleteError);
        // Continuar anyway - no es crítico
      }
    }

    // Sincronizar en lotes pequeños para evitar timeouts
    const BATCH_SIZE = 25;
    let totalInsertados = 0;
    const erroresBatches: string[] = [];

    for (let i = 0; i < todosLosProductos.length; i += BATCH_SIZE) {
      const batch = todosLosProductos.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(todosLosProductos.length / BATCH_SIZE);

      console.log(`🔄 Procesando batch ${batchNum}/${totalBatches} (${batch.length} productos)`);

      try {
        const { data, error, count } = await supabaseAdmin
          .from('productos')
          .upsert(batch, { 
            onConflict: 'codigo',
            count: 'exact'
          });

        if (error) {
          erroresBatches.push(`Batch ${batchNum}: ${error.message}`);
          console.error(`❌ Error en batch ${batchNum}:`, error.message);
        } else {
          totalInsertados += batch.length;
          console.log(`✅ Batch ${batchNum} completado: ${batch.length} productos`);
        }

        // Pequeña pausa entre batches para no sobrecargar
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (batchError) {
        erroresBatches.push(`Batch ${batchNum}: ${batchError instanceof Error ? batchError.message : 'Error desconocido'}`);
        console.error(`❌ Error crítico en batch ${batchNum}:`, batchError);
      }
    }

    const tiempoTotal = Date.now() - startTime;

    // Calcular estadísticas de aprobación total
    const totalAprobados = Object.values(reporteCompleto).reduce((sum: number, r: any) => sum + (r.aprobacionWeb?.aprobados || 0), 0);
    const totalRechazados = Object.values(reporteCompleto).reduce((sum: number, r: any) => sum + (r.aprobacionWeb?.rechazados || 0), 0);
    const todosLosRechazos = Object.values(reporteCompleto).flatMap((r: any) => r.aprobacionWeb?.detalleRechazos || []);

    const response = {
      success: true,
      message: `✅ Sincronización completa: ${totalInsertados}/${todosLosProductos.length} productos sincronizados`,
      estadisticas: {
        totalOriginalGoogleSheets: Object.values(reporteCompleto).reduce((sum: number, r: any) => sum + r.totalFilasOriginales, 0),
        totalProcesados: todosLosProductos.length,
        totalInsertados: totalInsertados,
        tiempoSegundos: Math.round(tiempoTotal / 1000),
        eficiencia: `${Math.round((totalInsertados / todosLosProductos.length) * 100)}%`,
        aprobacionWeb: {
          totalAprobados,
          totalRechazados,
          porcentajeAprobados: totalInsertados > 0 ? `${Math.round((totalAprobados / totalInsertados) * 100)}%` : '0%',
          principalesRazones: todosLosRechazos.length > 0 ? 
            [...new Set(todosLosRechazos.flatMap((r: any) => r.razones))].slice(0, 5) : []
        }
      },
      reportePorPestaña: reporteCompleto,
      erroresBatches: erroresBatches.length > 0 ? erroresBatches : undefined,
      timestamp: new Date().toISOString()
    };

    console.log('🎉 SINCRONIZACIÓN COMPLETA SEGURA FINALIZADA');
    console.log('📊 Estadísticas finales:', response.estadisticas);

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 Error crítico en sincronización segura:', error);
    return NextResponse.json({
      success: false,
      error: `Error crítico: ${error instanceof Error ? error.message : 'Error desconocido'}`
    }, { status: 500 });
  }
}