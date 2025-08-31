/**
 * Configuración de visibilidad por categorías
 * Permite ocultar/mostrar categorías completas en el sitio web
 */

export interface CategoryVisibility {
  name: string;
  displayName: string;
  visible: boolean;
  description: string;
}

// Configuración de visibilidad por defecto - ORDEN IMPORTANTE
export const CATEGORIES_VISIBILITY: CategoryVisibility[] = [
  {
    name: 'Policarbonato',
    displayName: 'Policarbonatos',
    visible: true,
    description: 'Planchas de policarbonato ondulado, alveolar y compacto'
  },
  {
    name: 'Perfiles Alveolar', 
    displayName: 'Perfiles Alveolar',
    visible: true,
    description: 'Perfiles para policarbonato alveolar'
  },
  {
    name: 'Accesorios',
    displayName: 'Accesorios',
    visible: false,
    description: 'Accesorios generales para instalación'
  },
  {
    name: 'Rollos',
    displayName: 'Rollos',
    visible: false, 
    description: 'Rollos de material'
  },
  {
    name: 'Industriales',
    displayName: 'Industriales',
    visible: false,
    description: 'Productos para uso industrial'
  },
  {
    name: 'Accesorios Industriales',
    displayName: 'Accesorios Industriales', 
    visible: false,
    description: 'Accesorios especializados para uso industrial'
  }
];

// Orden de tipos dentro de cada categoría
export const PRODUCT_TYPES_ORDER: Record<string, string[]> = {
  'Policarbonato': ['Ondulado', 'Alveolar', 'Compacto'],
  'Perfiles Alveolar': ['Perfil Alveolar', 'Perfil U', 'Perfil H', 'Perfil Clip'],
  'Accesorios': ['Tornillos', 'Sellos', 'Cintas', 'Fijaciones'],
  'Rollos': ['Rollo 2mm', 'Rollo 3mm', 'Rollo Clear'],
  'Industriales': ['Terrazas', 'Cubiertas', 'Estructuras'],
  'Accesorios Industriales': ['Estructurales', 'Instalación']
};

// Función para obtener el orden correcto de categorías
export function getCategoriesInOrder(): CategoryVisibility[] {
  return CATEGORIES_VISIBILITY.slice(); // Copia del array original
}

// Función para obtener tipos ordenados por categoría
export function getOrderedTypesByCategory(categoryName: string): string[] {
  return PRODUCT_TYPES_ORDER[categoryName] || [];
}

// Función para obtener categorías visibles
export function getVisibleCategories(): string[] {
  return CATEGORIES_VISIBILITY
    .filter(cat => cat.visible)
    .map(cat => cat.name);
}

// Función para verificar si una categoría es visible
export function isCategoryVisible(categoryName: string): boolean {
  const category = CATEGORIES_VISIBILITY.find(cat => cat.name === categoryName);
  return category ? category.visible : false;
}

// Función para cambiar visibilidad de una categoría
export function setCategoryVisibility(categoryName: string, visible: boolean): void {
  const category = CATEGORIES_VISIBILITY.find(cat => cat.name === categoryName);
  if (category) {
    category.visible = visible;
  }
}