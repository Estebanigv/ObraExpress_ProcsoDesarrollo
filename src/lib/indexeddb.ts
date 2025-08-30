/**
 * IndexedDB Manager para ObraExpress
 * Tarea 3.3: Caché y Estado - IndexedDB para datos grandes
 */

interface ProductCache {
  id: string;
  data: any;
  timestamp: number;
  category: string;
}

interface AdminCache {
  id: string;
  type: 'stats' | 'notifications' | 'pending' | 'inventory';
  data: any;
  timestamp: number;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private readonly dbName = 'ObraExpressCache';
  private readonly dbVersion = 1;

  constructor() {
    this.init();
  }

  /**
   * Inicializar IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store para productos
        if (!db.objectStoreNames.contains('products')) {
          const productStore = db.createObjectStore('products', { keyPath: 'id' });
          productStore.createIndex('category', 'category', { unique: false });
          productStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para datos admin
        if (!db.objectStoreNames.contains('admin')) {
          const adminStore = db.createObjectStore('admin', { keyPath: 'id' });
          adminStore.createIndex('type', 'type', { unique: false });
          adminStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Store para imágenes (como blob)
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', { keyPath: 'url' });
        }
      };
    });
  }

  /**
   * Verificar si IndexedDB está disponible
   */
  isSupported(): boolean {
    return 'indexedDB' in window;
  }

  /**
   * Productos - Almacenar
   */
  async setProducts(products: any[], category: string = 'all'): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      
      const cacheData: ProductCache = {
        id: `products_${category}`,
        data: products,
        timestamp: Date.now(),
        category
      };

      const request = store.put(cacheData);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Productos - Obtener
   */
  async getProducts(category: string = 'all', maxAge: number = 5 * 60 * 1000): Promise<any[] | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readonly');
      const store = transaction.objectStore('products');
      const request = store.get(`products_${category}`);

      request.onsuccess = () => {
        const result = request.result as ProductCache | undefined;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Verificar si está expirado
        const isExpired = (Date.now() - result.timestamp) > maxAge;
        if (isExpired) {
          this.deleteProducts(category); // Limpiar expirado
          resolve(null);
          return;
        }

        resolve(result.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Productos - Eliminar
   */
  async deleteProducts(category: string): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['products'], 'readwrite');
      const store = transaction.objectStore('products');
      const request = store.delete(`products_${category}`);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Admin Data - Almacenar
   */
  async setAdminData(type: AdminCache['type'], data: any): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['admin'], 'readwrite');
      const store = transaction.objectStore('admin');
      
      const cacheData: AdminCache = {
        id: `admin_${type}`,
        type,
        data,
        timestamp: Date.now()
      };

      const request = store.put(cacheData);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Admin Data - Obtener
   */
  async getAdminData(type: AdminCache['type'], maxAge: number = 2 * 60 * 1000): Promise<any | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['admin'], 'readonly');
      const store = transaction.objectStore('admin');
      const request = store.get(`admin_${type}`);

      request.onsuccess = () => {
        const result = request.result as AdminCache | undefined;
        
        if (!result) {
          resolve(null);
          return;
        }

        // Verificar si está expirado (admin data expira más rápido)
        const isExpired = (Date.now() - result.timestamp) > maxAge;
        if (isExpired) {
          this.deleteAdminData(type);
          resolve(null);
          return;
        }

        resolve(result.data);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Admin Data - Eliminar
   */
  async deleteAdminData(type: AdminCache['type']): Promise<void> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['admin'], 'readwrite');
      const store = transaction.objectStore('admin');
      const request = store.delete(`admin_${type}`);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Limpiar caché expirado
   */
  async cleanExpiredCache(): Promise<void> {
    if (!this.db) await this.init();

    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutos

    // Limpiar productos expirados
    const productTransaction = this.db!.transaction(['products'], 'readwrite');
    const productStore = productTransaction.objectStore('products');
    const productCursor = productStore.openCursor();

    productCursor.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const data = cursor.value as ProductCache;
        if ((now - data.timestamp) > maxAge) {
          cursor.delete();
        }
        cursor.continue();
      }
    };

    // Limpiar datos admin expirados
    const adminTransaction = this.db!.transaction(['admin'], 'readwrite');
    const adminStore = adminTransaction.objectStore('admin');
    const adminCursor = adminStore.openCursor();

    adminCursor.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const data = cursor.value as AdminCache;
        if ((now - data.timestamp) > (2 * 60 * 1000)) { // Admin expira más rápido
          cursor.delete();
        }
        cursor.continue();
      }
    };
  }

  /**
   * Obtener estadísticas de uso de caché
   */
  async getCacheStats(): Promise<{ products: number; admin: number; totalSize: number }> {
    if (!this.db) await this.init();

    const stats = { products: 0, admin: 0, totalSize: 0 };

    // Contar productos
    const productTransaction = this.db!.transaction(['products'], 'readonly');
    const productStore = productTransaction.objectStore('products');
    const productCount = await new Promise<number>((resolve) => {
      const request = productStore.count();
      request.onsuccess = () => resolve(request.result);
    });

    // Contar admin data
    const adminTransaction = this.db!.transaction(['admin'], 'readonly');
    const adminStore = adminTransaction.objectStore('admin');
    const adminCount = await new Promise<number>((resolve) => {
      const request = adminStore.count();
      request.onsuccess = () => resolve(request.result);
    });

    stats.products = productCount;
    stats.admin = adminCount;
    
    return stats;
  }

  /**
   * Limpiar toda la base de datos
   */
  async clearAll(): Promise<void> {
    if (!this.db) await this.init();

    const transaction = this.db!.transaction(['products', 'admin', 'images'], 'readwrite');
    
    await Promise.all([
      new Promise<void>((resolve) => {
        const request = transaction.objectStore('products').clear();
        request.onsuccess = () => resolve();
      }),
      new Promise<void>((resolve) => {
        const request = transaction.objectStore('admin').clear();
        request.onsuccess = () => resolve();
      }),
      new Promise<void>((resolve) => {
        const request = transaction.objectStore('images').clear();
        request.onsuccess = () => resolve();
      }),
    ]);
  }
}

// Instancia singleton
export const indexedDBManager = new IndexedDBManager();

// Hook para usar IndexedDB en componentes React
export function useIndexedDB() {
  return indexedDBManager;
}

export default indexedDBManager;