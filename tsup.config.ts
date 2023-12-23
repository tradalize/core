import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts", "!src/**/*.test.*"],

  format: "esm",
  platform: "node",
  bundle: false,
  dts: true,
  splitting: false,
  clean: true,
});
