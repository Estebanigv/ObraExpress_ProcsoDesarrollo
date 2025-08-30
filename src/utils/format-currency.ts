/**
 * Formatea un número como moneda CLP sin usar toLocaleString
 * para evitar problemas de hidratación en Next.js
 */
export function formatCurrency(value: number): string {
  // Redondear a entero
  const rounded = Math.round(value);
  
  // Convertir a string y agregar separadores de miles
  const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return formatted;
}

/**
 * Formatea un número con decimales
 */
export function formatNumber(value: number, decimals: number = 0): string {
  const rounded = decimals > 0 
    ? value.toFixed(decimals)
    : Math.round(value).toString();
    
  // Agregar separadores de miles antes del punto decimal
  const parts = rounded.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return parts.join(',');
}