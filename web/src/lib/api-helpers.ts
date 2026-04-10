export const FALLBACK_PRODUCT_IMAGE =
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600';

export function safeArray<T>(value: T[] | unknown): T[] {
  return Array.isArray(value) ? value : [];
}

export function apiDataArray<T>(response: unknown): T[] {
  const data = (response as { data?: { data?: unknown } })?.data?.data;
  return safeArray<T>(data);
}

export function apiData<T>(response: unknown): T | null {
  return ((response as { data?: { data?: T } })?.data?.data ?? null) as T | null;
}

export function firstImage(imageUrls: string[] | unknown, fallback = FALLBACK_PRODUCT_IMAGE): string {
  const images = safeArray<string>(imageUrls);
  return images[0] || fallback;
}
