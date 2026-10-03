import type { HomeSection, HomeSectionId } from "../types";

export const HOME_SECTION_IDS: HomeSectionId[] = ["featured", "new-arrivals", "capture-moments"];

export const DEFAULT_HOME_SECTIONS: Record<HomeSectionId, HomeSection> = {
  featured: {
    id: "featured",
    eyebrow: "Handpicked",
    title: "Featured Pieces",
    subtitle: "Our most beloved creations — each one a dialogue between tradition and artistry.",
    visible: true,
    mode: "auto",
    maxItems: 8,
    categories: [],
    productIds: [],
    images: [],
    handle: "",
  },
  "new-arrivals": {
    id: "new-arrivals",
    eyebrow: "Just In",
    title: "New Arrivals",
    subtitle: "Fresh from the atelier — the latest additions to our curated collection.",
    visible: true,
    mode: "auto",
    maxItems: 12,
    categories: [],
    productIds: [],
    images: [],
    handle: "",
  },
  "capture-moments": {
    id: "capture-moments",
    eyebrow: "Real Moments",
    title: "Captured in MATWALJI",
    subtitle: "",
    visible: true,
    mode: "auto",
    maxItems: 12,
    categories: [],
    productIds: [],
    images: [
      "https://images.unsplash.com/photo-1654764746225-e63f5e90facd?w=500&h=650&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1727430228383-aa1fb59db8bf?w=500&h=380&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1619516388835-2b60acc4049e?w=500&h=380&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1610047614256-023d7c028d0b?w=500&h=650&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1692850852630-495a2145c2a4?w=500&h=380&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1622207691293-5cd80466dab3?w=500&h=380&fit=crop&auto=format",
    ].map((src, i) => ({ src, alt: `Gallery ${i + 1}` })),
    handle: "@matwalji.sarees",
  },
};

// Fills in any field a saved section is missing (sections saved before a
// field existed), so older database documents keep working.
export function normalizeHomeSection(id: HomeSectionId, raw: Partial<HomeSection>): HomeSection {
  const base = DEFAULT_HOME_SECTIONS[id];
  return {
    id,
    eyebrow: raw.eyebrow ?? base.eyebrow,
    title: raw.title ?? base.title,
    subtitle: raw.subtitle ?? base.subtitle,
    visible: raw.visible ?? true,
    mode: raw.mode ?? (raw.productIds?.length ? "manual" : base.mode),
    maxItems: raw.maxItems ?? base.maxItems,
    categories: raw.categories ?? [],
    productIds: raw.productIds ?? [],
    images: raw.images ?? base.images,
    handle: raw.handle ?? base.handle,
  };
}

// Overlays whatever the database has saved onto the built-in defaults, so a
// section that has never been edited still renders its original content.
export function resolveHomeSections(stored: Partial<HomeSection>[]): Record<HomeSectionId, HomeSection> {
  const resolved = { ...DEFAULT_HOME_SECTIONS };
  for (const section of stored) {
    if (section.id && HOME_SECTION_IDS.includes(section.id)) {
      resolved[section.id] = normalizeHomeSection(section.id, section);
    }
  }
  return resolved;
}
