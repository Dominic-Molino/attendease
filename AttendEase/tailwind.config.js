/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      colors: {
        dark: {
          // for buttons
          background: "#09090b",
          foreground: "#27272a",
          // blockss
          primary: "#fafafa",
          border: "#e4e4e7",
          input: "#27272a",
          text: "#71717a",
        },
      },
      backgroundColor: (theme) => theme("colors"),
      fontFamily: {
        primary: "Inter",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
