// API para asistente inteligente contextual
import { NextRequest, NextResponse } from 'next/server';
import { SmartAssistantService, SmartAssistantContext } from '@/services/smart-assistant';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Verificar origen de la solicitud
    const headersList = await headers();
    const referer = headersList.get('referer') || '';
    
    if (!referer.includes('localhost') && !referer.includes('obraexpress.com')) {
      return NextResponse.json(
        { error: 'Unauthorized origin' },
        { status: 403 }
      );
    }

    // Obtener IP del cliente
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';

    // Parsear body
    const body = await request.json();
    
    if (!body.context) {
      return NextResponse.json(
        { error: 'Context is required' },
        { status: 400 }
      );
    }

    // Validar context
    const context: SmartAssistantContext = {
      currentPage: body.context.currentPage || 'home',
      cartItems: body.context.cartItems || [],
      userInteractions: body.context.userInteractions || [],
      completedSteps: body.context.completedSteps || [],
      missingInformation: body.context.missingInformation || [],
      userLocation: body.context.userLocation,
      projectType: body.context.projectType,
      experience: body.context.experience || 'principiante'
    };

    // Generar ID de usuario
    const userId = body.userId || `anonymous-${ip}`;

    // Obtener asistencia contextual
    const assistance = await SmartAssistantService.getContextualAssistance(
      context,
      body.userQuery,
      userId,
      ip
    );

    // Log para monitoreo
    console.log(`Smart Assistant - Page: ${context.currentPage}, Items: ${context.cartItems.length}, Confidence: ${assistance.confidence}%`);

    return NextResponse.json({
      success: true,
      data: assistance,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Smart Assistant API Error:', error);

    // Manejo seguro de errores
    if (error.message.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Demasiadas consultas. Intenta de nuevo en un minuto.' },
        { status: 429 }
      );
    }

    if (error.message.includes('OpenAI')) {
      return NextResponse.json(
        { error: 'Servicio IA temporalmente no disponible. Intenta de nuevo.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Solo permitir POST
export async function GET() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}