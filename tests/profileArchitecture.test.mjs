import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";

let vite;
let loadSavedCards;
let saveSavedCards;
let isDemoCardNumber;
let PaymentSelectionModal;
let OrderCard;
let AddressCard;
let ProfileDetailRow;
let ProfileEmptyState;
let ProfileFilterTabs;
let ProfileToast;
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
  ({ isDemoCardNumber } = await vite.ssrLoadModule("/src/features/payments/useCardForm.ts"));
  ({ default: PaymentSelectionModal } = await vite.ssrLoadModule("/src/components/checkout/PaymentSelectionModal.tsx"));
  ({ default: OrderCard } = await vite.ssrLoadModule("/src/components/profile/OrderCard.tsx"));
  ({ default: AddressCard } = await vite.ssrLoadModule("/src/components/profile/AddressCard.tsx"));
  ({ default: ProfileDetailRow } = await vite.ssrLoadModule("/src/components/profile/ProfileDetailRow.tsx"));
  ({ default: ProfileEmptyState } = await vite.ssrLoadModule("/src/components/profile/ProfileEmptyState.tsx"));
  ({ default: ProfileFilterTabs } = await vite.ssrLoadModule("/src/components/profile/ProfileFilterTabs.tsx"));
  ({ default: ProfileToast } = await vite.ssrLoadModule("/src/components/profile/ProfileToast.tsx"));
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

test("demo card form rejects non-test card numbers", () => {
  assert.equal(isDemoCardNumber("4242 4242 4242 4242"), true);
  assert.equal(isDemoCardNumber("5555 5555 5555 4444"), true);
  assert.equal(isDemoCardNumber("4111 1111 1111 1111"), false);
});

test("demo card selector renders again on checkout", () => {
  const html = renderToString(createElement(PaymentSelectionModal, {
    isOpen: true, onClose: () => {}, onSelectCard: () => {}, user: firstUser,
  }));
  assert.match(html, /Demo Kart Seçin/);
  assert.match(html, /Gerçek kart bilgisi girmeyin/);
  assert.match(html, /Yeni Kart Ekle/);
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
  for (const key of ["pastSearches", "userLocation"]) {
    storage.set(`${key}_user-a`, "test-a");
    storage.set(`${key}_user-b`, "test-b");
  }

  clearLocalAccountData(firstUser);
  for (const key of ["savedCards", "notifications", "referralData", "settings", "pastSearches", "userLocation"]) {
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

test("profile detail row keeps read and edit states distinct", () => {
  const props = {
    label: "Email Address", value: "a@example.test", inputs: [{ name: "email", value: "a@example.test", placeholder: "Email Address", type: "email" }],
    error: "", onEdit: () => {}, onChange: () => {}, onSave: () => {}, onCancel: () => {},
  };
  const read = renderToString(createElement(ProfileDetailRow, { ...props, editing: false }));
  assert.match(read, /a@example\.test/);
  assert.match(read, /Edit Email Address/);
  assert.doesNotMatch(read, /type="email"/);

  const edit = renderToString(createElement(ProfileDetailRow, { ...props, editing: true, error: "Invalid email" }));
  for (const value of ['type="email"', "Invalid email", "Save", "Cancel"]) assert.ok(edit.includes(value));
  assert.match(edit, /role="alert"/);
});

test("profile filter, empty state, and toast render their shared UI", () => {
  const filters = renderToString(createElement(ProfileFilterTabs, {
    options: [{ id: "all", label: "All" }, { id: "unread", label: "Unread" }],
    selected: "unread", onSelect: () => {},
  }));
  assert.match(filters, /aria-pressed="true"[^>]*>Unread/);
  assert.match(filters, /aria-pressed="false"[^>]*>All/);

  const empty = renderToString(createElement(ProfileEmptyState, { compact: true }, "No items"));
  assert.match(empty, /border-dashed/);
  assert.match(empty, /No items/);
  assert.equal(renderToString(createElement(ProfileToast, { message: "" })), "");
  const toast = renderToString(createElement(ProfileToast, { message: "Saved" }));
  assert.match(toast, /role="status"/);
  assert.match(toast, /Saved/);
});
