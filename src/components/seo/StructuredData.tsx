export function OrganizationStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://obraexpress.cl/#organization",
    "name": "ObraExpress Chile",
    "alternateName": "ObraExpress",
    "url": "https://obraexpress.cl",
    "logo": {
      "@type": "ImageObject",
      "url": "https://obraexpress.cl/assets/images/Logotipo/isotipo_obraexpress.webp",
      "width": 600,
      "height": 60
    },
    "image": "https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp",
    "description": "Especialistas en materiales para construcción en Chile. Policarbonatos, láminas alveolares, sistemas estructurales y accesorios profesionales.",
    "foundingDate": "2009",
    "founder": {
      "@type": "Person",
      "name": "Equipo Fundador ObraExpress"
    },
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CL",
      "addressRegion": "Región Metropolitana",
      "addressLocality": "Santiago"
    },
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+56-9-6334-8909",
        "contactType": "customer service",
        "areaServed": "CL",
        "availableLanguage": ["Spanish", "English"]
      }
    ],
    "sameAs": [
      "https://www.facebook.com/obraexpresschile",
      "https://www.instagram.com/obraexpresschile",
      "https://www.linkedin.com/company/obraexpresschile",
      "https://wa.me/56963348909"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Catálogo de Materiales de Construcción",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Policarbonatos",
          "itemListElement": [
            {"@type": "Product", "name": "Policarbonato Alveolar"},
            {"@type": "Product", "name": "Policarbonato Compacto"},
            {"@type": "Product", "name": "Policarbonato Ondulado"}
          ]
        }
      ]
    }
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function ProductStructuredData({ product }: { product: any }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.nombre,
    "description": product.descripcion,
    "image": product.imagen,
    "brand": {
      "@type": "Brand",
      "name": "ObraExpress"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "CLP",
      "price": product.precio,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "ObraExpress Chile"
      },
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "127"
    }
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function LocalBusinessStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "ObraExpress Chile",
    "image": "https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp",
    "@id": "https://obraexpress.cl",
    "url": "https://obraexpress.cl",
    "telephone": "+56963348909",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CL",
      "addressRegion": "RM",
      "addressLocality": "Santiago"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -33.4489,
      "longitude": -70.6693
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ]
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué tipos de policarbonato venden?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "En ObraExpress Chile ofrecemos policarbonato alveolar (4mm, 6mm, 10mm), policarbonato compacto (3mm, 5mm, 8mm) y policarbonato ondulado en varios colores y espesores."
        }
      },
      {
        "@type": "Question",
        "name": "¿Realizan envíos a todo Chile?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, realizamos envíos a todo Chile. Los despachos se programan semanalmente y coordinamos directamente con el cliente para asegurar la entrega."
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué garantía tienen los productos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Todos nuestros policarbonatos cuentan con garantía UV de 10 años y garantía de fábrica contra defectos de fabricación."
        }
      }
    ]
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}