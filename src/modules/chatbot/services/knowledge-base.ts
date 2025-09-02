import { supabase } from '@/lib/supabase';

interface Product {
  codigo: string;
  nombre: string;
  categoria: string;
  tipo?: string;
  espesor?: string;
  ancho?: string;
  largo?: string;
  color?: string;
  uso?: string;
  precio_con_iva: number;
  stock: number;
  disponible_en_web: boolean;
  descripcion?: string;
}

interface KnowledgeBase {
  products: Product[];
  categories: string[];
  faqs: FAQ[];
  lastUpdated: Date;
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

export class ChatbotKnowledgeService {
  private static instance: ChatbotKnowledgeService;
  private knowledge: KnowledgeBase | null = null;
  private lastFetch: Date | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  constructor() {
    // Singleton pattern
    if (ChatbotKnowledgeService.instance) {
      return ChatbotKnowledgeService.instance;
    }
    ChatbotKnowledgeService.instance = this;
  }

  /**
   * Obtiene la base de conocimiento actualizada
   */
  async getKnowledge(): Promise<KnowledgeBase> {
    // Verificar si necesita actualización
    if (this.shouldRefreshCache()) {
      await this.refreshKnowledge();
    }

    return this.knowledge!;
  }

  /**
   * Verifica si el caché necesita actualizarse
   */
  private shouldRefreshCache(): boolean {
    if (!this.knowledge || !this.lastFetch) {
      return true;
    }

    const now = new Date();
    const timeDiff = now.getTime() - this.lastFetch.getTime();
    return timeDiff > this.CACHE_DURATION;
  }

  /**
   * Actualiza la base de conocimiento desde Supabase
   */
  private async refreshKnowledge(): Promise<void> {
    try {
      console.log('[Knowledge Service] Actualizando base de conocimiento...');

      // Obtener productos desde Supabase
      const products = await this.fetchProducts();
      
      // Obtener categorías únicas
      const categories = this.extractCategories(products);
      
      // Obtener FAQs (por ahora hardcodeadas, luego desde Supabase)
      const faqs = this.getDefaultFAQs();

      this.knowledge = {
        products,
        categories,
        faqs,
        lastUpdated: new Date()
      };

      this.lastFetch = new Date();
      
      console.log(`[Knowledge Service] Base actualizada: ${products.length} productos, ${categories.length} categorías`);

    } catch (error) {
      console.error('[Knowledge Service] Error actualizando conocimiento:', error);
      
      // Fallback a datos locales si falla Supabase
      this.loadFallbackKnowledge();
    }
  }

