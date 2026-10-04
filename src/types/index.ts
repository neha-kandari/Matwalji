export type CategorySlug =
  | "bridal-lehengas"
  | "non-bridal-lehengas"
  | "sarees-silk"
  | "sarees-banarasi"
  | "sarees-net"
  | "sarees-premium";

export type Page =
  | "home"
  | "product"
  | "wishlist"
  | "about"
  | "contact"
  | "admin"
  | CategorySlug;

export interface Product {
  id: number;
  name: string;
  priceRaw: number;
  price: string;
  fabric: string;
  occasion: string;
  category: CategorySlug;
  image: string;
  images: string[];
  tag?: string;
  description: string;
  colors: string[];
  sizes?: string[];
  blouseDetails?: string;
  // An Instagram reel/post URL for this product. Doubles as the "video" shown
  // in the product gallery (which links out to Instagram rather than hosting
  // a file) and the "visit us on Instagram" CTA.
  instagramUrl?: string;
}

export interface CategoryMeta {
  label: string;
  heading: string;
  subhead: string;
  heroBanner: string;
  startingFrom: string;
}

export interface NavItem {
  label: string;
  page: Page | null;
  dropdown: { label: string; page: Page }[] | null;
}

// ── Admin-managed filter values (colors / sizes / tags) ────────────────────────
export type FilterType = "color" | "size" | "tag";

export interface FilterOption {
  id: string;
  type: FilterType;
  value: string;
  hex?: string; // only meaningful for type "color"
}

// ── Admin-managed home page sections ───────────────────────────────────────────
export type HomeSectionId = "featured" | "new-arrivals" | "capture-moments";

export interface HomeSectionImage {
  src: string;
  alt: string;
}

export type HomeSectionMode = "auto" | "manual";

export interface HomeSection {
  id: HomeSectionId;
  eyebrow: string;
  title: string;
  subtitle: string;
  // Hidden sections are removed from the home page entirely.
  visible: boolean;
  // "auto" picks products by tag, optionally limited to `categories`;
  // "manual" shows exactly `productIds`, in that order.
  mode: HomeSectionMode;
  maxItems: number;
  categories: CategorySlug[];
  // Product sections: hand-picked products, in display order.
  productIds: number[];
  // Capture moments: the gallery tiles, in display order.
  images: HomeSectionImage[];
  // Capture moments: Instagram handle shown beside the heading.
  handle: string;
}

// Result of an admin save/update — carries a human-readable reason on failure
// (validation error, payload too large, etc.) instead of a bare boolean.
export interface SaveResult {
  ok: boolean;
  error?: string;
}
