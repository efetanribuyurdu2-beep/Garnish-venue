import type { WorldId } from "@/lib/types";

/**
 * Each world's sealed object, hand drawn: closed it keeps its secret; inside a
 * `.sd.open` card it opens (CSS in globals.css → "SEALED DOORS"). Maison: a
 * black envelope with a gold wax seal; Anatolia: a coffee cup turned over on its
 * saucer for a reading; Cosmos: a porthole hatch; Jazz: a speakeasy door's
 * peephole; Sakura: an omikuji knot; Alchemist: a sealed flask; Tiki: a message
 * in a bottle; Boreal: a frosted window; Riviera: an arched cellar door.
 * Filter-free, hook-free.
 */
export function Artifact({ world, uid }: { world: WorldId; uid: string }) {
  const id = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg className={`ar ar-${world}`} viewBox="0 0 200 170" aria-hidden>
      <ellipse cx="100" cy="156" rx="74" ry="7" fill="#000" opacity=".35" />
      {ART[world](id)}
    </svg>
  );
}

const ART: Record<WorldId, (id: string) => React.ReactNode> = {
  // ───────── Maison: a black envelope, gold edges, a wax seal; an Art Deco card rises
  maison: (id) => (
    <g>
      <defs>
        <linearGradient id={`mg${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#8a6a2a" />
          <stop offset=".45" stopColor="#f3dc96" />
          <stop offset="1" stopColor="#9a7834" />
        </linearGradient>
        <radialGradient id={`mw${id}`} cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#c23a46" />
          <stop offset="1" stopColor="#6a1019" />
        </radialGradient>
      </defs>
      <path className="env-flap-open" d="M26 66 L100 20 L174 66 Z" fill="#141210" stroke={`url(#mg${id})`} strokeWidth="1.2" />
      <rect x="26" y="66" width="148" height="84" rx="3" fill="#0e0d0c" stroke={`url(#mg${id})`} strokeWidth="1.2" />
      <g className="env-card">
        <rect x="38" y="72" width="124" height="74" fill="#f5edd9" />
        <rect x="43" y="77" width="114" height="64" fill="none" stroke="#b8933f" strokeWidth=".9" />
        <rect x="46" y="80" width="108" height="58" fill="none" stroke="#b8933f" strokeWidth=".4" />
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i} d={`M100 98 L${100 + Math.cos(Math.PI + (i * Math.PI) / 8) * 16} ${98 + Math.sin(Math.PI + (i * Math.PI) / 8) * 16}`} stroke="#b8933f" strokeWidth=".7" />
        ))}
        <text x="100" y="116" textAnchor="middle" fontFamily="Bodoni Moda, Georgia, serif" fontStyle="italic" fontSize="12" fill="#1a1712">
          Le Grand Bar
        </text>
        <text x="100" y="128" textAnchor="middle" fontFamily="Jost, sans-serif" fontSize="4.6" letterSpacing="1.6" fill="#8a6a2a">
          INVITATION · CE SOIR
        </text>
      </g>
      <path d="M26 66 L100 112 L174 66 V150 H26 Z" fill="#171513" stroke={`url(#mg${id})`} strokeWidth="1.2" />
      <path d="M26 150 L86 104 M174 150 L114 104" stroke="#c9a961" strokeWidth=".6" opacity=".55" />
      <path d="M78 150 Q100 132 122 150" stroke="#c9a961" strokeWidth=".6" fill="none" opacity=".5" />
      <path className="env-flap" d="M26 66 L100 114 L174 66 Z" fill="#1c1916" stroke={`url(#mg${id})`} strokeWidth="1.2" />
      <g className="env-seal">
        <circle cx="100" cy="110" r="13" fill={`url(#mw${id})`} />
        <path d="M88 112 q2 7 6 9 M112 112 q-2 7 -6 9" stroke="#5a0c14" strokeWidth="1.4" fill="none" />
        <circle cx="100" cy="110" r="8.5" fill="none" stroke="#e8a0a6" strokeWidth=".6" opacity=".6" />
        <path d="M95.5 113.5 V106 L100 110 L104.5 106 V113.5" stroke="#f0c0c4" strokeWidth="1.2" fill="none" opacity=".85" />
      </g>
    </g>
  ),

  // ───────── Anatolia: Turkish coffee cup turned over on its saucer, lifted for the reading
  anatolia: (id) => (
    <g>
      <defs>
        <linearGradient id={`ap${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#d8d2c6" />
          <stop offset=".35" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cfc8bb" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="132" rx="74" ry="19" fill="#f6f1e6" />
      <ellipse cx="100" cy="132" rx="74" ry="19" fill="none" stroke="#d9a521" strokeWidth="1.4" />
      <ellipse cx="100" cy="131" rx="62" ry="14.5" fill="none" stroke="#1d3f8f" strokeWidth="2.2" strokeDasharray="3 3" />
      <ellipse cx="100" cy="130" rx="46" ry="10" fill="#fbf8f1" />
      {/* the grounds: a bird in flight, coffee splashes */}
      <g className="fal-grounds">
        <path d="M84 129 q8 -9 16 -2 q8 -9 18 -1 q-9 2 -13 6 q-3 3 -5 0 q-6 -4 -16 -3z" fill="#3a1d0e" />
        <circle cx="72" cy="132" r="2.4" fill="#4a2814" />
        <circle cx="126" cy="133" r="1.8" fill="#4a2814" />
        <circle cx="118" cy="127" r="1.2" fill="#4a2814" />
        <path d="M66 135 q4 -2 8 0" stroke="#4a2814" strokeWidth="1.4" fill="none" />
        <path d="M128 136 q3 1 7 -1" stroke="#4a2814" strokeWidth="1.2" fill="none" />
      </g>
      <g className="fal-cup">
        <path d="M66 128 L73 82 Q100 74 127 82 L134 128 Z" fill={`url(#ap${id})`} />
        <path d="M66 128 Q100 136 134 128" stroke="#d9a521" strokeWidth="2" fill="none" />
        <path d="M70 104 Q100 110 130 104" stroke="#1d3f8f" strokeWidth="3.2" fill="none" />
        {Array.from({ length: 9 }).map((_, i) => (
          <circle key={i} cx={74 + i * 6.5} cy={106.5 + Math.sin(i / 1.4) * 0.6} r="1.3" fill={i % 2 ? "#c8323c" : "#2fb7b0"} />
        ))}
        <path d="M76 84 Q100 78 124 84" stroke="#d9a521" strokeWidth="1.4" fill="none" />
        <path d="M133 96 C150 96 152 120 133 120" stroke="#f4f0e8" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M133 96 C150 96 152 120 133 120" stroke="#d9a521" strokeWidth="1" fill="none" />
        <path d="M74 90 L70 122" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity=".8" />
      </g>
    </g>
  ),

  // ───────── Cosmos: a porthole hatch; the shutters part on a nebula and a ringed planet
  cosmos: (id) => (
    <g>
      <defs>
        <clipPath id={`cw${id}`}>
          <circle cx="100" cy="82" r="50" />
        </clipPath>
        <radialGradient id={`cn${id}`} cx=".35" cy=".4" r=".8">
          <stop offset="0" stopColor="#ff7ac8" stopOpacity=".9" />
          <stop offset=".45" stopColor="#6a3fd8" />
          <stop offset="1" stopColor="#0a0a26" />
        </radialGradient>
        <linearGradient id={`cm${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#2c3150" />
          <stop offset=".5" stopColor="#4a5278" />
          <stop offset="1" stopColor="#262a44" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="82" r="66" fill="#1c1f36" stroke="#9b7bff" strokeWidth="1.4" />
      <circle cx="100" cy="82" r="58" fill="none" stroke="#7fe6ff" strokeWidth=".6" opacity=".6" />
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <circle key={i} cx={100 + Math.cos(a) * 61} cy={82 + Math.sin(a) * 61} r="2.1" fill="#9aa3c8" />;
      })}
      <g clipPath={`url(#cw${id})`}>
        <rect x="40" y="22" width="120" height="120" fill={`url(#cn${id})`} />
        {[[66, 50], [128, 44], [118, 110], [74, 112], [92, 60], [140, 86], [60, 84]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 ? 0.9 : 1.5} fill="#fff" />
        ))}
        <g className="cos-planet">
          <circle cx="110" cy="88" r="16" fill="#b79cff" />
          <path d="M96 86 q14 -6 28 0" stroke="#e8dcff" strokeWidth="2" fill="none" opacity=".7" />
          <ellipse cx="110" cy="90" rx="30" ry="6" fill="none" stroke="#ffd1ec" strokeWidth="2" transform="rotate(-14 110 90)" />
        </g>
        <g className="cos-l">
          <rect x="40" y="22" width="60" height="120" fill={`url(#cm${id})`} />
          <path d="M60 30 V134 M80 26 V138" stroke="#1c1f36" strokeWidth="1" />
          <circle cx="94" cy="82" r="2" fill="#7fe6ff" />
        </g>
        <g className="cos-r">
          <rect x="100" y="22" width="60" height="120" fill={`url(#cm${id})`} />
          <path d="M120 26 V138 M140 30 V134" stroke="#1c1f36" strokeWidth="1" />
          <circle cx="106" cy="82" r="2" fill="#ff7ac8" />
        </g>
      </g>
      <circle cx="100" cy="82" r="50" fill="none" stroke="#c8d0ff" strokeWidth="1.4" />
      <path d="M62 56 A46 46 0 0 1 96 36" stroke="#fff" strokeWidth="2" fill="none" opacity=".45" strokeLinecap="round" />
    </g>
  ),

  // ───────── Jazz: a speakeasy door; the peephole slides open on two eyes
  jazz: (id) => (
    <g>
      <defs>
        <linearGradient id={`jd${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#2a130a" />
          <stop offset=".5" stopColor="#4e2614" />
          <stop offset="1" stopColor="#24100a" />
        </linearGradient>
        <linearGradient id={`jb${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3d98a" />
          <stop offset="1" stopColor="#8a6a22" />
        </linearGradient>
        <clipPath id={`js${id}`}>
          <rect x="76" y="44" width="48" height="16" rx="1" />
        </clipPath>
      </defs>
      <rect x="44" y="6" width="112" height="146" rx="3" fill={`url(#jd${id})`} stroke="#d9b25f" strokeWidth="1" />
      <rect x="54" y="72" width="40" height="70" fill="none" stroke="#1a0b05" strokeWidth="2" />
      <rect x="106" y="72" width="40" height="70" fill="none" stroke="#1a0b05" strokeWidth="2" />
      <rect x="70" y="38" width="60" height="28" rx="2" fill={`url(#jb${id})`} />
      <rect x="76" y="44" width="48" height="16" fill="#0a0503" />
      <g clipPath={`url(#js${id})`}>
        <g className="jz-eyes">
          {[88, 112].map((x) => (
            <g key={x}>
              <path d={`M${x - 8} 52 Q${x} 45 ${x + 8} 52 Q${x} 58 ${x - 8} 52Z`} fill="#efe6d2" />
              <circle cx={x} cy="52" r="3.4" fill="#5a3a12" />
              <circle cx={x} cy="52" r="1.6" fill="#000" />
              <circle cx={x - 1} cy="51" r=".7" fill="#fff" />
            </g>
          ))}
        </g>
        <g className="jz-slot">
          <rect x="76" y="44" width="48" height="16" fill={`url(#jb${id})`} />
          <path d="M78 48 H122 M78 52 H122 M78 56 H122" stroke="#8a6a22" strokeWidth=".7" />
          <circle cx="118" cy="52" r="1.6" fill="#5a4214" />
        </g>
      </g>
      <text x="100" y="32" textAnchor="middle" fontFamily="Limelight, serif" fontSize="12" fill="#d9b25f">
        23
      </text>
      <circle cx="140" cy="100" r="4" fill={`url(#jb${id})`} />
      <circle cx="100" cy="100" r="7" fill="none" stroke={`url(#jb${id})`} strokeWidth="2.2" />
      <path d="M44 6 H156" stroke="#d9b25f" strokeWidth="2" />
    </g>
  ),

  // ───────── Sakura: an omikuji knot on a cherry branch; it unfolds to a fortune
  sakura: () => (
    <g>
      <path d="M10 22 C60 14 110 30 190 16" stroke="#3b2418" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <path d="M140 22 c6 8 14 10 22 8" stroke="#3b2418" strokeWidth="1.8" fill="none" />
      {[[34, 19], [158, 30], [176, 17]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`} fill="#f6b8c8">
          {[0, 72, 144, 216, 288].map((a) => (
            <path key={a} transform={`rotate(${a})`} d="M0 0 C-3 -2 -4 -6 -1.6 -7.6 L0 -6.4 L1.6 -7.6 C4 -6 3 -2 0 0Z" />
          ))}
          <circle r="1.3" fill="#e2728d" />
        </g>
      ))}
      <g className="sk-knot">
        <path d="M100 20 V38" stroke="#c8102e" strokeWidth="1.4" />
        <path d="M92 38 L108 38 L112 50 L104 46 L106 62 L94 62 L96 46 L88 50 Z" fill="#fbf6ee" stroke="#d8cfc0" strokeWidth=".8" />
        <path d="M94 50 H106" stroke="#c8102e" strokeWidth="2" />
        <path d="M96 62 L94 78 M104 62 L108 76" stroke="#efe6d6" strokeWidth="3.6" strokeLinecap="round" />
      </g>
      <g className="sk-paper">
        <rect x="70" y="28" width="60" height="122" fill="#fbf6ee" stroke="#d8cfc0" strokeWidth=".8" />
        <rect x="70" y="28" width="60" height="9" fill="#c8102e" />
        <text x="100" y="35" textAnchor="middle" fontSize="6" fill="#fff" fontFamily="Zen Antique, serif">
          おみくじ
        </text>
        <text x="100" y="72" textAnchor="middle" fontSize="28" fill="#c8102e" fontFamily="Zen Antique, serif">
          大
        </text>
        <text x="100" y="104" textAnchor="middle" fontSize="28" fill="#c8102e" fontFamily="Zen Antique, serif">
          吉
        </text>
        {[116, 122, 128].map((y) => (
          <path key={y} d={`M80 ${y} H120`} stroke="#b9ab98" strokeWidth=".8" />
        ))}
        <rect x="108" y="134" width="12" height="12" fill="none" stroke="#c8102e" strokeWidth="1.2" transform="rotate(-4 114 140)" />
      </g>
    </g>
  ),

  // ───────── Alchemist: a round flask, cork and red wax; the seal cracks, green vapour rises
  alchemist: (id) => (
    <g>
      <defs>
        <radialGradient id={`al${id}`} cx=".4" cy=".35" r=".7">
          <stop offset="0" stopColor="#9be07a" />
          <stop offset="1" stopColor="#2f6a22" />
        </radialGradient>
        <clipPath id={`ab${id}`}>
          <circle cx="100" cy="108" r="37" />
        </clipPath>
      </defs>
      <circle cx="100" cy="108" r="46" fill="none" stroke="#b08a4a" strokeWidth=".6" opacity=".5" strokeDasharray="2 4" />
      {["☿", "♄", "☽", "♃", "♀", "☉"].map((g, i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return (
          <text key={g} x={100 + Math.cos(a) * 52} y={110 + Math.sin(a) * 52} textAnchor="middle" fontSize="9" fill="#b08a4a" opacity=".7">
            {g}
          </text>
        );
      })}
      <g clipPath={`url(#ab${id})`}>
        <rect className="al-liq" x="60" y="104" width="80" height="44" fill={`url(#al${id})`} />
        <path d="M60 104 Q80 100 100 104 T140 104" fill="#b8f09a" opacity=".5" />
      </g>
      <path d="M90 34 V72 A37 37 0 1 0 110 72 V34" fill="rgba(255,255,255,.07)" stroke="#e9dcc0" strokeWidth="1.6" />
      <path d="M72 96 A28 28 0 0 1 88 80" stroke="#fff" strokeWidth="2" fill="none" opacity=".5" strokeLinecap="round" />
      <g className="al-smoke">
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} className={`al-puff p${i}`} cx={96 + (i % 2) * 8} cy="30" r={6 + i * 2} fill="#8fe07a" opacity=".55" />
        ))}
      </g>
      <g className="al-cork">
        <rect x="88" y="22" width="24" height="14" rx="2" fill="#8a5a2e" />
        <path d="M90 26 H110" stroke="#6a4220" strokeWidth=".8" />
      </g>
      <g className="al-wax-l">
        <path d="M86 30 Q86 22 100 21 V44 Q94 46 90 42 Q84 40 86 30Z" fill="#9e1b22" />
      </g>
      <g className="al-wax-r">
        <path d="M100 21 Q114 22 114 30 Q116 40 110 42 Q106 46 100 44Z" fill="#8a141b" />
        <text x="100" y="37" textAnchor="middle" fontSize="10" fill="#f0b0a8">
          ☿
        </text>
      </g>
    </g>
  ),

  // ───────── Tiki: a message in a bottle on the sand; the cork pops, a map unrolls
  tiki: (id) => (
    <g>
      <defs>
        <linearGradient id={`tb${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7fd0a0" stopOpacity=".55" />
          <stop offset="1" stopColor="#1f6a4a" stopOpacity=".75" />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="146" rx="86" ry="12" fill="#e8c98a" />
      <path d="M14 146 q20 -6 40 0 q20 6 40 0 q20 -6 40 0 q20 6 40 0" stroke="#7ac6d8" strokeWidth="2" fill="none" opacity=".6" />
      <path d="M160 30 C150 60 154 90 166 120" stroke="#5a3a1e" strokeWidth="5" fill="none" strokeLinecap="round" />
      {[-40, -10, 20, 50].map((a, i) => (
        <path key={a} d="M162 32 C170 18 192 14 198 22 C186 22 176 26 162 32Z" transform={`rotate(${a} 162 32)`} fill={i % 2 ? "#3f8f3a" : "#2f7a2a"} />
      ))}
      <g className="tk-map">
        <rect x="40" y="16" width="96" height="62" rx="3" fill="#f1e3c2" stroke="#b8914c" strokeWidth="1" />
        <path d="M50 64 q12 -18 26 -8 t26 -14 t24 -8" stroke="#b8914c" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
        <path d="M120 30 l8 8 m0 -8 l-8 8" stroke="#c8323c" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M54 28 q6 -4 12 0 q-4 6 -12 0z" fill="#3f8f3a" />
        <text x="62" y="46" fontSize="6" fill="#7a5a26" fontFamily="Kavoon, serif">
          Lagoon
        </text>
      </g>
      <g transform="rotate(-14 96 116)">
        <rect x="38" y="98" width="104" height="40" rx="20" fill={`url(#tb${id})`} stroke="#bfe8cf" strokeWidth="1" />
        <rect x="142" y="108" width="24" height="20" rx="4" fill={`url(#tb${id})`} stroke="#bfe8cf" strokeWidth="1" />
        <g className="tk-scroll">
          <rect x="56" y="108" width="66" height="20" rx="10" fill="#f1e3c2" />
          <path d="M88 108 V128" stroke="#c8323c" strokeWidth="1.6" />
        </g>
        <rect className="tk-cork" x="164" y="110" width="12" height="16" rx="2" fill="#a8743f" />
        <path d="M46 106 Q90 100 132 106" stroke="#fff" strokeWidth="2" fill="none" opacity=".45" strokeLinecap="round" />
      </g>
    </g>
  ),

  // ───────── Boreal: a frosted birch window; the frost wipes away on a lit stove
  boreal: (id) => (
    <g>
      <defs>
        <radialGradient id={`bw${id}`} cx=".5" cy=".7" r=".8">
          <stop offset="0" stopColor="#ffb867" />
          <stop offset=".5" stopColor="#a8541c" />
          <stop offset="1" stopColor="#2a140a" />
        </radialGradient>
        <pattern id={`bf${id}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M8 2 V14 M2 8 H14 M4 4 L12 12 M12 4 L4 12" stroke="#fff" strokeWidth=".6" opacity=".9" />
        </pattern>
      </defs>
      <rect x="40" y="14" width="120" height="132" fill={`url(#bw${id})`} />
      <g className="br-room">
        <path d="M86 146 V112 Q86 104 94 104 H106 Q114 104 114 112 V146Z" fill="#1a0e08" />
        <path d="M92 132 q4 -12 8 -4 q4 -12 8 4 q-8 8 -16 0z" fill="#ffcf6a" />
        <rect x="96" y="70" width="8" height="34" fill="#1a0e08" />
        <circle cx="62" cy="40" r="2" fill="#fff4d0" opacity=".8" />
        <circle cx="140" cy="48" r="1.6" fill="#fff4d0" opacity=".8" />
      </g>
      {[[44, 18], [102, 18], [44, 82], [102, 82]].map(([x, y], i) => (
        <g key={i} className={`br-frost f${i}`}>
          <rect x={x} y={y} width="54" height="60" fill="#dbe9f3" opacity=".9" />
          <rect x={x} y={y} width="54" height="60" fill={`url(#bf${id})`} opacity=".7" />
          <path d={`M${x + 6} ${y + 50} l12 -14 l6 8 l10 -18 l8 12`} stroke="#fff" strokeWidth="1.2" fill="none" opacity=".9" />
        </g>
      ))}
      <rect x="34" y="8" width="132" height="144" fill="none" stroke="#efe8dc" strokeWidth="8" />
      <path d="M100 12 V148 M38 80 H162" stroke="#efe8dc" strokeWidth="5" />
      {[[40, 30], [60, 148], [150, 24], [162, 120], [100, 150]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="6" height="1.6" fill="#2a2420" opacity=".7" />
      ))}
      <path d="M30 152 H170" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
    </g>
  ),

  // ───────── Riviera: an arched cellar door under a lemon branch; it swings open on the barrels
  riviera: (id) => (
    <g>
      <defs>
        <radialGradient id={`rc${id}`} cx=".5" cy=".75" r=".8">
          <stop offset="0" stopColor="#ffcf7a" />
          <stop offset=".5" stopColor="#8a4a1c" />
          <stop offset="1" stopColor="#2a160a" />
        </radialGradient>
        <linearGradient id={`rd${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#5a3a1e" />
          <stop offset=".5" stopColor="#7a5230" />
          <stop offset="1" stopColor="#4a2e16" />
        </linearGradient>
      </defs>
      <path d="M40 152 V70 A60 60 0 0 1 160 70 V152Z" fill="#d6c4a6" />
      {[[46, 80], [46, 104], [46, 128], [146, 80], [146, 104], [146, 128]].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="10" height="20" fill="#c4b08e" stroke="#b09c7a" strokeWidth=".6" />
      ))}
      <path d="M56 152 V76 A44 44 0 0 1 144 76 V152Z" fill={`url(#rc${id})`} />
      <g className="rv-barrels">
        {[[78, 132], [122, 132], [100, 112]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="14" fill="#6a3e1e" />
            <circle cx={x} cy={y} r="14" fill="none" stroke="#2a160a" strokeWidth="1.4" />
            <circle cx={x} cy={y} r="9" fill="none" stroke="#2a160a" strokeWidth=".8" />
          </g>
        ))}
      </g>
      <g className="rv-door">
        <path d="M56 152 V76 A44 44 0 0 1 144 76 V152Z" fill={`url(#rd${id})`} stroke="#3a2412" strokeWidth="1.2" />
        {[70, 84, 100, 116, 130].map((x) => (
          <path key={x} d={`M${x} 152 V${x < 80 || x > 120 ? 70 : 40}`} stroke="#3a2412" strokeWidth="1" opacity=".7" />
        ))}
        {[88, 118].map((y) => (
          <path key={y} d={`M58 ${y} H142`} stroke="#2a1a0c" strokeWidth="3" />
        ))}
        {[64, 80, 120, 136].map((x) =>
          [88, 118].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#1a1008" />),
        )}
        <circle cx="132" cy="104" r="5" fill="none" stroke="#2a1a0c" strokeWidth="2" />
      </g>
      <path d="M30 40 C70 30 120 46 176 34" stroke="#4a3220" strokeWidth="3" fill="none" />
      {[[50, 38, -30], [80, 36, 20], [120, 42, -10], [150, 36, 30]].map(([x, y, a], i) => (
        <path key={i} d="M0 0 C6 -6 18 -7 26 -3 C18 3 7 4 0 0Z" transform={`translate(${x} ${y}) rotate(${a})`} fill={i % 2 ? "#4f6a26" : "#5e7a2e"} />
      ))}
      {[[66, 50], [134, 52]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <ellipse rx="9" ry="7" fill="#f2c94c" />
          <ellipse cx="-3" cy="-2" rx="3.4" ry="1.6" fill="#fff" opacity=".4" />
        </g>
      ))}
    </g>
  ),
};
