import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase'; // Comentado temporalmente
import { ChatbotKnowledgeService } from '@/modules/chatbot/services/knowledge-base-simple';

// Tipos para el chatbot
interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  context: any;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

// Instancia del servicio de conocimiento
const knowledgeService = new ChatbotKnowledgeService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sessionId, 
      message, 
      userName, 
      userEmail,
      userPhone,
      isFirstMessage 
    } = body;

    // Validar entrada
    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'SessionId y mensaje son requeridos' },
        { status: 400 }
      );
    }

    // Obtener o crear sesión en Supabase
    let session = await getOrCreateSession(sessionId);

    // Si es el primer mensaje, actualizar datos del usuario
    if (isFirstMessage && userName) {
      session = await updateSessionUserData(sessionId, {
        userName,
        userEmail,
        userPhone
      });
    }

    // Agregar mensaje del usuario al historial
    const userMessage: ChatMessage = {
      id: generateMessageId(),
      text: message,
      sender: 'user',
      timestamp: new Date()
    };

    // Obtener respuesta basada en conocimiento
    const responseText = await generateResponse(message, session, isFirstMessage);

    // Crear mensaje de respuesta
    const assistantMessage: ChatMessage = {
      id: generateMessageId(),
      text: responseText,
      sender: 'assistant',
      timestamp: new Date()
    };

    // Actualizar sesión en Supabase
    const updatedMessages = [...(session.messages || []), userMessage, assistantMessage];
    await updateSession(sessionId, {
      messages: updatedMessages,
      lastActivity: new Date().toISOString()
    });

    // Detectar intenciones especiales (redirección, productos, etc)
    const intentions = detectIntentions(responseText);

    return NextResponse.json({
      success: true,
      response: responseText,
      sessionId,
      intentions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en chatbot API:', error);
    return NextResponse.json(
      { error: 'Error procesando mensaje', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'SessionId es requerido' },
        { status: 400 }
      );
    }

    // Obtener historial de la sesión
    const session = await getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session,
      messagesCount: session.messages?.length || 0
    });

  } catch (error) {
    console.error('Error obteniendo sesión:', error);
    return NextResponse.json(
      { error: 'Error obteniendo sesión', details: error.message },
      { status: 500 }
    );
  }
}

// Funciones auxiliares simplificadas (sin Supabase)
async function getOrCreateSession(sessionId: string): Promise<ChatSession> {
  console.log(`[Chatbot API] Creando sesión: ${sessionId}`);
  
  // Por ahora solo crear sesión en memoria
  return {
    sessionId: sessionId,
    messages: [],
    context: {},
    userName: '',
    userEmail: '',
    userPhone: ''
  };
}

async function getSession(sessionId: string): Promise<ChatSession | null> {
  console.log(`[Chatbot API] Buscando sesión: ${sessionId}`);
  
  // Por ahora retornar null - el frontend manejará la persistencia
  return null;
}

async function updateSession(sessionId: string, updates: any) {
  console.log(`[Chatbot API] Actualizando sesión: ${sessionId}`);
  // Sin persistencia por ahora - el frontend maneja localStorage
  return Promise.resolve();
}

async function updateSessionUserData(sessionId: string, userData: any): Promise<ChatSession> {
  console.log(`[Chatbot API] Actualizando datos usuario para sesión: ${sessionId}`);
  
  return {
    sessionId: sessionId,
    messages: [],
    context: {},
    userName: userData.userName || '',
    userEmail: userData.userEmail || '',
    userPhone: userData.userPhone || ''
  };
}

async function generateResponse(message: string, session: ChatSession, isFirstMessage: boolean = false): Promise<string> {
  try {
    // Obtener productos y conocimiento
    const knowledge = await knowledgeService.getKnowledge();
    
    // Analizar mensaje del usuario
    const messageLower = message.toLowerCase();
    
    // Buscar productos mencionados
    const mentionedProducts = knowledge.products.filter(product => 
      messageLower.includes(product.nombre.toLowerCase()) ||
      messageLower.includes(product.categoria?.toLowerCase()) ||
      messageLower.includes(product.tipo?.toLowerCase())
    );

    // Generar respuesta contextual
    if (mentionedProducts.length > 0) {
      return generateProductResponse(mentionedProducts, message);
    }

    // Respuestas para consultas comunes
    if (messageLower.includes('precio') || messageLower.includes('costo')) {
      return generatePriceResponse(knowledge.products);
    }

    if (messageLower.includes('envío') || messageLower.includes('despacho')) {
      return generateShippingResponse();
    }

    if (messageLower.includes('contacto') || messageLower.includes('teléfono')) {
      return generateContactResponse();
    }

    // Saludo inicial - solo para saludos específicos o primer mensaje
    if ((isFirstMessage && session.messages.length === 0) || messageLower.match(/^(hola|hi|buenos|buenas)( |$)/)) {
      return generateWelcomeResponse(session.userName);
    }

    // Respuesta genérica con sugerencias
    return generateDefaultResponse();

  } catch (error) {
    console.error('Error generando respuesta:', error);
    return 'Disculpa, tuve un problema al procesar tu mensaje. ¿Podrías reformular tu consulta?';
  }
}

