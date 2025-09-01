import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase';
import { validarProductoParaWeb, formatearDimension, detectarCambioPrecio } from '@/modules/products/utils/product-validation';

// ID de tu Google Sheet
const SHEET_ID = '1n9wJx1-lUDcoIxV4uo6GkB8eywdH2CsGIUlQTt_hjIc';

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
    'Perfiles': {
      'default': '/assets/images/Productos/Perfiles/perfil.webp'
    },
    'Perfil': {
      'default': '/assets/images/Productos/Perfiles/perfil.webp'
    },
    'Accesorios': {
      'default': '/assets/images/Productos/Accesorios/accesorio.webp'
    },
    'Accesorio': {
      'default': '/assets/images/Productos/Accesorios/accesorio.webp'
    }
  };

  // Buscar por coincidencia exacta primero
  let tipoKey = Object.keys(imageMap).find(key => 
    key.toLowerCase() === tipo.toLowerCase()
  );

  // Si no encuentra exacta, buscar por contiene
  if (!tipoKey) {
    tipoKey = Object.keys(imageMap).find(key => 
      tipo.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(tipo.toLowerCase())
    );
  }

  if (!tipoKey) {
    return '/assets/images/Productos/rollo_policarbonato_2mm_cristal.webp';
  }

  const colorOptions = imageMap[tipoKey];
  return colorOptions[color || 'default'] || colorOptions['default'];
}

// Función para validar si existe imagen de un producto
function validarImagenProducto(codigo: string, tipo: string, categoria: string, color?: string): { tieneImagen: boolean, rutaImagen?: string } {
  const basePath = path.join(process.cwd(), 'public', 'assets', 'images', 'Productos');
  
  // Mapear categorías a carpetas
  const carpetasPorCategoria: Record<string, Record<string, string> | string> = {
    'Policarbonato': {
      'Alveolar': 'Policarbonato Alveolar',
      'Compacto': 'Policarbonato Compacto', 
      'Ondulado': 'Policarnato Ondulado' // Nota: hay typo en la carpeta existente
    },
    'Perfiles': 'Perfiles',
    'Accesorios': 'Accesorios'
  };
  
  // Obtener ruta de carpeta según categoría y tipo
  let carpetaProducto = '';
  if (categoria === 'Policarbonato') {
    const subcarpetas = carpetasPorCategoria['Policarbonato'] as Record<string, string>;
    carpetaProducto = subcarpetas[tipo] || categoria;
  } else if (categoria === 'Perfiles') {
    carpetaProducto = 'Perfiles';
  } else if (categoria === 'Accesorios') {
    carpetaProducto = 'Accesorios';
  } else {
    // Carpeta genérica
    carpetaProducto = categoria;
  }
  
  const carpetaCompleta = path.join(basePath, carpetaProducto);
  
  // Extensiones de imagen comunes
  const extensiones = ['.webp', '.jpg', '.jpeg', '.png'];
  
  // Buscar archivo con el código del producto
  for (const ext of extensiones) {
    const rutaImagen = path.join(carpetaCompleta, `${codigo}${ext}`);
    if (fs.existsSync(rutaImagen)) {
      return {
        tieneImagen: true,
        rutaImagen: `/assets/images/Productos/${carpetaProducto}/${codigo}${ext}`
      };
    }
  }
  
  // Buscar imágenes genéricas por tipo si no hay imagen específica
  const nombresGenericos = [
    `policarbonato_${tipo.toLowerCase()}`,
    `${tipo.toLowerCase()}`,
    `${categoria.toLowerCase()}_${tipo.toLowerCase()}`,
    `${categoria.toLowerCase().replace(/s$/, '')}`, // perfil sin s final
    categoria.toLowerCase() // nombre de categoría directo
  ];
  
  for (const nombreGenerico of nombresGenericos) {
    for (const ext of extensiones) {
      const rutaImagen = path.join(carpetaCompleta, `${nombreGenerico}${ext}`);
      if (fs.existsSync(rutaImagen)) {
        return {
          tieneImagen: true,
          rutaImagen: `/assets/images/Productos/${carpetaProducto}/${nombreGenerico}${ext}`
        };
      }
    }
  }
  
  // Si no encuentra imagen específica, usar imagen por defecto
  const imagenPorDefecto = getDefaultImage(tipo, color);
  
  // Verificar si existe la imagen por defecto físicamente
  const rutaImagenPorDefecto = path.join(process.cwd(), 'public', imagenPorDefecto);
  if (fs.existsSync(rutaImagenPorDefecto)) {
    return {
      tieneImagen: true,
      rutaImagen: imagenPorDefecto
    };
  }
  
  return { tieneImagen: false };
}

// Función para mapear nombres de pestañas a categorías amigables
function obtenerNombreCategoria(sheetName: string): string {
  const mapeoNombres: Record<string, string> = {
    'Policarbonato': 'Policarbonato',
    'Perfiles Alveolar': 'Perfiles Alveolar',
    'Accesorios': 'Accesorios',
    'Rollos': 'Rollos',
    'Industriales': 'Industriales', 
    'Accesorios Industriales': 'Accesorios Industriales',
    'Kits': 'Kits',
    'Kit': 'Kits',
    'Herramientas': 'Herramientas',
    'Herramienta': 'Herramientas',
    'Tools': 'Herramientas',
    'Accesorios': 'Accesorios',
    'Accessorios': 'Accesorios',
    'Productos': 'Productos',
    'Products': 'Productos',
    'Inventario': 'Inventario',
    'Inventory': 'Inventario',
    'Materiales': 'Materiales',
    'Materials': 'Materiales'
  };
  
  return mapeoNombres[sheetName] || sheetName;
}

