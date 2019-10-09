module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    "plugin:vue/recommended",
    "eslint:recommended",
    "prettier/vue",
    "plugin:prettier/recommended"
  ],
  rules: {
    "vue/component-name-in-template-casing": ["error", "PascalCase"],
    "vue/name-property-casing": ["error", "kebab-case"],
    "vue/no-v-html": "off",
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-prototype-builtins": "off"
  },
  parserOptions: {
    parser: "babel-eslint"
  },
  globals: {
    "wpData": "readonly",
    "wpPostId": "readonly",
    "apiUrl": "readonly",
    "thisTapestryTool": "readonly"
  },
  env: {
    "jquery": true
  }
};
