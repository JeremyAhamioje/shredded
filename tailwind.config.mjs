/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      gridTemplateColumns:{
        'auto': 'repeat(auto-fit, minmax(200px, 1fr))'
      },
      keyframes: {
        heartbeat: {
          '0%, 40%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.25)' },
          '30%': { transform: 'scale(1.05)' },
        },
        likepop: {
          '0%': { transform: 'scale(0) rotate(-15deg)', opacity: '0' },
          '60%': { transform: 'scale(1.25) rotate(6deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        floatheart: {
          '0%': { transform: 'translateY(0) scale(0.6)', opacity: '0' },
          '25%': { opacity: '1' },
          '100%': { transform: 'translateY(-42px) scale(1)', opacity: '0' },
        },
      },
      animation: {
        heartbeat: 'heartbeat 1.6s ease-in-out infinite',
        likepop: 'likepop 0.4s ease-out',
        floatheart: 'floatheart 0.9s ease-out forwards',
      },
    },
  },
  plugins: [],
};
