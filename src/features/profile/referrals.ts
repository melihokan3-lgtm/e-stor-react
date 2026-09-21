import type { AuthUser } from "../../types/auth";
import { readUserStorage, writeUserStorage } from "../../utils/userStorage";

interface ReferralHistoryItem {
  name: string;
  status: string;
  type: "pending" | "success" | "idle";
}

export interface ReferralData {
  totalEarned: number;
  friendsInvited: number;
  pendingApprovals: number;
  history: ReferralHistoryItem[];
}

const EMPTY_REFERRAL_DATA: ReferralData = {
  totalEarned: 0,
  friendsInvited: 0,
  pendingApprovals: 0,
  history: [],
};

const INITIAL_REFERRAL_DATA: ReferralData = {
  totalEarned: 300,
  friendsInvited: 5,
  pendingApprovals: 2,
  history: [
    { name: "Ahmet Y.", status: "Üye Oldu (Beklemede)", type: "pending" },
    { name: "Ayşe K.", status: "Sipariş Verdi (Kazanıldı)", type: "success" },
    { name: "Mehmet D.", status: "Sipariş Verdi (Kazanıldı)", type: "success" },
    { name: "Zeynep T.", status: "Sipariş Verdi (Kazanıldı)", type: "success" },
    { name: "Can S.", status: "Kayıt Bekleniyor", type: "idle" },
  ],
};

export function loadReferralData(user: AuthUser | null): ReferralData {
  if (!user) return EMPTY_REFERRAL_DATA;
  const stored = readUserStorage<ReferralData | null>("referralData", user, null);
  if (stored && Array.isArray(stored.history)) return stored;
  writeUserStorage("referralData", user, INITIAL_REFERRAL_DATA);
  return INITIAL_REFERRAL_DATA;
}
