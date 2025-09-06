// Sistema IA inteligente para guiar al cliente en todo el proceso de compra
import { AISecurityManager, AI_CONFIG } from '@/lib/ai-security';

export interface SmartAssistantContext {
  currentPage: 'home' | 'products' | 'cart' | 'checkout' | 'payment';
  cartItems: any[];
  userInteractions: string[];
  completedSteps: string[];
  missingInformation: string[];
  userLocation?: string;
  projectType?: string;
  experience?: 'principiante' | 'intermedio' | 'experto';
}

export interface SmartAssistantResponse {
  message: string;
  recommendations?: {
    products?: any[];
    actions?: string[];
    nextSteps?: string[];
  };
  urgency: 'low' | 'medium' | 'high';
  type: 'guidance' | 'recommendation' | 'alert' | 'completion';
  confidence: number;
}

export class SmartAssistantService {
  private static readonly OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
  
  // Analizar contexto completo del usuario
  static analyzeUserContext(context: SmartAssistantContext): {
    needsGuidance: boolean;
    priority: string[];
    suggestions: string[];
  } {
    const needsGuidance = context.missingInformation.length > 0 || 
                         context.cartItems.length === 0 ||
                         !context.completedSteps.includes('address') ||
                         !context.completedSteps.includes('delivery_date');

    const priority: string[] = [];
    const suggestions: string[] = [];

    // Prioridades según página actual
    if (context.currentPage === 'home' && context.cartItems.length === 0) {
      priority.push('product_discovery');
      suggestions.push('Descubrir productos según proyecto');
    }

    if (context.currentPage === 'products' && context.cartItems.length === 0) {
      priority.push('product_selection');
      suggestions.push('Ayudar a seleccionar productos correctos');
    }

    if (context.currentPage === 'cart' && context.cartItems.length > 0) {
      priority.push('cart_optimization');
      suggestions.push('Verificar completitud del pedido');
    }

    if (context.currentPage === 'checkout') {
      if (!context.completedSteps.includes('address')) {
        priority.push('address_completion');
        suggestions.push('Completar dirección de entrega');
      }
      if (!context.completedSteps.includes('delivery_date')) {
        priority.push('delivery_scheduling');
        suggestions.push('Programar fecha de entrega');
      }
    }

    return { needsGuidance, priority, suggestions };
  }

