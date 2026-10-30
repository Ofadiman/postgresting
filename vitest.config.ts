import { playwright } from "@vitest/browser-playwright";
import { msw } from "msw/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [msw({ mode: "worker-only" })],
  optimizeDeps: {
    entries: ["app/**/*.{ts,tsx}", "!app/routes.ts"],
  },
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ["app/**/*.test.{ts,tsx}"],
    setupFiles: ["app/test/setup.ts"],
    restoreMocks: true,
    unstubEnvs: true,
    coverage: {
      provider: "istanbul",
      include: ["app/**/*.{ts,tsx}"],
      exclude: [
        "app/**/*.test-utils.tsx",
        "app/test/**",
        "app/database.types.ts",
        "app/routes.ts",
      ],
    },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [
        { browser: "chromium" },
        { browser: "firefox" },
        { browser: "webkit" },
      ],
    },
  },
});
