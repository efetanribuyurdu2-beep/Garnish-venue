"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Photo } from "@/domain/types";

/** Longest edge kept on upload: sharp on a 3× phone at the drink page's size, small to serve. */
export const MAX_EDGE = 1600;

/** Shrinks a phone photo in the browser (WebP, ≤ MAX_EDGE) and measures its average colour. */
async function prepare(file: File): Promise<{ blob: Blob; color: string }> {
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const k = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * k);
  canvas.height = Math.round(bmp.height * k);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  // average colour from a 1×1 downscale, painted behind the photo while it loads
  const dot = document.createElement("canvas");
  dot.width = dot.height = 1;
  dot.getContext("2d")!.drawImage(canvas, 0, 0, 1, 1);
  const [r, g, b] = dot.getContext("2d")!.getImageData(0, 0, 1, 1).data;
  const color = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  const blob = await new Promise<Blob>((ok, fail) => canvas.toBlob((x) => (x ? ok(x) : fail(new Error("encode"))), "image/webp", 0.84));
  return { blob, color };
}

/** Uploads a drink photo to the venue's folder and returns the Photo to store on the item. */
export async function uploadDrinkPhoto(db: SupabaseClient, venueId: string, itemSlug: string, file: File): Promise<Photo> {
  const { blob, color } = await prepare(file);
  const path = `${venueId}/${itemSlug}-${Date.now().toString(36)}.webp`;
  const { error } = await db.storage.from("menu-photos").upload(path, blob, { contentType: "image/webp", cacheControl: "31536000" });
  if (error) throw error;
  const { data } = db.storage.from("menu-photos").getPublicUrl(path);
  return { url: data.publicUrl, color };
}
