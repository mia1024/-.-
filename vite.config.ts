import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
    root: "src",
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
        outDir: path.join(__dirname, "dist"),
        emptyOutDir: true,
        rollupOptions: {
            input: {
                app: "src/index.html",
            },
        },
        sourcemap: true,
    },
});
