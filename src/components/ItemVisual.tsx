import type { MenuItem } from "@/domain/types";
import { itemFacts } from "@/lib/facts";
import { lookOf } from "@/lib/itemLook";
import type { WorldId } from "@/lib/types";
import { FoodPlate } from "./FoodPlate";
import { GlassReal } from "./glassReal";

/** The drawing for any menu line: the cocktail's glass, the wine glass, the beer, the plate… Hook-free. */
export function ItemVisual({ item, world, size, uid }: { item: Pick<MenuItem, "kind" | "recipe" | "details" | "extraAllergens">; world: WorldId; size: number; uid: string }) {
  const f = itemFacts(item);
  const look = lookOf(item, { color: item.recipe && item.recipe.parts.length === 0 ? "transparent" : f.color, opaque: f.opaque });
  if (look.kind === "plate") return <FoodPlate style={look.style} size={size} world={world} uid={uid} />;
  return <GlassReal glass={look.glass} color={look.color} opaque={look.opaque} ice={look.ice} method={look.method} garnish={look.garnish} size={size} world={world} uid={uid} />;
}
