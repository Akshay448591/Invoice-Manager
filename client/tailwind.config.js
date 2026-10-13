/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['"DM Sans"', 'system-ui', 'sans-serif'] },
      borderRadius: { card: '18px' },
      colors: {
        ink: '#241a4a',      // headings, body text
        slate2: '#6d6590',   // secondary text
        mist: '#f4efff',     // page background
        canvas: '#fbf9ff',   // soft panels
        line: '#e3dbf7',     // borders
        soft: '#e9e3ff',     // selected / tinted fills
        brand: '#5b3df5',    // primary
        brandDark: '#4a2fd0',
        amber2: '#a85d00',   // pending
        rose2: '#d02f5b',    // overdue / destructive
        ok: '#0f8a5f',       // paid / success
      },
    },
  },
  plugins: [],
};
