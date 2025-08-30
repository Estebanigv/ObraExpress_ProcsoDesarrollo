import { Metadata } from "next";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { NavbarSimple } from "@/components/navbar-simple";
// import { Chatbot } from "@/components/chatbot";
import { AnimatedCounter } from "@/components/animated-counter";

export const metadata: Metadata = {
  title: "Nosotros - ObraExpress Chile | 15+ Años Especializados en Materiales de Construcción",
  description: "Conoce la historia y experiencia de ObraExpress Chile. Más de 15 años liderando el mercado de policarbonatos y materiales de construcción con garantía UV de 10 años y servicio especializado.",
  keywords: "empresa ObraExpress, historia ObraExpress Chile, experiencia materiales construcción, policarbonatos Chile, garantía UV 10 años, especialistas construcción",
  openGraph: {
    title: "Nosotros - ObraExpress Chile | Especialistas en Materiales de Construcción",
    description: "Más de 15 años de experiencia en policarbonatos y materiales de construcción. Conoce nuestra historia, valores y compromiso con la calidad.",
    type: "website",
    images: [
      {
        url: "https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp",
        width: 1200,
        height: 630,
        alt: "Equipo ObraExpress trabajando con materiales de construcción",
      }
    ],
  },
  alternates: {
    canonical: "https://obraexpress.cl/nosotros"
  }
};

