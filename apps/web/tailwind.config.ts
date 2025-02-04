/** @type {import('tailwindcss').Config} */
const defaultTheme = require("tailwindcss/defaultTheme");
const uiTailwindConfig = require("shadcn-ui/tailwind.config");

module.exports = {
  presets: [uiTailwindConfig],
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
    "../../packages/shadcn-ui/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        dancing: ["Dancing Script", "cursive"],
      },
      colors: {
        darkTheme: "bg-black",
        lightTheme: "bg-white",
      },
      spacing: {
        "custom-9": "9px",
        "custom-10": "10px",
        "custom-14": "14px",
        "custom-17": "17px",
        "custom-21": "21px",
        "custom-35": "35px",
        "custom-37": "37px",
        "custom-44": "44px",
        "custom-51": "51px",
        "custom-60": "60px",
        "custom-100": "100px",
        "custom-119": "119px",
        "custom-122": "122px",
        "custom-209": "209px",
        "custom-259": "259px",
        "custom-407": "407px",
        "custom-648": "648px",
      },
      fontSize: {
        xxs: "10px",
      },
      zIndex: {
        9: 9,
      },
      screens: {
        "4k": "2260px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
