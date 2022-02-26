import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.join(__dirname, "src"),
      "@components": path.join(__dirname, "src/components"),
      "@store": path.join(__dirname, "src/store"),
      "@lib": path.join(__dirname, "src/lib"),
    },
    extensions: [".ts", ".vue"],
  },
  build: {
    rollupOptions: {
      input: {
        app: "src/index.html",
      },
    },
  },
});
