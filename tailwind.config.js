/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))',
  				hover: 'hsl(var(--primary-hover))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			mono: ['var(--font-mono)']
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-up': {
  				from: { opacity: '0', transform: 'translateY(24px)' },
  				to: { opacity: '1', transform: 'translateY(0)' }
  			},
  			'fade-in': {
  				from: { opacity: '0' },
  				to: { opacity: '1' }
  			},
  			'float': {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-12px)' }
  			},
  			'float-slow': {
  				'0%, 100%': { transform: 'translateY(0) translateX(0)' },
  				'50%': { transform: 'translateY(-18px) translateX(10px)' }
  			},
  			'marquee': {
  				from: { transform: 'translateX(0)' },
  				to: { transform: 'translateX(-50%)' }
  			},
  			'marquee-vertical': {
  				from: { transform: 'translateY(0)' },
  				to: { transform: 'translateY(-50%)' }
  			},
  			'shimmer': {
  				'100%': { transform: 'translateX(100%)' }
  			},
  			'grow-bar': {
  				from: { transform: 'scaleY(0)' },
  				to: { transform: 'scaleY(1)' }
  			},
  			'bar-wave': {
  				'0%, 100%': { transform: 'scaleY(0.55)' },
  				'50%': { transform: 'scaleY(1)' }
  			},
  			'pulse-ring': {
  				'0%': { transform: 'scale(0.9)', opacity: '0.6' },
  				'80%, 100%': { transform: 'scale(1.6)', opacity: '0' }
  			},
  			'splash-pop': {
  				'0%': { opacity: '0', transform: 'scale(0.82)' },
  				'100%': { opacity: '1', transform: 'scale(1)' }
  			},
  			'splash-out': {
  				'0%': { opacity: '1' },
  				'100%': { opacity: '0' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-up': 'fade-up 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
  			'fade-in': 'fade-in 0.9s ease-out both',
  			'float': 'float 6s ease-in-out infinite',
  			'float-slow': 'float-slow 9s ease-in-out infinite',
  			'marquee': 'marquee 28s linear infinite',
  			'marquee-vertical': 'marquee-vertical 36s linear infinite',
  			'grow-bar': 'grow-bar 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
  			'bar-wave': 'bar-wave 2.6s ease-in-out infinite',
  			'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite',
  			'splash-pop': 'splash-pop 0.55s cubic-bezier(0.16, 1, 0.3, 1) both',
  			'splash-out': 'splash-out 0.4s ease-in both'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