  /**
   * Obtiene productos desde Supabase
   */
  private async fetchProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          codigo,
          nombre,
          categoria,
          tipo,
          espesor,
          ancho,
          largo,
          color,
          uso,
          precio_con_iva,
          stock,
          disponible_en_web
        `)
        .eq('disponible_en_web', true)
        .order('categoria', { ascending: true });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('[Knowledge Service] Error obteniendo productos:', error);
      return [];
    }
  }

  /**
   * Extrae categorías únicas de los productos
   */
  private extractCategories(products: Product[]): string[] {
    const categoriesSet = new Set<string>();
    
    products.forEach(product => {
      if (product.categoria) {
        categoriesSet.add(product.categoria);
      }
    });

    return Array.from(categoriesSet).sort();
  }

  /**
   * Busca productos por término
   */
  async searchProducts(searchTerm: string): Promise<Product[]> {
    const knowledge = await this.getKnowledge();
    const term = searchTerm.toLowerCase();

    return knowledge.products.filter(product => 
      product.nombre.toLowerCase().includes(term) ||
      product.categoria?.toLowerCase().includes(term) ||
      product.tipo?.toLowerCase().includes(term) ||
      product.color?.toLowerCase().includes(term) ||
      product.uso?.toLowerCase().includes(term)
    );
  }

  /**
   * Obtiene productos por categoría
   */
  async getProductsByCategory(category: string): Promise<Product[]> {
    const knowledge = await this.getKnowledge();
    return knowledge.products.filter(product => 
      product.categoria?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Obtiene un producto por código
   */
  async getProductBySku(sku: string): Promise<Product | null> {
    const knowledge = await this.getKnowledge();
    return knowledge.products.find(product => 
      product.codigo === sku
    ) || null;
  }

  /**
   * Obtiene productos recomendados basados en uno específico
   */
  async getRelatedProducts(productSku: string, limit: number = 3): Promise<Product[]> {
    const knowledge = await this.getKnowledge();
    const product = await this.getProductBySku(productSku);

    if (!product) return [];

    // Buscar productos de la misma categoría
    const related = knowledge.products.filter(p => 
      p.codigo !== productSku &&
      p.categoria === product.categoria
    );

    // Ordenar por precio similar
    related.sort((a, b) => {
      const diffA = Math.abs(a.precio_con_iva - product.precio_con_iva);
      const diffB = Math.abs(b.precio_con_iva - product.precio_con_iva);
      return diffA - diffB;
    });

    return related.slice(0, limit);
  }

  /**
   * Obtiene FAQs relevantes para una consulta
   */
  async getRelevantFAQs(query: string): Promise<FAQ[]> {
    const knowledge = await this.getKnowledge();
    const queryLower = query.toLowerCase();

    return knowledge.faqs.filter(faq =>
      faq.question.toLowerCase().includes(queryLower) ||
      faq.answer.toLowerCase().includes(queryLower)
    );
  }

  /**
   * Obtiene estadísticas de la base de conocimiento
   */
  async getStats(): Promise<any> {
    const knowledge = await this.getKnowledge();
    
    return {
      totalProducts: knowledge.products.length,
      totalCategories: knowledge.categories.length,
      totalFAQs: knowledge.faqs.length,
      inStock: knowledge.products.filter(p => p.stock > 0).length,
      lastUpdated: knowledge.lastUpdated,
      cacheAge: this.lastFetch ? 
        Math.floor((new Date().getTime() - this.lastFetch.getTime()) / 1000) : 
        null
    };
  }

  /**
   * FAQs por defecto
   */
  private getDefaultFAQs(): FAQ[] {
    return [
      {
        question: '¿Cuáles son los horarios de atención?',
        answer: 'Atendemos de Lunes a Viernes de 9:00 a 18:00 hrs, y Sábados de 9:00 a 14:00 hrs.',
        category: 'general'
      },
      {
        question: '¿Realizan despachos a regiones?',
        answer: 'Sí, realizamos despachos a todo Chile. Santiago: 24-48 horas. Regiones: 3-5 días hábiles.',
        category: 'envios'
      },
      {
        question: '¿Cuál es el policarbonato más resistente?',
        answer: 'El policarbonato alveolar de 16mm es el más resistente, ideal para grandes estructuras.',
        category: 'productos'
      },
      {
        question: '¿Ofrecen garantía en los productos?',
        answer: 'Todos nuestros productos tienen garantía de 10 años contra amarillamiento y pérdida de transparencia.',
        category: 'garantia'
      },
      {
        question: '¿Cuáles son las formas de pago?',
        answer: 'Aceptamos transferencia bancaria, tarjetas de crédito/débito a través de Transbank, y pagos en efectivo en nuestra tienda.',
        category: 'pagos'
      },
      {
        question: '¿Puedo retirar mi pedido en tienda?',
        answer: 'Sí, puedes retirar tu pedido en nuestra bodega sin costo adicional. Coordina el retiro después de confirmar tu compra.',
        category: 'retiro'
      },
      {
        question: '¿Cuál es la diferencia entre policarbonato alveolar y compacto?',
        answer: 'El alveolar tiene celdas internas que le dan aislación térmica, mientras que el compacto es sólido, más resistente al impacto pero menos aislante.',
        category: 'productos'
      },
      {
        question: '¿Hacen instalación?',
        answer: 'Sí, contamos con un equipo de instaladores profesionales. Solicita una cotización de instalación junto con tu pedido.',
        category: 'servicios'
      },
      {
        question: '¿Tienen descuentos por volumen?',
        answer: 'Sí, ofrecemos descuentos especiales para compras sobre 50 m². Contacta a nuestros asesores para una cotización especial.',
        category: 'precios'
      },
      {
        question: '¿Cómo puedo calcular cuánto material necesito?',
        answer: 'Usa nuestro configurador en línea o envíanos las medidas de tu proyecto y te ayudamos con el cálculo exacto.',
        category: 'ayuda'
      }
    ];
  }

  /**
   * Carga conocimiento de respaldo si falla Supabase
   */
  private loadFallbackKnowledge(): void {
    console.log('[Knowledge Service] Cargando conocimiento de respaldo...');
    
    // Productos de ejemplo (fallback)
    const fallbackProducts: Product[] = [
      {
        codigo: 'PAL-6MM-CR',
        nombre: 'Policarbonato Alveolar 6mm Cristal',
        categoria: 'Policarbonato Alveolar',
        tipo: 'Alveolar',
        espesor: '6mm',
        ancho: '2.10m',
        largo: '5.80m',
        color: 'Cristal',
        uso: 'Techos y coberturas livianas',
        precio_con_iva: 85000,
        stock: 50,
        disponible_en_web: true
      },
      {
        codigo: 'PAL-10MM-CR',
        nombre: 'Policarbonato Alveolar 10mm Cristal',
        categoria: 'Policarbonato Alveolar',
        tipo: 'Alveolar',
        espesor: '10mm',
        ancho: '2.10m',
        largo: '5.80m',
        color: 'Cristal',
        uso: 'Techos y estructuras medianas',
        precio_con_iva: 125000,
        stock: 30,
        disponible_en_web: true
      },
      {
        codigo: 'PC-4MM-CR',
        nombre: 'Policarbonato Compacto 4mm Cristal',
        categoria: 'Policarbonato Compacto',
        tipo: 'Compacto',
        espesor: '4mm',
        ancho: '2.05m',
        largo: '3.05m',
        color: 'Cristal',
        uso: 'Ventanas y divisiones',
        precio_con_iva: 145000,
        stock: 20,
        disponible_en_web: true
      }
    ];

    this.knowledge = {
      products: fallbackProducts,
      categories: ['Policarbonato Alveolar', 'Policarbonato Compacto', 'Accesorios'],
      faqs: this.getDefaultFAQs(),
      lastUpdated: new Date()
    };

    this.lastFetch = new Date();
  }

  /**
   * Limpia el caché forzando una actualización en la próxima consulta
   */
  clearCache(): void {
    this.knowledge = null;
    this.lastFetch = null;
    console.log('[Knowledge Service] Caché limpiado');
  }

  /**
   * Genera un resumen de productos para el chatbot
   */
  async getProductsSummary(): Promise<string> {
    const knowledge = await this.getKnowledge();
    const categories: Record<string, Product[]> = {};

    // Agrupar productos por categoría
    knowledge.products.forEach(product => {
      if (!categories[product.categoria]) {
        categories[product.categoria] = [];
      }
      categories[product.categoria].push(product);
    });

    let summary = 'Productos disponibles:\n\n';

    Object.entries(categories).forEach(([category, products]) => {
      summary += `**${category}:**\n`;
      products.slice(0, 3).forEach(product => {
        summary += `• ${product.nombre} - $${product.precio_con_iva.toLocaleString('es-CL')}\n`;
      });
      if (products.length > 3) {
        summary += `  ...y ${products.length - 3} productos más\n`;
      }
      summary += '\n';
    });

    return summary;
  }
}