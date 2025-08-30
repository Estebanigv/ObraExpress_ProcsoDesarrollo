import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo de Productos - Policarbonatos y Materiales | ObraExpress Chile',
  description: 'Explora nuestro catálogo completo de materiales para construcción: policarbonatos alveolares, compactos, ondulados, perfiles, accesorios y más. Precios competitivos y entrega en todo Chile.',
  keywords: 'catálogo materiales construcción, policarbonato alveolar precio, policarbonato compacto, policarbonato ondulado, perfiles aluminio, selladores construcción, materiales techado, cubiertas policarbonato, láminas construcción Chile',
  openGraph: {
    title: 'Catálogo de Productos | ObraExpress Chile',
    description: 'Catálogo completo de materiales para construcción. Policarbonatos, perfiles y accesorios con garantía UV 10 años.',
    type: 'website',
    locale: 'es_CL',
    url: 'https://obraexpress.cl/productos',
    siteName: 'ObraExpress Chile',
    images: [
      {
        url: 'https://obraexpress.cl/assets/images/productos-catalog.webp',
        width: 1200,
        height: 630,
        alt: 'Catálogo de productos ObraExpress Chile',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Catálogo de Productos | ObraExpress Chile',
    description: 'Materiales de construcción de calidad superior. Envíos a todo Chile.',
    images: ['https://obraexpress.cl/assets/images/productos-catalog.webp'],
  },
  alternates: {
    canonical: 'https://obraexpress.cl/productos',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};