function generateProductResponse(products: any[], message: string): string {
  const product = products[0];
  return `
Te puedo ayudar con ${product.nombre}. 

📋 **Especificaciones:**
• Espesor: ${product.espesor || 'Variable'}
• Dimensiones: ${product.ancho || '2.10'}m x ${product.largo || '5.80'}m
• Color: ${product.color || 'Cristal'}
• Uso: ${product.uso || 'Techos y coberturas'}

💰 **Precio:** $${(product.precio_con_iva || 0).toLocaleString('es-CL')} (IVA incluido)

${product.stock > 0 ? '✅ Disponible para entrega inmediata' : '⏳ Disponible bajo pedido'}

¿Te gustaría agregar este producto al carrito o necesitas más información?
[ACTION:SHOW_PRODUCT:${product.codigo}]
  `.trim();
}

function generatePriceResponse(products: any[]): string {
  // Obtener algunos productos destacados
  const featured = products.slice(0, 3);
  
  let response = '💰 **Nuestros precios más competitivos:**\n\n';
  
  featured.forEach(product => {
    response += `• ${product.nombre}: $${(product.precio_con_iva || 0).toLocaleString('es-CL')}\n`;
  });
  
  response += '\n📞 Para cotizaciones por volumen, contáctanos directamente.\n';
  response += '[ACTION:REDIRECT_PRODUCTS]';
  
  return response;
}

function generateShippingResponse(): string {
  return `
🚚 **Información de Despacho:**

• Despacho a todo Chile
• Santiago: 24-48 horas
• Regiones: 3-5 días hábiles
• Envío GRATIS en compras sobre $150.000

📅 Puedes agendar tu despacho en la fecha que prefieras.

¿Necesitas calcular el costo de envío a tu comuna?
[ACTION:OPEN_SHIPPING_CALCULATOR]
  `.trim();
}

function generateContactResponse(): string {
  return `
📞 **Contacto Directo:**

• WhatsApp: +56 9 xxxx xxxx
• Email: ventas@obraexpress.cl
• Horario: Lunes a Viernes 9:00 - 18:00

💬 También puedes continuar hablando conmigo aquí.
[ACTION:OPEN_WHATSAPP]
  `.trim();
}

function generateWelcomeResponse(userName?: string): string {
  const greeting = userName ? `¡Hola ${userName}!` : '¡Hola!';
  
  return `
${greeting} 👋 Soy María Elena, tu asesora en ObraExpress.

Estoy aquí para ayudarte con:
• 🏗️ Policarbonato alveolar, compacto y ondulado
• 📐 Perfiles y accesorios de instalación
• 💰 Cotizaciones instantáneas
• 🚚 Información de despacho

¿En qué puedo ayudarte hoy?
  `.trim();
}

function generateDefaultResponse(): string {
  return `
Entiendo tu consulta. Te puedo ayudar con:

• Ver nuestro catálogo de productos [ACTION:REDIRECT_PRODUCTS]
• Calcular precios para tu proyecto
• Información sobre despachos
• Contactar con un asesor [ACTION:OPEN_WHATSAPP]

¿Qué te gustaría saber específicamente?
  `.trim();
}

function detectIntentions(response: string): any {
  const intentions = {
    redirectToProducts: response.includes('[ACTION:REDIRECT_PRODUCTS]'),
    openWhatsApp: response.includes('[ACTION:OPEN_WHATSAPP]'),
    showProduct: null,
    openCart: response.includes('[ACTION:OPEN_CART]'),
    openShippingCalculator: response.includes('[ACTION:OPEN_SHIPPING_CALCULATOR]')
  };

  // Detectar producto específico
  const productMatch = response.match(/\[ACTION:SHOW_PRODUCT:([^\]]+)\]/);
  if (productMatch) {
    intentions.showProduct = productMatch[1];
  }

  return intentions;
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, messages } = body;

    if (!sessionId || !messages) {
      return NextResponse.json(
        { error: 'SessionId y messages son requeridos' },
        { status: 400 }
      );
    }

    // Solo sincronizar mensajes en Supabase (sin generar respuesta)
    await updateSession(sessionId, {
      messages: messages,
      lastActivity: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Mensajes sincronizados',
      sessionId
    });

  } catch (error) {
    console.error('Error sincronizando mensajes:', error);
    return NextResponse.json(
      { error: 'Error sincronizando', details: error.message },
      { status: 500 }
    );
  }
}

function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}