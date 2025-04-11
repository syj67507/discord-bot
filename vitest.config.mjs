import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
    },
    onConsoleLog: true, // silences logs in the test output
  },
});
