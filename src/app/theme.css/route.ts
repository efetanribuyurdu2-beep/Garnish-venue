import { themeCSS } from "@/lib/themeKit";

/**
 * The nine worlds' motifs (SVG data URIs as CSS variables), served once as a
 * static, cacheable stylesheet. Inlined in the layout they were sent twice on
 * every page (in the HTML and again in the RSC payload: ~270 KB of 1 MB) and
 * never cached. The layout links it with a content hash, so it can be kept.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(themeCSS(), {
    headers: { "Content-Type": "text/css; charset=utf-8", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
