"use client";

import { DrinkPhoto } from "@/components/DrinkPhoto";
import { GlassReal } from "@/components/glassReal";
import type { MenuItem } from "@/domain/types";
import { factsOf } from "@/lib/facts";
import type { WorldId } from "@/lib/types";

/** The bar's photo, or the drink's glass drawn in its colour (same as the guest menu). */
export function ItemThumb({ item, world, size = 44 }: { item: Pick<MenuItem, "recipe" | "photo" | "slug" | "name">; world: WorldId; size?: number }) {
  if (item.photo) return <DrinkPhoto photo={item.photo} w={size} h={Math.round(size * 1.25)} lang="tr" name={item.name.tr} className="dp-thumb pn-thumb-photo" />;
  const f = factsOf(item.recipe);
  return (
    <GlassReal
      glass={item.recipe.glass}
      color={item.recipe.parts.length ? f.color : "transparent"}
      opaque={f.opaque}
      ice={item.recipe.ice}
      method={item.recipe.method}
      garnish={item.recipe.garnish}
      size={size}
      world={world}
      uid={`pt-${item.slug}`}
    />
  );
}
