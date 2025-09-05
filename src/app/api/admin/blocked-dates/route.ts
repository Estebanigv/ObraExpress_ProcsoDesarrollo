import { NextResponse } from 'next/server';

// Lista de fechas bloqueadas - en producción esto vendría de una base de datos
const BLOCKED_DATES = [
  // Feriados 2024
  '2024-12-25', // Navidad
  '2025-01-01', // Año Nuevo
  '2025-04-18', // Viernes Santo
  '2025-05-01', // Día del Trabajador
  '2025-05-21', // Día de las Glorias Navales
  '2025-06-29', // San Pedro y San Pablo
  '2025-07-16', // Virgen del Carmen
  '2025-08-15', // Asunción de la Virgen
  '2025-09-18', // Independencia de Chile
  '2025-09-19', // Día de las Glorias del Ejército
  '2025-10-12', // Encuentro de Dos Mundos
  '2025-10-31', // Día de las Iglesias Evangélicas y Protestantes
  '2025-11-01', // Día de Todos los Santos
  '2025-12-08', // Inmaculada Concepción
  '2025-12-25', // Navidad
  
  // Fechas bloqueadas por administrador (ejemplo)
  '2024-12-26', // Post Navidad
  '2025-01-02', // Post Año Nuevo
  '2025-01-09', // Mantenimiento programado
];

export async function GET() {
  try {
    // En producción, aquí consultarías tu base de datos
    // const blockedDates = await db.blockedDates.findMany();
    
    return NextResponse.json({
      success: true,
      blockedDates: BLOCKED_DATES,
      message: 'Fechas bloqueadas obtenidas correctamente'
    });
    
  } catch (error) {
    console.error('Error obteniendo fechas bloqueadas:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor',
        blockedDates: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { date, reason } = await request.json();
    
    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fecha es requerida'
        },
        { status: 400 }
      );
    }
    
    // En producción, aquí guardarías en tu base de datos
    // await db.blockedDates.create({ data: { date, reason } });
    
    // Por ahora, solo simular la adición
    BLOCKED_DATES.push(date);
    
    return NextResponse.json({
      success: true,
      message: `Fecha ${date} bloqueada correctamente`,
      reason: reason || 'Sin razón especificada'
    });
    
  } catch (error) {
    console.error('Error bloqueando fecha:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    
    if (!date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Fecha es requerida'
        },
        { status: 400 }
      );
    }
    
    // En producción, aquí eliminarías de tu base de datos
    // await db.blockedDates.delete({ where: { date } });
    
    // Por ahora, solo simular la eliminación
    const index = BLOCKED_DATES.indexOf(date);
    if (index > -1) {
      BLOCKED_DATES.splice(index, 1);
    }
    
    return NextResponse.json({
      success: true,
      message: `Fecha ${date} desbloqueada correctamente`
    });
    
  } catch (error) {
    console.error('Error desbloqueando fecha:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error interno del servidor'
      },
      { status: 500 }
    );
  }
}