import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      name: "voken-rc-style-nonce",
      enforce: "pre",
      transform(code, id) {
        // Scrollbar measurement and portal scroll-lock helpers bypass ConfigProvider.
        // Supply the same response nonce at their shared style insertion boundary.
        if (
          !id
            .replaceAll("\\", "/")
            .endsWith("/@rc-component/util/es/Dom/dynamicCSS.js")
        )
          return;
        const patched = code.replace(
          /\bcsp,\s*\n(\s*)prepend,/,
          'csp = { nonce: document.querySelector(\'meta[name="csp-nonce"]\')?.getAttribute("content") || "" },\n$1prepend,',
        );
        if (patched === code)
          throw new Error(
            "Review rc-component dynamicCSS CSP compatibility after dependency update",
          );
        return { code: patched, map: null };
      },
    },
  ],
  base: "./",
  server: {
    proxy: {
      "/api": "http://127.0.0.1:18084",
      "/app-assets": "http://127.0.0.1:18084",
      "/health": "http://127.0.0.1:18084",
    },
  },
  build: {
    outDir: "../app/web_ui/react",
    emptyOutDir: true,
    rollupOptions: {
      input: "src/main.tsx",
      onwarn(warning, warn) {
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes("use client")
        )
          return;
        warn(warning);
      },
      output: {
        entryFileNames: "app.js",
        chunkFileNames: "[name]-[hash].js",
        assetFileNames: "[name][extname]",
        manualChunks(id) {
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id))
            return "react-vendor";
          if (/node_modules/.test(id)) return "antd-vendor";
        },
      },
    },
  },
});
