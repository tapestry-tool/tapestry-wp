module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  extends: [
    "plugin:vue/recommended",
    "plugin:cypress/recommended",
    "eslint:recommended",
    "prettier/vue",
    "plugin:prettier/recommended",
  ],
  rules: {
    "cypress/no-unnecessary-waiting": "off",
    "vue/attribute-hyphenation": "off",
    "vue/component-name-in-template-casing": ["error", "kebab-case"],
    "vue/name-property-casing": ["error", "kebab-case"],
    "vue/custom-event-name-casing": "off",
    "vue/no-v-html": "off",
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-prototype-builtins": "off",
    "linebreak-style": "off",
    "prettier/prettier": [
      "error",
      {
        semi: false,
        htmlWhitespaceSensitivity: "ignore",
        printWidth: 85,
        trailingComma: "es5",
        endOfLine: "auto",
      },
    ],
  },
  parserOptions: {
    parser: "babel-eslint",
  },
}
