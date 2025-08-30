/**
 * Tests para el servicio de base de conocimiento del chatbot
 * Verifica que el chatbot no pierda información y funcione correctamente
 */

import { ChatbotKnowledgeService } from '../../services/chatbot/knowledge-base';

// Mock de Supabase para testing
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [
              {
                codigo: 'PAL-6MM-CR',
                nombre: 'Policarbonato Alveolar 6mm Cristal',
                categoria: 'Policarbonato Alveolar',
                precio_con_iva: 85000,
                stock: 50,
                disponible_en_web: true
              },
              {
                codigo: 'PAL-10MM-CR',
                nombre: 'Policarbonato Alveolar 10mm Cristal',
                categoria: 'Policarbonato Alveolar',
                precio_con_iva: 125000,
                stock: 30,
                disponible_en_web: true
              }
            ],
            error: null
          }))
        }))
      }))
    }))
  }
}));

describe('ChatbotKnowledgeService', () => {
  let knowledgeService;

  beforeEach(() => {
    knowledgeService = new ChatbotKnowledgeService();
    // Limpiar cache antes de cada test
    knowledgeService.clearCache();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Persistencia de Conocimiento', () => {
    test('debe mantener la información en cache por 5 minutos', async () => {
      // Primera llamada - debe cargar desde Supabase
      const knowledge1 = await knowledgeService.getKnowledge();
      expect(knowledge1.products.length).toBe(2);

      // Segunda llamada inmediata - debe usar cache
      const knowledge2 = await knowledgeService.getKnowledge();
      expect(knowledge2).toBe(knowledge1); // Debe ser la misma instancia
    });

    test('debe refrescar cache después del tiempo configurado', async () => {
      // Obtener conocimiento inicial
      const knowledge1 = await knowledgeService.getKnowledge();
      
      // Simular que ha pasado el tiempo de cache (5 minutos)
      jest.useFakeTimers();
      jest.advanceTimersByTime(5 * 60 * 1000 + 1000); // 5 min + 1 seg

      const knowledge2 = await knowledgeService.getKnowledge();
      
      // Aunque el contenido sea igual, debe haber refrescado
      expect(knowledge2.lastUpdated).not.toBe(knowledge1.lastUpdated);
      
      jest.useRealTimers();
    });

    test('debe usar fallback si Supabase falla', async () => {
      // Simular error en Supabase
      const mockError = new Error('Supabase connection failed');
      require('../../lib/supabase').supabase.from.mockImplementation(() => {
        throw mockError;
      });

      const knowledge = await knowledgeService.getKnowledge();
      
      // Debe tener productos de fallback
      expect(knowledge.products.length).toBeGreaterThan(0);
      expect(knowledge.products[0]).toHaveProperty('codigo');
      expect(knowledge.products[0]).toHaveProperty('nombre');
    });
  });

  describe('Búsqueda de Productos', () => {
    test('debe encontrar productos por nombre', async () => {
      const results = await knowledgeService.searchProducts('policarbonato');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].nombre.toLowerCase()).toContain('policarbonato');
    });

    test('debe encontrar productos por categoría', async () => {
      const results = await knowledgeService.searchProducts('alveolar');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].categoria.toLowerCase()).toContain('alveolar');
    });

    test('debe ser case insensitive', async () => {
      const results1 = await knowledgeService.searchProducts('CRISTAL');
      const results2 = await knowledgeService.searchProducts('cristal');
      expect(results1.length).toBe(results2.length);
    });

    test('debe retornar array vacío si no encuentra coincidencias', async () => {
      const results = await knowledgeService.searchProducts('producto_inexistente');
      expect(results).toEqual([]);
    });
  });

  describe('Obtención de Productos por Categoría', () => {
    test('debe filtrar productos por categoría exacta', async () => {
      const results = await knowledgeService.getProductsByCategory('Policarbonato Alveolar');
      expect(results.length).toBeGreaterThan(0);
      results.forEach(product => {
        expect(product.categoria).toBe('Policarbonato Alveolar');
      });
    });

    test('debe ser case insensitive para categorías', async () => {
      const results1 = await knowledgeService.getProductsByCategory('POLICARBONATO ALVEOLAR');
      const results2 = await knowledgeService.getProductsByCategory('policarbonato alveolar');
      expect(results1.length).toBe(results2.length);
    });
  });

  describe('Búsqueda por SKU', () => {
    test('debe encontrar producto por código exacto', async () => {
      const product = await knowledgeService.getProductBySku('PAL-6MM-CR');
      expect(product).not.toBeNull();
      expect(product.codigo).toBe('PAL-6MM-CR');
    });

    test('debe retornar null si no encuentra el SKU', async () => {
      const product = await knowledgeService.getProductBySku('SKU_INEXISTENTE');
      expect(product).toBeNull();
    });
  });

  describe('Productos Relacionados', () => {
    test('debe encontrar productos de la misma categoría', async () => {
      const related = await knowledgeService.getRelatedProducts('PAL-6MM-CR', 5);
      expect(related.length).toBeGreaterThan(0);
      expect(related.length).toBeLessThanOrEqual(5);
      
      // No debe incluir el producto original
      related.forEach(product => {
        expect(product.codigo).not.toBe('PAL-6MM-CR');
      });
    });

    test('debe ordenar por precio similar', async () => {
      const related = await knowledgeService.getRelatedProducts('PAL-6MM-CR', 3);
      
      if (related.length > 1) {
        // Verificar que están ordenados por proximidad de precio
        const originalProduct = await knowledgeService.getProductBySku('PAL-6MM-CR');
        const diff1 = Math.abs(related[0].precio_con_iva - originalProduct.precio_con_iva);
        const diff2 = Math.abs(related[1].precio_con_iva - originalProduct.precio_con_iva);
        expect(diff1).toBeLessThanOrEqual(diff2);
      }
    });
  });

  describe('FAQs Relevantes', () => {
    test('debe encontrar FAQs relacionadas con la consulta', async () => {
      const faqs = await knowledgeService.getRelevantFAQs('horarios');
      expect(faqs.length).toBeGreaterThan(0);
      
      const hasRelevantFaq = faqs.some(faq => 
        faq.question.toLowerCase().includes('horarios') || 
        faq.answer.toLowerCase().includes('horarios')
      );
      expect(hasRelevantFaq).toBe(true);
    });

    test('debe retornar array vacío si no encuentra FAQs relevantes', async () => {
      const faqs = await knowledgeService.getRelevantFAQs('consulta_muy_específica_sin_coincidencias');
      expect(faqs).toEqual([]);
    });
  });

  describe('Estadísticas del Sistema', () => {
    test('debe retornar estadísticas correctas', async () => {
      const stats = await knowledgeService.getStats();
      
      expect(stats).toHaveProperty('totalProducts');
      expect(stats).toHaveProperty('totalCategories');
      expect(stats).toHaveProperty('totalFAQs');
      expect(stats).toHaveProperty('inStock');
      expect(stats).toHaveProperty('lastUpdated');
      
      expect(typeof stats.totalProducts).toBe('number');
      expect(typeof stats.totalCategories).toBe('number');
      expect(stats.totalProducts).toBeGreaterThan(0);
    });

    test('debe mostrar edad del cache', async () => {
      await knowledgeService.getKnowledge(); // Cargar cache
      
      // Esperar un poco
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const stats = await knowledgeService.getStats();
      expect(stats.cacheAge).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Singleton Pattern', () => {
    test('debe mantener la misma instancia', () => {
      const service1 = new ChatbotKnowledgeService();
      const service2 = new ChatbotKnowledgeService();
      expect(service1).toBe(service2);
    });
  });

  describe('Manejo de Errores', () => {
    test('debe manejar errores de conexión gracefully', async () => {
      // Simular error de red
      const originalFetch = global.fetch;
      global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

      const knowledge = await knowledgeService.getKnowledge();
      
      // Debe funcionar con datos de fallback
      expect(knowledge.products.length).toBeGreaterThan(0);
      
      global.fetch = originalFetch;
    });
  });

  describe('Limpieza de Cache', () => {
    test('debe limpiar cache correctamente', async () => {
      // Cargar datos
      await knowledgeService.getKnowledge();
      
      // Limpiar cache
      knowledgeService.clearCache();
      
      // Próxima llamada debe recargar
      const knowledge = await knowledgeService.getKnowledge();
      expect(knowledge).toBeDefined();
    });
  });
});

describe('Integración Completa del Chatbot', () => {
  test('debe simular una conversación completa sin pérdida de datos', async () => {
    const service = new ChatbotKnowledgeService();
    
    // Simular consulta de producto
    const searchResults = await service.searchProducts('policarbonato 6mm');
    expect(searchResults.length).toBeGreaterThan(0);
    
    // Obtener detalles del producto
    const product = searchResults[0];
    const productDetails = await service.getProductBySku(product.codigo);
    expect(productDetails).not.toBeNull();
    expect(productDetails.codigo).toBe(product.codigo);
    
    // Obtener productos relacionados
    const related = await service.getRelatedProducts(product.codigo, 3);
    expect(related.length).toBeGreaterThan(0);
    
    // Buscar FAQs relevantes
    const faqs = await service.getRelevantFAQs('precio');
    expect(faqs.length).toBeGreaterThan(0);
    
    // Todo debe funcionar sin pérdida de información
    const stats = await service.getStats();
    expect(stats.totalProducts).toBeGreaterThan(0);
  });
});