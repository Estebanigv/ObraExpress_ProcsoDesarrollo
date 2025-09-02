import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BASE_URL}/api/auth/google/callback`
);

export async function GET(request: NextRequest) {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ];

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });

    return NextResponse.json({
      success: true,
      authUrl,
      message: 'Redirige al usuario a esta URL para autorizar el acceso a Google Sheets'
    });

  } catch (error) {
    console.error('❌ Error generando URL de autenticación:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Error generando URL de autenticación',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}