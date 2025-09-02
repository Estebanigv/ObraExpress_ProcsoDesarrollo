"use client";

import React, { useState, useEffect } from 'react';
import { navigate } from '@/lib/client-utils';

interface CotizadorProps {
  productType?: string;
  bgColor?: string;
  textColor?: string;
}

interface ProductData {
  name: string;
  category: string;
  thicknesses: string[];
  colors: string[];
  pricePerM2?: number;
}

const PRODUCTS: ProductData[] = [
  {
    name: "Lámina Alveolar Estándar",
    category: "alveolar",
    thicknesses: ["4mm", "6mm", "8mm", "10mm", "16mm"],
    colors: ["Transparente", "Bronce", "Azul", "Verde", "Opal"],
    pricePerM2: 8500
  },
  {
    name: "Lámina Alveolar Premium",
    category: "alveolar",
    thicknesses: ["6mm", "8mm", "10mm", "16mm", "20mm"],
    colors: ["Transparente", "Bronce", "Azul", "Verde", "Opal", "Fumé"],
    pricePerM2: 12000
  },
  {
    name: "Rollo Compacto Estándar",
    category: "compacto",
    thicknesses: ["2mm", "3mm", "4mm", "5mm"],
    colors: ["Transparente", "Bronce", "Azul", "Verde"],
    pricePerM2: 15000
  },
  {
    name: "Rollo Compacto Premium",
    category: "compacto",
    thicknesses: ["3mm", "4mm", "5mm", "6mm"],
    colors: ["Transparente", "Bronce", "Azul", "Verde", "Opal", "Fumé"],
    pricePerM2: 22000
  }
];

