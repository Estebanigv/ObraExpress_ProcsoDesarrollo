/**
 * Memory Cache Manager para ObraExpress
 * Tarea 3.3: Caché y Estado - Memory cache para productos
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

interface CacheStats {
  totalItems: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
}

class MemoryCacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private maxItems: number;
  private maxAge: number;
  private stats = { hits: 0, misses: 0 };

  constructor(maxItems: number = 100, maxAge: number = 5 * 60 * 1000) {
    this.maxItems = maxItems;
    this.maxAge = maxAge;
    
    // Limpiar caché expirado cada 2 minutos
    setInterval(() => this.cleanup(), 2 * 60 * 1000);
  }

  /**
   * Almacenar dato en caché
   */
  set<T>(key: string, data: T, customMaxAge?: number): void {
    // Si el caché está lleno, remover el elemento menos usado
    if (this.cache.size >= this.maxItems) {
      this.evictLeastUsed();
    }

    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    };

    this.cache.set(key, item);
    
    console.log(`[MemoryCache] Set: ${key} (${this.cache.size}/${this.maxItems})`);
  }

  /**
   * Obtener dato del caché
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;

    if (!item) {
      this.stats.misses++;
      console.log(`[MemoryCache] Miss: ${key}`);
      return null;
    }

    // Verificar si ha expirado
    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.stats.misses++;
      console.log(`[MemoryCache] Expired: ${key}`);
      return null;
    }

    // Actualizar estadísticas de acceso
    item.accessCount++;
    item.lastAccessed = Date.now();
    this.stats.hits++;
    
    console.log(`[MemoryCache] Hit: ${key} (accessed ${item.accessCount} times)`);
    return item.data;
  }

  /**
   * Verificar si existe en caché (sin actualizar stats)
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    return item !== undefined && !this.isExpired(item);
  }

  /**
   * Eliminar del caché
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      console.log(`[MemoryCache] Deleted: ${key}`);
    }
    return deleted;
  }

  /**
   * Limpiar todo el caché
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
    console.log('[MemoryCache] Cleared all cache');
  }

  /**
   * Verificar si un item ha expirado
   */
  private isExpired(item: CacheItem<any>): boolean {
    return (Date.now() - item.timestamp) > this.maxAge;
  }

  /**
   * Remover el elemento menos usado (LRU)
   */
  private evictLeastUsed(): void {
    let leastUsedKey: string | null = null;
    let leastUsedItem: CacheItem<any> | null = null;

    for (const [key, item] of this.cache.entries()) {
      if (!leastUsedItem || 
          item.accessCount < leastUsedItem.accessCount || 
          (item.accessCount === leastUsedItem.accessCount && item.lastAccessed < leastUsedItem.lastAccessed)) {
        leastUsedKey = key;
        leastUsedItem = item;
      }
    }

    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
      console.log(`[MemoryCache] Evicted LRU: ${leastUsedKey} (accessed ${leastUsedItem?.accessCount} times)`);
    }
  }

  /**
   * Limpiar elementos expirados
   */
  private cleanup(): void {
    const before = this.cache.size;
    const now = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if ((now - item.timestamp) > this.maxAge) {
        this.cache.delete(key);
      }
    }

    const removed = before - this.cache.size;
    if (removed > 0) {
      console.log(`[MemoryCache] Cleanup: removed ${removed} expired items`);
    }
  }

  /**
   * Obtener estadísticas del caché
   */
  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    
    return {
      totalItems: this.cache.size,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      hitRate: total > 0 ? (this.stats.hits / total) * 100 : 0,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Estimar uso de memoria (aproximado)
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, item] of this.cache.entries()) {
      // Estimación aproximada del tamaño
      totalSize += key.length * 2; // chars to bytes
      totalSize += JSON.stringify(item.data).length * 2;
      totalSize += 64; // overhead por CacheItem
    }
    
    return totalSize;
  }

  /**
   * Obtener items más accedidos
   */
  getMostAccessed(limit: number = 10): Array<{key: string, accessCount: number}> {
    const items = Array.from(this.cache.entries())
      .map(([key, item]) => ({ key, accessCount: item.accessCount }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);

    return items;
  }
}

// Instancias especializadas para diferentes tipos de datos
export const productCache = new MemoryCacheManager(50, 5 * 60 * 1000); // 50 productos, 5 min
export const adminCache = new MemoryCacheManager(20, 2 * 60 * 1000);   // 20 items admin, 2 min
export const imageCache = new MemoryCacheManager(100, 10 * 60 * 1000); // 100 imágenes, 10 min

// Cache genérico por defecto
export const memoryCache = new MemoryCacheManager();

// Funciones de utilidad específicas para productos
export const productCacheUtils = {
  // Cache de producto individual
  setProduct: (productId: string, product: any) => 
    productCache.set(`product_${productId}`, product),
  
  getProduct: (productId: string) => 
    productCache.get(`product_${productId}`),
  
  // Cache de productos por categoría
  setProductsByCategory: (category: string, products: any[]) => 
    productCache.set(`products_category_${category}`, products),
  
  getProductsByCategory: (category: string) => 
    productCache.get(`products_category_${category}`),
  
  // Cache de productos públicos
  setPublicProducts: (products: any[]) => 
    productCache.set('products_public', products),
  
  getPublicProducts: () => 
    productCache.get('products_public'),
  
  // Invalidar cache relacionado con productos
  invalidateProduct: (productId: string) => {
    productCache.delete(`product_${productId}`);
    // También invalidar listas que puedan contener este producto
    Array.from(productCache['cache'].keys())
      .filter(key => key.includes('products_') && key !== `product_${productId}`)
      .forEach(key => productCache.delete(key));
  },
};

// Funciones de utilidad para admin
export const adminCacheUtils = {
  setStats: (stats: any) => adminCache.set('admin_stats', stats),
  getStats: () => adminCache.get('admin_stats'),
  
  setNotifications: (notifications: any[]) => adminCache.set('admin_notifications', notifications),
  getNotifications: () => adminCache.get('admin_notifications'),
  
  setPendingProducts: (pending: any[]) => adminCache.set('admin_pending', pending),
  getPendingProducts: () => adminCache.get('admin_pending'),
  
  invalidateAll: () => adminCache.clear(),
};

export default memoryCache;