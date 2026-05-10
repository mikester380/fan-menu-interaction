import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.join(__dirname, "/src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.join(__dirname, "src/styles")],
        silenceDeprecations: ["legacy-js-api"],

        additionalData: (content, src) => {
          const fileName = path.basename(src);
          const imp = "@use 'imports' as *;";

          return (/\.module\.scss$/.test(fileName) ? imp : "") + content;
        },
      },
    },
  },
});
