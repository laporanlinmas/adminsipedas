import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        card: "var(--card)",
        text: "var(--text)",
        mid: "var(--mid)",
        muted: "var(--muted)",
        border: "var(--border)",
        blue: "var(--blue)",
        teal: "var(--teal)",
        amber: "var(--amber)",
        red: "var(--red)",
        green: "var(--green)",
        purple: "var(--purple)"
      }
    }
  },
  plugins: []
} satisfies Config;

