import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const read = (path) => readFileSync(path, "utf8");

test("help page makes no live payment-provider or PCI certification claim", () => {
  const help = read("src/pages/profile/HelpCenter.tsx");
  assert.doesNotMatch(help, /PCI-DSS Level 1|bankaların 3D Secure güvenli doğrulama altyapısı/i);
  assert.match(help, /ödeme sağlayıcısı veya 3D Secure entegrasyonu yoktur/);
  assert.match(help, /gerçek ödeme alınmaz/);
});

test("demo card selection is visible but unpaid orders stay disabled", () => {
  const checkout = read("src/pages/Checkout.tsx");
  const payments = read("src/pages/profile/MyPayments.tsx");
  const cardForm = read("src/features/payments/useCardForm.ts");
  const cardModal = read("src/components/checkout/PaymentSelectionModal.tsx");
  const data = read("src/services/supabase/data.ts");
  const orders = read("src/features/orders/OrdersContext.tsx");
  assert.match(checkout, /PaymentSelectionModal/);
  assert.match(payments + cardModal, /Gerçek kart bilgisi girmeyin/);
  assert.match(cardForm, /maskedNumber: maskCardNumber\(rawNumber\)/);
  assert.match(cardForm, /isDemoCardNumber\(rawNumber\)/);
  assert.doesNotMatch(checkout, /handlePlaceOrder/);
  assert.doesNotMatch(data, /\.rpc\("create_order"/);
  assert.match(orders, /Doğrulanmış ödeme altyapısı/);
  assert.match(read("supabase/disable-unverified-checkout.sql"), /revoke execute on function public\.create_order/);
});

test("production bundle contains no local private keys", () => {
  if (!existsSync("dist")) return;
  const files = readdirSync("dist", { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name));
  const bundle = files.map(read).join("\n");
  for (const envFile of [".env", "server/.env"]) {
    if (!existsSync(envFile)) continue;
    for (const line of read(envFile).split(/\r?\n/)) {
      const match = /^([A-Za-z_][A-Za-z_0-9]*)=(.*)$/.exec(line);
      if (!match || match[2].length < 12 || match[1].startsWith("VITE_") || match[1].includes("PUBLISHABLE")) continue;
      assert.equal(bundle.includes(match[2]), false, `${match[1]} is present in the production bundle`);
    }
  }
});
