/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F4EF",
        surface: "#FFFFFF",
        ink: "#0E1318",
        navy: {
          DEFAULT: "#0E1318",
          light: "#1C2530",
          dark: "#07090C",
        },
        amber: {
          DEFAULT: "#FF8E28",
          light: "#FFB061",
        },
        brand: {
          DEFAULT: "#FF8E28",
          dark: "#E67A12",
        },
        link: "#E67A12",
        success: "#2F7A4D",
        danger: "#C2412D",
        line: "#ECE6DD",
      },
      fontFamily: {
        display: ["Poppins", "system-ui", "sans-serif"],
        sans: ["Rubik", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
