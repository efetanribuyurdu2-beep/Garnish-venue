import type { Glass, Ice, Method, WorldId } from "@/lib/types";
import { GarnishIcon, GlassSvg } from "./glassSvg";

/**
 * Photographic glassware, drawn (no image files). Each glass is a turned
 * profile, (y, radius) pairs, from which everything follows the way light
 * would: the wall's thickness, the drink as a lit cylinder (dark at the walls,
 * bright where light passes through), its surface seen from slightly above,
 * the coloured caustic it throws on the counter, real ice, bubbles, foam and
 * condensation. The world's glass craft (cut crystal, kiriko, frost…) is
 * etched on top. Vessels that are not clear glass fall back to GlassSvg.
 * Hook-free and filter-free: cheap to render on the server, many per page.
 */

type Pt = [y: number, r: number];

interface Profile {
  pts: Pt[]; // outer profile, rim first
  stem?: [top: number, bottom: number, r: number];
  foot?: [y: number, r: number];
  level: number; // drink surface (y)
  wall: number; // glass thickness
  baseTop?: number; // thick tumbler base: inner floor (y)
  band: number; // y for the world's etched band
  copper?: boolean;
  ceramic?: string; // tiki mug glaze
}

const CX = 60;
const TILT = 0.13; // ellipse ry/rx: the glass seen slightly from above

const P: Partial<Record<Glass, Profile>> = {
  martini: { pts: [[34, 48], [60, 25], [80, 9.5], [90, 2.4], [93, 1.8]], stem: [93, 140, 1.7], foot: [142, 23], level: 44, wall: 1.3, band: 52 },
  coupe: { pts: [[42, 42], [52, 41.4], [62, 38.5], [72, 32], [81, 22.5], [88, 12], [92.5, 3.6], [94, 2]], stem: [94, 140, 1.9], foot: [142, 23], level: 50, wall: 1.3, band: 62 },
  nicknora: { pts: [[24, 29], [40, 29.4], [56, 28], [68, 24.6], [78, 18.4], [86, 10.4], [91, 3.6], [92.5, 2]], stem: [92.5, 140, 1.8], foot: [142, 21], level: 42, wall: 1.3, band: 56 },
  flute: { pts: [[8, 16.4], [30, 17.2], [52, 16.6], [68, 14.2], [79, 9.6], [86, 4.4], [88.5, 1.8]], stem: [88.5, 140, 1.5], foot: [142, 19], level: 24, wall: 1.2, band: 14 },
  wine: { pts: [[22, 30.5], [32, 33.4], [46, 35.4], [60, 34.6], [74, 29.6], [85, 21], [93, 10.6], [97.5, 3.4], [99, 2]], stem: [99, 140, 1.9], foot: [142, 23], level: 56, wall: 1.3, band: 30 },
  rocks: { pts: [[62, 38.5], [100, 37.2], [140, 35.6], [146, 35.2]], level: 80, wall: 2.4, baseTop: 131, band: 68 },
  highball: { pts: [[10, 27.4], [80, 26.4], [142, 25.4], [148, 25.2]], level: 30, wall: 2.2, baseTop: 136, band: 16 },
  mug: { pts: [[46, 34.6], [100, 33], [140, 31.4], [146, 31]], level: 52, wall: 2, band: 60, copper: true },
  tiki: { pts: [[24, 32.4], [60, 31], [110, 28.8], [148, 26.4]], level: 30, wall: 2.6, band: 36, ceramic: "#7a4a24" },
};

export const REAL_GLASSES = new Set(Object.keys(P) as Glass[]);

// ───────────────────────────── colour helpers
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) => "#" + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a: string, b: string, t: number) => {
  const x = rgb(a), y = rgb(b);
  return hex(x.map((v, i) => v + (y[i] - v) * t));
};
const shade = (c: string, t: number) => (t < 0 ? mix(c, "#000000", -t) : mix(c, "#ffffff", t));

