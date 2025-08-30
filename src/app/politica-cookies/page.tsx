'use client';

import { useEffect } from 'react';

export default function PoliticaCookies() {
  // Configurar metadata dinámicamente
  useEffect(() => {
    document.title = 'Política de Cookies | ObraExpress';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Información sobre el uso de cookies y tecnologías similares en ObraExpress');
    }
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Política de Cookies
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. ¿Qué son las Cookies?</h2>
            <p className="text-gray-600 leading-relaxed">
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. 
              Estas nos ayudan a mejorar su experiencia de navegación, recordar sus preferencias y entender cómo utiliza nuestro sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Tipos de Cookies que Utilizamos</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🔒 Cookies Esenciales (Necesarias)</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Estas cookies son necesarias para el funcionamiento básico del sitio web.
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>• <strong>session_id:</strong> Mantiene su sesión activa</li>
                  <li>• <strong>cart_items:</strong> Guarda productos en su carrito</li>
                  <li>• <strong>auth_token:</strong> Gestiona su autenticación</li>
                  <li>• <strong>cookie_consent:</strong> Recuerda su preferencia de cookies</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">Duración: Sesión o hasta 30 días</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">📊 Cookies Analíticas</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio.
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>• <strong>_ga:</strong> Google Analytics - Distingue usuarios únicos</li>
                  <li>• <strong>_gid:</strong> Google Analytics - Identifica sesiones</li>
                  <li>• <strong>_gat:</strong> Google Analytics - Limita tasa de solicitudes</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">Duración: Hasta 2 años</p>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">🎯 Cookies de Funcionalidad</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Permiten funcionalidades mejoradas y personalización.
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>• <strong>user_preferences:</strong> Guarda sus preferencias de visualización</li>
                  <li>• <strong>recently_viewed:</strong> Productos vistos recientemente</li>
                  <li>• <strong>location:</strong> Región para cálculo de despacho</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">Duración: 90 días</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">📢 Cookies de Marketing</h3>
                <p className="text-gray-600 text-sm mb-2">
                  Se utilizan para mostrar anuncios relevantes (requieren consentimiento).
                </p>
                <ul className="text-gray-600 text-sm space-y-1 ml-4">
                  <li>• <strong>fbp:</strong> Facebook Pixel - Seguimiento de conversiones</li>
                  <li>• <strong>_gcl_au:</strong> Google Ads - Atribución de conversiones</li>
                </ul>
                <p className="text-xs text-gray-500 mt-2">Duración: Hasta 90 días</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Cookies de Terceros</h2>
            <div className="text-gray-600 space-y-3">
              <p>Algunos servicios de terceros pueden establecer sus propias cookies:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Google Analytics:</strong> Análisis de tráfico web</li>
                <li><strong>Google OAuth:</strong> Autenticación social</li>
                <li><strong>Transbank:</strong> Procesamiento de pagos</li>
                <li><strong>YouTube:</strong> Videos embebidos (si aplica)</li>
                <li><strong>Facebook:</strong> Pixel de seguimiento (si está activo)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Gestión de Cookies</h2>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Configuración en Nuestro Sitio</h3>
                <p className="text-gray-600 text-sm">
                  Al ingresar por primera vez, verá un banner de cookies donde puede aceptar o rechazar 
                  las cookies no esenciales. Puede cambiar sus preferencias en cualquier momento desde 
                  el enlace "Configuración de Cookies" en el pie de página.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Configuración del Navegador</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Puede configurar su navegador para bloquear o eliminar cookies:
                </p>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li>• <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                  <li>• <strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
                  <li>• <strong>Safari:</strong> Preferencias → Privacidad → Cookies</li>
                  <li>• <strong>Edge:</strong> Configuración → Privacidad → Cookies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Consecuencias de Desactivar Cookies</h2>
            <div className="text-gray-600 space-y-3">
              <p>Si desactiva las cookies, tenga en cuenta que:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>No podrá mantener productos en su carrito de compras</li>
                <li>Deberá iniciar sesión cada vez que visite el sitio</li>
                <li>No recordaremos sus preferencias de navegación</li>
                <li>Algunas funcionalidades podrían no estar disponibles</li>
                <li>La experiencia de usuario será menos personalizada</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Tecnologías Similares</h2>
            <div className="text-gray-600 space-y-3">
              <p>Además de cookies, utilizamos:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Local Storage:</strong> Para guardar preferencias del usuario localmente</li>
                <li><strong>Session Storage:</strong> Para datos temporales durante la navegación</li>
                <li><strong>Pixels de seguimiento:</strong> Para medir efectividad de campañas</li>
                <li><strong>Web beacons:</strong> Para contar visitantes y entender patrones de uso</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Base Legal</h2>
            <div className="text-gray-600 space-y-3">
              <p>Utilizamos cookies basándonos en:</p>
              <ul className="list-disc list-inside ml-4">
                <li><strong>Necesidad contractual:</strong> Cookies esenciales para el funcionamiento</li>
                <li><strong>Consentimiento:</strong> Cookies analíticas y de marketing</li>
                <li><strong>Interés legítimo:</strong> Cookies de funcionalidad para mejorar experiencia</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Actualizaciones de esta Política</h2>
            <p className="text-gray-600 leading-relaxed">
              Podemos actualizar esta política de cookies periódicamente para reflejar cambios en nuestras prácticas 
              o por razones operativas, legales o regulatorias. La fecha de la última actualización se muestra al final 
              de este documento.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Más Información</h2>
            <div className="text-gray-600 space-y-3">
              <p>Para más información sobre cookies, visite:</p>
              <ul className="list-disc list-inside ml-4">
                <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  www.allaboutcookies.org
                </a></li>
                <li><a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  www.youronlinechoices.com
                </a></li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">10. Contacto</h2>
            <div className="text-gray-600 space-y-2">
              <p>Si tiene preguntas sobre nuestra política de cookies, contáctenos:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Email: cookies@obraexpress.cl</li>
                <li>Teléfono: +56 9 XXXX XXXX</li>
                <li>Dirección: Santiago, Chile</li>
              </ul>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">⚙️ Configuración de Cookies</h3>
              <p className="text-gray-600 text-sm mb-3">
                Puede cambiar sus preferencias de cookies en cualquier momento:
              </p>
              <button 
                onClick={() => alert('Aquí se abrirá el modal de configuración de cookies')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Configurar Cookies
              </button>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Última actualización: {new Date().toLocaleDateString('es-CL', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-gray-500 text-center mt-2">
              Versión 1.0 - ObraExpress SpA © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}