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
        darkgreen: "#027148",
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
