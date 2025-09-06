// API simplificada para chat con IA con conexi\u00f3n a base de datos de productos
import { NextRequest, NextResponse } from 'next/server';

const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Función para obtener productos y precios de la base de datos
async function obtenerProductosYPrecios() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002';
    const response = await fetch(`${baseUrl}/api/productos-publico`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
      }
    });
    
    if (!response.ok) {
      throw new Error('Error al obtener productos');
    }
    
    const data = await response.json();
    return data.data?.productos_por_categoria || {};
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    return {};
  }
}

// Función para crear contexto de productos para la IA
function crearContextoProductos(productos: any) {
  let contexto = 'PRODUCTOS DISPONIBLES EN OBRAEXPRESS:\\n\\n';
  
  Object.entries(productos).forEach(([categoria, productosCategoria]: [string, any]) => {
    contexto += `\\n=== ${categoria.toUpperCase()} ===\\n`;
    
    (productosCategoria as any[]).forEach((producto: any) => {
      contexto += `\\n• ${producto.nombre}\\n`;
      if (producto.descripcion) {
        contexto += `  Descripción: ${producto.descripcion}\\n`;
      }
      
      if (producto.variantes && producto.variantes.length > 0) {
        contexto += `  Variantes disponibles:\\n`;
        producto.variantes.slice(0, 5).forEach((variante: any) => {
          contexto += `    - ${variante.nombre}\\n`;
          if (variante.dimensiones) {
            contexto += `      Dimensiones: ${variante.dimensiones}\\n`;
          }
          if (variante.color) {
            contexto += `      Color: ${variante.color}\\n`;
          }
          if (variante.precio_con_iva) {
            contexto += `      Precio: $${variante.precio_con_iva.toLocaleString('es-CL')} (IVA incluido)\\n`;
          }
          if (variante.stock_disponible) {
            contexto += `      Disponibilidad: ${variante.stock_disponible}\\n`;
          }
        });
        
        if (producto.variantes.length > 5) {
          contexto += `    ... y ${producto.variantes.length - 5} variantes más\\n`;
        }
      }
    });
  });
  
  return contexto;
}

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
        response: 'Bienvenido al Centro de Asesoría de ObraExpress. Soy su especialista en materiales de policarbonato. ¿En qué puedo asistirle hoy?',
        isDefault: true
      });
    }

    // Obtener productos y precios actuales de la base de datos
    console.log('🔍 Obteniendo productos y precios de la base de datos...');
    const productos = await obtenerProductosYPrecios();
    const contextoProductos = crearContextoProductos(productos);

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

IMPORTANTE: Tienes acceso a la base de datos completa de productos con precios reales actualizados.

${contextoProductos}

INSTRUCCIONES:
1. Siempre proporciona precios exactos cuando te pregunten por productos específicos
2. Menciona las dimensiones y colores disponibles
3. Informa sobre la disponibilidad de stock
4. Todos los precios incluyen IVA
5. Sugiere productos alternativos si el cliente busca algo específico
6. Puedes hacer cálculos de cantidades necesarias para proyectos
7. Proporciona información sobre usos y aplicaciones de cada producto
8. Sé amable, útil y profesional
9. Responde siempre en español

IMPORTANTE - RECOMENDACIONES AUTOMÁTICAS PARA POLICARBONATO ALVEOLAR:
Cuando un cliente consulte por policarbonato alveolar, SIEMPRE recomienda estos accesorios OBLIGATORIOS para instalación profesional:

Para cada plancha de policarbonato alveolar el cliente DEBE llevar:
• 2 Perfiles U (uno para extremo superior, uno para extremo inferior)
• Perfil Clip Plano: N-1 (si compra 4 planchas = 3 perfiles clip)
• Kit Alveolar 1 1/2: 1 kit por cada 2 planchas (incluye tornillos y cintas para 2 planchas de 1.05x2.90m)

EJEMPLO: Para 4 planchas alveolares necesita:
- 8 Perfiles U (4 planchas × 2)
- 3 Perfiles Clip Plano (4 planchas - 1)
- 2 Kits Alveolares 1 1/2 (4 planchas ÷ 2)

Menciona que sin estos accesorios la instalación NO será profesional ni duradera. Los perfiles garantizan sellado hermético y durabilidad de 10+ años.

Si no encuentras un producto específico, sugiere alternativas similares de nuestro catálogo.`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error OpenAI:', errorText);
      
      // Respuesta de fallback con productos reales
      const categoriasDisponibles = Object.keys(productos);
      let fallbackResponse = 'Centro de Asesoría Técnica ObraExpress. Especialidades disponibles:\n';
      
      if (categoriasDisponibles.length > 0) {
        categoriasDisponibles.forEach(categoria => {
          fallbackResponse += `• ${categoria}\n`;
        });
      } else {
        fallbackResponse += '• Policarbonato Alveolar para techos\n• Policarbonato Ondulado para pérgolas\n• Perfiles y accesorios\n';
      }
      
      fallbackResponse += '\n¿En qué proyecto está trabajando? Puedo proporcionarle precios exactos y asesoría técnica especializada.';
      
      return NextResponse.json({
        success: true,
        response: fallbackResponse,
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
    
    // Intentar obtener productos para respuesta de fallback
    try {
      const productos = await obtenerProductosYPrecios();
      const categoriasDisponibles = Object.keys(productos);
      
      let fallbackResponse = 'Centro de Asesoría Técnica de ObraExpress. Especialidades:\n';
      
      if (categoriasDisponibles.length > 0) {
        categoriasDisponibles.forEach(categoria => {
          fallbackResponse += `• ${categoria}\n`;
        });
      } else {
        fallbackResponse += '• Policarbonato para techos\n• Materiales para invernaderos\n• Perfiles de instalación\n';
      }
      
      fallbackResponse += '\n¿En qué puedo asistirle para su proyecto? Tengo acceso a precios actualizados y especificaciones técnicas completas.';
      
      return NextResponse.json({
        success: true,
        response: fallbackResponse,
        isDefault: true
      });
    } catch (fallbackError) {
      // Respuesta de fallback básica si falla todo
      return NextResponse.json({
        success: true,
        response: 'Centro de Asesoría Técnica de ObraExpress. Especialista en:\n• Sistemas de policarbonato para construcción\n• Soluciones para invernaderos y estructuras\n• Perfiles y accesorios de instalación\n¿En qué proyecto puedo asistirle?',
        isDefault: true
      });
    }
  }
}