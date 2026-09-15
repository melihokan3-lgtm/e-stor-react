import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";

let vite;
let loadSavedCards;
let saveSavedCards;
let OrderCard;
let AddressCard;
let canEditOrderAddress;
let loadAccountSettings;
let saveAccountSettings;
let clearLocalAccountData;
let loadReferralData;
let loadProfileNotifications;
let saveProfileNotifications;
const storage = new Map();
const previousStorage = globalThis.localStorage;

before(async () => {
  globalThis.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => { storage.set(key, value); },
    removeItem: (key) => { storage.delete(key); },
  };
  vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  ({ loadSavedCards, saveSavedCards } = await vite.ssrLoadModule("/src/features/payments/savedCards.ts"));
  ({ default: OrderCard } = await vite.ssrLoadModule("/src/components/profile/OrderCard.tsx"));
  ({ default: AddressCard } = await vite.ssrLoadModule("/src/components/profile/AddressCard.tsx"));
  ({ canEditOrderAddress } = await vite.ssrLoadModule("/src/features/orders/orderStatus.ts"));
  ({ loadAccountSettings, saveAccountSettings, clearLocalAccountData } = await vite.ssrLoadModule("/src/features/profile/settings.ts"));
  ({ loadReferralData } = await vite.ssrLoadModule("/src/features/profile/referrals.ts"));
  ({ loadProfileNotifications, saveProfileNotifications } = await vite.ssrLoadModule("/src/features/profile/notifications.ts"));
});

after(async () => {
  await vite?.close();
  if (previousStorage === undefined) delete globalThis.localStorage;
  else globalThis.localStorage = previousStorage;
});

const firstUser = { id: "user-a", email: "a@example.test" };
const secondUser = { id: "user-b", email: "b@example.test" };

test("saved cards stay isolated and an explicitly empty list stays empty", () => {
  storage.clear();
  assert.equal(loadSavedCards(firstUser).length, 2);
  saveSavedCards(firstUser, []);
  assert.deepEqual(loadSavedCards(firstUser), []);
  assert.equal(loadSavedCards(secondUser).length, 2);
  assert.deepEqual(loadSavedCards(firstUser), []);
  assert.notEqual(storage.get("savedCards_user-a"), storage.get("savedCards_user-b"));
});

test("guest demo cards are not written to persistent storage", () => {
  storage.clear();
  assert.equal(loadSavedCards(null).length, 2);
  assert.equal(storage.size, 0);
});

test("profile preferences and notifications stay user-scoped", () => {
  storage.clear();
  const firstSettings = loadAccountSettings(firstUser);
  saveAccountSettings(firstUser, { ...firstSettings, language: "de" });
  assert.equal(loadAccountSettings(firstUser).language, "de");
  assert.equal(loadAccountSettings(secondUser).language, "tr");

  assert.equal(loadProfileNotifications(firstUser).length, 5);
  saveProfileNotifications(firstUser, []);
  assert.deepEqual(loadProfileNotifications(firstUser), []);
  assert.equal(loadProfileNotifications(secondUser).length, 5);

  assert.equal(loadReferralData(firstUser).friendsInvited, 5);
  assert.equal(loadReferralData(secondUser).friendsInvited, 5);
  assert.ok(storage.has("referralData_user-a"));
  assert.ok(storage.has("referralData_user-b"));
});

test("local data cleanup removes only the selected user's feature keys", () => {
  storage.clear();
  loadSavedCards(firstUser);
  loadSavedCards(secondUser);
  loadProfileNotifications(firstUser);
  loadProfileNotifications(secondUser);
  loadReferralData(firstUser);
  loadReferralData(secondUser);
  saveAccountSettings(firstUser, loadAccountSettings(firstUser));
  saveAccountSettings(secondUser, loadAccountSettings(secondUser));

  clearLocalAccountData(firstUser);
  for (const key of ["savedCards", "notifications", "referralData", "settings"]) {
    assert.equal(storage.has(`${key}_user-a`), false);
    assert.equal(storage.has(`${key}_user-b`), true);
  }
});

test("order card keeps address controls tied to order status", () => {
  const baseOrder = {
    id: "order-123", status: "Processing", total: 12,
    deliveryAddress: "Nilüfer, Bursa", items: [{ id: 1, title: "Fresh Milk", img: "", price: 12, qty: 1, category: "Dairy" }],
  };
  const render = (order) => renderToString(createElement(MemoryRouter, null, createElement(OrderCard, { order, onEditAddress: () => {} })));

  const editable = render(baseOrder);
  assert.match(editable, /order-card|Nilüfer, Bursa|Fresh Milk|Adresi Değiştir/);
  assert.equal(canEditOrderAddress(" Processing "), true);

  const locked = render({ ...baseOrder, status: "Shipped" });
  assert.match(locked, /Kargoya Verildi/);
  assert.doesNotMatch(locked, /Adresi Değiştir/);
  assert.equal(canEditOrderAddress(" Shipped "), false);
});

test("address card renders the selected address with existing CSS classes", () => {
  const html = renderToString(createElement(AddressCard, {
    address: { id: "address-1", label: "Home", address: "Nilüfer, Bursa" },
    selected: true, onSelect: () => {}, onRemove: () => {},
  }));
  assert.match(html, /address-card active|Home|Nilüfer, Bursa|address-card__main/);
});
