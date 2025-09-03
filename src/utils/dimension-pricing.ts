/**
 * Utilidades para cálculo de precios basados en dimensiones
 * Maneja la lógica específica de productos como Policarbonato Alveolar
 * donde el precio se debe calcular según el área real del producto
 */

export interface DimensionConstraints {
  category: string;
  type: string;
  availableWidths: number[]; // En metros
  availableLengths: number[]; // En metros
  minArea?: number; // Área mínima en m²
  pricePerSqMeter?: number; // Precio por metro cuadrado
}

// Definición de restricciones por producto
export const PRODUCT_CONSTRAINTS: DimensionConstraints[] = [
  {
    category: 'Policarbonato',
    type: 'Alveolar',
    availableWidths: [1.05, 2.10], // Anchos específicos en metros
    availableLengths: [3.00, 5.80, 6.00], // Largos disponibles en metros
    minArea: 1.0, // Área mínima 1m²
  },
  {
    category: 'Policarbonato', 
    type: 'Compacto',
    availableWidths: [2.05], // Ancho estándar
    availableLengths: [3.05, 6.10], // Largos disponibles
    minArea: 1.0,
  },
  {
    category: 'Policarbonato',
    type: 'Ondulado',
    availableWidths: [1.05], // Ancho específico
    availableLengths: [2.00, 3.00, 6.00], // Largos disponibles
    minArea: 1.0,
  }
];

/**
 * Convierte una dimensión string a número en metros
 */
export function parseDimensionToMeters(dimension: string): number {
  if (!dimension || dimension === '' || dimension === 'N/A') return 0;
  
  // Limpiar y normalizar
  let cleanDimension = dimension.toString().trim().toLowerCase();
  
  // Reemplazar coma decimal con punto
  cleanDimension = cleanDimension.replace(',', '.');
  
  // Extraer número y unidad
  const match = cleanDimension.match(/^(\d+(?:\.\d+)?)\s*(mm|cm|mts?|m)?$/);
  
  if (!match) return 0;
  
  const value = parseFloat(match[1]);
  const unit = match[2] || 'm';
  
  // Convertir a metros
  switch (unit) {
    case 'mm':
      return value / 1000;
    case 'cm':
      return value / 100;
    case 'mts':
    case 'mt':
    case 'm':
    default:
      return value;
  }
}

/**
 * Calcula el área de un producto en metros cuadrados
 */
export function calculateProductArea(width: string | number, length: string | number): number {
  const widthMeters = typeof width === 'string' ? parseDimensionToMeters(width) : width;
  const lengthMeters = typeof length === 'string' ? parseDimensionToMeters(length) : length;
  
  if (widthMeters <= 0 || lengthMeters <= 0) return 0;
  
  return widthMeters * lengthMeters;
}

/**
 * Valida si las dimensiones están disponibles para un producto específico
 */
export function validateProductDimensions(
  category: string, 
  type: string, 
  width: string | number, 
  length: string | number
): {
  isValid: boolean;
  availableWidths: number[];
  availableLengths: number[];
  suggestedWidth?: number;
  suggestedLength?: number;
  message?: string;
} {
  const constraints = PRODUCT_CONSTRAINTS.find(
    c => c.category === category && c.type === type
  );
  
  if (!constraints) {
    return {
      isValid: true,
      availableWidths: [],
      availableLengths: []
    };
  }
  
  const widthMeters = typeof width === 'string' ? parseDimensionToMeters(width) : width;
  const lengthMeters = typeof length === 'string' ? parseDimensionToMeters(length) : length;
  
  const widthValid = constraints.availableWidths.includes(widthMeters);
  const lengthValid = constraints.availableLengths.includes(lengthMeters);
  
  let message = '';
  let suggestedWidth = constraints.availableWidths[0];
  let suggestedLength = constraints.availableLengths[0];
  
  if (!widthValid && !lengthValid) {
    message = `${type} ${category} disponible en anchos: ${constraints.availableWidths.join('m, ')}m y largos: ${constraints.availableLengths.join('m, ')}m`;
  } else if (!widthValid) {
    message = `Ancho ${widthMeters}m no disponible. Anchos disponibles: ${constraints.availableWidths.join('m, ')}m`;
  } else if (!lengthValid) {
    message = `Largo ${lengthMeters}m no disponible. Largos disponibles: ${constraints.availableLengths.join('m, ')}m`;
  }
  
  return {
    isValid: widthValid && lengthValid,
    availableWidths: constraints.availableWidths,
    availableLengths: constraints.availableLengths,
    suggestedWidth,
    suggestedLength,
    message
  };
}

