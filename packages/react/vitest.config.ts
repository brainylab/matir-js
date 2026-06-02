import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/// <reference types="vitest/config" />
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.js",
    include: ["./src/**/*.spec.{ts,tsx}"],
    exclude: ["node_modules", "**/node_modules", "**/dist/**"],
    coverage: {
      include: ["./src/**/*.{js,ts,tsx}"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/types/**"],
      provider: "v8",
    },
  },
});
