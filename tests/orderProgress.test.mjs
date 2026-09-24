import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { createServer } from "vite";

let vite;
let OrderProgress;
let OrdersContext;
let AuthContext;

before(async () => {
  vite = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  ({ default: OrderProgress } = await vite.ssrLoadModule("/src/pages/OrderProgress.tsx"));
  ({ OrdersContext } = await vite.ssrLoadModule("/src/features/orders/OrdersContext.tsx"));
  ({ AuthContext } = await vite.ssrLoadModule("/src/features/auth/AuthContext.tsx"));
});

after(async () => { await vite?.close(); });

const orders = [
  {
    id: "order-123",
    status: "Processing",
    total: 22,
    deliveryAddress: "Nilüfer, Bursa",
    createdAt: "2026-09-15T10:00:00.000Z",
    paymentMethod: "Visa **** 1234",
    items: [{ id: 1, title: "Organic Milk", img: "", price: 10, qty: 2, category: "Dairy" }],
  },
  {
    id: "order-456",
    status: "Delivered",
    total: 5,
    deliveryAddress: "Çankaya, Ankara",
    items: [{ id: 2, title: "Fresh Eggs", img: "", price: 5, qty: 1, category: "Eggs" }],
  },
];

const renderPage = (url, isLoggedIn = true, ordersLoading = false, displayedOrders = orders, ordersError = "") =>
  renderToString(
    createElement(
      MemoryRouter,
      { initialEntries: [url] },
      createElement(
        AuthContext.Provider,
        { value: { isLoggedIn, openAuthModal: () => {} } },
        createElement(
          OrdersContext.Provider,
          { value: { orders: displayedOrders, ordersLoading, ordersError, addOrder: async () => orders[0], updateOrderAddress: () => {} } },
          createElement(OrderProgress),
        ),
      ),
    ),
  );

test("renders the requested order instead of cart or another order", () => {
  const html = renderPage("/order-progress?orderId=order-123");
  assert.match(html, /Organic Milk/);
  assert.match(html, /Nilüfer, Bursa/);
  assert.match(html, /order-123/);
  assert.match(html, /\$22\.00/);
  assert.doesNotMatch(html, /Fresh Eggs|Çankaya, Ankara/);
});

test("does not fall back to another order for an unknown ID", () => {
  const html = renderPage("/order-progress?orderId=missing");
  assert.match(html, /Order not found/);
  assert.doesNotMatch(html, /Organic Milk|Fresh Eggs/);
});

test("does not render order data for a logged-out visitor", () => {
  const html = renderPage("/order-progress?orderId=order-123", false);
  assert.match(html, /giriş yapın/);
  assert.doesNotMatch(html, /Organic Milk|Nilüfer, Bursa/);
});

test("does not reveal a previous account's orders while loading", () => {
  const html = renderPage("/order-progress?orderId=order-123", true, true);
  assert.match(html, /Loading order/);
  assert.doesNotMatch(html, /Organic Milk|Nilüfer, Bursa/);
});

test("demo checkout result never claims a real payment or shipment", () => {
  const demo = { ...orders[0], id: "demo_123", status: "Demo", isDemo: true };
  const html = renderPage("/order-progress?orderId=demo_123", true, false, [demo], "Gerçek siparişler yüklenemedi.");
  assert.match(html, /Test işlemi tamamlandı/);
  assert.match(html, /Gerçek para çekilmedi/);
  assert.match(html, /ürün gönderilmeyecek/);
  assert.match(html, /Organic Milk/);
  assert.match(html, /Order Summary/);
  assert.match(html, /Test Kartı \(tahsilat yok\)/);
  assert.match(html, /Seçilen Adres \(gönderim yok\)/);
  assert.doesNotMatch(html, /Order is Placed/);
  assert.doesNotMatch(html, /demo/i);
});
