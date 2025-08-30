import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { email, nombre, token, catalogos } = await request.json();

    // Mapeo de nombres de catálogos
    const catalogoNames = {
      'laminas-alveolares': 'Láminas Alveolares',
      'rollos-compactos': 'Rollos Compactos',
      'accesorios': 'Accesorios Profesionales',
      'sistemas-estructurales': 'Sistemas Estructurales',
      'catalogo-general': 'Catálogo General'
    };

    const catalogosNombres = catalogos.map((id: string) => 
      catalogoNames[id as keyof typeof catalogoNames] || id
    ).join(', ');

    const confirmationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/confirmar-descarga?token=${token}`;
    
    // HTML del email con colores corporativos ObraExpress (amarillo y negro)
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Confirma tu descarga - ObraExpress</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        
        <!-- Header con branding ObraExpress -->
        <div style="background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%); padding: 40px 30px; text-align: center; border-radius: 15px 15px 0 0; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #1a1a1a; margin: 0; font-size: 36px; font-weight: bold; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">ObraExpress</h1>
          <p style="color: #1a1a1a; margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">Soluciones en Policarbonato</p>
          <div style="width: 50px; height: 3px; background: #1a1a1a; margin: 15px auto 0; border-radius: 2px;"></div>
        </div>
        
        <!-- Contenido principal -->
        <div style="background: white; padding: 40px 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1a1a1a; margin-top: 0; font-size: 24px; font-weight: bold;">¡Hola ${nombre}!</h2>
          
          <p style="color: #374151; font-size: 16px; margin: 20px 0;">
            Gracias por tu interés en nuestros productos profesionales de policarbonato. Has solicitado descargar los siguientes catálogos:
          </p>
          
          <!-- Catálogos solicitados -->
          <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 20px; border-radius: 10px; margin: 25px 0; border-left: 4px solid #F59E0B;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 20px; margin-right: 10px;">📄</span>
              <strong style="color: #1a1a1a; font-size: 16px;">Catálogos Seleccionados:</strong>
            </div>
            <div style="color: #374151; font-size: 15px; font-weight: 500;">
              ${catalogosNombres}
            </div>
          </div>
          
          <p style="color: #374151; font-size: 16px; margin: 25px 0;">
            Para confirmar tu descarga y acceder inmediatamente a los archivos PDF, haz clic en el botón de confirmación:
          </p>
          
          <!-- Botón de confirmación con diseño ObraExpress -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${confirmationUrl}" 
               style="background: linear-gradient(135deg, #1a1a1a 0%, #374151 100%); 
                      color: #FCD34D; 
                      padding: 18px 35px; 
                      text-decoration: none; 
                      border-radius: 30px; 
                      font-weight: bold; 
                      font-size: 16px;
                      display: inline-block;
                      box-shadow: 0 6px 20px rgba(26, 26, 26, 0.3);
                      border: 2px solid #FCD34D;
                      transition: all 0.3s ease;">
              <span style="margin-right: 8px;">📥</span>
              Confirmar y Descargar Catálogos
            </a>
          </div>
          
          <!-- Información adicional -->
          <div style="background: #F9FAFB; padding: 20px; border-radius: 10px; margin: 25px 0; border: 1px solid #E5E7EB;">
            <h3 style="color: #1a1a1a; margin: 0 0 10px 0; font-size: 16px;">¿Qué incluyen nuestros catálogos?</h3>
            <ul style="color: #374151; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Especificaciones técnicas detalladas</li>
              <li>Medidas y espesores disponibles</li>
              <li>Guías de instalación profesional</li>
              <li>Información de garantías y certificaciones</li>
            </ul>
          </div>
          
          <!-- Nota de seguridad -->
          <div style="font-size: 14px; color: #6B7280; border-top: 2px solid #FCD34D; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="margin: 0 0 10px 0;">
              🔒 Este enlace es seguro y válido por <strong>24 horas</strong>
            </p>
            <p style="margin: 0; font-size: 12px;">
              Si no solicitaste esta descarga, puedes ignorar este email de forma segura.
            </p>
          </div>
        </div>
        
        <!-- Footer corporativo -->
        <div style="text-align: center; margin-top: 25px; padding: 20px; background: #1a1a1a; border-radius: 10px;">
          <div style="color: #FCD34D; font-size: 18px; font-weight: bold; margin-bottom: 10px;">ObraExpress</div>
          <p style="color: #9CA3AF; font-size: 12px; margin: 5px 0;">
            Líderes en soluciones de policarbonato profesional
          </p>
          <p style="color: #6B7280; font-size: 11px; margin: 10px 0 0 0;">
            © 2024 ObraExpress - Todos los derechos reservados<br>
            Este email fue enviado automáticamente. No responder a este correo.
          </p>
        </div>
      </body>
      </html>
    `;

    // Verificar si es desarrollo o el email no está autorizado en Resend
    const isDevelopment = process.env.NODE_ENV === 'development';
    const authorizedEmail = 'gonzalezvogel@gmail.com';
    const isAuthorizedEmail = email === authorizedEmail;
    
    if (!process.env.RESEND_API_KEY || 
        process.env.RESEND_API_KEY === 're_123456789_your_api_key_here' ||
        (isDevelopment && !isAuthorizedEmail)) {
      // Simular el envío para desarrollo
      console.log('\n📧 ========== EMAIL SIMULADO ==========');
      console.log('📧 Para:', email);
      console.log('📧 Nombre:', nombre);
      console.log('📧 Asunto: Confirma tu descarga de catálogos ObraExpress');
      console.log('📧 Catálogos solicitados:', catalogosNombres);
      console.log('🔗 URL de confirmación:', confirmationUrl);
      console.log('🔗 Token:', token);
      if (isDevelopment && !isAuthorizedEmail) {
        console.log('⚠️  En desarrollo, solo se pueden enviar emails reales a:', authorizedEmail);
      }
      console.log('📧 =====================================\n');

      return NextResponse.json({ 
        success: true, 
        message: 'Email simulado enviado exitosamente',
        confirmationUrl,
        isSimulated: true
      });
    }

    // Envío REAL con Resend
    console.log('\n📧 ========== ENVIANDO EMAIL REAL ==========');
    console.log('📧 Para:', email);
    console.log('📧 Desde:', process.env.FROM_EMAIL || 'onboarding@resend.dev');
    
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_EMAIL || 'ObraExpress <onboarding@resend.dev>',
        to: [email],
        subject: 'Confirma tu descarga de catálogos ObraExpress',
        html: emailHTML,
      });

      if (error) {
        console.error('❌ Error enviando email:', error);
        // Si falla el envío real, simular en desarrollo
        if (isDevelopment) {
          console.log('🔄 Fallback a simulación por error en Resend');
          return NextResponse.json({ 
            success: true, 
            message: 'Email simulado enviado (falló envío real)',
            confirmationUrl,
            isSimulated: true
          });
        }
        throw new Error(`Error enviando email: ${error.message || 'Error desconocido'}`);
      }

      console.log('✅ Email REAL enviado exitosamente!');
      console.log('📧 ID del email:', data?.id);
      console.log('📧 ========================================\n');

      return NextResponse.json({ 
        success: true, 
        message: 'Email de confirmación enviado exitosamente a tu correo',
        emailId: data?.id,
        isSimulated: false
      });
    } catch (emailError) {
      console.error('❌ Error en el envío:', emailError);
      // En desarrollo, hacer fallback a simulación
      if (isDevelopment) {
        console.log('🔄 Fallback a simulación por error en envío');
        return NextResponse.json({ 
          success: true, 
          message: 'Email simulado enviado (falló envío real)',
          confirmationUrl,
          isSimulated: true
        });
      }
      throw emailError;
    }

  } catch (error) {
    console.error('Error enviando email:', error);
    return NextResponse.json(
      { success: false, message: 'Error enviando email de confirmación' },
      { status: 500 }
    );
  }
}