  // Generar asistencia contextual inteligente
  static async getContextualAssistance(
    context: SmartAssistantContext,
    userQuery?: string,
    userId: string = 'anonymous',
    ip: string = '127.0.0.1'
  ): Promise<SmartAssistantResponse> {
    
    // Verificar rate limiting
    if (!AISecurityManager.checkRateLimit(userId, ip)) {
      throw new Error('Rate limit exceeded. Intenta de nuevo en un minuto.');
    }

    const analysis = this.analyzeUserContext(context);
    
    try {
      const prompt = this.generateContextualPrompt(context, analysis, userQuery);
      const aiResponse = await this.callOpenAI(prompt);
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(aiResponse);
      } catch {
        throw new Error('Invalid AI response format');
      }

      // Validar respuesta
      if (!AISecurityManager.validateAIResponse(parsedResponse)) {
        throw new Error('AI response failed security validation');
      }

      return {
        message: parsedResponse.message,
        recommendations: parsedResponse.recommendations,
        urgency: parsedResponse.urgency || 'medium',
        type: parsedResponse.type || 'guidance',
        confidence: parsedResponse.confidence || 75
      };

    } catch (error) {
      console.error('Error en Smart Assistant:', error);
      return this.getFallbackAssistance(context, analysis);
    }
  }

  // Generar prompt contextual
  private static generateContextualPrompt(
    context: SmartAssistantContext, 
    analysis: any,
    userQuery?: string
  ): string {
    const contextInfo = {
      pagina_actual: context.currentPage,
      productos_en_carrito: context.cartItems.length,
      pasos_completados: context.completedSteps,
      informacion_faltante: context.missingInformation,
      prioridades: analysis.priority,
      consulta_usuario: userQuery || 'Necesito ayuda con mi compra'
    };

    return `
Eres un asistente experto de ObraExpress especializado en guiar clientes durante todo su proceso de compra de materiales de policarbonato.

CONTEXTO ACTUAL DEL CLIENTE:
${JSON.stringify(contextInfo, null, 2)}

PRODUCTOS DISPONIBLES:
- Policarbonato Alveolar (4mm, 6mm, 8mm) - Para techos, invernaderos
- Policarbonato Ondulado (0.5mm, 0.7mm) - Para marquesinas, pérgolas  
- Perfiles U y Clip - Para instalación de paneles alveolares
- Accesorios de instalación

INSTRUCCIONES PARA ASISTENCIA:
1. Analiza exactamente dónde está el cliente en su proceso de compra
2. Identifica qué información o pasos le faltan
3. Proporciona guidance específico y accionable
4. Si está en checkout sin dirección/fecha, ¡prioriza completar esos datos!
5. Recomienda productos complementarios si su carrito está incompleto
6. Mantén un tono amigable pero profesional

FORMATO DE RESPUESTA (JSON):
{
  "message": "mensaje principal para el cliente",
  "recommendations": {
    "products": ["productos sugeridos si aplica"],
    "actions": ["acciones específicas que debe tomar"],
    "nextSteps": ["próximos pasos en el proceso"]
  },
  "urgency": "low/medium/high",
  "type": "guidance/recommendation/alert/completion",
  "confidence": número del 0-100
}

Responde SOLO en JSON válido.
    `.trim();
  }

  // Llamada segura a OpenAI
  private static async callOpenAI(prompt: string): Promise<string> {
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
          'User-Agent': 'ObraExpress-SmartAssistant/1.0'
        },
        body: JSON.stringify({
          model: AI_CONFIG.model,
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente experto en ventas de ObraExpress. Responde SOLO en formato JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
          temperature: 0.4,
          presence_penalty: 0.1,
          frequency_penalty: 0.1
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

  // Respuesta de respaldo
  private static getFallbackAssistance(
    context: SmartAssistantContext,
    analysis: any
  ): SmartAssistantResponse {
    
    let message = "¡Hola! Estoy aquí para ayudarte con tu compra en ObraExpress.";
    let actions: string[] = [];
    let urgency: 'low' | 'medium' | 'high' = 'medium';
    
    if (context.currentPage === 'checkout' && context.missingInformation.length > 0) {
      message = "Veo que estás en el proceso de pago. Te falta completar algunos datos importantes para procesar tu pedido.";
      urgency = 'high';
      
      if (context.missingInformation.includes('address')) {
        actions.push("Completar dirección de entrega");
      }
      if (context.missingInformation.includes('delivery_date')) {
        actions.push("Seleccionar fecha de entrega");
      }
    } else if (context.cartItems.length === 0) {
      message = "¡Perfecto para empezar! ¿En qué tipo de proyecto estás trabajando? Te ayudo a encontrar los productos ideales.";
      actions.push("Contarme sobre tu proyecto");
      actions.push("Explorar productos de policarbonato");
    } else if (context.currentPage === 'cart') {
      message = "Revisando tu carrito... ¿Te ayudo a verificar que tienes todo lo necesario para tu proyecto?";
      actions.push("Revisar productos complementarios");
      actions.push("Proceder al checkout");
    }

    return {
      message,
      recommendations: {
        actions,
        nextSteps: analysis.suggestions
      },
      urgency,
      type: 'guidance',
      confidence: 80
    };
  }

  // Detectar información faltante en checkout
  static detectMissingCheckoutInfo(checkoutData: any): string[] {
    const missing: string[] = [];
    
    if (!checkoutData.address || !checkoutData.address.street) {
      missing.push('address');
    }
    
    if (!checkoutData.deliveryDate) {
      missing.push('delivery_date');
    }
    
    if (!checkoutData.phone) {
      missing.push('phone');
    }
    
    if (!checkoutData.email) {
      missing.push('email');
    }
    
    return missing;
  }

  // Sugerir productos complementarios basado en carrito
  static suggestComplementaryProducts(cartItems: any[]): any[] {
    const suggestions: any[] = [];
    
    const hasAlveolar = cartItems.some(item => 
      item.nombre?.toLowerCase().includes('alveolar')
    );
    
    const hasProfiles = cartItems.some(item => 
      item.nombre?.toLowerCase().includes('perfil')
    );
    
    // Si tiene alveolar pero no perfiles
    if (hasAlveolar && !hasProfiles) {
      suggestions.push({
        nombre: 'Perfil U para Policarbonato Alveolar',
        razon: 'Necesario para cerrar los extremos de tus paneles alveolares',
        categoria: 'Perfiles Alveolar'
      });
    }
    
    return suggestions;
  }
}