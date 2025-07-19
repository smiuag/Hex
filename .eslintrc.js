// .eslintrc.js
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  rules: {
    // ❗ Fuerza funciones como expresiones (flechas)
    "func-style": ["error", "expression"],

    // ❗ Obliga a declarar el tipo de retorno explícito
    "@typescript-eslint/explicit-function-return-type": "warn",

    // ✅ Buenas prácticas
    "prefer-const": "error",
    "no-unused-vars": "warn",
    "no-var": "error",
  },
};
