/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Configuración optimizada para producción
  purge: {
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
      './public/**/*.html',
    ],
    options: {
      safelist: [
        // Preservar clases dinámicas importantes
        /^bg-(red|green|blue|yellow|emerald|gray)-(100|200|300|400|500|600|700|800|900)$/,
        /^text-(red|green|blue|yellow|emerald|gray)-(100|200|300|400|500|600|700|800|900)$/,
        /^border-(red|green|blue|yellow|emerald|gray)-(100|200|300|400|500|600|700|800|900)$/,
        'animate-pulse',
        'animate-spin',
        'animate-bounce',
      ],
    },
  },
  theme: {
    extend: {
      fontFamily: {
        'poppins': ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
        // Breakpoint específico para laptops de 13 pulgadas
        'laptop-13': '1280px',
        // Breakpoint para laptops pequeños (13.3" - 14")
        'laptop-sm': '1366px',
        // Breakpoint estándar para laptops grandes
        'laptop': '1440px',
        // Breakpoint para monitores 2K
        '2k': '1920px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '100': '25rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
      },
      fontSize: {
        'xxs': '0.625rem',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
          xl: '5rem',
          '2xl': '6rem',
        },
      },
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('daisyui'),
    // Plugin personalizado para utilidades específicas de laptop 13" y móviles
    function({ addUtilities }) {
      const laptopUtilities = {
        '.laptop-13-grid-compact': {
          '@screen laptop-13': {
            gap: '1rem',
            padding: '1rem',
          },
        },
        '.laptop-13-spacing-compact': {
          '@screen laptop-13': {
            paddingTop: '2rem',
            paddingBottom: '2rem',
            marginTop: '1.5rem',
            marginBottom: '1.5rem',
          },
        },
        '.laptop-13-text-compact': {
          '@screen laptop-13': {
            fontSize: '0.9rem',
            lineHeight: '1.4',
          },
        },
      }
      
      // Utilidades específicas para móviles
      const mobileUtilities = {
        '.touch-target': {
          minHeight: '44px',
          minWidth: '44px',
          '@media (pointer: coarse)': {
            minHeight: '48px',
            minWidth: '48px',
          },
        },
        '.btn-touch': {
          padding: '12px 16px',
          fontSize: '16px',
          lineHeight: '1.5',
          borderRadius: '8px',
          '@media (max-width: 640px)': {
            padding: '14px 18px',
            fontSize: '16px',
          },
        },
        '.btn-mobile': {
          '@media (max-width: 640px)': {
            fontSize: '16px',
            padding: '12px 16px',
          },
        },
        '.btn-mobile-md': {
          '@media (max-width: 768px)': {
            fontSize: '15px',
            padding: '10px 14px',
          },
        },
        '.btn-group-mobile': {
          '@media (max-width: 640px)': {
            flexDirection: 'column',
            gap: '8px',
          },
        },
        '.btn-group-mobile-md': {
          '@media (max-width: 768px)': {
            gap: '6px',
          },
        },
        '.product-card-mobile': {
          '@media (max-width: 640px)': {
            maxWidth: '100%',
            margin: '0 auto',
          },
        },
        '.product-card-mobile-md': {
          '@media (max-width: 768px)': {
            maxWidth: '400px',
          },
        },
        '.product-card-tablet': {
          '@media (max-width: 1024px)': {
            maxWidth: '350px',
          },
        },
        '.product-image': {
          '@media (max-width: 640px)': {
            height: '200px',
          },
        },
        '.img-mobile': {
          '@media (max-width: 640px)': {
            height: '180px',
          },
        },
        '.form-input-mobile': {
          '@media (max-width: 640px)': {
            fontSize: '16px',
            padding: '14px 16px',
            borderRadius: '8px',
          },
        },
        '.form-label-mobile': {
          '@media (max-width: 640px)': {
            fontSize: '15px',
            fontWeight: '600',
            marginBottom: '8px',
          },
        },
        '.mobile-spacing': {
          '@media (max-width: 640px)': {
            padding: '16px',
            gap: '16px',
          },
        },
        '.mobile-text': {
          '@media (max-width: 640px)': {
            fontSize: '14px',
            lineHeight: '1.5',
          },
        },
        '.mobile-grid': {
          '@media (max-width: 640px)': {
            gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
            gap: '16px',
          },
        },
      }
      
      addUtilities({ ...laptopUtilities, ...mobileUtilities })
    }
  ],
}