// Función para obtener todos los nombres de pestañas del Google Sheet
async function obtenerNombresPestañas() {
  try {
    // Usar la API de Google Sheets para obtener información del spreadsheet
    const metadataUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?key=${process.env.GOOGLE_SHEETS_API_KEY}&fields=sheets(properties(title))`;
    
    // Si no hay API key, usar nombres por defecto
    if (!process.env.GOOGLE_SHEETS_API_KEY) {
      console.log('⚠️ No hay API key, intentando detectar pestañas por fuerza bruta...');
      return await detectarPestañasPorFuerzaBruta();
    }
    
    const response = await fetch(metadataUrl);
    if (response.ok) {
      const data = await response.json();
      const pestañas = data.sheets?.map((sheet: any) => sheet.properties.title) || [];
      console.log(`📋 Pestañas detectadas via API:`, pestañas);
      return pestañas;
    } else {
      console.log('⚠️ API falló, intentando detectar por fuerza bruta...');
      return await detectarPestañasPorFuerzaBruta();
    }
  } catch (error) {
    console.log('⚠️ Error en API, intentando detectar por fuerza bruta...', error);
    return await detectarPestañasPorFuerzaBruta();
  }
}

// Función alternativa para detectar pestañas probando nombres comunes
async function detectarPestañasPorFuerzaBruta() {
  const pestañasPosibles = [
    'Sheet1', 'Hoja1', 
    'Policarbonato', 'Policarbonatos',
    'Kits', 'Kit',
    'Herramientas', 'Herramienta', 'Tools',
    'Accesorios', 'Accessorios',
    'Productos', 'Products',
    'Policarbonato',
    'Perfiles Alveolar',
    'Accesorios',
    'Rollos', 
    'Industriales',
    'Accesorios Industriales'
  ];
  
  const pestañasExistentes = [];
  
  for (const nombre of pestañasPosibles) {
    try {
      const testUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombre)}`;
      const response = await fetch(testUrl, {
        redirect: 'follow',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      if (response.ok) {
        const content = await response.text();
        // Verificar que tiene contenido válido (headers + al menos 1 fila de datos)
        const lines = content.trim().split('\n');
        if (lines.length >= 2 && lines[0].includes(',')) {
          pestañasExistentes.push(nombre);
          console.log(`✅ Pestaña encontrada: ${nombre}`);
        }
      }
    } catch (error) {
      // Silencioso, solo está probando
    }
  }
  
  console.log(`📋 Pestañas detectadas por fuerza bruta:`, pestañasExistentes);
  return pestañasExistentes.length > 0 ? pestañasExistentes : ['Sheet1'];
}

// Función mejorada para parsear CSV con comas decimales chilenas
function parsearCSV(csvData: string) {
  return csvData.trim().split('\n').map(row => {
    const cells = [];
    let currentCell = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < row.length) {
      const char = row[i];
      const nextChar = i < row.length - 1 ? row[i + 1] : null;
      const prevChar = i > 0 ? row[i - 1] : null;
      
      if (char === '"') {
        // Detectar inicio de comillas
        if (!inQuotes && (prevChar === ',' || prevChar === null)) {
          inQuotes = true;
        }
        // Detectar fin de comillas  
        else if (inQuotes && (nextChar === ',' || nextChar === null)) {
          inQuotes = false;
        }
        // Comillas dobles dentro del contenido ("")
        else if (inQuotes && nextChar === '"') {
          currentCell += '"';
          i++; // Saltar la siguiente comilla
        }
      }
      // Separador de columnas
      else if (char === ',' && !inQuotes) {
        cells.push(currentCell.trim());
        currentCell = '';
        i++;
        continue;
      }
      // Contenido normal
      else {
        currentCell += char;
      }
      
      i++;
    }
    
    // Agregar la última celda
    cells.push(currentCell.trim());
    
    return cells;
  });
}

