import type { Address } from "../../types/address";

interface AddressCardProps {
  address: Address;
  selected: boolean;
  onSelect: (address: Address) => void;
  onRemove: (id: Address["id"]) => void;
}

export default function AddressCard({ address, selected, onSelect, onRemove }: AddressCardProps) {
  return (
    <article className={`flex items-center justify-between gap-4 rounded-2xl border p-5 transition ${selected ? "border-[#b6349a] bg-[#fff8fd]" : "border-[#eee] bg-white"}`}>
      <button type="button" className="flex min-w-0 flex-1 items-center gap-4 text-left" onClick={() => onSelect(address)}>
        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${selected ? "border-[#b6349a] bg-[#b6349a] text-white" : "border-[#bbb] text-transparent"}`} aria-hidden="true">✓</span>
        <span className="min-w-0">
          <strong className="block text-sm font-bold text-[#111]">{address.label}</strong>
          <small className="mt-1 block truncate text-sm text-[#999]">{address.address}</small>
        </span>
      </button>
      <button type="button" className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-[#b6349a] transition hover:bg-[#b6349a]/[.06]" onClick={() => onRemove(address.id)} aria-label={`${address.label} adresini kaldır`}>
        Remove
      </button>
    </article>
  );
}
