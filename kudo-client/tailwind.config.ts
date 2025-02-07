import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        xs: "480px",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(50px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "target-fade": {
          "0%": { borderColor: "transparent" },
          "100%": { borderColor: "#fed7aa" },
        },
      },
      animation: {
        "fade-in-1": "fade-in 0.25s ease-in-out",
        "fade-in-2": "fade-in 0.5s ease-in-out",
        "fade-in-3": "fade-in 0.75s ease-in-out",
        "fade-in-up-1": "fade-in-up 0.25s ease-in-out",
        "fade-in-up-2": "fade-in-up 0.5s ease-in-out",
        "fade-in-up-3": "fade-in-up 0.75s ease-in-out",
        "target-fade": "target-fade 1s linear",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "18": "4.5rem",
      },
      boxShadow: {
        xs: "0 1px 2px 0 #0a0d1408",
      },
      fontSize: {
        l1: [
          "1.125rem", // 18px
          {
            lineHeight: "1.75rem", // 28px
            letterSpacing: "-0.02em",
            fontWeight: "500",
          },
        ],
        l2: [
          "1rem", // 16px
          {
            lineHeight: "1.5rem", // 24px
            letterSpacing: "-0.02em",
            fontWeight: "500",
          },
        ],
        l3: [
          "0.875rem", // 14px
          {
            lineHeight: "1.25rem", // 20px
            letterSpacing: "-0.02em",
            fontWeight: "500",
          },
        ],
        l4: [
          "0.75rem", // 12px
          {
            lineHeight: "1rem", // 16px
            letterSpacing: "-0.02em",
            fontWeight: "500",
          },
        ],
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
