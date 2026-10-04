import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, SlidersHorizontal, X, Check } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { CATEGORY_META } from "../data/categories";
import type { CategorySlug, Page, Product } from "../types";

interface Props {
  slug: CategorySlug;
  wishlist: Product[];
  onWishlist: (p: Product) => void;
  onViewProduct: (p: Product) => void;
  setPage: (p: Page) => void;
  products: Product[];
  colorMap?: Record<string, string>;
}

// ─── Price brackets ────────────────────────────────────────────────────────────
type PriceBracket = "all" | "under25" | "25to75" | "above75";
const PRICE_BRACKETS: { id: PriceBracket; label: string; range: string }[] = [
  { id: "all",      label: "All Prices",        range: "" },
  { id: "under25",  label: "Under ₹25,000",     range: "Budget-friendly" },
  { id: "25to75",   label: "₹25,000 – ₹75,000", range: "Mid-range" },
  { id: "above75",  label: "Above ₹75,000",     range: "Premium" },
];
function inBracket(price: number, b: PriceBracket) {
  if (b === "all")     return true;
  if (b === "under25") return price < 25000;
  if (b === "25to75")  return price >= 25000 && price <= 75000;
  return price > 75000;
}

// ─── Sort ──────────────────────────────────────────────────────────────────────
type SortKey = "featured" | "new" | "low" | "high";

// ─── Color map ─────────────────────────────────────────────────────────────────
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
  mint: "#80CBC4", coral: "#E64A19", fuchsia: "#C71585", crimson: "#9B1B30",
  "blush rose": "#F4A7B9", lilac: "#C8A2C8", "powder blue": "#B0D0E8",
  "natural beige": "#D4BB94", caramel: "#C68642",
  saffron: "#F4A20A", "ruby red": "#9B1B30", "peacock blue": "#005F6A",
  "deep green": "#1B3A2A", "bottle green": "#1B3A2A", plum: "#6B2560",
  terracotta: "#9E4620", "sky blue": "#87CEEB", "butter yellow": "#FFF68F",
  "deep crimson": "#9B1B30", "bridal red": "#C62828", "pearl white": "#F5F5F0",
  "off-white": "#FAF8F2", "antique gold": "#C7A15B", wine: "#722F37",
  "dark green": "#1B3A2A", "turmeric yellow": "#F4A20A", "sunrise orange": "#E87020",
  "deep plum": "#6B2560",
};