export const Cotizador: React.FC<CotizadorProps> = ({ 
  productType = "", 
  bgColor = "bg-blue-900", 
  textColor = "text-white" 
}) => {
  const [formData, setFormData] = useState({
    tipoProyecto: productType,
    producto: '',
    espesor: '',
    color: '',
    ancho: '',
    largo: '',
    cantidad: '1',
    instalacion: 'no',
    ubicacion: '',
    nombre: '',
    telefono: '',
    email: ''
  });

  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);

  // Calcular estimación de precio
  useEffect(() => {
    if (selectedProduct && formData.ancho && formData.largo && formData.cantidad) {
      const area = parseFloat(formData.ancho) * parseFloat(formData.largo);
      const totalArea = area * parseInt(formData.cantidad);
      const basePrice = totalArea * (selectedProduct.pricePerM2 || 0);
      const installationPrice = formData.instalacion === 'si' ? basePrice * 0.3 : 0;
      setEstimatedPrice(basePrice + installationPrice);
    } else {
      setEstimatedPrice(0);
    }
  }, [selectedProduct, formData.ancho, formData.largo, formData.cantidad, formData.instalacion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const area = formData.ancho && formData.largo ? 
      (parseFloat(formData.ancho) * parseFloat(formData.largo) * parseInt(formData.cantidad)).toFixed(2) : 
      'No especificada';
    
    // Crear mensaje detallado para WhatsApp
    const mensaje = `🏗️ *SOLICITUD DE COTIZACIÓN - ObraExpress*

📋 *DETALLES DEL PROYECTO:*
• Tipo: ${formData.tipoProyecto || 'Consulta general'}
• Producto: ${formData.producto || 'No especificado'}
• Espesor: ${formData.espesor || 'No especificado'}
• Color: ${formData.color || 'No especificado'}

📐 *DIMENSIONES:*
• Ancho: ${formData.ancho}m
• Largo: ${formData.largo}m
• Cantidad: ${formData.cantidad} unidad(es)
• Área total: ${area} m²

🔧 *SERVICIOS:*
• Instalación: ${formData.instalacion === 'si' ? 'Sí requiere' : 'No requiere'}
• Ubicación: ${formData.ubicacion || 'No especificada'}

👤 *DATOS DE CONTACTO:*
• Nombre: ${formData.nombre}
• Teléfono: ${formData.telefono}
• Email: ${formData.email}

💰 *Estimación aproximada: $${estimatedPrice.toLocaleString('es-CL')} CLP*
*(Precio sujeto a confirmación técnica)*

🌐 Desde: Página web ObraExpress`;

    const whatsappUrl = `https://wa.me/56933334444?text=${encodeURIComponent(mensaje)}`;
    navigate.openInNewTab(whatsappUrl);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Si se selecciona un producto, actualizar el producto seleccionado
    if (name === 'producto') {
      const product = PRODUCTS.find(p => p.name === value);
      setSelectedProduct(product || null);
      // Reset dependent fields
      setFormData(prev => ({
        ...prev,
        espesor: '',
        color: ''
      }));
    }
  };

  return (
    <div className={`${bgColor} ${textColor} rounded-3xl p-8 shadow-2xl`}>
      <h3 className="text-3xl font-bold mb-4 text-center">
        🏗️ Cotizador Personalizado
      </h3>
      <p className="text-center mb-6 opacity-90">
        Selecciona tu producto específico y obtén una estimación instantánea
      </p>
      
      {estimatedPrice > 0 && (
        <div className="bg-yellow-400 text-black rounded-xl p-4 mb-6 text-center">
          <div className="text-sm font-medium">Estimación Aproximada:</div>
          <div className="text-2xl font-bold">${estimatedPrice.toLocaleString('es-CL')} CLP</div>
          <div className="text-xs opacity-75">*Precio referencial sujeto a confirmación</div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2">🏗️ Tipo de Proyecto</label>
          <select 
            name="tipoProyecto"
            value={formData.tipoProyecto}
            onChange={handleChange}
            className="w-full p-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium backdrop-blur-sm"
            required
          >
            <option value="">Seleccionar proyecto...</option>
            <option value="Techado Residencial">🏠 Techado Residencial</option>
            <option value="Techado Industrial">🏭 Techado Industrial</option>
            <option value="Cerramientos">🔒 Cerramientos</option>
            <option value="Invernaderos">🌱 Invernaderos</option>
            <option value="Cubiertas Deportivas">⚽ Cubiertas Deportivas</option>
            <option value="Otros">📋 Otros</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">📦 Producto Específico</label>
          <select 
            name="producto"
            value={formData.producto}
            onChange={handleChange}
            className="w-full p-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium backdrop-blur-sm"
            required
          >
            <option value="">Seleccionar producto...</option>
            {PRODUCTS.map((product) => (
              <option key={product.name} value={product.name}>
                {product.name} - ${product.pricePerM2?.toLocaleString('es-CL')}/m²
              </option>
            ))}
          </select>
        </div>

        {selectedProduct && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">📏 Espesor</label>
              <select 
                name="espesor"
                value={formData.espesor}
                onChange={handleChange}
                className="w-full p-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium backdrop-blur-sm"
                required
              >
                <option value="">Seleccionar espesor...</option>
                {selectedProduct.thicknesses.map((thickness) => (
                  <option key={thickness} value={thickness}>{thickness}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">🎨 Color</label>
              <select 
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-full p-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium backdrop-blur-sm"
                required
              >
                <option value="">Seleccionar color...</option>
                {selectedProduct.colors.map((color) => (
                  <option key={color} value={color}>{color}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">📐 Ancho (m)</label>
            <input 
              type="number" 
              name="ancho"
              value={formData.ancho}
              onChange={handleChange}
              placeholder="5.0" 
              step="0.1"
              min="0.1"
              className="w-full p-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium backdrop-blur-sm" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">📐 Largo (m)</label>
            <input 
              type="number" 
              name="largo"
              value={formData.largo}
              onChange={handleChange}
              placeholder="8.0" 
              step="0.1"
              min="0.1"
              className="w-full p-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium backdrop-blur-sm" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">🔢 Cantidad</label>
            <input 
              type="number" 
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              placeholder="1" 
              min="1"
              className="w-full p-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium backdrop-blur-sm" 
              required
            />
          </div>
        </div>

        {formData.ancho && formData.largo && (
          <div className="bg-gray-100/20 rounded-xl p-3 text-center">
            <span className="text-sm">📊 Área total: </span>
            <span className="font-bold text-yellow-400">
              {(parseFloat(formData.ancho) * parseFloat(formData.largo) * parseInt(formData.cantidad || '1')).toFixed(2)} m²
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">🔧 ¿Requiere Instalación?</label>
            <select 
              name="instalacion"
              value={formData.instalacion}
              onChange={handleChange}
              className="w-full p-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium backdrop-blur-sm"
            >
              <option value="no">No, solo el material</option>
              <option value="si">Sí, incluir instalación (+30%)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">📍 Ubicación</label>
            <input 
              type="text" 
              name="ubicacion"
              value={formData.ubicacion}
              onChange={handleChange}
              placeholder="Santiago, Las Condes..." 
              className="w-full p-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium backdrop-blur-sm" 
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2">👤 Nombre Completo</label>
          <input 
            type="text" 
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingresa tu nombre completo" 
            className="w-full p-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium backdrop-blur-sm" 
            required
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-2">📱 WhatsApp</label>
            <input 
              type="tel" 
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="+56 9 xxxx xxxx" 
              className="w-full p-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium backdrop-blur-sm" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">📧 Email (opcional)</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com" 
              className="w-full p-3 bg-white/90 border border-white/30 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium backdrop-blur-sm" 
            />
          </div>
        </div>
        
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg"
        >
          🚀 Enviar Cotización Detallada por WhatsApp
        </button>
        
        <div className="flex items-center justify-center mt-6 space-x-6 text-sm opacity-90">
          <span className="flex items-center">
            <svg className="h-5 w-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Estimación Instantánea
          </span>
          <span className="flex items-center">
            <svg className="h-5 w-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Respuesta &lt; 2h
          </span>
          <span className="flex items-center">
            <svg className="h-5 w-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Vía WhatsApp
          </span>
        </div>
      </form>
    </div>
  );
};