// Servicio para calcular recomendaciones automáticas de perfiles para policarbonato alveolar
export interface AlveolarRecommendation {
  productId: string;
  productName: string;
  quantity: number;
  description: string;
  reason: string;
  specifications: string;
}

export interface AlveolarRecommendations {
  recommendations: AlveolarRecommendation[];
  totalEstimatedCost: number;
  installationNote: string;
}

export interface AlveolarProductInfo {
  quantity: number;
  width: number; // 1.05 o 2.1 metros
  thickness: number; // 4, 6, 8, 10 mm
  length: number; // largo de la plancha
}

/**
 * Calcula las recomendaciones automáticas de perfiles para policarbonato alveolar
 * @param alveolarProducts - Array de productos alveolares con especificaciones
 * @returns Recomendaciones de perfiles y accesorios necesarios
 */
export function calculateAlveolarRecommendationsAdvanced(alveolarProducts: AlveolarProductInfo[]): AlveolarRecommendations {
  const recommendations: AlveolarRecommendation[] = [];
  
  if (alveolarProducts.length === 0) {
    return {
      recommendations: [],
      totalEstimatedCost: 0,
      installationNote: ''
    };
  }

  const totalQuantity = alveolarProducts.reduce((sum, product) => sum + product.quantity, 0);

  // Agrupar por especificaciones para perfiles U
  const perfilUGroups = new Map<string, { quantity: number, width: number, thickness: number }>();
  
  alveolarProducts.forEach(product => {
    const key = `${product.width}x${product.thickness}`;
    const existing = perfilUGroups.get(key);
    if (existing) {
      existing.quantity += product.quantity * 2; // 2 perfiles U por plancha
    } else {
      perfilUGroups.set(key, {
        quantity: product.quantity * 2,
        width: product.width,
        thickness: product.thickness
      });
    }
  });

  // 1. Perfiles U: 2 por plancha, según ancho y espesor
  perfilUGroups.forEach((group, key) => {
    const widthText = group.width === 1.05 ? '1.05m' : '2.10m';
    const thicknessText = group.thickness <= 6 ? '4-6mm' : `${group.thickness}mm`;
    
    recommendations.push({
      productId: `perfil-u-${group.width}-${group.thickness}`,
      productName: `Perfil U ${thicknessText} x ${widthText}`,
      quantity: group.quantity,
      description: `${group.quantity} perfiles U de ${widthText} para espesor ${thicknessText}`,
      reason: `Sellado en extremos superior e inferior de planchas ${widthText}`,
      specifications: `Ancho: ${widthText} | Espesor compatible: ${thicknessText}`
    });
  });

  // 2. Perfil Clip Plano: N-1, universal para todos los espesores
  const perfilClipQuantity = Math.max(0, totalQuantity - 1);
  if (perfilClipQuantity > 0) {
    // Agrupar por largo de plancha para perfiles clip
    const clipLengthGroups = new Map<number, number>();
    
    alveolarProducts.forEach(product => {
      const existing = clipLengthGroups.get(product.length) || 0;
      clipLengthGroups.set(product.length, existing + Math.max(0, product.quantity - 1));
    });

    clipLengthGroups.forEach((quantity, length) => {
      if (quantity > 0) {
        recommendations.push({
          productId: `perfil-clip-${length}`,
          productName: `Perfil Clip Plano ${length}m`,
          quantity: quantity,
          description: `${quantity} perfiles clip de ${length}m para unión entre planchas`,
          reason: `Unión lateral entre planchas de ${length}m de largo`,
          specifications: `Largo: ${length}m | Compatible: todos los espesores alveolares`
        });
      }
    });
  }

  // 3. Kit Alveolar 1 1/2: 1 kit por cada 2 planchas
  const kitAlveolarQuantity = Math.ceil(totalQuantity / 2);
  recommendations.push({
    productId: 'kit-alveolar-1-5',
    productName: 'Kit Alveolar 1 1/2" (incluye tornillos y cintas)',
    quantity: kitAlveolarQuantity,
    description: `${kitAlveolarQuantity} kits alveolares completos con fijaciones`,
    reason: `Cada kit cubre fijación de 2 planchas alveolares`,
    specifications: `Incluye: tornillos autorroscantes + arandelas + cintas de sellado`
  });

  // Calcular totales para la nota de instalación
  const totalPerfilUQuantity = Array.from(perfilUGroups.values()).reduce((sum, group) => sum + group.quantity, 0);
  const totalPerfilClipQuantity = Array.from(perfilUGroups.values()).length > 1 ? totalQuantity - 1 : 0;

  // Nota de instalación profesional
  const installationNote = `
    📋 GUÍA DE INSTALACIÓN PROFESIONAL:
    
    ✅ Para ${totalQuantity} plancha${totalQuantity > 1 ? 's' : ''} de policarbonato alveolar necesitas:
    • ${totalPerfilUQuantity} Perfiles U (sellado en extremos)
    • ${totalPerfilClipQuantity > 0 ? totalPerfilClipQuantity + ' Perfiles Clip Plano (unión entre planchas)' : 'Sin perfiles clip (plancha única)'}
    • ${kitAlveolarQuantity} Kit${kitAlveolarQuantity > 1 ? 's' : ''} Alveolar con tornillos y cintas
    
    🔧 INSTALACIÓN:
    1. Instalar perfiles U en extremos superior e inferior
    2. ${totalPerfilClipQuantity > 0 ? 'Unir planchas con perfiles clip plano' : 'Plancha única sin uniones'}
    3. Fijar con tornillos del kit (incluye arandelas y cintas de sellado)
    4. Cada kit cubre área de instalación para 2 planchas
    
    ⚠️ IMPORTANTE: Los perfiles garantizan sellado hermético y durabilidad de 10+ años
  `;

  return {
    recommendations,
    totalEstimatedCost: 0, // Se calculará con precios reales de la base de datos
    installationNote: installationNote.trim()
  };
}

