module.exports = {
  purge: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // 'false' or 'media'/'class'
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        "hero": ["'Playfair Display'", "serif"],
      },
      letterSpacing: {
        '2-wide': '0.2em'
      },
      backgroundImage: (theme) => ({
        zorb: "url('./ourZorb.png')",
      }),
      screens: {
        "2k": "2560px",
      },
      boxShadow: {
        rainbow:
          "blue 0px 0px 0px 2px inset, rgb(255, 255, 255) 10px -10px 0px -3px, rgb(31, 193, 27) 10px -10px, rgb(255, 255, 255) 20px -20px 0px -3px, rgb(255, 217, 19) 20px -20px, rgb(255, 255, 255) 30px -30px 0px -3px, rgb(255, 156, 85) 30px -30px, rgb(255, 255, 255) 40px -40px 0px -3px, rgb(255, 85, 85) 40px -40px",
        deep: "rgba(0, 0, 0, 0.1) 0px 10px 15px, rgba(0, 0, 0, 0.2) 0px 8px 20px",
        rainbowSq:
          "rgb(85, 91, 255) 0px 0px 0px 3px, rgb(31, 193, 27) 0px 0px 0px 6px, rgb(255, 217, 19) 0px 0px 0px 9px, rgb(255, 156, 85) 0px 0px 0px 12px, rgb(255, 85, 85) 0px 0px 0px 15px",
      },
      maxWidth: {
        "1/4": "25%",
        "1/2": "50%",
        "1/3": "33%",
        "2/3": "66%",
        "3/4": "75%",
        "5/6": "83%",
        "11/12": "92%",
        xxs: "10rem",
        "90vw": "90vw",
        "12ch": "12ch",
        "500px": "500px",
        "800px": "800px",
        'sidebar': '450px',
        preview: "330px",
      },
      maxHeight: {
        "1/4": "25%",
        "1/2": "50%",
        "1/3": "33%",
        "2/3": "66%",
        "3/4": "75%",
        xxs: "10rem",
        "90vh": "90vh",
        "75vh": "75vh",
        "50vh": "50vh",
        "500px": "500px",
        preview: "330px",
      },
      minWidth: {
        "1/4": "25%",
        "1/2": "50%",
        "1/3": "33%",
        "2/3": "66%",
        "3/4": "75%",
        xxs: "10rem",
        preview: "330px",
        nfte: "490px",
        'sidebar': '248px'
      },
      minHeight: {
        "1/4": "25%",
        "1/2": "50%",
        "1/3": "33%",
        "2/3": "66%",
        "3/4": "75%",
        xxs: "10rem",
        "33vh": "33vh",
        "50vh": "50vh",
        "500px": "500px",
        preview: "330px",
      },
      height: {
        "75vh": "75vh",
        min: "min-content",
        preview: "330px",
        "500px": "500px",
      },
      width: {
        "75vh": "75vh",
        min: "min-content",
        preview: "330px",
        "500px": "500px",
      },
      colors: {
        // OurOrange
        "ourange-50": "#FFC0AC",
        "ourange-150": "#FFA083",
        "ourange-300": "#FF7246",
        "ourange-400": "#FF531D",
        "ourange-500": "#F76009",
        "ourange-600": "#C52F00",
        "ourange-700": "#972400",
        "ourange-800": "#691900",
        "ourange-850": "#521400",
        // dark theme colors
        "dark-background": "#060606", // near black
        "dark-primary": "#FFFFFF", // white
        "dark-secondary": "#B2B2B2", // 70% gray
        "dark-border": "#4D4D4D", // 30% gray
        "dark-accent": "#0D0D0D", // 5% gray
        "dark-ourange": "#F68D15", // yellow orange
        // light theme colors
        "light-background": "#FFFFFF", // white
        "light-primary": "#000000", // black
        "light-secondary": "#4D4D4D", // 30% gray
        "light-border": "#CCCCCC", // 80% gray
        "light-accent": "#999999", // 60% gray
        // misc
        "code-snippet": "#faf7fc",
      },
    },
  },
  variants: {
    extend: {},
  },
  
  plugins: [require("@tailwindcss/forms")],
};
