export const getUserStorageId = (user) => {
  if (!user) return "guest";
  return String(user.id ?? user.email ?? user.username ?? "guest");
};

export const getUserStorageKey = (prefix, user) =>
  `${prefix}_${encodeURIComponent(getUserStorageId(user))}`;

export const readUserStorage = (prefix, user, fallback) => {
  try {
    const stored = localStorage.getItem(getUserStorageKey(prefix, user));
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    console.error(`Failed to read ${prefix} from localStorage`, error);
    return fallback;
  }
};

export const writeUserStorage = (prefix, user, value) => {
  localStorage.setItem(getUserStorageKey(prefix, user), JSON.stringify(value));
};
