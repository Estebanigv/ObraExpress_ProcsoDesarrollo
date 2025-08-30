import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BASE_URL}/api/auth/google/callback`
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Usuario canceló la autorización o ocurrió un error',
        details: error
      }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({
        success: false,
        error: 'No se recibió código de autorización'
      }, { status: 400 });
    }

    console.log('🔑 Intercambiando código por tokens...');
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('✅ Tokens obtenidos exitosamente');

    // Guardar tokens para uso posterior (en producción usar base de datos)
    const tokensPath = path.join(process.cwd(), 'google-tokens.json');
    fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
    console.log('💾 Tokens guardados en:', tokensPath);

    // Probar acceso a Google Sheets
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const sheetId = process.env.GOOGLE_SHEET_ID;
    
    if (sheetId) {
      try {
        const response = await sheets.spreadsheets.get({
          spreadsheetId: sheetId
        });
        
        console.log('📊 Acceso a Google Sheet confirmado:', response.data.properties?.title);
      } catch (sheetError) {
        console.warn('⚠️ No se pudo acceder al sheet (verifica permisos):', sheetError);
      }
    }

    // Redirigir al usuario de vuelta al admin con mensaje de éxito
    return NextResponse.redirect(`${process.env.BASE_URL}/admin?auth=success`);

  } catch (error) {
    console.error('❌ Error en callback de Google OAuth:', error);
    
    return NextResponse.redirect(`${process.env.BASE_URL}/admin?auth=error&message=${encodeURIComponent('Error en autenticación')}`);
  }
}