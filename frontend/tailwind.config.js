/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F3F1",
        surface: "#FFFFFF",
        ink: "#241317",
        navy: {
          DEFAULT: "#5C1422",
          light: "#73192C",
          dark: "#3E0D17",
        },
        amber: {
          DEFAULT: "#C2770C",
          light: "#E3A94F",
        },
        brand: {
          DEFAULT: "#C2293D",
          dark: "#9E1F30",
        },
        link: "#9E1F30",
        success: "#2F7A4D",
        danger: "#C2412D",
        line: "#ECE0DE",
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
        sans: ["Rubik", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
