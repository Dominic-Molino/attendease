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
          border: "#8e8c87",
          input: "#27272a",
          text: "#71717a",
          // for bg
          muted: "#fafafa",
        },
        light: {
          // for buttons
          background: "#ff8a00",
          foregroud: "#f6aa54",
          // for readability
          text: "#c75519",
          border: "#c75519",
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
