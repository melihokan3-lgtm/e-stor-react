import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "vite";

let vite;
let getSupabaseClient;
let isSupabaseConfigured;

before(async () => {
  vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  ({ getSupabaseClient, isSupabaseConfigured } = await vite.ssrLoadModule("/src/lib/supabase.ts"));
});

after(async () => {
  await vite?.close();
});

test("Google authorization request uses PKCE and no Google offline scope", async (context) => {
  if (!isSupabaseConfigured) return context.skip("Supabase public test configuration is absent");
  const client = await getSupabaseClient();
  assert.ok(client);
  const { data, error } = await client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: "https://example.test/", skipBrowserRedirect: true },
  });
  assert.equal(error, null);
  const url = new URL(data.url);
  assert.equal(url.searchParams.get("provider"), "google");
  assert.equal(url.searchParams.get("redirect_to"), "https://example.test/");
  assert.equal(url.searchParams.get("code_challenge_method"), "s256");
  assert.ok(url.searchParams.get("code_challenge"));
  assert.equal(url.searchParams.has("access_type"), false);
});
