import { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowUpRight, Gem, Award, Sparkles, Shield, Star, Quote, Instagram } from "lucide-react";
import SectionHeader from "../components/SectionHeader";
import ProductCard from "../components/ProductCard";
import Newsletter from "../components/Newsletter";
import GoldDivider from "../components/GoldDivider";
import type { Page, Product, CategorySlug } from "../types";

// ─── Marquee Ticker ────────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "Bridal Lehengas", "·", "Silk Sarees", "·", "Banarasi Weaves", "·",
  "Heritage Craft", "·", "Net Sarees", "·", "Non-Bridal Lehengas", "·",
  "Handcrafted Luxury", "·", "Exclusive Collections", "·",
];

function MarqueeTicker() {
  return (
    <div
      className="overflow-hidden py-3.5 border-y"
      style={{ background: "#2A0710", borderColor: "rgba(199,161,91,0.2)" }}
    >
      <div className="flex whitespace-nowrap" style={{ animation: "marquee 30s linear infinite" }}>
        {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
          <span
            key={i}
            className="text-[10px] tracking-[0.28em] uppercase mx-5"
            style={{
              color: item === "·" ? "#C7A15B" : "rgba(232,210,166,0.6)",
              fontFamily: "var(--font-body)",
            }}
          >
            {item}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────
function Hero({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <section className="relative min-h-[480px] overflow-hidden" style={{ height: "80vh" }}>
      <img
        src="/hero.png"
        alt="MATWALJI bridal lehengas"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* Light overlay — just enough to keep the text legible */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,5,8,0.5) 0%, rgba(26,5,8,0.08) 45%, rgba(26,5,8,0.2) 100%)" }} />

      {/* Gold left accent */}
      <div className="absolute left-0 top-0 bottom-0 z-20 w-[3px]" style={{ background: "linear-gradient(to bottom, transparent 10%, #C7A15B 50%, transparent 90%)" }} />

      {/* Minimal text — centered between the three women in the image */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 sm:px-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px w-8" style={{ background: "#C7A15B" }} />
          <span className="text-[10px] tracking-[0.32em] uppercase" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>
            MATWALJI
          </span>
          <div className="h-px w-8" style={{ background: "#C7A15B" }} />
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.8rem, 5vw, 4rem)",
            color: "#F8F4EF",
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          <span className="block">Draped In</span>
          <span className="block" style={{ color: "#C7A15B", fontStyle: "italic" }}>Elegance</span>
        </h1>
        <button
          onClick={() => setPage("bridal-lehengas")}
          className="group flex items-center gap-2.5 mt-8 px-7 py-3.5 text-[10.5px] tracking-[0.24em] uppercase transition-all duration-300"
          style={{ background: "#C7A15B", color: "#2A0710", fontFamily: "var(--font-body)", fontWeight: 700 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#E8D2A6"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#C7A15B"; }}
        >
          Explore Products
          <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}

// ─── Shop by Category ──────────────────────────────────────────────────────────
interface CatCardProps {
  slug: CategorySlug;
  label: string;
  from: string;
  img: string;
  count: string;
  setPage: (p: Page) => void;
  tall?: boolean;
  wide?: boolean;
}

function CategoryCard({ slug, label, from, img, count, setPage, tall = false, wide = false }: CatCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={() => setPage(slug)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative overflow-hidden block text-left w-full h-full bg-[#2A0710]"
      style={{ minHeight: tall ? 480 : wide ? 280 : 240 }}
    >
      <img
        src={img}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover object-top"
        style={{ transform: hovered ? "scale(1.08)" : "scale(1)", transition: "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)" }}
      />

      {/* Base gradient always visible */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,5,8,0.92) 0%, rgba(26,5,8,0.25) 55%, transparent 100%)" }} />

      {/* Hover tint */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ background: "rgba(42,7,16,0.3)", opacity: hovered ? 1 : 0 }}
      />

      {/* Gold corner accent */}
      <div
        className="absolute top-0 left-0 transition-all duration-500"
        style={{
          width: hovered ? 40 : 0,
          height: 2,
          background: "#C7A15B",
        }}
      />
      <div
        className="absolute top-0 left-0 transition-all duration-500"
        style={{
          width: 2,
          height: hovered ? 40 : 0,
          background: "#C7A15B",
        }}
      />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-1.5" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>
              {from}
            </p>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                color: "#F8F4EF",
                fontSize: tall ? "clamp(1.5rem, 2.5vw, 2rem)" : "clamp(1.1rem, 2vw, 1.4rem)",
                fontWeight: 300,
                lineHeight: 1.15,
                letterSpacing: "0.01em",
              }}
            >
              {label}
            </h3>
            <p className="text-[10px] mt-1.5 transition-all duration-300" style={{ color: "rgba(232,210,166,0.5)", fontFamily: "var(--font-body)", opacity: hovered ? 1 : 0.7 }}>
              {count}
            </p>
          </div>

          {/* Arrow */}
          <div
            className="flex-shrink-0 w-9 h-9 border flex items-center justify-center transition-all duration-300"
            style={{
              borderColor: hovered ? "#C7A15B" : "rgba(199,161,91,0.3)",
              background: hovered ? "#C7A15B" : "transparent",
            }}
          >
            <ArrowUpRight size={15} style={{ color: hovered ? "#2A0710" : "#C7A15B" }} />
          </div>
        </div>
      </div>
    </button>
  );
}

const CATEGORY_CONFIG = [
  {
    slug: "bridal-lehengas" as CategorySlug,
    label: "Bridal Lehengas",
    from: "From ₹10,000",
    count: "6 exclusive pieces",
    img: "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=900&h=1200&fit=crop&auto=format",
  },
  {
    slug: "non-bridal-lehengas" as CategorySlug,
    label: "Non-Bridal Lehengas",
    from: "From ₹7,000",
    count: "6 pieces",
    img: "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=700&h=500&fit=crop&auto=format",
  },
  {
    slug: "sarees-silk" as CategorySlug,
    label: "Silk Sarees",
    from: "From ₹8,500",
    count: "5 pieces",
    img: "https://images.unsplash.com/photo-1619516388835-2b60acc4049e?w=700&h=500&fit=crop&auto=format",
  },
  {
    slug: "sarees-banarasi" as CategorySlug,
    label: "Banarasi Sarees",
    from: "From ₹12,000",
    count: "6 pieces",
    img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=700&h=500&fit=crop&auto=format",
  },
  {
    slug: "sarees-net" as CategorySlug,
    label: "Net Sarees",
    from: "From ₹9,000",
    count: "5 pieces",
    img: "https://images.unsplash.com/photo-1692850852630-495a2145c2a4?w=700&h=500&fit=crop&auto=format",
  },
];

function ShopByCategory({ setPage }: { setPage: (p: Page) => void }) {
  const [bridal, nonBridal, silk, banarasi, net] = CATEGORY_CONFIG;

  return (
    <section className="py-20 lg:py-28" style={{ background: "#F8F4EF" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-10 lg:mb-12 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-10" style={{ background: "#C7A15B" }} />
              <span className="text-[10px] tracking-[0.32em] uppercase" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>
                Our World
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
                color: "#2A0710",
                fontWeight: 300,
                lineHeight: 1.1,
              }}
            >
              Shop by Category
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed lg:text-right pb-1" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
            Every category a distinct tradition — from the grandeur of bridal couture to the poetry of hand-woven silk.
          </p>
        </div>

        {/* ── Editorial Grid (desktop) ── */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-3">

          {/* Row 1: Bridal (large) + Non-Bridal + Silk (stacked) */}
          <div className="lg:col-span-5 h-[480px] lg:h-[560px]">
            <CategoryCard {...bridal} tall setPage={setPage} />
          </div>

          <div className="lg:col-span-4 grid grid-rows-2 gap-3 h-[480px] lg:h-[560px]">
            <div className="h-full">
              <CategoryCard {...nonBridal} setPage={setPage} />
            </div>
            <div className="h-full">
              <CategoryCard {...silk} setPage={setPage} />
            </div>
          </div>

          {/* Row 1 right: designer sarees label panel */}
          <div
            className="hidden lg:flex lg:col-span-3 flex-col justify-between p-8 h-[560px]"
            style={{ background: "#2A0710", border: "1px solid rgba(199,161,91,0.15)" }}
          >
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-6" style={{ background: "#C7A15B" }} />
                <span className="text-[9px] tracking-[0.28em] uppercase" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>Designer Sarees</span>
              </div>
              <h3
                style={{ fontFamily: "var(--font-display)", color: "#F8F4EF", fontSize: "1.7rem", fontWeight: 300, lineHeight: 1.2 }}
              >
                Three Traditions,<br />
                <em className="not-italic" style={{ color: "#C7A15B" }}>One Legacy</em>
              </h3>
              <p className="mt-4 text-xs leading-relaxed" style={{ color: "rgba(232,210,166,0.5)", fontFamily: "var(--font-body)" }}>
                Silk · Banarasi · Net — each a chapter in India's unparalleled textile story.
              </p>
            </div>

            <div className="space-y-3">
              {[silk, banarasi, net].map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => setPage(cat.slug)}
                  className="group flex items-center justify-between w-full py-2.5 border-b transition-colors duration-200 hover:border-[#C7A15B]"
                  style={{ borderColor: "rgba(199,161,91,0.18)" }}
                >
                  <span className="text-[10.5px] tracking-[0.15em] uppercase group-hover:text-[#C7A15B] transition-colors" style={{ color: "#E8D2A6", fontFamily: "var(--font-body)" }}>
                    {cat.label}
                  </span>
                  <ArrowRight size={11} style={{ color: "#C7A15B" }} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              ))}

              <button
                onClick={() => setPage("sarees-banarasi")}
                className="group flex items-center gap-2 mt-4 text-[10px] tracking-[0.22em] uppercase transition-all duration-200 hover:gap-3"
                style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
              >
                View All Sarees
                <ArrowRight size={11} />
              </button>
            </div>
          </div>

          {/* Row 2: Banarasi + Net (full width) */}
          <div className="lg:col-span-6 h-[260px] lg:h-[280px]">
            <CategoryCard {...banarasi} wide setPage={setPage} />
          </div>
          <div className="lg:col-span-6 h-[260px] lg:h-[280px]">
            <CategoryCard {...net} wide setPage={setPage} />
          </div>
        </div>

        {/* ── Mobile / tablet: horizontally scrollable category cards ── */}
        <div className="lg:hidden -mx-6 px-6">
          <div
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory"
            style={{ scrollbarWidth: "none" }}
          >
            {CATEGORY_CONFIG.map((cat) => (
              <div key={cat.slug} className="flex-shrink-0 w-[220px] h-[300px] snap-start">
                <CategoryCard {...cat} setPage={setPage} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Craftsmanship Story ────────────────────────────────────────────────────────
function CraftsmanshipStory({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <section className="overflow-hidden" style={{ background: "#2A0710" }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Image */}
          <div className="relative h-[420px] lg:h-auto overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1622207691293-5cd80466dab3?w=900&h=1000&fit=crop&auto=format"
              alt="Heritage craftsmanship"
              className="w-full h-full object-cover object-top"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent 60%, rgba(42,7,16,0.7) 100%)" }} />
            {/* Floating stat */}
            <div className="absolute bottom-8 left-8 border p-5" style={{ background: "rgba(42,7,16,0.82)", borderColor: "rgba(199,161,91,0.3)", backdropFilter: "blur(4px)" }}>
              <div style={{ fontFamily: "var(--font-display)", color: "#C7A15B", fontSize: "2.5rem", fontWeight: 300, lineHeight: 1 }}>1998</div>
              <div className="text-[9px] tracking-[0.25em] uppercase mt-1" style={{ color: "rgba(232,210,166,0.55)", fontFamily: "var(--font-body)" }}>Est. in Surat, India</div>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col justify-center px-10 lg:px-16 py-16 lg:py-20">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8" style={{ background: "#C7A15B" }} />
              <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>Our Heritage</span>
            </div>

            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "#F8F4EF", fontWeight: 300, lineHeight: 1.15 }}>
              Two Decades of <em className="not-italic" style={{ color: "#C7A15B" }}>Woven Stories</em>
            </h2>

            <GoldDivider className="my-7 max-w-[260px]" />

            <p className="text-sm leading-[1.9] mb-6" style={{ color: "rgba(232,210,166,0.65)", fontFamily: "var(--font-body)" }}>
              Since 1998, we have traveled to the looms of Varanasi, the silk farms of Kanchipuram, and the ateliers of Chanderi to bring you India's finest textiles — curated by hand, presented with purpose.
            </p>
            <p className="text-sm leading-[1.9] mb-10" style={{ color: "rgba(232,210,166,0.65)", fontFamily: "var(--font-body)" }}>
              Every piece in our collection carries the fingerprints of master artisans whose families have practiced their craft for generations. This is not fashion — it is a living archive.
            </p>

            <button
              onClick={() => setPage("about")}
              className="group self-start flex items-center gap-2.5 text-[11px] tracking-[0.25em] uppercase border-b pb-1 transition-all duration-300 hover:gap-4"
              style={{ color: "#C7A15B", borderColor: "rgba(199,161,91,0.4)", fontFamily: "var(--font-body)" }}
            >
              Our Story <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { num: "25+", label: "Years of Heritage" },
    { num: "500+", label: "Exclusive Designs" },
    { num: "10,000+", label: "Happy Brides" },
    { num: "5", label: "Craft Traditions" },
  ];
  return (
    <div className="border-y" style={{ background: "#F8F4EF", borderColor: "rgba(199,161,91,0.2)" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0" style={{ "--tw-divide-opacity": 1, borderColor: "rgba(199,161,91,0.2)" } as React.CSSProperties}>
          {stats.map(({ num, label }, i) => (
            <div key={i} className="py-8 px-6 text-center" style={{ borderColor: "rgba(199,161,91,0.18)" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 3.5vw, 3rem)", color: "#2A0710", fontWeight: 300, lineHeight: 1 }}>
                {num}
              </div>
              <div className="text-[10px] tracking-[0.22em] uppercase mt-2" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Shared product grid section ───────────────────────────────────────────────
function ProductGridSection({
  eyebrow, title, subtitle, items, wishlist, onWishlist, onViewProduct, bg = "#F8F4EF",
}: {
  eyebrow: string; title: string; subtitle: string; items: Product[];
  wishlist: Product[]; onWishlist: (p: Product) => void; onViewProduct: (p: Product) => void; bg?: string;
}) {
  return (
    <section className="py-20 lg:py-28 px-6 lg:px-12" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto">
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} light={bg !== "#F8F4EF"} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p}
              wishlisted={wishlist.some((w) => w.id === p.id)}
              onWishlist={() => onWishlist(p)}
              onView={() => onViewProduct(p)} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Products ──────────────────────────────────────────────────────────
function FeaturedProducts({ wishlist, onWishlist, onViewProduct, products = [] }: {
  wishlist: Product[]; onWishlist: (p: Product) => void; onViewProduct: (p: Product) => void; products?: Product[];
}) {
  const featured = products.filter((p) => p.tag).slice(0, 8);
  return (
    <ProductGridSection
      eyebrow="Handpicked"
      title="Featured Pieces"
      subtitle="Our most beloved creations — each one a dialogue between tradition and artistry."
      items={featured}
      wishlist={wishlist}
      onWishlist={onWishlist}
      onViewProduct={onViewProduct}
    />
  );
}

// ─── Horizontal scroll row (shared) ────────────────────────────────────────────
function HScrollRow({
  eyebrow, title, subtitle, items, wishlist, onWishlist, onViewProduct, dark = false,
}: {
  eyebrow: string; title: string; subtitle: string; items: Product[];
  wishlist: Product[]; onWishlist: (p: Product) => void; onViewProduct: (p: Product) => void; dark?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "right" ? 280 : -280, behavior: "smooth" });
  }

  return (
    <section className="py-20 lg:py-28" style={{ background: dark ? "#2A0710" : "#F8F4EF" }}>
      {/* Header row with arrows */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-end justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-px w-10" style={{ background: "#C7A15B" }} />
            <span className="text-[9.5px] tracking-[0.3em] uppercase" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>
              {eyebrow}
            </span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3.5vw, 3rem)", color: dark ? "#F8F4EF" : "#2A0710", fontWeight: 300, lineHeight: 1.1 }}>
            {title}
          </h2>
          <p className="mt-2 text-sm max-w-sm" style={{ color: dark ? "rgba(232,210,166,0.55)" : "#7a6a5a", fontFamily: "var(--font-body)" }}>
            {subtitle}
          </p>
        </div>
        {/* Arrow controls */}
        <div className="flex gap-2 flex-shrink-0 pb-1">
          {(["left", "right"] as const).map((dir) => (
            <button
              key={dir}
              onClick={() => scroll(dir)}
              className="w-9 h-9 border flex items-center justify-center transition-all duration-200 hover:bg-[#C7A15B] hover:border-[#C7A15B] group"
              style={{ borderColor: dark ? "rgba(199,161,91,0.35)" : "rgba(42,7,16,0.2)" }}
            >
              <ArrowRight
                size={14}
                className={dir === "left" ? "rotate-180" : ""}
                style={{ color: dark ? "#C7A15B" : "#2A0710", transition: "color 0.2s" }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Scroll track — full bleed, padded start/end */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{
          scrollbarWidth: "none",
          paddingLeft: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))",
          paddingRight: "max(1.5rem, calc((100vw - 80rem) / 2 + 1.5rem))",
        }}
      >
        {items.map((p) => (
          <div key={p.id} className="flex-shrink-0" style={{ width: "min(240px, 72vw)" }}>
            <ProductCard
              product={p}
              wishlisted={wishlist.some((w) => w.id === p.id)}
              onWishlist={() => onWishlist(p)}
              onView={() => onViewProduct(p)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── New Arrivals ───────────────────────────────────────────────────────────────
function NewArrivals({ wishlist, onWishlist, onViewProduct, products = [] }: {
  wishlist: Product[]; onWishlist: (p: Product) => void; onViewProduct: (p: Product) => void; products?: Product[];
}) {
  const arrivals = products.filter((p) => p.tag === "New Arrival");
  if (arrivals.length === 0) return null;
  return (
    <HScrollRow
      eyebrow="Just In"
      title="New Arrivals"
      subtitle="Fresh from the atelier — the latest additions to our curated collection."
      items={arrivals}
      wishlist={wishlist}
      onWishlist={onWishlist}
      onViewProduct={onViewProduct}
      dark
    />
  );
}

// ─── Bestsellers ────────────────────────────────────────────────────────────────
function Bestsellers({ wishlist, onWishlist, onViewProduct, products = [] }: {
  wishlist: Product[]; onWishlist: (p: Product) => void; onViewProduct: (p: Product) => void; products?: Product[];
}) {
  const bestsellers = products.filter((p) => p.tag === "Bestseller");
  if (bestsellers.length === 0) return null;
  return (
    <HScrollRow
      eyebrow="Most Loved"
      title="Bestsellers"
      subtitle="The pieces our brides keep coming back for — timeless, exquisite, unforgettable."
      items={bestsellers}
      wishlist={wishlist}
      onWishlist={onWishlist}
      onViewProduct={onViewProduct}
    />
  );
}

// ─── Why MATWALJI ──────────────────────────────────────────────────────────────
const WHY_ITEMS = [
  { icon: Gem, title: "Premium Fabrics", desc: "Sourced from master weavers in Varanasi, Kanchipuram, and Chanderi." },
  { icon: Sparkles, title: "Handcrafted", desc: "Each piece is hand-embroidered by artisans with decades of heritage expertise." },
  { icon: Award, title: "Timeless Design", desc: "Rooted in tradition, refined for the modern Indian woman of discerning taste." },
  { icon: Shield, title: "Exclusive Drops", desc: "Limited edition pieces ensure every MATWALJI creation remains truly rare." },
];

function WhySection() {
  return (
    <section className="py-20 lg:py-28 lg:px-12 overflow-hidden" style={{ background: "#2A0710" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-0">
        <SectionHeader eyebrow="Our Promise" title="The MATWALJI Difference" light />
        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 sm:gap-px sm:bg-[rgba(199,161,91,0.12)] sm:overflow-visible lg:grid-cols-4"
          style={{ scrollbarWidth: "none" }}
        >
          {WHY_ITEMS.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="p-8 lg:p-10 text-center group transition-colors duration-300 hover:bg-[#4A1022] flex-shrink-0 w-[240px] snap-start border sm:w-auto sm:border-0"
              style={{ background: "#2A0710", borderColor: "rgba(199,161,91,0.15)" }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-5 border transition-all duration-300 group-hover:bg-[#C7A15B] group-hover:border-[#C7A15B]"
                style={{ borderColor: "rgba(199,161,91,0.35)" }}>
                <Icon size={19} style={{ color: "#C7A15B" }} />
              </div>
              <h3 className="mb-3" style={{ fontFamily: "var(--font-display)", color: "#E8D2A6", fontSize: "1.25rem", fontWeight: 400 }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(232,210,166,0.52)", fontFamily: "var(--font-body)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Bridal Banner ──────────────────────────────────────────────────────────────
function BridalBanner({ setPage }: { setPage: (p: Page) => void }) {
  return (
    <section className="relative overflow-hidden" style={{ minHeight: 500 }}>
      <img src="https://images.unsplash.com/photo-1570212773364-e30cd076539e?w=1800&h=800&fit=crop&auto=format"
        alt="Bridal collection" className="absolute inset-0 w-full h-full object-cover object-top" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(42,7,16,0.94) 0%, rgba(42,7,16,0.52) 55%, rgba(42,7,16,0.1) 100%)" }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 flex items-center" style={{ minHeight: 500 }}>
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-10" style={{ background: "#C7A15B" }} />
            <span className="text-[10px] tracking-[0.32em] uppercase" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>Exclusively Yours</span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 5vw, 4.2rem)", color: "#F8F4EF", fontWeight: 300, lineHeight: 1.05 }}>
            Begin Your<br /><em className="not-italic" style={{ color: "#C7A15B" }}>Bridal</em> Journey<br />With Us
          </h2>
          <p className="mt-5 mb-10 text-sm leading-relaxed max-w-sm" style={{ color: "rgba(232,210,166,0.68)", fontFamily: "var(--font-body)" }}>
            From ₹10,000 onwards — discover bridal lehengas that honour your individuality and our shared heritage. Every piece tells your story.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button onClick={() => setPage("bridal-lehengas")}
              className="group flex items-center gap-2.5 px-8 py-4 text-[11px] tracking-[0.25em] uppercase transition-all duration-300"
              style={{ background: "#C7A15B", color: "#2A0710", fontFamily: "var(--font-body)", fontWeight: 600 }}>
              Explore Bridal <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button onClick={() => setPage("contact")}
              className="px-8 py-4 text-[11px] tracking-[0.25em] uppercase border transition-all hover:bg-white/5"
              style={{ color: "#E8D2A6", borderColor: "rgba(232,210,166,0.3)", fontFamily: "var(--font-body)" }}>
              Book Appointment
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Lookbook Gallery ───────────────────────────────────────────────────────────
const GALLERY_IMGS = [
  { src: "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=500&h=650&fit=crop&auto=format", span: "row-span-2" },
  { src: "https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?w=500&h=380&fit=crop&auto=format", span: "" },
  { src: "https://images.unsplash.com/photo-1619516388835-2b60acc4049e?w=500&h=380&fit=crop&auto=format", span: "" },
  { src: "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=500&h=650&fit=crop&auto=format", span: "row-span-2" },
  { src: "https://images.unsplash.com/photo-1692850852630-495a2145c2a4?w=500&h=380&fit=crop&auto=format", span: "" },
  { src: "https://images.unsplash.com/photo-1622207691293-5cd80466dab3?w=500&h=380&fit=crop&auto=format", span: "" },
];

function LookbookGallery() {
  return (
    <section className="py-20 lg:py-28 px-6 lg:px-12" style={{ background: "#F8F4EF" }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-10" style={{ background: "#C7A15B" }} />
              <span className="text-[10px] tracking-[0.32em] uppercase" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>Real Moments</span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.4rem)", color: "#2A0710", fontWeight: 300, lineHeight: 1.1 }}>
              Captured in MATWALJI
            </h2>
          </div>
          <div className="flex items-center gap-2 pb-1">
            <Instagram size={15} style={{ color: "#C7A15B" }} />
            <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>@matwalji.sarees</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-2.5" style={{ gridAutoRows: "200px" }}>
          {GALLERY_IMGS.map((img, i) => (
            <div key={i} className={`group relative overflow-hidden bg-[#e0d5cc] ${img.span} cursor-pointer`}>
              <img src={img.src} alt={`Gallery ${i + 1}`}
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-400 flex items-center justify-center"
                style={{ background: "rgba(42,7,16,0.45)" }}>
                <div className="border p-2.5" style={{ borderColor: "rgba(199,161,91,0.7)" }}>
                  <Instagram size={18} style={{ color: "#C7A15B" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ───────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    city: "Mumbai",
    rating: 5,
    text: "My bridal lehenga from MATWALJI was beyond anything I had imagined. The craftsmanship, the fabric, the attention to detail — I felt like royalty on my wedding day.",
    occasion: "Bridal Lehenga",
    avatar: "https://images.unsplash.com/photo-1716504628084-97224213ca6d?w=80&h=80&fit=crop&auto=format",
  },
  {
    name: "Ananya Reddy",
    city: "Hyderabad",
    rating: 5,
    text: "The Kanjivaram saree I ordered arrived like a work of art. MATWALJI is the only brand that truly understands luxury Indian fashion. I am a customer for life.",
    occasion: "Silk Saree",
    avatar: "https://images.unsplash.com/photo-1716504628204-47f2df8d2634?w=80&h=80&fit=crop&auto=format",
  },
  {
    name: "Kavita Nair",
    city: "Bangalore",
    rating: 5,
    text: "The enquiry process was seamless and the personal attention was exceptional. The saree arrived beautifully packaged — truly a premium experience from start to finish.",
    occasion: "Banarasi Saree",
    avatar: "https://images.unsplash.com/photo-1622207691293-5cd80466dab3?w=80&h=80&fit=crop&auto=format",
  },
];

function TestimonialCard({ item }: { item: typeof TESTIMONIALS[0] }) {
  return (
    <div
      className="flex-shrink-0 flex flex-col p-7 border"
      style={{
        width: 340,
        background: "rgba(255,255,255,0.04)",
        borderColor: "rgba(199,161,91,0.18)",
      }}
    >
      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {[...Array(item.rating)].map((_, j) => (
          <Star key={j} size={11} fill="#C7A15B" style={{ color: "#C7A15B" }} />
        ))}
      </div>

      <Quote size={18} className="mb-3" style={{ color: "#C7A15B", opacity: 0.4 }} />

      <p
        className="flex-1 leading-relaxed mb-6"
        style={{ color: "rgba(232,210,166,0.75)", fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "0.92rem" }}
      >
        "{item.text}"
      </p>

      <div className="flex items-center gap-3">
        <img
          src={item.avatar}
          alt={item.name}
          className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0"
          style={{ border: "1.5px solid rgba(199,161,91,0.35)" }}
        />
        <div>
          <p style={{ fontFamily: "var(--font-display)", color: "#C7A15B", fontSize: "0.88rem" }}>{item.name}</p>
          <p className="text-[9px] tracking-[0.16em] uppercase mt-0.5" style={{ color: "rgba(232,210,166,0.35)", fontFamily: "var(--font-body)" }}>
            {item.city} · {item.occasion}
          </p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  // Duplicate cards for seamless loop
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS, ...TESTIMONIALS];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let animId: number;
    let pos = 0;
    const cardW = 340 + 16; // card width + gap
    const totalW = cardW * TESTIMONIALS.length;

    function step() {
      if (!paused) {
        pos += 0.6;
        if (pos >= totalW) pos -= totalW;
        if (track) track.style.transform = `translateX(-${pos}px)`;
      }
      animId = requestAnimationFrame(step);
    }
    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [paused]);

  return (
    <section className="py-20 lg:py-28 overflow-hidden" style={{ background: "#2A0710" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 mb-12">
        <SectionHeader eyebrow="Client Love" title="Words That Warm Us" light />
      </div>

      {/* Scrolling track */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          ref={trackRef}
          className="flex gap-4 will-change-transform"
          style={{ width: "max-content" }}
        >
          {doubled.map((item, i) => (
            <TestimonialCard key={i} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Process Strip ─────────────────────────────────────────────────────────────
function ProcessStrip() {
  const steps = [
    { num: "01", title: "Browse & Discover", desc: "Explore our curated collections across 5 categories." },
    { num: "02", title: "Save to Wishlist", desc: "Add your favourite pieces to your personal wishlist." },
    { num: "03", title: "Send Enquiry", desc: "Share your details — no payment, just a conversation." },
    { num: "04", title: "Personal Consultation", desc: "Our stylist reaches out within 24 hours to assist you." },
  ];

  return (
    <section className="py-16 sm:px-6 lg:px-12 border-y overflow-hidden" style={{ background: "#F8F4EF", borderColor: "rgba(199,161,91,0.15)" }}>
      <div className="max-w-7xl mx-auto">
        <div
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-6 sm:px-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible lg:grid-cols-4 lg:gap-8"
          style={{ scrollbarWidth: "none" }}
        >
          {steps.map(({ num, title, desc }, i) => (
            <div
              key={i}
              className="relative pl-5 border-l flex-shrink-0 w-[230px] snap-start sm:w-auto"
              style={{ borderColor: "rgba(199,161,91,0.3)" }}
            >
              <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "rgba(199,161,91,0.18)", fontWeight: 300, lineHeight: 1, marginBottom: 6 }}>{num}</div>
              <h4 style={{ fontFamily: "var(--font-display)", color: "#2A0710", fontSize: "1.05rem", fontWeight: 400 }} className="mb-1.5">{title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HomePage (assembled) ───────────────────────────────────────────────────────
interface HomePageProps {
  products: Product[];
  setPage: (p: Page) => void;
  wishlist: Product[];
  onWishlist: (p: Product) => void;
  onViewProduct: (p: Product) => void;
}

export default function HomePage({ setPage, wishlist, onWishlist, onViewProduct, products = [] }: HomePageProps) {
  return (
    <div className="pt-[70px]">
      <Hero setPage={setPage} />
      <MarqueeTicker />
      <ShopByCategory setPage={setPage} />
      <StatsBar />
      <CraftsmanshipStory setPage={setPage} />
      <FeaturedProducts wishlist={wishlist} onWishlist={onWishlist} onViewProduct={onViewProduct} products={products} />
      <NewArrivals wishlist={wishlist} onWishlist={onWishlist} onViewProduct={onViewProduct} products={products} />
      <Bestsellers wishlist={wishlist} onWishlist={onWishlist} onViewProduct={onViewProduct} products={products} />
      <WhySection />
      <BridalBanner setPage={setPage} />
      <LookbookGallery />
      <TestimonialsSection />
      <ProcessStrip />
      <Newsletter />
    </div>
  );
}
