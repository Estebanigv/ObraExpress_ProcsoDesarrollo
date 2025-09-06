// API endpoint para recomendaciones IA
import { NextRequest, NextResponse } from 'next/server';
import { AIRecommendationService } from '@/services/ai-recommendations';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // 1. Verificar método y headers
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const origin = headersList.get('origin') || '';
    const referer = headersList.get('referer') || '';
    
    // Verificar que la solicitud viene de nuestro dominio
    if (!referer.includes('localhost') && !referer.includes('obraexpress.com')) {
      return NextResponse.json(
        { error: 'Unauthorized origin' },
        { status: 403 }
      );
    }

    // 2. Obtener IP del cliente
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1';

    // 3. Parsear y validar body
    const body = await request.json();
    
    if (!body.consulta || typeof body.consulta !== 'string') {
      return NextResponse.json(
        { error: 'Consulta es requerida' },
        { status: 400 }
      );
    }

    if (body.consulta.length > 500) {
      return NextResponse.json(
        { error: 'Consulta demasiado larga' },
        { status: 400 }
      );
    }

    // 4. Generar ID de usuario (en producción sería del auth)
    const userId = body.user_id || `anonymous-${ip}`;

    // 5. Llamar al servicio de IA
    const recommendations = await AIRecommendationService.getRecommendations(
      {
        consulta: body.consulta,
        productos_en_carrito: body.productos_en_carrito || [],
        presupuesto_aproximado: body.presupuesto_aproximado,
        tipo_proyecto: body.tipo_proyecto,
        experiencia_usuario: body.experiencia_usuario || 'principiante'
      },
      userId,
      ip
    );

    // 6. Log para monitoreo (sin datos sensibles)
    console.log(`AI Recommendation - IP: ${ip}, Confidence: ${recommendations.confianza_global}%`);

    // 7. Respuesta segura
    return NextResponse.json({
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('AI Recommendations API Error:', error);

    // No exponer detalles internos del error
    if (error.message.includes('Rate limit')) {
      return NextResponse.json(
        { error: 'Demasiadas consultas. Intenta de nuevo en un minuto.' },
        { status: 429 }
      );
    }

    if (error.message.includes('OpenAI')) {
      return NextResponse.json(
        { error: 'Servicio temporalmente no disponible. Intenta de nuevo.' },
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

export async function PUT() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Método no permitido' },
    { status: 405 }
  );
}