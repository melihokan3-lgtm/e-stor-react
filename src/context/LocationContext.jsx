import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import { readUserStorage, writeUserStorage } from "../utils/userStorage";

export const DEFAULT_LOCATION = "Bursa, Türkiye";
export const LOCATION_OPTIONS = [
  "Bursa, Türkiye",
  "İstanbul, Türkiye",
  "Ankara, Türkiye",
  "İzmir, Türkiye",
];

export const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [location, setLocation] = useState(() => {
    try {
      return localStorage.getItem("userLocation") || DEFAULT_LOCATION;
    } catch (error) {
      console.error("Failed to read user location", error);
      return DEFAULT_LOCATION;
    }
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const userStorageId = user?.id ?? user?.email ?? user?.username ?? "guest";
  const hydratedStorageId = useRef(null);
  const isHydrating = useRef(false);

  useEffect(() => {
    localStorage.setItem("userLocation", location);
  }, [location]);

  useEffect(() => {
    isHydrating.current = true;
    setAddresses(readUserStorage("addresses", user, []));
    hydratedStorageId.current = String(userStorageId);
  }, [userStorageId]);

  useEffect(() => {
    if (isHydrating.current) {
      isHydrating.current = false;
      return;
    }
    if (hydratedStorageId.current === String(userStorageId)) {
      writeUserStorage("addresses", user, addresses);
    }
  }, [addresses, user, userStorageId]);

  const selectLocation = (nextLocation) => {
    if (!nextLocation?.trim()) return;
    setLocation(nextLocation.trim());
    setIsLocationModalOpen(false);
  };

  const addAddress = ({ label, address }) => {
    const normalizedAddress = address.trim();
    if (!normalizedAddress) return;

    const nextAddress = {
      id: `${Date.now()}`,
      label: label.trim() || "Saved address",
      address: normalizedAddress,
    };
    setAddresses((previous) => [nextAddress, ...previous]);
    selectLocation(normalizedAddress);
  };

  const removeAddress = (addressId) => {
    setAddresses((previous) => previous.filter((item) => item.id !== addressId));
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        addresses,
        selectLocation,
        addAddress,
        removeAddress,
        isLocationModalOpen,
        openLocationModal: () => setIsLocationModalOpen(true),
        closeLocationModal: () => setIsLocationModalOpen(false),
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export const useLocation = () => useContext(LocationContext);
