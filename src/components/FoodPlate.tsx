import type { WorldId } from "@/lib/types";

/**
 * Food, drawn like the glasses (same light, same 120×160 frame): a glazed
 * ceramic plate seen from just above, and on it the dish: a meze trio, a bowl
 * of olives, a slice of cake, fries, cheeses, oysters on the half shell, a
 * golden fry, bruschetta, börek rolls, a crème brûlée, baklava, greens,
 * skewers or fanned slices of cured fish (`dish`, see Dish in data/kitchen.ts;
 * otherwise chosen by style). Hook-free, filter-free.
 */
const BY_STYLE: Record<string, string> = { meze: "dips", snack: "olives", sweet: "cake" };
const RIM: Partial<Record<WorldId, string>> = { maison: "#d9b25f", anatolia: "#d9a521", jazz: "#d9b25f", riviera: "#e3b341" };

export function FoodPlate({ style = "meze", dish, size = 120, world, uid }: { style?: string; dish?: string; size?: number; world: WorldId; uid: string }) {
  const d = dish ?? BY_STYLE[style] ?? "dips";
  const close = size <= 110;
  const id = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  const rim = RIM[world];
  return (
    // small sizes (menu thumbnails) are a close-up of the dish; large ones show the whole plate on the counter
    <svg width={size} height={close ? (size * 50) / 84 : (size * 160) / 120} viewBox={close ? "18 78 84 50" : "0 0 120 160"} className="glass-art food-plate" aria-hidden>
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

      {d === "dips" && (
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
      {d === "olives" && (
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
      {d === "cake" && (
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
      {d === "fries" && (
        <g>
          {/* a dark enamel cup of fries and a little pot of mayonnaise */}
          {[[50, 86, -14], [55, 83, -6], [60, 82, 2], [65, 84, 9], [70, 87, 16], [57, 88, -2], [63, 87, 6]].map(([x, y, r], i) => (
            <rect key={i} x={x - 2.2} y={y} width="4.4" height="20" rx="1.2" fill={i % 2 ? "#e6b04a" : "#f0c766"} stroke="#b9822a" strokeWidth=".5" transform={`rotate(${r} ${x} ${y + 18})`} />
          ))}
          <path d="M47 99 L73 99 L70 116 Q60 119 50 116 Z" fill="#26302f" />
          <ellipse cx="60" cy="99" rx="13" ry="3" fill="#36423f" />
          <path d="M50 102 Q51 110 52 115" stroke="#fff" strokeOpacity=".25" strokeWidth="1.4" fill="none" />
          <ellipse cx="84" cy="111" rx="7" ry="3.4" fill="#f6f2e8" stroke="#000" strokeOpacity=".15" strokeWidth=".6" />
          <ellipse cx="84" cy="110.4" rx="5" ry="2.2" fill="#f3e3a6" />
        </g>
      )}
      {d === "cheese" && (
        <g>
          {/* a wedge, a soft round, grapes and walnuts */}
          <path d="M36 112 L58 100 L60 108 L38 118 Z" fill="#e7b947" />
          <path d="M36 112 L58 100 L56 97 L34 109 Z" fill="#f4d675" />
          {[[44, 110, 1.3], [51, 106, 1], [47, 114, 0.9]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#c99a2e" />)}
          <ellipse cx="72" cy="111" rx="12" ry="5" fill="#efe6cf" />
          <path d="M60 111 v3 q12 5 24 0 v-3" fill="#e2d6b6" />
          <ellipse cx="72" cy="110.4" rx="8" ry="3" fill="#fbf6e6" />
          {[[78, 101], [82, 102], [80, 104.5], [84, 105], [76, 104], [79, 107]].map(([x, y], i) => (
            <g key={i}><circle cx={x} cy={y} r="2.6" fill="#5b2350" /><circle cx={x - 0.8} cy={y - 0.8} r=".8" fill="#fff" opacity=".45" /></g>
          ))}
          <path d="M80 99 q2 -4 5 -4" stroke="#5a7a2a" strokeWidth="1" fill="none" />
          <ellipse cx="52" cy="117" rx="3.6" ry="2.4" fill="#8b5a2b" /><path d="M50 117 h4" stroke="#5e3a18" strokeWidth=".6" />
        </g>
      )}
      {d === "oysters" && (
        <g>
          {/* oysters on the half shell over crushed ice, a lemon wedge */}
          {[[44, 104], [60, 101], [76, 104], [52, 112], [68, 112]].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x - 8} ${y} q8 -7 16 0 q-2 6 -8 6 q-6 0 -8 -6 Z`} fill="#8e979a" />
              <ellipse cx={x} cy={y + 0.6} rx="5.6" ry="3" fill="#ede7da" />
              <ellipse cx={x + 0.6} cy={y + 0.8} rx="3" ry="1.6" fill="#cfc4ae" />
              <ellipse cx={x - 2} cy={y - 0.4} rx="1.4" ry=".6" fill="#fff" opacity=".7" />
            </g>
          ))}
          {[[36, 110], [86, 110], [60, 117], [40, 116], [80, 116]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="1.6" fill="#fff" opacity=".85" />)}
          <path d="M86 98 l8 3 l-8 4 Z" fill="#f2d03c" stroke="#d1a91e" strokeWidth=".6" />
        </g>
      )}
      {d === "fried" && (
        <g>
          {/* a golden pile: calamari, karaage or nachos, a lemon and a sauce */}
          {[[48, 108, 7, 4.6], [58, 104, 7.4, 5], [68, 108, 7, 4.6], [53, 112, 6.4, 4.2], [64, 113, 6.6, 4.2], [59, 99.5, 6, 4]].map(([x, y, rx, ry], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? "#c98a2e" : "#d99a3a"} />
              <ellipse cx={x - 1.6} cy={y - 1.4} rx={rx * 0.55} ry={ry * 0.45} fill="#ebbd62" />
              <circle cx={x + 2} cy={y + 0.6} r=".7" fill="#9e6418" />
            </g>
          ))}
          <path d="M78 101 l9 3 l-9 4 Z" fill="#f2d03c" stroke="#d1a91e" strokeWidth=".6" />
          <ellipse cx="40" cy="101" rx="6" ry="3" fill="#f6f2e8" stroke="#000" strokeOpacity=".15" strokeWidth=".6" />
          <ellipse cx="40" cy="100.5" rx="4.2" ry="1.9" fill="#efe2bf" />
        </g>
      )}
      {d === "bread" && (
        <g>
          {/* two slices of toasted bread, tomato and basil */}
          {[[46, 106, -8], [70, 106, 8]].map(([x, y, r], i) => (
            <g key={i} transform={`rotate(${r} ${x} ${y})`}>
              <rect x={x - 13} y={y - 6} width="26" height="12" rx="5" fill="#a8682a" />
              <rect x={x - 11.5} y={y - 5} width="23" height="9.6" rx="4" fill="#e0ad66" />
              {[[-6, -1.4], [-1, 1], [4, -2], [7, 1.6], [-8, 2.2], [1, -2.6]].map(([dx, dy], j) => (
                <rect key={j} x={x + dx - 1.6} y={y + dy - 1.3} width="3.2" height="2.6" rx=".6" fill={j % 3 === 2 ? "#e2452c" : "#c8321e"} />
              ))}
              <path d={`M${x - 3} ${y - 3} q3 -3 6 0 q-3 2 -6 0 Z`} fill="#3f7a2a" />
            </g>
          ))}
        </g>
      )}
      {d === "rolls" && (
        <g>
          {/* börek or gyoza: golden rolls side by side, a sprig of parsley */}
          {[[44, 103], [52, 108], [60, 113], [68, 104], [76, 109]].map(([x, y], i) => (
            <g key={i} transform={`rotate(-22 ${x} ${y})`}>
              <rect x={x - 11} y={y - 3.4} width="22" height="6.8" rx="3.4" fill="#d9a04c" />
              <rect x={x - 10} y={y - 3} width="20" height="3" rx="1.5" fill="#efc77a" />
              <ellipse cx={x + 10.4} cy={y} rx="1.6" ry="3.2" fill="#b77a2c" />
            </g>
          ))}
          <path d="M84 113 q3 -4 7 -3 M86 112 q-1 -4 2 -6" stroke="#3f7a2a" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        </g>
      )}
      {d === "ramekin" && (
        <g>
          {/* a white ramekin, its burnt-sugar top, a spoon beside it */}
          <path d="M44 100 v11 q16 7 32 0 v-11" fill="#f1ede4" />
          <path d="M44 103 q16 7 32 0" stroke="#000" strokeOpacity=".08" strokeWidth="1" fill="none" />
          <path d="M46 102 v8" stroke="#fff" strokeWidth="1.6" opacity=".8" />
          <ellipse cx="60" cy="100" rx="16" ry="5.6" fill="#faf7f0" />
          <ellipse cx="60" cy="100.2" rx="13.4" ry="4.4" fill="#c98a2e" />
          <ellipse cx="57" cy="99.2" rx="7" ry="1.8" fill="#e6b45c" opacity=".8" />
          <path d="M64 98.6 l3 1 M54 101 l2 .6" stroke="#8a5418" strokeWidth=".7" />
          <path d="M80 114 L94 106" stroke="#c9ccd0" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="78.5" cy="115" rx="3.4" ry="2" fill="#d7dade" transform="rotate(-30 78.5 115)" />
        </g>
      )}
      {d === "baklava" && (
        <g>
          {/* three diamonds of baklava, pistachio on top, a spoon of kaymak */}
          {[[46, 107], [60, 104], [74, 107]].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x - 8} ${y} L${x} ${y - 5} L${x + 8} ${y} L${x} ${y + 5} Z`} fill="#c98a2e" />
              <path d={`M${x - 8} ${y} L${x} ${y + 5} L${x + 8} ${y} v3 L${x} ${y + 8} L${x - 8} ${y + 3} Z`} fill="#a86a1e" />
              <path d={`M${x - 7} ${y + 1.6} L${x} ${y + 6} L${x + 7} ${y + 1.6}`} stroke="#e8b866" strokeWidth=".6" fill="none" />
              <ellipse cx={x} cy={y} rx="4.2" ry="2.2" fill="#7aa03a" />
              <ellipse cx={x - 1} cy={y - 0.6} rx="1.6" ry=".7" fill="#a8c766" />
            </g>
          ))}
          <ellipse cx="60" cy="116" rx="7" ry="3" fill="#fbf6e8" />
          <ellipse cx="59" cy="115.2" rx="3" ry="1.1" fill="#fff" />
        </g>
      )}
      {d === "greens" && (
        <g>
          {/* edamame, samphire or padrón: a green pile with flakes of salt */}
          {[[46, 108, -20], [53, 104, 10], [60, 109, -8], [67, 104, 18], [74, 109, -14], [56, 113, 24], [65, 113, -24], [60, 100, 4]].map(([x, y, r], i) => (
            <g key={i} transform={`rotate(${r} ${x} ${y})`}>
              <ellipse cx={x} cy={y} rx="7.6" ry="2.8" fill={i % 2 ? "#4f8a2f" : "#6aa63f"} />
              <path d={`M${x - 6} ${y - 0.6} q6 -2 12 0`} stroke="#a8d27a" strokeWidth=".8" fill="none" />
            </g>
          ))}
          {[[50, 101], [63, 99], [71, 107], [57, 116], [46, 112], [76, 113]].map(([x, y], i) => <rect key={i} x={x} y={y} width="1.6" height="1.6" fill="#fff" transform={`rotate(45 ${x} ${y})`} />)}
        </g>
      )}
      {d === "grill" && (
        <g>
          {/* two skewers from the grill, char marks and a lemon */}
          {[[0, 0], [5, 8]].map(([dx, dy], i) => (
            <g key={i}>
              <path d={`M${34 + dx} ${104 + dy} L${88 + dx} ${96 + dy}`} stroke="#a87a45" strokeWidth="1.4" strokeLinecap="round" />
              {[0, 1, 2, 3].map((k) => {
                const x = 44 + dx + k * 11;
                const y = 102.4 + dy - k * 1.6;
                const c = ["#8a3f1e", "#e9c44a", "#7a3418", "#4f8a2f"][(k + i) % 4];
                return (
                  <g key={k}>
                    <rect x={x - 4.4} y={y - 4} width="8.8" height="8" rx="2.4" fill={c} />
                    <path d={`M${x - 3} ${y - 2} l3 4 M${x} ${y - 3} l3 4`} stroke="#2a1408" strokeOpacity=".55" strokeWidth=".8" />
                    <rect x={x - 3.4} y={y - 3.4} width="4" height="1.6" rx=".8" fill="#fff" opacity=".22" />
                  </g>
                );
              })}
            </g>
          ))}
          <path d="M80 112 l9 3 l-9 4 Z" fill="#f2d03c" stroke="#d1a91e" strokeWidth=".6" />
        </g>
      )}
      {d === "fish" && (
        <g>
          {/* cured fish fanned out, rings of red onion, dill */}
          {[-24, -12, 0, 12, 24].map((r, i) => (
            <g key={i} transform={`rotate(${r} 60 118)`}>
              <path d="M60 118 L55 98 Q60 95 65 98 Z" fill={i % 2 ? "#e9a48e" : "#f0b49d"} />
              <path d="M57 104 l6 -1 M56.4 109 l7 -1" stroke="#fff" strokeOpacity=".6" strokeWidth=".7" />
            </g>
          ))}
          {[[42, 112], [78, 112]].map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx="4.4" ry="2.2" fill="none" stroke="#9a3c6e" strokeWidth="1.2" />
              <ellipse cx={x + 1} cy={y + 0.4} rx="2.4" ry="1.2" fill="none" stroke="#b9578a" strokeWidth=".9" />
            </g>
          ))}
          <path d="M52 96 q2 -3 1 -6 M54 96 q3 -2 5 -1 M51 95 q-3 -1 -4 -4" stroke="#4d7a2a" strokeWidth=".9" strokeLinecap="round" fill="none" />
        </g>
      )}
      <ellipse cx="44" cy="102" rx="26" ry="7" fill={`url(#gl${id})`} opacity=".35" />
    </svg>
  );
}
