export interface Address {
  id: string;
  label: string;
  address: string;
  is_default?: boolean;
  created_at?: string;
}

export interface LocationContextValue {
  location: string;
  addresses: Address[];
  selectLocation: (location: string) => void;
  addAddress: (input: Pick<Address, "label" | "address">) => void;
  removeAddress: (id: Address["id"]) => void;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
}
