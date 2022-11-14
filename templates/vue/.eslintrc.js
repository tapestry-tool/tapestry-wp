module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
    jquery: true,
  },
  extends: [
    "plugin:vue/recommended",
    "plugin:cypress/recommended",
    "eslint:recommended",
    "prettier/vue",
    "plugin:prettier/recommended",
  ],
  rules: {
    "vue/v-slot-style": "off",
    "vue/multi-word-component-names": "off",
    "vue/attribute-hyphenation": "off",
    "vue/component-name-in-template-casing": ["error", "kebab-case"],
    "vue/component-definition-name-casing": ["error", "kebab-case"],
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
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@babel/eslint-parser",
  },
  globals: {
    wp: true,
  },
}
