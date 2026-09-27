import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          deep: 'var(--primary-deep)',
          soft: 'var(--primary-soft)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        action: {
          DEFAULT: 'var(--action)',
          foreground: 'var(--action-foreground)',
          deep: 'var(--action-deep)',
          soft: 'var(--action-soft)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          soft: 'var(--warning-soft)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          soft: 'var(--gold-soft)',
        },
        concrete: 'var(--concrete)',
        blueprint: 'var(--blueprint)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        tactile: 'var(--shadow-tactile)',
        action: 'var(--shadow-action)',
        gold: '0 4px 0 0 oklch(0.61 0.15 65)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        standard: 'var(--motion-standard)',
        slow: 'var(--motion-slow)',
      },
      zIndex: {
        header: 'var(--layer-header)',
        floating: 'var(--layer-floating-action)',
        popover: 'var(--layer-popover)',
        drawer: 'var(--layer-drawer)',
      },
    },
  },
  plugins: [],
} satisfies Config;