/**
 * Verifica si un producto es policarbonato alveolar
 * @param productName - Nombre del producto
 * @returns true si es policarbonato alveolar
 */
export function isAlveolarProduct(productName: string): boolean {
  const alveolarKeywords = [
    'alveolar',
    'alvéolar', 
    'alveolares',
    'policarbonato alveolar',
    'lamina alveolar',
    'lámina alveolar'
  ];
  
  const normalizedName = productName.toLowerCase().trim();
  return alveolarKeywords.some(keyword => normalizedName.includes(keyword));
}

/**
 * Extrae la cantidad de productos alveolares del carrito
 * @param cartItems - Items del carrito de compras
 * @returns Cantidad total de planchas alveolares
 */
export function getAlveolarQuantityFromCart(cartItems: any[]): number {
  return cartItems.reduce((total, item) => {
    if (isAlveolarProduct(item.productName || item.nombre || '')) {
      return total + (item.quantity || item.cantidad || 0);
    }
    return total;
  }, 0);
}

/**
 * Extrae especificaciones detalladas de productos alveolares del carrito
 * @param cartItems - Items del carrito de compras
 * @returns Array de productos alveolares con especificaciones
 */
export function getAlveolarProductsFromCart(cartItems: any[]): AlveolarProductInfo[] {
  const alveolarProducts: AlveolarProductInfo[] = [];
  
  cartItems.forEach(item => {
    if (isAlveolarProduct(item.productName || item.nombre || '')) {
      // Extraer especificaciones del nombre/descripción del producto
      const productName = item.productName || item.nombre || '';
      const dimensions = item.dimensiones || item.dimensions || '';
      
      // Parsear dimensiones (ejemplo: "1.05x2.90m", "2.10x5.80m")
      const width = extractWidth(productName, dimensions);
      const thickness = extractThickness(productName, dimensions);
      const length = extractLength(productName, dimensions);
      
      alveolarProducts.push({
        quantity: item.quantity || item.cantidad || 0,
        width: width,
        thickness: thickness,
        length: length
      });
    }
  });
  
  return alveolarProducts;
}

/**
 * Extrae el ancho de la plancha desde el nombre o dimensiones
 */
function extractWidth(productName: string, dimensions: string): number {
  // Buscar patrones como "1.05", "2.10", "1,05", "2,1"
  const text = `${productName} ${dimensions}`.toLowerCase();
  
  if (text.includes('1.05') || text.includes('1,05')) {
    return 1.05;
  }
  if (text.includes('2.1') || text.includes('2,1') || text.includes('2.10')) {
    return 2.1;
  }
  
  // Por defecto, asumir ancho más común
  return 1.05;
}

/**
 * Extrae el espesor desde el nombre del producto
 */
function extractThickness(productName: string, dimensions: string): number {
  const text = `${productName} ${dimensions}`.toLowerCase();
  
  if (text.includes('10mm') || text.includes('10 mm')) return 10;
  if (text.includes('8mm') || text.includes('8 mm')) return 8;
  if (text.includes('6mm') || text.includes('6 mm')) return 6;
  if (text.includes('4mm') || text.includes('4 mm')) return 4;
  
  // Por defecto, asumir espesor más común
  return 6;
}

/**
 * Extrae el largo de la plancha
 */
function extractLength(productName: string, dimensions: string): number {
  const text = `${productName} ${dimensions}`.toLowerCase();
  
  // Buscar patrones de largo (2.90, 5.80, etc.)
  const lengthMatch = text.match(/(\d+\.?\d*)\s*m?(?:\s|$|x)/g);
  
  if (lengthMatch) {
    // Buscar el valor que probablemente sea el largo (mayor que el ancho)
    for (const match of lengthMatch) {
      const value = parseFloat(match.replace(/[^\d.]/g, ''));
      if (value > 2.5) { // Probablemente es el largo
        return value;
      }
    }
  }
  
  // Por defecto, largo estándar
  return 2.9;
}

/**
 * Función de compatibilidad - mantiene la API original para componentes existentes
 */
export function calculateAlveolarRecommendations(alveolarQuantity: number): AlveolarRecommendations {
  // Crear productos genéricos para compatibilidad
  const genericProducts: AlveolarProductInfo[] = [];
  
  if (alveolarQuantity > 0) {
    genericProducts.push({
      quantity: alveolarQuantity,
      width: 1.05, // Ancho más común
      thickness: 6, // Espesor más común
      length: 2.9 // Largo estándar
    });
  }
  
  return calculateAlveolarRecommendationsAdvanced(genericProducts);
}

/**
 * Formatea las recomendaciones para mostrar en la UI
 * @param recommendations - Recomendaciones calculadas
 * @returns HTML formateado para mostrar al usuario
 */
export function formatRecommendationsForDisplay(recommendations: AlveolarRecommendations): string {
  if (recommendations.recommendations.length === 0) {
    return '';
  }

  let html = `
    <div class="alveolar-recommendations">
      <h3>🔧 ACCESORIOS REQUERIDOS PARA INSTALACIÓN PROFESIONAL</h3>
      <div class="recommendations-list">
  `;

  recommendations.recommendations.forEach((rec, index) => {
    html += `
      <div class="recommendation-item">
        <strong>${rec.quantity}× ${rec.productName}</strong>
        <p class="recommendation-reason">${rec.reason}</p>
      </div>
    `;
  });

  html += `
      </div>
      <div class="installation-note">
        ${recommendations.installationNote.replace(/\n/g, '<br>')}
      </div>
    </div>
  `;

  return html;
}