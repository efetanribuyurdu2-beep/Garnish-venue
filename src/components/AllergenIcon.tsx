/**
 * Fourteen hand-drawn allergen marks (24×24, one stroke weight, currentColor),
 * so a guest reads "egg" or "nuts" at a glance instead of a letter code.
 * Hook-free: usable from server and client components.
 */
const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const ICONS: Record<string, React.ReactNode> = {
  // an ear of wheat
  gluten: (
    <g {...P}>
      <path d="M12 21V8" />
      <path d="M12 9c-2.6-.3-3.8-2.2-3.6-4.6 2.5.1 3.8 1.9 3.6 4.6zM12 9c2.6-.3 3.8-2.2 3.6-4.6-2.5.1-3.8 1.9-3.6 4.6z" />
      <path d="M12 13.5c-2.6-.3-3.8-2.2-3.6-4.6 2.5.1 3.8 1.9 3.6 4.6zM12 13.5c2.6-.3 3.8-2.2 3.6-4.6-2.5.1-3.8 1.9-3.6 4.6z" />
      <path d="M12 18c-2.6-.3-3.8-2.2-3.6-4.6 2.5.1 3.8 1.9 3.6 4.6zM12 18c2.6-.3 3.8-2.2 3.6-4.6-2.5.1-3.8 1.9-3.6 4.6z" />
    </g>
  ),
  // a curled shrimp
  crustaceans: (
    <g {...P}>
      <path d="M17.5 6.5c-4.5-1.8-10 .8-10.6 6-.4 3.6 2.4 6.5 5.8 6.2" />
      <path d="M17.5 6.5c1.6 2.6.3 6.2-2.8 7.2-2 .7-3.6-.4-3.6-2" />
      <path d="M12.7 19.2l-1.6 2.3M12.7 19.2l2.4 1.4" />
      <path d="M17.5 6.5l3-2.5M16 5.6l1.4-3" />
      <path d="M9.6 9.5l1.5 1.3M8.3 12.5h2M9 15.6l1.7-.9" />
    </g>
  ),
  egg: (
    <g {...P}>
      <path d="M12 3c3.6 0 6.5 5.4 6.5 10.2 0 4-2.9 7.3-6.5 7.3s-6.5-3.3-6.5-7.3C5.5 8.4 8.4 3 12 3z" />
      <path d="M9 9.5c.6-1.5 1.5-2.6 2.4-3" opacity=".6" />
    </g>
  ),
  fish: (
    <g {...P}>
      <path d="M3 12c3-4.6 9-5.6 13.2-2.1L20.5 7v10l-4.3-2.9C12 17.6 6 16.6 3 12z" />
      <circle cx="7.6" cy="11.3" r=".7" fill="currentColor" />
      <path d="M11.5 9.6c.8 1.5.8 3.3 0 4.8" opacity=".6" />
    </g>
  ),
  // the waisted shell of a peanut
  peanuts: (
    <g {...P}>
      <path d="M9.2 3.6c2.6-1 5.3.8 5.3 3.6 0 1.6-.7 2.3-.5 3.4.2 1 1.8 1.6 2.5 3.4 1.1 2.9-.8 6.4-4.3 6.4S6.7 17.2 7.5 14c.4-1.6 1.6-2.2 1.6-3.4 0-1-1.6-1.8-1.6-3.6 0-1.5.6-2.9 1.7-3.4z" />
      <path d="M10.3 6.5h.01M12.3 8h.01M11 15h.01M13 16.6h.01" strokeWidth="2.2" />
    </g>
  ),
  // a soy pod with three beans
  soy: (
    <g {...P}>
      <path d="M4.5 18.5c-.6-5 3-12 13.6-14 1 .2 1.5.7 1.5 1.5-2 10.6-9 14.1-14 13.6-.6 0-1-.5-1.1-1.1z" />
      <circle cx="8.6" cy="15.4" r="1.7" />
      <circle cx="12" cy="12" r="1.7" />
      <circle cx="15.4" cy="8.6" r="1.7" />
    </g>
  ),
  // a milk bottle
  milk: (
    <g {...P}>
      <path d="M9.5 2.8h5M10 2.8v3.4L7.6 9.4c-.4.5-.6 1.1-.6 1.8v8.4c0 .9.7 1.6 1.6 1.6h6.8c.9 0 1.6-.7 1.6-1.6v-8.4c0-.7-.2-1.3-.6-1.8L14 6.2V2.8" />
      <path d="M7 13.2c1.7-.9 3.3.9 5 0s3.3-.9 5 0" />
    </g>
  ),
  // a hazelnut in its cap
  nuts: (
    <g {...P}>
      <path d="M12 8.2c4 0 6.6 3 6.6 6.4 0 3.6-2.9 6-6.6 6s-6.6-2.4-6.6-6c0-3.4 2.6-6.4 6.6-6.4z" />
      <path d="M5.6 11c.8-2.8 3.4-4.6 6.4-4.6s5.6 1.8 6.4 4.6" />
      <path d="M12 6.4V3.4M12 3.4c1.3-.6 2.6-.4 3.4.4" />
      <path d="M9 14.5c.4 1.5 1.4 2.6 2.6 3" opacity=".6" />
    </g>
  ),
  // a celery stalk with leaves
  celery: (
    <g {...P}>
      <path d="M9 21c-.2-4.4.3-8.4 1.6-11.5M13.5 21c.3-4.2.1-8.2-.9-11.4" />
      <path d="M9 21h4.5" />
      <path d="M10.6 9.5c-2.6.1-4.3-1.6-4.2-4.2 2.6 0 4.1 1.6 4.2 4.2zM12.6 9.6c.2-2.8 1.9-4.6 4.6-4.4.1 2.8-1.7 4.5-4.6 4.4zM11.6 8.6c-1.2-2-.9-4.2.9-5.6 1.4 1.9 1 4.1-.9 5.6z" />
    </g>
  ),
  // a mustard pot with its spoon
  mustard: (
    <g {...P}>
      <path d="M6.5 10h11l-1 9.6c-.1.8-.8 1.4-1.6 1.4H9.1c-.8 0-1.5-.6-1.6-1.4z" />
      <path d="M5.8 10c0-1.4 1.1-2.4 2.5-2.4h7.4c1.4 0 2.5 1 2.5 2.4" />
      <path d="M14.5 7.6L17.4 2.6" />
      <path d="M9.4 14.5h5.2" opacity=".6" />
    </g>
  ),
  // scattered sesame seeds
  sesame: (
    <g {...P}>
      <path d="M8 4.5c1.6.6 2 2.8.8 4.2-1.6-.6-2-2.8-.8-4.2zM15.4 6c1.2 1.3.9 3.5-.7 4.2-1.2-1.3-.9-3.5.7-4.2zM6 13c1.7-.1 3 1.6 2.6 3.3-1.7.1-3-1.6-2.6-3.3zM12.4 12.4c1.7.4 2.6 2.4 1.7 3.9-1.7-.4-2.6-2.4-1.7-3.9zM17.4 15.4c1 1.4.4 3.5-1.3 4-1-1.4-.4-3.5 1.3-4zM10.4 18.4c1.6.7 1.9 2.8.6 4-1.5-.7-1.9-2.8-.6-4z" />
    </g>
  ),
  // a wine glass (sulphites live in wine, vermouth and cocktail cherries) with the SO₂ mark
  sulphites: (
    <g {...P}>
      <path d="M7 3h7l.4 4.4c.4 3.2-1.8 5.6-3.9 5.6s-4.3-2.4-3.9-5.6z" />
      <path d="M10.5 13v6.5M7.5 20.5h6" />
      <path d="M7.4 7.6h6.2" opacity=".6" />
      <text x="15.2" y="20.6" fontSize="6.4" fill="currentColor" stroke="none" fontFamily="system-ui, sans-serif" fontWeight="600">S</text>
    </g>
  ),
  // a lupin spike
  lupin: (
    <g {...P}>
      <path d="M12 21V6" />
      <path d="M12 5c-1-.5-1.4-1.6-1-2.6 1 .2 1.6 1.2 1 2.6zM12 5c1-.5 1.4-1.6 1-2.6-1 .2-1.6 1.2-1 2.6z" />
      <path d="M12 9c-1.5-.3-2.4-1.6-2.1-3 1.5.3 2.4 1.6 2.1 3zM12 9c1.5-.3 2.4-1.6 2.1-3-1.5.3-2.4 1.6-2.1 3z" />
      <path d="M12 13.4c-2-.2-3.2-1.9-2.9-3.8 2 .2 3.2 1.9 2.9 3.8zM12 13.4c2-.2 3.2-1.9 2.9-3.8-2 .2-3.2 1.9-2.9 3.8z" />
      <path d="M12 17c-1.8-1.2-4-.9-5.2.6 1.8 1.2 4 .9 5.2-.6zM12 17c1.8-1.2 4-.9 5.2.6-1.8 1.2-4 .9-5.2-.6z" />
    </g>
  ),
  // a scallop shell
  molluscs: (
    <g {...P}>
      <path d="M12 19.5L4 9.6C5.6 6 8.6 4 12 4s6.4 2 8 5.6z" />
      <path d="M12 19.5L8.6 5M12 19.5V4M12 19.5L15.4 5M12 19.5L5.6 7.4M12 19.5l6.4-12.1" opacity=".75" />
      <path d="M10 19.5v1.6h4v-1.6" />
    </g>
  ),
};

export function AllergenIcon({ id, size = 18, title }: { id: string; size?: number; title?: string }) {
  const icon = ICONS[id];
  if (!icon) return null;
  return (
    <svg className="al-icon" width={size} height={size} viewBox="0 0 24 24" role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {title && <title>{title}</title>}
      {icon}
    </svg>
  );
}