export default function Nosotros() {
  return (
    <main className="min-h-screen bg-white">
      <NavbarSimple />
      
      {/* Hero Section - Your Trusted Partner */}
      <section className="pt-56 pb-20 bg-gradient-to-br from-green-50 to-green-100">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <div className="inline-flex items-center px-3 py-1 bg-white rounded-full text-sm text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Acerca ObraExpress
                </div>
                
                <h1 className="text-3xl md:text-4xl font-light text-gray-800 leading-tight tracking-wide">
                  Tu Socio de Confianza en{" "}
                  <span className="text-green-600">Materiales de Construcción</span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Especialistas en láminas alveolares, rollos compactos y soluciones de policarbonato 
                  de alta calidad para la construcción moderna en Chile.
                </p>

                {/* Product Features */}
                <div className="pt-8">
                  <p className="text-sm text-gray-500 mb-4">Nuestras Especialidades</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-gray-800">Láminas Alveolares</span>
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-gray-800">Rollos Compactos</span>
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-gray-800">Protección UV</span>
                    </div>
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                      </div>
                      <span className="text-xs font-semibold text-gray-800">Instalación Pro</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right Image */}
              <div className="relative">
                <div className="bg-green-100 rounded-3xl p-8 aspect-[4/3] flex items-center justify-center">
                  <Image 
                    src="/assets/images/Nosotros/about-us-team.webp" 
                    alt="Equipo ObraExpress trabajando con materiales de construcción" 
                    className="w-full h-full object-cover rounded-2xl"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Driven by Innovation Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-light text-gray-800 leading-tight tracking-wide">
                  Impulsados por la Innovación, Potenciados por las Personas.
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  En ObraExpress combinamos materiales de alta calidad con experiencia técnica especializada. 
                  Nuestro equipo profesional trabaja cada día para ofrecer soluciones constructivas que transformen 
                  proyectos y superen las expectativas más exigentes.
                </p>
                <div className="flex items-center space-x-6">
                  <div className="text-center bg-green-50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <AnimatedCounter 
                      endValue={15} 
                      suffix="+" 
                      duration={2500}
                      className="text-3xl font-bold text-green-600"
                    />
                    <div className="text-sm font-medium text-gray-700 mt-1">Años Experiencia</div>
                  </div>
                  <div className="text-center bg-blue-50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <AnimatedCounter 
                      endValue={800} 
                      suffix="+" 
                      duration={3000}
                      className="text-3xl font-bold text-blue-600"
                    />
                    <div className="text-sm font-medium text-gray-700 mt-1">Proyectos Completados</div>
                  </div>
                  <div className="text-center bg-purple-50 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <AnimatedCounter 
                      endValue={97} 
                      suffix="%" 
                      duration={2800}
                      className="text-3xl font-bold text-purple-600"
                    />
                    <div className="text-sm font-medium text-gray-700 mt-1">Satisfacción Cliente</div>
                  </div>
                </div>
              </div>
              
              {/* Right Content - Image Collage */}
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {/* Main large image */}
                  <div className="col-span-2 relative rounded-2xl overflow-hidden">
                    <img 
                      src="/assets/images/Nosotros/about-us-team.webp" 
                      alt="Equipo ObraExpress trabajando con materiales de construcción" 
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                      Nuestro Equipo
                    </div>
                  </div>
                  
                  {/* Small images */}
                  <div className="relative rounded-xl overflow-hidden">
                    <img 
                      src="/assets/images/Home/bannerB-q82.webp" 
                      alt="Productos de policarbonato" 
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-green-500/10"></div>
                  </div>
                  
                  <div className="relative rounded-xl overflow-hidden">
                    <img 
                      src="/assets/images/Home/bannerB-q82.webp" 
                      alt="Instalación profesional" 
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-blue-500/10"></div>
                  </div>
                </div>
                
                {/* Floating stats card */}
                <div className="absolute bottom-4 -right-6 bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">4.8</div>
                      <div className="text-xs text-gray-600">+150 clientes</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-8xl font-bold text-gray-900 mb-2">95%</div>
                <div className="text-gray-600">Satisfacción del Cliente</div>
              </div>
              <div>
                <div className="text-8xl font-bold text-gray-900 mb-2">800+</div>
                <div className="text-gray-600">Proyectos Completados</div>
              </div>
              <div>
                <div className="text-8xl font-bold text-gray-900 mb-2">15+</div>
                <div className="text-gray-600">Años de Experiencia</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Built on Trust Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Image */}
              <div className="relative">
                <img 
                  src="/assets/images/Nosotros/about-us-team.webp" 
                  alt="Equipo ObraExpress trabajando con materiales de construcción" 
                  className="w-full rounded-2xl shadow-lg"
                />
                <div className="absolute bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Equipo ObraExpress
                </div>
              </div>
              
              {/* Right Content */}
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-light text-gray-800 tracking-wide">
                  Construido en Confianza, Impulsado por Resultados
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Garantía UV 10 Años</h3>
                      <p className="text-gray-600 text-sm">Protección garantizada contra rayos ultravioleta</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Materiales Certificados</h3>
                      <p className="text-gray-600 text-sm">Cumplimiento de normativas internacionales de construcción</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Asesoría Técnica Especializada</h3>
                      <p className="text-gray-600 text-sm">Soporte profesional en diseño e instalación</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 border">
                  <p className="text-gray-600 text-sm">
                    De acuerdo con el Reglamento, constituirán infracciones administrativas las conductas tipificadas como tales en este texto de manera expresa por violar las obligaciones establecidas en la normativa aplicable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-8 tracking-wide">
                Conoce a las Personas Detrás de la Innovación
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center group">
                <div className="relative mb-4 overflow-hidden">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <div className="text-4xl font-bold text-green-600">MG</div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">María González</h3>
                <p className="text-green-600 font-medium text-sm">Directora de Proyectos</p>
                <p className="text-gray-500 text-xs mt-1">15+ años de experiencia</p>
              </div>
              
              <div className="text-center group">
                <div className="relative mb-4 overflow-hidden">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <div className="text-4xl font-bold text-blue-600">CM</div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Carlos Mendoza</h3>
                <p className="text-blue-600 font-medium text-sm">Ingeniero Senior</p>
                <p className="text-gray-500 text-xs mt-1">Especialista en estructuras</p>
              </div>
              
              <div className="text-center group">
                <div className="relative mb-4 overflow-hidden">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <div className="text-4xl font-bold text-purple-600">AR</div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Ana Rodríguez</h3>
                <p className="text-purple-600 font-medium text-sm">Especialista en Calidad</p>
                <p className="text-gray-500 text-xs mt-1">Certificaciones ISO</p>
              </div>
              
              <div className="text-center group">
                <div className="relative mb-4 overflow-hidden">
                  <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                    <div className="text-4xl font-bold text-orange-600">LH</div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Luis Hernández</h3>
                <p className="text-orange-600 font-medium text-sm">Consultor Técnico</p>
                <p className="text-gray-500 text-xs mt-1">Asesoría especializada</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-green-600 font-medium mb-2">Testimonios</p>
              <h2 className="text-3xl md:text-4xl font-light text-gray-800 tracking-wide">
                Reviews que Hablan por Volúmenes
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Review 1 */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Los materiales de ObraExpress han sido fundamentales en nuestros proyectos. La calidad del policarbonato y el soporte técnico son excepcionales."
                </p>
                <div className="flex items-center">
                  <img 
                    src="/assets/images/Review/avatar1.webp" 
                    alt="Client" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">María González</h4>
                    <p className="text-gray-600 text-sm">Arquitecta Principal</p>
                  </div>
                </div>
              </div>
              
              {/* Review 2 */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "Los productos de policarbonato que ofrecen son de primera calidad. La atención al cliente y el soporte técnico son excepcionales."
                </p>
                <div className="flex items-center">
                  <img 
                    src="/assets/images/Review/avatar2.webp" 
                    alt="Client" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">Carlos Mendoza</h4>
                    <p className="text-gray-600 text-sm">Director de Construcción</p>
                  </div>
                </div>
              </div>
              
              {/* Review 3 */}
              <div className="bg-white rounded-2xl p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "La durabilidad y resistencia de sus láminas alveolares es notable. Han transformado completamente nuestros proyectos de techado."
                </p>
                <div className="flex items-center">
                  <img 
                    src="/assets/images/Review/avatar3.webp" 
                    alt="Client" 
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">Ana Rodríguez</h4>
                    <p className="text-gray-600 text-sm">Ingeniera Estructural</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insights & Updates Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-green-600 font-medium mb-2">Blog</p>
              <h2 className="text-3xl md:text-4xl font-light text-gray-800 tracking-wide">
                Insights & Actualizaciones
              </h2>
              <p className="text-gray-600 mt-4">Mantente al día con las últimas tendencias y consejos.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Blog Post 1 */}
              <Link href="/productos?categoria=Policarbonato Alveolar" className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                  <img 
                    src="/assets/images/Home/bannerB-q82.webp" 
                    alt="Innovaciones en Policarbonato Alveolar" 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                    01 jul 2024
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors text-lg">
                  Innovaciones en Láminas Alveolares de Policarbonato
                </h3>
                <p className="text-gray-600 text-sm">Descubre las últimas tecnologías en materiales de construcción sustentable.</p>
              </Link>
              
              {/* Blog Post 2 */}
              <Link href="/contacto" className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                  <img 
                    src="/assets/images/Home/bannerB-q82.webp" 
                    alt="Guía de Instalación Techados" 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                    15 jun 2024
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors text-lg">
                  Guía de Instalación para Techados Industriales
                </h3>
                <p className="text-gray-600 text-sm">Aprende las mejores prácticas para instalaciones profesionales.</p>
              </Link>
              
              {/* Blog Post 3 */}
              <Link href="/productos" className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl mb-4 shadow-lg">
                  <img 
                    src="/assets/images/Home/bannerB-q82.webp" 
                    alt="Construcción Sustentable" 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                    28 may 2024
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors text-lg">
                  Ventajas del Policarbonato en Construcción Sustentable
                </h3>
                <p className="text-gray-600 text-sm">Explora cómo contribuimos al futuro sostenible de la construcción.</p>
              </Link>
            </div>
            
            <div className="text-center mt-12">
              <Link href="/productos" className="inline-block bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                Ver Catálogo Completo
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-gray-900 to-black">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl md:text-4xl font-light text-white mb-6 tracking-wide">
              ¿Listo para Transformar tu Proyecto con Materiales de Primera Calidad?
            </h2>
            <p className="text-xl mb-8 text-gray-300">
              Únete a cientos de constructores que ya están transformando sus obras con nuestros materiales especializados.
            </p>
            <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Obtén Una Consulta Gratuita
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">OBRAEXPRESS</h2>
                <p className="text-sm text-gray-600">Materiales de construcción</p>
              </div>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed max-w-sm">
                Plataforma especializada en materiales de construcción que desarrolladores y equipos de obra necesitan. Especialistas en policarbonato y soluciones constructivas innovadoras.
              </p>
              
              {/* Social Icons */}
              <div className="flex space-x-3 mb-6">
                <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">GPS logística de vanguardia</span>
              </div>
            </div>
            
            {/* Products */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Productos</h3>
              <ul className="space-y-3">
                <li><a href="/productos?categoria=Policarbonato Alveolar" className="text-sm hover:text-blue-600 transition-colors">Policarbonato Alveolar</a></li>
                <li><a href="/productos?categoria=Policarbonato Ondulado" className="text-sm hover:text-blue-600 transition-colors">Policarbonato Ondulado</a></li>
                <li><a href="/productos?categoria=Policarbonato Compacto" className="text-sm hover:text-blue-600 transition-colors">Policarbonato Compacto</a></li>
                <li><a href="/productos?categoria=Rollos" className="text-sm hover:text-blue-600 transition-colors">Rollos</a></li>
                <li><a href="/productos?categoria=Perfiles y Accesorios" className="text-sm hover:text-blue-600 transition-colors">Perfiles y Accesorios</a></li>
                <li><a href="/productos?categoria=Pinturas" className="text-sm hover:text-blue-600 transition-colors">Pinturas y Selladores</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Empresa</h3>
              <ul className="space-y-3">
                <li><a href="/nosotros" className="text-sm hover:text-blue-600 transition-colors">Acerca de OBRAEXPRESS</a></li>
                <li><a href="/productos" className="text-sm hover:text-blue-600 transition-colors">Catálogo</a></li>
                <li><a href="/contacto" className="text-sm hover:text-blue-600 transition-colors">Contacto</a></li>
                <li><a href="/cotizador-detallado" className="text-sm hover:text-blue-600 transition-colors">Cotizador IA</a></li>
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Trabaja con nosotros</span></li>
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Solicitar Features</span></li>
              </ul>
            </div>
            
            {/* Partner with us */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Asociarse con nosotros</h3>
              <ul className="space-y-3">
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Ser Distribuidor</span></li>
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Programa de Afiliados</span></li>
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Inversionistas</span></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Soporte</h3>
              <ul className="space-y-3">
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Documentación</span></li>
                <li><a href="/contacto" className="text-sm hover:text-blue-600 transition-colors">Contacto</a></li>
              </ul>
              
              {/* Quality Rating */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Calidad</h3>
                <div className="flex items-center space-x-1 mb-2">
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <p className="text-xs text-gray-600">Máxima calidad</p>
                
                {/* Certifications in one line */}
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Certificaciones</h4>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="bg-gray-200 text-white px-2 py-1 rounded font-medium">UV 10</span>
                    <span className="bg-gray-200 text-white px-2 py-1 rounded font-medium">ISO 9001</span>
                    <span className="bg-gray-200 text-white px-2 py-1 rounded font-medium">CE</span>
                    <span className="bg-gray-200 text-white px-2 py-1 rounded font-medium">ECO</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sitemap */}
            <div className="lg:col-span-6 mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Mapa del Sitio</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Principales</h4>
                  <ul className="space-y-0.5">
                    <li><a href="/" className="text-gray-600 hover:text-blue-600">Inicio</a></li>
                    <li><a href="/productos" className="text-gray-600 hover:text-blue-600">Productos</a></li>
                    <li><a href="/nosotros" className="text-gray-600 hover:text-blue-600">Nosotros</a></li>
                    <li><a href="/contacto" className="text-gray-600 hover:text-blue-600">Contacto</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">IA & Herramientas</h4>
                  <ul className="space-y-0.5">
                    <li><a href="/cotizador-detallado" className="text-gray-600 hover:text-blue-600">Cotizador IA</a></li>
                    <li><a href="/calculadora" className="text-gray-600 hover:text-blue-600">Calculadora</a></li>
                    <li><span className="text-gray-400">Asistente IA</span></li>
                    <li><span className="text-gray-400">Simulador 3D</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Categorías</h4>
                  <ul className="space-y-0.5">
                    <li><a href="/productos?categoria=Policarbonato Alveolar" className="text-gray-600 hover:text-blue-600">Alveolar</a></li>
                    <li><a href="/productos?categoria=Policarbonato Compacto" className="text-gray-600 hover:text-blue-600">Compacto</a></li>
                    <li><a href="/productos?categoria=Policarbonato Ondulado" className="text-gray-600 hover:text-blue-600">Ondulado</a></li>
                    <li><a href="/productos?categoria=Perfiles y Accesorios" className="text-gray-600 hover:text-blue-600">Accesorios</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Soporte IA</h4>
                  <ul className="space-y-0.5">
                    <li><a href="/chat-ai" target="_blank" className="text-gray-600 hover:text-blue-600">Guía IA</a></li>
                    <li><a href="/preguntas-frecuentes" className="text-gray-600 hover:text-blue-600">FAQ</a></li>
                    <li><span className="text-gray-400">Documentación</span></li>
                    <li><a href="/contacto" className="text-gray-600 hover:text-blue-600">Contacto</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Legal</h4>
                  <ul className="space-y-0.5">
                    <li><span className="text-gray-400">Privacidad</span></li>
                    <li><span className="text-gray-400">Términos</span></li>
                    <li><span className="text-gray-400">Garantías</span></li>
                    <li><span className="text-gray-400">Devoluciones</span></li>
                  </ul>
                </div>
              </div>
              
              {/* Advanced Tech Note */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic flex items-center space-x-2">
                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Plataforma con IA de vanguardia • Logística inteligente • Tecnología de última generación</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm mb-4 md:mb-0">
                © 2024 OBRAEXPRESS — LinearBytes Inc.
              </p>
              <div className="flex space-x-6 text-sm">
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Política de Privacidad</a>
                <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors">Términos</a>
                <a href="/admin" className="text-gray-400 hover:text-gray-600 transition-colors text-xs opacity-50 hover:opacity-100">acceso administrativo</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot Component */}
      {/* <Chatbot /> */}
    </main>
  );
}