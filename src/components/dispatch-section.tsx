"use client";

import Image from "next/image";

export default function DispatchSection() {
  return (
    <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/20 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-amber-100/20 to-transparent rounded-full blur-3xl"></div>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:py-28 relative z-10">
        {/* Header de la sección */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 mb-6">
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            Coordinación de Despacho Profesional
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Despacho Coordinado
            </span>
            <br />
            <span className="text-gray-700 text-3xl md:text-4xl font-medium">
              Directo a tu Obra
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Nuestro sistema de coordinación de despachos garantiza que tus materiales lleguen exactamente 
            cuando y donde los necesitas, optimizando los tiempos de tu proyecto.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Contenido principal */}
          <div className="space-y-8">
            {/* Beneficios destacados */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: "🚚", title: "Entregas Puntuales", desc: "Solo los jueves, horario 9:00 - 18:00 hrs" },
                { icon: "📍", title: "Seguimiento GPS", desc: "Ubicación en tiempo real del despacho" },
                { icon: "📞", title: "Confirmación 24h", desc: "Te contactamos para confirmar detalles" },
                { icon: "💡", title: "Asesoría Técnica", desc: "Orientación en descarga e instalación" }
              ].map((benefit, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="text-2xl mb-2">{benefit.icon}</div>
                  <h4 className="font-semibold text-gray-900 mb-1">{benefit.title}</h4>
                  <p className="text-sm text-gray-600">{benefit.desc}</p>
                </div>
              ))}
            </div>

            {/* Proceso paso a paso */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Proceso de Coordinación</h3>
              <div className="space-y-4">
                {[
                  { 
                    step: "01", 
                    title: "Completa tu Información", 
                    desc: "Datos de contacto, dirección y detalles del proyecto",
                    details: ["Nombre y teléfono", "Dirección exacta", "Tipo de proyecto", "Especificaciones"]
                  },
                  { 
                    step: "02", 
                    title: "Selecciona Fecha de Despacho", 
                    desc: "Calendario inteligente con fechas disponibles",
                    details: ["Solo jueves disponibles", "Horario 9:00 - 18:00", "Confirmación automática", "Recordatorio 24h antes"]
                  },
                  { 
                    step: "03", 
                    title: "Confirmación y Seguimiento", 
                    desc: "Validamos detalles y coordinas el despacho",
                    details: ["Llamada de confirmación", "Detalles de carga/descarga", "Número de seguimiento", "Contacto directo chofer"]
                  }
                ].map((step, i) => (
                  <div key={i} className="relative">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                        <p className="text-gray-600 mb-3">{step.desc}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {step.details.map((detail, j) => (
                            <div key={j} className="flex items-center text-sm text-gray-500">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                              {detail}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {i < 2 && (
                      <div className="absolute left-6 top-12 w-px h-8 bg-gradient-to-b from-blue-300 to-transparent"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Información importante */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                </div>
                <div>
                  <h4 className="font-bold text-blue-900 mb-2">⚡ Importante sobre el Calendario</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• <strong>Despachos solo los jueves:</strong> Entre 9:00 y 18:00 horas</p>
                    <p>• <strong>Pedidos hasta miércoles:</strong> Van en el jueves de esa semana</p>
                    <p>• <strong>Pedidos después del miércoles:</strong> Van en el jueves siguiente</p>
                    <p>• <strong>Confirmación obligatoria:</strong> Te llamamos 24h antes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/coordinador-despacho"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                📅 Calendario de Despacho
              </a>
              <a
                href="https://wa.me/56963348909?text=Hola%20ObraExpress,%20necesito%20información%20sobre%20coordinación%20de%20despachos%20de%20policarbonato"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-white hover:bg-green-50 text-gray-800 hover:text-green-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-green-300 transition-all duration-300 text-center flex items-center justify-center gap-2"
              >
                <span className="text-xl">💬</span>
                Consultar por WhatsApp
              </a>
            </div>

            {/* Garantías */}
            <div className="flex flex-wrap gap-6 pt-4">
              {[
                { icon: "🔒", text: "Datos 100% Seguros" },
                { icon: "⚡", text: "Respuesta < 2 Horas" },
                { icon: "🎯", text: "Puntualidad Garantizada" },
                { icon: "📱", text: "Comunicación Directa" }
              ].map((guarantee, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-lg">{guarantee.icon}</span>
                  <span className="font-medium">{guarantee.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Imagen principal mejorada */}
          <div className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="/assets/images/Despachos/DespachoA.webp"
                alt="Coordinación profesional de despacho ObraExpress - Entrega puntual de policarbonatos"
                fill
                priority
                className="object-cover"
                sizes="(min-width: 1024px) 640px, 100vw"
              />
              {/* Overlay con información */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-bold text-lg mb-2">✅ Despacho Profesional</h4>
                  <p className="text-sm opacity-90">
                    Equipo especializado en manejo de policarbonatos con vehículos adaptados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}