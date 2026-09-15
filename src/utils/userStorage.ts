export interface StorageUser {
  id?: string | number;
  email?: string;
  username?: string;
}

export const getUserStorageId = (user: StorageUser | null | undefined): string => {
  if (!user) return "guest";
  return String(user.id ?? user.email ?? user.username ?? "guest");
};

export const getUserStorageKey = (prefix: string, user: StorageUser | null | undefined): string =>
  `${prefix}_${encodeURIComponent(getUserStorageId(user))}`;

export const readUserStorage = <T>(prefix: string, user: StorageUser | null | undefined, fallback: T): T => {
  try {
    const stored = localStorage.getItem(getUserStorageKey(prefix, user));
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.error(`Failed to read ${prefix} from localStorage`, error);
    return fallback;
  }
};

export const writeUserStorage = <T>(prefix: string, user: StorageUser | null | undefined, value: T): void => {
  localStorage.setItem(getUserStorageKey(prefix, user), JSON.stringify(value));
};

export const removeUserStorage = (prefix: string, user: StorageUser | null | undefined): void => {
  localStorage.removeItem(getUserStorageKey(prefix, user));
};
