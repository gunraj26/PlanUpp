import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // PlanUpp design system
        planupp: {
          brown: "#9c8170",
          beige: "#f5efe6",
          button: "#c3b091",
          text: "#5c4033",
          green: "#8a9a5b",
          background: "#e8d5c4",
          secondaryText: "#333333",
          lightGray: "#e0d0c1",
          // Chat specific colors
          messageBg: "#c3b091",
          messageText: "#5c4033",
          chatBg: "#f5efe6",
          linkBlue: "#3b82f6",
          warningRed: "#ef4444",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // PlanUpp specific border radius
        card: "0.75rem",
        button: "9999px",
        formTop: "40px",
      },
      spacing: {
        // PlanUpp specific spacing
        container: "1rem",
        element: "0.5rem",
      },
      typography: {
        // PlanUpp typography
        fontFamily: {
          sans: ["Inter", "sans-serif"],
        },
        fontSize: {
          // Heading sizes
          "heading-large": "1.875rem",
          "heading-medium": "1.5rem",
          "heading-small": "1.25rem",
          // Body sizes
          "body-regular": "1rem",
          "body-small": "0.875rem",
        },
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config

