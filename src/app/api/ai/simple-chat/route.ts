// API simplificada para chat con IA
import { NextRequest, NextResponse } from 'next/server';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key no configurada');
      return NextResponse.json({
        success: true,
        response: 'Hola! Soy el asistente de ObraExpress. ¿En qué puedo ayudarte con tus materiales de construcción?',
        isDefault: true
      });
    }

    // Llamar a OpenAI
    const response = await fetch(OPENAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente experto de ObraExpress, especializado en materiales de policarbonato para construcción. 
            Productos disponibles:
            - Policarbonato Alveolar (4mm, 6mm, 8mm) para techos e invernaderos
            - Policarbonato Ondulado para pérgolas y marquesinas
            - Perfiles U y Clip para instalación
            Sé amable, útil y profesional. Responde en español.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error OpenAI:', errorText);
      
      // Respuesta de fallback
      return NextResponse.json({
        success: true,
        response: 'Gracias por tu consulta! Te puedo ayudar con:\n• Policarbonato Alveolar para techos\n• Policarbonato Ondulado para pérgolas\n• Perfiles y accesorios\n¿Qué proyecto tienes en mente?',
        isDefault: true
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Lo siento, no pude procesar tu solicitud.';

    return NextResponse.json({
      success: true,
      response: aiResponse,
      isDefault: false
    });

  } catch (error: any) {
    console.error('Error en Simple Chat API:', error);
    
    // Respuesta de fallback amigable
    return NextResponse.json({
      success: true,
      response: '¡Hola! Soy tu asistente de ObraExpress. Puedo ayudarte a elegir:\n• Policarbonato para techos\n• Materiales para invernaderos\n• Perfiles de instalación\n¿Qué necesitas para tu proyecto?',
      isDefault: true
    });
  }
}