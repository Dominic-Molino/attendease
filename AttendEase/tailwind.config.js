/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js", // add this line
  ],
  theme: {
    extend: {
      fontFamily: {
        primary: "Sora",
        secondary: "Poppins",
      },
      colors: {
        darkgreen: "#027148",
        custom_black: "#010101",
        smoke: "#e3e3e3",
        martinique: "#332D4F",
        shade: "#ececec",
        carribean_green: {
          mint: "#01CDA9",
          minted: "#03997f",
        },
        silver_sand: "#BBBCBE",
        mandy: {
          main: "#E54461",
          shade: "#D13D57",
        },
      },
      backgroundColor: (theme) => theme("colors"),
    },
  },
  plugins: [require("flowbite/plugin")],
};
