import { resolve } from "node:path";
import { defineConfig, loadEnv, type Plugin } from "vite";
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

function rejectClientSecrets(mode: string): Plugin {
  return {
    name: "reject-client-secrets",
    configResolved() {
      const clientEnv = loadEnv(mode, process.cwd(), "VITE_");
      const unsafeNames = Object.keys(clientEnv).filter((name) =>
        /(?:SECRET|SERVICE_ROLE|PRIVATE|PASSWORD|DATABASE_URL|CLIENT_SECRET)/i.test(name),
      );
      if (unsafeNames.length) {
        throw new Error(`Gizli değişkenlere VITE_ öneki verilemez: ${unsafeNames.join(", ")}`);
      }
      const key = clientEnv.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
      if (!key) return;
      if (key.startsWith("sb_publishable_")) return;
      if (key.startsWith("eyJ")) {
        try {
          const payload = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8"));
          if (payload.role === "anon") return;
        } catch {
          // Reject malformed JWTs without logging their contents.
        }
      }
      throw new Error("VITE_SUPABASE_PUBLISHABLE_KEY yalnızca Supabase publishable/anon anahtarı olabilir.");
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [rejectClientSecrets(mode), tailwindcss(), homeLcpPreload()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(process.cwd(), "index.html"),
        app: resolve(process.cwd(), "app.html"),
      },
    },
  },
}));
