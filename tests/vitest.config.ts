import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["integration/**/*.test.ts", "privacy/**/*.test.ts", "e2e/**/*.test.tsx"],
  },
});
