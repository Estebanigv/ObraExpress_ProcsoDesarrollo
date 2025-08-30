/**
 * Servicio de base de conocimiento simplificado para chatbot
 * Versión que funciona sin dependencias de Supabase
 */

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

  constructor() {
    if (ChatbotKnowledgeService.instance) {
      return ChatbotKnowledgeService.instance;
    }
    ChatbotKnowledgeService.instance = this;
  }

  /**
   * Obtiene la base de conocimiento (versión simplificada)
   */
  async getKnowledge(): Promise<KnowledgeBase> {
    if (!this.knowledge) {
      console.log('[Knowledge Service] Inicializando base de conocimiento...');
      
      // Usar productos hardcodeados por ahora
      const products = this.getDefaultProducts();
      const categories = this.extractCategories(products);
      const faqs = this.getDefaultFAQs();

      this.knowledge = {
        products,
        categories,
        faqs,
        lastUpdated: new Date()
      };

      console.log(`[Knowledge Service] ✅ Base inicializada: ${products.length} productos, ${categories.length} categorías`);
    }

    return this.knowledge;
  }

  /**
   * Productos por defecto (datos reales de ObraExpress)
   */
  private getDefaultProducts(): Product[] {
    return [
      {
        codigo: 'PAL-6MM-CR',
        nombre: 'Policarbonato Alveolar 6mm Cristal',
        categoria: 'Policarbonato Alveolar',
        tipo: 'Alveolar',
        espesor: '6mm',
        ancho: '2.10m',
        largo: '5.80m',
        color: 'Cristal',
        uso: 'Techos y coberturas livianas, pérgolas',
        precio_con_iva: 85000,
        stock: 50,
        disponible_en_web: true,
        descripcion: 'Ideal para proyectos residenciales y comerciales ligeros'
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
        uso: 'Techos estructuras medianas, terrazas',
        precio_con_iva: 125000,
        stock: 30,
        disponible_en_web: true,
        descripcion: 'Mayor resistencia y aislamiento térmico'
      },
      {
        codigo: 'PAL-16MM-CR',
        nombre: 'Policarbonato Alveolar 16mm Cristal',
        categoria: 'Policarbonato Alveolar',
        tipo: 'Alveolar',
        espesor: '16mm',
        ancho: '2.10m',
        largo: '5.80m',
        color: 'Cristal',
        uso: 'Estructuras grandes, naves industriales',
        precio_con_iva: 185000,
        stock: 15,
        disponible_en_web: true,
        descripcion: 'Máxima resistencia estructural'
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
        uso: 'Ventanas, divisiones, mamparas',
        precio_con_iva: 145000,
        stock: 20,
        disponible_en_web: true,
        descripcion: 'Transparencia cristalina, anti-impacto'
      },
      {
        codigo: 'PC-6MM-CR',
        nombre: 'Policarbonato Compacto 6mm Cristal',
        categoria: 'Policarbonato Compacto',
        tipo: 'Compacto',
        espesor: '6mm',
        ancho: '2.05m',
        largo: '3.05m',
        color: 'Cristal',
        uso: 'Cerramientos, ventanas grandes',
        precio_con_iva: 210000,
        stock: 18,
        disponible_en_web: true,
        descripcion: 'Mayor espesor para aplicaciones exigentes'
      },
      {
        codigo: 'PON-8MM-CR',
        nombre: 'Policarbonato Ondulado 8mm Cristal',
        categoria: 'Policarbonato Ondulado',
        tipo: 'Ondulado',
        espesor: '8mm',
        ancho: '1.05m',
        largo: '3.00m',
        color: 'Cristal',
        uso: 'Techos curvos, galpones, invernaderos',
        precio_con_iva: 95000,
        stock: 25,
        disponible_en_web: true,
        descripcion: 'Diseño ondulado para mayor resistencia'
      },
      {
        codigo: 'PON-8MM-BR',
        nombre: 'Policarbonato Ondulado 8mm Bronce',
        categoria: 'Policarbonato Ondulado',
        tipo: 'Ondulado',
        espesor: '8mm',
        ancho: '1.05m',
        largo: '3.00m',
        color: 'Bronce',
        uso: 'Techos decorativos, filtro solar',
        precio_con_iva: 98000,
        stock: 22,
        disponible_en_web: true,
        descripcion: 'Color bronce reduce el paso de luz'
      },
      {
        codigo: 'PERFIL-H-10',
        nombre: 'Perfil H Aluminio 10mm',
        categoria: 'Accesorios',
        tipo: 'Perfil',
        uso: 'Unión entre placas alveolares 10mm',
        precio_con_iva: 35000,
        stock: 100,
        disponible_en_web: true,
        descripcion: 'Perfil de unión indispensable'
      },
      {
        codigo: 'PERFIL-U-10',
        nombre: 'Perfil U Aluminio 10mm',
        categoria: 'Accesorios',
        tipo: 'Perfil',
        uso: 'Terminación y sellado de bordes',
        precio_con_iva: 28000,
        stock: 80,
        disponible_en_web: true,
        descripcion: 'Perfil para terminaciones perfectas'
      },
      {
        codigo: 'TORNILLO-PACK',
        nombre: 'Kit Tornillos + Arandela Estanca',
        categoria: 'Accesorios',
        tipo: 'Fijaciones',
        uso: 'Fijación de policarbonato a estructura',
        precio_con_iva: 15000,
        stock: 200,
        disponible_en_web: true,
        descripcion: 'Pack 50 unidades con arandela anti-goteo'
      }
    ];
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
      }
    ];
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
      source: 'local' // Indicar que es fuente local
    };
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

  /**
   * Limpia el caché (no hace nada en esta versión simple)
   */
  clearCache(): void {
    this.knowledge = null;
    console.log('[Knowledge Service] Caché limpiado');
  }
}