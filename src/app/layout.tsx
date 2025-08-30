import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import "../styles/responsive-optimizations.css";
import "../styles/responsive-navbar.css";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { ConditionalComponents } from "@/components/conditional-components";
import { RealTimePriceIndicator } from "@/modules/products/components/real-time-price-indicator";
import { AuthGuard } from "@/components/auth-guard";
import { CriticalResourcePreloader } from "@/components/critical-resource-preloader";
import { PerformanceOptimizer, CriticalCSS, ResourcePreloader } from "@/components/performance-optimizer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://obraexpress.cl'),
  title: "ObraExpress Chile - Materiales para Construcción | Policarbonatos, Láminas Alveolares y Sistemas Estructurales",
  description: "✅ Especialistas en materiales para construcción en Chile. Policarbonatos, láminas alveolares, rollos compactos, sistemas estructurales y accesorios profesionales para proyectos de construcción. 15+ años de experiencia, garantía UV 10 años. Envío a todo Chile.",
  keywords: "materiales construcción Chile, policarbonato construcción, láminas alveolares construcción, sistemas estructurales construcción, accesorios construcción, cubiertas construcción, cerramientos industriales, techados policarbonato, ObraExpress Chile, construcción sustentable, materiales especializados construcción, ventanas policarbonato, invernaderos, cobertizos, pérgolas",
  robots: "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1",
  authors: [{ name: "ObraExpress Chile" }],
  creator: "ObraExpress Chile",
  publisher: "ObraExpress Chile",
  category: "Materiales de Construcción",
  classification: "Business",
  referrer: "origin-when-cross-origin",
  openGraph: {
    title: "ObraExpress Chile - Materiales para Construcción | Policarbonatos, Láminas Alveolares y Sistemas Estructurales",
    description: "Especialistas en materiales para construcción en Chile. Policarbonatos, láminas alveolares, rollos compactos, sistemas estructurales y accesorios profesionales para proyectos de construcción. 15+ años de experiencia, garantía UV 10 años.",
    type: "website",
    locale: "es_CL",
    siteName: "ObraExpress Chile",
    url: "https://obraexpress.cl",
    images: [
      {
        url: "https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp",
        width: 1200,
        height: 630,
        alt: "Equipo ObraExpress trabajando con materiales de construcción",
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ObraExpress Chile - Materiales para Construcción",
    description: "Especialistas en policarbonatos y materiales para construcción en Chile. Garantía UV 10 años.",
    images: ["https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp"],
    creator: "@obraexpresschile",
    site: "@obraexpresschile",
  },
  alternates: {
    canonical: "https://obraexpress.cl"
  },
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "ObraExpress Chile",
      "alternateName": "ObraExpress",
      "description": "Especialistas en materiales para construcción en Chile. Policarbonatos, láminas alveolares, sistemas estructurales y accesorios profesionales.",
      "url": "https://obraexpress.cl",
      "logo": "https://obraexpress.cl/assets/images/Logotipo/isotipo_obraexpress.webp",
      "image": "https://obraexpress.cl/assets/images/Nosotros/about-us-team.webp",
      "foundingDate": "2009",
      "slogan": "Materiales para la construcción de calidad superior",
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": "+56-2-2345-6789",
          "contactType": "customer service",
          "areaServed": "CL",
          "availableLanguage": "Spanish"
        },
        {
          "@type": "ContactPoint",
          "url": "https://wa.me/56963348909",
          "contactType": "customer service",
          "availableLanguage": "Spanish"
        }
      ],
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "CL",
        "addressRegion": "Región Metropolitana"
      },
      "areaServed": {
        "@type": "Country",
        "name": "Chile"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Materiales de Construcción",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Láminas Alveolares de Policarbonato",
              "category": "Materiales de Construcción"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Rollos Compactos de Policarbonato",
              "category": "Materiales de Construcción"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "Sistemas Estructurales",
              "category": "Materiales de Construcción"
            }
          }
        ]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "200",
        "bestRating": "5"
      },
      "sameAs": [
        "https://www.facebook.com/obraexpresschile",
        "https://www.instagram.com/obraexpresschile"
      ]
    })
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1f2937' }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL" suppressHydrationWarning>
      <head>
        <CriticalCSS />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://unpkg.com" />
        
        {/* DNS prefetch for better performance */}
        <link rel="dns-prefetch" href="https://api.whatsapp.com" />
        <link rel="dns-prefetch" href="https://web.whatsapp.com" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="SAMEORIGIN" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        
        {/* Performance and SEO */}
        <meta name="format-detection" content="telephone=yes, email=yes, address=yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        {/* PWA settings - Commented out Apple-specific meta tags
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ObraExpress" />
        */}
        
        {/* Geographic and business info */}
        <meta name="geo.region" content="CL" />
        <meta name="geo.country" content="Chile" />
        <meta name="geo.placename" content="Santiago, Chile" />
        <meta name="ICBM" content="-33.4489,-70.6693" />
        <meta name="DC.title" content="ObraExpress Chile - Materiales para Construcción" />
        
        {/* Business schema in head for better indexing */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": "ObraExpress Chile",
            "image": "https://obraexpress.cl/assets/images/Logotipo/isotipo_obraexpress.webp",
            "@id": "https://obraexpress.cl",
            "url": "https://obraexpress.cl",
            "telephone": "+56963348909",
            "address": {
              "@type": "PostalAddress",
              "addressCountry": "CL",
              "addressRegion": "Región Metropolitana",
              "addressLocality": "Santiago"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": -33.4489,
              "longitude": -70.6693
            },
            "openingHoursSpecification": [{
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              "opens": "09:00",
              "closes": "18:00"
            }, {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "Saturday",
              "opens": "09:00",
              "closes": "14:00"
            }],
            "priceRange": "$$"
          })
        }} />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
        suppressHydrationWarning
      >
        <QueryProvider>
          <AuthProvider>
            <CartProvider>
              <CriticalResourcePreloader />
              <ResourcePreloader />
              <PerformanceOptimizer />
              <AuthGuard requireAuth={false} redirectTo="/login">
                {children}
                <ConditionalComponents />
              </AuthGuard>
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
