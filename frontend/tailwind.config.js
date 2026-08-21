/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Aquí definimos las dos nuevas fuentes
        'titulo': ['"Love Ya Like A Sister"', 'cursive'], // Para los títulos
        'cuerpo': ['"Shantell Sans"', 'sans-serif'],      // Para el texto normal
      },
    },
  },
  plugins: [],
};