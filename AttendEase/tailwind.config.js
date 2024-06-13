/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./node_modules/flowbite/**/*.js"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        dark: {
          // for buttons
          background: "#09090b",
          foreground: "#2d2d2b",
          // blockss
          primary: "#fafafa",
          border: "#b7b5ae",
          input: "#27272a",
          text: "#71717a",
          // for bg
          muted: "#fafafa",
        },
        light: {
          // for buttons
          background: "#04bc64",
          foregroud: "#049151",
          // for readability
          text: "#04bc64",
          border: "#04bc64",
        },
        text: "#444444",
      },
      backgroundColor: (theme) => theme("colors"),
      fontFamily: {
        primary: "Inter",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
