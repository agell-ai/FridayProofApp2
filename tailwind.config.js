/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'gradient-orange': 'rgb(255 111 60)',
        'gradient-pink': 'rgb(255 60 119)',
        'gradient-red': 'rgb(255 60 60)',
        'gradient-fuchsia': 'rgb(201 60 255)',
        'gradient-purple': 'rgb(107 60 255)',
        'charcoal': 'rgb(31 31 31)',
        'light-gray': 'rgb(245 245 245)',
        'glass-light': 'rgba(255, 255, 255, 0.25)',
        'glass-dark': 'rgba(255, 255, 255, 0.1)',
        'glass-border-light': 'rgba(255, 255, 255, 0.18)',
        'glass-border-dark': 'rgba(255, 255, 255, 0.125)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(315deg, rgb(255 111 60) 0%, rgb(255 60 119) 30%, rgb(255 60 60) 70%, rgb(201 60 255) 95%, rgb(107 60 255) 100%)',
        'gradient-glow': 'radial-gradient(800px 400px at center, rgba(255, 111, 60, 0.3) 0%, rgba(255, 60, 119, 0.2) 25%, rgba(255, 60, 60, 0.15) 50%, rgba(201, 60, 255, 0.1) 75%, rgba(107, 60, 255, 0.05) 90%, transparent 100%)',
        'hover-glow': 'radial-gradient(400px circle at center, rgba(255, 111, 60, 0.4) 0%, rgba(255, 60, 119, 0.3) 25%, rgba(255, 60, 60, 0.2) 50%, rgba(201, 60, 255, 0.15) 75%, rgba(107, 60, 255, 0.1) 90%, transparent 100%)',
        'glass-gradient-light': 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 100%)',
        'glass-gradient-dark': 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};