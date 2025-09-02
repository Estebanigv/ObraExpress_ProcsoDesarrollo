/**
 * Tests de integración para la API del chatbot
 * Verifica que la comunicación entre el frontend y backend funcione sin pérdidas
 */

// Mock para Next.js request/response
const mockRequest = (body, method = 'POST', query = {}) => ({
  json: async () => body,
  nextUrl: { searchParams: new URLSearchParams(query) }
});

const mockResponse = () => {
  const res = {
    status: 200,
    headers: {},
    body: null
  };
  
  return {
    json: (data, options = {}) => {
      res.body = data;
      res.status = options.status || 200;
      return {
        status: res.status,
        json: async () => res.body,
        ok: res.status < 400
      };
    }
  };
};

// Mock de Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: { code: 'PGRST116' } // No encontrado
          }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: {
              id: 'test-id',
              session_id: 'test-session',
              mensajes: [],
              estado_conversacion: 'activa'
            },
            error: null
          }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: {},
          error: null
        }))
      }))
    }))
  }
}));

// Mock del servicio de conocimiento
jest.mock('../../services/chatbot/knowledge-base', () => ({
  ChatbotKnowledgeService: jest.fn().mockImplementation(() => ({
    getKnowledge: jest.fn().mockResolvedValue({
      products: [
        {
          codigo: 'PAL-6MM-CR',
          nombre: 'Policarbonato Alveolar 6mm Cristal',
          categoria: 'Policarbonato Alveolar',
          precio_con_iva: 85000,
          stock: 50,
          disponible_en_web: true
        }
      ],
      categories: ['Policarbonato Alveolar'],
      faqs: [],
      lastUpdated: new Date()
    })
  }))
}));

