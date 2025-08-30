import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const codigo = formData.get('codigo') as string;
    const categoria = formData.get('categoria') as string;
    const tipo = formData.get('tipo') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se proporcionó imagen' }, { status: 400 });
    }

    if (!codigo || !categoria || !tipo) {
      return NextResponse.json({ success: false, error: 'Faltan datos requeridos' }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Tipo de archivo no permitido' }, { status: 400 });
    }

    // Mapear categorías a carpetas (igual que en sync-products-csv)
    const carpetasPorCategoria: Record<string, Record<string, string> | string> = {
      'Policarbonato': {
        'Alveolar': 'Policarbonato Alveolar',
        'Compacto': 'Policarbonato Compacto', 
        'Ondulado': 'Policarnato Ondulado' // Nota: hay typo en la carpeta existente
      },
      'Perfiles': 'Perfiles'
    };

    // Obtener carpeta destino
    let carpetaDestino = '';
    if (categoria === 'Policarbonato') {
      const subcarpetas = carpetasPorCategoria['Policarbonato'] as Record<string, string>;
      carpetaDestino = subcarpetas[tipo] || categoria;
    } else if (categoria === 'Perfiles') {
      carpetaDestino = 'Perfiles';
    } else {
      carpetaDestino = categoria;
    }

    // Crear ruta completa
    const basePath = path.join(process.cwd(), 'public', 'assets', 'images', 'Productos', carpetaDestino);
    
    // Crear directorio si no existe
    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath, { recursive: true });
    }

    // Determinar extensión
    const extension = file.type === 'image/webp' ? '.webp' : 
                     file.type === 'image/png' ? '.png' : 
                     '.jpg';

    const fileName = `${codigo}${extension}`;
    const filePath = path.join(basePath, fileName);

    // Convertir archivo a buffer y guardar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    fs.writeFileSync(filePath, buffer);

    const rutaImagen = `/assets/images/Productos/${carpetaDestino}/${fileName}`;

    return NextResponse.json({
      success: true,
      message: 'Imagen cargada exitosamente',
      rutaImagen,
      archivo: fileName
    });

  } catch (error) {
    console.error('Error cargando imagen:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}