/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js", // add this line
  ],
  theme: {
    extend: {
      colors: {
        white: {
          gainsboro: "#DCDCDC",
          alice_blue: "#f0f8ff",
          bone_white: "#F9F6EE",
        },
        black: {
          charcoal_gray: "#171717",
          rich_black: "#020d19",
          dark_green: "#2C3539",
        },
        main: "4F6F52",
      },
      backgroundColor: {
        white: {
          gainsboro: "#DCDCDC",
          alice_blue: "#f0f8ff",
        },
        black: {
          charcoal_gray: "#171717",
          rich_black: "#020d19",
        },
        main: {
          dark: "#4F6F52",
        },
      },
      fontFamily: {
        primary: "Sora",
        secondary: "Poppins",
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
