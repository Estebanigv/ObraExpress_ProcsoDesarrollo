/**
 * Hook unificado de caché para ObraExpress
 * Tarea 3.3: Caché y Estado - Hook que combina todos los sistemas de caché
 */

import { useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productCache, adminCache, productCacheUtils, adminCacheUtils } from '@/lib/memory-cache';
import { indexedDBManager } from '@/lib/indexeddb';
import { queryKeys } from '@/lib/react-query';

interface CacheOptions {
  enableMemoryCache?: boolean;
  enableIndexedDB?: boolean;
  enableReactQuery?: boolean;
  staleTime?: number;
  maxAge?: number;
}

export function useCache() {
  const queryClient = useQueryClient();

  /**
   * Hook para productos con caché multicapa
   */
  const useProducts = (options: CacheOptions = {}) => {
    const {
      enableMemoryCache = true,
      enableIndexedDB = true,
      enableReactQuery = true,
      staleTime = 5 * 60 * 1000
    } = options;

    return useQuery({
      queryKey: queryKeys.products.public(),
      queryFn: async () => {
        console.log('[useCache] Fetching products...');

        // 1. Intentar memory cache primero (más rápido)
        if (enableMemoryCache) {
          const memoryData = productCacheUtils.getPublicProducts();
          if (memoryData) {
            console.log('[useCache] Products from memory cache');
            return memoryData;
          }
        }

        // 2. Intentar IndexedDB
        if (enableIndexedDB) {
          const idbData = await indexedDBManager.getProducts('public');
          if (idbData) {
            console.log('[useCache] Products from IndexedDB');
            // Almacenar también en memory cache
            if (enableMemoryCache) {
              productCacheUtils.setPublicProducts(idbData);
            }
            return idbData;
          }
        }

        // 3. Fetch desde API
        const response = await fetch('/api/productos-publico');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        console.log('[useCache] Products from API');

        // Almacenar en todos los caches
        if (enableMemoryCache) {
          productCacheUtils.setPublicProducts(data);
        }
        
        if (enableIndexedDB) {
          indexedDBManager.setProducts(data, 'public');
        }

        return data;
      },
      staleTime,
      enabled: enableReactQuery,
    });
  };

  /**
   * Hook para datos de admin con caché multicapa
   */
  const useAdminData = (type: 'stats' | 'notifications' | 'pending', options: CacheOptions = {}) => {
    const {
      enableMemoryCache = true,
      enableIndexedDB = true,
      enableReactQuery = true,
      staleTime = 2 * 60 * 1000
    } = options;

    return useQuery({
      queryKey: type === 'stats' ? queryKeys.admin.stats() : 
                type === 'notifications' ? queryKeys.admin.notifications() :
                queryKeys.admin.pending(),
      queryFn: async () => {
        console.log(`[useCache] Fetching admin ${type}...`);

        // 1. Memory cache
        if (enableMemoryCache) {
          const memoryData = type === 'stats' ? adminCacheUtils.getStats() :
                            type === 'notifications' ? adminCacheUtils.getNotifications() :
                            adminCacheUtils.getPendingProducts();
          if (memoryData) {
            console.log(`[useCache] Admin ${type} from memory cache`);
            return memoryData;
          }
        }

        // 2. IndexedDB
        if (enableIndexedDB) {
          const idbData = await indexedDBManager.getAdminData(type);
          if (idbData) {
            console.log(`[useCache] Admin ${type} from IndexedDB`);
            // Store in memory cache
            if (enableMemoryCache) {
              if (type === 'stats') adminCacheUtils.setStats(idbData);
              else if (type === 'notifications') adminCacheUtils.setNotifications(idbData);
              else adminCacheUtils.setPendingProducts(idbData);
            }
            return idbData;
          }
        }

        // 3. API fetch
        const endpoint = type === 'stats' ? '/api/admin/stats' :
                        type === 'notifications' ? '/api/admin/notifications' :
                        '/api/admin/pending';
                        
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error(`Failed to fetch admin ${type}`);
        
        const data = await response.json();
        console.log(`[useCache] Admin ${type} from API`);

        // Store in all caches
        if (enableMemoryCache) {
          if (type === 'stats') adminCacheUtils.setStats(data);
          else if (type === 'notifications') adminCacheUtils.setNotifications(data);
          else adminCacheUtils.setPendingProducts(data);
        }
        
        if (enableIndexedDB) {
          indexedDBManager.setAdminData(type, data);
        }

        return data;
      },
      staleTime,
      enabled: enableReactQuery,
    });
  };

  /**
   * Invalidar todos los caches
   */
  const invalidateAll = useCallback(async () => {
    console.log('[useCache] Invalidating all caches...');
    
    // React Query
    await queryClient.invalidateQueries();
    
    // Memory Cache
    productCache.clear();
    adminCache.clear();
    
    // IndexedDB
    await indexedDBManager.clearAll();
    
    console.log('[useCache] All caches invalidated');
  }, [queryClient]);

  /**
   * Invalidar cache específico
   */
  const invalidateProducts = useCallback(async () => {
    console.log('[useCache] Invalidating product caches...');
    
    // React Query
    await queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    
    // Memory Cache
    productCache.clear();
    
    // IndexedDB
    await indexedDBManager.deleteProducts('public');
    await indexedDBManager.deleteProducts('admin');
    
    console.log('[useCache] Product caches invalidated');
  }, [queryClient]);

  const invalidateAdmin = useCallback(async () => {
    console.log('[useCache] Invalidating admin caches...');
    
    // React Query
    await queryClient.invalidateQueries({ queryKey: queryKeys.admin.all });
    
    // Memory Cache
    adminCache.clear();
    
    // IndexedDB
    await indexedDBManager.deleteAdminData('stats');
    await indexedDBManager.deleteAdminData('notifications');
    await indexedDBManager.deleteAdminData('pending');
    
    console.log('[useCache] Admin caches invalidated');
  }, [queryClient]);

  /**
   * Obtener estadísticas de todos los caches
   */
  const getCacheStats = useCallback(async () => {
    const memoryStats = {
      products: productCache.getStats(),
      admin: adminCache.getStats(),
    };
    
    const idbStats = await indexedDBManager.getCacheStats();
    
    const reactQueryStats = {
      queries: queryClient.getQueryCache().getAll().length,
      mutations: queryClient.getMutationCache().getAll().length,
    };

    return {
      memory: memoryStats,
      indexedDB: idbStats,
      reactQuery: reactQueryStats,
    };
  }, [queryClient]);

  /**
   * Prefetch de datos importantes
   */
  const prefetchData = useCallback(async () => {
    console.log('[useCache] Prefetching important data...');
    
    // Prefetch productos públicos
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.public(),
      queryFn: () => fetch('/api/productos-publico').then(res => res.json()),
      staleTime: 5 * 60 * 1000,
    });

    console.log('[useCache] Data prefetched');
  }, [queryClient]);

  /**
   * Limpiar cache expirado
   */
  const cleanExpiredCache = useCallback(async () => {
    console.log('[useCache] Cleaning expired cache...');
    
    await indexedDBManager.cleanExpiredCache();
    
    console.log('[useCache] Expired cache cleaned');
  }, []);

  return {
    // Hooks de datos
    useProducts,
    useAdminData,
    
    // Invalidación
    invalidateAll,
    invalidateProducts,
    invalidateAdmin,
    
    // Utilidades
    getCacheStats,
    prefetchData,
    cleanExpiredCache,
  };
}

/**
 * Hook para Service Worker interactions
 */
export function useServiceWorker() {
  const cleanServiceWorkerCache = useCallback((cacheName?: string) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_CLEAN',
        payload: { cacheName: cacheName || 'all' }
      });
    }
  }, []);

  const getServiceWorkerStats = useCallback(() => {
    return new Promise((resolve) => {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.type === 'CACHE_STATS_RESPONSE') {
            resolve(event.data.payload);
          }
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'CACHE_STATS' },
          [messageChannel.port2]
        );
      } else {
        resolve({});
      }
    });
  }, []);

  const prefetchUrls = useCallback((urls: string[]) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PREFETCH',
        payload: { urls }
      });
    }
  }, []);

  return {
    cleanServiceWorkerCache,
    getServiceWorkerStats,
    prefetchUrls,
  };
}

export default useCache;