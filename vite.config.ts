import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";

function nonBlockingStylesheet(): Plugin {
  return {
    name: "non-blocking-stylesheet",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        const nonBlockingLink =
          '<link rel="preload" as="style" crossorigin href="$1" onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" crossorigin href="$1"></noscript>';

        return html.replace(
          /<link rel="stylesheet" crossorigin href="([^"]+\.css)">/g,
          nonBlockingLink,
        );
      },
    },
  };
}

export default defineConfig({
  plugins: [tailwindcss(), nonBlockingStylesheet()],
});
