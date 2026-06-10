import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  dts: true,
  clean: true,
  deps: { neverBundle: "@matir-js/core" },
  format: ["esm"],
});
