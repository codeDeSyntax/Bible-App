/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
       

        // Bible Studio Theme System - Auto-switching
        studio: {
          bg: "var(--studio-bg)",
        },
        card: {
          bg: "var(--card-bg)",
          "bg-alt": "var(--card-bg-alt)",
        },
        "header-gradient": {
          from: "var(--header-gradient-from)",
          to: "var(--header-gradient-to)",
        },
        "btn-active": {
          from: "var(--btn-active-from)",
          to: "var(--btn-active-to)",
        },
        "btn-normal": {
          from: "var(--btn-normal-from)",
          to: "var(--btn-normal-to)",
        },
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "select-bg": "var(--select-bg)",
        "select-bg-alt": "var(--select-bg-alt)",
        "select-hover": "var(--select-hover)",
        "select-border": "var(--select-border)",
        "select-border-hover": "var(--select-border-hover)",
        "focus-border": "var(--focus-border)",
        "kbd-bg": "var(--kbd-bg)",
      },
      fontFamily: {
        anton: ['"Anton SC"', "sans-serif"],
        bitter: ['"Bitter Thin"', "sans-serif"],
        oswald: ['"Oswald ExtraLight"', "sans-serif"],
        teko: ['"Teko Light"', "sans-serif"],
        LTFuzz: ['"LTFuzz"', "sans-serif"],
        ThePriest: ['"thepriest"', "sans-serif"],
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".no-scrollbar": {
          "-ms-overflow-style": "none", // IE and Edge
          "scrollbar-width": "none", // Firefox
        },
        ".no-scrollbar::-webkit-scrollbar": {
          display: "none", // Chrome, Safari, Opera
        },
        ".thin-scrollbar": {
          "scrollbar-width": "thin",
          "&::-webkit-scrollbar": {
            width: "6px", // Adjust width as needed
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#5ECFFF", // Optional: Customize the scrollbar color
          },
        },
      });
    },
  ],
};
