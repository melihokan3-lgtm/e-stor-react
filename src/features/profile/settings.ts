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
  const saved = readUserStorage<Partial<AccountSettingsData>>("settings", user, {});
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    firstName: typeof saved.firstName === "string" ? saved.firstName : DEFAULT_SETTINGS.firstName,
    lastName: typeof saved.lastName === "string" ? saved.lastName : DEFAULT_SETTINGS.lastName,
    phone: typeof saved.phone === "string" ? saved.phone : DEFAULT_SETTINGS.phone,
    email: typeof saved.email === "string" ? saved.email : DEFAULT_SETTINGS.email,
    dob: typeof saved.dob === "string" ? saved.dob : DEFAULT_SETTINGS.dob,
    language: typeof saved.language === "string" ? saved.language : DEFAULT_SETTINGS.language,
    currency: typeof saved.currency === "string" ? saved.currency : DEFAULT_SETTINGS.currency,
    twoFactorAuth: typeof saved.twoFactorAuth === "boolean" ? saved.twoFactorAuth : DEFAULT_SETTINGS.twoFactorAuth,
    notifOrder: typeof saved.notifOrder === "string" ? saved.notifOrder : DEFAULT_SETTINGS.notifOrder,
    notifCampaigns: typeof saved.notifCampaigns === "boolean" ? saved.notifCampaigns : DEFAULT_SETTINGS.notifCampaigns,
    notifPriceAlerts: typeof saved.notifPriceAlerts === "boolean" ? saved.notifPriceAlerts : DEFAULT_SETTINGS.notifPriceAlerts,
    cookieConsent: typeof saved.cookieConsent === "boolean" ? saved.cookieConsent : DEFAULT_SETTINGS.cookieConsent,
    personalizedAds: typeof saved.personalizedAds === "boolean" ? saved.personalizedAds : DEFAULT_SETTINGS.personalizedAds,
  };
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
