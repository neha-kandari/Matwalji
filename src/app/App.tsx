import { useState, useEffect, useMemo } from "react";

// ── Layout components ──────────────────────────────────────────────────────────
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// ── Pages ──────────────────────────────────────────────────────────────────────
import HomePage from "../pages/HomePage";
import CategoryPage from "../pages/CategoryPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import WishlistPage from "../pages/WishlistPage";
import AboutPage from "../pages/AboutPage";
import ContactPage from "../pages/ContactPage";
import AdminPage from "../pages/AdminPage";

// ── Types & constants ──────────────────────────────────────────────────────────
import type { Page, Product, CategorySlug, FilterOption, HomeSection, HomeSectionId, SaveResult } from "../types";
import { CATEGORY_SLUGS } from "../data/categories";
import { ALL_PRODUCTS } from "../data/products";
import { DEFAULT_FILTER_OPTIONS } from "../data/filters";
import { DEFAULT_HOME_SECTIONS, normalizeHomeSection, resolveHomeSections } from "../data/homeSections";

function getInitialPage(): Page {
  return window.location.pathname === "/admin" ? "admin" : "home";
}

export default function App() {
  const [page, setPage]                     = useState<Page>(getInitialPage);
  const [wishlist, setWishlist]             = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // Seed with the static fallback so the site renders instantly; the real
  // list is fetched from MongoDB (via /api/products) right after.
  const [products, setProducts]             = useState<Product[]>(ALL_PRODUCTS);
  const [filterOptions, setFilterOptions]   = useState<FilterOption[]>(DEFAULT_FILTER_OPTIONS);
  const [homeSections, setHomeSections]     = useState<Record<HomeSectionId, HomeSection>>(DEFAULT_HOME_SECTIONS);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/home-sections")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load home sections (${r.status})`);
        return r.json() as Promise<HomeSection[]>;
      })
      .then((data) => {
        if (!cancelled) setHomeSections(resolveHomeSections(data));
      })
      .catch((err) => {
        console.warn("Could not load home page sections from the database, using defaults:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load products from the database on first mount.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/products")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load products (${r.status})`);
        return r.json() as Promise<Product[]>;
      })
      .then((data) => {
        if (!cancelled && data.length > 0) setProducts(data);
      })
      .catch((err) => {
        // Falls back to the static ALL_PRODUCTS list already in state.
        // This happens when running `npm run dev` (plain Vite) instead of
        // `vercel dev`, since /api routes only exist under Vercel.
        console.warn("Could not load products from the database, using local fallback data:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Load admin-managed filter values (colors/sizes/tags) from the database.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/filters")
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load filters (${r.status})`);
        return r.json() as Promise<FilterOption[]>;
      })
      .then((data) => {
        if (!cancelled && data.length > 0) setFilterOptions(data);
      })
      .catch((err) => {
        console.warn("Could not load filter options from the database, using local fallback data:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the URL in sync with the admin panel only — every other page in
  // this app is state-driven with no real route, so /admin is a special case:
  // it can be reached directly, bookmarked, or restored on refresh.
  useEffect(() => {
    const path = page === "admin" ? "/admin" : "/";
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
  }, [page]);

  // Support the browser's back/forward buttons for the admin route.
  useEffect(() => {
    function onPopState() {
      setPage(window.location.pathname === "/admin" ? "admin" : "home");
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function navigateTo(p: Page) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function viewProduct(p: Product) {
    setSelectedProduct(p);
    navigateTo("product");
  }

  function toggleWishlist(p: Product) {
    setWishlist((prev) =>
      prev.some((w) => w.id === p.id)
        ? prev.filter((w) => w.id !== p.id)
        : [...prev, p]
    );
  }

  // ── Product CRUD (persisted to MongoDB via /api/products) ──────────────────
  // addProduct/updateProduct report *why* a save failed (payload too large,
  // validation error, etc.) so the admin UI can show something actionable
  // instead of a generic "try again" message.
  async function readErrorMessage(res: Response): Promise<string> {
    try {
      const data = await res.json();
      if (data && typeof data.error === "string") return data.error;
    } catch {
      // response wasn't JSON — fall through to a status-based message
    }
    if (res.status === 413) return "That upload is too large for the server to accept. Try a smaller image or video.";
    return `Server error (${res.status})`;
  }

  async function addProduct(p: Product): Promise<SaveResult> {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      });
      if (!res.ok) return { ok: false, error: await readErrorMessage(res) };
      const created = (await res.json()) as Product;
      setProducts((prev) => [...prev, created]);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Network error" };
    }
  }

  async function updateProduct(updated: Product): Promise<SaveResult> {
    try {
      const res = await fetch(`/api/products/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) return { ok: false, error: await readErrorMessage(res) };
      const saved = (await res.json()) as Product;
      setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      // Keep selected product in sync
      if (selectedProduct?.id === saved.id) setSelectedProduct(saved);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Network error" };
    }
  }

  async function deleteProduct(id: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) return false;
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setWishlist((prev) => prev.filter((p) => p.id !== id));
      if (selectedProduct?.id === id) setSelectedProduct(null);
      return true;
    } catch {
      return false;
    }
  }

  // ── Filter option CRUD (colors/sizes/tags, persisted via /api/filters) ─────
  async function addFilterOption(opt: Omit<FilterOption, "id">): Promise<boolean> {
    try {
      const res = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opt),
      });
      if (!res.ok) return false;
      const created = (await res.json()) as FilterOption;
      setFilterOptions((prev) => [...prev, created]);
      return true;
    } catch {
      return false;
    }
  }

  async function updateFilterOption(updated: FilterOption): Promise<boolean> {
    try {
      const res = await fetch(`/api/filters/${updated.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) return false;
      const saved = (await res.json()) as FilterOption;
      setFilterOptions((prev) => prev.map((f) => (f.id === saved.id ? saved : f)));
      return true;
    } catch {
      return false;
    }
  }

  async function deleteFilterOption(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/filters/${id}`, { method: "DELETE" });
      if (!res.ok) return false;
      setFilterOptions((prev) => prev.filter((f) => f.id !== id));
      return true;
    } catch {
      return false;
    }
  }

  // ── Home page section content (persisted via /api/home-sections) ───────────
  async function updateHomeSection(section: HomeSection): Promise<SaveResult> {
    try {
      const res = await fetch(`/api/home-sections/${section.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(section),
      });
      if (!res.ok) return { ok: false, error: await readErrorMessage(res) };
      const saved = (await res.json()) as HomeSection;
      setHomeSections((prev) => ({ ...prev, [saved.id]: normalizeHomeSection(saved.id, saved) }));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Network error" };
    }
  }

  // Admin-managed color name → hex map, handed to the storefront pages so
  // swatches reflect colors added/edited in the admin panel.
  const colorMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const f of filterOptions) {
      if (f.type === "color" && f.hex) map[f.value.toLowerCase()] = f.hex;
    }
    return map;
  }, [filterOptions]);

  const isCategory = CATEGORY_SLUGS.includes(page as CategorySlug);
  const isAdmin    = page === "admin";

  // Admin page renders without Navbar/Footer
  if (isAdmin) {
    return (
      <AdminPage
        products={products}
        onAdd={addProduct}
        onUpdate={updateProduct}
        onDelete={deleteProduct}
        filterOptions={filterOptions}
        onAddFilter={addFilterOption}
        onUpdateFilter={updateFilterOption}
        onDeleteFilter={deleteFilterOption}
        homeSections={homeSections}
        onUpdateHomeSection={updateHomeSection}
        onExit={() => navigateTo("home")}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar
        page={page}
        setPage={navigateTo}
        setSelectedProduct={setSelectedProduct}
        wishlistCount={wishlist.length}
      />

      {page === "home" && (
        <>
          <HomePage
            setPage={navigateTo}
            wishlist={wishlist}
            onWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            products={products}
            homeSections={homeSections}
          />
          <Footer setPage={navigateTo} />
        </>
      )}

      {isCategory && (
        <>
          <CategoryPage
            slug={page as CategorySlug}
            wishlist={wishlist}
            onWishlist={toggleWishlist}
            onViewProduct={viewProduct}
            setPage={navigateTo}
            products={products}
            colorMap={colorMap}
          />
          <Footer setPage={navigateTo} />
        </>
      )}

      {page === "product" && selectedProduct && (
        <>
          <ProductDetailPage
            product={selectedProduct}
            wishlist={wishlist}
            onWishlist={toggleWishlist}
            setPage={navigateTo}
            onViewProduct={viewProduct}
            products={products}
            colorMap={colorMap}
          />
          <Footer setPage={navigateTo} />
        </>
      )}

      {page === "wishlist" && (
        <>
          <WishlistPage
            wishlist={wishlist}
            onRemove={(id) => setWishlist((prev) => prev.filter((w) => w.id !== id))}
            setPage={navigateTo}
          />
          <Footer setPage={navigateTo} />
        </>
      )}

      {page === "about" && (
        <>
          <AboutPage />
          <Footer setPage={navigateTo} />
        </>
      )}

      {page === "contact" && (
        <>
          <ContactPage />
          <Footer setPage={navigateTo} />
        </>
      )}
    </div>
  );
}
