import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto - Atención Personalizada | ObraExpress Chile',
  description: 'Contáctanos para cotizaciones y asesoría en materiales de construcción. WhatsApp: +56 9 6334 8909. Atención de lunes a viernes. Respuesta rápida garantizada.',
  keywords: 'contacto obraexpress, cotización policarbonato, asesoría construcción, materiales construcción Chile, contacto construcción, presupuesto policarbonato, consultas técnicas construcción',
  openGraph: {
    title: 'Contacto | ObraExpress Chile',
    description: 'Estamos aquí para ayudarte. Cotizaciones, asesoría técnica y atención personalizada en materiales de construcción.',
    type: 'website',
    locale: 'es_CL',
    url: 'https://obraexpress.cl/contacto',
    siteName: 'ObraExpress Chile',
    images: [
      {
        url: 'https://obraexpress.cl/assets/images/contacto-obraexpress.webp',
        width: 1200,
        height: 630,
        alt: 'Contacto ObraExpress Chile',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contacto | ObraExpress Chile',
    description: 'WhatsApp: +56 9 6334 8909 - Cotizaciones y asesoría técnica personalizada.',
    images: ['https://obraexpress.cl/assets/images/contacto-obraexpress.webp'],
  },
  alternates: {
    canonical: 'https://obraexpress.cl/contacto',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  other: {
    'contact:phone': '+56963348909',
    'contact:email': 'contacto@obraexpress.cl',
    'business:hours': 'Mo-Fr 09:00-18:00',
    'business:region': 'CL',
  },
};