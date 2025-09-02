"use client";

import React, { useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onError?: () => void;
  fallbackIcon?: React.ReactNode;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  placeholder = 'empty',
  blurDataURL,
  onError,
  fallbackIcon
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(!priority);

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Si no hay src válido o si hay error, mostrar fallback
  if (imageError || !src || src.trim() === '') {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-gray-400 ${className}`}>
        {fallbackIcon || (
          <div className="text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <div className="text-xs">Imagen no disponible</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && !priority && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        priority={priority}
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        placeholder={priority ? 'empty' : placeholder}
        blurDataURL={placeholder === 'blur' ? blurDataURL : undefined}
        onError={handleError}
        onLoad={handleLoad}
        quality={90}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        style={{ 
          maxWidth: '100%',
          height: 'auto',
          aspectRatio: width && height ? `${width}/${height}` : 'auto'
        }}
        title={alt}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    </div>
  );
}

// Componente específico para productos con SEO mejorado
export function ProductImage({
  src,
  alt,
  className = '',
  priority = false,
  productName,
  productCategory
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  productName?: string;
  productCategory?: string;
}) {
  // Mejorar el alt text para SEO
  const enhancedAlt = productName 
    ? `${productName} - ${alt} | ObraExpress Chile`
    : `${alt} | Materiales de Construcción ObraExpress Chile`;

  return (
    <OptimizedImage
      src={src}
      alt={enhancedAlt}
      width={400}
      height={300}
      className={`${className} product-image`}
      priority={priority}
      sizes="(max-width: 480px) 100vw, (max-width: 768px) 90vw, (max-width: 1200px) 50vw, 400px"
      fallbackIcon={
        <div className="text-center p-4" role="img" aria-label="Imagen de producto no disponible">
          <div className="text-4xl mb-2" aria-hidden="true">📦</div>
          <div className="text-sm font-medium">{productCategory || 'Producto'}</div>
          <div className="text-xs text-gray-500">ObraExpress Chile</div>
        </div>
      }
    />
  );
}

// Componente para thumbnails del carrito con accesibilidad mejorada
export function CartThumbnail({
  src,
  alt,
  className = '',
  productName
}: {
  src: string;
  alt: string;
  className?: string;
  productName?: string;
}) {
  const enhancedAlt = productName 
    ? `Miniatura: ${productName} en carrito de compras`
    : `Miniatura: ${alt} en carrito`;

  return (
    <OptimizedImage
      src={src}
      alt={enhancedAlt}
      width={64}
      height={64}
      className={`${className} cart-thumbnail`}
      sizes="64px"
      placeholder="empty"
      fallbackIcon={
        <svg 
          className="w-6 h-6" 
          fill="currentColor" 
          viewBox="0 0 20 20"
          aria-label="Imagen de producto no disponible"
          role="img"
        >
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      }
    />
  );
}

// Componente Hero Image con optimizaciones especiales
export function HeroImage({
  src,
  alt,
  className = '',
  priority = true
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={1200}
      height={600}
      className={`${className} hero-image`}
      priority={priority}
      sizes="100vw"
      placeholder="blur"
      fallbackIcon={
        <div className="text-center p-8" role="img" aria-label="Imagen principal no disponible">
          <div className="text-6xl mb-4" aria-hidden="true">🏗️</div>
          <div className="text-lg font-semibold">ObraExpress Chile</div>
          <div className="text-sm text-gray-600">Materiales para Construcción</div>
        </div>
      }
    />
  );
}