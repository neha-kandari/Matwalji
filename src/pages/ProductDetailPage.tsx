import { useState } from "react";
import { ChevronRight, Heart, PlayCircle, Instagram, Facebook, Phone, Check, ExternalLink } from "lucide-react";

const COLOR_HEX: Record<string, string> = {
  scarlet: "#9B1B30", ivory: "#FFFDF0", "deep maroon": "#4A0010", maroon: "#6D0010",
  "champagne gold": "#C7A15B", champagne: "#C7A15B", "blush pink": "#F4C2C2",
  "rose gold": "#C9876C", "midnight blue": "#191970", silver: "#C0C0C0",
  "deep blue": "#1A237E", "royal blue": "#2962FF", "forest green": "#1B5E20",
  gold: "#C7A15B", magenta: "#C2185B", teal: "#00695C", burgundy: "#6D0010",
  copper: "#B87333", cobalt: "#0047AB", navy: "#001F5B", peach: "#FFCBA4",
  white: "#FAFAFA", black: "#1a1a1a", red: "#C62828", green: "#2E7D32",
  purple: "#6A1B9A", pink: "#E91E63", orange: "#E65100", yellow: "#F9A825",
  beige: "#E8D5B7", cream: "#F5F0E1", rust: "#8B2500", emerald: "#004D40",
  jade: "#00695C", mustard: "#B8860B", lavender: "#9C64A6", turquoise: "#0097A7",
  mint: "#80CBC4", coral: "#E64A19", saffron: "#F4A20A", wine: "#722F37",
  plum: "#6B2560", terracotta: "#9E4620", "sky blue": "#87CEEB", crimson: "#9B1B30",
  "pearl white": "#F5F5F0", "off-white": "#FAF8F2", "bridal red": "#C62828",
};

