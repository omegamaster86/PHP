import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      display: ['Inter', 'system-ui', 'sans-serif'],
      body: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
      tiny: '.875rem',
      xs: '.75rem', // 12px
      sm: '.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem',
      xl: '1.25rem', // 20px
      '2xl': '1.5rem',
      '5xl': '3rem',
      '6xl': '4rem',
      '7xl': '5rem',
      h1: '2.35rem', // 40px
      h3: '1.25rem', // 24px
      normal: '1rem', // 16px
      small: '0.875rem', // 14px
      caption1: '0.75rem', // 12px
      caption2: '0.60rem', // 10px
    },
    colors: {
      primary: {
        '40': '#DFE7FF',
        '50': '#A6BCFF',
        '100': '#89A6FF',
        '200': '#6189FF',
        '300': '#2D61FF',
        '400': '#0039E6',
        '500': '#002288',
        '600': '#001D74',
        '700': '#001962',
        '800': '#001554',
        '900': '#001247',
      },
      gray: {
        '50': '#F5F5F5',
        '100': '#E0E0E0',
        '200': '#BDBDBD',
        '300': '#9E9E9E',
        '400': '#757575',
        '500': '#616161',
        '600': '#424242',
        '700': '#303030',
        '800': '#212121',
        '900': '#121212',
      },
      originalPrimary: '#3399FF',
      disableBg: '#F8F8F8',
      border: '#EDEDED',
      secondary: '#f59e0b',
      primaryText: '#000000',
      secondaryText: '#808080',
      white: '#FFFFFF',
      black: '#000000',
      transparent: 'transparent',
      containerBg: '#F5F5F5',
      thinContainerBg: '#FCFCFC',
      systemErrorText: '#FF4D4F',
      systemErrorBg: '#FFEEEE',
      systemWarningText: '#ECD86C',
      systemWarningBg: '#FFF7CA',
      systemLinkText: '#FF4D4F',
    },
    height: {
      '12': '3rem',
    },
    width: {
      '72': '18rem',
    },
    spacing: {
      '1': '8px',
      '2': '12px',
      '3': '16px',
      '4': '24px',
      '5': '32px',
      '6': '48px',
    },
  },
  plugins: [],
};
export default config;
