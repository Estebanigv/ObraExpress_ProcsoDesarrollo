"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  espesor: string;
  color: string;
  precio: number;
  groupId: string;
  imagen?: string;
}

interface BuscadorGlobalProps {
  className?: string;
  placeholder?: string;
}

export const BuscadorGlobal: React.FC<BuscadorGlobalProps> = ({ 
  className = "",
  placeholder = "Buscar..."
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchIndex, setSearchIndex] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cargar productos desde la API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/productos-publico');
        if (response.ok) {
          const data = await response.json();
          const index: SearchResult[] = [];
          
          // Convertir los productos de Supabase al formato del buscador
          if (data.productos && Array.isArray(data.productos)) {
            data.productos.forEach((producto: any) => {
              index.push({
                id: producto.codigo,
                codigo: producto.codigo,
                nombre: producto.nombre,
                categoria: producto.categoria || producto.tipo,
                espesor: producto.espesor,
                color: producto.color,
                precio: producto.precio_con_iva,
                groupId: producto.codigo, // Usar código como groupId para navegación
                imagen: producto.ruta_imagen || '/assets/images/Productos/policarbonato_alveolar_4mm_cristal.webp'
              });
            });
          }
          
          setSearchIndex(index);
        }
      } catch (error) {
        console.error('Error cargando productos para búsqueda:', error);
      }
    };

    loadProducts();
  }, []);

  // Función para resaltar texto
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const terms = query.toLowerCase().split(' ').filter(Boolean);
    let highlightedText = text;
    
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  // Función de búsqueda simple
  const performSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }
    
    const terms = searchQuery.toLowerCase().split(' ').filter(Boolean);
    
    const filtered = searchIndex.filter(item => {
      const searchableText = `${item.nombre} ${item.categoria} ${item.espesor} ${item.color}`.toLowerCase();
      return terms.some(term => searchableText.includes(term));
    });
    
    setResults(filtered.slice(0, 8)); // Máximo 8 resultados
  };

  // Efecto de búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [query, searchIndex]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery(''); // Limpiar la query para contraer el buscador
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // Manejar selección de resultado
  const handleSelectResult = (result: SearchResult) => {
    console.log('🔍 Producto seleccionado:', {
      nombre: result.nombre,
      groupId: result.groupId,
      codigo: result.codigo
    });
    
    // Navegar inmediatamente
    const url = `/productos/${result.groupId}`;
    console.log('🚀 Navegando a:', url);
    
    // Navegar primero, luego limpiar
    router.push(url);
    
    // Limpiar después de navegar
    setTimeout(() => {
      setQuery('');
      setIsOpen(false);
    }, 50);
  };

  // Manejar entrada de texto
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery(''); // Esto contraerá el buscador al tamaño original
      inputRef.current?.blur();
    }
  };

  return (
    <>
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div ref={searchRef} className={`relative ${className}`}>
      {/* Buscador estilo moderno */}
      <div className="relative group">
        <div className={`
          flex items-center transition-all duration-300 ease-out
          ${query || isOpen ? 'w-60' : 'w-32'}
          h-8 bg-white border border-gray-200
          hover:border-gray-300 focus-within:border-gray-400
          rounded-md shadow-sm hover:shadow-md focus-within:shadow-lg
        `}>
          {/* Icono de lupa */}
          <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
            <svg 
              className="w-3.5 h-3.5 text-gray-400 transition-colors"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder="Buscar"
            className="flex-1 h-full bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
          />
          
        </div>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && results.length > 0 && (
        <div 
          className="absolute bg-white rounded-xl shadow-xl border border-gray-200 max-h-80 overflow-y-auto scrollbar-hide"
          style={{ 
            zIndex: 99999,
            width: '100%',
            minWidth: '450px',
            maxWidth: '95vw',
            pointerEvents: 'auto',
            top: 'calc(100% + 8px)',
            left: '0px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          onWheel={(e) => {
            // Prevenir scroll de la página completamente
            e.preventDefault();
            e.stopPropagation();
            
            // Obtener el contenedor del dropdown
            const container = e.currentTarget;
            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const height = container.clientHeight;
            const delta = e.deltaY;
            
            // Solo hacer scroll si hay contenido para hacer scroll
            if (delta > 0 && scrollTop + height < scrollHeight) {
              // Scroll hacia abajo
              container.scrollTop = Math.min(scrollTop + delta, scrollHeight - height);
            } else if (delta < 0 && scrollTop > 0) {
              // Scroll hacia arriba
              container.scrollTop = Math.max(scrollTop + delta, 0);
            }
          }}
        >
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelectResult(result);
              }}
              onMouseEnter={(e) => {
                console.log(`🐭 Mouse enter en producto ${index}: ${result.nombre}`);
                e.currentTarget.style.backgroundColor = '#fefce8';
                e.currentTarget.style.borderLeft = '4px solid #eab308';
              }}
              onMouseLeave={(e) => {
                console.log(`🐭 Mouse leave en producto ${index}: ${result.nombre}`);
                e.currentTarget.style.backgroundColor = '';
                e.currentTarget.style.borderLeft = '';
              }}
              className="group w-full text-left px-4 py-3 border-b border-gray-100 last:border-b-0 transition-all duration-200 cursor-pointer hover:bg-yellow-50 hover:border-l-4 hover:border-l-yellow-500"
              style={{ 
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: '999999999'
              }}
            >
              <div className="flex items-start space-x-3">
                {/* Imagen del producto */}
                <div className="w-12 h-12 bg-gray-100 rounded-lg border border-gray-200 flex-shrink-0 overflow-hidden">
                  {result.imagen ? (
                    <img
                      src={result.imagen}
                      alt={result.nombre}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback a imagen por defecto
                        const target = e.target as HTMLImageElement;
                        target.src = '/assets/images/Productos/policarbonato_alveolar_4mm_cristal.webp';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="flex-1 min-w-0 group-hover:text-gray-800">
                  <div 
                    className="font-medium text-gray-900 text-sm group-hover:text-gray-800 transition-colors"
                    dangerouslySetInnerHTML={{ __html: highlightText(result.nombre, query) }}
                  />
                  <div 
                    className="text-xs text-gray-500 mt-1 group-hover:text-gray-600 transition-colors"
                    dangerouslySetInnerHTML={{ 
                      __html: highlightText(`${result.categoria} • ${result.espesor} • ${result.color}`, query) 
                    }}
                  />
                </div>

                {/* Precio */}
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-blue-600 text-sm">
                    ${result.precio.toLocaleString('es-CL')}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {isOpen && query && results.length === 0 && (
        <div 
          className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4"
          style={{ 
            zIndex: 99999,
            width: '650px',
            maxWidth: '95vw'
          }}
        >
          <div className="text-center text-gray-500">
            <div className="text-sm">No se encontraron productos para "{query}"</div>
            <div className="text-xs mt-1">Intenta con otros términos como "6mm", "transparente", "alveolar"</div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

// Hook simplificado para atajos de teclado
export const useSearchShortcut = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>('input[placeholder*="Buscar"]');
        input?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);
};