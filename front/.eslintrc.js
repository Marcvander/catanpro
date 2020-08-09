module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    jest: true,
    jasmine: true,
  },
  extends: ["plugin:vue/recommended"],
  parserOptions: {
    parser: "babel-eslint",
    ecmaVersion: 2017,
    sourceType: "module"
  },
  rules: {
    'vue/no-unused-components': 0,
    'vue/require-prop-types': 0,
    'vue/order-in-components': 0,
    'vue/require-default-prop': 0,
    'vue/no-template-shadow': 0,
    'vue/no-v-html': 0
  },
  globals: { Class: true },
};
