import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Ignore changes in backend, node_modules and .git to avoid unnecessary HMR reloads
    watch: {
      ignored: ["**/backend/**", "**/node_modules/**", "**/.git/**"],
    },
    // Temporarily disable HMR to prevent automatic reloads while debugging
    hmr: false,
  },
});
