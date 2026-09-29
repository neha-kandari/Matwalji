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
  video?: string;
  tag?: string;
  description: string;
  colors: string[];
  sizes?: string[];
  blouseDetails?: string;
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
  dropdown: { label: string; page: Page; sub: string }[] | null;
}

// ── Admin-managed filter values (colors / sizes / tags) ────────────────────────
export type FilterType = "color" | "size" | "tag";

export interface FilterOption {
  id: string;
  type: FilterType;
  value: string;
  hex?: string; // only meaningful for type "color"
}

// Result of an admin save/update — carries a human-readable reason on failure
// (validation error, payload too large, etc.) instead of a bare boolean.
export interface SaveResult {
  ok: boolean;
  error?: string;
}
