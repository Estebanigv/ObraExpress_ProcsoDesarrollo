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
      'Perfiles Alveolar': 'Perfiles Alveolar',
      'Perfiles': 'Perfiles',
      'Accesorios': 'Accesorios',
      'Rollos': 'Rollo'
    };

    // Obtener carpeta destino
    let carpetaDestino = '';
    if (categoria === 'Policarbonato') {
      const subcarpetas = carpetasPorCategoria['Policarbonato'] as Record<string, string>;
      carpetaDestino = subcarpetas[tipo] || categoria;
    } else if (carpetasPorCategoria[categoria]) {
      carpetaDestino = carpetasPorCategoria[categoria] as string;
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

    // Determinar si el producto usa imagen compartida por tipo
    const productosConImagenCompartida = {
      'Policarbonato': {
        'Ondulado': 'policarbonato-ondulado-general',
        'Alveolar': 'policarbonato-alveolar-general', 
        'Compacto': 'policarbonato-compacto-general'
      }
      // Perfiles Alveolar usa imágenes individuales por SKU, no compartidas
      // 'Perfiles' también usa imágenes individuales por SKU
    };
    
    const tieneImagenCompartida = productosConImagenCompartida[categoria]?.[tipo];
    
    const fileName = tieneImagenCompartida 
      ? `${tieneImagenCompartida}${extension}`
      : `${codigo}${extension}`;
    const filePath = path.join(basePath, fileName);

    // Convertir archivo a buffer y guardar
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    fs.writeFileSync(filePath, buffer);

    const rutaImagen = `/assets/images/Productos/${carpetaDestino}/${fileName}`;

    // Actualizar base de datos Supabase
    try {
      const { supabase } = await import('@/lib/supabase');
      
      if (supabase) {
        if (tieneImagenCompartida) {
          // Para productos con imagen compartida, actualizar TODOS los productos del mismo tipo
          console.log(`🔄 Actualizando todos los productos de ${categoria} ${tipo}...`);
          
          // Obtener todos los productos del mismo tipo
          const { data: productosDelTipo } = await supabase
            .from('productos')
            .select('codigo')
            .eq('categoria', categoria)
            .eq('tipo', tipo);
          
          if (productosDelTipo && productosDelTipo.length > 0) {
            // Actualizar todos los productos encontrados
            const { error: updateError } = await supabase
              .from('productos')
              .update({
                tiene_imagen: true,
                ruta_imagen: rutaImagen,
                updated_at: new Date().toISOString()
              })
              .eq('categoria', categoria)
              .eq('tipo', tipo);
            
            if (updateError) {
              console.error(`Error actualizando productos ${categoria} ${tipo}:`, updateError);
            } else {
              console.log(`✅ Actualizados ${productosDelTipo.length} productos de ${categoria} ${tipo}`);
            }
          }
        } else {
          // Para productos con imagen individual, actualizar solo el producto específico
          const { error: updateError } = await supabase
            .from('productos')
            .update({
              tiene_imagen: true,
              ruta_imagen: rutaImagen,
              updated_at: new Date().toISOString()
            })
            .eq('codigo', codigo);

          if (updateError) {
            console.error('Error actualizando base de datos:', updateError);
          } else {
            console.log(`✅ Base de datos actualizada para producto ${codigo}`);
          }
        }
      }
    } catch (dbError) {
      console.error('Error conectando con base de datos:', dbError);
      // No fallar la operación, solo logear el error
    }

    return NextResponse.json({
      success: true,
      message: 'Imagen cargada exitosamente',
      rutaImagen,
      imageUrl: rutaImagen, // Agregado para compatibilidad con el frontend
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