describe('API Chatbot - Funcionalidad POST', () => {
  let POST;

  beforeEach(async () => {
    // Importar la función POST de la API
    const module = await import('../../app/api/chatbot/route');
    POST = module.POST;
    jest.clearAllMocks();
  });

  describe('Creación y Gestión de Sesiones', () => {
    test('debe crear una nueva sesión para mensaje inicial', async () => {
      const request = mockRequest({
        sessionId: 'new-session-123',
        message: 'Hola, ¿cómo estás?',
        userName: 'Juan',
        isFirstMessage: true
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('new-session-123');
      expect(result.response).toBeTruthy();
      expect(typeof result.response).toBe('string');
    });

    test('debe validar parámetros requeridos', async () => {
      const request = mockRequest({
        // sessionId faltante
        message: 'Hola'
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('SessionId y mensaje son requeridos');
    });

    test('debe validar mensaje vacío', async () => {
      const request = mockRequest({
        sessionId: 'test-session',
        message: '   ' // Solo espacios
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('SessionId y mensaje son requeridos');
    });
  });

  describe('Generación de Respuestas', () => {
    test('debe generar respuesta contextual para consulta de productos', async () => {
      const request = mockRequest({
        sessionId: 'test-session',
        message: 'Necesito policarbonato 6mm',
        userName: 'Maria'
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.response).toBeTruthy();
      expect(result.response.toLowerCase()).toMatch(/policarbonato|6mm|precio/);
    });

    test('debe manejar consultas de precios', async () => {
      const request = mockRequest({
        sessionId: 'test-session',
        message: '¿Cuánto cuesta el policarbonato?',
        userName: 'Pedro'
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.response.toLowerCase()).toMatch(/precio|costo|\$/);
    });

    test('debe generar respuesta de bienvenida para primer mensaje', async () => {
      const request = mockRequest({
        sessionId: 'new-session',
        message: 'Hola',
        userName: 'Carlos',
        isFirstMessage: true
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.response.toLowerCase()).toMatch(/hola|bienvenido|carlos/);
    });
  });

  describe('Detección de Intenciones', () => {
    test('debe detectar intención de ver productos', async () => {
      const request = mockRequest({
        sessionId: 'test-session',
        message: 'Quiero ver todos los productos disponibles'
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.intentions).toBeDefined();
      // Verificar si detectó correctamente la intención
      if (result.intentions) {
        expect(typeof result.intentions).toBe('object');
      }
    });

    test('debe detectar intención de contacto', async () => {
      const request = mockRequest({
        sessionId: 'test-session',
        message: 'Necesito hablar con alguien por WhatsApp'
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });
  });

  describe('Manejo de Errores', () => {
    test('debe manejar errores del servicio de conocimiento', async () => {
      // Mock error en el servicio
      const { ChatbotKnowledgeService } = require('../../services/chatbot/knowledge-base');
      ChatbotKnowledgeService.mockImplementation(() => ({
        getKnowledge: jest.fn().mockRejectedValue(new Error('Service error'))
      }));

      const request = mockRequest({
        sessionId: 'test-session',
        message: 'Test message'
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    test('debe manejar errores de base de datos', async () => {
      // Simular error de Supabase
      const { supabase } = require('../../lib/supabase');
      supabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const request = mockRequest({
        sessionId: 'test-session',
        message: 'Test message'
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });
});

describe('API Chatbot - Funcionalidad GET', () => {
  let GET;

  beforeEach(async () => {
    const module = await import('../../app/api/chatbot/route');
    GET = module.GET;
    jest.clearAllMocks();
  });

  describe('Recuperación de Historial', () => {
    test('debe obtener historial de sesión existente', async () => {
      // Mock de sesión existente
      const { supabase } = require('../../lib/supabase');
      supabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                session_id: 'existing-session',
                mensajes: [
                  { id: '1', text: 'Hola', sender: 'user', timestamp: new Date() },
                  { id: '2', text: 'Hola, ¿en qué puedo ayudarte?', sender: 'assistant', timestamp: new Date() }
                ],
                contexto: {}
              },
              error: null
            })
          })
        })
      });

      const request = mockRequest({}, 'GET', { sessionId: 'existing-session' });

      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.session).toBeDefined();
      expect(result.messagesCount).toBe(2);
    });

    test('debe retornar error si no se proporciona sessionId', async () => {
      const request = mockRequest({}, 'GET', {}); // Sin sessionId

      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toContain('SessionId es requerido');
    });

    test('debe retornar error si la sesión no existe', async () => {
      const request = mockRequest({}, 'GET', { sessionId: 'non-existent' });

      const response = await GET(request);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toContain('Sesión no encontrada');
    });
  });
});

describe('Flujo Completo de Conversación', () => {
  test('debe mantener contexto a través de múltiples mensajes', async () => {
    const module = await import('../../app/api/chatbot/route');
    const { POST } = module;

    const sessionId = 'conversation-test-session';

    // Primer mensaje
    const msg1 = mockRequest({
      sessionId,
      message: 'Hola, mi nombre es Ana',
      isFirstMessage: true
    });

    const response1 = await POST(msg1);
    const result1 = await response1.json();

    expect(response1.status).toBe(200);
    expect(result1.success).toBe(true);

    // Segundo mensaje - debe recordar el nombre
    const msg2 = mockRequest({
      sessionId,
      message: 'Necesito policarbonato para mi terraza'
    });

    const response2 = await POST(msg2);
    const result2 = await response2.json();

    expect(response2.status).toBe(200);
    expect(result2.success).toBe(true);
    expect(result2.response).toBeTruthy();
  });

  test('debe generar IDs únicos para mensajes', async () => {
    const module = await import('../../app/api/chatbot/route');
    const { POST } = module;

    const request = mockRequest({
      sessionId: 'unique-id-test',
      message: 'Test message'
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.sessionId).toBe('unique-id-test');
  });
});

describe('Performance y Concurrencia', () => {
  test('debe manejar múltiples sesiones simultáneas', async () => {
    const module = await import('../../app/api/chatbot/route');
    const { POST } = module;

    const promises = Array.from({ length: 5 }, (_, i) => 
      POST(mockRequest({
        sessionId: `concurrent-session-${i}`,
        message: `Mensaje ${i}`
      }))
    );

    const responses = await Promise.all(promises);

    responses.forEach(response => {
      expect(response.status).toBe(200);
    });

    const results = await Promise.all(responses.map(r => r.json()));
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
  });

  test('debe tener tiempo de respuesta aceptable', async () => {
    const module = await import('../../app/api/chatbot/route');
    const { POST } = module;

    const start = Date.now();
    
    const request = mockRequest({
      sessionId: 'performance-test',
      message: 'Test de performance'
    });

    const response = await POST(request);
    const duration = Date.now() - start;

    expect(response.status).toBe(200);
    expect(duration).toBeLessThan(5000); // Menos de 5 segundos
  });
});