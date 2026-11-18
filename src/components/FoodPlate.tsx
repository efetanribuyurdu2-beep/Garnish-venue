import type { WorldId } from "@/lib/types";

/**
 * Food, drawn like the glasses (same light, same 120×160 frame): a glazed
 * ceramic plate seen from just above, and on it a meze trio, a bowl of
 * olives and nuts, or a slice of dessert. Hook-free, filter-free.
 */
const RIM: Partial<Record<WorldId, string>> = { maison: "#d9b25f", anatolia: "#d9a521", jazz: "#d9b25f", riviera: "#e3b341" };

export function FoodPlate({ style = "meze", size = 120, world, uid }: { style?: string; size?: number; world: WorldId; uid: string }) {
  const id = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  const rim = RIM[world];
  return (
    <svg width={size} height={(size * 160) / 120} viewBox="0 0 120 160" className="glass-art food-plate" aria-hidden>
      <defs>
        <radialGradient id={`pl${id}`} cx=".42" cy=".38" r=".75">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".6" stopColor="#f2eee6" />
          <stop offset="1" stopColor="#cfc8bb" />
        </radialGradient>
        <radialGradient id={`wl${id}`} cx=".45" cy=".4" r=".7">
          <stop offset="0" stopColor="#fbf9f4" />
          <stop offset="1" stopColor="#e2dbcf" />
        </radialGradient>
        <radialGradient id={`sh${id}`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`gl${id}`} cx=".35" cy=".3" r=".7">
          <stop offset="0" stopColor="#fff" stopOpacity=".7" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="62" cy="118" rx="58" ry="14" fill={`url(#sh${id})`} />
      {/* plate: rim, well, a thin coloured line */}
      <ellipse cx="60" cy="110" rx="54" ry="19" fill={`url(#pl${id})`} />
      <ellipse cx="60" cy="110" rx="54" ry="19" fill="none" stroke="#000" strokeOpacity=".18" strokeWidth=".8" />
      <ellipse cx="60" cy="109" rx="38" ry="12.5" fill={`url(#wl${id})`} />
      <ellipse cx="60" cy="109" rx="47" ry="16" fill="none" stroke={rim ?? "#9aa4ad"} strokeOpacity={rim ? 0.9 : 0.5} strokeWidth={rim ? 1.1 : 0.7} />
      <path d="M14 106 Q28 96 52 93" stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".9" />

      {style === "meze" && (
        <g>
          {/* three dips: haydari, acılı ezme, fava, with an olive and a mint leaf */}
          <ellipse cx="44" cy="106" rx="11" ry="5.5" fill="#f4f0e2" />
          <ellipse cx="44" cy="104.6" rx="8" ry="3.4" fill="#fffdf6" />
          <path d="M39 104 q4 -2 9 0" stroke="#7aa54a" strokeWidth="1.2" fill="none" />
          <ellipse cx="70" cy="105" rx="11" ry="5.5" fill="#b8321e" />
          <ellipse cx="70" cy="103.6" rx="8" ry="3.2" fill="#d0472a" />
          {[[66, 103.5], [72, 102.8], [74, 104.6], [68, 105.2]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r=".7" fill="#7a1a0c" />
          ))}
          <ellipse cx="58" cy="113.5" rx="11" ry="5" fill="#e7c766" />
          <ellipse cx="58" cy="112.2" rx="8" ry="3" fill="#f1d77e" />
          <path d="M54 112 h8" stroke="#6f8f3a" strokeWidth="1.4" strokeLinecap="round" />
          <ellipse cx="84" cy="112" rx="3.4" ry="2.6" fill="#3d3a1e" />
          <ellipse cx="83" cy="111.2" rx="1.2" ry=".7" fill="#fff" opacity=".5" />
        </g>
      )}
      {style === "snack" && (
        <g>
          {/* a small glazed bowl of olives and almonds */}
          <path d="M40 104 Q40 118 60 118 Q80 118 80 104 Z" fill="#1f3a6b" />
          <path d="M42 108 Q50 116 60 116" stroke="#fff" strokeOpacity=".35" strokeWidth="1.4" fill="none" />
          <ellipse cx="60" cy="104" rx="20" ry="5" fill="#2a4a80" />
          {[[50, 102, "#4d5a22"], [57, 100.5, "#3b4518"], [64, 101.5, "#5a6a2a"], [70, 102.6, "#3f4a1c"], [54, 104.6, "#b98a55"], [62, 105, "#c4955e"], [68, 105.4, "#b07f4b"]].map(([x, y, c], i) => (
            <g key={i}>
              <ellipse cx={x as number} cy={y as number} rx="3.4" ry="2.4" fill={c as string} />
              <ellipse cx={(x as number) - 1} cy={(y as number) - 0.8} rx="1.2" ry=".6" fill="#fff" opacity=".45" />
            </g>
          ))}
        </g>
      )}
      {style === "sweet" && (
        <g>
          {/* a slice of cake with cream and a berry */}
          <path d="M44 110 L76 104 L78 112 L46 118 Z" fill="#7a3e1c" />
          <path d="M44 110 L76 104 L74 98 L46 102 Z" fill="#f4e9d4" />
          <path d="M46 102 L74 98 L72 95 L48 99 Z" fill="#5a2a12" />
          <path d="M45 106 L77 100" stroke="#f4e9d4" strokeWidth="1.6" />
          <circle cx="66" cy="94.5" r="3.2" fill="#a3122a" />
          <circle cx="65" cy="93.5" r="1" fill="#fff" opacity=".6" />
          <path d="M66 91.6 q2 -3 4 -3" stroke="#3d6b2a" strokeWidth="1.2" fill="none" />
          <path d="M84 114 q4 -1 8 1" stroke="#7a3e1c" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity=".7" />
        </g>
      )}
      <ellipse cx="44" cy="102" rx="26" ry="7" fill={`url(#gl${id})`} opacity=".35" />
    </svg>
  );
}