// ───────────────────────────── geometry
function rAt(pts: Pt[], y: number) {
  if (y <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [y0, r0] = pts[i - 1], [y1, r1] = pts[i];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return pts[pts.length - 1][1];
}

/** a smooth line through points (Catmull-Rom → cubic Bézier) */
function smooth(pts: [number, number][], start = true) {
  let d = start ? `M${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}` : "";
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(2)} ${c1[1].toFixed(2)} ${c2[0].toFixed(2)} ${c2[1].toFixed(2)} ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

/** closed silhouette of a turned profile */
function silhouette(pts: Pt[]) {
  const left = pts.map(([y, r]) => [CX - r, y] as [number, number]);
  const right = [...pts].reverse().map(([y, r]) => [CX + r, y] as [number, number]);
  return `${smooth(left)} L${right[0][0].toFixed(2)} ${right[0][1].toFixed(2)}${smooth(right, false)} Z`;
}

/** the profile cut at y (inclusive), starting exactly at y */
function from(pts: Pt[], y: number): Pt[] {
  const rest = pts.filter(([py]) => py > y + 0.3);
  return [[y, rAt(pts, y)], ...rest];
}

const inner = (p: Profile): Pt[] => {
  const pts = p.pts.map(([y, r]) => [y, Math.max(0.4, r - p.wall)] as Pt);
  if (p.baseTop) {
    const cut = pts.filter(([y]) => y < p.baseTop!);
    return [...cut, [p.baseTop, rAt(pts, p.baseTop)]];
  }
  const last = pts[pts.length - 1];
  pts[pts.length - 1] = [last[0] - p.wall * 0.8, last[1]];
  return pts;
};

/** drink body: inner wall below the surface, closed by the front half of the surface ellipse */
function liquidPath(inn: Pt[], level: number) {
  const pts = from(inn, level);
  const rx = pts[0][1];
  return `${silhouette(pts).replace(/ Z$/, "")} A${rx.toFixed(2)} ${(rx * TILT).toFixed(2)} 0 0 1 ${(CX - rx).toFixed(2)} ${level.toFixed(2)} Z`;
}

/** deterministic scatter */
const rnd = (i: number, k = 1) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// ───────────────────────────── ice
function Cube({ x, y, s, rot, id, tint }: { x: number; y: number; s: number; rot: number; id: string; tint: string }) {
  const k = s * 0.32; // top face depth
  return (
    <g transform={`rotate(${rot} ${x + s / 2} ${y + s / 2})`}>
      {/* top face, catching the light */}
      <path d={`M${x + 2} ${y} L${x + k + 2} ${y - k * 0.55} H${x + s + k - 2} L${x + s - 2} ${y} Z`} fill="#fff" fillOpacity=".3" stroke="#fff" strokeOpacity=".85" strokeWidth=".5" strokeLinejoin="round" />
      {/* side face */}
      <path d={`M${x + s} ${y + 1} L${x + s + k - 1} ${y - k * 0.5} V${y + s - k * 0.6} L${x + s} ${y + s} Z`} fill={tint} fillOpacity=".18" stroke="#fff" strokeOpacity=".5" strokeWidth=".4" strokeLinejoin="round" />
      {/* front face */}
      <rect x={x} y={y} width={s} height={s} rx={s * 0.16} fill={`url(#ice${id})`} />
      <rect x={x + 0.5} y={y + 0.5} width={s - 1} height={s - 1} rx={s * 0.15} fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth=".6" />
      {/* inner fracture and cloudy core */}
      <path d={`M${x + s * 0.25} ${y + s * 0.62} L${x + s * 0.45} ${y + s * 0.5} L${x + s * 0.58} ${y + s * 0.7}`} stroke="#fff" strokeOpacity=".6" strokeWidth=".45" fill="none" />
      <ellipse cx={x + s * 0.55} cy={y + s * 0.42} rx={s * 0.18} ry={s * 0.12} fill="#fff" opacity=".22" />
      <path d={`M${x + s * 0.16} ${y + s * 0.18} H${x + s * 0.62}`} stroke="#fff" strokeOpacity=".95" strokeWidth=".9" strokeLinecap="round" />
    </g>
  );
}

function IceFill({ ice, p, inn, id, color, under = 0 }: { ice: Ice; p: Profile; inn: Pt[]; id: string; color: string; under?: number }) {
  p = { ...p, level: p.level + under };
  const floor = p.baseTop ?? inn[inn.length - 1][0];
  const tint = shade(color, 0.25);
  if (ice === "sphere") {
    const r = Math.min(rAt(inn, floor - 20) - 3, 22);
    const cy = floor - r - 1;
    return (
      <g>
        <circle cx={CX} cy={cy} r={r} fill={`url(#sph${id})`} />
        <circle cx={CX} cy={cy} r={r - 0.4} fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth=".7" />
        <path d={`M${CX - r * 0.7} ${cy - r * 0.2} A${r * 0.78} ${r * 0.78} 0 0 1 ${CX - r * 0.1} ${cy - r * 0.76}`} stroke="#fff" strokeOpacity=".9" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        <ellipse cx={CX + r * 0.28} cy={cy + r * 0.34} rx={r * 0.34} ry={r * 0.2} fill={tint} opacity=".35" />
      </g>
    );
  }
  if (ice === "cube" || ice === "collins") {
    const cubes: [number, number, number, number][] =
      ice === "collins"
        ? [[CX - 10, p.level - 6, 20, 0], [CX - 10, p.level + 22, 20, 0], [CX - 10, p.level + 50, 20, 0], [CX - 10, p.level + 78, 20, 0]].map(
            ([x, y, s], i) => [x + (i % 2 ? 1.5 : -1.5), y, s, i % 2 ? 3 : -3] as [number, number, number, number],
          )
        : p.pts[0][1] > 30
          ? [[CX - 26, p.level - 7, 21, -10], [CX - 2, p.level + 6, 22, 9], [CX - 18, p.level + 24, 21, 22]]
          : [[CX - 20, p.level - 6, 18, -8], [CX - 2, p.level + 15, 18, 10], [CX - 19, p.level + 37, 18, 4], [CX - 1, p.level + 58, 18, -12], [CX - 17, p.level + 80, 18, 8]];
    return (
      <g>
        {cubes.filter(([, y, s]) => y + s < floor).map(([x, y, s, r], i) => (
          <Cube key={i} x={x} y={y} s={s} rot={r} id={id} tint={tint} />
        ))}
      </g>
    );
  }
  if (ice === "crushed") {
    return (
      <g>
        <path d={liquidPath(inn, p.level - 4)} fill="#fff" opacity=".16" />
        {Array.from({ length: 140 }).map((_, i) => {
          const y = p.level - 7 + rnd(i) * (floor - p.level + 4);
          const half = rAt(inn, Math.min(y, floor)) - 2;
          const x = CX - half + rnd(i, 2) * half * 2;
          const s = 1.6 + rnd(i, 3) * 3;
          const a = rnd(i, 5) * 6.28;
          return (
            <path
              key={i}
              d={`M${x} ${y} l${s * Math.cos(a)} ${s * Math.sin(a)} l${s * 0.7 * Math.cos(a + 2)} ${s * 0.7 * Math.sin(a + 2)} Z`}
              fill="#fff"
              fillOpacity={0.15 + rnd(i, 4) * 0.35}
              stroke="#fff"
              strokeOpacity={0.3 + rnd(i, 6) * 0.5}
              strokeWidth=".3"
            />
          );
        })}
      </g>
    );
  }
  return null;
}

// ───────────────────────────── the glass
export interface GlassRealProps {
  glass: Glass;
  color: string;
  opaque?: boolean;
  ice?: Ice;
  method?: Method;
  garnish?: string;
  size?: number;
  world: WorldId;
  uid: string;
}

const RIM_GOLD: Partial<Record<WorldId, string>> = { maison: "#d9b25f", anatolia: "#d9a521", jazz: "#d9b25f", riviera: "#e3b341" };

export function GlassReal(props: GlassRealProps) {
  const { glass, color, opaque, ice = "none", method, garnish, size = 120, world, uid } = props;
  const p = P[glass];
  if (!p) return <GlassSvg {...props} animate={false} />;

  const id = uid.replace(/[^a-zA-Z0-9_-]/g, "");
  const inn = inner(p);
  const outer = silhouette(p.pts);
  const innerPath = silhouette(inn);
  const liquid = liquidPath(inn, p.level);
  const rimY = p.pts[0][0];
  const rimR = p.pts[0][1];
  const surfR = rAt(inn, p.level);
  const floor = p.baseTop ?? inn[inn.length - 1][0];
  const bottomY = p.pts[p.pts.length - 1][0];
  const tumbler = Boolean(p.baseTop);
  const fizz = glass === "highball" || glass === "flute" || glass === "wine";
  const foam = method === "dryshake";
  const iced = ice !== "none";
  const gold = RIM_GOLD[world];

  // the drink as a lit cylinder
  const deep = shade(color, opaque ? -0.35 : -0.5);
  const mid = color;
  const lit = shade(color, opaque ? 0.18 : 0.38);
  const a = opaque ? 0.97 : 0.86;

  const mugMetal = p.copper;
  const ceramic = p.ceramic;
  const solidBody = mugMetal || ceramic;

  // highlight strips that follow the wall
  const strip = (k: number, y0: number, y1: number, w: number) => {
    const ys = Array.from({ length: 6 }, (_, i) => y0 + ((y1 - y0) * i) / 5);
    const l = ys.map((y) => [CX - rAt(p.pts, y) * k, y] as [number, number]);
    const r = [...ys].reverse().map((y) => [CX - rAt(p.pts, y) * k + w * (rAt(p.pts, y) / rimR + 0.35), y] as [number, number]);
    return `${smooth(l)} L${r[0][0].toFixed(2)} ${r[0][1].toFixed(2)}${smooth(r, false)} Z`;
  };
  const hiTop = rimY + (tumbler ? 6 : 4);
  const hiBottom = (p.stem ? bottomY - 6 : bottomY - 6);

  const gx = CX + rimR - 6;
  const gy = rimY - 2;

  return (
    <svg width={size} height={(size * 160) / 120} viewBox="0 0 120 160" className={`glass-art glass-real gw-${world}`} aria-hidden>
      <defs>
        <clipPath id={`o${id}`}>
          <path d={outer} />
        </clipPath>
        <clipPath id={`i${id}`}>
          <path d={innerPath} />
        </clipPath>
        <clipPath id={`l${id}`}>
          <path d={liquid} />
        </clipPath>
        {/* drink: dark at the walls, bright where light passes */}
        <linearGradient id={`lx${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={deep} stopOpacity={a} />
          <stop offset=".16" stopColor={mid} stopOpacity={a} />
          <stop offset=".42" stopColor={lit} stopOpacity={a * 0.92} />
          <stop offset=".62" stopColor={mid} stopOpacity={a * 0.95} />
          <stop offset=".9" stopColor={deep} stopOpacity={a} />
          <stop offset="1" stopColor={shade(color, -0.65)} stopOpacity={a} />
        </linearGradient>
        <linearGradient id={`ly${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={opaque ? 0.08 : 0.12} />
          <stop offset=".35" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity={opaque ? 0.22 : 0.32} />
        </linearGradient>
        <radialGradient id={`ca${id}`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor={shade(color, 0.7)} stopOpacity={opaque ? 0.15 : 0.75} />
          <stop offset="1" stopColor={shade(color, 0.5)} stopOpacity="0" />
        </radialGradient>
        {/* surface seen from above: the back catches the light */}
        <linearGradient id={`sf${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(color, opaque ? 0.3 : 0.5)} />
          <stop offset=".6" stopColor={shade(color, opaque ? 0.05 : 0.12)} />
          <stop offset="1" stopColor={shade(color, -0.2)} />
        </linearGradient>
        <linearGradient id={`fo${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffaf0" />
          <stop offset="1" stopColor={mix(color, "#f6efe0", 0.75)} />
        </linearGradient>
        <radialGradient id={`ice${id}`} cx=".3" cy=".25" r="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".75" />
          <stop offset=".45" stopColor="#eef6ff" stopOpacity=".3" />
          <stop offset="1" stopColor="#cfe2f2" stopOpacity=".42" />
        </radialGradient>
        <radialGradient id={`sph${id}`} cx=".38" cy=".32" r=".75">
          <stop offset="0" stopColor="#fff" stopOpacity=".7" />
          <stop offset=".6" stopColor="#e6f1fb" stopOpacity=".28" />
          <stop offset="1" stopColor="#bcd4ea" stopOpacity=".55" />
        </radialGradient>
        {/* the wall: brighter at the edges (Fresnel) */}
        <linearGradient id={`gw${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".34" />
          <stop offset=".1" stopColor="#fff" stopOpacity=".06" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".015" />
          <stop offset=".9" stopColor="#fff" stopOpacity=".06" />
          <stop offset="1" stopColor="#fff" stopOpacity=".3" />
        </linearGradient>
        <linearGradient id={`hi${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".15" stopColor="#fff" stopOpacity=".75" />
          <stop offset=".7" stopColor="#fff" stopOpacity=".45" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`st${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".25" />
          <stop offset=".35" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".55" stopColor="#fff" stopOpacity=".15" />
          <stop offset="1" stopColor="#000" stopOpacity=".2" />
        </linearGradient>
        <radialGradient id={`sh${id}`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`cu${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#4a1f0c" />
          <stop offset=".18" stopColor="#c46e3c" />
          <stop offset=".3" stopColor="#f6c49a" />
          <stop offset=".42" stopColor="#b8693a" />
          <stop offset=".8" stopColor="#7a3618" />
          <stop offset="1" stopColor="#3a1608" />
        </linearGradient>
        <linearGradient id={`ce${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={shade(ceramic ?? "#7a4a24", -0.55)} />
          <stop offset=".3" stopColor={shade(ceramic ?? "#7a4a24", 0.25)} />
          <stop offset=".45" stopColor={ceramic ?? "#7a4a24"} />
          <stop offset="1" stopColor={shade(ceramic ?? "#7a4a24", -0.6)} />
        </linearGradient>
        <linearGradient id={`ir${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7fe6ff" />
          <stop offset=".5" stopColor="#9b7bff" />
          <stop offset="1" stopColor="#ff7ac8" />
        </linearGradient>
        <pattern id={`kr${id}`} width="7" height="7" patternUnits="userSpaceOnUse">
          <path d="M0 3.5 L3.5 0 L7 3.5 L3.5 7 Z" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth=".4" />
        </pattern>
      </defs>

      {/* ── on the counter: soft shadow and the drink's coloured caustic */}
      <ellipse cx={CX + 4} cy="153" rx={(p.foot?.[1] ?? rAt(p.pts, bottomY)) + 12} ry="5.4" fill={`url(#sh${id})`} />
      {!solidBody && <ellipse cx={CX + 9} cy="152.5" rx={(p.foot?.[1] ?? rAt(p.pts, bottomY)) * 0.8} ry="3.6" fill={`url(#ca${id})`} />}

      {/* ── stem and foot */}
      {p.foot && (
        <g>
          <ellipse cx={CX} cy={p.foot[0]} rx={p.foot[1]} ry={p.foot[1] * TILT + 1.2} fill="#fff" fillOpacity=".08" />
          <path d={`M${CX - p.foot[1]} ${p.foot[0]} A${p.foot[1]} ${p.foot[1] * TILT + 1.2} 0 0 0 ${CX + p.foot[1]} ${p.foot[0]}`} fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth=".9" />
          <path d={`M${CX - p.foot[1]} ${p.foot[0]} A${p.foot[1]} ${p.foot[1] * TILT + 1.2} 0 0 1 ${CX + p.foot[1]} ${p.foot[0]}`} fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth=".6" />
          <ellipse cx={CX + 3} cy={p.foot[0] + 0.6} rx={p.foot[1] * 0.42} ry="1.3" fill={color} opacity={opaque ? 0.15 : 0.4} />
          <path d={`M${CX - p.foot[1] * 0.75} ${p.foot[0] + 1.6} Q${CX - p.foot[1] * 0.4} ${p.foot[0] + 3.2} ${CX - p.foot[1] * 0.05} ${p.foot[0] + 3.4}`} stroke="#fff" strokeOpacity=".85" strokeWidth=".8" fill="none" strokeLinecap="round" />
        </g>
      )}
      {p.stem && (
        <g>
          <path d={`M${CX - p.stem[2]} ${p.stem[0]} C${CX - p.stem[2] * 0.8} ${p.stem[0] + 20} ${CX - p.stem[2] * 0.8} ${p.stem[1] - 14} ${CX - p.stem[2] * 1.6} ${p.stem[1]} H${CX + p.stem[2] * 1.6} C${CX + p.stem[2] * 0.8} ${p.stem[1] - 14} ${CX + p.stem[2] * 0.8} ${p.stem[0] + 20} ${CX + p.stem[2]} ${p.stem[0]} Z`} fill={`url(#st${id})`} />
          <path d={`M${CX - p.stem[2] * 0.3} ${p.stem[0] + 3} V${p.stem[1] - 3}`} stroke="#fff" strokeOpacity=".7" strokeWidth=".5" />
          {/* a thread of the drink's colour refracted down the stem */}
          <path d={`M${CX + p.stem[2] * 0.35} ${p.stem[0] + 2} V${p.stem[0] + 18}`} stroke={color} strokeOpacity={opaque ? 0.2 : 0.5} strokeWidth=".7" />
        </g>
      )}

      {solidBody ? (
        // ── copper mug and tiki mug: the vessel hides the drink, only its surface shows
        <g>
          {mugMetal && <path d="M93 62 C116 62 116 120 91 120" stroke={`url(#cu${id})`} strokeWidth="6.5" fill="none" strokeLinecap="round" />}
          <path d={outer} fill={mugMetal ? `url(#cu${id})` : `url(#ce${id})`} />
          {mugMetal && (
            <g clipPath={`url(#o${id})`}>
              {[64, 92, 120].map((y) => (
                <path key={y} d={`M20 ${y} Q60 ${y + 5} 100 ${y}`} stroke="#3a1608" strokeOpacity=".35" strokeWidth=".8" fill="none" />
              ))}
              {Array.from({ length: 26 }).map((_, i) => (
                <circle key={i} cx={30 + rnd(i) * 60} cy={52 + rnd(i, 2) * 90} r={1.6 + rnd(i, 3) * 1.8} fill="#fff" opacity={0.05 + rnd(i, 4) * 0.08} />
              ))}
            </g>
          )}
          {ceramic && (
            <g stroke="#2a160a" strokeWidth="2.4" fill="none" strokeLinecap="round" clipPath={`url(#o${id})`}>
              <path d="M40 62 L54 58 M66 58 L80 62" />
              <path d="M44 74 q4 -6 8 0 M68 74 q4 -6 8 0" />
              <path d="M60 78 L55 100 L65 100" />
              <path d="M42 114 Q60 130 78 114 Z" fill="#2a160a" />
              <path d="M48 114 v5 M54 115 v6 M60 115 v6 M66 115 v6 M72 114 v5" stroke="#f4ead2" strokeWidth="1.4" />
              <path d="M28 40 H92 M30 138 H90" strokeWidth="1.4" strokeOpacity=".7" />
            </g>
          )}
          <path d={strip(0.62, rimY + 8, bottomY - 8, 4)} fill="#fff" opacity={mugMetal ? 0.45 : 0.22} />
          <ellipse cx={CX} cy={rimY} rx={rimR} ry={rimR * TILT + 0.6} fill={mugMetal ? "#f3c79a" : shade(ceramic!, 0.2)} />
          <ellipse cx={CX} cy={rimY + 1} rx={rimR - p.wall} ry={(rimR - p.wall) * TILT} fill={`url(#sf${id})`} />
          {iced && <path d={`M${CX - 12} ${rimY - 1} l6 -3 l4 3 l-5 2 Z M${CX + 6} ${rimY - 2} l7 -2 l2 4 l-6 1 Z`} fill="#fff" opacity=".8" />}
          <ellipse cx={CX} cy={rimY} rx={rimR} ry={rimR * TILT + 0.6} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth=".7" />
        </g>
      ) : (
        <g>
          {/* ── back wall of the glass, then the drink inside it */}
          <path d={outer} fill="#fff" fillOpacity=".035" />
          <path d={`M${CX - rimR} ${rimY} A${rimR} ${rimR * TILT} 0 0 1 ${CX + rimR} ${rimY}`} fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth=".6" />

          {color !== "transparent" && (
            <g>
              <path d={liquid} fill={`url(#lx${id})`} />
              <path d={liquid} fill={`url(#ly${id})`} />
              {/* light gathered by the curved glass, low in the drink */}
              {!opaque && (
                <ellipse cx={CX + 2} cy={floor - (floor - p.level) * 0.28} rx={surfR * 0.5} ry={(floor - p.level) * 0.22} fill={`url(#ca${id})`} clipPath={`url(#l${id})`} />
              )}
              {fizz && (
                <g clipPath={`url(#l${id})`}>
                  {Array.from({ length: 34 }).map((_, i) => {
                    const col = (i % 4) - 1.5;
                    const y = p.level + 4 + rnd(i) * (floor - p.level - 6);
                    const x = CX + col * rAt(inn, y) * 0.42 + (rnd(i, 2) - 0.5) * 4;
                    const r = 0.35 + rnd(i, 3) * 0.75;
                    return <circle key={i} cx={x} cy={y} r={r} fill="#fff" fillOpacity=".35" stroke="#fff" strokeOpacity=".8" strokeWidth=".25" />;
                  })}
                </g>
              )}
            </g>
          )}

          {/* ── ice, tinted where it sits in the drink */}
          {iced && (
            <g clipPath={`url(#i${id})`}>
              <IceFill ice={ice} p={p} inn={inn} id={id} color={color} under={foam ? 9 : 0} />
              {color !== "transparent" && !opaque && (
                <g clipPath={`url(#l${id})`}>
                  <path d={liquid} fill={color} opacity=".22" />
                </g>
              )}
            </g>
          )}

          {/* ── the surface, or a cap of foam */}
          {color !== "transparent" && (
            <g>
              {foam ? (
                <g>
                  <g clipPath={`url(#l${id})`}>
                    <rect x="0" y={p.level - 1} width="120" height="7.5" fill={`url(#fo${id})`} />
                    <rect x="0" y={p.level + 6} width="120" height="1.2" fill="#fff" opacity=".35" />
                  </g>
                  <ellipse cx={CX} cy={p.level} rx={surfR} ry={surfR * TILT} fill="#fffaf2" />
                  {Array.from({ length: 16 }).map((_, i) => (
                    <circle key={i} cx={CX - surfR * 0.8 + rnd(i) * surfR * 1.6} cy={p.level - surfR * TILT * 0.6 + rnd(i, 2) * surfR * TILT * 1.2} r={0.3 + rnd(i, 3) * 0.5} fill="none" stroke="#d9cdb6" strokeWidth=".3" />
                  ))}
                </g>
              ) : (
                <ellipse cx={CX} cy={p.level} rx={surfR} ry={surfR * TILT} fill={`url(#sf${id})`} opacity={opaque ? 1 : 0.95} />
              )}
              {/* meniscus: a bright line where the drink climbs the glass at the front */}
              <path d={`M${CX - surfR} ${p.level} A${surfR} ${surfR * TILT} 0 0 0 ${CX + surfR} ${p.level}`} fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth=".55" />
              {!foam && <ellipse cx={CX - surfR * 0.35} cy={p.level - surfR * TILT * 0.35} rx={surfR * 0.35} ry={surfR * TILT * 0.3} fill="#fff" opacity=".22" />}
            </g>
          )}

          {/* ── thick tumbler base: solid glass, lit and coloured by the drink */}
          {tumbler && (
            <g>
              <path d={`M${CX - rAt(p.pts, p.baseTop!) + 0.5} ${p.baseTop} L${CX - rAt(p.pts, bottomY) + 0.6} ${bottomY - 1.5} Q${CX - rAt(p.pts, bottomY)} ${bottomY} ${CX - rAt(p.pts, bottomY) + 3} ${bottomY} H${CX + rAt(p.pts, bottomY) - 3} Q${CX + rAt(p.pts, bottomY)} ${bottomY} ${CX + rAt(p.pts, bottomY) - 0.6} ${bottomY - 1.5} L${CX + rAt(p.pts, p.baseTop!) - 0.5} ${p.baseTop} Z`} fill="#fff" fillOpacity=".14" />
              {color !== "transparent" && <ellipse cx={CX} cy={(p.baseTop! + bottomY) / 2 + 1} rx={rAt(p.pts, bottomY) * 0.7} ry={(bottomY - p.baseTop!) * 0.34} fill={color} opacity={opaque ? 0.18 : 0.45} />}
              <path d={`M${CX - rAt(inn, p.baseTop!)} ${p.baseTop} A${rAt(inn, p.baseTop!)} ${rAt(inn, p.baseTop!) * TILT} 0 0 0 ${CX + rAt(inn, p.baseTop!)} ${p.baseTop}`} fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth=".6" />
              <path d={`M${CX - rAt(p.pts, bottomY) + 4} ${bottomY - 2.4} H${CX + rAt(p.pts, bottomY) * 0.2}`} stroke="#fff" strokeOpacity=".85" strokeWidth=".8" strokeLinecap="round" />
            </g>
          )}

          {/* ── the world's glass craft, etched into the wall */}
          <Craft world={world} p={p} id={id} tumbler={tumbler} />

          {/* ── condensation on a cold glass */}
          {iced && (
            <g clipPath={`url(#o${id})`}>
              <rect x="0" y={p.level + 2} width="120" height="160" fill="#fff" opacity=".05" />
              {Array.from({ length: tumbler ? 46 : 24 }).map((_, i) => {
                const y = p.level + 3 + rnd(i, 7) * ((p.baseTop ?? floor) - p.level - 4);
                const half = rAt(p.pts, y);
                const x = CX - half * 0.94 + rnd(i, 8) * half * 1.88;
                const r = 0.35 + rnd(i, 9) ** 2 * 1.25;
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r={r} fill="#fff" fillOpacity=".16" />
                    <path d={`M${x - r * 0.8} ${y + r * 0.3} A${r} ${r} 0 0 0 ${x + r * 0.8} ${y + r * 0.3}`} stroke="#000" strokeOpacity=".22" strokeWidth={Math.max(0.2, r * 0.35)} fill="none" />
                    <circle cx={x - r * 0.35} cy={y - r * 0.35} r={Math.max(0.15, r * 0.28)} fill="#fff" opacity=".9" />
                  </g>
                );
              })}
            </g>
          )}

          {/* ── the wall: thickness, Fresnel edges, reflections */}
          <path d={`${outer} ${innerPath}`} fillRule="evenodd" fill="#fff" fillOpacity=".16" />
          <path d={outer} fill={`url(#gw${id})`} />
          <path d={strip(0.78, hiTop, hiBottom, 3.4)} fill={`url(#hi${id})`} opacity=".85" />
          <path d={strip(0.9, hiTop + 2, hiBottom - 4, 0.9)} fill="#fff" opacity=".75" />
          <path d={strip(-0.6, hiTop + 6, (hiTop + hiBottom) / 2, 1.8)} fill={`url(#hi${id})`} opacity=".4" />
          <path d={outer} fill="none" stroke="#000" strokeOpacity=".28" strokeWidth="1.4" />
          <path d={outer} fill="none" stroke={world === "cosmos" ? `url(#ir${id})` : "#fff"} strokeOpacity={world === "cosmos" ? 0.95 : 0.7} strokeWidth=".7" />

          {/* ── rim: the front lip catches the light */}
          <ellipse cx={CX} cy={rimY} rx={rimR - p.wall / 2} ry={(rimR - p.wall / 2) * TILT} fill="none" stroke="#fff" strokeOpacity=".22" strokeWidth={p.wall} />
          <path d={`M${CX - rimR} ${rimY} A${rimR} ${rimR * TILT} 0 0 0 ${CX + rimR} ${rimY}`} fill="none" stroke={gold ?? "#fff"} strokeOpacity={gold ? 0.95 : 0.9} strokeWidth={gold ? 1.3 : 0.9} />
          <path d={`M${CX - rimR} ${rimY} A${rimR} ${rimR * TILT} 0 0 1 ${CX + rimR} ${rimY}`} fill="none" stroke={gold ?? "#fff"} strokeOpacity={gold ? 0.6 : 0.45} strokeWidth=".6" />
          <path d={`M${CX - rimR * 0.82} ${rimY + rimR * TILT * 0.55} Q${CX - rimR * 0.5} ${rimY + rimR * TILT * 0.95} ${CX - rimR * 0.12} ${rimY + rimR * TILT}`} stroke="#fff" strokeWidth="1" strokeLinecap="round" fill="none" />
        </g>
      )}

      {garnish && garnish !== "none" && <GarnishIcon kind={garnish} x={gx} y={gy} />}
    </svg>
  );
}

/** Each world's craft, etched lightly so the glass still reads as glass. */
function Craft({ world, p, id, tumbler }: { world: WorldId; p: Profile; id: string; tumbler: boolean }) {
  const rimY = p.pts[0][0];
  const bottom = p.baseTop ?? p.pts[p.pts.length - 1][0];
  const clip = `url(#o${id})`;
  if (world === "maison") {
    // cut crystal: fan cuts on stemware, vertical flutes on tumblers
    return tumbler ? (
      <g clipPath={clip} stroke="#fff" strokeOpacity=".22" strokeWidth=".6">
        {Array.from({ length: 13 }).map((_, i) => (
          <path key={i} d={`M${CX - 36 + i * 6} ${p.level + 18} L${CX - 37 + i * 6} ${bottom}`} />
        ))}
      </g>
    ) : (
      <g clipPath={clip} stroke="#fff" strokeOpacity=".14" strokeWidth=".5" fill="none">
        {Array.from({ length: 11 }).map((_, i) => {
          const k = (i - 5) / 5;
          const yTop = bottom - (bottom - p.level) * 0.42;
          return <path key={i} d={`M${CX + k * 4} ${bottom} L${CX + k * rAt(p.pts, yTop) * 0.9} ${yTop}`} />;
        })}
      </g>
    );
  }
  if (world === "sakura") {
    // Edo kiriko: a coloured overlay cut through in a diamond lattice
    const y = p.level + (bottom - p.level) * (tumbler ? 0.45 : 0.4);
    return (
      <g clipPath={clip}>
        <rect x="0" y={y} width="120" height={bottom - y + 2} fill={tumbler || p.pts[0][1] < 20 ? "#c8102e" : "#1f4fa8"} opacity=".24" />
        <rect x="0" y={y} width="120" height={bottom - y + 2} fill={`url(#kr${id})`} />
      </g>
    );
  }
  if (world === "boreal") {
    const y = bottom - (bottom - p.level) * 0.4;
    return (
      <g clipPath={clip}>
        <rect x="0" y={y} width="120" height="160" fill="#fff" opacity=".16" />
        <g stroke="#fff" strokeOpacity=".5" strokeWidth=".5" fill="none">
          {Array.from({ length: 6 }).map((_, i) => {
            const x = CX - p.pts[0][1] + 8 + i * ((p.pts[0][1] * 2 - 16) / 5);
            return <path key={i} d={`M${x} ${y + 5} v-6 m-2.4 1.4 l4.8 2.8 m0 -2.8 l-4.8 2.8`} />;
          })}
        </g>
      </g>
    );
  }
  if (world === "anatolia") {
    return (
      <g clipPath={clip} fill="none" stroke="#d9a521" strokeWidth=".7" opacity=".85">
        {[-1, 0, 1].map((k) => (
          <path key={k} transform={`translate(${CX + k * 13} ${p.band + 4}) scale(.28)`} d="M0 -26 C6 -16 14 -14 14 -2 C14 8 6 12 0 12 C-6 12 -14 8 -14 -2 C-14 -14 -6 -16 0 -26Z M0 12 V26" />
        ))}
      </g>
    );
  }
  if (world === "jazz") {
    return (
      <g clipPath={clip} stroke="#fff" strokeOpacity=".35" fill="none" strokeWidth=".5">
        {Array.from({ length: 7 }).map((_, i) => (
          <path key={i} d={`M${CX - 48 + i * 14} ${p.band + 4} a7 7 0 0 1 14 0 M${CX - 41 + i * 14} ${p.band + 4} v-7`} />
        ))}
      </g>
    );
  }
  if (world === "riviera" && !tumbler) {
    const r = p.pts[0][1];
    return (
      <g clipPath={clip} fill="none" stroke="#e3b341" strokeOpacity=".65" strokeWidth=".6">
        <path d={`M${CX - r} ${p.band + 4} C${CX - r / 2} ${p.band - 2} ${CX - 6} ${p.band + 8} ${CX + 2} ${p.band + 2} S${CX + r / 2} ${p.band - 2} ${CX + r} ${p.band + 4}`} />
        {[-0.55, 0, 0.55].map((k) => (
          <g key={k} transform={`translate(${CX + k * r} ${p.band + 6})`} fill="#e3b341" fillOpacity=".5" stroke="none">
            <circle r="1.1" cx="-1.1" /><circle r="1.1" cx="1.1" /><circle r="1.1" cy="1.9" />
          </g>
        ))}
      </g>
    );
  }
  if (world === "alchemist") {
    const x = CX + p.pts[0][1] * 0.5;
    return (
      <g stroke="#fff" strokeOpacity=".6" strokeWidth=".5" fontSize="3.6" fill="#fff" fillOpacity=".6">
        {Array.from({ length: 5 }).map((_, i) => {
          const y = bottom - 6 - i * ((bottom - rimY - 10) / 5);
          return (
            <g key={i}>
              <line x1={x} y1={y} x2={x + (i % 2 ? 3.5 : 6)} y2={y} />
              {i % 2 === 0 && <text x={x + 7.5} y={y + 1.3} stroke="none">{(i + 1) * 25}</text>}
            </g>
          );
        })}
      </g>
    );
  }
  if (world === "tiki" && tumbler) {
    const y = bottom - (bottom - p.level) * 0.4;
    return (
      <g clipPath={clip}>
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={i * 10} y={y} width="8.6" height="160" rx="3.6" fill={i % 2 ? "#b8914c" : "#d9b56a"} />
        ))}
        <rect x="0" y={y} width="120" height="2" fill="#6b4a1f" />
        <rect x="0" y={y + (bottom - y) * 0.55} width="120" height="1.8" fill="#6b4a1f" />
      </g>
    );
  }
  return null;
}
