import { STORAGE_KEYS } from '@/config/constants';

export type FavoriteType = 'article' | 'service';

export interface FavoriteReference {
  id: string;
  type?: FavoriteType;
}

const guestStorageKey = STORAGE_KEYS.favorites('guest');
const legacyGuestStorageKey = 'favorites_undefined';

export function favoriteKey(type: FavoriteType, id: string) {
  return `${type}:${id}`;
}

function parseFavorites(value: string | null): FavoriteReference[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.flatMap((entry): FavoriteReference[] => {
      if (typeof entry !== 'string') return [];
      const [type, ...idParts] = entry.split(':');
      if ((type === 'article' || type === 'service') && idParts.length > 0) {
        return [{ type, id: idParts.join(':') }];
      }
      return entry ? [{ id: entry }] : [];
    });
  } catch {
    return [];
  }
}

function uniqueFavorites(favorites: FavoriteReference[]) {
  const seen = new Set<string>();
  return favorites.filter((favorite) => {
    const key = favoriteKey(favorite.type ?? 'article', favorite.id);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function readFavorites(userId?: string) {
  const keys = userId
    ? [STORAGE_KEYS.favorites(userId), guestStorageKey, legacyGuestStorageKey]
    : [guestStorageKey, legacyGuestStorageKey];

  return uniqueFavorites(keys.flatMap((key) => parseFavorites(localStorage.getItem(key))));
}

export function writeFavorites(userId: string | undefined, favorites: FavoriteReference[]) {
  const key = userId ? STORAGE_KEYS.favorites(userId) : guestStorageKey;
  localStorage.setItem(key, JSON.stringify(favorites.map((favorite) => favoriteKey(favorite.type ?? 'article', favorite.id))));
}

export function hasFavorite(favorites: FavoriteReference[], type: FavoriteType, id: string) {
  return favorites.some((favorite) => favorite.id === id && (!favorite.type || favorite.type === type));
}
