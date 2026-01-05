import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ⚙️ Optimized Vite config for low-memory Windows builds
export default defineConfig({
    plugins: [react()],
    server: {
        // Proxy API requests to avoid CORS issues during development
        proxy: {
            '/api': {
                target: 'https://attendmate-backend-femy.onrender.com',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, '/api')
            }
        }
    },
    build: {
        outDir: "dist",
        target: "esnext",
        minify: false,             // ❌ turn off heavy minification
        cssMinify: false,          // ❌ skip CSS minifier
        sourcemap: false,
        chunkSizeWarningLimit: 2000,
    },
    optimizeDeps: {
        // Force re-optimization on startup
        force: true,
        esbuildOptions: {
            target: "esnext",
            // Disable parallel optimization for memory safety
            legalComments: "none",
        },
    }
});