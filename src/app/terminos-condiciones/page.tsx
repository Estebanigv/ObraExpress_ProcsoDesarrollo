import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Términos y Condiciones | ObraExpress',
  description: 'Términos y condiciones de uso del sitio web y servicios de ObraExpress - Venta de policarbonato y materiales de construcción en Chile',
};

export default function TerminosCondiciones() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Términos y Condiciones
        </h1>
        
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">1. Información General</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              ObraExpress es una plataforma de comercio electrónico dedicada a la venta de materiales de construcción, 
              especializada en policarbonato alveolar, compacto y ondulado, así como accesorios y perfiles relacionados.
            </p>
            <p className="text-gray-600 leading-relaxed">
              <strong>Razón Social:</strong> ObraExpress SpA<br />
              <strong>RUT:</strong> 76.XXX.XXX-X<br />
              <strong>Domicilio:</strong> Santiago, Chile<br />
              <strong>Email:</strong> contacto@obraexpress.cl<br />
              <strong>Teléfono:</strong> +56 9 XXXX XXXX
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">2. Aceptación de Términos</h2>
            <p className="text-gray-600 leading-relaxed">
              Al acceder y utilizar este sitio web, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso. 
              Si no está de acuerdo con alguna parte de estos términos, no debe usar nuestro sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">3. Productos y Servicios</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Los productos ofrecidos están sujetos a disponibilidad de stock.</li>
              <li>Los precios publicados incluyen IVA y están expresados en pesos chilenos (CLP).</li>
              <li>Nos reservamos el derecho de modificar precios sin previo aviso.</li>
              <li>Las imágenes de productos son referenciales y pueden variar del producto real.</li>
              <li>Las especificaciones técnicas están sujetas a las tolerancias propias del material.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">4. Proceso de Compra</h2>
            <div className="text-gray-600 space-y-3">
              <p><strong>4.1 Cotización:</strong> Los usuarios pueden solicitar cotizaciones sin compromiso de compra.</p>
              <p><strong>4.2 Pedidos:</strong> Los pedidos están sujetos a confirmación de stock y validación de pago.</p>
              <p><strong>4.3 Pago:</strong> Aceptamos pagos a través de Transbank (tarjetas de crédito/débito) y transferencias bancarias.</p>
              <p><strong>4.4 Confirmación:</strong> Recibirá un correo de confirmación una vez procesado su pedido.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">5. Despacho y Entrega</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Realizamos despachos a todo Chile continental.</li>
              <li>Los plazos de entrega varían según la ubicación (3-10 días hábiles).</li>
              <li>El costo de despacho se calcula según peso, volumen y destino.</li>
              <li>El cliente debe verificar el estado de los productos al momento de la recepción.</li>
              <li>Para proyectos grandes, ofrecemos coordinación especial de despacho.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">6. Garantía y Devoluciones</h2>
            <div className="text-gray-600 space-y-3">
              <p><strong>6.1 Garantía de Fábrica:</strong> Los productos de policarbonato tienen garantía de 10 años contra amarillamiento y pérdida de transmisión lumínica.</p>
              <p><strong>6.2 Devoluciones:</strong> Se aceptan devoluciones dentro de 10 días desde la recepción, siempre que:</p>
              <ul className="list-disc list-inside ml-4 mt-2">
                <li>El producto esté en su embalaje original sin usar.</li>
                <li>Se presente la boleta o factura de compra.</li>
                <li>El producto no haya sido cortado o modificado.</li>
              </ul>
              <p><strong>6.3 Productos Defectuosos:</strong> En caso de defectos de fabricación, realizaremos el cambio sin costo adicional.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">7. Uso del Sitio Web</h2>
            <div className="text-gray-600 space-y-3">
              <p>El usuario se compromete a:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Proporcionar información verídica y actualizada.</li>
                <li>Mantener la confidencialidad de su cuenta y contraseña.</li>
                <li>No realizar actividades fraudulentas o ilegales.</li>
                <li>No intentar vulnerar la seguridad del sitio.</li>
                <li>Respetar los derechos de propiedad intelectual.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">8. Propiedad Intelectual</h2>
            <p className="text-gray-600 leading-relaxed">
              Todo el contenido del sitio web, incluyendo textos, imágenes, logos, diseños y software, 
              es propiedad de ObraExpress o sus proveedores y está protegido por las leyes de propiedad intelectual. 
              Queda prohibida su reproducción total o parcial sin autorización expresa.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">9. Limitación de Responsabilidad</h2>
            <p className="text-gray-600 leading-relaxed">
              ObraExpress no será responsable por daños indirectos, incidentales o consecuenciales derivados del uso 
              o imposibilidad de uso del sitio web o de los productos adquiridos. Nuestra responsabilidad máxima 
              será el valor del producto adquirido.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">10. Protección de Datos</h2>
            <p className="text-gray-600 leading-relaxed">
              El tratamiento de datos personales se rige por nuestra{' '}
              <a href="/politica-privacidad" className="text-blue-600 hover:underline">
                Política de Privacidad
              </a>
              , la cual forma parte integral de estos términos y condiciones.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">11. Modificaciones</h2>
            <p className="text-gray-600 leading-relaxed">
              Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. 
              Las modificaciones entrarán en vigor desde su publicación en el sitio web. 
              El uso continuado del sitio implica la aceptación de los términos modificados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">12. Ley Aplicable y Jurisdicción</h2>
            <p className="text-gray-600 leading-relaxed">
              Estos términos y condiciones se rigen por las leyes de la República de Chile. 
              Cualquier controversia será sometida a los tribunales ordinarios de justicia de Santiago, Chile.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">13. Contacto</h2>
            <p className="text-gray-600 leading-relaxed">
              Para consultas sobre estos términos y condiciones, puede contactarnos a través de:
            </p>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>Email: legal@obraexpress.cl</li>
              <li>Teléfono: +56 9 XXXX XXXX</li>
              <li>Formulario de contacto en nuestro sitio web</li>
            </ul>
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
              Versión 1.0 - ObraExpress SpA © {new Date().getFullYear()} - Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}