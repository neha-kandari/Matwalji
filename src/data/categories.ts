import type { CategoryMeta, CategorySlug, NavItem, Page } from "../types";

export const CATEGORY_META: Record<CategorySlug, CategoryMeta> = {
  "bridal-lehengas": {
    label: "Bridal Lehengas",
    heading: "Bridal Lehengas",
    subhead:
      "Crafted for the most important day of your life — each bridal lehenga is a masterwork of embroidery, silk, and timeless silhouette.",
    heroBanner:
      "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=1600&h=500&fit=crop&auto=format",
    startingFrom: "Starting from ₹10,000",
  },
  "non-bridal-lehengas": {
    label: "Non-Bridal Lehengas",
    heading: "Non-Bridal Lehengas",
    subhead:
      "From sangeets to receptions and festive gatherings — statement lehengas that turn every occasion into a memory.",
    heroBanner:
      "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=1600&h=500&fit=crop&auto=format",
    startingFrom: "Starting from ₹7,000",
  },
  "sarees-silk": {
    label: "Silk Sarees",
    heading: "Silk Sarees",
    subhead:
      "Pure silk woven into poetry — Kanjivaram, Mysore, Tussar, and beyond. Each yard a testament to India's greatest textile tradition.",
    heroBanner:
      "https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?w=1600&h=500&fit=crop&auto=format",
    startingFrom: "Starting from ₹8,500",
  },
  "sarees-banarasi": {
    label: "Banarasi Sarees",
    heading: "Banarasi Sarees",
    subhead:
      "Born in the holy city of Varanasi, woven with real zari and centuries of devotion. The crown jewel of Indian saree culture.",
    heroBanner:
      "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1600&h=500&fit=crop&auto=format",
    startingFrom: "Starting from ₹12,000",
  },
  "sarees-net": {
    label: "Net Sarees",
    heading: "Net Sarees",
    subhead:
      "Sheer, ethereal, and endlessly glamorous. Our designer net sarees blend delicate embroidery with contemporary elegance.",
    heroBanner:
      "https://images.unsplash.com/photo-1692850852630-495a2145c2a4?w=1600&h=500&fit=crop&auto=format",
    startingFrom: "Starting from ₹9,000",
  },
  "sarees-premium": {
    label: "Premium Sarees",
    heading: "Premium Sarees",
    subhead:
      "Our most exclusive drapes — rare weaves, hand-finished embellishment, and limited-edition pieces reserved for the connoisseur.",
    heroBanner:
      "https://images.unsplash.com/photo-1617633150878-7df1d12a9a57?w=1600&h=500&fit=crop&auto=format",
    startingFrom: "Starting from ₹45,000",
  },
};

export const CATEGORY_SLUGS: CategorySlug[] = [
  "bridal-lehengas",
  "non-bridal-lehengas",
  "sarees-silk",
  "sarees-banarasi",
  "sarees-net",
  "sarees-premium",
];

export const HOME_CATEGORIES: {
  slug: CategorySlug;
  label: string;
  from: string;
  img: string;
}[] = [
  {
    slug: "bridal-lehengas",
    label: "Bridal Lehengas",
    from: "From ₹10,000",
    img: "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=600&h=800&fit=crop&auto=format",
  },
  {
    slug: "non-bridal-lehengas",
    label: "Non-Bridal Lehengas",
    from: "From ₹7,000",
    img: "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=600&h=800&fit=crop&auto=format",
  },
  {
    slug: "sarees-silk",
    label: "Silk Sarees",
    from: "From ₹8,500",
    img: "https://images.unsplash.com/photo-1619516388835-2b60acc4049e?w=600&h=800&fit=crop&auto=format",
  },
  {
    slug: "sarees-banarasi",
    label: "Banarasi Sarees",
    from: "From ₹12,000",
    img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop&auto=format",
  },
  {
    slug: "sarees-net",
    label: "Net Sarees",
    from: "From ₹9,000",
    img: "https://images.unsplash.com/photo-1692850852630-495a2145c2a4?w=600&h=800&fit=crop&auto=format",
  },
  {
    slug: "sarees-premium",
    label: "Premium Sarees",
    from: "From ₹45,000",
    img: "https://images.unsplash.com/photo-1617633150878-7df1d12a9a57?w=600&h=800&fit=crop&auto=format",
  },
];

export const NAV_STRUCTURE: NavItem[] = [
  { label: "Home", page: "home" as Page, dropdown: null },
  {
    label: "Lehengas",
    page: null,
    dropdown: [
      { label: "Bridal Lehengas", page: "bridal-lehengas" as Page },
      { label: "Non-Bridal Lehengas", page: "non-bridal-lehengas" as Page },
    ],
  },
  {
    label: "Sarees",
    page: null,
    dropdown: [
      { label: "Silk Sarees", page: "sarees-silk" as Page },
      { label: "Banarasi Sarees", page: "sarees-banarasi" as Page },
      { label: "Net Sarees", page: "sarees-net" as Page },
      { label: "Premium Sarees", page: "sarees-premium" as Page },
    ],
  },
  { label: "About", page: "about" as Page, dropdown: null },
];
