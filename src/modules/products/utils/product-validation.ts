/**
 * Utilidades para validación estricta de productos
 * Implementa todos los requisitos para que un producto aparezca en la web
 */

export interface ProductValidationResult {
  isValid: boolean;
  motivos: string[];
  dimensionesCompletas: boolean;
  cumpleStockMinimo: boolean;
  tieneImagenValida: boolean;
  tieneCambioPrecio: boolean;
  porcentajeCambio?: number;
}

export interface ProductData {
  codigo: string;
  espesor: string;
  ancho: string;
  largo: string;
  stock: number;
  ruta_imagen: string;
  precio_con_iva: number;
  precio_anterior?: number;
  tiene_imagen?: boolean;
}

/**
 * Valida si las dimensiones están completas y tienen unidades
 */
export function validarDimensiones(espesor: string, ancho: string, largo: string): {
  esValido: boolean;
  motivos: string[];
} {
  const motivos: string[] = [];
  
  // Validar espesor (debe tener mm)
  if (!espesor || espesor.trim() === '' || espesor === '0') {
    motivos.push('Espesor no especificado');
  } else if (!espesor.includes('mm')) {
    motivos.push('Espesor sin unidad (mm)');
  }
  
  // Validar ancho (debe tener cm o m)
  if (!ancho || ancho.trim() === '' || ancho === '0') {
    motivos.push('Ancho no especificado');
  } else if (!ancho.includes('cm') && !ancho.includes('m')) {
    motivos.push('Ancho sin unidad (cm/m)');
  }
  
  // Validar largo (debe tener cm o m)  
  if (!largo || largo.trim() === '' || largo === '0') {
    motivos.push('Largo no especificado');
  } else if (!largo.includes('cm') && !largo.includes('m')) {
    motivos.push('Largo sin unidad (cm/m)');
  }
  
  return {
    esValido: motivos.length === 0,
    motivos
  };
}

/**
 * Valida si la imagen existe y es válida
 */
export function validarImagen(rutaImagen: string, tieneImagen?: boolean): {
  esValida: boolean;
  motivo?: string;
} {
  // Si no hay ruta de imagen
  if (!rutaImagen || rutaImagen.trim() === '') {
    return {
      esValida: false,
      motivo: 'Sin ruta de imagen especificada'
    };
  }
  
  // Si el flag dice que no tiene imagen
  if (tieneImagen === false) {
    return {
      esValida: false,
      motivo: 'Imagen marcada como no disponible'
    };
  }
  
  // Validar que tenga extensión de imagen válida
  const extensionesValidas = ['.webp', '.jpg', '.jpeg', '.png'];
  const tieneExtensionValida = extensionesValidas.some(ext => 
    rutaImagen.toLowerCase().includes(ext)
  );
  
  if (!tieneExtensionValida) {
    return {
      esValida: false,
      motivo: 'Formato de imagen inválido (usar .webp, .jpg, .png)'
    };
  }
  
  return { esValida: true };
}

/**
 * Valida el stock mínimo
 */
export function validarStock(stock: number): {
  cumple: boolean;
  motivo?: string;
} {
  const STOCK_MINIMO = 10;
  
  if (stock < STOCK_MINIMO) {
    return {
      cumple: false,
      motivo: `Stock insuficiente (${stock}/${STOCK_MINIMO} mínimo)`
    };
  }
  
  return { cumple: true };
}

/**
 * Detecta cambios de precio
 */
export function detectarCambioPrecio(precioActual: number, precioAnterior?: number): {
  tieneCambio: boolean;
  porcentajeCambio: number;
  tipoCambio?: 'aumento' | 'descuento';
} {
  if (!precioAnterior || precioAnterior === 0) {
    return {
      tieneCambio: false,
      porcentajeCambio: 0
    };
  }
  
  if (precioActual === precioAnterior) {
    return {
      tieneCambio: false,
      porcentajeCambio: 0
    };
  }
  
  const porcentajeCambio = ((precioActual - precioAnterior) / precioAnterior) * 100;
  
  return {
    tieneCambio: true,
    porcentajeCambio: Math.round(porcentajeCambio * 100) / 100, // 2 decimales
    tipoCambio: porcentajeCambio > 0 ? 'aumento' : 'descuento'
  };
}

