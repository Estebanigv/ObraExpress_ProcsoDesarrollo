// Utilidades para calcular fechas de despacho por tipo de producto

// Definir tipos de productos y sus reglas de despacho
export interface ProductDispatchRule {
  category: string;
  availableDays: number[]; // 0=Domingo, 1=Lunes, ..., 6=Sábado
  timeRange: {
    start: number; // Hora de inicio (24h format)
    end: number;   // Hora de fin (24h format)
  };
  cutoffHour?: number; // Hora límite para despacho mismo día (solo aplicable si hoy es día disponible)
  description: string;
}

export const DISPATCH_RULES: ProductDispatchRule[] = [
  {
    category: 'policarbonato',
    availableDays: [4], // Solo jueves
    timeRange: { start: 9, end: 18 },
    cutoffHour: 18,
    description: 'Solo jueves de 9:00 a 18:00 hrs'
  },
  {
    category: 'accesorio',
    availableDays: [1, 2, 3, 4, 5], // Lunes a viernes
    timeRange: { start: 9, end: 18 },
    cutoffHour: 16,
    description: 'Lunes a viernes de 9:00 a 18:00 hrs'
  },
  {
    category: 'rollo',
    availableDays: [1, 2, 3, 4, 5], // Lunes a viernes
    timeRange: { start: 9, end: 18 },
    cutoffHour: 16,
    description: 'Lunes a viernes de 9:00 a 18:00 hrs'
  },
  {
    category: 'perfil',
    availableDays: [1, 2, 3, 4, 5], // Lunes a viernes
    timeRange: { start: 9, end: 18 },
    cutoffHour: 16,
    description: 'Lunes a viernes de 9:00 a 18:00 hrs'
  },
  {
    category: 'pintura',
    availableDays: [1, 2, 3, 4, 5], // Lunes a viernes
    timeRange: { start: 9, end: 17 },
    cutoffHour: 15,
    description: 'Lunes a viernes de 9:00 a 17:00 hrs'
  },
  {
    category: 'sellador',
    availableDays: [1, 2, 3, 4, 5], // Lunes a viernes
    timeRange: { start: 9, end: 17 },
    cutoffHour: 15,
    description: 'Lunes a viernes de 9:00 a 17:00 hrs'
  },
  {
    category: 'herramienta',
    availableDays: [1, 2, 3, 4, 5], // Lunes a viernes
    timeRange: { start: 9, end: 18 },
    cutoffHour: 16,
    description: 'Lunes a viernes de 9:00 a 18:00 hrs'
  }
];

export function getDispatchRuleForProduct(productType: string): ProductDispatchRule {
  const normalizedType = productType.toLowerCase();
  
  // Buscar regla específica
  const rule = DISPATCH_RULES.find(rule => 
    normalizedType.includes(rule.category)
  );
  
  // Si no se encuentra regla específica, usar la de policarbonato como default
  return rule || DISPATCH_RULES[0];
}

export function getNextDispatchDate(productType: string = 'policarbonato'): Date {
  const rule = getDispatchRuleForProduct(productType);
  const today = new Date();
  const currentDay = today.getDay();
  const currentHour = today.getHours();
  
  let daysToAdd = 0;
  let found = false;
  
  // Para policarbonato específicamente, aplicar regla especial
  if (productType.toLowerCase().includes('policarbonato')) {
    // Si es miércoles, pasa al jueves siguiente (no al de esta semana)
    if (currentDay === 3) {
      daysToAdd = 8; // Saltar al jueves de la siguiente semana
      const nextDispatchDate = new Date(today);
      nextDispatchDate.setDate(today.getDate() + daysToAdd);
      return nextDispatchDate;
    }
    
    // Si es jueves, pasa al jueves de la próxima semana
    if (currentDay === 4) {
      daysToAdd = 7; // Jueves de la próxima semana
      const nextDispatchDate = new Date(today);
      nextDispatchDate.setDate(today.getDate() + daysToAdd);
      return nextDispatchDate;
    }
    
    // Para cualquier otro día, buscar el próximo jueves
    for (let i = 1; i <= 14; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const checkDay = checkDate.getDay();
      
      if (checkDay === 4) { // Jueves
        daysToAdd = i;
        found = true;
        break;
      }
    }
  } else {
    // Para otros productos, usar la lógica normal
    // Primero verificar si hoy es día disponible y aún no ha pasado la hora límite
    if (rule.availableDays.includes(currentDay) && 
        rule.cutoffHour && 
        currentHour < rule.cutoffHour) {
      return today; // Despacho hoy mismo
    }
    
    // Buscar el próximo día disponible
    for (let i = 1; i <= 14; i++) { // Buscar hasta 2 semanas adelante
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const checkDay = checkDate.getDay();
      
      if (rule.availableDays.includes(checkDay)) {
        daysToAdd = i;
        found = true;
        break;
      }
    }
  }
  
  const nextDispatchDate = new Date(today);
  nextDispatchDate.setDate(today.getDate() + daysToAdd);
  
  return nextDispatchDate;
}

export function formatDispatchDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'short'
  };
  
  const formattedDate = date.toLocaleDateString('es-CL', options);
  // Capitalizar la primera letra (Jueves en vez de jueves)
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  return `Despacho más próximo: ${capitalizedDate}`;
}

export function getDispatchTimeInfo(productType: string = 'policarbonato'): string {
  const rule = getDispatchRuleForProduct(productType);
  return `${rule.timeRange.start}:00 - ${rule.timeRange.end}:00 hrs`;
}

export function getDispatchMessage(productType: string = 'policarbonato'): string {
  const nextDate = getNextDispatchDate(productType);
  const formattedDate = formatDispatchDate(nextDate);
  const timeInfo = getDispatchTimeInfo(productType);
  
  return `Próximo: ${formattedDate}, ${timeInfo}`;
}

export function getDispatchDescription(productType: string = 'policarbonato'): string {
  const rule = getDispatchRuleForProduct(productType);
  return rule.description;
}

export function isWednesdayRule(): boolean {
  const today = new Date();
  return today.getDay() === 3; // Es miércoles
}

export function getDaysUntilNextDispatch(): number {
  const today = new Date();
  const nextDispatch = getNextDispatchDate();
  const diffTime = nextDispatch.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}