import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidad | ObraExpress',
  description: 'Política de privacidad y protección de datos personales de ObraExpress - Comercio electrónico de materiales de construcción',
};

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Política de Privacidad
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Introducción</h2>
            <p className="text-gray-600 leading-relaxed">
              En ObraExpress respetamos su privacidad y nos comprometemos a proteger sus datos personales. 
              Esta política de privacidad explica cómo recopilamos, usamos, compartimos y protegemos su información 
              cuando utiliza nuestro sitio web y servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Responsable del Tratamiento</h2>
            <div className="text-gray-600 space-y-2">
              <p><strong>Empresa:</strong> ObraExpress SpA</p>
              <p><strong>RUT:</strong> 76.XXX.XXX-X</p>
              <p><strong>Dirección:</strong> Santiago, Chile</p>
              <p><strong>Email de contacto:</strong> privacidad@obraexpress.cl</p>
              <p><strong>Encargado de protección de datos:</strong> Departamento Legal</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Datos que Recopilamos</h2>
            <div className="text-gray-600 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">3.1 Datos proporcionados directamente:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Nombre completo y apellidos</li>
                  <li>RUT o documento de identidad</li>
                  <li>Dirección de correo electrónico</li>
                  <li>Número de teléfono</li>
                  <li>Dirección de despacho y facturación</li>
                  <li>Información de pago (procesada por Transbank)</li>
                  <li>Razón social y giro (empresas)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">3.2 Datos recopilados automáticamente:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador y dispositivo</li>
                  <li>Páginas visitadas y tiempo de permanencia</li>
                  <li>Fecha y hora de acceso</li>
                  <li>Origen de la visita (referrer)</li>
                  <li>Cookies y tecnologías similares</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3.3 Datos de terceros:</h3>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Información de Google OAuth (si usa login social)</li>
                  <li>Datos de validación crediticia (con su consentimiento)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Finalidad del Tratamiento</h2>
            <div className="text-gray-600 space-y-3">
              <p>Utilizamos sus datos personales para:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Procesar sus pedidos y gestionar la entrega</li>
                <li>Enviar confirmaciones y actualizaciones de pedidos</li>
                <li>Responder a sus consultas y brindar soporte</li>
                <li>Personalizar su experiencia en el sitio</li>
                <li>Enviar ofertas y promociones (con su consentimiento)</li>
                <li>Cumplir con obligaciones legales y tributarias</li>
                <li>Prevenir fraudes y mejorar la seguridad</li>
                <li>Realizar análisis estadísticos y mejorar nuestros servicios</li>
                <li>Gestionar programas de fidelización</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Base Legal</h2>
            <div className="text-gray-600 space-y-3">
              <p>El tratamiento de sus datos se basa en:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Ejecución de contrato:</strong> Para procesar sus compras</li>
                <li><strong>Consentimiento:</strong> Para envío de marketing y cookies</li>
                <li><strong>Interés legítimo:</strong> Para mejorar servicios y prevenir fraudes</li>
                <li><strong>Obligación legal:</strong> Para cumplir normativas tributarias</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Compartición de Datos</h2>
            <div className="text-gray-600 space-y-3">
              <p>Compartimos sus datos únicamente con:</p>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li><strong>Proveedores de servicios:</strong> Transbank (pagos), empresas de despacho, hosting (Supabase)</li>
                <li><strong>Autoridades:</strong> Cuando sea requerido por ley</li>
                <li><strong>Partners comerciales:</strong> Solo con su consentimiento expreso</li>
              </ul>
              <p className="mt-3">
                <strong>No vendemos ni alquilamos sus datos personales a terceros.</strong>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Transferencia Internacional</h2>
            <p className="text-gray-600 leading-relaxed">
              Sus datos pueden ser almacenados en servidores ubicados fuera de Chile (Supabase, Google Cloud). 
              Estas transferencias se realizan con las garantías adecuadas según la normativa vigente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Retención de Datos</h2>
            <div className="text-gray-600 space-y-2">
              <p>Conservamos sus datos durante:</p>
              <ul className="list-disc list-inside ml-4">
                <li><strong>Datos de cuenta:</strong> Mientras mantenga su cuenta activa</li>
                <li><strong>Datos de compras:</strong> 6 años (obligación tributaria)</li>
                <li><strong>Datos de marketing:</strong> Hasta que retire su consentimiento</li>
                <li><strong>Cookies:</strong> Según el tipo (sesión o persistentes)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Sus Derechos</h2>
            <div className="text-gray-600 space-y-3">
              <p>Usted tiene derecho a:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Acceso:</strong> Solicitar copia de sus datos personales</li>
                <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                <li><strong>Supresión:</strong> Solicitar eliminación de sus datos</li>
                <li><strong>Limitación:</strong> Restringir el procesamiento de sus datos</li>
                <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                <li><strong>Oposición:</strong> Oponerse a ciertos tratamientos</li>
                <li><strong>Revocación:</strong> Retirar su consentimiento en cualquier momento</li>
              </ul>
              <p className="mt-3">
                Para ejercer estos derechos, contacte a: privacidad@obraexpress.cl
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">10. Seguridad</h2>
            <div className="text-gray-600 space-y-3">
              <p>Implementamos medidas de seguridad técnicas y organizativas, incluyendo:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Encriptación SSL/TLS para transmisión de datos</li>
                <li>Encriptación de contraseñas con bcrypt</li>
                <li>Acceso restringido a datos personales</li>
                <li>Monitoreo continuo de seguridad</li>
                <li>Respaldos periódicos de información</li>
                <li>Protocolo de respuesta ante incidentes</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">11. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Utilizamos cookies para mejorar su experiencia. Para más información, consulte nuestra{' '}
              <a href="/politica-cookies" className="text-blue-600 hover:underline">
                Política de Cookies
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">12. Menores de Edad</h2>
            <p className="text-gray-600 leading-relaxed">
              Nuestros servicios no están dirigidos a menores de 18 años. 
              No recopilamos intencionalmente datos de menores sin el consentimiento de sus padres o tutores.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">13. Cambios en la Política</h2>
            <p className="text-gray-600 leading-relaxed">
              Podemos actualizar esta política periódicamente. 
              Los cambios serán publicados en esta página con la fecha de actualización. 
              Le notificaremos cambios significativos por email o mediante un aviso en nuestro sitio.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">14. Contacto y Reclamaciones</h2>
            <div className="text-gray-600 space-y-3">
              <p>Para consultas sobre privacidad o ejercer sus derechos:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Email: privacidad@obraexpress.cl</li>
                <li>Teléfono: +56 9 XXXX XXXX</li>
                <li>Dirección: Santiago, Chile</li>
              </ul>
              <p className="mt-3">
                Si no está satisfecho con nuestra respuesta, puede presentar una reclamación ante la autoridad 
                de protección de datos correspondiente.
              </p>
            </div>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
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