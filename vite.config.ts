import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from "path"

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.join(__dirname, "src"),
      "@components": path.join(__dirname, "components"),
      "@store": path.join(__dirname, "store"),
      "@lib": path.join(__dirname, "lib"),
    },
    build:{
        rollupOptions:{
            input:{
                app: "src/index.html"
            }
        }
    }
})
