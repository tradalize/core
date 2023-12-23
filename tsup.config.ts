import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/**/*.ts", "!src/**/*.test.*"],
  target: "esnext",
  format: "esm",
  platform: "node",
  bundle: false,
  dts: true,
  splitting: false,
  clean: true,
});
