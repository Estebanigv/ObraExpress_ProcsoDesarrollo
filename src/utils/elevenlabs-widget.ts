// Función de llamada telefónica directa

export const openElevenLabsWidget = () => {
  try {
    console.log('📞 Iniciando llamada telefónica...');
    
    // Llamada telefónica directa
    const link = document.createElement('a');
    link.href = 'tel:+56963348909';
    link.click();
    
    console.log('✅ Llamada iniciada');
    
  } catch (error) {
    console.error('❌ Error iniciando llamada:', error);
  }
};

// Funciones de compatibilidad (solo para llamada telefónica)
export const isElevenLabsWidgetAvailable = (): boolean => true;
export const isElevenLabsWidgetOpen = (): boolean => false;
export const closeElevenLabsWidget = () => {};