function getColorHex(name: string, overrides: Record<string, string> = {}): string {
  const key = name.toLowerCase().trim();
  // Admin-managed colors (from /api/filters) take priority over the built-in fallback map.
  if (overrides[key]) return overrides[key];
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  for (const [k, v] of Object.entries(COLOR_HEX)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return "#C7A15B";
}
import GoldDivider from "../components/GoldDivider";
import ProductCard from "../components/ProductCard";
import SectionHeader from "../components/SectionHeader";
import { CATEGORY_META } from "../data/categories";
import { SOCIAL_LINKS } from "../data/social";
import type { Page, Product } from "../types";

// A product's "video" is an Instagram reel/post, not a self-hosted file —
// clicking it sends the visitor straight to that reel on Instagram.
type MediaItem = { type: "image"; src: string } | { type: "video"; instagramUrl: string };

interface Props {
  product: Product;
  wishlist: Product[];
  onWishlist: (p: Product) => void;
  setPage: (p: Page) => void;
  onViewProduct: (p: Product) => void;
  products: Product[];
  colorMap?: Record<string, string>;
}

export default function ProductDetailPage({
  product,
  wishlist,
  onWishlist,
  setPage,
  onViewProduct,
  products,
  colorMap = {},
}: Props) {
  const wishlisted = wishlist.some((w) => w.id === product.id);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const meta = CATEGORY_META[product.category];
  const requiresSize = !!product.sizes && product.sizes.length > 0;
  const requiresColor = !!product.colors && product.colors.length > 0;
  const missingSelections = [
    requiresSize && !selectedSize ? "a size" : null,
    requiresColor && !selectedColor ? "a colour" : null,
  ].filter((v): v is string => v !== null);
  const canAddToWishlist = missingSelections.length === 0;

  const media: MediaItem[] = [
    ...product.images.map((src): MediaItem => ({ type: "image", src })),
    ...(product.instagramUrl ? [{ type: "video", instagramUrl: product.instagramUrl } as MediaItem] : []),
  ];
  const activeMedia = media[activeImg] ?? media[0];

  function buildEnquiryWhatsAppLink(): string {
    const lines = [
      "Hi MATWALJI! I'm interested in this piece:",
      "",
      `${product.name} – ${product.price}`,
      `Category: ${meta.label}`,
    ];
    if (selectedColor) lines.push(`Colour: ${selectedColor}`);
    if (selectedSize) lines.push(`Size: ${selectedSize}`);
    lines.push("", "Could you share more details?");
    return `${SOCIAL_LINKS.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  const related = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="pt-[70px]" style={{ background: "#F8F4EF", minHeight: "100vh" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setPage("home")}
            className="text-[10px] tracking-wide hover:text-[#C7A15B] transition-colors"
            style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
          >
            Home
          </button>
          <ChevronRight size={10} style={{ color: "#b0a090" }} />
          <button
            onClick={() => setPage(product.category)}
            className="text-[10px] tracking-wide hover:text-[#C7A15B] transition-colors"
            style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
          >
            {meta.label}
          </button>
          <ChevronRight size={10} style={{ color: "#b0a090" }} />
          <span
            className="text-[10px] tracking-wide"
            style={{ color: "#2A0710", fontFamily: "var(--font-body)" }}
          >
            {product.name}
          </span>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 lg:items-start">
          {/* Gallery — pinned in place on desktop while the info panel scrolls past it */}
          <div className="flex gap-3 lg:sticky lg:top-[90px] lg:self-start">
            {/* Thumbnails */}
            {media.length > 1 && (
              <div className="flex flex-col gap-2 w-16 flex-shrink-0">
                {media.map((m, i) =>
                  m.type === "video" ? (
                    <a
                      key={i}
                      href={m.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setActiveImg(i)}
                      title="Watch on Instagram"
                      className="relative w-16 h-20 overflow-hidden border-2 transition-all duration-200"
                      style={{ borderColor: activeImg === i ? "#C7A15B" : "transparent" }}
                    >
                      <img src={product.image} alt="" className="w-full h-full object-cover object-top" />
                      <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(42,7,16,0.45)" }}>
                        <PlayCircle size={18} color="#fff" />
                      </div>
                    </a>
                  ) : (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className="relative w-16 h-20 overflow-hidden border-2 transition-all duration-200"
                      style={{ borderColor: activeImg === i ? "#C7A15B" : "transparent" }}
                    >
                      <img src={m.src} alt="" className="w-full h-full object-cover object-top" />
                    </button>
                  )
                )}
              </div>
            )}

            {/* Main media */}
            <div
              className="flex-1 relative overflow-hidden rounded-[2px] bg-[#e8ddd5]"
              style={{ aspectRatio: "3/4" }}
            >
              {activeMedia?.type === "video" ? (
                <a
                  href={activeMedia.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block w-full h-full"
                >
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover object-top" />
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-colors duration-300 group-hover:bg-black/10"
                    style={{ background: "rgba(42,7,16,0.35)" }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{ background: "rgba(255,255,255,0.95)" }}
                    >
                      <PlayCircle size={30} style={{ color: "#2A0710" }} />
                    </div>
                    <span
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-[0.18em] uppercase"
                      style={{ background: "#2A0710", color: "#E8D2A6", fontFamily: "var(--font-body)" }}
                    >
                      Watch on Instagram <ExternalLink size={11} />
                    </span>
                  </div>
                </a>
              ) : (
                <img
                  src={activeMedia?.src || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                />
              )}
              {product.tag && (
                <div
                  className="absolute top-4 left-4 px-3 py-1 text-[9px] tracking-[0.2em] uppercase"
                  style={{ background: "#C7A15B", color: "#2A0710", fontFamily: "var(--font-body)" }}
                >
                  {product.tag}
                </div>
              )}
            </div>
          </div>

          {/* Info panel */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-px w-8" style={{ background: "#C7A15B" }} />
              <span
                className="text-[10px] tracking-[0.26em] uppercase"
                style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
              >
                {meta.label}
              </span>
            </div>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
                color: "#2A0710",
                fontWeight: 300,
                lineHeight: 1.15,
              }}
            >
              {product.name}
            </h1>

            <GoldDivider className="mt-5 mb-6" />

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span
                style={{
                  fontFamily: "var(--font-price)",
                  fontSize: "2.1rem",
                  color: "#2A0710",
                  fontWeight: 500,
                }}
              >
                {product.price}
              </span>
              <span
                className="text-xs"
                style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
              >
                Enquire for availability
              </span>
            </div>

            <p
              className="mb-4 leading-relaxed text-sm"
              style={{ color: "#4a3a2a", fontFamily: "var(--font-body)" }}
            >
              {product.description}
            </p>

            {/* Instagram / social CTA */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 mb-6 p-3.5 border-l-2"
              style={{ borderColor: "#C7A15B", background: "rgba(199,161,91,0.05)" }}
            >
              <p className="text-xs leading-relaxed" style={{ color: "#4a3a2a", fontFamily: "var(--font-body)" }}>
                See this piece styled in real life — visit us on{" "}
                <a
                  href={product.instagramUrl || SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-[#C7A15B] transition-colors"
                  style={{ color: "#2A0710" }}
                >
                  Instagram
                </a>{" "}
                <span style={{ color: "#7a6a5a" }}>{SOCIAL_LINKS.instagramHandle}</span>
              </p>
              <div className="flex items-center gap-2 flex-shrink-0">
                {[
                  { Icon: Instagram, href: product.instagramUrl || SOCIAL_LINKS.instagram },
                  { Icon: Facebook, href: SOCIAL_LINKS.facebook },
                  { Icon: Phone, href: SOCIAL_LINKS.whatsapp },
                ].map(({ Icon, href }, i) => (
                  <a
                    key={i}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 border flex items-center justify-center transition-all duration-200 hover:bg-[#C7A15B] hover:border-[#C7A15B]"
                    style={{ borderColor: "rgba(199,161,91,0.3)", color: "#C7A15B" }}
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Fabric", val: product.fabric },
                { label: "Occasion", val: product.occasion.split(" / ")[0] },
                ...(product.blouseDetails
                  ? [{ label: "Blouse", val: "Included — custom sizing" }]
                  : []),
              ].map(({ label, val }) => (
                <div
                  key={label}
                  className="p-3 border-l-2"
                  style={{ borderColor: "#C7A15B", background: "rgba(199,161,91,0.05)" }}
                >
                  <p
                    className="text-[9.5px] tracking-[0.2em] uppercase mb-0.5"
                    style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
                  >
                    {label}
                  </p>
                  <p
                    className="text-xs leading-snug"
                    style={{ color: "#252525", fontFamily: "var(--font-body)" }}
                  >
                    {val}
                  </p>
                </div>
              ))}
            </div>

            {/* Colour + Size selection */}
            {(requiresColor || requiresSize) && (
              <div
                className="mb-6"
                style={{ border: "1px solid rgba(199,161,91,0.28)" }}
              >
                {requiresColor && (
                  <div
                    className="p-5"
                    style={requiresSize ? { borderBottom: "1px solid rgba(199,161,91,0.16)" } : undefined}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] tracking-[0.24em] uppercase" style={{ color: "#C7A15B", fontFamily: "var(--font-body)", fontWeight: 700 }}>
                        Colour
                      </span>
                      <span className="text-xs" style={{ color: "#2A0710", fontFamily: "var(--font-body)", fontWeight: 500 }}>
                        {selectedColor || "Choose a shade"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {product.colors.map((c, i) => {
                        const active = selectedColor === c;
                        return (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setSelectedColor(c)}
                            title={c}
                            className="group relative flex flex-col items-center gap-2"
                          >
                            <span
                              className="rounded-full flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                              style={{
                                width: 34,
                                height: 34,
                                background: getColorHex(c, colorMap),
                                border: "1.5px solid rgba(0,0,0,0.08)",
                                boxShadow: active ? "0 0 0 2px #fff, 0 0 0 3.5px #C7A15B" : "0 1px 4px rgba(0,0,0,0.18)",
                              }}
                            />
                            {active && (
                              <span
                                className="absolute -top-0.5 -right-0.5 rounded-full flex items-center justify-center"
                                style={{ width: 18, height: 18, background: "#2A0710", border: "1.5px solid #fff" }}
                              >
                                <Check size={9} style={{ color: "#C7A15B" }} strokeWidth={3} />
                              </span>
                            )}
                            <span
                              className="text-[9px] tracking-[0.08em] max-w-[56px] truncate text-center"
                              style={{
                                color: active ? "#2A0710" : "#7a6a5a",
                                fontFamily: "var(--font-body)",
                                fontWeight: active ? 600 : 400,
                              }}
                            >
                              {c}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {requiresSize && (
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[10px] tracking-[0.24em] uppercase" style={{ color: "#C7A15B", fontFamily: "var(--font-body)", fontWeight: 700 }}>
                        Size
                      </span>
                      <span className="text-xs" style={{ color: "#2A0710", fontFamily: "var(--font-body)", fontWeight: 500 }}>
                        {selectedSize || "Choose a size"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {product.sizes!.map((s) => {
                        const active = selectedSize === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSelectedSize(s)}
                            className="min-w-[46px] px-4 py-2.5 border text-[11px] tracking-[0.06em] transition-all duration-200 hover:-translate-y-0.5"
                            style={{
                              fontFamily: "var(--font-body)",
                              background: active ? "#2A0710" : "#fdfaf7",
                              color: active ? "#C7A15B" : "#3a2a1a",
                              borderColor: active ? "#2A0710" : "rgba(199,161,91,0.3)",
                              fontWeight: active ? 600 : 400,
                              boxShadow: active ? "0 4px 14px rgba(42,7,16,0.25)" : "none",
                            }}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {missingSelections.length > 0 && (
                  <p
                    className="px-5 pb-4 -mt-1 text-[10.5px]"
                    style={{ color: "#9B1B30", fontFamily: "var(--font-body)" }}
                  >
                    Please select {missingSelections.join(" and ")} to add this piece to your wishlist.
                  </p>
                )}
              </div>
            )}

            {/* Blouse note */}
            {product.blouseDetails && (
              <p
                className="mb-6 text-xs leading-relaxed px-3 py-2.5 border-l-2"
                style={{
                  borderColor: "#C7A15B",
                  background: "rgba(199,161,91,0.06)",
                  color: "#4a3a2a",
                  fontFamily: "var(--font-body)",
                }}
              >
                <strong style={{ color: "#C7A15B" }}>Blouse: </strong>
                {product.blouseDetails}
              </p>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  if (!canAddToWishlist) return;
                  onWishlist(product);
                  setPage("wishlist");
                }}
                disabled={!canAddToWishlist}
                title={canAddToWishlist ? undefined : `Please select ${missingSelections.join(" and ")} first`}
                className="flex-1 flex items-center justify-center gap-2.5 py-4 text-[11px] tracking-[0.22em] uppercase transition-all duration-200 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
                style={{ background: "#2A0710", color: "#C7A15B", fontFamily: "var(--font-body)" }}
              >
                <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
                {wishlisted ? "View My Wishlist" : "Add to Wishlist"}
              </button>
              <a
                href={buildEnquiryWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2.5 py-4 text-[11px] tracking-[0.22em] uppercase border transition-all duration-200 hover:bg-[#2A0710] hover:text-[#C7A15B] hover:border-[#2A0710]"
                style={{
                  color: "#2A0710",
                  borderColor: "rgba(42,7,16,0.4)",
                  fontFamily: "var(--font-body)",
                }}
              >
                Enquire Now
              </a>
            </div>

            <p
              className="mt-4 text-[10px] text-center"
              style={{ color: "rgba(122,106,90,0.6)", fontFamily: "var(--font-body)" }}
            >
              No payment required · Enquiry only · Personal style consultation available
            </p>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <SectionHeader eyebrow="You May Also Love" title="Related Pieces" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  wishlisted={wishlist.some((w) => w.id === p.id)}
                  onWishlist={() => onWishlist(p)}
                  onView={() => { setActiveImg(0); setSelectedSize(null); setSelectedColor(null); onViewProduct(p); }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
