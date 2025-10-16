import js from "@eslint/js";
import json from "@eslint/json";
import jest from "eslint-plugin-jest";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
    {
        files: ["**/*.{js,mjs,cjs}"],
        plugins: { js, jest },
        extends: ["js/recommended"],
        languageOptions: { globals: { ...globals.node, ...globals.jest } }
    },
    {
        files: ["**/*.js"],
        languageOptions: { sourceType: "commonjs" }
    },
    {
        files: ["**/*.json"],
        plugins: { json },
        language: "json/json",
        extends: ["json/recommended"]
    },
]);
