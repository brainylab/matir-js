import { defineConfig } from "vitest/config";

/// <reference types="vitest/config" />
export default defineConfig({
  test: {
    include: ["./src/**/*.spec.{ts,tsx}"],
    exclude: ["node_modules", "**/node_modules", "**/dist/**"],
    coverage: {
      include: ["./src/**/*.{js,ts,tsx}"],
      exclude: ["**/node_modules/**", "**/dist/**", "**/types/**"],
      provider: "v8",
    },
  },
});
