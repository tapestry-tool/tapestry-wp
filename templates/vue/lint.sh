npm install --save-dev babel-eslint eslint eslint-config-prettier eslint-loader eslint-plugin-prettier eslint-plugin-vue

mkdir .vscode
touch .vscode/settings.json
touch .vscode/extensions.json

echo '{
  "recommendations": ["octref.vetur", "dbaeumer.vscode-eslint", "esbenp.prettier-vscode"]
}' > .vscode/extensions.json

echo '{
  "eslint.validate": [
    {
      "language": "vue",
      "autoFix": true
    },
    {
      "language": "javascript",
      "autoFix": true
    }
  ],
  "eslint.autoFixOnSave": true,
  "editor.formatOnSave": false,
  "vetur.validation.template": false
}' > .vscode/settings.json

touch .eslintrc.js

echo 'module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/recommended",
    "eslint:recommended",
    "prettier/vue",
    "plugin:prettier/recommended",
  ],
  rules: {
    "vue/component-name-in-template-casing": ["error", "kebab-case"],
    "vue/name-property-casing": ["error", "kebab-case"],
    "vue/no-v-html": "off",
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-prototype-builtins": "off",
    "prettier/prettier": [
      "warn",
      {
        semi: false,
        htmlWhitespaceSensitivity: "ignore",
        printWidth: 85,
        trailingComma: "es5",
      },
    ],
  },
  parserOptions: {
    parser: "babel-eslint",
  },
  globals: {
    wpData: "readonly",
    wpPostId: "readonly",
    apiUrl: "readonly",
    thisTapestryTool: "readonly",
  },
  env: {
    jquery: true,
  },
}' > .eslintrc.js
