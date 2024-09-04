const reactHooks = require("eslint-plugin-react-hooks");
const reactRefresh = require("eslint-plugin-react-refresh");
const rootConfig = require("../../../eslint.config.cjs");

module.exports = {
  extends: rootConfig, // 루트 설정을 확장
  languageOptions: {
    ecmaVersion: 2020,
  },
  plugins: {
    "react-hooks": reactHooks,
    "react-refresh": reactRefresh,
  },
  rules: {
    ...reactHooks.configs.recommended.rules,
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
  },
};
