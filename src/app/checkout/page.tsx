"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import TransbankService from '@/modules/checkout/services/transbank';
import Image from 'next/image';
import { CartThumbnail } from '@/components/optimized-image';
import { useGeolocation } from '@/hooks/useGeolocation';

interface CheckoutFormData {
  nombre: string;
  telefono: string;
  email: string;
  empresa?: string;
  rut?: string;
  region: string;
  comuna: string;
  direccion: string;
  comentarios: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
}

interface DeliveryDate {
  itemId: string;
  selectedDate: string;
}

// Función para calcular el próximo jueves disponible
const getNextDeliveryThursday = (): Date => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado
  
  let daysToAdd: number;
  
  // Si es miércoles (3) o después en la semana, ir al jueves siguiente
  if (dayOfWeek >= 3) { // miércoles, jueves, viernes, sábado
    daysToAdd = 7 - dayOfWeek + 4; // días hasta el próximo jueves
  } else { // domingo, lunes, martes
    daysToAdd = 4 - dayOfWeek; // días hasta este jueves
  }
  
  const nextThursday = new Date(today);
  nextThursday.setDate(today.getDate() + daysToAdd);
  
  return nextThursday;
};

const regiones = [
  'Región Metropolitana',
  'Región de Valparaíso',
  'Región del Biobío',
  'Región de La Araucanía',
  'Región de Los Lagos',
  'Región de Antofagasta',
  'Región de Atacama',
  'Región de Coquimbo',
  'Región del Maule',
  'Región de Ñuble',
  'Región de Los Ríos',
  'Región de Aysén',
  'Región de Magallanes',
  'Región de Tarapacá',
  'Región de Arica y Parinacota'
];

