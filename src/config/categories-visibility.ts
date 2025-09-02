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

// Configuración de visibilidad por defecto - SINCRONIZADA CON DATOS REALES
// Solo incluye las categorías que realmente existen en la base de datos
export const CATEGORIES_VISIBILITY: CategoryVisibility[] = [
  {
    name: 'Policarbonato',
    displayName: 'Policarbonatos',
    visible: true,
    description: 'Policarbonato Ondulado, Alveolar y Compacto'
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
    name: 'Industriales',
    displayName: 'Industriales',
    visible: false,
    description: 'Productos para uso industrial'
  },
  {
    name: 'Rollos',
    displayName: 'Rollos',
    visible: false, 
    description: 'Rollos de material'
  }
];

// Orden de tipos dentro de cada categoría - SINCRONIZADO CON DATOS REALES
export const PRODUCT_TYPES_ORDER: Record<string, string[]> = {
  'Policarbonato': ['Ondulado', 'Alveolar', 'Compacto'],
  'Perfiles Alveolar': ['Perfil Alveolar', 'Perfil U', 'Perfil H', 'Perfil Clip'],
  'Accesorios': ['Tornillos', 'Sellos', 'Cintas', 'Fijaciones'],
  'Industriales': ['Terrazas', 'Cubiertas', 'Estructuras'],
  'Rollos': ['Rollo 2mm', 'Rollo 3mm', 'Rollo Clear']
};

// Función para obtener el orden correcto de categorías
export function getCategoriesInOrder(): CategoryVisibility[] {
  return CATEGORIES_VISIBILITY.slice(); // Copia del array original
}

// Función para obtener tipos ordenados por categoría
export function getOrderedTypesByCategory(categoryName: string): string[] {
  return PRODUCT_TYPES_ORDER[categoryName] || [];
}

// Función para obtener categorías visibles (para frontend público)
export function getVisibleCategories(): string[] {
  if (typeof window !== 'undefined') {
    // En el cliente, usar localStorage
    const { getCategoryVisibility } = require('@/lib/categoryVisibilityStorage');
    const visible = CATEGORIES_VISIBILITY
      .filter(cat => getCategoryVisibility(cat.name, cat.visible))
      .map(cat => cat.name);
    console.log('🔍 DEBUG getVisibleCategories:', { visible, allCategories: CATEGORIES_VISIBILITY });
    return visible;
  } else {
    // En el servidor, usar configuración por defecto
    const visible = CATEGORIES_VISIBILITY
      .filter(cat => cat.visible)
      .map(cat => cat.name);
    console.log('🔍 DEBUG getVisibleCategories (server):', { visible });
    return visible;
  }
}

// Función para obtener TODAS las categorías (para admin)
export function getAllCategories(): string[] {
  return CATEGORIES_VISIBILITY.map(cat => cat.name);
}

// Función para verificar si una categoría es visible
export function isCategoryVisible(categoryName: string): boolean {
  if (typeof window !== 'undefined') {
    // En el cliente, usar localStorage
    const { getCategoryVisibility } = require('@/lib/categoryVisibilityStorage');
    const category = CATEGORIES_VISIBILITY.find(cat => cat.name === categoryName);
    return category ? getCategoryVisibility(categoryName, category.visible) : false;
  } else {
    // En el servidor, usar configuración por defecto
    const category = CATEGORIES_VISIBILITY.find(cat => cat.name === categoryName);
    return category ? category.visible : false;
  }
}

// Función para cambiar visibilidad de una categoría
export function setCategoryVisibility(categoryName: string, visible: boolean): void {
  const category = CATEGORIES_VISIBILITY.find(cat => cat.name === categoryName);
  if (category) {
    category.visible = visible;
  }
}