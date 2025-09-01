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
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* Header con diseño mejorado */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Control de Visibilidad
            </h3>
            <p className="text-sm text-gray-500">Administra qué categorías se muestran en el catálogo</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-400">Activas:</span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            {visibleCount}/{totalCount}
          </span>
        </div>
      </div>
      
      {/* Grid de categorías con diseño mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`group relative p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
              category.visible
                ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-150'
                : 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150'
            }`}
          >
            {/* Indicador de estado visual */}
            <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${
              category.visible 
                ? 'bg-green-500 shadow-lg shadow-green-300/50' 
                : 'bg-gray-400'
            }`}></div>
            
            <div className="space-y-3">
              {/* Icono y título */}
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                  category.visible
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-400 text-white'
                }`}>
                  {category.displayName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {category.displayName}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {category.description}
                  </p>
                </div>
              </div>
              
              {/* Estado y acción */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                  category.visible 
                    ? 'bg-green-200 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    category.visible ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>
                  {category.visible ? 'Activa' : 'Oculta'}
                </span>
                
                <button
                  onClick={() => toggleVisibility(category.name, !category.visible)}
                  disabled={updating === category.name}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 disabled:opacity-50"
                  title={category.visible ? 'Ocultar categoría' : 'Mostrar categoría'}
                >
                  {updating === category.name ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg 
                      className={`w-5 h-5 transition-colors ${
                        category.visible 
                          ? 'text-gray-600 hover:text-gray-800' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      {category.visible ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      )}
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer informativo mejorado */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900 mb-1">Información importante</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Las categorías <strong>ocultas</strong> no aparecerán en el catálogo público del sitio web, 
              pero permanecerán disponibles en este panel de administración para su gestión.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}