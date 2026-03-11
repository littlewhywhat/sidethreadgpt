import { crx } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";
import zip from "vite-plugin-zip-pack";
import manifest from "./manifest.json";

export default defineConfig({
  plugins: [
    crx({ manifest }),
    zip({ outDir: "release", outFileName: "release.zip" }),
  ],
  build: {
    minify: false,
  },
  esbuild: {
    jsxImportSource: "preact",
    jsx: "automatic",
  },
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
    },
  },
});
