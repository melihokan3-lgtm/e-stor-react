import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AuthContext } from "../auth/AuthContext";
import { readUserStorage, writeUserStorage } from "../../utils/userStorage";
import { deleteUserAddress, fetchUserAddresses, isSupabaseDataEnabled, saveUserAddress } from "../../services/supabase/data";
import type { Address, LocationContextValue } from "../../types/address";

export const DEFAULT_LOCATION = "Bursa, Türkiye";
export const LOCATION_OPTIONS = [
  "Bursa, Türkiye",
  "İstanbul, Türkiye",
  "Ankara, Türkiye",
  "İzmir, Türkiye",
];

export const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const [location, setLocation] = useState<string>(DEFAULT_LOCATION);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const userStorageId = user?.id ?? user?.email ?? user?.username ?? "guest";
  const hydratedLocationId = useRef<string | null>(null);
  const hydratedStorageId = useRef<string | null>(null);
  const isHydrating = useRef(false);

  useEffect(() => {
    const storedLocation = readUserStorage<string>("userLocation", user, DEFAULT_LOCATION);
    setLocation(storedLocation || DEFAULT_LOCATION);
    hydratedLocationId.current = String(userStorageId);
  }, [userStorageId]);

  useEffect(() => {
    if (hydratedLocationId.current === String(userStorageId)) {
      writeUserStorage("userLocation", user, location);
    }
  }, [location, user, userStorageId]);

  useEffect(() => {
    isHydrating.current = true;
    const hydrate = async () => {
      try {
        setAddresses(isSupabaseDataEnabled(user) ? await fetchUserAddresses(user) : readUserStorage("addresses", user, []));
      } catch (error) {
        console.error("Failed to load addresses", error);
        setAddresses([]);
      } finally {
        hydratedStorageId.current = String(userStorageId);
      }
    };
    hydrate();
  }, [userStorageId]);

  useEffect(() => {
    if (isHydrating.current) {
      isHydrating.current = false;
      return;
    }
    if (hydratedStorageId.current === String(userStorageId) && !isSupabaseDataEnabled(user)) {
      writeUserStorage("addresses", user, addresses);
    }
  }, [addresses, user, userStorageId]);

  const selectLocation = (nextLocation: string): void => {
    if (!nextLocation?.trim()) return;
    setLocation(nextLocation.trim());
    setIsLocationModalOpen(false);
  };

  const addAddress = ({ label, address }: Pick<Address, "label" | "address">): void => {
    const normalizedAddress = address.trim();
    if (!normalizedAddress) return;

    const nextAddress = {
      id: `${Date.now()}`,
      label: label.trim() || "Saved address",
      address: normalizedAddress,
    };
    setAddresses((previous) => [nextAddress, ...previous]);
    if (isSupabaseDataEnabled(user)) {
      saveUserAddress(user, nextAddress).catch((error) => console.error("Failed to save address", error));
    }
    selectLocation(normalizedAddress);
  };

  const removeAddress = (addressId: Address["id"]): void => {
    setAddresses((previous) => previous.filter((item) => item.id !== addressId));
    if (isSupabaseDataEnabled(user)) {
      deleteUserAddress(user, addressId).catch((error) => console.error("Failed to delete address", error));
    }
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

export const useLocation = (): LocationContextValue => {
  const context = useContext(LocationContext);
  if (!context) throw new Error("useLocation must be used inside LocationProvider.");
  return context;
};