/**
 * Validación completa de producto para web
 */
export function validarProductoParaWeb(producto: ProductData): ProductValidationResult {
  const motivos: string[] = [];
  
  // Validar dimensiones
  const validacionDimensiones = validarDimensiones(
    producto.espesor, 
    producto.ancho, 
    producto.largo
  );
  
  if (!validacionDimensiones.esValido) {
    motivos.push(...validacionDimensiones.motivos);
  }
  
  // Validar imagen
  const validacionImagen = validarImagen(producto.ruta_imagen, producto.tiene_imagen);
  
  if (!validacionImagen.esValida) {
    motivos.push(validacionImagen.motivo!);
  }
  
  // Validar stock
  const validacionStock = validarStock(producto.stock);
  
  if (!validacionStock.cumple) {
    motivos.push(validacionStock.motivo!);
  }
  
  // Detectar cambio de precio
  const cambioPrecio = detectarCambioPrecio(producto.precio_con_iva, producto.precio_anterior);
  
  return {
    isValid: motivos.length === 0,
    motivos,
    dimensionesCompletas: validacionDimensiones.esValido,
    cumpleStockMinimo: validacionStock.cumple,
    tieneImagenValida: validacionImagen.esValida,
    tieneCambioPrecio: cambioPrecio.tieneCambio,
    porcentajeCambio: cambioPrecio.porcentajeCambio
  };
}

/**
 * Formatear dimensión con unidades correctas
 * Interpreta correctamente los valores del Excel chileno:
 * - Espesor: siempre en milímetros (ej: 0.5 → 0.5mm, 4 → 4mm)
 * - Ancho/Largo: valores < 1 son centímetros, >= 1 son metros
 *   - 0.81 → 81cm (81 centímetros)
 *   - 2.10 → 2.10m (2.10 metros)
 */
export function formatearDimension(valor: string, tipo: 'espesor' | 'ancho' | 'largo'): string {
  if (!valor || valor.trim() === '' || valor === '0') {
    return '';
  }
  
  // Convertir a string y limpiar
  let valorStr = valor.toString().trim();
  
  // Si ya tiene formato correcto, devolverlo
  if (valorStr.match(/^\d+(\.\d+)?mm$/)) return valorStr; // ej: "4mm", "0.5mm"  
  if (valorStr.match(/^\d+(\.\d+)?cm$/)) return valorStr; // ej: "81cm"
  if (valorStr.match(/^\d+(\.\d+)?m$/)) return valorStr;  // ej: "2.10m"
  
  // Extraer solo el número (eliminar cualquier unidad existente)
  let numeroStr = valorStr.replace(/[a-zA-Z]/g, '');
  // Convertir coma decimal a punto para parseFloat
  numeroStr = numeroStr.replace(',', '.');
  const num = parseFloat(numeroStr);
  
  if (isNaN(num) || num === 0) {
    return '';
  }
  
  // Aplicar formato según el tipo
  if (tipo === 'espesor') {
    return `${num}mm`;
  }
  
  // LÓGICA CORREGIDA para ancho y largo:
  // - Si el valor es < 1, interpretarlo como centímetros (convertir 0.81 → 81cm)
  // - Si el valor es >= 1, interpretarlo como metros (mantener 2.10 → 2.10m)
  if (num < 1) {
    // El valor del Excel representa centímetros (0.81 = 81cm)
    const centimetros = Math.round(num * 100);
    return `${centimetros}cm`;
  } else {
    // El valor del Excel representa metros (2.10 = 2.10m)
    return `${num.toFixed(2)}m`;
  }
}