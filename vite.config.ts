import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";

function homeLcpPreload(): Plugin {
  return {
    name: "home-lcp-preload",
    transformIndexHtml: {
      order: "post",
      handler(html, context) {
        const isHomeDocument = context.path === "/" || context.path === "/index.html";
        if (!isHomeDocument || html.includes("Frame%2033.webp")) return html;

        return html.replace(
          "</head>",
          '  <link rel="preload" as="image" href="/img/optimized/Frame%2033.webp" type="image/webp" fetchpriority="high" />\n</head>',
        );
      },
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), homeLcpPreload()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(process.cwd(), "index.html"),
        app: resolve(process.cwd(), "app.html"),
      },
    },
  },
});
