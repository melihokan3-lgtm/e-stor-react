import type { AuthUser } from "../../types/auth";
import { readUserStorage, removeUserStorage, writeUserStorage } from "../../utils/userStorage";

export const DEFAULT_SETTINGS = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  dob: "",
  language: "tr",
  currency: "TRY",
  twoFactorAuth: false,
  notifOrder: "email",
  notifCampaigns: true,
  notifPriceAlerts: false,
  cookieConsent: true,
  personalizedAds: true,
};

export type AccountSettingsData = typeof DEFAULT_SETTINGS;

export function loadAccountSettings(user: AuthUser | null): AccountSettingsData {
  if (!user) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...readUserStorage<Partial<AccountSettingsData>>("settings", user, {}) };
}

export function saveAccountSettings(user: AuthUser | null, settings: AccountSettingsData): void {
  if (!user) return;
  writeUserStorage("settings", user, settings);
}

export function clearLocalAccountData(user: AuthUser | null): void {
  if (!user) return;
  for (const key of ["cart", "orders", "addresses", "settings", "savedCards", "notifications", "referralData"]) {
    removeUserStorage(key, user);
  }
}
