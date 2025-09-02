import { NextRequest, NextResponse } from 'next/server';
import { CATEGORIES_VISIBILITY, setCategoryVisibility } from '@/config/categories-visibility';

// GET - Obtener configuración de visibilidad
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      categories: CATEGORIES_VISIBILITY
    });
  } catch (error) {
    console.error('Error obteniendo visibilidad de categorías:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// POST - Cambiar visibilidad de categoría
export async function POST(request: NextRequest) {
  try {
    const { categoryName, visible } = await request.json();
    
    if (!categoryName || typeof visible !== 'boolean') {
      return NextResponse.json({
        success: false,
        error: 'Parámetros inválidos. Se requiere categoryName (string) y visible (boolean)'
      }, { status: 400 });
    }
    
    // Buscar si la categoría existe
    const category = CATEGORIES_VISIBILITY.find(cat => cat.name === categoryName);
    if (!category) {
      return NextResponse.json({
        success: false,
        error: `Categoría '${categoryName}' no encontrada`
      }, { status: 404 });
    }
    
    // Cambiar visibilidad
    setCategoryVisibility(categoryName, visible);
    
    console.log(`✅ Visibilidad cambiada: ${categoryName} -> ${visible ? 'VISIBLE' : 'OCULTA'}`);
    
    return NextResponse.json({
      success: true,
      message: `Categoría '${categoryName}' ${visible ? 'mostrada' : 'ocultada'} exitosamente`,
      category: {
        name: categoryName,
        visible: visible
      }
    });
    
  } catch (error) {
    console.error('Error cambiando visibilidad:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}