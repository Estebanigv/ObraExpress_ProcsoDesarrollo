"use client";

import React from "react";
import { NavbarSimple } from "@/components/navbar-simple";
// import { Chatbot } from "@/components/chatbot";
import Link from "next/link";

export default function Servicios() {
  const servicios = [
    {
      id: 1,
      title: "Asesoría Técnica Especializada",
      description: "Nuestros ingenieros te ayudan a elegir la solución perfecta para tu proyecto específico.",
      icon: "🔬",
      features: [
        "Análisis de requerimientos técnicos",
        "Selección de materiales óptimos",
        "Cálculos estructurales",
        "Recomendaciones de instalación"
      ],
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 2,
      title: "Diseño e Ingeniería",
      description: "Desarrollamos soluciones personalizadas adaptadas a las necesidades específicas de cada cliente.",
      icon: "📐",
      features: [
        "Diseño 3D personalizado",
        "Planos técnicos detallados",
        "Optimización de costos",
        "Simulaciones estructurales"
      ],
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 3,
      title: "Instalación Profesional",
      description: "Equipo certificado para la instalación segura y eficiente de todos nuestros productos.",
      icon: "🔧",
      features: [
        "Instaladores certificados",
        "Herramientas especializadas",
        "Garantía de instalación",
        "Supervisión técnica"
      ],
      image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 4,
      title: "Mantenimiento y Soporte",
      description: "Servicios de mantenimiento preventivo y correctivo para garantizar la durabilidad de tu inversión.",
      icon: "🛠️",
      features: [
        "Mantenimiento preventivo",
        "Reparaciones especializadas",
        "Reemplazo de componentes",
        "Soporte técnico 24/7"
      ],
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 5,
      title: "Corte a Medida",
      description: "Cortamos y adaptamos nuestros productos según las especificaciones exactas de tu proyecto.",
      icon: "✂️",
      features: [
        "Cortes de precisión",
        "Medidas personalizadas",
        "Acabados profesionales",
        "Entrega en obra"
      ],
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    },
    {
      id: 6,
      title: "Capacitación Técnica",
      description: "Programas de capacitación para instaladores y equipos de construcción.",
      icon: "🎓",
      features: [
        "Cursos de instalación",
        "Certificación técnica",
        "Material didáctico",
        "Prácticas supervisadas"
      ],
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
    }
  ];

  const procesos = [
    {
      step: "01",
      title: "Consulta Inicial",
      description: "Analizamos tus necesidades y requerimientos específicos para entender el alcance del proyecto."
    },
    {
      step: "02", 
      title: "Propuesta Técnica",
      description: "Desarrollamos una propuesta detallada con especificaciones técnicas y costos transparentes."
    },
    {
      step: "03",
      title: "Planificación",
      description: "Creamos un cronograma detallado con todas las fases del proyecto y recursos necesarios."
    },
    {
      step: "04",
      title: "Ejecución",
      description: "Implementamos la solución con nuestro equipo especializado y supervisión constante."
    },
    {
      step: "05",
      title: "Entrega y Seguimiento",
      description: "Realizamos pruebas finales, entrega formal y establecemos plan de mantenimiento."
    }
  ];

  return (
    <main className="min-h-screen bg-white">
      <NavbarSimple />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-purple-50 to-indigo-100">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm text-gray-600 mb-6">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              Nuestros Servicios
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Servicios Integrales de{" "}
              <span className="text-purple-600">Policarbonato</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Desde la consultoría técnica hasta la instalación y mantenimiento, 
              te acompañamos en cada etapa de tu proyecto.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                ¿Qué Servicios Ofrecemos?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Soluciones completas para garantizar el éxito de tu proyecto de policarbonato
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {servicios.map((servicio) => (
                <div key={servicio.id} className="bg-gray-50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-center mb-6">
                    <div className="text-5xl mb-4">{servicio.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{servicio.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{servicio.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    {servicio.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-purple-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Link
                      href="/contacto"
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-6 rounded-xl font-medium transition-colors text-center block"
                    >
                      Solicitar Servicio
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Nuestro Proceso de Trabajo
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Metodología probada para garantizar resultados excepcionales en cada proyecto
              </p>
            </div>
            
            <div className="space-y-8">
              {procesos.map((proceso, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-purple-500 text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                      {proceso.step}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{proceso.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">{proceso.description}</p>
                  </div>
                  {index < procesos.length - 1 && (
                    <div className="hidden lg:block flex-shrink-0 w-px h-24 bg-gray-300 mt-8"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  ¿Por qué Elegir Nuestros Servicios?
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Somos el partner estratégico que necesitas para llevar tu proyecto 
                  al siguiente nivel con la máxima calidad y eficiencia.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center p-6 bg-gray-50 rounded-2xl">
                    <div className="text-3xl font-bold text-purple-600 mb-2">500+</div>
                    <div className="text-gray-600">Proyectos Completados</div>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-2xl">
                    <div className="text-3xl font-bold text-purple-600 mb-2">10+</div>
                    <div className="text-gray-600">Años de Experiencia</div>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-2xl">
                    <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                    <div className="text-gray-600">Satisfacción del Cliente</div>
                  </div>
                  <div className="text-center p-6 bg-gray-50 rounded-2xl">
                    <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
                    <div className="text-gray-600">Soporte Técnico</div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <img 
                  src="/assets/images/Home/bannerB-q82.webp" 
                  alt="Nuestros Servicios" 
                  className="w-full rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">✓</div>
                    <div className="text-sm text-gray-600 mt-1">Certificado ISO</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Áreas de Aplicación
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Nuestros servicios cubren una amplia gama de sectores e industrias
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏢</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Comercial</h3>
                <p className="text-sm text-gray-600">Centros comerciales, oficinas, showrooms</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏭</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Industrial</h3>
                <p className="text-sm text-gray-600">Plantas industriales, almacenes, bodegas</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🏠</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Residencial</h3>
                <p className="text-sm text-gray-600">Casas, condominios, terrazas</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Institucional</h3>
                <p className="text-sm text-gray-600">Escuelas, hospitales, instituciones públicas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-500 to-indigo-600">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              ¿Listo para Comenzar tu Proyecto?
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              Nuestro equipo de expertos está preparado para convertir tu visión en realidad
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contacto"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                Solicitar Consulta Gratuita
              </Link>
              <Link
                href="/productos"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-purple-600 transition-colors"
              >
                Ver Productos
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* <Chatbot /> */}
    </main>
  );
}