import flowbite from "flowbite-react/tailwind";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", flowbite.content()],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "80rem",
      },
      colors: {
        brand: {
          primary: "rgb(var(--color-primary) / <alpha-value>)",
          "primary-dark": "rgb(var(--color-primary-dark) / <alpha-value>)",
          secondary: "rgb(var(--color-secondary) / <alpha-value>)",
          accent: "rgb(var(--color-accent) / <alpha-value>)",
        },
        surface: {
          muted: "rgb(var(--color-gray-50) / <alpha-value>)",
          DEFAULT: "rgb(var(--color-gray-100) / <alpha-value>)",
        },
        foreground: {
          DEFAULT: "rgb(var(--color-gray-900) / <alpha-value>)",
          muted: "rgb(var(--color-gray-600) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [flowbite.plugin()],
};
