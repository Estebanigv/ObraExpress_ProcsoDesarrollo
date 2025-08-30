interface TechnicalSpec {
  label: string;
  value: string;
  icon?: string;
}

interface ProductSpecification {
  name: string;
  type: string;
  specifications: TechnicalSpec[];
  applications: string[];
  advantages: string[];
}

export function getProductSpecifications(product: any): ProductSpecification {
  const baseSpecs: TechnicalSpec[] = [
    { label: "Espesor", value: extractEspesor(product.id), icon: "📏" },
    { label: "Protección UV", value: "10 años garantizada", icon: "☀️" },
    { label: "Garantía", value: getGarantia(product.id), icon: "🛡️" },
    { label: "Stock", value: "Disponible", icon: "📦" }
  ];

  // Especificaciones específicas según el tipo
  const specificSpecs = getSpecificSpecifications(product.id);
  
  return {
    name: product.nombre,
    type: getProductTypeDescription(product.id),
    specifications: [...baseSpecs, ...specificSpecs],
    applications: getApplications(product.id),
    advantages: getAdvantages(product.id)
  };
}

function extractEspesor(productId: string): string {
  const match = productId.match(/(\d+\.?\d*)mm/);
  return match ? `${match[1]}mm` : "Variable";
}

function getGarantia(productId: string): string {
  if (productId.includes('termoacustico')) return "12 años";
  if (productId.includes('antivandalico')) return "15 años";
  return "10 años";
}

function getProductTypeDescription(productId: string): string {
  if (productId.includes('ondulado')) return "Policarbonato Ondulado";
  if (productId.includes('alveolar')) return "Policarbonato Alveolar";
  if (productId.includes('compacto')) return "Policarbonato Compacto";
  if (productId.includes('termoacustico')) return "Policarbonato Termoacústico";
  if (productId.includes('antivandalico')) return "Policarbonato Antivandálico";
  return "Policarbonato";
}

function getSpecificSpecifications(productId: string): TechnicalSpec[] {
  if (productId.includes('ondulado')) {
    return [
      { label: "Tipo de onda", value: "Perfil ondulado estándar", icon: "🌊" },
      { label: "Resistencia impacto", value: "200x superior al vidrio", icon: "💪" },
      { label: "Transmisión luz", value: "85-90%", icon: "💡" },
      { label: "Peso", value: "1.2 kg/m²", icon: "⚖️" }
    ];
  }
  
  if (productId.includes('alveolar')) {
    const espesor = extractEspesor(productId);
    return [
      { label: "Estructura", value: "Cámara alveolar múltiple", icon: "🏗️" },
      { label: "Aislamiento térmico", value: getAislamiento(espesor), icon: "🌡️" },
      { label: "Resistencia impacto", value: "250x superior al vidrio", icon: "💪" },
      { label: "Transmisión luz", value: "80-85%", icon: "💡" }
    ];
  }
  
  if (productId.includes('compacto')) {
    return [
      { label: "Estructura", value: "Lámina compacta sólida", icon: "💎" },
      { label: "Resistencia impacto", value: "250x superior al vidrio", icon: "💪" },
      { label: "Transmisión luz", value: "90%", icon: "💡" },
      { label: "Flexibilidad", value: "Curvado en frío posible", icon: "🔄" }
    ];
  }
  
  if (productId.includes('termoacustico')) {
    return [
      { label: "Aislamiento acústico", value: "Reducción 32dB", icon: "🔇" },
      { label: "Aislamiento térmico", value: "R-value 2.8", icon: "🌡️" },
      { label: "Resistencia impacto", value: "250x superior al vidrio", icon: "💪" },
      { label: "Transmisión luz", value: "75-85%", icon: "💡" }
    ];
  }
  
  if (productId.includes('antivandalico')) {
    return [
      { label: "Nivel seguridad", value: "Grado P4A según EN 356", icon: "🛡️" },
      { label: "Resistencia balas", value: "Nivel BR1 según EN 1063", icon: "🎯" },
      { label: "Resistencia impacto", value: "500x superior al vidrio", icon: "💪" },
      { label: "Transmisión luz", value: "60-90%", icon: "💡" }
    ];
  }
  
  return [];
}

function getAislamiento(espesor: string): string {
  switch (espesor) {
    case "4.0mm": return "R-value 1.4";
    case "6.0mm": return "R-value 1.8";
    case "8.0mm": return "R-value 2.2";
    case "10.0mm": return "R-value 2.6";
    default: return "Variable según espesor";
  }
}

function getApplications(productId: string): string[] {
  if (productId.includes('ondulado')) {
    return [
      "techos residenciales",
      "cubiertas de piscinas",
      "invernaderos",
      "marquesinas",
      "tragaluces",
      "pérgolas",
      "terrazas",
      "patios"
    ];
  }
  
  if (productId.includes('alveolar')) {
    return [
      "techos industriales",
      "cerramientos laterales",
      "invernaderos profesionales",
      "centros deportivos",
      "centros comerciales",
      "estaciones de transporte",
      "fachadas ventiladas",
      "cubiertas translúcidas"
    ];
  }
  
  if (productId.includes('compacto')) {
    return [
      "ventanas de seguridad",
      "barreras protectoras",
      "divisiones arquitectónicas",
      "señalización exterior",
      "mobiliario urbano",
      "elementos decorativos",
      "mamparas",
      "cerramientos premium"
    ];
  }
  
  if (productId.includes('termoacustico')) {
    return [
      "oficinas corporativas",
      "estudios de grabación",
      "salas de reuniones",
      "hospitales",
      "escuelas",
      "bibliotecas",
      "centros de llamadas",
      "espacios de trabajo silenciosos"
    ];
  }
  
  if (productId.includes('antivandalico')) {
    return [
      "colegios públicos",
      "bancos y entidades financieras",
      "centros comerciales",
      "estaciones de servicio",
      "hospitales",
      "edificios gubernamentales",
      "instalaciones deportivas",
      "transporte público"
    ];
  }
  
  return ["aplicaciones generales"];
}

function getAdvantages(productId: string): string[] {
  const baseAdvantages = [
    "resistente a impactos",
    "protección UV incorporada",
    "fácil instalación",
    "mantenimiento mínimo",
    "reciclable 100%"
  ];
  
  if (productId.includes('ondulado')) {
    return [
      ...baseAdvantages,
      "diseño estético ondulado",
      "excelente drenaje de agua",
      "peso ligero"
    ];
  }
  
  if (productId.includes('alveolar')) {
    return [
      ...baseAdvantages,
      "excelente aislamiento térmico",
      "estructura resistente y liviana",
      "versatilidad de aplicaciones"
    ];
  }
  
  if (productId.includes('compacto')) {
    return [
      ...baseAdvantages,
      "máxima transparencia óptica",
      "curvado en frío posible",
      "resistencia superior"
    ];
  }
  
  if (productId.includes('termoacustico')) {
    return [
      ...baseAdvantages,
      "aislamiento acústico superior",
      "control térmico avanzado",
      "confort ambiental mejorado"
    ];
  }
  
  if (productId.includes('antivandalico')) {
    return [
      ...baseAdvantages,
      "seguridad máxima",
      "resistencia a vandalismo",
      "protección balística básica",
      "tranquilidad garantizada"
    ];
  }
  
  return baseAdvantages;
}