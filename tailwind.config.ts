import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05050b",
          900: "#0b0b14",
          800: "#121224",
        },
        gold: {
          400: "#e7c86a",
          500: "#d8b54d",
          600: "#be9a2b",
        },
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(231,200,106,.18), 0 0 30px rgba(231,200,106,.12)",
      },
      backgroundImage: {
        "radial-ink":
          "radial-gradient(1200px circle at 20% 0%, rgba(231, 200, 106, 0.10), transparent 55%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
