export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: 'selector',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: 'var(--primary)',
        'primary-foreground': 'var(--primary-foreground)',
        secondary: 'var(--secondary)',
        'secondary-foreground': 'var(--secondary-foreground)',
        muted: 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        accent: 'var(--accent)',
        'accent-foreground': 'var(--accent-foreground)',
        destructive: 'var(--destructive)',
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'chart-1': 'var(--chart-1)',
        'chart-2': 'var(--chart-2)',
        'chart-3': 'var(--chart-3)',
        'chart-4': 'var(--chart-4)',
        'chart-5': 'var(--chart-5)',
        sidebar: 'var(--sidebar)',
        'sidebar-foreground': 'var(--sidebar-foreground)',
        'sidebar-primary': 'var(--sidebar-primary)',
        'sidebar-primary-foreground': 'var(--sidebar-primary-foreground)',
        'sidebar-accent': 'var(--sidebar-accent)',
        'sidebar-accent-foreground': 'var(--sidebar-accent-foreground)',
        'sidebar-border': 'var(--sidebar-border)',
        'sidebar-ring': 'var(--sidebar-ring)',
        'destructive-foreground': 'var(--destructive-foreground)',
        ink: {
          DEFAULT: '#0B1A2C',
          900: '#0B1A2C',
          800: '#14263B',
          700: '#22364F',
          600: '#3A4D66',
          500: '#5A6B80',
          400: '#8A9BB0',
          300: '#B7C2CF',
          200: '#D5DDE6',
          100: '#E3E8EE',
          50: '#F5F7FA'
        },
        teal: {
          DEFAULT: '#0D7C74',
          900: '#073F3B',
          800: '#08504B',
          700: '#0A625C',
          600: '#0D7C74',
          500: '#14998F',
          400: '#3DB8AC',
          200: '#B3E3DC',
          100: '#D7F0EC',
          50: '#EAF6F4'
        },
        mint: '#3DD6B5',
        success: { DEFAULT: '#15803D', bg: '#E8F5EC' },
        warning: { DEFAULT: '#B45309', bg: '#FDF3E3' },
        danger: { DEFAULT: '#C0362C', bg: '#FCEBEA' },
        info: { DEFAULT: '#2563EB', bg: '#EAF0FD' }
      },
      fontFamily: {
        sans: ['Geist', '"Hind Siliguri"', 'system-ui', 'sans-serif'],
        heading: ['Geist', '"Hind Siliguri"', 'sans-serif'],
        bn: ['"Hind Siliguri"', 'Geist', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,26,44,0.04), 0 1px 1px rgba(11,26,44,0.03)',
        pop: '0 12px 32px -8px rgba(11,26,44,0.18), 0 2px 6px rgba(11,26,44,0.06)'
      }
    }
  }
}
