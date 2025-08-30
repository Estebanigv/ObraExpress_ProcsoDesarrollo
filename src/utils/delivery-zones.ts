import { regionesComunas, type Comuna, type Region } from '@/data/regiones-comunas';

// Configuración de despachos - Solo empresas en Región Metropolitana
export const DELIVERY_CONFIG = {
  // Solo despachos empresariales
  businessOnly: true,
  // Solo despachos en Región Metropolitana
  nationalDelivery: false,
  // Solo Santiago
  availableRegions: ['13'], // Código de Región Metropolitana
  mainCity: 'Santiago',
  mainRegion: 'Región Metropolitana de Santiago',
  deliveryType: 'Despacho Empresarial'
} as const;

// Obtener solo las comunas de Santiago disponibles para despacho
export function getAvailableDeliveryZones(): Comuna[] {
  const rmRegion = regionesComunas.find(region => region.codigo === '13');
  
  if (!rmRegion) {
    console.warn('No se encontró la Región Metropolitana en los datos');
    return [];
  }
  
  return rmRegion.comunas;
}

// Obtener la región de Santiago
export function getSantiagoRegion(): Region | null {
  return regionesComunas.find(region => region.codigo === '13') || null;
}

// Validar si una comuna está en zona de despacho
export function isDeliveryAvailable(codigoComuna: string): boolean {
  const availableZones = getAvailableDeliveryZones();
  return availableZones.some(comuna => comuna.codigo === codigoComuna);
}

// Obtener mensaje de disponibilidad de despacho
export function getDeliveryMessage(): string {
  if (DELIVERY_CONFIG.nationalDelivery && !DELIVERY_CONFIG.businessOnly) {
    return "Despachamos a todo Chile";
  }
  if (DELIVERY_CONFIG.businessOnly) {
    return `Despacho exclusivo para empresas en ${DELIVERY_CONFIG.mainRegion}`;
  }
  return `Por ahora solo despachamos en ${DELIVERY_CONFIG.mainRegion}`;
}

// Obtener información de despacho para mostrar en UI
export function getDeliveryInfo() {
  return {
    isNational: DELIVERY_CONFIG.nationalDelivery,
    availableRegions: DELIVERY_CONFIG.availableRegions,
    mainCity: DELIVERY_CONFIG.mainCity,
    mainRegion: DELIVERY_CONFIG.mainRegion,
    zones: getAvailableDeliveryZones(),
    message: getDeliveryMessage()
  };
}

// Función para futuro: habilitar despacho nacional
export function enableNationalDelivery() {
  // Esta función se usará cuando se implemente despacho nacional
  console.log('🚀 Función preparada para habilitar despacho nacional');
  // En el futuro se cambiará DELIVERY_CONFIG.nationalDelivery = true
}

// Obtener comunas ordenadas alfabéticamente para selectores
export function getOrderedDeliveryZones(): Comuna[] {
  const zones = getAvailableDeliveryZones();
  return zones.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

// Formatear nombre de comuna para mostrar
export function formatComunaName(comuna: Comuna): string {
  return comuna.nombre;
}

// Obtener código de región para una comuna (útil para futuras expansiones)
export function getRegionCodeForComuna(codigoComuna: string): string | null {
  for (const region of regionesComunas) {
    if (region.comunas.some(comuna => comuna.codigo === codigoComuna)) {
      return region.codigo;
    }
  }
  return null;
}