const comunasPorRegion: Record<string, string[]> = {
  'Región Metropolitana': [
    'Santiago', 'Providencia', 'Las Condes', 'Ñuñoa', 'Maipú', 'La Florida', 'Puente Alto',
    'San Bernardo', 'Quilicura', 'Peñalolén', 'La Pintana', 'San Miguel', 'Renca',
    'Cerro Navia', 'Conchalí', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Granja',
    'La Reina', 'Macul', 'Pedro Aguirre Cerda', 'Quinta Normal', 'Recoleta', 'San Joaquín',
    'San Ramón', 'Vitacura', 'Lo Barnechea', 'Estación Central', 'Cerrillos', 'Lo Espejo',
    'Lo Prado', 'El Bosque', 'Pudahuel', 'Melipilla', 'Talagante', 'Peñaflor', 'Curacaví',
    'María Pinto', 'San Pedro', 'Alhué', 'Colina', 'Lampa', 'Tiltil', 'Pirque', 'San José de Maipo',
    'Calera de Tango', 'Buin', 'Paine', 'Isla de Maipo', 'Padre Hurtado'
  ],
  'Región de Valparaíso': [
    'Valparaíso', 'Viña del Mar', 'Concón', 'Quilpué', 'Villa Alemana', 'Casablanca',
    'San Antonio', 'Cartagena', 'El Tabo', 'El Quisco', 'Algarrobo', 'Santo Domingo',
    'Los Andes', 'San Esteban', 'Calle Larga', 'Rinconada', 'San Felipe', 'Llaillay',
    'Panquehue', 'Catemu', 'Santa María', 'Putaendo', 'La Ligua', 'Cabildo', 'Papudo',
    'Zapallar', 'Petorca', 'Chincolco', 'Hijuelas', 'La Calera', 'Nogales', 'Limache',
    'Olmué', 'Quillota'
  ],
  'Región del Biobío': [
    'Concepción', 'Talcahuano', 'Chiguayante', 'San Pedro de la Paz', 'Hualpén', 'Penco',
    'Tomé', 'Coronel', 'Lota', 'Santa Juana', 'Hualqui', 'Florida', 'Los Ángeles',
    'Cabrero', 'Yumbel', 'Tucapel', 'Antuco', 'Quilleco', 'Santa Bárbara', 'Quilaco',
    'Mulchén', 'Negrete', 'Nacimiento', 'Laja', 'San Rosendo', 'Chillán', 'Chillán Viejo',
    'El Carmen', 'Pemuco', 'Yungay', 'Bulnes', 'Quillón', 'Ránquil', 'Portezuelo',
    'Coelemu', 'Trehuaco', 'Cobquecura', 'Quirihue', 'Ninhue', 'San Carlos', 'Ñiquén',
    'San Fabián', 'Coihueco', 'Pinto', 'San Ignacio', 'Arauco', 'Curanilahue', 'Los Álamos',
    'Lebu', 'Cañete', 'Contulmo', 'Tirúa'
  ],
  'Región de La Araucanía': [
    'Temuco', 'Padre Las Casas', 'Villarrica', 'Pucón', 'Freire', 'Pitrufquén', 'Gorbea',
    'Loncoche', 'Toltén', 'Teodoro Schmidt', 'Saavedra', 'Carahue', 'Nueva Imperial',
    'Galvarino', 'Perquenco', 'Lautaro', 'Angol', 'Renaico', 'Collipulli', 'Los Sauces',
    'Purén', 'Ercilla', 'Lumaco', 'Traiguén', 'Victoria', 'Curacautín', 'Lonquimay',
    'Melipeuco', 'Cunco', 'Curarrehue'
  ],
  'Región de Los Lagos': [
    'Puerto Montt', 'Puerto Varas', 'Osorno', 'Castro', 'Ancud', 'Quemchi', 'Dalcahue',
    'Curaco de Vélez', 'Quinchao', 'Puqueldón', 'Chonchi', 'Queilén', 'Quellón',
    'La Unión', 'Río Bueno', 'Lago Ranco', 'Futrono', 'Llifén', 'Los Lagos', 'Frutillar',
    'Fresia', 'Llanquihue', 'Maullín', 'Calbuco', 'Cochamó', 'Puelo', 'Chaitén',
    'Futaleufú', 'Hualaihué', 'Palena'
  ],
  'Región de Antofagasta': [
    'Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama', 'Tocopilla', 'María Elena'
  ],
  'Región de Atacama': [
    'Copiapó', 'Caldera', 'Tierra Amarilla', 'Vallenar', 'Alto del Carmen', 'Freirina', 'Huasco', 'Chañaral', 'Diego de Almagro'
  ],
  'Región de Coquimbo': [
    'La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paiguano', 'Vicuña', 'Ovalle',
    'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado', 'Illapel', 'Canela',
    'Los Vilos', 'Salamanca'
  ],
  'Región del Maule': [
    'Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue',
    'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue',
    'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Romeral', 'Sagrada Familia',
    'Teno', 'Vichuquén', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro',
    'San Javier', 'Villa Alegre', 'Yerbas Buenas'
  ],
  'Región de Ñuble': [
    'Chillán', 'Chillán Viejo', 'Bulnes', 'El Carmen', 'Pemuco', 'Pinto', 'Quillón',
    'Yungay', 'Cobquecura', 'Coelemu', 'Ninhue', 'Portezuelo', 'Quirihue', 'Ránquil',
    'Trehuaco', 'Coihueco', 'Ñiquén', 'San Carlos', 'San Fabián', 'San Ignacio', 'San Nicolás'
  ],
  'Región de Los Ríos': [
    'Valdivia', 'Corral', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco',
    'Panguipulli', 'La Unión', 'Futrono', 'Lago Ranco', 'Río Bueno'
  ],
  'Región de Aysén': [
    'Coyhaique', 'Lago Verde', 'Aysén', 'Cisnes', 'Guaitecas', 'Cochrane', 'O\'Higgins',
    'Tortel', 'Chile Chico', 'Río Ibáñez'
  ],
  'Región de Magallanes': [
    'Punta Arenas', 'Laguna Blanca', 'Río Verde', 'San Gregorio', 'Puerto Natales',
    'Torres del Paine', 'Porvenir', 'Primavera', 'Timaukel', 'Cabo de Hornos', 'Antártica'
  ],
  'Región de Tarapacá': [
    'Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica'
  ],
  'Región de Arica y Parinacota': [
    'Arica', 'Camarones', 'Putre', 'General Lagos'
  ]
};

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { state: cartState, clearCart } = useCart();
  const { user, updateUser } = useAuth();
  const { location: geoLocation } = useGeolocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [showLocationEditor, setShowLocationEditor] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
    email: user?.email || '',
    empresa: user?.empresa || '',
    rut: user?.rut || '',
    region: searchParams.get('region') || user?.region || geoLocation?.region || '',
    comuna: searchParams.get('comuna') || user?.comuna || (geoLocation?.comuna && geoLocation?.comuna !== 'Seleccione su comuna' ? geoLocation.comuna : '') || '',
    direccion: searchParams.get('direccion') || user?.direccion || '',
    comentarios: '',
    coordenadas: geoLocation ? { lat: geoLocation.latitude, lng: geoLocation.longitude } : undefined
  });

  // Fecha de entrega única para todo el pedido - iniciar vacía
  const [deliveryDate, setDeliveryDate] = useState<string>('');


  // Redirigir si el carrito está vacío
  useEffect(() => {
    if (cartState.items.length === 0) {
      router.push('/');
    }
  }, [cartState.items, router]);

  // Actualizar datos cuando cambie la geolocalización
  useEffect(() => {
    if (geoLocation) {
      setFormData(prev => ({
        ...prev,
        // Solo actualizar región/comuna si no están ya configuradas
        region: prev.region || geoLocation.region || '',
        comuna: prev.comuna || (geoLocation.comuna && geoLocation.comuna !== 'Seleccione su comuna' ? geoLocation.comuna : '') || '',
        coordenadas: { lat: geoLocation.latitude, lng: geoLocation.longitude }
      }));
      
      // Si tenemos coordenadas válidas, mostrar el mapa automáticamente
      if (geoLocation.latitude !== 0 && geoLocation.longitude !== 0) {
        setShowMap(true);
      }
    }
  }, [geoLocation]);


  // Nota: La geolocalización ahora se maneja a través del hook useGeolocation
  // que carga automáticamente la ubicación guardada desde localStorage

  // Inicializar mapa cuando se muestren las coordenadas
  useEffect(() => {
    if (showMap && formData.coordenadas) {
      initMap();
    }
  }, [showMap, formData.coordenadas]);

  // Calcular totales
  const subtotal = cartState.items.reduce((sum, item) => sum + item.total, 0);
  const descuentoPorcentaje = user?.porcentajeDescuento || 0;
  const descuentoMonto = subtotal * (descuentoPorcentaje / 100);
  const total = Math.round(subtotal - descuentoMonto);

  // Validar monto mínimo de Transbank
  const amountValidation = TransbankService.validateAmount(total);

  // Función para inicializar mapa interactivo
  const initMap = () => {
    if (!mapRef.current || !formData.coordenadas) return;

    const { lat, lng } = formData.coordenadas;
    const mapContainer = mapRef.current;
    
    // Limpiar container
    mapContainer.innerHTML = '';
    
    // Crear iframe con OpenStreetMap
    const mapFrame = document.createElement('iframe');
    mapFrame.style.width = '100%';
    mapFrame.style.height = '300px';
    mapFrame.style.border = 'none';
    mapFrame.style.borderRadius = '8px';
    mapFrame.loading = 'lazy';
    
    // URL con marcador personalizado usando OpenStreetMap
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01}%2C${lat-0.01}%2C${lng+0.01}%2C${lat+0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
    mapFrame.src = mapUrl;
    
    // Crear container con controles
    const mapWrapper = document.createElement('div');
    mapWrapper.className = 'relative w-full';
    
    mapWrapper.appendChild(mapFrame);
    
    // Añadir botones de control
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'flex justify-between items-center mt-3 gap-2';
    
    // Botón para ver en Google Maps
    const googleMapsBtn = document.createElement('button');
    googleMapsBtn.className = 'flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors';
    googleMapsBtn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
      </svg>
      Ver en Google Maps
    `;
    googleMapsBtn.onclick = () => {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };
    
    // Botón para ajustar ubicación
    const adjustBtn = document.createElement('button');
    adjustBtn.className = 'flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-lg text-sm transition-colors';
    adjustBtn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
      </svg>
      Ajustar Ubicación
    `;
    adjustBtn.onclick = () => {
      setShowLocationEditor(true);
    };
    
    controlsDiv.appendChild(googleMapsBtn);
    controlsDiv.appendChild(adjustBtn);
    
    mapWrapper.appendChild(controlsDiv);
    
    // Instrucciones de uso
    const instructions = document.createElement('div');
    instructions.className = 'text-xs text-gray-600 bg-blue-50 p-3 rounded-lg mt-2 border border-blue-200';
    instructions.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span><strong>Nota:</strong> Si la ubicación no es exacta, usa el botón "Ajustar Ubicación" para corregir las coordenadas manualmente.</span>
      </div>
    `;
    
    mapWrapper.appendChild(instructions);
    mapContainer.appendChild(mapWrapper);
  };

  // Función para ajustar ubicación con incrementos pequeños
  const adjustLocation = (deltaLng: number, deltaLat: number) => {
    if (!formData.coordenadas) return;
    
    setFormData(prev => ({
      ...prev,
      coordenadas: {
        lat: prev.coordenadas!.lat + deltaLat,
        lng: prev.coordenadas!.lng + deltaLng
      }
    }));
  };

  // Función para actualizar coordenadas manualmente
  const handleLocationSelect = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            coordenadas: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
          setShowMap(true);
        },
        (error) => {
          alert('No se pudo obtener la ubicación: ' + error.message);
        }
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Si cambia la región, resetear la comuna
      if (name === 'region') {
        return { ...prev, [name]: value, comuna: '' };
      }
      return { ...prev, [name]: value };
    });
  };

  // Obtener comunas disponibles según la región seleccionada
  const comunasDisponibles = formData.region ? comunasPorRegion[formData.region] || [] : [];


  const validateForm = (): boolean => {
    const required = ['nombre', 'telefono', 'email', 'empresa', 'region', 'comuna', 'direccion'];
    
    for (const field of required) {
      if (!formData[field as keyof CheckoutFormData].trim()) {
        const fieldNames: { [key: string]: string } = {
          'nombre': 'Nombre',
          'telefono': 'Teléfono',
          'email': 'Email',
          'empresa': 'Empresa',
          'region': 'Región',
          'comuna': 'Comuna',
          'direccion': 'Dirección'
        };
        setError(`El campo ${fieldNames[field] || field} es obligatorio`);
        return false;
      }
    }

    if (!formData.email.includes('@')) {
      setError('Email inválido');
      return false;
    }

    // Validar que sea Región Metropolitana (código 13)
    if (formData.region !== '13') {
      setError('Solo realizamos despachos empresariales en la Región Metropolitana de Santiago');
      return false;
    }

    // Validar fecha de entrega única
    if (!deliveryDate) {
      setError('Debe seleccionar una fecha de entrega');
      return false;
    }

    // Validar que la fecha sea un jueves válido
    const selectedDate = new Date(deliveryDate);
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek !== 4) { // 4 = jueves
      setError('La fecha de entrega debe ser un día jueves');
      return false;
    }

    // Validar que la fecha no sea anterior al próximo jueves disponible
    const minDate = getNextDeliveryThursday();
    if (selectedDate < minDate) {
      setError('La fecha de entrega debe ser al menos el próximo jueves disponible');
      return false;
    }

    return true;
  };

  const handlePayment = async () => {
    console.log('🚀 Iniciando proceso de pago...');
    setError('');
    
    console.log('📝 Validando formulario...');
    if (!validateForm()) {
      console.log('❌ Formulario inválido');
      return;
    }
    console.log('✅ Formulario válido');

    // Actualizar datos del usuario si está logueado
    if (user) {
      console.log('💾 Actualizando datos del usuario...');
      updateUser({
        nombre: formData.nombre,
        telefono: formData.telefono,
        empresa: formData.empresa,
        rut: formData.rut,
        region: formData.region,
        comuna: formData.comuna,
        direccion: formData.direccion
      });
      console.log('✅ Datos del usuario actualizados');
    }
    
    console.log('📦 Fecha de entrega seleccionada:', deliveryDate);
    
    console.log('💰 Validando monto:', { total, valid: amountValidation.valid, error: amountValidation.error });
    if (!amountValidation.valid) {
      console.log('❌ Monto inválido:', amountValidation.error);
      setError(amountValidation.error!);
      return;
    }
    console.log('✅ Monto válido');

    console.log('⏳ Iniciando procesamiento...');
    setIsProcessing(true);

    try {
      // Crear sesión única para la transacción
      const sessionId = `polimax_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔑 Session ID creado:', sessionId);

      // Actualizar items del carrito con la fecha de entrega única
      const updatedCartItems = cartState.items.map(item => ({
        ...item,
        fechaDespacho: deliveryDate
      }));

      // Preparar datos para la API
      const paymentData = {
        amount: total,
        cartItems: updatedCartItems,
        deliveryDate: deliveryDate,
        customerData: {
          userId: user?.id || null,
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email,
          empresa: formData.empresa,
          rut: formData.rut,
          region: formData.region,
          comuna: formData.comuna,
          direccion: formData.direccion,
          comentarios: formData.comentarios
        },
        sessionId
      };

      console.log('📤 Enviando datos a la API:', paymentData);

      // Crear transacción con Transbank
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      });

      console.log('📥 Respuesta de la API:', response.status, response.statusText);
      const result = await response.json();
      console.log('📄 Resultado:', result);

      if (response.ok && result.success) {
        // Limpiar carrito antes de redirigir
        clearCart();
        
        // Redirigir a Webpay Plus
        window.location.href = `${result.url}?token_ws=${result.token}`;
      } else {
        setError(result.error || 'Error al procesar el pago');
        setIsProcessing(false);
      }

    } catch (error) {
      console.error('Error en checkout:', error);
      setError('Error de conexión. Intenta nuevamente.');
      setIsProcessing(false);
    }
  };

  if (cartState.items.length === 0) {
    return null; // El useEffect ya manejará la redirección
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header for Checkout */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          {/* Mobile layout - justified */}
          <div className="flex items-center justify-between md:hidden">
            <div className="flex items-center">
              <Link href="/" className="flex flex-col items-center">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-500 to-orange-500 tracking-tight leading-none drop-shadow-lg select-none font-poppins" style={{fontWeight: 900}}>
                  OBRAEXPRESS
                </h1>
                <div className="text-gray-600 font-semibold text-xs tracking-[0.2em] uppercase border-t border-gray-200 pt-1 mt-1 font-poppins" style={{fontWeight: 600}}>
                  Materiales de construcción
                </div>
              </Link>
              <div className="ml-8 text-sm text-gray-600">
                Datos de Entrega
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Proceso de Pago Seguro
            </div>
          </div>

          {/* Desktop layout - centered */}
          <div className="hidden md:flex items-center justify-center">
            <div className="flex items-center space-x-16">
              <div className="flex items-center">
                <Link href="/" className="flex flex-col items-center">
                  <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-yellow-500 to-orange-500 tracking-tight leading-none drop-shadow-lg select-none font-poppins" style={{fontWeight: 900}}>
                    OBRAEXPRESS
                  </h1>
                  <div className="text-gray-600 font-semibold text-xs tracking-[0.25em] uppercase border-t border-gray-200 pt-2 mt-1 font-poppins" style={{fontWeight: 600}}>
                    Materiales de construcción
                  </div>
                </Link>
                <div className="ml-8 text-sm text-gray-600">
                  Datos de Entrega
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Proceso de Pago Seguro
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Finalizar Compra
            </h1>
            
            {/* Opciones de navegación */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <Link 
                href="/" 
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Volver al Inicio
              </Link>
              
              <div className="h-4 w-px bg-gray-300"></div>
              
              <Link 
                href="/productos"
                className="flex items-center text-amber-600 hover:text-amber-800 transition-colors"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 21h6" />
                </svg>
                Ver Productos
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* COLUMNA IZQUIERDA: Datos de Entrega + Ubicación */}
            <div className="space-y-6">
              
              {/* Banner Informativo Despacho Empresarial */}
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      <strong>Importante:</strong> Solo realizamos despachos empresariales en la Región Metropolitana de Santiago.
                      Es obligatorio proporcionar la razón social de la empresa.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Formulario de Datos de Entrega */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Datos de Entrega
                </h2>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    {error}
                  </div>
                )}

                {/* Banner informativo de datos pre-completados */}
                {(formData.nombre || formData.telefono || formData.email || formData.region || formData.comuna || formData.direccion || geoLocation) && (
                  <div className="space-y-3 mb-6">
                    {/* Banner de datos del usuario */}
                    {(formData.nombre || formData.telefono || formData.email || formData.direccion) && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div>
                            <h4 className="font-medium text-green-900 mb-1">Datos guardados</h4>
                            <p className="text-sm text-green-800">
                              Hemos completado algunos campos con tu información guardada. 
                              Puedes modificar cualquier dato si es necesario.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Banner de geolocalización */}
                    {geoLocation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <div>
                            <h4 className="font-medium text-blue-900 mb-1">📍 Ubicación detectada</h4>
                            <p className="text-sm text-blue-800">
                              Hemos detectado tu ubicación: <strong>{geoLocation.region}</strong>
                              {geoLocation.comuna && geoLocation.comuna !== 'Seleccione su comuna' && (
                                <span>, {geoLocation.comuna}</span>
                              )}
                              . Las coordenadas se incluirán automáticamente para una entrega más precisa.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Completo *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                            formData.nombre ? 'border-green-300 bg-green-50 pr-10' : 'border-gray-300'
                          }`}
                          placeholder="Tu nombre completo"
                          required
                        />
                        {formData.nombre && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono *
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                            formData.telefono ? 'border-green-300 bg-green-50 pr-10' : 'border-gray-300'
                          }`}
                          placeholder="+56 9 1234 5678"
                          required
                        />
                        {formData.telefono && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                          formData.email ? 'border-green-300 bg-green-50 pr-10' : 'border-gray-300'
                        }`}
                        placeholder="tu@email.com"
                        required
                      />
                      {formData.email && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Datos de Empresa (Obligatorios) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Empresa <span className="text-red-500">*</span>
                        <span className="text-xs text-gray-500 ml-1">(Solo despachos empresariales)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="empresa"
                          value={formData.empresa}
                          onChange={handleInputChange}
                          required
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                            formData.empresa ? 'border-green-300 bg-green-50 pr-10' : 'border-gray-300'
                          }`}
                          placeholder="Razón social de la empresa"
                        />
                        {formData.empresa && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RUT Empresa (Opcional)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="rut"
                          value={formData.rut}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                            formData.rut ? 'border-green-300 bg-green-50 pr-10' : 'border-gray-300'
                          }`}
                          placeholder="12345678-9"
                        />
                        {formData.rut && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Región *
                      </label>
                      <div className="relative">
                        <select
                          name="region"
                          value={formData.region}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 appearance-none ${
                            formData.region ? 'border-green-300 bg-green-50 pr-10' : 'border-gray-300'
                          }`}
                          required
                        >
                        <option value="">Seleccionar región</option>
                        {regiones.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          {formData.region ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comuna *
                      </label>
                      <div className="relative">
                        <select
                          name="comuna"
                          value={formData.comuna}
                          onChange={handleInputChange}
                          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 appearance-none ${
                            formData.comuna ? 'border-green-300 bg-green-50 pr-10' : 'border-gray-300'
                          }`}
                          required
                          disabled={!formData.region}
                        >
                        <option value="">
                          {formData.region ? 'Seleccionar comuna' : 'Primero selecciona una región'}
                        </option>
                        {comunasDisponibles.map(comuna => (
                          <option key={comuna} value={comuna}>{comuna}</option>
                        ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          {formData.comuna ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección Completa *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleInputChange}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
                          formData.direccion ? 'border-green-300 bg-green-50 pr-10' : 'border-gray-300'
                        }`}
                        placeholder="Ej: Av. Las Condes 12345, Depto 304, Torre A"
                        required
                      />
                      {formData.direccion && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comentarios Adicionales
                    </label>
                    <textarea
                      name="comentarios"
                      value={formData.comentarios}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Instrucciones especiales de entrega, horarios preferidos, etc."
                    />
                  </div>
                </div>
              </div>

              {/* Mapa de Ubicación */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Ubicación Exacta
                </h2>
                
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600">
                    {formData.coordenadas 
                      ? 'Ubicación detectada automáticamente. Puedes actualizarla si es necesario.'
                      : 'Confirma o ajusta la ubicación exacta para la entrega'
                    }
                  </p>
                  <button
                    onClick={handleLocationSelect}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {formData.coordenadas ? 'Actualizar Ubicación' : 'Obtener Ubicación'}
                  </button>
                </div>

                {formData.coordenadas ? (
                  <div>
                    <div ref={mapRef} className="mb-4"></div>
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                      <strong>Coordenadas:</strong> {formData.coordenadas.lat.toFixed(6)}, {formData.coordenadas.lng.toFixed(6)}
                    </div>
                  </div>
                ) : (
                  <div className="h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      <p className="text-gray-600">Haz clic en "Obtener Ubicación" para mostrar el mapa</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Fecha de Entrega Única - Solo mostrar si no hay fecha */}
              {!deliveryDate && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Seleccionar Fecha de Entrega
                </h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">📅 Entregas solo los jueves</h4>
                      <p className="text-sm text-blue-800">
                        Los despachos se realizan únicamente los días jueves. Si hoy es miércoles o posterior, 
                        la entrega será el próximo jueves disponible.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de entrega para todo el pedido *
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    min={getNextDeliveryThursday().toISOString().split('T')[0]}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Próximo jueves disponible: {getNextDeliveryThursday().toLocaleDateString('es-CL', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
              )}
            </div>

            {/* COLUMNA DERECHA: Resumen de Compra */}
            <div>
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Resumen de Compra
                </h2>

                {/* Items del Carrito */}
                <div className="space-y-3 mb-6">
                  {cartState.items.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      {item.imagen && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <CartThumbnail
                            src={item.imagen}
                            alt={item.nombre}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm leading-tight">{item.nombre}</h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.cantidad} × {TransbankService.formatChileanAmount(item.precioUnitario)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          {TransbankService.formatChileanAmount(item.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fecha de Entrega en el Resumen */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Fecha de entrega:</p>
                      <p className="text-sm text-blue-800">
                        📅 {deliveryDate ? new Date(deliveryDate).toLocaleDateString('es-CL', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'No seleccionada'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Totales */}
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal:</span>
                    <span>{TransbankService.formatChileanAmount(subtotal)}</span>
                  </div>
                  
                  {user?.tieneDescuento && descuentoPorcentaje > 0 && (
                    <div className="flex justify-between text-green-600 text-sm">
                      <span>Descuento ({descuentoPorcentaje}%):</span>
                      <span>-{TransbankService.formatChileanAmount(descuentoMonto)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Envío:</span>
                    <span className="text-green-600 font-medium">Gratis</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">{TransbankService.formatChileanAmount(total)}</span>
                  </div>
                </div>

                {/* Información de Pago */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span className="font-medium text-blue-900 text-sm">Pago Seguro con Transbank</span>
                  </div>
                  <p className="text-xs text-blue-800">
                    Tarjetas de débito y crédito protegidas con SSL.
                  </p>
                </div>

                {/* Validación de Monto */}
                {!amountValidation.valid && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      ⚠️ {amountValidation.error}
                    </p>
                  </div>
                )}

                {/* Botón de Pago */}
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !amountValidation.valid}
                  className={`w-full mt-6 py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                    isProcessing || !amountValidation.valid
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Pagar {TransbankService.formatChileanAmount(total)}
                    </div>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Serás redirigido a Webpay Plus de forma segura.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para editar ubicación */}
      {showLocationEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">📍 Ajustar Ubicación</h3>
                <button
                  onClick={() => setShowLocationEditor(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Si el marcador no está en la ubicación exacta de tu dirección, puedes ajustarlo para una entrega más precisa.
              </p>

              <div className="space-y-4">
                {/* Vista previa del mapa actual */}
                {formData.coordenadas && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">📍 Ubicación actual:</h4>
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${formData.coordenadas.lng-0.005}%2C${formData.coordenadas.lat-0.005}%2C${formData.coordenadas.lng+0.005}%2C${formData.coordenadas.lat+0.005}&layer=mapnik&marker=${formData.coordenadas.lat}%2C${formData.coordenadas.lng}`}
                      style={{ width: '100%', height: '200px', border: 'none', borderRadius: '6px' }}
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Controles de ajuste fino */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">🎯 Ajustar posición del marcador</h4>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div></div>
                    <button type="button" className="bg-white hover:bg-blue-50 border border-gray-300 rounded px-3 py-2 text-sm transition-colors" onClick={() => adjustLocation(0, 0.0001)}>⬆️ Norte</button>
                    <div></div>
                    <button type="button" className="bg-white hover:bg-blue-50 border border-gray-300 rounded px-3 py-2 text-sm transition-colors" onClick={() => adjustLocation(-0.0001, 0)}>⬅️ Oeste</button>
                    <button type="button" className="bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded px-3 py-2 text-sm transition-colors font-medium">🎯 Actual</button>
                    <button type="button" className="bg-white hover:bg-blue-50 border border-gray-300 rounded px-3 py-2 text-sm transition-colors" onClick={() => adjustLocation(0.0001, 0)}>➡️ Este</button>
                    <div></div>
                    <button type="button" className="bg-white hover:bg-blue-50 border border-gray-300 rounded px-3 py-2 text-sm transition-colors" onClick={() => adjustLocation(0, -0.0001)}>⬇️ Sur</button>
                    <div></div>
                  </div>
                  <p className="text-xs text-blue-700">Cada clic mueve el marcador aproximadamente 10 metros</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setFormData(prev => ({
                              ...prev,
                              coordenadas: {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                              }
                            }));
                          },
                          (error) => {
                            alert('No se pudo obtener la ubicación: ' + error.message);
                          }
                        );
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    🎯 Detectar Automáticamente
                  </button>
                  
                  <button
                    onClick={() => {
                      if (formData.coordenadas) {
                        window.open(`https://www.google.com/maps?q=${formData.coordenadas.lat},${formData.coordenadas.lng}`, '_blank');
                      }
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    📍 Ver en Maps
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowLocationEditor(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowLocationEditor(false);
                    // Reinicializar el mapa con las nuevas coordenadas
                    if (formData.coordenadas) {
                      setShowMap(true);
                      setTimeout(() => initMap(), 100);
                    }
                  }}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}