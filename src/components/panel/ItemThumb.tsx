"use client";

import { DrinkPhoto } from "@/components/DrinkPhoto";
import { ItemVisual } from "@/components/ItemVisual";
import type { MenuItem } from "@/domain/types";
import type { WorldId } from "@/lib/types";

/** The bar's photo, or the item drawn (glass in the drink's colour, wine glass, plate…), as on the guest menu. */
export function ItemThumb({ item, world, size = 44 }: { item: Pick<MenuItem, "recipe" | "photo" | "slug" | "name" | "kind" | "details" | "extraAllergens">; world: WorldId; size?: number }) {
  if (item.photo) return <DrinkPhoto photo={item.photo} w={size} h={Math.round(size * 1.25)} lang="tr" name={item.name.tr} className="dp-thumb pn-thumb-photo" />;
  return <ItemVisual item={item} world={world} size={size} uid={`pt-${item.slug}`} />;
}
