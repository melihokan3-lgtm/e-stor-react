import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "vite";

let vite;
let saveUserCart;
let saveUserOrder;
let fetchUserAddresses;

before(async () => {
  vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  ({ saveUserCart, saveUserOrder, fetchUserAddresses } = await vite.ssrLoadModule("/src/services/supabase/data.ts"));
});

after(async () => {
  await vite?.close();
});

const demoUser = { id: 1, email: "demo@example.test" };
const invalidIdentity = /Bu hesap Supabase kullanıcısı değil/;

test("rejects a demo user before saving a cart", async () => {
  await assert.rejects(saveUserCart(demoUser, []), invalidIdentity);
});

test("rejects a demo user before placing an order", async () => {
  await assert.rejects(saveUserOrder(demoUser, { status: "Processing", total: 10, deliveryAddress: "Bursa", items: [] }), invalidIdentity);
});

test("rejects a demo user before querying addresses", async () => {
  await assert.rejects(fetchUserAddresses(demoUser), invalidIdentity);
});
