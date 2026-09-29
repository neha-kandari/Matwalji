import type { FilterOption } from "../types";

// Starting set of filter values — mirrors what the storefront/admin used to
// have hardcoded. Seeded into MongoDB once (see scripts/seed.ts) and used
// here purely as an instant-render fallback before /api/filters resolves.
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

const SIZE_VALUES = [
  "XS", "S", "M", "L", "XL", "XXL", "Free Size",
  "Blouse 32", "Blouse 34", "Blouse 36", "Blouse 38", "Blouse 40", "Blouse 42",
];

const TAG_VALUES = ["New Arrival", "Bestseller", "Heritage", "Limited", "Signature", "Value Pick"];

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export const DEFAULT_FILTER_OPTIONS: FilterOption[] = [
  ...Object.entries(COLOR_HEX).map(([name, hex], i) => ({
    id: `default-color-${i}`,
    type: "color" as const,
    value: titleCase(name),
    hex,
  })),
  ...SIZE_VALUES.map((v, i) => ({ id: `default-size-${i}`, type: "size" as const, value: v })),
  ...TAG_VALUES.map((v, i) => ({ id: `default-tag-${i}`, type: "tag" as const, value: v })),
];
