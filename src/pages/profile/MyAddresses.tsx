import { useLocation } from "../../features/addresses/LocationContext";
import AddressCard from "../../components/profile/AddressCard";

export default function MyAddresses() {
  const { location, addresses, selectLocation, removeAddress, openLocationModal } = useLocation();

  return (
    <div className="my-addresses-page">
      <div className="addresses-page-header">
        <div>
          <h2 className="profile-page-title">My Addresses</h2>
          <p className="addresses-current-location">Current location: {location}</p>
        </div>
        <button type="button" className="addresses-add-btn" onClick={openLocationModal}>
          <span aria-hidden="true">+</span> Add address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="addresses-empty">
          <h3>No saved addresses yet</h3>
          <p>OpenStreetMap üzerinden bir adres seçip daha hızlı ödeme için buraya kaydedebilirsin.</p>
          <button type="button" className="addresses-add-btn" onClick={openLocationModal}>
            Add your first address
          </button>
        </div>
      ) : (
        <div className="addresses-list">
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
