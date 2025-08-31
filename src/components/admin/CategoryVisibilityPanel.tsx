'use client';

import React, { useState, useEffect } from 'react';

interface CategoryVisibility {
  name: string;
  displayName: string;
  visible: boolean;
  description: string;
}

interface CategoryVisibilityPanelProps {
  className?: string;
}

export default function CategoryVisibilityPanel({ className = '' }: CategoryVisibilityPanelProps) {
  const [categories, setCategories] = useState<CategoryVisibility[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Cargar configuración inicial
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories-visibility');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cambiar visibilidad de una categoría
  const toggleVisibility = async (categoryName: string, visible: boolean) => {
    setUpdating(categoryName);
    try {
      const response = await fetch('/api/admin/categories-visibility', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryName,
          visible
        })
      });

      const data = await response.json();
      if (data.success) {
        // Actualizar estado local
        setCategories(prev => 
          prev.map(cat => 
            cat.name === categoryName 
              ? { ...cat, visible }
              : cat
          )
        );
      } else {
        console.error('Error cambiando visibilidad:', data.error);
      }
    } catch (error) {
      console.error('Error en la petición:', error);
    } finally {
      setUpdating(null);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestión de Categorías</h3>
        <div className="animate-pulse">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const visibleCount = categories.filter(cat => cat.visible).length;
  const totalCount = categories.length;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestión de Categorías
        </h3>
        <span className="text-sm text-gray-500">
          {visibleCount} de {totalCount} visibles
        </span>
      </div>
      
      <div className="space-y-3">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              category.visible
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    category.visible ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {category.displayName}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  category.visible 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {category.visible ? 'Visible' : 'Oculta'}
                </span>
                
                <button
                  onClick={() => toggleVisibility(category.name, !category.visible)}
                  disabled={updating === category.name}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                    category.visible
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50'
                      : 'bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50'
                  }`}
                >
                  {updating === category.name ? (
                    <span className="flex items-center space-x-1">
                      <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>...</span>
                    </span>
                  ) : (
                    category.visible ? 'Ocultar' : 'Mostrar'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-700">
          💡 <strong>Tip:</strong> Las categorías ocultas no aparecerán en el catálogo del sitio web, 
          pero seguirán disponibles en el inventario del admin.
        </p>
      </div>
    </div>
  );
}