/**
 * Calcula el precio correcto basado en el área del producto
 * Esto es especialmente importante para productos que se venden por metro cuadrado
 */
export function calculateAreaBasedPrice(
  basePrice: number,
  width: string | number,
  length: string | number,
  category: string = '',
  type: string = ''
): {
  finalPrice: number;
  area: number;
  pricePerSqMeter: number;
  calculation: string;
} {
  const area = calculateProductArea(width, length);
  
  if (area <= 0) {
    return {
      finalPrice: basePrice,
      area: 0,
      pricePerSqMeter: 0,
      calculation: 'Dimensiones inválidas - precio base aplicado'
    };
  }
  
  // Para productos específicos, el precio base puede ser por metro cuadrado
  // o puede necesitar ajuste según el área estándar
  const constraints = PRODUCT_CONSTRAINTS.find(
    c => c.category === category && c.type === type
  );
  
  if (constraints && constraints.pricePerSqMeter) {
    // Si hay precio por m² definido, usar ese
    const finalPrice = constraints.pricePerSqMeter * area;
    return {
      finalPrice,
      area,
      pricePerSqMeter: constraints.pricePerSqMeter,
      calculation: `${constraints.pricePerSqMeter.toLocaleString('es-CL')} x ${area.toFixed(2)}m²`
    };
  }
  
  // Si no hay precio por m² específico, asumir que el precio base es para el área actual
  // Esto mantiene la compatibilidad con el sistema existente
  const pricePerSqMeter = area > 0 ? basePrice / area : basePrice;
  
  return {
    finalPrice: basePrice, // Mantener precio original si no hay restricciones específicas
    area,
    pricePerSqMeter,
    calculation: `Precio estándar para ${area.toFixed(2)}m²`
  };
}

/**
 * Obtiene las dimensiones disponibles para una categoría y tipo específico
 */
export function getAvailableDimensions(category: string, type: string): {
  widths: number[];
  lengths: number[];
  hasConstraints: boolean;
} {
  const constraints = PRODUCT_CONSTRAINTS.find(
    c => c.category === category && c.type === type
  );
  
  if (!constraints) {
    return {
      widths: [],
      lengths: [],
      hasConstraints: false
    };
  }
  
  return {
    widths: constraints.availableWidths,
    lengths: constraints.availableLengths,
    hasConstraints: true
  };
}

/**
 * Formatea dimensiones para mostrar al usuario con unidades apropiadas
 */
export function formatDimensionForDisplay(meters: number): string {
  if (meters === 0) return '0m';
  
  // Para valores muy pequeños (< 10mm), mostrar en mm
  if (meters < 0.01) {
    return `${Math.round(meters * 1000)}mm`;
  }
  
  // Para valores pequeños (< 1m), mostrar en cm
  if (meters < 1) {
    return `${Math.round(meters * 100)}cm`;
  }
  
  // Para valores >= 1m, mostrar en metros con 2 decimales máximo
  return `${meters.toFixed(2).replace(/\.?0+$/, '')}m`;
}

/**
 * Obtiene información completa de dimensiones y precio para un producto
 */
export function getProductDimensionInfo(
  category: string,
  type: string,
  width: string | number,
  length: string | number,
  basePrice: number
) {
  const validation = validateProductDimensions(category, type, width, length);
  const pricing = calculateAreaBasedPrice(basePrice, width, length, category, type);
  const dimensions = getAvailableDimensions(category, type);
  
  return {
    ...validation,
    ...pricing,
    availableDimensions: dimensions,
    widthFormatted: formatDimensionForDisplay(
      typeof width === 'string' ? parseDimensionToMeters(width) : width
    ),
    lengthFormatted: formatDimensionForDisplay(
      typeof length === 'string' ? parseDimensionToMeters(length) : length
    )
  };
}