import type { Address } from "../../types/address";

interface AddressCardProps {
  address: Address;
  selected: boolean;
  onSelect: (address: Address) => void;
  onRemove: (id: Address["id"]) => void;
}

export default function AddressCard({ address, selected, onSelect, onRemove }: AddressCardProps) {
  return (
    <article className={`address-card ${selected ? "active" : ""}`}>
      <button type="button" className="address-card__main" onClick={() => onSelect(address)}>
        <span className="address-card__radio" aria-hidden="true">{selected ? "✓" : ""}</span>
        <span>
          <strong>{address.label}</strong>
          <small>{address.address}</small>
        </span>
      </button>
      <button type="button" className="address-card__remove" onClick={() => onRemove(address.id)} aria-label={`${address.label} adresini kaldır`}>
        Remove
      </button>
    </article>
  );
}
