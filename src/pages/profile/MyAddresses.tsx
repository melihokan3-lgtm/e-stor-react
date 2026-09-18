import { useLocation } from "../../features/addresses/LocationContext";
import { AddressCard, ProfileEmptyState } from "../../components/profile";

export default function MyAddresses() {
  const { location, addresses, selectLocation, removeAddress, openLocationModal } = useLocation();

  return (
    <div className="w-full">
      <div className="mb-8 flex items-start justify-between gap-4 max-sm:flex-col">
        <div>
          <h2 className="mb-2 text-[28px] font-extrabold text-[#111]">My Addresses</h2>
          <p className="m-0 text-sm text-[#999]">Current location: {location}</p>
        </div>
        <button type="button" className="rounded-lg bg-[#b6349a] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#92277a]" onClick={openLocationModal}>
          <span aria-hidden="true">+</span> Add address
        </button>
      </div>

      {addresses.length === 0 ? (
        <ProfileEmptyState largeRadius>
          <h3 className="mb-2 text-lg font-bold text-[#111]">No saved addresses yet</h3>
          <p className="mb-5 text-sm text-[#777]">OpenStreetMap üzerinden bir adres seçip daha hızlı ödeme için buraya kaydedebilirsin.</p>
          <button type="button" className="rounded-lg bg-[#b6349a] px-4 py-2.5 text-sm font-semibold text-white" onClick={openLocationModal}>
            Add your first address
          </button>
        </ProfileEmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {addresses.map((item) => (
            <AddressCard
              key={item.id}
              address={item}
              selected={location === item.address}
              onSelect={(address) => selectLocation(address.address)}
              onRemove={removeAddress}
            />
          ))}
        </div>
      )}
    </div>
  );
}
