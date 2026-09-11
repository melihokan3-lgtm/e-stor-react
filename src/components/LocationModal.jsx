import { useEffect, useRef, useState } from "react";
import { useLocation } from "../context/LocationContext";

const BURSA_CENTER = [40.195, 29.06];
let leafletPromise;

const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise((resolve, reject) => {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(stylesheet);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error("Leaflet yüklenemedi."));
    document.body.appendChild(script);
  });

  return leafletPromise;
};

const firstValue = (...values) => values.find(
  (value) => typeof value === "string" && value.trim(),
);

const uniqueParts = (parts) => [...new Set(parts.filter(Boolean).map((part) => part.trim()))];

const normalizeLocationText = (value = "") => value
  .toLocaleLowerCase("tr-TR")
  .replace(/\s+belediyesi$/u, "")
  .trim();

const getDistrict = (address = {}) => {
  const city = normalizeLocationText(firstValue(
    address.city,
    address.province,
    address.state,
    address.region,
  ));
  const candidates = [
    address.city_district,
    address.district,
    address.state_district,
    address.county,
    address.town,
    address.locality,
    address.municipality,
  ];

  const candidate = candidates.find(
    (value) => value && normalizeLocationText(value) !== city,
  );

  return candidate ? candidate.replace(/\s+belediyesi$/iu, "").trim() : "";
};

const formatAddress = (address = {}, displayName = "") => {
  // Nominatim, aynı bilgiyi şehir ve ülkeye göre farklı alanlarda döndürebilir.
  const street = firstValue(
    address.road,
    address.street,
    address.pedestrian,
    address.footway,
    address.living_street,
    address.cycleway,
    address.path,
  );
  const neighbourhood = firstValue(
    address.neighbourhood,
    address.quarter,
    address.suburb,
    address.hamlet,
  );
  const district = getDistrict(address);
  const city = firstValue(
    address.city,
    address.province,
    address.state,
    address.region,
  );

  const parts = uniqueParts([street, neighbourhood, district, city]);
  if (parts.length > 0) return parts.join(", ");

  return displayName || "Seçilen konum";
};

const reverseGeocode = async (lat, lng, zoom) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=${zoom}&addressdetails=1&accept-language=tr`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) throw new Error("Adres servisi yanıt vermedi.");
  return response.json();
};

export default function LocationModal() {
  const { location, addresses, selectLocation, isLocationModalOpen, addAddress, closeLocationModal } = useLocation();
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [label, setLabel] = useState("Home");
  const [address, setAddress] = useState(location);
  const [mapStatus, setMapStatus] = useState("idle");
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    if (isLocationModalOpen) setAddress(location);
  }, [isLocationModalOpen, location]);

  useEffect(() => {
    if (!isLocationModalOpen || !mapElementRef.current) return undefined;

    let cancelled = false;
    setMapStatus("loading");
    setMapError("");

    loadLeaflet()
      .then((L) => {
        if (cancelled || !mapElementRef.current) return;

        const map = L.map(mapElementRef.current).setView(BURSA_CENTER, 12);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker(BURSA_CENTER).addTo(map);
        mapRef.current = map;
        markerRef.current = marker;
        setMapStatus("ready");

        map.on("click", async (event) => {
          const { lat, lng } = event.latlng;
          marker.setLatLng([lat, lng]);
          setMapStatus("geocoding");
          setMapError("");

          try {
            const detailData = await reverseGeocode(lat, lng, 18);
            let addressData = detailData;

            // Sokak sonucu ilçe alanını içermiyorsa ilçe seviyesinden tamamla.
            if (!getDistrict(detailData.address)) {
              const districtData = await reverseGeocode(lat, lng, 10);
              addressData = {
                ...detailData,
                address: { ...districtData.address, ...detailData.address },
              };
            }

            setAddress(formatAddress(addressData.address, addressData.display_name));
            setMapStatus("ready");
          } catch (error) {
            setMapStatus("ready");
            setMapError(error.message || "Adres bulunamadı. Lütfen tekrar deneyin.");
          }
        });

        setTimeout(() => map.invalidateSize(), 0);
      })
      .catch((error) => {
        if (!cancelled) {
          setMapStatus("error");
          setMapError(error.message);
        }
      });

    return () => {
      cancelled = true;
      if (mapRef.current) mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [isLocationModalOpen]);

  useEffect(() => {
    if (!isLocationModalOpen) return undefined;
    const handleKeyDown = (event) => event.key === "Escape" && closeLocationModal();
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLocationModalOpen, closeLocationModal]);

  if (!isLocationModalOpen) return null;

  const handleSave = (event) => {
    event.preventDefault();
    addAddress({ label, address });
  };

  return (
    <div className="location-modal-overlay" role="presentation" onClick={closeLocationModal}>
      <div className="location-modal location-modal--map" role="dialog" aria-modal="true" aria-labelledby="location-modal-title" onClick={(event) => event.stopPropagation()}>
        <div className="location-modal__header">
          <div>
            <p className="location-modal__eyebrow">Delivery location</p>
            <h2 id="location-modal-title">Choose your delivery point</h2>
          </div>
          <button type="button" className="location-modal__close" aria-label="Close location dialog" onClick={closeLocationModal}>×</button>
        </div>

        <div ref={mapElementRef} className="location-map" aria-label="OpenStreetMap location picker" />
        <p className="location-map-status">
          {mapStatus === "loading" && "Harita yükleniyor..."}
          {mapStatus === "geocoding" && "Adres bulunuyor..."}
          {mapStatus === "ready" && "Haritada bir noktaya tıklayarak adresi seç."}
          {mapStatus === "error" && "Harita yüklenemedi."}
        </p>
        {mapError && <p className="location-map-error">{mapError}</p>}

        <form className="location-form" onSubmit={handleSave}>
          <label htmlFor="location-label">Adres adı</label>
          <input id="location-label" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Ev, İş..." />
          <label htmlFor="location-address">Sokak, mahalle, ilçe ve il</label>
          <input id="location-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Haritadan bir nokta seç" required />
          <button type="submit" className="location-save-btn">Konumu kaydet</button>
        </form>

        {addresses.length > 0 && (
          <div className="location-options" role="listbox" aria-label="Saved locations">
            <p className="location-options__title">Kayıtlı adresler</p>
            {addresses.map((item) => (
              <button key={item.id} type="button" role="option" aria-selected={location === item.address} className={`location-option ${location === item.address ? "active" : ""}`} onClick={() => selectLocation(item.address)}>
                <span className="location-option__icon" aria-hidden="true"><img src="/img/icon/Location.svg" alt="" /></span>
                <span><strong>{item.label}</strong><small>{item.address}</small></span>
                {location === item.address && <span className="location-option__check" aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
