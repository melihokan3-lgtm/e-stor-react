import { useLocation } from "../../features/addresses/LocationContext";

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
            <article className={`address-card ${location === item.address ? "active" : ""}`} key={item.id}>
              <button type="button" className="address-card__main" onClick={() => selectLocation(item.address)}>
                <span className="address-card__radio" aria-hidden="true">{location === item.address ? "✓" : ""}</span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.address}</small>
                </span>
              </button>
              <button type="button" className="address-card__remove" onClick={() => removeAddress(item.id)}>
                Remove
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
