// Servicio de recomendaciones inteligentes
import { AISecurityManager, AI_CONFIG } from '@/lib/ai-security';

export interface AIRecommendation {
  producto: string;
  razon: string;
  cantidad_sugerida: string;
  consideraciones: string;
  confianza?: number;
}

export interface AIRecommendationRequest {
  consulta: string;
  productos_en_carrito?: any[];
  presupuesto_aproximado?: number;
  tipo_proyecto?: string;
  experiencia_usuario?: 'principiante' | 'intermedio' | 'experto';
}

export interface AIRecommendationResponse {
  recomendaciones: AIRecommendation[];
  pregunta_seguimiento?: string;
  confianza_global: number;
  session_id: string;
}

export class AIRecommendationService {
  private static readonly OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
  
  // Obtener contexto de productos para IA
  private static async getProductContext(): Promise<any> {
    try {
      // En producción, esto vendría de tu base de datos
      const productos = {
        policarbonato_alveolar: {
          tipos: ['4mm Clear', '4mm Bronce', '6mm Clear', '8mm Clear'],
          usos: ['techos', 'invernaderos', 'cubiertas', 'tragaluces'],
          precio_referencia: '$16.000-$130.000 por panel',
          medidas_disponibles: ['1.05x2.9m', '2.1x2.9m', '2.1x5.8m', '2.1x8.7m']
        },
        policarbonato_ondulado: {
          tipos: ['0.5mm Clear/Bronce/Opal', '0.7mm Clear/Bronce/Opal'],
          usos: ['techos livianos', 'marquesinas', 'pérgolas'],
          precio_referencia: '$6.500-$21.000 por panel',
          medidas_disponibles: ['0.81x2m', '0.81x2.5m', '0.81x3m']
        },
        perfiles_alveolar: {
          perfil_u: {
            uso: 'cerrar extremos de paneles alveolares',
            precio_referencia: '$840-$1.250',
            espesores: ['4mm', '6mm', '8mm']
          },
          perfil_clip: {
            uso: 'unir paneles sin tornillos',
            precio_referencia: '$1.250-$1.850',
            espesores: ['4mm', '6mm', '8mm']
          }
        }
      };

      return productos;
    } catch (error) {
      console.error('Error obteniendo contexto de productos:', error);
      return {};
    }
  }

  // Llamada segura a OpenAI
  private static async callOpenAI(prompt: string): Promise<any> {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeout);

    try {
      const response = await fetch(this.OPENAI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'ObraExpress-AI/1.0'
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en productos de policarbonato. Responde SOLO en formato JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: AI_CONFIG.max_tokens,
          temperature: AI_CONFIG.temperature,
          presence_penalty: AI_CONFIG.presence_penalty,
          frequency_penalty: AI_CONFIG.frequency_penalty
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // Método principal para obtener recomendaciones
  static async getRecommendations(
    request: AIRecommendationRequest,
    userId: string,
    ip: string
  ): Promise<AIRecommendationResponse> {
    
    // 1. Verificar rate limiting
    if (!AISecurityManager.checkRateLimit(userId, ip)) {
      throw new Error('Rate limit exceeded. Intenta de nuevo en un minuto.');
    }

    // 2. Obtener contexto de productos
    const productContext = await this.getProductContext();

    // 3. Generar prompt seguro
    const securePrompt = AISecurityManager.generateSecurePrompt(
      request.consulta,
      productContext
    );

    try {
      // 4. Llamar a OpenAI
      const aiResponse = await this.callOpenAI(securePrompt);
      
      // 5. Parsear respuesta JSON
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch {
        throw new Error('Invalid AI response format');
      }

      // 6. Validar respuesta
      if (!AISecurityManager.validateAIResponse(parsedResponse)) {
        throw new Error('AI response failed security validation');
      }

      // 7. Calcular confianza basada en productos conocidos
      const confianza = this.calculateConfidence(parsedResponse, productContext);

      return {
        recomendaciones: parsedResponse.recomendaciones,
        pregunta_seguimiento: parsedResponse.pregunta_seguimiento,
        confianza_global: confianza,
        session_id: crypto.randomUUID()
      };

    } catch (error) {
      console.error('Error en recomendación IA:', error);
      
      // Fallback a recomendaciones estáticas seguras
      return this.getFallbackRecommendations(request);
    }
  }

  // Calcular confianza en las recomendaciones
  private static calculateConfidence(response: any, productContext: any): number {
    let confidence = 0;
    const recommendations = response.recomendaciones || [];
    
    for (const rec of recommendations) {
      // Verificar si el producto existe en nuestro contexto
      const productName = rec.producto.toLowerCase();
      let found = false;
      
      if (productName.includes('alveolar') || 
          productName.includes('ondulado') || 
          productName.includes('perfil')) {
        found = true;
      }
      
      confidence += found ? 20 : 0;
    }
    
    return Math.min(confidence, 100);
  }

  // Recomendaciones de respaldo seguras
  private static getFallbackRecommendations(request: AIRecommendationRequest): AIRecommendationResponse {
    const consulta = request.consulta.toLowerCase();
    
    let recomendaciones: AIRecommendation[] = [];
    
    if (consulta.includes('techo') || consulta.includes('cubierta')) {
      recomendaciones.push({
        producto: 'Policarbonato Alveolar 6mm Clear',
        razon: 'Ideal para techos por su resistencia estructural y aislamiento térmico',
        cantidad_sugerida: 'Calcular según área del techo',
        consideraciones: 'Requiere perfiles U para cerrar extremos'
      });
    }
    
    if (consulta.includes('invernadero')) {
      recomendaciones.push({
        producto: 'Policarbonato Alveolar 4mm Clear',
        razon: 'Perfecto balance entre transmisión de luz y aislamiento para plantas',
        cantidad_sugerida: 'Según dimensiones del invernadero',
        consideraciones: 'Considerar ventilación para evitar condensación'
      });
    }

    return {
      recomendaciones,
      pregunta_seguimiento: '¿Podrías contarme más detalles sobre tu proyecto?',
      confianza_global: 75,
      session_id: crypto.randomUUID()
    };
  }
}

// Limpiar sesiones cada hora
setInterval(() => {
  AISecurityManager.cleanupSessions();
}, 3600000);