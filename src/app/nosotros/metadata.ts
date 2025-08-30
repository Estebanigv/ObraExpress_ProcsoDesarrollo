import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nosotros - 15+ Años de Experiencia | ObraExpress Chile',
  description: 'Conoce a ObraExpress Chile: especialistas en materiales de construcción desde 2009. Calidad garantizada, atención personalizada y envíos a todo Chile. Tu socio confiable en construcción.',
  keywords: 'sobre obraexpress, empresa construcción Chile, proveedores policarbonato, experiencia construcción, materiales calidad Chile, historia obraexpress, equipo construcción profesional',
  openGraph: {
    title: 'Nosotros - 15+ Años de Experiencia | ObraExpress Chile',
    description: 'Especialistas en materiales de construcción desde 2009. Calidad, confianza y servicio personalizado.',
    type: 'website',
    locale: 'es_CL',
    url: 'https://obraexpress.cl/nosotros',
    siteName: 'ObraExpress Chile',
    images: [
      {
        url: 'https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp',
        width: 1200,
        height: 630,
        alt: 'Equipo ObraExpress Chile',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nosotros | ObraExpress Chile',
    description: '15+ años siendo líderes en materiales de construcción en Chile.',
    images: ['https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp'],
  },
  alternates: {
    canonical: 'https://obraexpress.cl/nosotros',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
    },
  },
  other: {
    'company:founded': '2009',
    'company:employees': '50+',
    'company:industry': 'Construcción',
    'company:type': 'Proveedor de Materiales',
  },
};