// Capa de seguridad para IA
import crypto from 'crypto';

export class AISecurityManager {
  private static readonly MAX_TOKENS = 1000;
  private static readonly RATE_LIMIT = 10; // requests per minute
  private static readonly SESSION_TIMEOUT = 3600000; // 1 hour
  
  private static userSessions = new Map<string, { requests: number; lastReset: number; sessionId: string }>();

  // Sanitizar entrada del usuario
  static sanitizeInput(input: string): string {
    // Remover caracteres peligrosos
    const cleaned = input
      .replace(/[<>\"']/g, '') // XSS prevention
      .replace(/[\r\n\t]/g, ' ') // Normalizar espacios
      .replace(/\s+/g, ' ') // Múltiples espacios a uno
      .trim();
    
    // Limitar longitud
    return cleaned.slice(0, 500);
  }

  // Rate limiting por usuario/IP
  static checkRateLimit(userId: string, ip: string): boolean {
    const key = `${userId}-${ip}`;
    const now = Date.now();
    const session = this.userSessions.get(key);

    if (!session) {
      this.userSessions.set(key, {
        requests: 1,
        lastReset: now,
        sessionId: crypto.randomUUID()
      });
      return true;
    }

    // Reset counter cada minuto
    if (now - session.lastReset > 60000) {
      session.requests = 1;
      session.lastReset = now;
      return true;
    }

    if (session.requests >= this.RATE_LIMIT) {
      return false;
    }

    session.requests++;
    return true;
  }

  // Generar prompt seguro con contexto limitado
  static generateSecurePrompt(userInput: string, productContext: any): string {
    const sanitizedInput = this.sanitizeInput(userInput);
    
    // Template de prompt con contexto controlado
    return `
Eres un asistente experto en productos de policarbonato para ObraExpress.

CONTEXTO DE PRODUCTOS DISPONIBLES:
${JSON.stringify(productContext, null, 2).slice(0, 2000)}

CONSULTA DEL CLIENTE: "${sanitizedInput}"

INSTRUCCIONES ESTRICTAS:
1. Solo recomienda productos que están en el contexto proporcionado
2. Proporciona información técnica precisa
3. Sugiere cantidades basadas en el uso mencionado
4. Menciona consideraciones de instalación importantes
5. NO inventes productos que no existen en el catálogo
6. NO proporciones información de precios externos
7. Mantén un tono profesional y útil

FORMATO DE RESPUESTA (JSON):
{
  "recomendaciones": [
    {
      "producto": "nombre del producto",
      "razon": "por qué es recomendado",
      "cantidad_sugerida": "cantidad con unidad",
      "consideraciones": "instalación/uso"
    }
  ],
  "pregunta_seguimiento": "pregunta para obtener más información si es necesaria"
}
    `.trim();
  }

  // Validar respuesta de IA
  static validateAIResponse(response: any): boolean {
    try {
      // Si la respuesta tiene un mensaje, es válida
      if (response.message && typeof response.message === 'string') {
        return true;
      }
      
      // Verificar estructura esperada de recomendaciones (opcional)
      if (response.recomendaciones && Array.isArray(response.recomendaciones)) {
        // Validación básica
        for (const rec of response.recomendaciones) {
          // Verificar que no contenga scripts o HTML malicioso
          if (/<script|javascript:|data:/i.test(JSON.stringify(rec))) {
            return false;
          }
        }
        return true;
      }

      // Si tiene algún tipo de respuesta, considerarla válida
      return response && (response.message || response.recommendations || response.recomendaciones);
    } catch {
      return false;
    }
  }

  // Limpiar sesiones expiradas
  static cleanupSessions(): void {
    const now = Date.now();
    for (const [key, session] of this.userSessions.entries()) {
      if (now - session.lastReset > this.SESSION_TIMEOUT) {
        this.userSessions.delete(key);
      }
    }
  }
}

// Configuración segura de OpenAI
export const AI_CONFIG = {
  model: 'gpt-3.5-turbo', // Modelo más económico y seguro
  max_tokens: 800,
  temperature: 0.3, // Respuestas más consistentes
  presence_penalty: 0.2,
  frequency_penalty: 0.2,
  timeout: 15000, // 15 segundos timeout
} as const;