import type { Db } from "mongodb";

export const SECTION_IDS = ["featured", "new-arrivals", "capture-moments"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

const CATEGORY_IDS = [
  "bridal-lehengas",
  "non-bridal-lehengas",
  "sarees-silk",
  "sarees-banarasi",
  "sarees-net",
  "sarees-premium",
];

export interface HomeSectionImageDoc {
  src: string;
  alt: string;
}

export interface HomeSectionDoc {
  id: SectionId;
  eyebrow: string;
  title: string;
  subtitle: string;
  visible: boolean;
  mode: "auto" | "manual";
  maxItems: number;
  categories: string[];
  productIds: number[];
  images: HomeSectionImageDoc[];
  handle: string;
}

const MAX_TEXT = 300;
const MAX_IMAGES = 12;
const MAX_ITEMS = 24;
const MAX_PRODUCT_PICKS = 100;

export function isSectionId(value: unknown): value is SectionId {
  return typeof value === "string" && (SECTION_IDS as readonly string[]).includes(value);
}

export function sectionsCollection(db: Db) {
  return db.collection<HomeSectionDoc>("homeSections");
}

export function serialize(doc: HomeSectionDoc) {
  return {
    id: doc.id,
    eyebrow: doc.eyebrow,
    title: doc.title,
    subtitle: doc.subtitle,
    visible: doc.visible,
    mode: doc.mode,
    maxItems: doc.maxItems,
    categories: doc.categories,
    productIds: doc.productIds,
    images: doc.images,
    handle: doc.handle,
  };
}

type ParseResult = { ok: true; doc: HomeSectionDoc } | { ok: false; error: string };

export function parseSection(id: SectionId, body: unknown): ParseResult {
  const input = (body ?? {}) as Record<string, unknown>;
  const fail = (error: string): ParseResult => ({ ok: false, error });

  const texts = {} as Record<"eyebrow" | "title" | "subtitle" | "handle", string>;
  for (const key of ["eyebrow", "title", "subtitle", "handle"] as const) {
    const value = input[key] ?? "";
    if (typeof value !== "string") return fail(`${key} must be text.`);
    if (value.length > MAX_TEXT) return fail(`${key} is too long (max ${MAX_TEXT} characters).`);
    texts[key] = value.trim();
  }
  if (!texts.title) return fail("A section heading is required.");

  const visible = input.visible ?? true;
  if (typeof visible !== "boolean") return fail("visible must be true or false.");

  const mode = input.mode ?? "auto";
  if (mode !== "auto" && mode !== "manual") return fail("mode must be auto or manual.");

  const maxItems = input.maxItems ?? 8;
  if (!Number.isInteger(maxItems) || (maxItems as number) < 1 || (maxItems as number) > MAX_ITEMS) {
    return fail(`The number of pieces must be between 1 and ${MAX_ITEMS}.`);
  }

  const rawCategories = input.categories ?? [];
  if (!Array.isArray(rawCategories) || !rawCategories.every((c) => typeof c === "string" && CATEGORY_IDS.includes(c))) {
    return fail("Unknown category selected.");
  }

  const rawIds = input.productIds ?? [];
  if (!Array.isArray(rawIds) || !rawIds.every((n) => Number.isInteger(n))) {
    return fail("productIds must be a list of product numbers.");
  }
  if (rawIds.length > MAX_PRODUCT_PICKS) return fail(`At most ${MAX_PRODUCT_PICKS} pieces can be picked.`);

  const rawImages = input.images ?? [];
  if (!Array.isArray(rawImages) || rawImages.length > MAX_IMAGES) {
    return fail(`A section can hold up to ${MAX_IMAGES} images.`);
  }
  const images: HomeSectionImageDoc[] = [];
  for (const item of rawImages) {
    const src = (item as { src?: unknown } | null)?.src;
    const alt = (item as { alt?: unknown } | null)?.alt;
    if (typeof src !== "string" || !src.trim()) return fail("Every gallery tile needs a picture.");
    images.push({ src: src.trim(), alt: typeof alt === "string" ? alt.trim().slice(0, 160) : "" });
  }

  const isGallery = id === "capture-moments";
  return {
    ok: true,
    doc: {
      id,
      ...texts,
      visible,
      mode,
      maxItems: maxItems as number,
      categories: isGallery ? [] : [...new Set(rawCategories as string[])],
      productIds: isGallery ? [] : [...new Set(rawIds as number[])],
      images: isGallery ? images : [],
    },
  };
}
