import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";
import { handleDeleteAccount } from "../supabase/functions/delete-account/handler.js";

let vite;
let DeleteAccountDialog;

before(async () => {
  vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  ({ DeleteAccountDialog } = await vite.ssrLoadModule("/src/features/profile/DeleteAccountSection.tsx"));
});

after(async () => { await vite?.close(); });

const request = (method = "POST") => new Request("https://example.test/delete-account", { method });

const context = (claimId, authUserId, deleteUser = async () => ({ error: null })) => ({
  userClaims: claimId ? { id: claimId } : null,
  supabase: { auth: { getUser: async () => ({ data: { user: authUserId ? { id: authUserId } : null }, error: null }) } },
  supabaseAdmin: { auth: { admin: { deleteUser } } },
});

test("account deletion accepts only POST", async () => {
  const response = await handleDeleteAccount(request("GET"), context("owner", "owner"));
  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "POST");
});

test("account deletion rejects missing or mismatched identity", async () => {
  let calls = 0;
  const deleteUser = async () => { calls++; return { error: null }; };
  for (const caller of [context(null, "owner", deleteUser), context("owner", "other", deleteUser)]) {
    const response = await handleDeleteAccount(request(), caller);
    assert.equal(response.status, 401);
  }
  assert.equal(calls, 0);
});

test("account deletion rejects a deleted or unavailable Auth user", async () => {
  const caller = context("owner", "owner");
  caller.supabase.auth.getUser = async () => ({ data: null, error: null });
  const response = await handleDeleteAccount(request(), caller);
  assert.equal(response.status, 401);
});

test("account deletion removes only the verified caller and uses hard delete", async () => {
  const calls = [];
  const caller = context("owner", "owner", async (...args) => {
    calls.push(args);
    return { error: null };
  });
  const response = await handleDeleteAccount(new Request("https://example.test/delete-account", {
    method: "POST", body: JSON.stringify({ userId: "victim" }),
  }), caller);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { deleted: true });
  assert.deepEqual(calls, [["owner", false]]);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("confirmation dialog explains irreversible deletion and starts safely disabled", () => {
  const html = renderToString(createElement(DeleteAccountDialog, {
    open: true, pending: false, error: "", onClose: () => {}, onConfirm: () => {},
  }));
  assert.match(html, /aria-modal="true"/);
  assert.match(html, /Hesabınızı silmek istediğinize emin misiniz/);
  assert.match(html, /ONAY/);
  assert.match(html, /fixed inset-0 m-auto/);
  assert.match(html, /type="submit" disabled=""/);
  assert.match(html, /Vazgeç/);
});

test("account deletion does not report success when Auth deletion fails", async () => {
  const response = await handleDeleteAccount(request(), context("owner", "owner", async () => ({ error: { code: "failed" } })));
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: "deletion_failed" });
});

test("all user-owned tables cascade from auth.users", () => {
  const schema = readFileSync("supabase/schema.sql", "utf8");
  for (const table of ["profiles", "addresses", "carts", "orders"]) {
    const start = schema.indexOf(`create table if not exists public.${table} (`);
    assert.notEqual(start, -1, `${table} table missing`);
    const definition = schema.slice(start, schema.indexOf(");", start));
    assert.match(definition, /references auth\.users\(id\) on delete cascade/i, `${table} must cascade`);
  }
});

test("account settings offer server-backed deletion with confirmation and noindex", () => {
  const settings = readFileSync("src/pages/profile/AccountSettings.tsx", "utf8");
  const section = readFileSync("src/features/profile/DeleteAccountSection.tsx", "utf8");
  const service = readFileSync("src/features/profile/deleteAccount.ts", "utf8");
  const edge = readFileSync("supabase/functions/delete-account/index.ts", "utf8");
  assert.match(settings, /robots="noindex,nofollow"/);
  assert.match(settings, /<DeleteAccountSection/);
  assert.match(section, /Hesabınızı silmek istediğinize emin misiniz/);
  assert.match(section, /confirmed && !pending/);
  assert.match(section, /await deleteAccount\(\)/);
  assert.match(service, /functions\.invoke.*"delete-account"/);
  assert.match(edge, /auth: "user"/);
  assert.doesNotMatch(section, /window\.confirm/);
});
