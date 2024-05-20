/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      colors: {
        ivy: "#777E5C",
        serpentine: "#283106",
        spring: "#D1D8BD",
        beige: "#F5F5DC",
        linen: "#C7C2AB",
        first_frost: "#dfe0dc",
        pebble: "#B0B6BC",

        // Custom Colors
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
      fontFamily: {
        primary: "Sora",
        secondary: "Poppins",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
