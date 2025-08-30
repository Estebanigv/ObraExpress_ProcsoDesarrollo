import Head from 'next/head';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  structuredData?: any;
}

export function SEOHead({
  title,
  description,
  keywords,
  ogImage = 'https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp',
  ogType = 'website',
  canonicalUrl,
  noIndex = false,
  structuredData
}: SEOHeadProps) {
  const fullTitle = `${title} | ObraExpress Chile - Materiales de Construcción`;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="es_CL" />
      <meta property="og:site_name" content="ObraExpress Chile" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@obraexpresschile" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      {/* Additional Meta Tags */}
      <meta name="author" content="ObraExpress Chile" />
      <meta name="publisher" content="ObraExpress Chile" />
      <meta name="category" content="Materiales de Construcción" />
      <meta name="coverage" content="Chile" />
      <meta name="distribution" content="Chile" />
      <meta name="rating" content="General" />
      <meta name="revisit-after" content="7 days" />
      <meta name="language" content="Spanish" />
      <meta name="doc-class" content="Living Document" />
      
      {/* Geo Tags for Local SEO */}
      <meta name="geo.region" content="CL" />
      <meta name="geo.placename" content="Santiago, Chile" />
      <meta name="ICBM" content="-33.4489, -70.6693" />
      <meta name="DC.title" content={fullTitle} />
    </Head>
  );
}