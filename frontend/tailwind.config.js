/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Safelist: las páginas dinámicas (seed/editor) viven en la base de datos, NO
  // en el código fuente, por lo que Tailwind no las escanea y purgaría sus
  // clases de color en la web pública. Este safelist garantiza que las clases
  // de color de la paleta segura SIEMPRE se generen, para que el contenido
  // dinámico se vea igual en el editor y en público.
  safelist: [
    {
      pattern: /^(bg|text|border|from|via|to|ring|divide|placeholder)-(slate|gray|zinc|neutral|stone|blue|sky|cyan|indigo|teal|green|emerald|lime|red|rose|orange|amber|yellow|purple)-(50|100|200|300|400|500|600|700|800|900)$/,
      variants: ['hover', 'focus', 'sm', 'md', 'lg'],
    },
    {
      pattern: /^(bg|text|border)-(white|black|transparent)$/,
      variants: ['hover', 'focus'],
    },
    {
      pattern: /^(bg|text|border|from|via|to)-(primary|secondary|accent)-(50|100|200|300|400|500|600|700|800|900)$/,
      variants: ['hover', 'focus'],
    },
  ],
  theme: {
    extend: {
      colors: {
        // Colores del Acueducto Municipal - Azules para agua
        primary: {
          50: '#e6f3ff',
          100: '#b3d9ff',
          200: '#80bfff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0066cc', // Azul principal del agua
          600: '#0052a3',
          700: '#003d7a',
          800: '#002952',
          900: '#001429',
        },
        // Colores secundarios - Verdes para naturaleza/medio ambiente
        secondary: {
          50: '#e8f5e8',
          100: '#c8e6c8',
          200: '#a8d8a8',
          300: '#88c988',
          400: '#68bb68',
          500: '#2e7d32', // Verde principal
          600: '#1b5e20',
          700: '#0d4e14',
          800: '#003d0a',
          900: '#002d05',
        },
        // Colores de acento - Celeste para complementar
        accent: {
          50: '#e0f7fa',
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4dd0e1',
          400: '#26c6da',
          500: '#00bcd4', // Celeste agua
          600: '#00acc1',
          700: '#0097a7',
          800: '#00838f',
          900: '#006064',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
  },
  plugins: [],
};
