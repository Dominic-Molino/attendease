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
        smoke: "#F0EEE4",
        twilight_blue: "#f0ffff",
        martinique: "#332D4F",
        shade: "#E5E4E2",
        carribean_green: {
          mint: "#01CDA9",
          minted: "#04ba9a",
        },
        silver_sand: "#BBBCBE",
        mandy: "#E54461",
      },
      backgroundColor: (theme) => theme("colors"),
    },
  },
  plugins: [require("flowbite/plugin")],
};
