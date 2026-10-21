import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The proxy keeps API calls same-origin in development,
// so the httpOnly cookie works without extra CORS setup.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:5000" },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "src/test/**",
        "src/data/**",
        "**/*.config.js",
        "src/main.jsx",
        "dist/**",
      ],
    },
  },
});
