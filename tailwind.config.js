const colors = require("tailwindcss/colors");
const defaultTheme = require("tailwindcss/defaultTheme");

/**
 * @type {import("tailwindcss").Config}
 */
module.exports = {
  content: ["src/**/*.{js,ts,tsx}"],
  darkMode: "class",
  theme: {
    colors: {
      current: colors.current,
      white: colors.white,
      black: colors.black,
      transparent: colors.transparent,
      neutral: colors.neutral,
      emerald: colors.emerald,
      red: colors.red,
    },
    extend: {
      fontFamily: {
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "Pretendard Fallback",
          ...defaultTheme.fontFamily.sans,
        ],
      },
    },
  },
};
