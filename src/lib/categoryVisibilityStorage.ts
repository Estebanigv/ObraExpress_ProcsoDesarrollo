// Sistema de persistencia para configuración de visibilidad de categorías

interface CategoryVisibilityState {
  [categoryName: string]: boolean;
}

const STORAGE_KEY = 'obraexpress_category_visibility';

// Cargar estado desde localStorage
export function loadVisibilityState(): CategoryVisibilityState {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading visibility state:', error);
  }
  
  return {};
}

// Guardar estado en localStorage
export function saveVisibilityState(state: CategoryVisibilityState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log('✅ Configuración de visibilidad guardada:', state);
  } catch (error) {
    console.error('Error saving visibility state:', error);
  }
}

// Cambiar visibilidad de una categoría específica
export function setCategoryVisibilityPersistent(categoryName: string, visible: boolean): void {
  const currentState = loadVisibilityState();
  const newState = { ...currentState, [categoryName]: visible };
  saveVisibilityState(newState);
}

// Obtener visibilidad de una categoría específica
export function getCategoryVisibility(categoryName: string, defaultVisible: boolean = true): boolean {
  const state = loadVisibilityState();
  return state[categoryName] !== undefined ? state[categoryName] : defaultVisible;
}

// Obtener todas las categorías visibles
export function getVisibleCategoriesFromStorage(allCategories: string[]): string[] {
  const state = loadVisibilityState();
  return allCategories.filter(cat => getCategoryVisibility(cat, true));
}