const LOCKED_ADDRESS_STATUSES = new Set([
  "shipped", "kargoda", "kargoya verildi", "in transit", "on the way",
  "delivered", "teslim edildi", "cancelled", "iptal edildi",
]);

const PENDING_STATUSES = new Set(["pending", "processing", "order placed", "hazırlanıyor"]);

export function canEditOrderAddress(status: string): boolean {
  return !LOCKED_ADDRESS_STATUSES.has(status.toLowerCase().trim());
}

export function isPendingOrder(status: string): boolean {
  return PENDING_STATUSES.has(status.toLowerCase().trim());
}
