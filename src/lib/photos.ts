import type { Photo } from "@/domain/types";

/**
 * Sized URL for a photo. Unsplash raw URLs take imgix parameters (crop to the
 * frame, modern format); Supabase public URLs are served as uploaded (the
 * uploader already resized them to MAX_EDGE).
 */
export function photoSrc(p: Photo, w: number, h: number, dpr = 2) {
  if (p.url.includes("images.unsplash.com")) {
    const sep = p.url.includes("?") ? "&" : "?";
    return `${p.url}${sep}w=${w * dpr}&h=${h * dpr}&fit=crop&crop=entropy&q=72&auto=format`;
  }
  return p.url;
}

export const unsplashRef = (url: string) => `${url}${url.includes("?") ? "&" : "?"}utm_source=garnish_venue&utm_medium=referral`;
