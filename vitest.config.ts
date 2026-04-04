import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    setupFiles: ["tests/setup.ts"],
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
