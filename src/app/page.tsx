"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { NavbarSimple } from "@/components/navbar-simple";
import { navigate } from "@/lib/client-utils";
import { ProductImage } from "@/components/optimized-image";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { getDispatchMessage, formatDispatchDate, getNextDispatchDate } from "@/utils/dispatch-dates";
import { TypewriterText } from "@/components/typewriter-text";

// Lazy loading optimizado - sin loading para componentes no críticos
// const Chatbot = dynamic(() => import("@/components/chatbot").then(mod => ({ default: mod.Chatbot })), {
//   ssr: false
// });

const AvatarGroup = dynamic(() => import("@/components/ui/avatar-group"), {
  ssr: false
});

const DispatchSection = dynamic(() => import("@/components/dispatch-section"), {
  ssr: false
});

const CatalogoDownloadModal = dynamic(() => import("@/components/catalogo-download-modal"), {
  ssr: false
});

const DispatchCalendarModal = dynamic(() => import("@/components/dispatch-calendar-modal"), {
  ssr: false
});

const LocationBanner = dynamic(() => import("@/components/location-banner"), {
  ssr: false
});

const ProductConfiguratorSimple = dynamic(() => import("@/modules/products/components/product-configurator-simple"), {
  ssr: false
});
// Función para extraer productos destacados desde datos de Supabase
const extractProductosDestacados = (productosData: any) => {
  try {
    const categorias = productosData?.productos_por_categoria || {};
    console.log('🔍 Categorías disponibles:', Object.keys(categorias));
    
    // Productos más económicos de cada categoría principal con sus imágenes específicas
    const productosEconomicos = [
      {
        categoria: "Policarbonato Ondulado", 
        codigo_variante: "111001102", // Bronce 0,81x2 - $8,952
        imagen: "/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp",
        etiqueta: "Más Económico"
      },
      {
        categoria: "Policarbonato Alveolar",
        codigo_variante: "113216401", // 4mm Clear 1,05x2,9
        imagen: "/assets/images/Productos/Policarbonato Alveolar/policarbonato_alveolar.webp",
        etiqueta: "Más Versátil"
      },
      {
        categoria: "Policarbonato Compacto",
        codigo_variante: "517106401", // 4mm 2,05x3,05
        imagen: "/assets/images/Productos/Policarbonato Compacto/policarbonato_compacto.webp",
        etiqueta: "Mayor Resistencia"
      }
    ];
    
    const productosDestacados = [];
    
    // Buscar en la nueva estructura de categorías desde Supabase
    for (const economico of productosEconomicos) {
      console.log(`🔍 Buscando ${economico.categoria} con SKU: ${economico.codigo_variante}`);
      let encontrado = false;
      
      for (const [categoriaNombre, productos] of Object.entries(categorias)) {
        console.log(`  📂 Revisando categoría: ${categoriaNombre} (${(productos as any[]).length} productos)`);
        
        const grupoEncontrado = (productos as any[]).find(grupo => 
          grupo.variantes && grupo.variantes.some((variante: any) => 
            variante.codigo === economico.codigo_variante
          )
        );
        
        if (grupoEncontrado) {
          console.log(`  ✅ Grupo encontrado para ${economico.categoria} en ${categoriaNombre}`);
          const varianteEconomica = grupoEncontrado.variantes.find((v: any) => 
            v.codigo === economico.codigo_variante
          );
          
          if (varianteEconomica) {
            console.log(`  ✅ Variante encontrada:`, {
              codigo: varianteEconomica.codigo,
              nombre: varianteEconomica.nombre,
              precio: varianteEconomica.precio_con_iva
            });
            
            // Calcular información de TODAS las variantes del grupo
            const todasVariantes = grupoEncontrado.variantes || [];
            const precioMasBajo = Math.min(...todasVariantes.map((v: any) => v.precio_con_iva || v.precio || Infinity));
            const stockTotal = todasVariantes.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
            const coloresUnicos = [...new Set(todasVariantes.map((v: any) => v.color).filter(Boolean))];
            const espesoresUnicos = [...new Set(todasVariantes.map((v: any) => v.espesor).filter(Boolean))];
            const dimensionesUnicas = [...new Set(todasVariantes.map((v: any) => v.dimensiones || `${v.ancho}x${v.largo}`).filter(Boolean))];
            
            const grupoCompleto = {
              ...grupoEncontrado,
              id: grupoEncontrado.id || economico.categoria.toLowerCase().replace(/ /g, '-'),
              nombre: economico.categoria,
              imagen: economico.imagen,
              
              // TODAS las variantes para selectores dinámicos
              variantes: todasVariantes,
              
              // Información calculada
              precio_desde: precioMasBajo,
              stock_total: stockTotal,
              variantes_count: todasVariantes.length,
              
              // Opciones para selectores
              colores: coloresUnicos,
              espesores: espesoresUnicos,  
              dimensiones: dimensionesUnicas,
              
              etiqueta: economico.etiqueta || 'Destacado'
            };
            
            console.log(`  📊 Grupo completo creado:`, {
              variantes: todasVariantes.length,
              colores: coloresUnicos.length,
              espesores: espesoresUnicos.length,
              dimensiones: dimensionesUnicas.length,
              precio_desde: precioMasBajo
            });
            
            productosDestacados.push(grupoCompleto);
            encontrado = true;
            break;
          }
        }
      }
      
      if (!encontrado) {
        console.warn(`❌ No se encontró ${economico.categoria} con SKU: ${economico.codigo_variante}`);
        // Crear producto placeholder si no existe en BD
        const placeholderProduct = {
          id: economico.categoria.toLowerCase().replace(/ /g, '-'),
          nombre: economico.categoria,
          imagen: economico.imagen,
          variantes: [{
            codigo: economico.codigo_variante,
            nombre: economico.categoria,
            precio_con_iva: 15000, // Precio placeholder
            precio_neto: 12605,
            stock: 0,
            color: "Cristal",
            espesor: "0.8mm",
            dimensiones: "1.05 x 2.90 metros"
          }],
          precio_desde: 15000,
          stock_total: 0,
          variantes_count: 1,
          colores: ["Cristal"]
        };
        
        console.log(`  ⚠️  Usando producto placeholder para ${economico.categoria}`);
        productosDestacados.push(placeholderProduct);
      }
    }
    
    // Asegurar que siempre tengamos exactamente 3 productos
    if (productosDestacados.length < 3) {
      console.warn(`⚠️ Solo se encontraron ${productosDestacados.length} productos, completando con placeholders`);
      
      // Productos que faltan
      const productosConfig = [
        {
          categoria: "Policarbonato Ondulado", 
          codigo_variante: "111001101",
          imagen: "/assets/images/Productos/Policarnato Ondulado/policarbonato_ondulado_opal_perspectiva.webp"
        },
        {
          categoria: "Policarbonato Alveolar",
          codigo_variante: "113216401", 
          imagen: "/assets/images/Productos/Policarbonato Alveolar/policarbonato_alveolar.webp"
        },
        {
          categoria: "Policarbonato Compacto",
          codigo_variante: "517106401",
          imagen: "/assets/images/Productos/Policarbonato Compacto/policarbonato_compacto.webp"
        }
      ];
      
      for (const config of productosConfig) {
        if (!productosDestacados.find(p => p.nombre === config.categoria)) {
          const placeholderProduct = {
            id: config.categoria.toLowerCase().replace(/ /g, '-'),
            nombre: config.categoria,
            imagen: config.imagen,
            variantes: [{
              codigo: config.codigo_variante,
              nombre: config.categoria,
              precio_con_iva: config.categoria.includes('Ondulado') ? 15000 : 
                             config.categoria.includes('Alveolar') ? 16432 : 211005,
              precio_neto: config.categoria.includes('Ondulado') ? 12605 : 
                          config.categoria.includes('Alveolar') ? 13808 : 177315,
              stock: 10,
              color: "Cristal",
              espesor: config.categoria.includes('Ondulado') ? "0.8mm" : "4mm",
              dimensiones: config.categoria.includes('Compacto') ? "2.05 x 3.05 metros" : "1.05 x 2.90 metros"
            }],
            precio_desde: config.categoria.includes('Ondulado') ? 15000 : 
                         config.categoria.includes('Alveolar') ? 16432 : 211005,
            stock_total: 10,
            variantes_count: 1,
            colores: ["Cristal"]
          };
          
          console.log(`➕ Añadiendo placeholder para ${config.categoria}`);
          productosDestacados.push(placeholderProduct);
        }
      }
    }

    console.log(`✅ Total productos destacados final: ${productosDestacados.length}`, productosDestacados.map(p => p.nombre));
    return productosDestacados;
  } catch (error) {
    console.warn('Error extrayendo productos destacados:', error);
    return [];
  }
};

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, state, toggleCart } = useCart();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    materialBuscado: '',
    nombre: '',
    telefono: '',
    comentarios: ''
  });

  const [isCatalogoModalOpen, setIsCatalogoModalOpen] = useState(false);
  const [isDispatchCalendarOpen, setIsDispatchCalendarOpen] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  
  // Estado para el modal de proyectos
  const [selectedProject, setSelectedProject] = useState(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  // Estados para sistema IA y cotización
  const [isAIAnalyzing, setIsAIAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Estados para productos destacados desde Supabase
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Cargar productos destacados desde Supabase
  useEffect(() => {
    const loadProductosDestacados = async () => {
      try {
        console.log('🔄 Cargando productos destacados desde Supabase...');
        const response = await fetch('/api/productos-publico');
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('📊 Datos recibidos de API:', Object.keys(result.data || {}));
            const destacados = extractProductosDestacados(result.data);
            setProductosDestacados(destacados);
            console.log('✅ Productos destacados cargados:', destacados.length, destacados.map(p => p.nombre));
          } else {
            console.error('❌ Error en API:', result.error);
            setProductosDestacados([]);
          }
        } else {
          console.error('❌ Error HTTP:', response.status);
          setProductosDestacados([]);
        }
      } catch (error) {
        console.error('❌ Error cargando productos destacados:', error);
        setProductosDestacados([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProductosDestacados();
  }, []);

  // Datos de proyectos con especificaciones detalladas
  const projectsData = {
    'proyecto-destacado': {
      id: 'proyecto-destacado',
      title: 'Quincho Familiar Premium',
      category: 'Proyecto Destacado',
      image: '/assets/images/Clientes/quincho_policarbonato_familia.webp',
      description: 'Estructura completa de policarbonato de última generación con diseño arquitectónico moderno, integrando funcionalidad superior y estética contemporánea para espacios familiares de alto nivel.',
      specs: {
        material: 'Policarbonato Alveolar 10mm',
        area: '25m²',
        tiempo: '3 días hábiles',
        garantia: '10 años contra defectos',
        ubicacion: 'Las Condes, Santiago'
      },
      features: ['Resistente a rayos UV', 'Impermeable 100%', 'Aislamiento térmico', 'Estructura de aluminio', 'Diseño personalizado'],
      process: [
        'Visita técnica y medición del espacio',
        'Diseño 3D personalizado según necesidades',
        'Fabricación de estructura de aluminio',
        'Instalación de paneles de policarbonato',
        'Pruebas de calidad y entrega final'
      ]
    },
    'comercial': {
      id: 'comercial',
      title: 'Oficina Corporativa',
      category: 'Comercial',
      image: '/assets/images/Clientes/oficina_policarbonato_retry.webp',
      description: 'Espacios profesionales con calidad garantizada, diseñados para maximizar la luminosidad natural y crear ambientes de trabajo productivos.',
      specs: {
        material: 'Policarbonato Compacto 8mm',
        area: '45m²',
        tiempo: '5 días hábiles',
        garantia: '8 años',
        ubicacion: 'Providencia, Santiago'
      },
      features: ['Transmisión lumínica 90%', 'Aislamiento acústico', 'Fácil limpieza', 'Resistente al impacto'],
      process: [
        'Evaluación de necesidades comerciales',
        'Diseño arquitectónico especializado',
        'Coordinación con otros oficios',
        'Instalación con mínima interrupción',
        'Certificación de calidad comercial'
      ]
    },
    'agricola': {
      id: 'agricola',
      title: 'Invernadero Inteligente',
      category: 'Agrícola',
      image: '/assets/images/Clientes/invernadero_policarbonato.webp',
      description: 'Sistema de cultivo controlado con tecnología de policarbonato premium, diseñado para optimizar condiciones de crecimiento y maximizar la productividad agrícola.',
      specs: {
        material: 'Policarbonato Alveolar 6mm',
        area: '120m²',
        tiempo: '7 días hábiles',
        garantia: '12 años',
        ubicacion: 'Melipilla, Santiago'
      },
      features: ['Control térmico superior', 'Ventilación optimizada', 'Resistencia granizo', 'Transmisión luz difusa'],
      process: [
        'Análisis del terreno y clima',
        'Sistema de ventilación integrado',
        'Estructura reforzada anti-viento',
        'Instalación de sistemas de riego',
        'Calibración climática final'
      ]
    },
    'residencial': {
      id: 'residencial',
      title: 'Quincho Premium',
      category: 'Residencial',
      image: '/assets/images/Clientes/quincho_cliente.webp',
      description: 'Espacios funcionales y elegantes para el hogar, donde las familias pueden disfrutar de momentos especiales protegidos de las inclemencias del clima.',
      specs: {
        material: 'Policarbonato Alveolar 10mm',
        area: '20m²',
        tiempo: '2 días hábiles',
        garantia: '10 años',
        ubicacion: 'La Reina, Santiago'
      },
      features: ['Elegancia residencial', 'Fácil mantenimiento', 'Resistente', 'Diseño personalizable'],
      process: [
        'Consulta familiar personalizada',
        'Diseño según estilo de la casa',
        'Selección de colores y acabados',
        'Instalación rápida y limpia',
        'Capacitación de mantenimiento'
      ]
    },
    'arquitectonico': {
      id: 'arquitectonico',
      title: 'Estructura Moderna',
      category: 'Arquitectónico',
      image: '/assets/images/Clientes/quincho_policarbonato.webp',
      description: 'Soluciones arquitectónicas que transforman espacios con diseño innovador, integrando funcionalidad y estética de vanguardia.',
      specs: {
        material: 'Policarbonato Compacto 12mm',
        area: '35m²',
        tiempo: '4 días hábiles',
        garantia: '15 años',
        ubicacion: 'Las Condes, Santiago'
      },
      features: ['Diseño innovador', 'Tecnología avanzada', 'Moderno', 'Arquitectura vanguardia'],
      process: [
        'Colaboración con arquitectos',
        'Diseño estructural especializado',
        'Cálculos de ingeniería avanzados',
        'Instalación de precisión',
        'Certificación arquitectónica'
      ]
    }
  };

  // Función para abrir modal de proyecto
  const openProjectModal = (projectId) => {
    setSelectedProject(projectsData[projectId]);
    setIsProjectModalOpen(true);
  };

  // Función para cerrar modal de proyecto
  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    setSelectedProject(null);
    setAiAnalysis(null);
    setIsAIAnalyzing(false);
    setShowProductModal(false);
  };

  // Función helper para aplicar mínimos según tipo de producto
  const applyMinimumQuantity = (productId, calculatedQuantity) => {
    // Solo policarbonato compacto se vende sin mínimo
    if (productId.includes('compacto') || productId.includes('Compacto')) {
      return Math.ceil(calculatedQuantity);
    }
    // Todos los demás productos tienen mínimo 10
    return Math.max(10, Math.ceil(calculatedQuantity));
  };

  // Función IA para analizar proyecto y recomendar productos
  const analyzeProjectWithAI = async (project) => {
    setIsAIAnalyzing(true);
    
    // Simular análisis de IA (en producción sería una llamada a API real)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Calcular materiales específicos para el proyecto
    const area = parseFloat(project.specs.area);
    const policarbonatoArea = Math.ceil(area * 1.1 * 100) / 100; // 10% extra, redondeado
    const perfilesMetros = Math.ceil(area / 2.5 * 100) / 100; // Perfiles según área, redondeado
    const kitsAccesorios = Math.max(1, Math.ceil(area / 12)); // Mínimo 1 kit
    
    // Calcular precios
    const precioPolicarbonato = policarbonatoArea * 15900;
    const precioPerfiles = perfilesMetros * 2500;
    const precioAccesorios = kitsAccesorios * 8900;
    const subtotalMateriales = precioPolicarbonato + precioPerfiles + precioAccesorios;
    
    // Calcular descuento por proyecto completo (5-15% según área)
    let porcentajeDescuento = 5; // Base 5%
    if (area >= 50) porcentajeDescuento = 10;
    if (area >= 100) porcentajeDescuento = 15;
    
    const descuento = subtotalMateriales * (porcentajeDescuento / 100);
    const totalProyecto = subtotalMateriales - descuento;
    
    const analysis = {
      projectAnalysis: {
        projectName: `Proyecto ${project.specs.material} - ${area}m²`,
        totalArea: area,
        materialType: project.specs.material,
        materials: [
          {
            id: 'policarbonato-proyecto',
            name: project.specs.material,
            description: 'Material principal del proyecto con 10% extra para cortes y desperdicios',
            quantity: policarbonatoArea,
            unit: 'm²',
            unitPrice: 15900,
            totalPrice: precioPolicarbonato,
            isProjectMaterial: true
          },
          {
            id: 'perfiles-proyecto',
            name: 'Perfiles de Aluminio H',
            description: 'Sistema de unión y estructura para instalación profesional',
            quantity: perfilesMetros,
            unit: 'metros',
            unitPrice: 2500,
            totalPrice: precioPerfiles,
            isProjectMaterial: true
          },
          {
            id: 'accesorios-proyecto',
            name: 'Kit de Accesorios Completo',
            description: 'Tornillos, selladores y elementos de fijación para todo el proyecto',
            quantity: kitsAccesorios,
            unit: kitsAccesorios === 1 ? 'kit' : 'kits',
            unitPrice: 8900,
            totalPrice: precioAccesorios,
            isProjectMaterial: true
          }
        ],
        pricing: {
          subtotal: subtotalMateriales,
          descuento: descuento,
          porcentajeDescuento: porcentajeDescuento,
          total: totalProyecto,
          ahorro: descuento,
          incluyeInstalacion: false
        },
        benefits: [
          `${porcentajeDescuento}% de descuento por proyecto completo`,
          'Materiales calculados específicamente para tu proyecto',
          'Sin aplicar mínimos por material individual',
          'Incluye 10% extra para cortes y desperdicios',
          'Asesoramiento técnico incluido'
        ]
      },
      // Eliminar recommendedProducts para proyectos ya que se vende como conjunto
      projectBundle: {
        id: `proyecto-${Date.now()}`,
        name: `Proyecto Completo - ${project.specs.material}`,
        description: `Desarrollo completo de ${area}m² con todos los materiales necesarios`,
        totalPrice: totalProyecto,
        originalPrice: subtotalMateriales,
        discount: descuento,
        discountPercentage: porcentajeDescuento,
        area: area,
        deliveryTime: '5-7 días hábiles',
        image: '/assets/images/Productos/proyecto_completo.webp',
        materials: [
          {
            id: 'policarbonato-proyecto',
            name: project.specs.material,
            description: 'Material principal del proyecto con 10% extra para cortes y desperdicios',
            quantity: policarbonatoArea,
            unit: 'm²',
            unitPrice: 15900,
            totalPrice: precioPolicarbonato,
            isProjectMaterial: true
          },
          {
            id: 'perfiles-proyecto',
            name: 'Perfiles de Aluminio H',
            description: 'Sistema de unión y estructura para instalación profesional',
            quantity: perfilesMetros,
            unit: 'metros',
            unitPrice: 2500,
            totalPrice: precioPerfiles,
            isProjectMaterial: true
          },
          {
            id: 'accesorios-proyecto',
            name: 'Kit de Accesorios Completo',
            description: 'Tornillos, selladores y elementos de fijación para todo el proyecto',
            quantity: kitsAccesorios,
            unit: kitsAccesorios === 1 ? 'kit' : 'kits',
            unitPrice: 8900,
            totalPrice: precioAccesorios,
            isProjectMaterial: true
          }
        ]
      }
    };
    
    setAiAnalysis(analysis);
    setIsAIAnalyzing(false);
  };

  // Función para mostrar productos específicos
  const showProjectProducts = (project) => {
    analyzeProjectWithAI(project);
    setShowProductModal(true);
  };

  // Función para agregar proyecto completo al carrito
  const addProjectToCart = (projectBundle) => {
    const cartItem = {
      id: projectBundle.id,
      nombre: projectBundle.name,
      descripcion: projectBundle.description,
      precio: projectBundle.totalPrice,
      precioOriginal: projectBundle.originalPrice,
      precioUnitario: projectBundle.totalPrice,
      cantidad: 1, // Proyectos siempre son cantidad 1
      total: projectBundle.totalPrice,
      categoria: 'Proyecto Completo',
      imagen: projectBundle.image || '/assets/images/Productos/proyecto_completo.webp',
      esProyecto: true,
      area: projectBundle.area,
      descuento: projectBundle.discount,
      porcentajeDescuento: projectBundle.discountPercentage,
      materialesIncluidos: projectBundle.materials,
      especificaciones: {
        tipo: 'Desarrollo Completo',
        area: `${projectBundle.area}m²`,
        tiempoEntrega: projectBundle.deliveryTime,
        incluyeInstalacion: false,
        materiales: projectBundle.materials.map(m => 
          `${m.name}: ${m.quantity} ${m.unit}`
        ).join(', ')
      }
    };
    
    addItem(cartItem);
    
    // Mostrar mensaje de confirmación específico para proyectos
    setToastMessage(`✅ Proyecto completo agregado al carrito - Ahorro de $${projectBundle.discount.toLocaleString()}`);
    setShowToast(true);
    
    // Abrir carrito automáticamente
    setTimeout(() => {
      if (!state.isOpen) {
        toggleCart();
      }
    }, 500);
    
    // Ocultar toast después de 3 segundos
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Función para agregar producto individual de IA al carrito
  const addAIProductToCart = (product) => {
    const cartItem = {
      id: product.id,
      nombre: product.name,
      descripcion: product.description,
      precio: product.price,
      precioUnitario: product.price, // Agregar precio unitario
      cantidad: product.quantity,
      total: product.price * product.quantity, // Calcular total
      categoria: 'Análisis IA',
      imagen: product.image || '/assets/images/default-product.webp',
      especificaciones: {
        tipo: product.name,
        unidad: product.unit,
        caracteristicas: product.features,
        tiempoEntrega: product.deliveryTime
      }
    };
    
    addItem(cartItem);
    
    // Mostrar mensaje de confirmación
    setToastMessage(`✅ ${product.name} agregado al carrito (${product.quantity} ${product.unit}${product.quantity > 1 ? 's' : ''})`);
    setShowToast(true);
    
    // Abrir carrito automáticamente
    setTimeout(() => {
      if (!state.isOpen) {
        toggleCart();
      }
    }, 500);
    
    // Ocultar toast después de 3 segundos
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  // Función para agregar todos los productos del análisis IA
  const addAllAIProductsToCart = () => {
    if (aiAnalysis?.recommendedProducts) {
      // Agregar todos los productos sin toast individual
      aiAnalysis.recommendedProducts.forEach(product => {
        const cartItem = {
          id: product.id,
          nombre: product.name,
          descripcion: product.description,
          precio: product.price,
          precioUnitario: product.price,
          cantidad: product.quantity,
          total: product.price * product.quantity,
          categoria: 'Análisis IA',
          imagen: product.image || '/assets/images/default-product.webp',
          especificaciones: {
            tipo: product.name,
            unidad: product.unit,
            caracteristicas: product.features,
            tiempoEntrega: product.deliveryTime
          }
        };
        addItem(cartItem);
      });
      
      // Mostrar mensaje de confirmación para todos
      setToastMessage(`🛒 ${aiAnalysis.recommendedProducts.length} productos agregados al carrito`);
      setShowToast(true);
      
      // Cerrar modal y abrir carrito
      setShowProductModal(false);
      setTimeout(() => {
        if (!state.isOpen) {
          toggleCart();
        }
      }, 300);
      
      // Ocultar toast después de 3 segundos
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    }
  };
  const [busqueda, setBusqueda] = useState('');
  const [nextDispatchDate, setNextDispatchDate] = useState<Date | null>(null);
  const [dispatchMessage, setDispatchMessage] = useState<string>("");
  const [selectedDispatchDate, setSelectedDispatchDate] = useState<string>('');

  // Filtrar productos basado en categoría y búsqueda
  const productosFiltrados = useMemo(() => {
    let resultado = productosDestacados;

    // Filtro por búsqueda
    if (busqueda) {
      resultado = resultado.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por categoría
    if (filtroCategoria !== 'Todos') {
      if (filtroCategoria === 'Alveolar') {
        resultado = resultado.filter(p => p.subcategoria === 'Alveolar');
      } else {
        resultado = resultado.filter(p => p.categoria === filtroCategoria);
      }
    }

    return resultado;
  }, [busqueda, filtroCategoria]);

  // Leer fecha de despacho de los search params
  useEffect(() => {
    const fechaParam = searchParams.get('fecha');
    if (fechaParam) {
      setSelectedDispatchDate(fechaParam);
    }
  }, [searchParams]);

  // Calcular próxima fecha de despacho
  useEffect(() => {
    const calculateNextDispatch = () => {
      const nextDate = getNextDispatchDate();
      const message = formatDispatchDate(nextDate);
      setNextDispatchDate(nextDate);
      setDispatchMessage(message);
    };

    calculateNextDispatch();
    
    // Actualizar cada minuto para mantener la información actualizada
    const interval = setInterval(calculateNextDispatch, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Función para agregar producto al carrito
  const agregarAlCarrito = (producto, cantidad = 10) => {
    const item = {
      id: producto.id,
      tipo: 'producto' as const,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      imagen: producto.imagen,
      cantidad: cantidad,
      precioUnitario: producto.precio,
      total: producto.precio * cantidad,
      especificaciones: Object.entries(producto.especificaciones).map(([key, value]) => 
        `${key}: ${Array.isArray(value) ? value.join(', ') : value}`
      )
    };
    
    addItem(item);
  };

  // Función para verificar si un producto está en el carrito
  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  // Función para manejar la selección de fecha de despacho
  const handleDispatchDateSelect = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    setSelectedDispatchDate(dateString);
    
    // Actualizar la URL sin recargar la página ni cambiar la posición
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('fecha', dateString);
    window.history.replaceState({}, '', currentUrl.pathname + currentUrl.search);
    
    setIsDispatchCalendarOpen(false);
  };

  // Función para obtener la cantidad de un producto en el carrito
  const getCartQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.cantidad : 0;
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!formData.materialBuscado || !formData.nombre || !formData.telefono) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }
    
    // Crear mensaje para WhatsApp
    const mensaje = `🏗️ *CONSULTA ASESORÍA PERSONAL - ObraExpress*

👤 *Cliente:* ${formData.nombre}
📱 *Teléfono:* ${formData.telefono}

🔍 *Material de interés:*
• ${formData.materialBuscado}

${formData.comentarios ? `💬 *Información adicional:*
${formData.comentarios}

` : ''}📋 *Solicito:*
✅ Asesoría personalizada con ejecutivo
✅ Información detallada del material
✅ Precios y disponibilidad

¡Gracias por contactarnos!`;

    // Número de WhatsApp de ObraExpress
    const numeroWhatsApp = "56963348909";
    
    // Crear URL de WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`;
    
    // Abrir WhatsApp
    navigate.openInNewTab(urlWhatsApp);
    
    // Mostrar confirmación
    alert('✅ Conectando con nuestro ejecutivo por WhatsApp...');
    
    // Limpiar formulario
    setFormData({
      materialBuscado: '',
      nombre: '',
      telefono: '',
      comentarios: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <NavbarSimple />
      
      {/* Hero Section */}
      <section 
        className="min-h-screen flex items-start text-white relative pt-32 md:pt-40 laptop-13:pt-44 lg:pt-48 xl:pt-56 pb-8 md:pb-16 laptop-13:pb-18 lg:pb-20 overflow-hidden hero-section"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.05) 100%), url('/assets/images/Home/bannerB-q82.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundAttachment: 'scroll'
        }}
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 gap-4 laptop-13:gap-5 lg:gap-6 xl:gap-8 items-center">
            <div className="xl:col-span-7 text-center xl:text-left px-2 sm:px-4 xl:px-0">
              <div className="mb-4 md:mb-6 animate-fade-in">
                <p className="text-base sm:text-lg md:text-xl text-white font-medium leading-relaxed max-w-2xl mx-auto xl:mx-0">
                  <span className="text-yellow-400 font-bold">Materiales de construcción profesional</span>
                  <br className="hidden md:block" />
                  para proyectos que <span className="text-yellow-400 font-bold">perduran en el tiempo</span>
                </p>
              </div>
              
              <div className="mb-6 md:mb-8 animate-slide-up">
                <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight px-2 sm:px-0">
                  <span className="block text-white mb-1 md:mb-2">
                    <span className="text-yellow-400 glow-text">Construye</span> tu proyecto
                  </span>
                  <span className="block text-white mb-1 md:mb-2 text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl">
                    con materiales premium
                  </span>
                  <span className="block text-yellow-400 glow-text min-h-[1.2em] text-base sm:text-lg md:text-2xl lg:text-3xl xl:text-4xl">
                    <TypewriterText 
                      words={[
                        "DE ALTA RESISTENCIA",
                        "CON GARANTÍA UV",
                        "DE MÁXIMA DURABILIDAD",
                        "PROFESIONALES",
                        "ESPECIALIZADOS"
                      ]}
                      typingSpeed={120}
                      deletingSpeed={60}
                      pauseTime={4000}
                      className="font-extrabold leading-tight tracking-tight"
                    />
                  </span>
                </h1>
              </div>
              
              <style jsx>{`
                .glow-text {
                  text-shadow: 0 0 20px rgba(251, 191, 36, 0.5), 0 0 40px rgba(251, 191, 36, 0.3);
                }
                .animate-fade-in {
                  animation: fadeIn 1s ease-out;
                }
                .animate-slide-up {
                  animation: slideUp 1s ease-out 0.3s both;
                }
                .animate-slide-up-delay {
                  animation: slideUp 1s ease-out 0.6s both;
                }
                .animate-spin-slow {
                  animation: spinSlow 4s linear infinite;
                }
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                  from { opacity: 0; transform: translateY(30px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spinSlow {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
              
              <div className="mb-6 md:mb-8 max-w-lg animate-slide-up-delay">
                <p className="text-base md:text-lg lg:text-xl text-white leading-relaxed">
                  Brindamos soluciones de construcción fundamentadas en 
                  compromiso, comunicación, colaboración y cumplimiento.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6 md:mb-8 animate-slide-up-delay">
                <button 
                  onClick={() => {
                    // Abrir el cotizador guiado por IA en una nueva ventana
                    navigate.openInNewTab('/cotizador-detallado');
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg text-sm md:text-base transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Cotizador Guiado por IA
                </button>
                <button 
                  onClick={() => {
                    const productosElement = safeDocument.getElementById('productos-section');
                    if (productosElement) {
                      productosElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="group relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:from-slate-800 hover:via-slate-700 hover:to-slate-800 text-white font-medium py-3 md:py-4 px-6 md:px-8 rounded-2xl text-sm md:text-base transition-all duration-500 hover:scale-[1.03] shadow-2xl hover:shadow-slate-500/25 border border-slate-600/30 hover:border-slate-400/50"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    <div className="w-5 h-5 mr-3 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-300 rounded-full animate-pulse"></div>
                      <svg className="relative w-5 h-5 text-slate-900 transition-transform group-hover:rotate-12" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                      </svg>
                    </div>
                    <span className="tracking-wide">PRODUCTOS DESTACADOS</span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                  <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-400/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-400/30 to-transparent"></div>
                </button>
              </div>

              {/* Badge líder - posicionado a mitad de altura del formulario */}
              <div className="mb-6 md:mb-8 animate-slide-up-delay">
                <div className="inline-flex items-center px-4 py-2 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-full">
                  <span className="w-3 h-3 bg-yellow-400 rounded-full mr-3 animate-pulse"></span>
                  <p className="text-sm md:text-base text-yellow-100 font-semibold uppercase tracking-wide">
                    Líder en Materiales de Construcción
                  </p>
                </div>
              </div>

              {/* Rating Section con avatares */}
              <div className="mb-6 md:mb-8 animate-slide-up-delay">
                <button 
                  onClick={() => {
                    const reviewsElement = safeDocument.getElementById('reviews');
                    if (reviewsElement) {
                      reviewsElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="bg-black/20 backdrop-blur-md rounded-2xl p-4 md:p-6 inline-block w-full sm:w-auto hover:bg-black/30 transition-all duration-300 cursor-pointer hover:scale-105 transform"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Rating y estrellas */}
                    <div className="text-white text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start space-x-2 mb-1">
                        <span className="text-xl md:text-2xl font-bold">4.8</span>
                        <div className="flex">
                          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                      </div>
                      <p className="text-sm md:text-base text-gray-200 drop-shadow-md font-medium">+150 clientes satisfechos</p>
                    </div>
                    
                    {/* Avatares */}
                    <AvatarGroup
                      items={[
                        {
                          id: 1,
                          name: "María González",
                          designation: "Arquitecta",
                          image: "/assets/images/Review/avatar1.webp",
                        },
                        {
                          id: 2,
                          name: "Carlos Mendoza",
                          designation: "Constructor",
                          image: "/assets/images/Review/avatar2.webp",
                        },
                        {
                          id: 3,
                          name: "Ana Rodríguez",
                          designation: "Ingeniera",
                          image: "/assets/images/Review/avatar4.webp",
                        },
                        {
                          id: 4,
                          name: "Luis Hernández",
                          designation: "Arquitecto",
                          image: "/assets/images/Review/avatar3.webp",
                        },
                      ]}
                      maxVisible={4}
                      size="lg"
                    />
                  </div>
                </button>
              </div>
              
            </div>

            <div className="xl:col-span-5">
              <div id="cotizador-rapido" className="bg-white/80 backdrop-blur-md rounded-3xl p-3 sm:p-4 lg:p-6 shadow-2xl border border-gray-200/30 animate-slide-up-delay relative z-10 form-container">
                {/* Banner de Ubicación */}
                <LocationBanner className="mb-4" showDeliveryInfo={true} />
                
                <div className="text-center mb-4">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">
                    Consulta & Asesórate
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-2">
                    Consulta y asesórate con nuestros ejecutivos de forma personal
                  </p>
                  <div className="flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-green-600 text-sm sm:text-base">Respuesta inmediata</span>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">¿Qué material está buscando?</label>
                    <select 
                      name="materialBuscado"
                      value={formData.materialBuscado}
                      onChange={handleChange}
                      className="w-full p-2 sm:p-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium shadow-sm transition-all backdrop-blur-sm text-sm"
                      required
                    >
                      <option value="">Seleccionar material...</option>
                      <option value="Láminas Alveolares">Láminas Alveolares (Policarbonato)</option>
                      <option value="Rollos Compactos">Rollos Compactos (Policarbonato)</option>
                      <option value="Policarbonato Ondulado">Policarbonato Ondulado</option>
                      <option value="Accesorios">Accesorios de Instalación</option>
                      <option value="Sistemas Estructurales">Sistemas Estructurales</option>
                      <option value="No estoy seguro">No estoy seguro / Necesito asesoría</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">Nombre Completo</label>
                    <input 
                      type="text" 
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      placeholder="Ingresa tu nombre" 
                      className="w-full p-2 sm:p-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium shadow-sm transition-all backdrop-blur-sm text-sm" 
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">Teléfono WhatsApp</label>
                    <input 
                      type="tel" 
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      placeholder="+56 9 xxxx xxxx" 
                      className="w-full p-2 sm:p-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium shadow-sm transition-all backdrop-blur-sm text-sm" 
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">Comentarios adicionales (opcional)</label>
                    <textarea 
                      name="comentarios"
                      value={formData.comentarios || ''}
                      onChange={handleChange}
                      placeholder="Describe detalles específicos de tu proyecto, ubicación, plazos, o cualquier requerimiento especial..." 
                      rows={3}
                      className="w-full p-2 sm:p-3 bg-white/80 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 text-gray-800 font-medium shadow-sm transition-all backdrop-blur-sm resize-none text-sm"
                    />
                  </div>
                  
                  <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 text-sm sm:text-base">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.479 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.304 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span className="hidden sm:inline">Consultar por WhatsApp</span>
                    <span className="sm:hidden">WhatsApp</span>
                  </button>
                  <div className="flex items-center justify-center mt-3 sm:mt-4 space-x-2 sm:space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Asesoría gratuita
                    </span>
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Respuesta &lt; 1 hora
                    </span>
                    <span className="flex items-center">
                      <svg className="h-4 w-4 mr-1 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Cotización formal
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        
        {/* Degradé de fusión hacia el fondo blanco */}
        <div className="absolute -bottom-32 left-0 right-0 h-80 bg-gradient-to-t from-white via-white/90 via-white/70 via-white/50 via-white/25 to-transparent pointer-events-none"></div>
        
        {/* Figura decorativa para suavizar el corte */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
          <svg 
            className="absolute bottom-0 w-full h-24 text-white" 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none"
          >
            <path 
              d="M0,0 C150,60 350,60 600,30 C850,0 1050,60 1200,30 L1200,120 L0,120 Z" 
              fill="currentColor"
            />
          </svg>
        </div>
      </section>

      {/* Productos Destacados Section - Diseño Moderno */}
      <section id="productos-section" className="py-16 md:py-24 bg-white relative overflow-hidden">
        {/* Fondo minimalista */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-amber-50/30"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tl from-amber-100/20 to-transparent rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Header Moderno */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-amber-100 rounded-full mb-6">
              <div className="w-2 h-2 bg-amber-500 rounded-full mr-3"></div>
              <span className="text-amber-800 font-semibold text-sm uppercase tracking-wider">
                Productos Destacados
              </span>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6 tracking-wide">
              <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Policarbonatos
              </span>
              <br />
              <span className="text-gray-700 text-3xl md:text-4xl lg:text-5xl font-medium">
                de Calidad Premium
              </span>
            </h2>
            
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              Descubre nuestras tres categorías principales especializadas para cada tipo de proyecto, 
              todas con garantía UV de 10 años y certificación de calidad internacional.
            </p>
            
            {/* Stats minimalistas */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">15+</div>
                <div className="text-sm text-gray-500">Años</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-sm text-gray-500">Proyectos</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">10</div>
                <div className="text-sm text-gray-500">Años Garantía</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">100%</div>
                <div className="text-sm text-gray-500">Calidad</div>
              </div>
            </div>

            {/* Banner de Próximo Despacho - Moderno */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-2xl mx-auto">
              <div className="text-center mb-4">
                <div className="inline-flex items-center px-3 py-1 bg-blue-100 rounded-full mb-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-blue-700 font-semibold text-sm">Próximo Despacho</span>
                </div>
                
                {/* Fecha clickeable con botón destacado */}
                <div className="space-y-4">
                  <button
                    onClick={() => setIsDispatchCalendarOpen(true)}
                    className="group w-full bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-2 border-green-300 hover:border-green-400 rounded-xl p-4 transition-all duration-300 shadow-md hover:shadow-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left flex-1">
                        <div className="text-gray-900 font-semibold text-lg mb-1">
                          {selectedDispatchDate ? (
                            new Date(selectedDispatchDate + 'T00:00:00').toLocaleDateString('es-CL', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long' 
                            })
                          ) : (
                            dispatchMessage || 'Calculando próxima fecha...'
                          )}
                        </div>
                        <div className="text-gray-600 text-sm">
                          9:00 - 18:00 hrs • {selectedDispatchDate ? 'Fecha personalizada' : 'Fecha más próxima'}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 ml-4">
                        {selectedDispatchDate && (
                          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          </div>
                        )}
                        <div className="w-10 h-10 bg-green-500 group-hover:bg-green-600 rounded-full flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Botón adicional más destacado */}
                  <button
                    onClick={() => setIsDispatchCalendarOpen(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-base transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-green-500 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Ver Calendario Completo</span>
                  </button>
                </div>
                
                <div className="mt-3 text-sm text-gray-500">
                  {selectedDispatchDate ? (
                    <div className="flex items-center justify-center space-x-3">
                      <button 
                        onClick={() => {
                          setSelectedDispatchDate('');
                          // Remover el parámetro de fecha de la URL sin recargar
                          const currentUrl = new URL(window.location.href);
                          currentUrl.searchParams.delete('fecha');
                          window.history.replaceState({}, '', currentUrl.pathname + currentUrl.search);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Solicitar fecha más próxima
                      </button>
                      <span>•</span>
                      <span>Click para cambiar</span>
                    </div>
                  ) : (
                    <div>
                      Despachamos sólo los días Jueves • Haz clic para elegir la fecha específica
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Productos Configurables - Página de Inicio */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 laptop-13:gap-7 lg:gap-8 max-w-7xl mx-auto products-grid products-grid-mobile products-grid-mobile-md products-grid-tablet products-grid-tablet-lg items-stretch">
            {productosDestacados.map((producto) => (
              <ProductConfiguratorSimple 
                key={producto.id}
                productGroup={producto}
                className=""
              />
            ))}
          </div>
          
          {/* Call to Action Bar */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 border border-gray-200/60 rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
              {/* Elementos decorativos sutiles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-amber-100/30 to-transparent rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-3xl"></div>
              
              {/* Patrón geométrico sutil */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              
              <div className="relative z-10">
                <div className="text-center max-w-4xl mx-auto">
                  {/* Icono profesional */}
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl shadow-lg mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                    ¿Necesitas asesoramiento técnico especializado?
                  </h2>
                  
                  <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
                    Nuestros ingenieros especializados te ayudan a elegir la solución perfecta para tu proyecto de construcción con tecnología de vanguardia
                  </p>
                </div>
                <div className="flex flex-col lg:flex-row gap-4 justify-center items-center flex-wrap max-w-5xl mx-auto">
                  <button 
                    onClick={() => {
                      window.open('https://wa.me/56223456789?text=Hola, necesito asesoramiento técnico especializado para mi proyecto de construcción. ¿Podrían ayudarme?', '_blank');
                    }}
                    className="group bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-emerald-600/20"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Conversar con Nuestros Ejecutivos
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      console.log('🎯 Botón "Llámanos Ahora" clickeado - abriendo widget Eleven Labs');
                      // Importar dinámicamente la función para evitar errores de SSR
                      import('@/utils/elevenlabs-widget').then(({ openElevenLabsWidget }) => {
                        openElevenLabsWidget();
                      }).catch(error => {
                        console.error('Error cargando widget:', error);
                        // Fallback solo si hay error al cargar el módulo
                        window.open('tel:+56963348909', '_self');
                      });
                    }}
                    className="group bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 hover:border-gray-400 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Llámanos Ahora
                    </span>
                  </button>
                  
                  <button 
                    onClick={() => setIsCatalogoModalOpen(true)}
                    className="group bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-amber-500/20"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Descargar Catálogos PDF
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Trabajos de nuestros CLIENTES Section - Interactive Gallery */}
      <section className="py-24 md:py-32 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/30 via-transparent to-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6 tracking-wide">
              <span className="text-gray-800">Trabajos de nuestros</span> <span className="text-blue-600">clientes</span>
            </h2>
            <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
              Testimonios reales de clientes satisfechos que confían en la calidad de nuestros productos
            </p>
            <div className="mt-8 flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">+500</div>
                <div className="text-gray-600 text-sm uppercase tracking-wide">Proyectos</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">15</div>
                <div className="text-gray-600 text-sm uppercase tracking-wide">Años Experiencia</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-600">4.8★</div>
                <div className="text-gray-600 text-sm uppercase tracking-wide">Satisfacción</div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Imagen principal - Proyecto Destacado */}
              <div className="lg:col-span-2 group cursor-pointer relative">
                <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                  <Image 
                    src="/assets/images/Clientes/quincho_policarbonato_familia.webp" 
                    alt="Quincho familiar premium con policarbonato - Proyecto Destacado"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                    fill
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500"></div>
                  
                  {/* Información básica - siempre visible */}
                  <div className="absolute bottom-4 left-4 right-4 transition-transform duration-300 group-hover:-translate-y-12">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                      <span className="text-yellow-400 font-medium text-xs uppercase">Proyecto Destacado</span>
                    </div>
                    <h4 className="text-white font-bold text-xl">Quincho Familiar Premium</h4>
                    <p className="text-gray-300 text-sm mt-1">Estructura completa de policarbonato premium</p>
                  </div>
                  
                  {/* Información adicional - aparece en hover */}
                  <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                    <div className="backdrop-blur-sm bg-black/40 rounded-xl p-4 border border-white/20">
                      <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
                        <div className="text-gray-300">
                          <span className="text-white font-medium">Material:</span> Policarbonato 10mm
                        </div>
                        <div className="text-gray-300">
                          <span className="text-white font-medium">Área:</span> 25m²
                        </div>
                        <div className="text-gray-300">
                          <span className="text-white font-medium">Tiempo:</span> 3 días
                        </div>
                        <div className="text-gray-300">
                          <span className="text-white font-medium">Garantía:</span> 10 años
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          <span className="px-2 py-1 bg-yellow-400/20 rounded-full text-yellow-300 text-xs">Resistente UV</span>
                          <span className="px-2 py-1 bg-blue-400/20 rounded-full text-blue-300 text-xs">Impermeable</span>
                        </div>
                        <button 
                          onClick={() => openProjectModal('proyecto-destacado')}
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 border border-white/30"
                        >
                          Ver detalles →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid de imágenes secundarias - Comercial y Agrícola */}
              <div className="space-y-6">
                
                {/* 1. Comercial */}
                <div className="group cursor-pointer relative">
                  <div className="relative h-[240px] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500">
                    <Image 
                      src="/assets/images/Clientes/oficina_policarbonato_retry.webp" 
                      alt="Oficina comercial con policarbonato"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300"></div>
                    
                    {/* Info básica */}
                    <div className="absolute bottom-4 left-4 right-4 transition-transform duration-300 group-hover:-translate-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                        <span className="text-blue-400 font-medium text-xs uppercase">Comercial</span>
                      </div>
                      <h4 className="text-white font-bold text-lg">Oficina Corporativa</h4>
                      <p className="text-gray-300 text-sm mt-1">Espacios profesionales con calidad garantizada</p>
                    </div>
                    
                    {/* Info adicional en hover */}
                    <div className="absolute bottom-2 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="backdrop-blur-sm bg-black/50 rounded-lg p-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-300">Material: Policarbonato 8mm</span>
                          <button 
                            onClick={() => openProjectModal('comercial')}
                            className="bg-blue-400/20 text-blue-300 px-2 py-1 rounded text-xs hover:bg-blue-400/30 transition-colors"
                          >
                            + Info
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Agrícola */}
                <div className="group cursor-pointer relative">
                  <div className="relative h-[240px] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500">
                    <Image 
                      src="/assets/images/Clientes/invernadero_policarbonato.webp" 
                      alt="Invernadero con policarbonato"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300"></div>
                    
                    {/* Info básica */}
                    <div className="absolute bottom-4 left-4 right-4 transition-transform duration-300 group-hover:-translate-y-6">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                        <span className="text-green-400 font-medium text-xs uppercase">Agrícola</span>
                      </div>
                      <h4 className="text-white font-bold text-lg">Invernadero Inteligente</h4>
                      <p className="text-gray-300 text-sm mt-1">Productividad agrícola de alta tecnología</p>
                    </div>
                    
                    {/* Info adicional en hover */}
                    <div className="absolute bottom-2 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="backdrop-blur-sm bg-black/50 rounded-lg p-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-gray-300">Material: Policarbonato 6mm</span>
                          <button 
                            onClick={() => openProjectModal('agricola')}
                            className="bg-green-400/20 text-green-300 px-2 py-1 rounded text-xs hover:bg-green-400/30 transition-colors"
                          >
                            + Info
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Galería adicional inferior - Residencial y Arquitectónico */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              
              {/* 3. Residencial */}
              <div className="group cursor-pointer relative">
                <div className="relative h-[320px] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500">
                  <Image 
                    src="/assets/images/Clientes/quincho_cliente.webp" 
                    alt="Quincho residencial premium"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300"></div>
                  
                  {/* Info básica */}
                  <div className="absolute bottom-4 left-4 right-4 transition-transform duration-300 group-hover:-translate-y-8">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span className="text-purple-400 font-medium text-xs uppercase">Residencial</span>
                    </div>
                    <h4 className="text-white font-bold text-lg">Quincho Premium</h4>
                    <p className="text-gray-300 text-sm mt-1">Espacios funcionales y elegantes para el hogar</p>
                  </div>
                  
                  {/* Info adicional en hover */}
                  <div className="absolute bottom-2 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="backdrop-blur-sm bg-black/50 rounded-lg p-3">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-gray-300">Área: 20m² | Material: Policarbonato 10mm</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                          <span className="px-2 py-1 bg-purple-400/20 rounded text-purple-300 text-xs">Resistente</span>
                          <span className="px-2 py-1 bg-blue-400/20 rounded text-blue-300 text-xs">Elegante</span>
                        </div>
                        <button 
                          onClick={() => openProjectModal('residencial')}
                          className="bg-purple-400/20 text-purple-300 px-2 py-1 rounded text-xs hover:bg-purple-400/30 transition-colors"
                        >
                          Ver más →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Arquitectónico */}
              <div className="group cursor-pointer relative">
                <div className="relative h-[320px] rounded-2xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500">
                  <Image 
                    src="/assets/images/Clientes/quincho_policarbonato.webp" 
                    alt="Estructura arquitectónica con policarbonato"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-115"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300"></div>
                  
                  {/* Info básica */}
                  <div className="absolute bottom-4 left-4 right-4 transition-transform duration-300 group-hover:-translate-y-8">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                      <span className="text-orange-400 font-medium text-xs uppercase">Arquitectónico</span>
                    </div>
                    <h4 className="text-white font-bold text-lg">Estructura Moderna</h4>
                    <p className="text-gray-300 text-sm mt-1">Soluciones arquitectónicas con diseño innovador</p>
                  </div>
                  
                  {/* Info adicional en hover */}
                  <div className="absolute bottom-2 left-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="backdrop-blur-sm bg-black/50 rounded-lg p-3">
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="text-gray-300">Diseño personalizado | Instalación profesional</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-1">
                          <span className="px-2 py-1 bg-orange-400/20 rounded text-orange-300 text-xs">Moderno</span>
                          <span className="px-2 py-1 bg-red-400/20 rounded text-red-300 text-xs">Innovador</span>
                        </div>
                        <button 
                          onClick={() => openProjectModal('arquitectonico')}
                          className="bg-orange-400/20 text-orange-300 px-2 py-1 rounded text-xs hover:bg-orange-400/30 transition-colors"
                        >
                          Ver más →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>


      {/* Customer Reviews Section */}
      <section id="reviews" className="py-16 bg-gradient-to-b from-white via-gray-50 to-gray-100 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-4 tracking-wide">Lo Que Dicen Nuestros Clientes</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Testimonios reales de clientes satisfechos que confían en la calidad de nuestros productos
            </p>
            <div className="flex items-center justify-center mt-6 space-x-2">
              <div className="flex text-yellow-500">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-blue-900">4.8</span>
              <span className="text-gray-600">de 5 estrellas (más de 150 clientes satisfechos)</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 laptop-13:gap-7 lg:gap-8">
            {/* Review 1 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500 mr-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Hace 2 semanas</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "Excelente calidad en todos los productos de policarbonato. El equipo de ObraExpress nos asesoró perfectamente para nuestro proyecto de techado industrial. Los materiales han resistido perfectamente las condiciones climáticas extremas. Muy recomendados."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  CM
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">Carlos Mendoza</h4>
                  <p className="text-sm text-gray-600">Ingeniero Civil, Constructora Mendoza</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Santiago, Región Metropolitana
                  </p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500 mr-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Hace 1 mes</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "Servicio impecable y productos de calidad garantizada. La instalación de nuestro cerramiento fue perfecta y el equipo técnico muy profesional. Los precios son competitivos y la atención al cliente excepcional. Definitivamente los recomiendo."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  AR
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">Ana Rodríguez</h4>
                  <p className="text-sm text-gray-600">Arquitecta, Estudio AR Arquitectos</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Valparaíso, Región de Valparaíso
                  </p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500 mr-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Hace 3 semanas</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "Entrega puntual y asesoría técnica excepcional. ObraExpress superó nuestras expectativas en todos los aspectos. La durabilidad y transparencia de sus láminas alveolares es impresionante. Sin duda volveremos a trabajar con ellos en futuros proyectos."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  MT
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">Miguel Torres</h4>
                  <p className="text-sm text-gray-600">Gerente de Obras, Torres Construcción</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Concepción, Región del Biobío
                  </p>
                </div>
              </div>
            </div>

            {/* Review 4 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500 mr-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Hace 1 semana</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "Increíble relación calidad-precio. Las estructuras metálicas que instalaron en nuestro galpón son de primera calidad y el diseño personalizado se adaptó perfectamente a nuestras necesidades. El equipo de ObraExpress es muy profesional y confiable."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  LC
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">Laura Castro</h4>
                  <p className="text-sm text-gray-600">Propietaria, Industrias Castro Ltda.</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    La Serena, Región de Coquimbo
                  </p>
                </div>
              </div>
            </div>

            {/* Review 5 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500 mr-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Hace 4 días</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "Excelente experiencia de principio a fin. La cotización fue clara y detallada, la instalación rápida y limpia, y el resultado final superó nuestras expectativas. El equipo de soporte post-venta también es muy atento. ¡Totalmente recomendados!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  RH
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">Roberto Hernández</h4>
                  <p className="text-sm text-gray-600">Director, Colegio San Andrés</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Temuco, Región de La Araucanía
                  </p>
                </div>
              </div>
            </div>

            {/* Review 6 */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-500 mr-3">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-500">Hace 5 días</span>
              </div>
              <p className="text-gray-700 mb-4 italic leading-relaxed">
                "La calidad del policarbonato es excepcional y la resistencia al clima ha sido probada durante dos años sin ningún problema. El servicio técnico siempre disponible y muy conocedor del producto. Una empresa seria y confiable que cumple lo que promete."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  JM
                </div>
                <div>
                  <h4 className="font-bold text-blue-900">José Morales</h4>
                  <p className="text-sm text-gray-600">Administrador, Centro Comercial Plaza Norte</p>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Antofagasta, Región de Antofagasta
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">¿Quieres ser parte de nuestros clientes satisfechos?</p>
            <button className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-900 to-black hover:from-emerald-600 hover:via-emerald-700 hover:to-emerald-800 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] shadow-2xl hover:shadow-emerald-500/25 border border-slate-700 hover:border-emerald-400 group">
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              {/* Contenido del botón */}
              <span className="relative z-10 flex items-center justify-center text-lg">
                <svg className="w-6 h-6 mr-3 transition-transform group-hover:rotate-12 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="tracking-wide">
                  Obtener Cotización
                  <span className="block text-sm font-normal opacity-90 -mt-1">Sin Costo • Sin Compromiso</span>
                </span>
                <svg className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              
              {/* Partículas brillantes */}
              <div className="absolute top-2 right-4 w-2 h-2 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
              <div className="absolute bottom-3 left-6 w-1.5 h-1.5 bg-emerald-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500 delay-100"></div>
            </button>
          </div>
        </div>
      </section>


      {/* Coordinación Profesional de Despacho */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6 tracking-wide">
              Coordinación Profesional de <span className="font-semibold">Despacho</span>
            </h2>
            <div className="w-24 h-0.5 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Sistema inteligente de logística que garantiza entregas precisas y coordinadas según sus necesidades específicas
            </p>
          </div>

          {/* Large Image */}
          <div className="relative -mx-4 md:-mx-8 lg:-mx-16 h-96 md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden mb-12 shadow-lg">
            <Image 
              src="/assets/images/Despachos/imagen_convertida.webp"
              alt="Coordinación profesional de despacho - Equipo trabajando con materiales de construcción"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {/* Quality Badge - Top Left */}
            <div className="absolute top-6 left-6 text-white">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span className="text-white font-bold text-lg">Calidad Garantizada</span>
              </div>
              <p className="text-white text-sm mt-1">Producto Premium</p>
            </div>

            {/* Process Steps - Right Side */}
            <div className="absolute bottom-6 right-6 text-white max-w-sm">
              <h3 className="text-lg font-semibold mb-6 tracking-wide">PROCESO DE COORDINACIÓN</h3>
              
              <div className="space-y-5">
                <div className="text-right">
                  <div className="flex items-center justify-end mb-2">
                    <div className="mr-3">
                      <h4 className="font-semibold text-sm">Solicitud y Cotización</h4>
                      <p className="text-xs text-white/90">Evaluamos su proyecto</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">1</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center justify-end mb-2">
                    <div className="mr-3">
                      <h4 className="font-semibold text-sm">Programación GPS</h4>
                      <p className="text-xs text-white/90">Coordinamos fecha y hora</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">2</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center justify-end mb-2">
                    <div className="mr-3">
                      <h4 className="font-semibold text-sm">Entrega Profesional</h4>
                      <p className="text-xs text-white/90">Despacho especializado</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <button 
              onClick={() => setIsDispatchCalendarOpen(true)}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Coordinar mi Despacho
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-gray-800 mb-6 tracking-wide">¿Por qué elegir <span className="font-semibold">OBRAEXPRESS</span>?</h2>
            <div className="w-24 h-0.5 bg-blue-600 mx-auto mb-6"></div>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">Excelencia en materiales de construcción respaldada por tecnología avanzada y un compromiso inquebrantable con la calidad</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            
            {/* Calidad Premium */}
            <div className="group">
              <div className="bg-gray-50 h-1 w-full mb-8 relative">
                <div className="absolute left-0 top-0 h-1 w-16 bg-blue-600 transition-all duration-500 group-hover:w-full"></div>
              </div>
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-600 bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Calidad Certificada</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Protección UV garantizada por 10 años con certificaciones ISO 9001, CE y ECO que aseguran la máxima calidad y durabilidad.</p>
              </div>
            </div>
            
            {/* Tecnología Avanzada */}
            <div className="group">
              <div className="bg-gray-50 h-1 w-full mb-8 relative">
                <div className="absolute left-0 top-0 h-1 w-16 bg-blue-600 transition-all duration-500 group-hover:w-full"></div>
              </div>
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-600 bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Inteligencia Artificial</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Cotizador inteligente y logística GPS de última generación para una experiencia de compra optimizada y entregas precisas.</p>
              </div>
            </div>
            
            {/* Fabricación Nacional */}
            <div className="group">
              <div className="bg-gray-50 h-1 w-full mb-8 relative">
                <div className="absolute left-0 top-0 h-1 w-16 bg-blue-600 transition-all duration-500 group-hover:w-full"></div>
              </div>
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-600 bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Fabricación Nacional</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Productos fabricados en Chile con rigurosos controles de calidad y respaldo local para tiempos de entrega optimizados.</p>
              </div>
            </div>
            
            {/* Soporte Profesional */}
            <div className="group">
              <div className="bg-gray-50 h-1 w-full mb-8 relative">
                <div className="absolute left-0 top-0 h-1 w-16 bg-blue-600 transition-all duration-500 group-hover:w-full"></div>
              </div>
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-600 bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Soporte Especializado</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Equipo de ingenieros especializados disponible 24/7 para asesoría técnica profesional y soporte integral.</p>
              </div>
            </div>
            
            {/* Entregas Rápidas */}
            <div className="group">
              <div className="bg-gray-50 h-1 w-full mb-8 relative">
                <div className="absolute left-0 top-0 h-1 w-16 bg-blue-600 transition-all duration-500 group-hover:w-full"></div>
              </div>
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-600 bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Entregas Coordinadas</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Sistema de logística inteligente con seguimiento GPS en tiempo real. Entregas en 24-48 horas en áreas metropolitanas.</p>
              </div>
            </div>
            
            {/* Experiencia */}
            <div className="group">
              <div className="bg-gray-50 h-1 w-full mb-8 relative">
                <div className="absolute left-0 top-0 h-1 w-16 bg-blue-600 transition-all duration-500 group-hover:w-full"></div>
              </div>
              <div className="mb-6">
                <div className="w-12 h-12 bg-blue-600 bg-opacity-10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Experiencia Comprobada</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Años de experiencia en el sector de la construcción, con miles de proyectos exitosos y clientes satisfechos a nivel nacional.</p>
              </div>
            </div>
          </div>
          
          {/* CTA Section */}
          <div className="text-center mt-20">
            <div className="border border-gray-200 rounded-lg p-12 bg-gray-50">
              <h3 className="text-2xl font-light text-gray-800 mb-4">Soluciones profesionales para su proyecto</h3>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Descubra por qué constructoras y profesionales confían en OBRAEXPRESS para sus proyectos más exigentes</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-600 text-white px-8 py-3 rounded font-medium hover:bg-blue-700 transition-colors">
                  Ver Catálogo
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded font-medium hover:bg-gray-100 transition-colors">
                  Solicitar Cotización
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-white text-gray-600 py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8 mb-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">OBRAEXPRESS</h2>
                <p className="text-sm text-gray-600">Materiales de construcción</p>
              </div>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed max-w-sm">
                Plataforma especializada en materiales de construcción que desarrolladores y equipos de obra necesitan. Especialistas en policarbonato y soluciones constructivas innovadoras.
              </p>
              
              {/* Social Icons */}
              <div className="flex space-x-3 mb-6">
                <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
              
              {/* Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">GPS logística de vanguardia</span>
              </div>
            </div>
            
            {/* Products */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Productos</h3>
              <ul className="space-y-3">
                <li><a href="/productos?categoria=Policarbonato Alveolar" className="text-sm hover:text-blue-600 transition-colors">Policarbonato Alveolar</a></li>
                <li><a href="/productos?categoria=Policarbonato Ondulado" className="text-sm hover:text-blue-600 transition-colors">Policarbonato Ondulado</a></li>
                <li><a href="/productos?categoria=Policarbonato Compacto" className="text-sm hover:text-blue-600 transition-colors">Policarbonato Compacto</a></li>
                <li><a href="/productos?categoria=Rollos" className="text-sm hover:text-blue-600 transition-colors">Rollos</a></li>
                <li><a href="/productos?categoria=Perfiles y Accesorios" className="text-sm hover:text-blue-600 transition-colors">Perfiles y Accesorios</a></li>
                <li><a href="/productos?categoria=Pinturas" className="text-sm hover:text-blue-600 transition-colors">Pinturas y Selladores</a></li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Empresa</h3>
              <ul className="space-y-3">
                <li><Link href="/nosotros" className="text-sm hover:text-blue-600 transition-colors">Acerca de OBRAEXPRESS</Link></li>
                <li><Link href="/productos" className="text-sm hover:text-blue-600 transition-colors">Catálogo</Link></li>
                <li><Link href="/contacto" className="text-sm hover:text-blue-600 transition-colors">Contacto</Link></li>
                <li><Link href="/cotizador-detallado" className="text-sm hover:text-blue-600 transition-colors">Cotizador IA</Link></li>
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Trabaja con nosotros</span></li>
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Solicitar Features</span></li>
              </ul>
            </div>
            
            {/* Partner with us */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Asociarse con nosotros</h3>
              <ul className="space-y-3">
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Ser Distribuidor</span></li>
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Programa de Afiliados</span></li>
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Inversionistas</span></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Soporte</h3>
              <ul className="space-y-3">
                <li><span className="text-sm text-gray-400 cursor-not-allowed">Documentación</span></li>
                <li><a href="/contacto" className="text-sm hover:text-blue-600 transition-colors">Contacto</a></li>
              </ul>
              
              {/* Quality Rating */}
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">Calidad</h3>
                <div className="flex items-center space-x-1 mb-2">
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <p className="text-xs text-gray-600">Máxima calidad</p>
                
                {/* Certifications in one line */}
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Certificaciones</h4>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="bg-gray-200 text-white px-2 py-1 rounded font-medium">UV 10</span>
                    <span className="bg-gray-200 text-white px-2 py-1 rounded font-medium">ISO 9001</span>
                    <span className="bg-gray-200 text-white px-2 py-1 rounded font-medium">CE</span>
                    <span className="bg-gray-200 text-white px-2 py-1 rounded font-medium">ECO</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sitemap */}
            <div className="lg:col-span-6 mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Mapa del Sitio</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Principales</h4>
                  <ul className="space-y-0.5">
                    <li><Link href="/" className="text-gray-600 hover:text-blue-600">Inicio</Link></li>
                    <li><Link href="/productos" className="text-gray-600 hover:text-blue-600">Productos</Link></li>
                    <li><Link href="/nosotros" className="text-gray-600 hover:text-blue-600">Nosotros</Link></li>
                    <li><Link href="/contacto" className="text-gray-600 hover:text-blue-600">Contacto</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">IA & Herramientas</h4>
                  <ul className="space-y-0.5">
                    <li><a href="/cotizador-detallado" className="text-gray-600 hover:text-blue-600">Cotizador IA</a></li>
                    <li><a href="/calculadora" className="text-gray-600 hover:text-blue-600">Calculadora</a></li>
                    <li><span className="text-gray-400">Asistente IA</span></li>
                    <li><span className="text-gray-400">Simulador 3D</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Categorías</h4>
                  <ul className="space-y-0.5">
                    <li><a href="/productos?categoria=Policarbonato Alveolar" className="text-gray-600 hover:text-blue-600">Alveolar</a></li>
                    <li><a href="/productos?categoria=Policarbonato Compacto" className="text-gray-600 hover:text-blue-600">Compacto</a></li>
                    <li><a href="/productos?categoria=Policarbonato Ondulado" className="text-gray-600 hover:text-blue-600">Ondulado</a></li>
                    <li><a href="/productos?categoria=Perfiles y Accesorios" className="text-gray-600 hover:text-blue-600">Accesorios</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Soporte IA</h4>
                  <ul className="space-y-0.5">
                    <li><button className="text-gray-600 hover:text-blue-600 text-left" onClick={() => window.open('/chat-ai', '_blank')}>Guía IA</button></li>
                    <li><a href="/preguntas-frecuentes" className="text-gray-600 hover:text-blue-600">FAQ</a></li>
                    <li><span className="text-gray-400">Documentación</span></li>
                    <li><a href="/contacto" className="text-gray-600 hover:text-blue-600">Contacto</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">Legal</h4>
                  <ul className="space-y-0.5">
                    <li><Link href="/politica-privacidad" className="text-gray-600 hover:text-blue-600">Privacidad</Link></li>
                    <li><Link href="/terminos-condiciones" className="text-gray-600 hover:text-blue-600">Términos</Link></li>
                    <li><Link href="/politica-cookies" className="text-gray-600 hover:text-blue-600">Cookies</Link></li>
                    <li><span className="text-gray-400">Devoluciones</span></li>
                  </ul>
                </div>
              </div>
              
              {/* Advanced Tech Note */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic flex items-center space-x-2">
                  <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Plataforma con IA de vanguardia • Logística inteligente • Tecnología de última generación</span>
                </p>
              </div>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm mb-4 md:mb-0">
                © 2024 OBRAEXPRESS — LinearBytes Inc.
              </p>
              <div className="flex space-x-6 text-sm">
                <Link href="/politica-privacidad" className="text-gray-500 hover:text-blue-600 transition-colors">Política de Privacidad</Link>
                <Link href="/terminos-condiciones" className="text-gray-500 hover:text-blue-600 transition-colors">Términos</Link>
                <Link href="/politica-cookies" className="text-gray-500 hover:text-blue-600 transition-colors">Cookies</Link>
                <a href="/admin" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors text-xs opacity-50 hover:opacity-100">acceso administrativo</a>
              </div>
            </div>
          </div>
        </div>
      </footer>



      {/* Chatbot */}
      {/* <Chatbot /> */}

      {/* Modal de Descarga de Catálogos */}
      <CatalogoDownloadModal 
        isOpen={isCatalogoModalOpen}
        onClose={() => setIsCatalogoModalOpen(false)}
      />

      {/* Modal de Calendario de Despacho */}
      <DispatchCalendarModal
        isOpen={isDispatchCalendarOpen}
        onClose={() => setIsDispatchCalendarOpen(false)}
        productType="Policarbonato"
        onDateSelect={handleDispatchDateSelect}
      />

      {/* Modal de Detalle de Proyecto - Diseño Innovador */}
      {isProjectModalOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Fondo difuso - igual que el chatbot */}
          <div 
            className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-300"
            onClick={closeProjectModal}
          />
          
          {/* Modal Content - Diseño Adaptivo para la Imagen */}
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-6xl w-full max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Botón cerrar - posición fija */}
            <button
              onClick={closeProjectModal}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group"
            >
              <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Layout Adaptivo - Imagen como protagonista */}
            <div className="flex flex-col lg:flex-row min-h-[70vh]">
              
              {/* Sección de Imagen - PROTAGONISTA */}
              <div className="flex-1 lg:flex-[2] relative bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                <Image 
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  width={800}
                  height={600}
                />
                
                {/* Badge de categoría sobre la imagen */}
                <div className="absolute top-6 left-6">
                  <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                    <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">
                      {selectedProject.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sección de Información - Compacta con transparencia */}
              <div className="flex-1 lg:max-w-md p-6 overflow-y-auto bg-white/90 backdrop-blur-sm">
                
                {/* Título y descripción */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                    {selectedProject.title}
                  </h2>
                  <p className="text-gray-600 text-base leading-relaxed">
                    {selectedProject.description}
                  </p>
                </div>

                {/* Especificaciones Técnicas - Compactas */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Especificaciones
                  </h3>
                  
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    {Object.entries(selectedProject.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize font-medium text-sm">
                          {key === 'ubicacion' ? 'Ubicación' : 
                           key === 'garantia' ? 'Garantía' : 
                           key === 'tiempo' ? 'Desarrollo' : key}:
                        </span>
                        <span className="text-gray-900 font-semibold text-sm">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Características - Tags compactos */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Características</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.features.map((feature, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Proceso de Trabajo - Versión compacta */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    Proceso
                  </h3>
                  
                  <div className="space-y-3">
                    {selectedProject.process.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-gray-800 text-sm leading-relaxed">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Análisis IA - Se muestra cuando está disponible */}
                {aiAnalysis && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M12 18V5"/>
                          <path d="M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"/>
                          <path d="M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"/>
                          <path d="M17.997 5.125a4 4 0 0 1 2.526 5.77"/>
                          <path d="M18 18a4 4 0 0 0 2-7.464"/>
                          <path d="M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"/>
                          <path d="M6 18a4 4 0 0 1-2-7.464"/>
                          <path d="M6.003 5.125a4 4 0 0 0-2.526 5.77"/>
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-blue-900">Análisis IA</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-white/80 rounded-lg p-3">
                        <h5 className="font-semibold text-gray-900 mb-2">Materiales Incluidos:</h5>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          {aiAnalysis.projectAnalysis.materials.map((material, index) => (
                            <div key={material.id} className="flex justify-between">
                              <span className="text-gray-600">{material.name}:</span>
                              <span className="font-medium">{material.quantity} {material.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => setShowProductModal(true)}
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M16 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        Ver Productos Recomendados
                      </button>
                    </div>
                  </div>
                )}

                {/* Call to Action */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => analyzeProjectWithAI(selectedProject)}
                      disabled={isAIAnalyzing}
                      className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {isAIAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Analizando con IA...
                        </>
                      ) : (
                        <>
                          Solicitar Cotización Similar
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => showProjectProducts(selectedProject)}
                      className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      Ver Productos Específicos
                    </button>
                  </div>
                  <p className="text-center text-gray-600 text-xs mt-3">
                    ¿Te gustó este proyecto? Podemos crear algo similar para ti
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Productos Específicos */}
      {showProductModal && aiAnalysis && (
        <>
          {/* Ocultar componentes flotantes cuando el modal está abierto */}
          <style jsx global>{`
            .floating-cart-container,
            .chatbot-container,
            [data-testid="floating-cart"],
            [data-testid="chatbot"] {
              display: none !important;
            }
          `}</style>
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Fondo difuso */}
          <div 
            className="absolute inset-0 bg-gray-500/90 backdrop-blur-lg transition-opacity duration-300"
            onClick={() => setShowProductModal(false)}
          />
          
          {/* Modal Content - Productos */}
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-gray-800 p-6 text-white">
              <button
                onClick={() => setShowProductModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold">
                  {aiAnalysis.projectBundle ? 'Proyecto Completo Calculado por IA' : 'Productos Recomendados por IA'}
                </h3>
              </div>
              <p className="text-gray-300">Basado en el análisis del proyecto: {selectedProject?.title}</p>
            </div>

            {/* Contenido scrollable */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              
              {/* Mensaje de confirmación dentro del modal */}
              {showToast && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-green-800 font-semibold text-sm">{toastMessage}</p>
                  </div>
                  <button 
                    onClick={() => setShowToast(false)}
                    className="text-green-600 hover:text-green-800 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Resumen del análisis */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75" />
                  </svg>
                  Resumen del Análisis
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Área Total:</span>
                    <span className="font-semibold ml-2">{aiAnalysis.projectAnalysis.totalArea}m²</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Material:</span>
                    <span className="font-semibold ml-2">{aiAnalysis.projectAnalysis.materialType}</span>
                  </div>
                  {aiAnalysis.projectBundle ? (
                    <>
                      <div>
                        <span className="text-gray-600">Tipo de venta:</span>
                        <span className="font-semibold ml-2 text-purple-600">Proyecto completo</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Materiales incluidos:</span>
                        <span className="font-semibold ml-2 text-green-600">{aiAnalysis.projectBundle.materials.length} materiales</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Descuento por proyecto completo:</span>
                        <span className="font-semibold ml-2 text-green-600">
                          {aiAnalysis.projectAnalysis.pricing.porcentajeDescuento}% 
                          ($-{aiAnalysis.projectAnalysis.pricing.descuento.toLocaleString()})
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-gray-600">Productos recomendados:</span>
                        <span className="font-semibold ml-2 text-purple-600">{aiAnalysis.recommendedProducts?.length || 0} productos</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tiempo estimado de entrega:</span>
                        <span className="font-semibold ml-2 text-blue-600">5-7 días hábiles</span>
                      </div>
                    </>
                  )}
                </div>
                  <div className="col-span-2 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 font-medium">Fecha de despacho para todos los productos:</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Fecha más próxima disponible
                        </span>
                        <select className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                          <option value="28-agosto-2025">Jueves 28 Agosto 2025 (Próxima)</option>
                          <option value="04-septiembre-2025">Jueves 4 Septiembre 2025</option>
                          <option value="11-septiembre-2025">Jueves 11 Septiembre 2025</option>
                          <option value="18-septiembre-2025">Jueves 18 Septiembre 2025</option>
                          <option value="25-septiembre-2025">Jueves 25 Septiembre 2025</option>
                          <option value="02-octubre-2025">Jueves 2 Octubre 2025</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-right flex items-center justify-end gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                      </svg>
                      Despachos únicamente los jueves de 9:00 a 18:00 hrs
                    </p>
                  </div>
                </div>
              </div>

              {/* Proyecto completo o lista de productos */}
              {aiAnalysis.projectBundle ? (
                /* Mostrar proyecto completo */
                <div className="space-y-6">
                  {/* Información del proyecto */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{aiAnalysis.projectBundle.name}</h4>
                        <p className="text-gray-600 mb-4">{aiAnalysis.projectBundle.description}</p>
                        
                        {/* Beneficios del proyecto */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                          {aiAnalysis.projectAnalysis.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-gray-700">{benefit}</span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Tiempo de entrega: {aiAnalysis.projectBundle.deliveryTime}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Materiales incluidos */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Materiales Incluidos en el Proyecto
                    </h5>
                    
                    <div className="space-y-3">
                      {aiAnalysis.projectAnalysis.materials.map((material, index) => (
                        <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h6 className="font-medium text-gray-900">{material.name}</h6>
                            <p className="text-sm text-gray-600">{material.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{material.quantity} {material.unit}</div>
                            <div className="text-sm text-gray-600">${material.totalPrice.toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Precio del proyecto */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-green-900 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          Precio del Proyecto Completo
                        </h4>
                        <p className="text-sm text-green-700">Desarrollo completo sin instalación</p>
                      </div>
                      <button 
                        onClick={() => addProjectToCart(aiAnalysis.projectBundle)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M16 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        Agregar Proyecto al Carrito
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-sm text-gray-600">Subtotal materiales</div>
                        <div className="text-lg font-semibold text-gray-900">${aiAnalysis.projectBundle.originalPrice.toLocaleString()}</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-sm text-gray-600">Descuento proyecto</div>
                        <div className="text-lg font-semibold text-red-600">-${aiAnalysis.projectBundle.discount.toLocaleString()}</div>
                        <div className="text-xs text-red-600">({aiAnalysis.projectBundle.discountPercentage}% desc.)</div>
                      </div>
                      <div className="text-center p-3 bg-green-100 rounded-lg border-2 border-green-300">
                        <div className="text-sm text-green-700 font-medium">TOTAL PROYECTO</div>
                        <div className="text-2xl font-bold text-green-700">${aiAnalysis.projectBundle.totalPrice.toLocaleString()}</div>
                        <div className="text-xs text-green-600">Ahorro: ${aiAnalysis.projectBundle.discount.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Mostrar productos individuales */
                <div className="space-y-4">
                  {(aiAnalysis.recommendedProducts || []).map((product, index) => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      
                      {/* Imagen del producto */}
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                        <Image 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                          width={96}
                          height={96}
                        />
                      </div>

                      {/* Info del producto */}
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-gray-900 text-lg mb-1">{product.name}</h5>
                        <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                        
                        {/* Características */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.features.map((feature, fIndex) => (
                            <span key={fIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>

                        {/* Precio, cantidad y entrega */}
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <div className="text-2xl font-bold text-green-600">
                              ${product.price.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">por {product.unit}</div>
                            <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Entrega: {product.deliveryTime}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Cantidad sugerida:</div>
                              <div className="font-semibold text-lg">{product.quantity} {product.unit}s</div>
                            </div>
                            
                            <button 
                              onClick={() => addAIProductToCart(product)}
                              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M16 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                              </svg>
                              Agregar al Carrito
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                  
                  {/* Total estimado para productos individuales */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-900 flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                          </svg>
                          Costo Total Estimado
                        </h4>
                        <p className="text-sm text-green-700">Incluye materiales principales</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          ${(aiAnalysis.recommendedProducts || []).reduce((total, product) => 
                            total + (product.price * product.quantity), 0
                          ).toLocaleString()}
                        </div>
                        <div className="text-sm text-green-600">Total estimado</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con acciones - Solo para productos individuales */}
            {!aiAnalysis.projectBundle && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex gap-3">
                  <button 
                    onClick={addAllAIProductsToCart}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M16 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    Agregar Todos al Carrito
                  </button>
                  <button className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 3.75v4.5m0-4.5h-4.5m4.5 0-6 6m3 12c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z" />
                    </svg>
                    Solicitar Asesoría
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando página principal...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
