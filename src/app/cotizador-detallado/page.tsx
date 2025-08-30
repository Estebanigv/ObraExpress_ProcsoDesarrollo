import { Metadata } from 'next'
import { Cotizador } from '@/components/cotizador'
import { NavbarSimple } from '@/components/navbar-simple'

export const metadata: Metadata = {
  title: 'Cotizador Guiado por IA | ObraExpress - Policarbonatos Chile',
  description: 'Asistente de Inteligencia Artificial que te guía paso a paso para encontrar la solución perfecta en policarbonatos. Cotización personalizada y recomendaciones inteligentes.',
  keywords: 'cotizador ia policarbonato, asistente inteligencia artificial, cotización guiada, recomendaciones ia, policarbonato chile, polimax ai',
  openGraph: {
    title: 'Cotizador Guiado por IA - Asistente Inteligente | ObraExpress',
    description: 'Inteligencia Artificial especializada en policarbonatos que te ayuda a encontrar la mejor solución para tu proyecto',
    type: 'website',
    images: ['/assets/images/og-cotizador.jpg']
  }
}

export default function CotizadorDetalladoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <NavbarSimple />
      <div className="pt-24">
        <Cotizador productType="Cotizador Detallado" bgColor="bg-blue-900" textColor="text-white" />
      </div>
    </div>
  )
}