/**
 * Photographs for the kitchen & cellar library (data/kitchen.ts), from Unsplash
 * (https://unsplash.com/license): a real dish or glass that looks like the line,
 * chosen through the official API, checked by eye (no logos, no faces) and shown
 * as "Temsili görsel" with the photographer's credit. Keyed by library id. A bar
 * that picks the line gets the photo and can remove it or upload its own.
 */
import type { StockPhoto } from "./stockPhotos";

export const KITCHEN_PHOTOS: Record<string, Omit<StockPhoto, "alt">> = {};
