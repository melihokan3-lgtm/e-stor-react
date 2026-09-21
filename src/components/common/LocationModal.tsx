import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation } from "../../features/addresses/LocationContext";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Modal from "./ui/Modal";

type LatLngTuple = [number, number];
type AddressData = Record<string, string | undefined>;

interface LeafletMap {
  setView(center: LatLngTuple, zoom: number): LeafletMap;
  on(event: "click", handler: (event: { latlng: { lat: number; lng: number } }) => void): LeafletMap;
  invalidateSize(): void;
  remove(): void;
}

interface LeafletMarker {
  addTo(map: LeafletMap): LeafletMarker;
  setLatLng(position: LatLngTuple): LeafletMarker;
}

interface LeafletApi {
  map(element: HTMLElement): LeafletMap;
  tileLayer(url: string, options: { attribution: string; maxZoom: number }): { addTo(map: LeafletMap): void };
  marker(position: LatLngTuple): LeafletMarker;
}

interface NominatimResult {
  address?: AddressData;
  display_name?: string;
}

declare global {
  interface Window {
    L?: LeafletApi;
  }
}

const BURSA_CENTER: LatLngTuple = [40.195, 29.06];
let leafletPromise: Promise<LeafletApi> | null = null;

const loadLeaflet = (): Promise<LeafletApi> => {
  if (window.L) return Promise.resolve(window.L);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise<LeafletApi>((resolve, reject) => {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(stylesheet);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      if (window.L) resolve(window.L);
      else reject(new Error("Leaflet API bulunamadı."));
    };
    script.onerror = () => reject(new Error("Leaflet yüklenemedi."));
    document.body.appendChild(script);
  });

  return leafletPromise;
};

const firstValue = (...values: unknown[]): string => {
  const value = values.find((item): item is string => typeof item === "string" && Boolean(item.trim()));
  return value?.trim() || "";
};

const uniqueParts = (parts: string[]): string[] => [...new Set(parts.filter(Boolean).map((part) => part.trim()))];

const normalizeLocationText = (value = ""): string => value
  .toLocaleLowerCase("tr-TR")
  .replace(/\s+belediyesi$/u, "")
  .trim();

const getDistrict = (address: AddressData = {}): string => {
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

const formatAddress = (address: AddressData = {}, displayName = ""): string => {
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

const reverseGeocode = async (lat: number, lng: number, zoom: number): Promise<NominatimResult> => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=${zoom}&addressdetails=1&accept-language=tr`,
    { headers: { Accept: "application/json" } },
  );
  if (!response.ok) throw new Error("Adres servisi yanıt vermedi.");
  return (await response.json()) as NominatimResult;
};

export default function LocationModal() {
  const { location, addresses, selectLocation, isLocationModalOpen, addAddress, closeLocationModal } = useLocation();
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const [label, setLabel] = useState("Home");
  const [address, setAddress] = useState(location);
  const [mapStatus, setMapStatus] = useState<"idle" | "loading" | "geocoding" | "ready" | "error">("idle");
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
            setMapError(error instanceof Error ? error.message : "Adres bulunamadı. Lütfen tekrar deneyin.");
          }
        });

        setTimeout(() => map.invalidateSize(), 0);
      })
      .catch((error) => {
        if (!cancelled) {
          setMapStatus("error");
          setMapError(error instanceof Error ? error.message : "Harita yüklenemedi.");
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
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") closeLocationModal();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isLocationModalOpen, closeLocationModal]);

  if (!isLocationModalOpen) return null;

  const handleSave = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    addAddress({ label, address });
  };

  return (
    <Modal
      open={isLocationModalOpen}
      onClose={closeLocationModal}
      overlayClassName="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-[rgba(22,16,22,0.38)] p-5"
      contentClassName="max-h-[calc(100dvh-40px)] w-[min(100%,560px)] overflow-y-auto overscroll-contain rounded-[20px] border border-[#f2e8f0] bg-white p-7 shadow-[0_22px_70px_rgba(42,22,40,0.18)] [touch-action:pan-y]"
      labelledBy="location-modal-title"
    >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#b6349a]">Delivery location</p>
            <h2 id="location-modal-title" className="m-0 text-xl font-semibold text-[#222]">Choose your delivery point</h2>
          </div>
          <Button type="button" tone="ghost" className="h-9 w-9 rounded-full text-xl text-[#777] hover:bg-[#fff5fc] hover:text-[#b6349a]" aria-label="Close location dialog" onClick={closeLocationModal}>×</Button>
        </div>

        <div ref={mapElementRef} className="my-5 h-[260px] w-full overflow-hidden rounded-[14px] border border-[#eee7ee]" aria-label="OpenStreetMap location picker" />
        <p className="m-0 text-xs text-[#777]">
          {mapStatus === "loading" && "Harita yükleniyor..."}
          {mapStatus === "geocoding" && "Adres bulunuyor..."}
          {mapStatus === "ready" && "Haritada bir noktaya tıklayarak adresi seç."}
          {mapStatus === "error" && "Harita yüklenemedi."}
        </p>
        {mapError && <p className="mt-2 text-xs text-[#c0395f]">{mapError}</p>}

        <form className="mb-[22px] grid gap-[7px]" onSubmit={handleSave}>
          <label className="text-xs font-semibold text-[#444]" htmlFor="location-label">Adres adı</label>
          <Input className="w-full rounded-[10px] border border-[#e7dfe7] px-3 py-2 text-sm outline-none focus:border-[#b6349a]" id="location-label" value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Ev, İş..." />
          <label className="mt-2 text-xs font-semibold text-[#444]" htmlFor="location-address">Sokak, mahalle, ilçe ve il</label>
          <Input className="w-full rounded-[10px] border border-[#e7dfe7] px-3 py-2 text-sm outline-none focus:border-[#b6349a]" id="location-address" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Haritadan bir nokta seç" required />
          <Button type="submit" className="mt-3 w-full rounded-[10px] bg-[#b6349a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#98277f]">Konumu kaydet</Button>
        </form>

        {addresses.length > 0 && (
          <div className="grid gap-2.5" role="listbox" aria-label="Saved locations">
            <p className="m-0 text-sm font-semibold text-[#333]">Kayıtlı adresler</p>
            {addresses.map((item) => (
              <button key={item.id} type="button" role="option" aria-selected={location === item.address} className={`flex min-h-[52px] items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${location === item.address ? "border-[#b6349a] bg-[#fff5fc]" : "border-[#eee7ee] bg-white hover:border-[#d4a2ca]"}`} onClick={() => selectLocation(item.address)}>
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#fff0fa]" aria-hidden="true"><img src="/img/icon/Location.svg" alt="" aria-hidden="true" width={16} height={16} className="h-4 w-4" /></span>
                <span className="min-w-0"><strong className="block text-sm text-[#333]">{item.label}</strong><small className="block truncate text-xs text-[#888]">{item.address}</small></span>
                {location === item.address && <span className="ml-auto text-sm font-bold text-[#b6349a]" aria-hidden="true">✓</span>}
              </button>
            ))}
          </div>
        )}
    </Modal>
  );
}
