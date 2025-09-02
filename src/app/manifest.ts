import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ObraExpress Chile - Materiales para Construcción',
    short_name: 'ObraExpress',
    description: 'Especialistas en policarbonatos y materiales para construcción en Chile',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#eab308',
    categories: ['business', 'construction', 'shopping'],
    icons: [
      {
        src: '/assets/images/Logotipo/isotipo_obraexpress.webp',
        sizes: 'any',
        type: 'image/webp',
      },
    ],
  }
}