// Función para procesar datos de una pestaña
async function procesarPestaña(sheetName: string) {
  console.log(`\n📊 Procesando pestaña: ${sheetName}`);
  
  const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  console.log('📊 Obteniendo datos desde:', csvUrl);
  
  try {
    const response = await fetch(csvUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`❌ Error accediendo a pestaña ${sheetName}: ${response.status}`);
      return { variantes: [], error: `Error ${response.status}` };
    }

    const csvData = await response.text();
    
    if (!csvData || csvData.trim().length === 0) {
      console.log(`⚠️ Pestaña ${sheetName} está vacía`);
      return { variantes: [], error: 'Pestaña vacía' };
    }

    console.log(`📋 Datos obtenidos de ${sheetName}, primera línea:`, csvData.split('\n')[0]);
    
    // Usar parser nativo más robusto para CSV con comas decimales
    const rows = csvData.trim().split('\n').map(line => {
      // Usar una expresión regular más robusta para CSV
      const result = [];
      const regex = /"([^"]*(?:""[^"]*)*)"|([^,]+)/g;
      let match;
      
      while ((match = regex.exec(line)) !== null) {
        // Grupo 1: contenido entre comillas, Grupo 2: contenido sin comillas
        const value = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
        result.push((value || '').trim());
      }
      
      return result;
    });
    console.log(`📋 Procesando ${rows.length} filas de ${sheetName}...`);
    
    // Procesar headers y datos
    const headers = rows[0];
    const dataRows = rows.slice(1).filter(row => row.length > 1 && row[0]); // Filtrar filas vacías

    console.log(`📝 Headers de ${sheetName}:`, headers);
    console.log(`📦 Filas de datos válidas en ${sheetName}: ${dataRows.length}`);

    // MAPEO DINÁMICO UNIVERSAL - Lee los headers exactos de cada pestaña
    const findIndexExact = (searchTerms: string[]) => {
      return headers.findIndex(header => {
        if (!header) return false;
        const headerNormalized = header.toString().toLowerCase().trim();
        
        return searchTerms.some(term => {
          const termNormalized = term.toLowerCase().trim();
          // Coincidencia exacta o contenido
          return headerNormalized === termNormalized || 
                 headerNormalized.includes(termNormalized) ||
                 termNormalized.includes(headerNormalized);
        });
      });
    };

    console.log(`🔍 [${sheetName}] Headers detectados:`, headers.map((h, i) => `${i}: "${h}"`));
    
    // Mapeo genérico que funciona para cualquier estructura de pestaña
    const indices = {
      codigo: findIndexExact(['sku', 'codigo', 'código', 'id', 'code']),
      nombre: findIndexExact(['producto', 'nombre', 'name', 'description']),
      tipo: findIndexExact(['tipo', 'type', 'categoria', 'categoría']),
      espesor: findIndexExact(['espesor', 'grosor', 'milimetros', 'mm', 'thickness']),
      
      // CAMPOS ESPECÍFICOS DETECTADOS EN LA IMAGEN
      ancho: findIndexExact(['ancho metros', 'ancho', 'width', 'metros ancho', 'medida ancho']),
      largo: findIndexExact(['largo metros', 'largo', 'length', 'longitud', 'metros largo', 'medida largo']),
      color: findIndexExact(['color', 'colour']),
      uso: findIndexExact(['uso', 'use', 'aplicacion', 'aplicación', 'descripción uso']),
      
      // CAMPOS DE PRECIOS EXACTOS
      precioNeto: findIndexExact(['precio neto', 'precio_neto', 'precio sin iva', 'neto']),
      costoProveedor: findIndexExact(['costo por prov', 'costo proveedor', 'costo_proveedor', 'precio_proveedor', 'costo por proveedor']),
      ivaIncluido: findIndexExact(['iva incluido', 'precio con iva', 'precio_con_iva', 'incluido']),
      ganancia: findIndexExact(['ganancia', 'profit', 'beneficio']),
      margen: findIndexExact(['margen', 'margin', '%', 'porcentaje']),
      stock: findIndexExact(['stock', 'cantidad', 'inventario', 'existencias']),
      // Búsqueda exacta para proveedor para evitar confusión con "costo por proveedor"
      proveedor: headers.findIndex(h => h && h.toLowerCase().trim() === 'proveedor'),
      factorVentaSobreCosto: findIndexExact(['factor', 'factor venta', 'factor_venta', 'multiplicador']),
      dimensiones: findIndexExact(['dimensiones', 'medidas', 'tamaño', 'size'])
    };

    // POST-PROCESAMIENTO: Verificar campos críticos no encontrados y buscarlos manualmente
    const camposFaltantes = [];
    
    // Detectar campos faltantes críticos
    Object.entries(indices).forEach(([campo, indice]) => {
      if (indice === -1) {
        camposFaltantes.push(campo);
      }
    });
    
    if (camposFaltantes.length > 0) {
      console.log(`⚠️ [${sheetName}] Campos no detectados automáticamente:`, camposFaltantes);
      
      // Búsqueda manual por posición para campos críticos
      camposFaltantes.forEach(campo => {
        switch (campo) {
          case 'ancho':
            // Buscar cualquier columna que hable de ancho o metros
            for (let i = 0; i < headers.length; i++) {
              const h = (headers[i] || '').toLowerCase();
              if (h.includes('ancho') || (h.includes('metros') && !h.includes('largo'))) {
                indices.ancho = i;
                console.log(`🔧 [${sheetName}] Ancho manual en índice ${i}: "${headers[i]}"`);
                break;
              }
            }
            break;
            
          case 'largo':
            for (let i = 0; i < headers.length; i++) {
              const h = (headers[i] || '').toLowerCase();
              if (h.includes('largo') || (h.includes('metros') && h.includes('largo'))) {
                indices.largo = i;
                console.log(`🔧 [${sheetName}] Largo manual en índice ${i}: "${headers[i]}"`);
                break;
              }
            }
            break;
            
          case 'costoProveedor':
            // Buscar "costo por prov" o similar
            for (let i = 0; i < headers.length; i++) {
              const h = (headers[i] || '').toLowerCase();
              if (h.includes('costo') && (h.includes('prov') || h.includes('proveedor'))) {
                indices.costoProveedor = i;
                console.log(`🔧 [${sheetName}] Costo proveedor manual en índice ${i}: "${headers[i]}"`);
                break;
              }
            }
            break;
        }
      });
    }
    
    console.log(`🔍 [${sheetName}] Índices finales mapeados:`, 
      Object.entries(indices)
        .filter(([_, idx]) => idx !== -1)
        .map(([campo, idx]) => `${campo}=${idx}("${headers[idx]}")`)
    );

    // Convertir datos a formato JSON con precios corregidos
    const variantes = dataRows.map((row, index) => {
      const codigo = row[indices.codigo] || `${sheetName}-${index}`;
      const nombre = row[indices.nombre] || 'Sin nombre';
      const categoriaOriginal = row[indices.tipo] || row[2] || ''; // Usar índice tipo correctamente
      
      // Log detallado para diagnóstico
      if (index < 5) { // Primeros 5 productos para debug
        console.log(`📊 [${sheetName}] Producto ${index}:`, {
          SKU: codigo,
          Tipo: categoriaOriginal || 'SIN TIPO',
          TipoRaw: row[2],
          Ancho: row[indices.ancho] || 'N/A',
          Largo: row[indices.largo] || 'N/A',
          EspesorRaw: row[indices.espesor] || 'N/A'
        });
      }
      
      // Parsear números con formato chileno: "$7.523" = 7523 pesos
      const costoProveedorStr = row[indices.costoProveedor] || '0';
      const precioNetoStr = row[indices.precioNeto] || '0';
      const stockStr = row[indices.stock] || '0';
      const factorVentaStr = row[indices.factorVentaSobreCosto] || '100'; // Default 100% si no está especificado
      
      const costoProveedor = parseFloat(
        costoProveedorStr.toString()
          .replace(/[$\s]/g, '') // Remover $ y espacios
          .replace(/\./g, '') // Remover puntos (separadores de miles)
          .replace(/,/g, '.') // Convertir comas a puntos (decimales)
        || '0'
      );
      
      const precioNeto = parseFloat(
        precioNetoStr.toString()
          .replace(/[$\s]/g, '') // Remover $ y espacios
          .replace(/\./g, '') // Remover puntos (separadores de miles)
          .replace(/,/g, '.') // Convertir comas a puntos (decimales)
        || '0'
      );
      
      // NUEVA LÓGICA: Factor de venta sobre costo
      let factorVentaSobreCosto = parseFloat(
        factorVentaStr.toString()
          .replace(/[$\s%]/g, '') // Remover $, espacios y %
          .replace(/,/g, '.') // Convertir comas a puntos (decimales)
        || '100' // Default 100% si no está especificado
      );
      
      // CORRECCIÓN: Si el valor es muy pequeño (< 10), probablemente está en formato decimal (ej: 1.84 = 184%)
      if (factorVentaSobreCosto > 0 && factorVentaSobreCosto < 10) {
        factorVentaSobreCosto = factorVentaSobreCosto * 100; // Convertir 1.84 a 184
      }
      
      const stock = parseInt(stockStr.toString().replace(/[^0-9]/g, '') || '0');
      
      // CÁLCULO DE PRECIO CON FACTOR: Costo * (Factor / 100) 
      // Ejemplo: Costo $1000 * Factor 140% = Precio Venta $1400
      const precioVentaCalculado = costoProveedor > 0 ? costoProveedor * (factorVentaSobreCosto / 100) : precioNeto;
      
      // Usar el precio calculado con factor o el del Excel (por compatibilidad)
      const precioVenta = precioVentaCalculado > 0 ? precioVentaCalculado : precioNeto;
      const ganancia = precioVenta - costoProveedor;
      const margenGanancia = precioVenta > 0 ? ((ganancia / precioVenta) * 100).toFixed(2) : '0';
      
      // Log para debugging del nuevo cálculo (solo primeros 3 productos)
      if (index < 3) {
        console.log(`💰 [${sheetName}] Producto ${codigo}:`, {
          costo_proveedor: costoProveedor,
          factor_venta_sobre_costo: factorVentaSobreCosto + '%',
          precio_calculado: precioVentaCalculado,
          precio_final: precioVenta,
          ganancia: ganancia,
          margen: margenGanancia + '%'
        });
      }
      
      // El proveedor se obtiene dinámicamente en la sección de corrección de campos arriba
      
      // REGLAS DE NEGOCIO PARA MOSTRAR EN WEB - VALIDACIÓN ESTRICTA DE SKU
      const esSkuValido = (sku: string): boolean => {
        if (!sku || sku.trim() === '') return false;
        
        const skuLimpio = sku.toLowerCase().trim();
        
        // Rechazar códigos que no son SKUs reales
        const textosInvalidos = [
          'falso', 'test', 'prueba', 'ejemplo', 'sample',
          'aplicación típica', 'aplicacion tipica', 'típica', 'tipica',
          'descripción', 'descripcion', 'detalle', 'información', 'informacion',
          'uso típico', 'uso tipico', 'usos', 'características', 'caracteristicas',
          'especificaciones', 'especificacion', 'notas', 'observaciones',
          'medidas típicas', 'medidas tipicas', 'dimensiones típicas',
          'colores disponibles', 'colores', 'acabados', 'terminaciones',
          'instalación', 'instalacion', 'montaje', 'aplicaciones',
          'ventajas', 'beneficios', 'propiedades', 'garantía', 'garantia'
        ];
        
        // Si contiene cualquier texto inválido, rechazar
        for (const textoInvalido of textosInvalidos) {
          if (skuLimpio.includes(textoInvalido)) {
            return false;
          }
        }
        
        // Rechazar si es igual al nombre de la pestaña
        if (skuLimpio === sheetName.toLowerCase()) {
          return false;
        }
        
        // Rechazar códigos que son solo el prefijo de la pestaña
        if (sku === `${sheetName}-` || sku === `${sheetName}_` || sku === sheetName) {
          return false;
        }
        
        // VALIDACIÓN ESPECIAL PARA PERFILES ALVEOLAR
        if (sheetName === 'Perfiles Alveolar') {
          // Los SKUs de Perfiles Alveolar son numéricos de 8-9 dígitos
          return /^\d{8,9}$/.test(sku);
        }
        
        // Un SKU válido debe tener al menos 3 caracteres y contener números o letras en mayúsculas
        if (sku.length < 3) return false;
        
        // Debe contener al menos un número o una letra mayúscula (patrón típico de SKU)
        const tieneNumeroOLetraMayuscula = /[0-9A-Z]/.test(sku);
        if (!tieneNumeroOLetraMayuscula) return false;
        
        return true;
      };
      
      const tieneSkuValido = esSkuValido(codigo);
      
      // Log de productos rechazados por SKU inválido para debugging
      if (!tieneSkuValido) {
        console.log(`❌ SKU rechazado: "${codigo}" en pestaña "${sheetName}" - No es un código válido`);
      }
      
      const tieneStockMinimo = stock >= 10; // Stock mínimo 10 unidades para mostrar en web (9 o menos se oculta automáticamente)
      
      // Validar imagen del producto usando los campos corregidos
      const validacionImagen = validarImagenProducto(codigo, row[indices.tipo] || sheetName, obtenerNombreCategoria(sheetName), colorRaw);
      const tieneImagen = validacionImagen.tieneImagen;
      
      // IMPORTANTE: Con stock < 10 el producto se oculta automáticamente
      const disponibleEnWeb = tieneSkuValido && tieneStockMinimo && tieneImagen;
      
      // EXTRACCIÓN DIRECTA DE DATOS USANDO ÍNDICES DINÁMICOS
      // Obtener datos directamente de los índices detectados (sin corrección manual)
      const espesorRaw = indices.espesor !== -1 ? (row[indices.espesor] || '') : '';
      const anchoRaw = indices.ancho !== -1 ? (row[indices.ancho] || '') : ''; 
      const largoRaw = indices.largo !== -1 ? (row[indices.largo] || '') : '';
      const colorRaw = indices.color !== -1 ? (row[indices.color] || '') : 'Sin especificar';
      const usoRaw = indices.uso !== -1 ? (row[indices.uso] || '') : 'Uso general';
      const proveedorRaw = indices.proveedor !== -1 ? (row[indices.proveedor] || 'Leker') : 'Leker';
      
      // Debug para primeros productos
      if (index < 3) {
        console.log(`📊 [${sheetName}] Producto ${index} - ${codigo}:`);
        console.log(`  • Ancho (${indices.ancho}): "${anchoRaw}"`);
        console.log(`  • Largo (${indices.largo}): "${largoRaw}"`);
        console.log(`  • Color (${indices.color}): "${colorRaw}"`);
        console.log(`  • Uso (${indices.uso}): "${usoRaw}"`);
        console.log(`  • Proveedor (${indices.proveedor}): "${proveedorRaw}"`);
      }
      
      // Usar ancho como dimensiones para compatibilidad, o crear dimensiones combinadas
      const dimensiones = anchoRaw && largoRaw ? `${anchoRaw}x${largoRaw}` : (anchoRaw || largoRaw || '');

      // Función para parsear números con comas decimales (formato chileno)
      const parsearDecimal = (valor, tipo = '') => {
        if (!valor || valor === '') return '';
        let valorStr = valor.toString().trim();
        
        // Debug: log para TODOS los valores con comas decimales
        if (valorStr.includes(',') && valorStr.match(/\d+,\d+/)) {
          console.log('🔍 DEBUG COMA - Valor con coma decimal encontrado:', valor, 'Tipo:', typeof valor);
        }
        
        // Conversión especial para ancho: si es 81 o 0.81, convertir a 0,81
        if (tipo === 'ancho') {
          // Limpiar de posibles unidades
          valorStr = valorStr.replace(/cm|m|mm/gi, '').trim();
          
          // Si es 81 o 81.0, convertir a 0,81
          const numValue = parseFloat(valorStr.replace(',', '.'));
          if (numValue === 81 || numValue === 81.0) {
            return '0,81';
          }
          // Si es 0.81, mantener como 0,81 con coma
          if (numValue === 0.81) {
            return '0,81';
          }
        }
        
        // Mantener el formato original del Excel (conservar comas como decimales)
        return valorStr;
      };

      // Parsear dimensiones correctamente
      const espesorParsed = parsearDecimal(espesorRaw, 'espesor');
      const anchoParsed = parsearDecimal(anchoRaw, 'ancho');
      const largoParsed = parsearDecimal(largoRaw, 'largo');

      return {
        codigo,
        nombre: nombre, // Producto desde Excel
        descripcion: `${obtenerNombreCategoria(sheetName)} ${categoriaOriginal || 'Standard'}`,
        categoria: obtenerNombreCategoria(sheetName), // Categoría principal basada en la pestaña
        tipo: categoriaOriginal || 'Standard', // Tipo específico: Ondulado, Alveolar, Compacto
        costo_proveedor: costoProveedor,
        precio_neto: Math.round(precioVenta),
        precio_con_iva: Math.round(precioVenta * 1.19),
        ganancia: Math.round(ganancia),
        margen_ganancia: `${margenGanancia}%`,
        factor_venta_sobre_costo: factorVentaSobreCosto, // NUEVO CAMPO
        espesor: espesorParsed,
        // Campos separados para medidas (ya parseados)
        ancho: anchoParsed,
        largo: largoParsed,
        // Mantener dimensiones para compatibilidad
        dimensiones: dimensiones,
        color: colorRaw || 'Sin especificar',
        uso: usoRaw || "Uso general",
        stock: stock,
        uv_protection: true,
        garantia: "10 años",
        proveedor: proveedorRaw || 'Leker',
        pestaña_origen: sheetName, // NUEVO: rastrear de qué pestaña viene
        orden_original: index, // NUEVO: preservar orden del Google Sheets
        // NUEVOS CAMPOS PARA REGLAS DE NEGOCIO
        tiene_sku_valido: tieneSkuValido,
        tiene_stock_minimo: tieneStockMinimo,
        tiene_imagen: tieneImagen,
        ruta_imagen: validacionImagen.rutaImagen || null,
        disponible_en_web: disponibleEnWeb,
        motivo_no_disponible: !disponibleEnWeb ? 
          (!tieneSkuValido ? 'SKU inválido o de prueba' : 
           !tieneStockMinimo ? 'Stock insuficiente (mínimo 9)' :
           !tieneImagen ? 'Sin imagen de producto' : 'No disponible') 
          : null
      };
    }).filter(v => {
      // Validación estricta: Solo productos con SKU válido y datos económicos válidos
      const tieneSkuReal = v.tiene_sku_valido && v.codigo && v.codigo.length >= 3;
      const tieneDatosEconomicos = (v.precio_neto > 0 || v.costo_proveedor > 0);
      const isValidProduct = tieneSkuReal && tieneDatosEconomicos;
      
      if (!isValidProduct) {
        const motivos = [];
        if (!tieneSkuReal) motivos.push('SKU inválido');
        if (!tieneDatosEconomicos) motivos.push('Sin datos de precio/costo');
        
        console.log(`🗑️ Producto excluido de ${sheetName}: "${v.codigo}" - ${motivos.join(', ')}`);
      }
      
      return isValidProduct;
    });

    console.log(`✅ Procesados ${variantes.length} productos válidos de la pestaña ${sheetName}`);
    return { variantes, headers, indices };
    
  } catch (error) {
    console.error(`❌ Error procesando pestaña ${sheetName}:`, error);
    return { variantes: [], error: error instanceof Error ? error.message : 'Error desconocido' };
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Sincronización automática de todas las pestañas...');
    
    // DETECCIÓN AUTOMÁTICA DE PESTAÑAS
    const pestañasDetectadas = await obtenerNombresPestañas();
    console.log(`📋 Total pestañas encontradas: ${pestañasDetectadas.length}`, pestañasDetectadas);
    
    // 🎯 FILTRO DE NEGOCIO: Procesar todas las pestañas reales
    const pestañasPermitidas = [
      'Policarbonato',
      'Perfiles Alveolar', 
      'Accesorios',
      'Rollos',
      'Industriales',
      'Accesorios Industriales'
    ];
    console.log('📝 Pestañas detectadas detalladamente:', pestañasDetectadas.map((p, i) => `${i+1}. "${p}"`));
    
    // Filtrar pestañas con coincidencia exacta O parcial (para manejar variaciones de nombres)
    const pestañasAProcessar = pestañasDetectadas.filter(pestaña => {
      // Coincidencia exacta
      if (pestañasPermitidas.includes(pestaña)) {
        return true;
      }
      
      // Coincidencia parcial para manejar variaciones
      const pestañaNormalizada = pestaña.toLowerCase().trim();
      const coincidenciaParcial = pestañasPermitidas.some(permitida => {
        const permitidaNormalizada = permitida.toLowerCase().trim();
        
        // Si cualquiera contiene la otra (ej: "Perfiles" coincide con "Perfiles Alveolar")
        return pestañaNormalizada.includes(permitidaNormalizada) || 
               permitidaNormalizada.includes(pestañaNormalizada);
      });
      
      return coincidenciaParcial;
    });
    
    console.log('✅ Pestañas que coinciden:', pestañasAProcessar);
    
    // Si no hay pestañas válidas, forzar las críticas
    if (pestañasAProcessar.length === 0) {
      console.log('🚀 No se encontraron pestañas válidas. Forzando pestañas críticas...');
      pestañasAProcessar.push('Perfiles Alveolar', 'Policarbonato');
    }
    
    console.log('🎯 Pestañas finales a procesar:', pestañasAProcessar);
    
    // Si aún no hay pestañas después del filtro mejorado, mostrar info de debug
    if (pestañasAProcessar.length === 0) {
      console.log('⚠️ PROBLEMA: No se encontraron pestañas válidas.');
      console.log('📝 Pestañas detectadas:', pestañasDetectadas);
      console.log('🎯 Pestañas esperadas:', pestañasPermitidas);
    }
    
    console.log('🎯 Pestañas permitidas configuradas:', pestañasPermitidas);
    console.log('✅ Pestañas que coinciden:', pestañasAProcessar);
    
    console.log(`🎯 Pestañas filtradas para web (Policarbonato, Perfiles, Accesorios): ${pestañasAProcessar.length}`, pestañasAProcessar);
    console.log(`❌ Pestañas excluidas: ${pestañasDetectadas.length - pestañasAProcessar.length}`, 
      pestañasDetectadas.filter(p => !pestañasPermitidas.includes(p))
    );
    
    // Procesar solo las pestañas permitidas
    const todasLasVariantes: any[] = [];
    const estadisticasPorPestaña: any[] = [];
    const pestañasProcesadas: string[] = [];
    const pestañasUnicas = new Map<string, string>(); // hash -> nombre de pestaña
    
    for (const sheetName of pestañasAProcessar) {
      const resultado = await procesarPestaña(sheetName);
      
      if (resultado.variantes.length > 0) {
        // Crear hash del contenido para detectar duplicados - usar solo códigos para ser más simple y efectivo
        const codigos = resultado.variantes.map(v => v.codigo).sort().join(',');
        const contenidoHash = `${resultado.variantes.length}-${codigos}`;
        
        // Solo procesar si es contenido único
        if (!pestañasUnicas.has(contenidoHash)) {
          pestañasUnicas.set(contenidoHash, sheetName);
          
          todasLasVariantes.push(...resultado.variantes);
          pestañasProcesadas.push(sheetName);
          
          // Estadísticas por pestaña
          const variantesPestaña = resultado.variantes;
          const disponiblesWeb = variantesPestaña.filter(v => v.disponible_en_web);
          const noDisponiblesWeb = variantesPestaña.filter(v => !v.disponible_en_web);
          
          estadisticasPorPestaña.push({
            pestaña: sheetName,
            cantidad: variantesPestaña.length,
            disponibles_web: disponiblesWeb.length,
            no_disponibles_web: noDisponiblesWeb.length,
            stock: variantesPestaña.reduce((sum, v) => sum + v.stock, 0),
            valorCosto: variantesPestaña.reduce((sum, v) => sum + (v.costo_proveedor * v.stock), 0),
            valorVenta: variantesPestaña.reduce((sum, v) => sum + (v.precio_neto * v.stock), 0),
            ganancia: variantesPestaña.reduce((sum, v) => sum + (v.ganancia * v.stock), 0),
            proveedores: [...new Set(variantesPestaña.map(v => v.proveedor))],
            tipos: [...new Set(variantesPestaña.map(v => v.tipo))],
            // NUEVAS ESTADÍSTICAS WEB
            productos_sin_sku: noDisponiblesWeb.filter(v => !v.tiene_sku_valido).length,
            productos_sin_stock: noDisponiblesWeb.filter(v => v.tiene_sku_valido && !v.tiene_stock_minimo).length
          });
        } else {
          console.log(`⚠️ Pestaña duplicada saltada: ${sheetName} (igual a ${pestañasUnicas.get(contenidoHash)})`);
        }
      }
    }

    console.log(`\n🎉 RESUMEN DE SINCRONIZACIÓN:`);
    console.log(`📊 Pestañas procesadas exitosamente: ${pestañasProcesadas.length}/${pestañasAProcessar.length}`);
    console.log(`🎯 Pestañas permitidas para web: Policarbonato y Perfiles únicamente`);
    console.log(`❌ Pestañas excluidas: ${pestañasDetectadas.length - pestañasAProcessar.length} (kits, herramientas, accesorios, etc.)`);
    console.log(`📦 Total de productos encontrados: ${todasLasVariantes.length}`);
    console.log(`📋 Pestañas con datos:`, pestañasProcesadas);

    // ANÁLISIS DE COMPETITIVIDAD (aplicado a todos los productos)
    const productosSimilares = todasLasVariantes.reduce((grupos, variante) => {
      // Usar campos separados ancho y largo si están disponibles, sino usar dimensiones
      const medidas = variante.ancho && variante.largo ? `${variante.ancho}x${variante.largo}` : variante.dimensiones;
      const claveProducto = `${variante.tipo}-${variante.espesor}-${variante.color}-${medidas}`.toLowerCase().replace(/\s+/g, '-');
      
      if (!grupos[claveProducto]) {
        grupos[claveProducto] = [];
      }
      
      grupos[claveProducto].push(variante);
      return grupos;
    }, {} as Record<string, any[]>);

    // Identificar mejor proveedor por producto
    const analisisProveedores = Object.entries(productosSimilares).map(([clave, variantes]) => {
      const variantesConAnalisis = variantes.map(v => ({
        ...v,
        es_mas_economico: false,
        diferencia_precio: 0
      }));

      const masEconomico = variantesConAnalisis.reduce((min, actual) => 
        actual.costo_proveedor < min.costo_proveedor ? actual : min
      );

      variantesConAnalisis.forEach(v => {
        v.es_mas_economico = v.codigo === masEconomico.codigo;
        v.diferencia_precio = v.costo_proveedor - masEconomico.costo_proveedor;
      });

      return {
        producto_clave: clave,
        producto_nombre: `${masEconomico.tipo} ${masEconomico.espesor} ${masEconomico.color} ${masEconomico.ancho && masEconomico.largo ? `${masEconomico.ancho}x${masEconomico.largo}` : masEconomico.dimensiones}`,
        total_proveedores: variantesConAnalisis.length,
        proveedor_mas_economico: masEconomico.proveedor,
        precio_mas_bajo: masEconomico.costo_proveedor,
        variantes: variantesConAnalisis
      };
    });

    // Agrupar por categoría/pestaña y tipo
    const productosPorCategoria = pestañasProcesadas.reduce((categorias, pestaña) => {
      const nombreCategoria = obtenerNombreCategoria(pestaña); // Convertir a nombre amigable
      const variantesPestaña = todasLasVariantes.filter(v => v.pestaña_origen === pestaña);
      
      // Agrupar por tipo dentro de la pestaña
      const variantesPorTipo = variantesPestaña.reduce((grupos, variante) => {
        const tipo = variante.tipo || 'Producto';
        if (!grupos[tipo]) {
          grupos[tipo] = [];
        }
        
        // Encontrar análisis de este producto
        const analisisProducto = analisisProveedores.find(a => 
          a.variantes.some(v => v.codigo === variante.codigo)
        );
        
        const varianteEnAnalisis = analisisProducto?.variantes.find(v => v.codigo === variante.codigo);
        
        grupos[tipo].push({
          codigo: variante.codigo,
          nombre: `${nombreCategoria} ${tipo} ${variante.espesor} ${variante.color} ${variante.ancho}x${variante.largo}`.trim(),
          espesor: variante.espesor,
          color: variante.color,
          // Campos separados de medidas
          ancho: variante.ancho,
          largo: variante.largo,
          // Mantener dimensiones para compatibilidad
          dimensiones: variante.dimensiones,
          costo_proveedor: variante.costo_proveedor,
          precio_neto: variante.precio_neto,
          precio_con_iva: variante.precio_con_iva,
          ganancia: variante.ganancia,
          margen_ganancia: variante.margen_ganancia,
          stock: variante.stock,
          proveedor: variante.proveedor,
          uso: variante.uso,
          uv_protection: variante.uv_protection,
          garantia: variante.garantia,
          pestaña_origen: variante.pestaña_origen,
          categoria: nombreCategoria, // Agregar categoría amigable
          es_mas_economico: varianteEnAnalisis?.es_mas_economico || false,
          diferencia_precio: varianteEnAnalisis?.diferencia_precio || 0,
          competidores: analisisProducto?.total_proveedores || 1,
          // CAMPOS DE DISPONIBILIDAD WEB
          disponible_en_web: variante.disponible_en_web,
          tiene_sku_valido: variante.tiene_sku_valido,
          tiene_stock_minimo: variante.tiene_stock_minimo,
          tiene_imagen: variante.tiene_imagen,
          ruta_imagen: variante.ruta_imagen,
          motivo_no_disponible: variante.motivo_no_disponible
        });
        return grupos;
      }, {} as Record<string, any[]>);
      
      // Crear productos agrupados por tipo para esta categoría
      const productosCategoria = Object.entries(variantesPorTipo).map(([tipo, variantes]) => ({
        id: `${nombreCategoria.toLowerCase().replace(/\s+/g, '-')}-${tipo.toLowerCase().replace(/\s+/g, '-')}`,
        nombre: `${nombreCategoria} ${tipo}`,
        descripcion: `${tipo} de la categoría ${nombreCategoria} disponible en diferentes especificaciones`,
        categoria: nombreCategoria,
        tipo: tipo,
        variantes: variantes
      }));
      
      categorias[nombreCategoria] = productosCategoria;
      return categorias;
    }, {} as Record<string, any[]>);

    // Estructura final combinando todas las categorías
    const updatedProducts = {
      productos_por_categoria: productosPorCategoria,
      // Mantener compatibilidad con la estructura anterior
      productos_policarbonato: productosPorCategoria['Sheet1'] || productosPorCategoria['Policarbonato'] || []
    };

    // Estadísticas generales
    const proveedores = [...new Set(todasLasVariantes.map(v => v.proveedor))];
    const tipos = [...new Set(todasLasVariantes.map(v => v.tipo))];
    
    // PRIORIDAD 1: Sincronizar con Supabase
    let supabaseStats = null;
    if (supabaseAdmin) {
      try {
        console.log('🔄 Sincronizando con Supabase...');
        
        // PASO 1: Limpiar productos obsoletos con SKUs inválidos
        console.log('🧹 Limpiando productos con SKUs inválidos de sincronizaciones anteriores...');
        const textosInvalidosParaDb = [
          'aplicación típica', 'aplicacion tipica', 'típica', 'tipica',
          'descripción', 'descripcion', 'detalle', 'información', 'informacion',
          'uso típico', 'uso tipico', 'usos', 'características', 'caracteristicas',
          'especificaciones', 'especificacion', 'notas', 'observaciones',
          'medidas típicas', 'medidas tipicas', 'dimensiones típicas',
          'colores disponibles', 'colores', 'acabados', 'terminaciones',
          'instalación', 'instalacion', 'montaje', 'aplicaciones',
          'ventajas', 'beneficios', 'propiedades', 'garantía', 'garantia'
        ];
        
        // Construir condiciones OR para cada texto inválido
        let deleteConditions = textosInvalidosParaDb.map(texto => 
          `codigo.ilike.%${texto}%`
        ).join(',');
        
        // Obtener productos actuales para identificar cuáles eliminar
        try {
          // Obtener todos los productos actuales
          const { data: productosActuales, error: getError } = await supabaseAdmin
            .from('productos')
            .select('codigo, nombre');
          
          if (getError) {
            console.warn('⚠️ Error obteniendo productos actuales:', getError.message);
          } else if (productosActuales) {
            // Filtrar productos con SKUs inválidos
            const skusAEliminar = productosActuales.filter(p => {
              const codigo = (p.codigo || '').toLowerCase();
              
              // Verificar si contiene textos inválidos
              const contieneTextoInvalido = textosInvalidosParaDb.some(texto => 
                codigo.includes(texto.toLowerCase())
              );
              
              // Verificar si es muy corto o no tiene patrón de SKU
              const esMuyCorto = codigo.length < 3;
              const noTienePatronSku = !/[0-9A-Z]/.test(p.codigo || '');
              
              return contieneTextoInvalido || esMuyCorto || noTienePatronSku;
            }).map(p => p.codigo);
            
            if (skusAEliminar.length > 0) {
              console.log(`🗑️ Eliminando ${skusAEliminar.length} productos con SKUs inválidos:`, skusAEliminar);
              
              // Eliminar productos identificados
              const { error: deleteError } = await supabaseAdmin
                .from('productos')
                .delete()
                .in('codigo', skusAEliminar);
              
              if (deleteError) {
                console.warn('⚠️ Error eliminando productos inválidos:', deleteError.message);
              } else {
                console.log(`✅ ${skusAEliminar.length} productos con SKUs inválidos eliminados correctamente`);
              }
            } else {
              console.log('✅ No se encontraron productos con SKUs inválidos para eliminar');
            }
          }
        } catch (cleanError) {
          console.warn('⚠️ Error en limpieza automática:', cleanError.message);
        }
        
        // PASO 2: Obtener precios anteriores desde Supabase para detectar cambios
        console.log('🔍 Obteniendo precios anteriores para detección de cambios...');
        const { data: preciosAnteriores, error: preciosError } = await supabaseAdmin
          .from('productos')
          .select('codigo, precio_con_iva');
        
        const mapaPreciosAnteriores = new Map();
        if (!preciosError && preciosAnteriores) {
          preciosAnteriores.forEach(p => {
            mapaPreciosAnteriores.set(p.codigo, p.precio_con_iva);
          });
        }
        
        // Preparar datos para Supabase con validaciones estrictas
        const productosParaSupabase = todasLasVariantes.map(v => {
          // Formatear dimensiones con unidades correctas
          // Debug: verificar largo antes de formatear
          if ((v.largo || '').toString().includes('3.66')) {
            console.log('🔧 ANTES DE FORMATEAR - Largo original:', v.largo);
          }
          
          const espesorFormateado = formatearDimension(v.espesor || '', 'espesor');
          const anchoFormateado = formatearDimension(v.ancho || '', 'ancho');
          const largoFormateado = formatearDimension(v.largo || '', 'largo');
          
          // Debug: verificar largo después de formatear
          if ((v.largo || '').toString().includes('3.66')) {
            console.log('🔧 DESPUÉS DE FORMATEAR - Largo formateado:', largoFormateado);
          }
          
          // Obtener precio anterior para detección de cambios
          const precioAnterior = mapaPreciosAnteriores.get(v.codigo) || 0;
          const cambioPrecio = detectarCambioPrecio(v.precio_con_iva || 0, precioAnterior);
          
          // Aplicar validación completa para web
          const validacion = validarProductoParaWeb({
            codigo: v.codigo,
            espesor: espesorFormateado,
            ancho: anchoFormateado,
            largo: largoFormateado,
            stock: v.stock || 0,
            ruta_imagen: v.ruta_imagen || '',
            precio_con_iva: v.precio_con_iva || 0,
            precio_anterior: precioAnterior,
            tiene_imagen: v.tiene_imagen
          });
          
          return {
            codigo: v.codigo,
            nombre: v.nombre,
            categoria: v.categoria,
            tipo: v.tipo,
            espesor: espesorFormateado,
            ancho: anchoFormateado,
            largo: largoFormateado,
            color: v.color || '',
            uso: v.uso || '',
            costo_proveedor: v.costo_proveedor || 0,
            precio_neto: v.precio_neto || 0,
            precio_con_iva: v.precio_con_iva || 0,
            ganancia: v.ganancia || 0,
            margen_ganancia: v.margen_ganancia || '0%',
            factor_venta_sobre_costo: v.factor_venta_sobre_costo || 100, // NUEVO CAMPO
            stock: v.stock || 0,
            proveedor: v.proveedor || 'Leker',
            pestaña_origen: v.pestaña_origen || 'Sheet1',
            orden_original: v.orden_original || 0,
            
            // VALIDACIONES ESTRICTAS NUEVAS
            precio_anterior: precioAnterior,
            tiene_cambio_precio: cambioPrecio.tieneCambio,
            fecha_cambio_precio: cambioPrecio.tieneCambio ? new Date().toISOString() : null,
            porcentaje_cambio_precio: cambioPrecio.porcentajeCambio || 0,
            dimensiones_completas: validacion.dimensionesCompletas,
            cumple_stock_minimo: validacion.cumpleStockMinimo,
            motivos_no_disponible_web: validacion.motivos.length > 0 ? validacion.motivos : null,
            
            // VALIDACIONES EXISTENTES ACTUALIZADAS
            disponible_en_web: validacion.isValid, // Solo disponible si pasa TODAS las validaciones
            tiene_sku_valido: v.codigo && v.codigo !== `${v.pestaña_origen}-`,
            tiene_stock_minimo: validacion.cumpleStockMinimo,
            tiene_imagen: validacion.tieneImagenValida,
            ruta_imagen: v.ruta_imagen || null,
            motivo_no_disponible: validacion.isValid ? null : validacion.motivos.join(', '),
            updated_at: new Date().toISOString()
          };
        });

        // Verificar estructura de tabla primero
        console.log('🔍 Verificando estructura de tabla...');
        
        // Intentar obtener un registro para ver qué columnas existen
        const { data: sampleData, error: sampleError } = await supabaseAdmin
          .from('productos')
          .select('*')
          .limit(1);

        // Verificar si la nueva columna existe
        let tieneColumnaFactor = false;
        if (!sampleError && sampleData && sampleData.length > 0) {
          tieneColumnaFactor = 'factor_venta_sobre_costo' in sampleData[0];
          console.log(`🔍 Columna factor_venta_sobre_costo ${tieneColumnaFactor ? 'EXISTE' : 'NO EXISTE'} en Supabase`);
        }

        if (sampleError && !sampleError.message.includes('0 rows')) {
          console.error('❌ Error accediendo a tabla productos:', sampleError);
          supabaseStats = { success: false, error: sampleError.message };
        } else {
          // Preparar datos completos para Supabase 
          const productosCompletos = productosParaSupabase.map(producto => {
            // Si la tabla no tiene la columna factor_venta_sobre_costo, excluirla temporalmente
            if (!tieneColumnaFactor) {
              const { factor_venta_sobre_costo, ...productoSinFactor } = producto;
              return productoSinFactor;
            }
            return producto;
          });

          // Usar upsert para evitar problemas de duplicados
          console.log(`📦 Sincronizando ${productosCompletos.length} productos con estructura ${tieneColumnaFactor ? 'completa (con factor)' : 'sin factor_venta_sobre_costo'} (upsert)...`);
          
          if (!tieneColumnaFactor) {
            console.log('⚠️ NOTA: Campo factor_venta_sobre_costo excluido - ejecutar: ALTER TABLE productos ADD COLUMN factor_venta_sobre_costo NUMERIC DEFAULT 100;');
          }
          
          // Upsert de a lotes para evitar timeouts
          const batchSize = 10; // Reducido para datos más complejos
          let inserted = 0;
          let errors = 0;
          
          for (let i = 0; i < productosCompletos.length; i += batchSize) {
            const batchProducts = productosCompletos.slice(i, i + batchSize);
            
            // Filtrar duplicados dentro del mismo lote por codigo
            const uniqueProductsMap = new Map();
            batchProducts.forEach(p => {
              if (!uniqueProductsMap.has(p.codigo)) {
                uniqueProductsMap.set(p.codigo, p);
              } else {
                console.warn(`⚠️ Duplicado encontrado en lote: ${p.codigo} - usando la primera ocurrencia`);
              }
            });
            
            const batch = Array.from(uniqueProductsMap.values()).map(p => ({
              ...p,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
            
            const { error: batchError } = await supabaseAdmin
              .from('productos')
              .upsert(batch, { onConflict: 'codigo' });

            if (batchError) {
              console.error(`❌ Error en lote ${i / batchSize + 1}:`, batchError.message);
              errors += batch.length;
            } else {
              inserted += batch.length;
              console.log(`✅ Lote ${i / batchSize + 1} insertado (${batch.length} productos)`);
            }
          }

          if (errors === 0) {
            console.log(`✅ Todos los productos sincronizados con Supabase (${inserted})`);
            supabaseStats = { 
              success: true, 
              inserted: inserted,
              errors: errors,
              timestamp: new Date().toISOString()
            };
          } else {
            console.log(`⚠️ Sincronización parcial: ${inserted} exitosos, ${errors} errores`);
            supabaseStats = { 
              success: false, 
              inserted: inserted,
              errors: errors,
              error: `${errors} productos no se pudieron insertar`,
              timestamp: new Date().toISOString()
            };
          }
        }
      } catch (supabaseError) {
        console.error('❌ Error en sincronización Supabase:', supabaseError);
        supabaseStats = { success: false, error: supabaseError.message };
      }
    } else {
      console.warn('⚠️ Supabase admin client no disponible');
      supabaseStats = { success: false, error: 'Supabase no configurado' };
    }
    
    // BACKUP: Guardar archivo JSON como respaldo
    const filePath = path.join(process.cwd(), 'src', 'data', 'productos-policarbonato.json');
    const backupPath = path.join(process.cwd(), 'src', 'data', `productos-backup-${Date.now()}.json`);
    
    try {
      // Crear backup del archivo actual
      if (fs.existsSync(filePath)) {
        const currentData = fs.readFileSync(filePath, 'utf8');
        fs.writeFileSync(backupPath, currentData, 'utf8');
        console.log('💾 Backup JSON creado:', path.basename(backupPath));
      }
      
      // Guardar nuevos datos como JSON de respaldo
      fs.writeFileSync(filePath, JSON.stringify(updatedProducts, null, 2), 'utf8');
      console.log('💾 Archivo JSON de respaldo actualizado');
    } catch (jsonError) {
      console.warn('⚠️ Error guardando backup JSON:', jsonError);
    }

    // Estadísticas de competitividad
    const productosConCompetencia = analisisProveedores.filter(a => a.total_proveedores > 1);
    const ahorrosPotenciales = analisisProveedores
      .flatMap(a => a.variantes.filter(v => !v.es_mas_economico))
      .reduce((sum, v) => sum + (v.diferencia_precio * v.stock), 0);

    // Calcular estadísticas de disponibilidad web
    const productosDisponiblesWeb = todasLasVariantes.filter(v => v.disponible_en_web);
    const productosNoDisponiblesWeb = todasLasVariantes.filter(v => !v.disponible_en_web);
    
    // Calcular estadísticas generales
    const stats = {
      // Información general
      totalPestañasProcesadas: pestañasProcesadas.length,
      totalPestañasDetectadas: pestañasDetectadas.length,
      pestañasProcesadas: pestañasProcesadas,
      totalTiposProductos: tipos.length,
      totalVariantes: todasLasVariantes.length,
      totalProveedores: proveedores.length,
      totalStock: todasLasVariantes.reduce((sum, v) => sum + v.stock, 0),
      
      // NUEVAS ESTADÍSTICAS WEB
      productosDisponiblesWeb: productosDisponiblesWeb.length,
      productosNoDisponiblesWeb: productosNoDisponiblesWeb.length,
      porcentajeDisponibilidadWeb: ((productosDisponiblesWeb.length / todasLasVariantes.length) * 100).toFixed(2) + '%',
      stockDisponibleWeb: productosDisponiblesWeb.reduce((sum, v) => sum + v.stock, 0),
      valorInventarioDisponibleWeb: productosDisponiblesWeb.reduce((sum, v) => sum + (v.costo_proveedor * v.stock), 0),
      
      // Información financiera
      valorInventarioCosto: todasLasVariantes.reduce((sum, v) => sum + (v.costo_proveedor * v.stock), 0),
      valorInventarioVenta: todasLasVariantes.reduce((sum, v) => sum + (v.precio_neto * v.stock), 0),
      gananciaTotal: todasLasVariantes.reduce((sum, v) => sum + (v.ganancia * v.stock), 0),
      
      // Análisis de competitividad
      analisis_competitividad: {
        productos_unicos: analisisProveedores.length,
        productos_con_competencia: productosConCompetencia.length,
        productos_monopolio: analisisProveedores.length - productosConCompetencia.length,
        ahorro_potencial_total: ahorrosPotenciales,
        resumen_competencia: analisisProveedores.map(a => ({
          producto: a.producto_nombre,
          proveedores_disponibles: a.total_proveedores,
          proveedor_mas_economico: a.proveedor_mas_economico,
          precio_mas_bajo: a.precio_mas_bajo,
          diferencia_maxima: Math.max(...a.variantes.map(v => v.diferencia_precio))
        })).filter(r => r.proveedores_disponibles > 1)
      },
      
      // NUEVAS ESTADÍSTICAS POR PESTAÑA
      estadisticasPorPestaña: estadisticasPorPestaña,
      estadisticasPorTipo: tipos.map(tipo => {
        const variantesTipo = todasLasVariantes.filter(v => v.tipo === tipo);
        return {
          tipo,
          cantidad: variantesTipo.length,
          stock: variantesTipo.reduce((sum, v) => sum + v.stock, 0),
          valorCosto: variantesTipo.reduce((sum, v) => sum + (v.costo_proveedor * v.stock), 0),
          valorVenta: variantesTipo.reduce((sum, v) => sum + (v.precio_neto * v.stock), 0),
          ganancia: variantesTipo.reduce((sum, v) => sum + (v.ganancia * v.stock), 0)
        };
      }),
      estadisticasPorProveedor: proveedores.map(proveedor => {
        const productosProveedor = todasLasVariantes.filter(v => v.proveedor === proveedor);
        return {
          proveedor,
          cantidad: productosProveedor.length,
          stock: productosProveedor.reduce((sum, v) => sum + v.stock, 0),
          valorCosto: productosProveedor.reduce((sum, v) => sum + (v.costo_proveedor * v.stock), 0),
          valorVenta: productosProveedor.reduce((sum, v) => sum + (v.precio_neto * v.stock), 0),
          ganancia: productosProveedor.reduce((sum, v) => sum + (v.ganancia * v.stock), 0)
        };
      }),
      
      sincronizadoEn: new Date().toISOString(),
      fuente: 'google_sheets_csv_multi_tab',
      pestañas_sincronizadas: pestañasProcesadas
    };

    console.log('📊 Sincronización completada:', stats);
    console.log('🗄️ Estado Supabase:', supabaseStats);

    return NextResponse.json({
      success: true,
      message: `🎉 Sincronización completada: ${pestañasProcesadas.length} pestañas procesadas (solo Policarbonato y Perfiles)`,
      stats,
      backupCreated: path.basename(backupPath),
      instructions: `Se procesaron ${pestañasProcesadas.length} pestañas permitidas: ${pestañasProcesadas.join(', ')}. Excluidas ${pestañasDetectadas.length - pestañasAProcessar.length} pestañas (kits, herramientas, accesorios). Solo Policarbonato y Perfiles aparecen en web.`,
      supabase_sync: supabaseStats,
      pricing_info: {
        costo_proveedor: 'Precio del proveedor desde la columna "Costo por proveedor"',
        factor_venta_sobre_costo: 'Factor aplicado sobre el costo para determinar precio de venta (ej: 140% = costo × 1.40)',
        precio_neto: 'Precio de venta sin IVA calculado usando: Costo × (Factor/100)',
        precio_con_iva: 'Precio final con IVA para el cliente (precio_neto × 1.19)',
        ganancia: 'Diferencia entre precio de venta y costo del proveedor',
        margen_ganancia: 'Porcentaje de ganancia sobre el precio de venta',
        formula_calculo: 'Precio Venta = Costo Proveedor × (Factor Venta Sobre Costo / 100)'
      }
    });

  } catch (error) {
    console.error('❌ Error en sincronización CSV múltiples pestañas:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error interno en la sincronización CSV',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}