function getHex(colorName: string, overrides: Record<string, string> = {}): string {
  const key = colorName.toLowerCase().trim();
  // Admin-managed colors (from /api/filters) take priority over the built-in fallback map.
  if (overrides[key]) return overrides[key];
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  for (const [k, v] of Object.entries(COLOR_HEX)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return "#C7A15B";
}

// ─── Sidebar section wrapper ───────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b" style={{ borderColor: "rgba(199,161,91,0.15)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span
          className="text-[10px] tracking-[0.28em] uppercase"
          style={{ color: "#2A0710", fontFamily: "var(--font-body)", fontWeight: 600 }}
        >
          {title}
        </span>
        <ChevronDown
          size={13}
          style={{ color: "#C7A15B", transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? 500 : 0 }}
      >
        <div className="pb-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function CategoryPage({ slug, wishlist, onWishlist, onViewProduct, setPage, products: allProducts, colorMap = {} }: Props) {
  const meta = CATEGORY_META[slug];
  const products = allProducts.filter((p) => p.category === slug);

  const [sortBy, setSortBy]             = useState<SortKey>("featured");
  const [priceBracket, setPriceBracket] = useState<PriceBracket>("all");
  const [arrivalFilter, setArrivalFilter] = useState<"all" | "new">("all");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes]   = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const parentLabel = slug.includes("lehenga") ? "Lehengas" : "Designer Sarees";

  // Unique colors & sizes for this category
  const allColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.colors?.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [products]);

  const allSizes = useMemo(() => {
    const order = ["XS", "S", "M", "L", "XL", "XXL", "Free Size",
      "Blouse 32", "Blouse 34", "Blouse 36", "Blouse 38", "Blouse 40", "Blouse 42"];
    const set = new Set<string>();
    products.forEach((p) => p.sizes?.forEach((s) => set.add(s)));
    return order.filter((s) => set.has(s));
  }, [products]);

  function toggleSize(s: string) {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function toggleColor(c: string) {
    setSelectedColors((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  }

  // Derived list
  const processed = useMemo(() => {
    let list = [...products];
    if (arrivalFilter === "new") list = list.filter((p) => p.tag === "New Arrival");
    list = list.filter((p) => inBracket(p.priceRaw, priceBracket));
    if (selectedColors.length > 0) {
      list = list.filter((p) =>
        p.colors?.some((c) => selectedColors.includes(c))
      );
    }
    if (selectedSizes.length > 0) {
      list = list.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      );
    }
    if (sortBy === "low")  list.sort((a, b) => a.priceRaw - b.priceRaw);
    if (sortBy === "high") list.sort((a, b) => b.priceRaw - a.priceRaw);
    if (sortBy === "new")  list.sort((a) => (a.tag === "New Arrival" ? -1 : 1));
    return list;
  }, [products, sortBy, priceBracket, arrivalFilter, selectedColors, selectedSizes]);

  const activeCount = (priceBracket !== "all" ? 1 : 0) + (arrivalFilter === "new" ? 1 : 0) + selectedColors.length + selectedSizes.length;

  function clearAll() {
    setPriceBracket("all");
    setArrivalFilter("all");
    setSelectedColors([]);
    setSelectedSizes([]);
  }

  // ── Filter panel (shared between sidebar + mobile drawer) ──
  const FilterPanel = (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b mb-1" style={{ borderColor: "rgba(199,161,91,0.15)" }}>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={13} style={{ color: "#C7A15B" }} />
          <span className="text-[10px] tracking-[0.28em] uppercase" style={{ color: "#2A0710", fontFamily: "var(--font-body)", fontWeight: 700 }}>
            Filters
          </span>
          {activeCount > 0 && (
            <span
              className="w-4 h-4 flex items-center justify-center rounded-full text-[9px]"
              style={{ background: "#C7A15B", color: "#2A0710", fontWeight: 700, fontFamily: "var(--font-body)" }}
            >
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-[9px] tracking-[0.18em] uppercase border-b transition-colors hover:text-[#C7A15B] hover:border-[#C7A15B]"
            style={{ color: "#7a6a5a", borderColor: "rgba(122,106,90,0.3)", fontFamily: "var(--font-body)" }}
          >
            Clear All
          </button>
        )}
      </div>

      {/* Arrivals */}
      <FilterSection title="Arrivals">
        <div className="flex flex-col gap-2">
          {([
            { id: "all" as const,  label: "All Pieces",   count: products.length },
            { id: "new" as const,  label: "New Arrivals", count: products.filter((p) => p.tag === "New Arrival").length },
          ]).map(({ id, label, count }) => (
            <button
              key={id}
              onClick={() => setArrivalFilter(id)}
              className="flex items-center justify-between px-3 py-2.5 border text-left transition-all duration-200"
              style={{
                background: arrivalFilter === id ? "#2A0710" : "transparent",
                borderColor: arrivalFilter === id ? "#2A0710" : "rgba(199,161,91,0.22)",
              }}
            >
              <span
                className="text-[10px] tracking-[0.1em]"
                style={{ fontFamily: "var(--font-body)", color: arrivalFilter === id ? "#C7A15B" : "#252525" }}
              >
                {label}
              </span>
              <span
                className="text-[9px] px-1.5 py-0.5"
                style={{
                  fontFamily: "var(--font-body)",
                  color: arrivalFilter === id ? "rgba(199,161,91,0.6)" : "#b0a090",
                  background: arrivalFilter === id ? "rgba(255,255,255,0.06)" : "rgba(199,161,91,0.08)",
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price range */}
      <FilterSection title="Price Range">
        <div className="flex flex-col gap-1.5">
          {PRICE_BRACKETS.map(({ id, label, range }) => (
            <button
              key={id}
              onClick={() => setPriceBracket(id)}
              className="flex items-center gap-3 px-1 py-2 group text-left transition-colors duration-150"
            >
              {/* Custom radio */}
              <div
                className="w-4 h-4 flex-shrink-0 border flex items-center justify-center transition-all duration-200"
                style={{
                  borderColor: priceBracket === id ? "#C7A15B" : "rgba(199,161,91,0.35)",
                  background: priceBracket === id ? "#C7A15B" : "transparent",
                }}
              >
                {priceBracket === id && <Check size={9} style={{ color: "#2A0710" }} strokeWidth={3} />}
              </div>
              <div>
                <span
                  className="block text-[10.5px] leading-tight"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: priceBracket === id ? "#2A0710" : "#3a2a1a",
                    fontWeight: priceBracket === id ? 600 : 400,
                  }}
                >
                  {label}
                </span>
                {range && (
                  <span className="block text-[9px] mt-0.5" style={{ color: "#b0a090", fontFamily: "var(--font-body)" }}>
                    {range}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => {
            const active = selectedSizes.includes(size);
            const isBlouse = size.startsWith("Blouse");
            return (
              <button
                key={size}
                onClick={() => toggleSize(size)}
                className="px-3 py-1.5 border text-[10px] tracking-[0.1em] transition-all duration-200"
                style={{
                  fontFamily: "var(--font-body)",
                  background: active ? "#2A0710" : "white",
                  color: active ? "#C7A15B" : "#3a2a1a",
                  borderColor: active ? "#2A0710" : "rgba(199,161,91,0.28)",
                  fontWeight: active ? 600 : 400,
                  minWidth: isBlouse ? "auto" : 44,
                }}
              >
                {size}
              </button>
            );
          })}
        </div>
        {selectedSizes.length > 0 && (
          <button
            onClick={() => setSelectedSizes([])}
            className="mt-3 text-[9px] tracking-[0.15em] uppercase flex items-center gap-1 hover:text-[#C7A15B] transition-colors"
            style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
          >
            <X size={9} /> Clear sizes
          </button>
        )}
      </FilterSection>

      {/* Colours */}
      <FilterSection title="Colour">
        <div className="flex flex-wrap gap-2">
          {allColors.map((color) => {
            const hex = getHex(color, colorMap);
            const active = selectedColors.includes(color);
            const isLight = ["ivory", "champagne", "pearl white", "off-white", "cream", "butter yellow", "sky blue", "mint", "powder blue", "blush", "blush pink", "blush rose", "peach"].some((l) => color.toLowerCase().includes(l));
            return (
              <button
                key={color}
                title={color}
                onClick={() => toggleColor(color)}
                className="group relative flex flex-col items-center gap-1.5 transition-transform duration-150 active:scale-95"
              >
                <div
                  className="flex items-center justify-center transition-all duration-200"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: hex,
                    border: active
                      ? "2.5px solid #C7A15B"
                      : isLight
                      ? "1.5px solid rgba(0,0,0,0.15)"
                      : "1.5px solid rgba(0,0,0,0.08)",
                    boxShadow: active ? "0 0 0 2px rgba(199,161,91,0.35)" : "none",
                  }}
                >
                  {active && (
                    <Check
                      size={11}
                      strokeWidth={3}
                      style={{ color: isLight ? "#2A0710" : "#fff" }}
                    />
                  )}
                </div>
                <span
                  className="text-[8.5px] text-center leading-tight w-[56px] break-words"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: active ? "#2A0710" : "#7a6a5a",
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  {color}
                </span>
              </button>
            );
          })}
        </div>
        {selectedColors.length > 0 && (
          <button
            onClick={() => setSelectedColors([])}
            className="mt-3 text-[9px] tracking-[0.15em] uppercase flex items-center gap-1 hover:text-[#C7A15B] transition-colors"
            style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
          >
            <X size={9} /> Clear colours
          </button>
        )}
      </FilterSection>
    </div>
  );

  return (
    <div className="pt-[70px]" style={{ background: "#F8F4EF", minHeight: "100vh" }}>

      {/* ── Hero banner ────────────────────────────────────────────────────────── */}
      <div className="relative h-64 overflow-hidden flex items-end">
        <img src={meta.heroBanner} alt={meta.heading} className="absolute inset-0 w-full h-full object-cover object-top" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(42,7,16,0.88) 0%, rgba(42,7,16,0.3) 60%, transparent 100%)" }} />
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "linear-gradient(to bottom, transparent, #C7A15B, transparent)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full pb-8">
          <div className="flex items-center gap-2 mb-2.5">
            <button onClick={() => setPage("home")} className="text-[10px] tracking-wide hover:text-[#C7A15B] transition-colors" style={{ color: "rgba(199,161,91,0.5)", fontFamily: "var(--font-body)" }}>Home</button>
            <ChevronRight size={10} style={{ color: "rgba(199,161,91,0.35)" }} />
            <span className="text-[10px] tracking-wide" style={{ color: "rgba(199,161,91,0.5)", fontFamily: "var(--font-body)" }}>{parentLabel}</span>
            <ChevronRight size={10} style={{ color: "rgba(199,161,91,0.35)" }} />
            <span className="text-[10px] tracking-wide" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>{meta.label}</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", color: "#F8F4EF", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, lineHeight: 1.1 }}>
            {meta.heading}
          </h1>
          <p className="text-xs mt-1.5" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>{meta.startingFrom}</p>
        </div>
      </div>

      {/* ── Top bar: sort + results (desktop) + mobile filter toggle ─────────── */}
      <div className="border-b" style={{ background: "rgba(248,244,239,0.98)", borderColor: "rgba(199,161,91,0.15)" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 min-h-[3rem]">

            {/* Mobile: filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase flex-shrink-0"
              style={{ color: "#2A0710", fontFamily: "var(--font-body)" }}
            >
              <SlidersHorizontal size={13} style={{ color: "#C7A15B" }} />
              Filters {activeCount > 0 && `(${activeCount})`}
            </button>

            {/* Results count */}
            <span className="text-[10px] tracking-[0.15em] uppercase flex-shrink-0" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
              {processed.length} of {products.length} pieces
            </span>

            {/* Sort pills — scrollable on very small screens */}
            <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              <span className="hidden sm:block text-[9.5px] tracking-[0.18em] uppercase mr-1 flex-shrink-0" style={{ color: "#b0a090", fontFamily: "var(--font-body)" }}>Sort:</span>
              {([
                { id: "featured" as SortKey, label: "Featured" },
                { id: "new"      as SortKey, label: "New First" },
                { id: "low"      as SortKey, label: "Price ↑" },
                { id: "high"     as SortKey, label: "Price ↓" },
              ]).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setSortBy(id)}
                  className="flex-shrink-0 px-3 py-1.5 text-[9px] tracking-[0.16em] uppercase border transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-body)",
                    background: sortBy === id ? "#2A0710" : "transparent",
                    color: sortBy === id ? "#C7A15B" : "#7a6a5a",
                    borderColor: sortBy === id ? "#2A0710" : "rgba(199,161,91,0.2)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Page body: sidebar + grid ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">
        <div className="flex gap-8">

          {/* ── LEFT SIDEBAR (desktop) ── */}
          <aside className="hidden lg:block flex-shrink-0 w-[230px]">
            <div className="sticky top-[122px]">
              {FilterPanel}
            </div>
          </aside>

          {/* ── RIGHT: active chips + grid ── */}
          <div className="flex-1 min-w-0">

            {/* Active filter chips */}
            {activeCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {priceBracket !== "all" && (
                  <ActiveChip label={PRICE_BRACKETS.find((b) => b.id === priceBracket)!.label} onRemove={() => setPriceBracket("all")} />
                )}
                {arrivalFilter === "new" && (
                  <ActiveChip label="New Arrivals" onRemove={() => setArrivalFilter("all")} />
                )}
                {selectedColors.map((c) => (
                  <ActiveChip key={c} label={c} color={getHex(c, colorMap)} onRemove={() => toggleColor(c)} />
                ))}
                {selectedSizes.map((s) => (
                  <ActiveChip key={s} label={s} onRemove={() => toggleSize(s)} />
                ))}
                <button
                  onClick={clearAll}
                  className="text-[9.5px] tracking-[0.18em] uppercase border-b pb-px transition-colors hover:text-[#C7A15B] hover:border-[#C7A15B]"
                  style={{ color: "#7a6a5a", borderColor: "rgba(122,106,90,0.3)", fontFamily: "var(--font-body)" }}
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products */}
            {processed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-12 h-12 border flex items-center justify-center mb-5" style={{ borderColor: "rgba(199,161,91,0.3)" }}>
                  <SlidersHorizontal size={20} style={{ color: "rgba(199,161,91,0.4)" }} />
                </div>
                <p style={{ fontFamily: "var(--font-display)", color: "#2A0710", fontSize: "1.4rem", fontWeight: 300 }}>No pieces match your filters</p>
                <p className="mt-2 text-sm mb-6" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>Try adjusting your price, colour, or arrival selection.</p>
                <button onClick={clearAll} className="px-7 py-3 text-[10px] tracking-[0.22em] uppercase" style={{ background: "#2A0710", color: "#C7A15B", fontFamily: "var(--font-body)" }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {processed.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    wishlisted={wishlist.some((w) => w.id === p.id)}
                    onWishlist={() => onWishlist(p)}
                    onView={() => onViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile filter drawer ──────────────────────────────────────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(42,7,16,0.55)" }}
            onClick={() => setMobileFiltersOpen(false)}
          />
          {/* Drawer */}
          <div
            className="absolute left-0 top-0 bottom-0 overflow-y-auto px-5 py-6"
            style={{ width: "min(300px, 88vw)", background: "#F8F4EF" }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] tracking-[0.28em] uppercase font-bold" style={{ color: "#2A0710", fontFamily: "var(--font-body)" }}>Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="w-8 h-8 flex items-center justify-center border" style={{ borderColor: "rgba(199,161,91,0.3)" }}>
                <X size={14} style={{ color: "#2A0710" }} />
              </button>
            </div>
            {FilterPanel}
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full mt-6 py-3.5 text-[10px] tracking-[0.22em] uppercase"
              style={{ background: "#2A0710", color: "#C7A15B", fontFamily: "var(--font-body)" }}
            >
              View {processed.length} Result{processed.length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Active chip ───────────────────────────────────────────────────────────────
function ActiveChip({ label, color, onRemove }: { label: string; color?: string; onRemove: () => void }) {
  return (
    <div
      className="flex items-center gap-1.5 pl-2.5 pr-2 py-1.5 text-[9.5px] tracking-[0.12em] uppercase"
      style={{
        border: "1px solid rgba(199,161,91,0.35)",
        background: "rgba(42,7,16,0.05)",
        fontFamily: "var(--font-body)",
        color: "#2A0710",
      }}
    >
      {color && (
        <div className="w-3 h-3 rounded-full flex-shrink-0 border" style={{ background: color, borderColor: "rgba(0,0,0,0.1)" }} />
      )}
      {label}
      <button onClick={onRemove} className="ml-0.5 flex items-center hover:text-[#C7A15B] transition-colors">
        <X size={9} />
      </button>
    </div>
  );
}
