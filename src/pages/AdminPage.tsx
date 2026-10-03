import { useState, useMemo, useRef, useEffect, Fragment } from "react";
import {
  LayoutDashboard, Package, PlusCircle, LogOut, Search, Menu,
  Pencil, Trash2, X, Check, ChevronDown, AlertTriangle,
  TrendingUp, Tag, ShoppingBag, Layers, Eye, EyeOff, ArrowUpRight,
  Upload, CheckCircle2, XCircle, Loader2, Shirt, Scroll,
  LayoutGrid, List, SlidersHorizontal, Plus, Star, Sparkles, Instagram,
  Minus, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, RotateCcw,
} from "lucide-react";
import { CATEGORY_SLUGS, CATEGORY_META } from "../data/categories";
import MatwaljiLogo from "../components/MatwaljiLogo";
import type { CategorySlug, Product, FilterOption, FilterType, HomeSection, HomeSectionId, SaveResult } from "../types";
import { DEFAULT_HOME_SECTIONS } from "../data/homeSections";

const ADMIN_PASSWORD = "matwalji@admin";

// ─── Category groups (keeps Lehengas and Sarees managed as separate lists) ─────
const LEHENGA_CATEGORIES: CategorySlug[] = CATEGORY_SLUGS.filter((s) => s.includes("lehenga"));
const SAREE_CATEGORIES: CategorySlug[] = CATEGORY_SLUGS.filter((s) => s.startsWith("sarees"));

// ─── Blank product template ────────────────────────────────────────────────────
function blankProduct(existingIds: number[], defaultCategory?: CategorySlug): Product {
  const id = Math.max(0, ...existingIds) + 1;
  return {
    id,
    name: "",
    priceRaw: 0,
    price: "",
    fabric: "",
    occasion: "",
    category: defaultCategory ?? "bridal-lehengas",
    image: "",
    images: [],
    tag: undefined,
    description: "",
    colors: [],
    sizes: [],
    blouseDetails: "",
  };
}

// ─── Field input helpers ───────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[9.5px] tracking-[0.22em] uppercase mb-1.5" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 border outline-none text-sm transition-colors focus:border-[#C7A15B]";
const inputStyle = { borderColor: "rgba(199,161,91,0.3)", background: "#fdfaf7", fontFamily: "var(--font-body)", color: "#252525" };

// Downscales + re-encodes a photo before it's embedded as base64. A raw
// phone/camera photo can be several MB — well past what fits in a request
// body once base64-inflated — so this keeps uploads working without the
// admin ever having to think about file size.
function compressImageFile(file: File, maxDimension = 1600, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not decode image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height / width) * maxDimension);
            width = maxDimension;
          } else {
            width = Math.round((width / height) * maxDimension);
            height = maxDimension;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(reader.result as string); return; }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Removable selection chip ───────────────────────────────────────────────────
function SelectionChip({ label, swatch, onRemove }: { label: string; swatch?: string; onRemove: () => void }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 text-[10.5px]"
      style={{ border: "1px solid rgba(199,161,91,0.3)", background: "#fdfaf7", fontFamily: "var(--font-body)", color: "#3a2a1a" }}
    >
      {swatch && <span className="w-3 h-3 rounded-full flex-shrink-0 border" style={{ background: swatch, borderColor: "rgba(0,0,0,0.15)" }} />}
      {label}
      <button type="button" onClick={onRemove} className="flex items-center hover:text-[#9B1B30] transition-colors" style={{ color: "#7a6a5a" }}>
        <X size={10} />
      </button>
    </span>
  );
}

// ─── Multi-select dropdown (used for Colours/Sizes on the product form) ────────
function MultiSelectDropdown({
  placeholder, options, selected, onToggle, showSwatch = false,
}: {
  placeholder: string;
  options: FilterOption[];
  selected: string[];
  onToggle: (value: string) => void;
  showSwatch?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={inputCls + " flex items-center justify-between text-left"}
        style={inputStyle}
      >
        <span style={{ color: selected.length > 0 ? "#252525" : "#8a7a6a" }}>
          {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>
        <ChevronDown size={12} style={{ color: "#C7A15B", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }} />
      </button>

      {open && (
        <div
          className="absolute z-20 mt-1.5 w-full max-h-64 overflow-y-auto border bg-white"
          style={{ borderColor: "rgba(199,161,91,0.3)", boxShadow: "0 10px 30px rgba(42,7,16,0.15)" }}
        >
          {options.length === 0 ? (
            <p className="p-3 text-xs" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
              None defined yet — add some under Filters.
            </p>
          ) : (
            options.map((opt) => {
              const active = selected.some((v) => v.toLowerCase() === opt.value.toLowerCase());
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onToggle(opt.value)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[#fdfaf7]"
                >
                  <span
                    className="w-4 h-4 flex-shrink-0 border flex items-center justify-center"
                    style={{ borderColor: active ? "#C7A15B" : "rgba(199,161,91,0.35)", background: active ? "#C7A15B" : "transparent" }}
                  >
                    {active && <Check size={9} style={{ color: "#2A0710" }} strokeWidth={3} />}
                  </span>
                  {showSwatch && (
                    <span className="w-4 h-4 rounded-full flex-shrink-0 border" style={{ background: opt.hex ?? "#C7A15B", borderColor: "rgba(0,0,0,0.15)" }} />
                  )}
                  <span className="text-sm" style={{ color: "#252525", fontFamily: "var(--font-body)" }}>{opt.value}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Category badge ────────────────────────────────────────────────────────────
function CatBadge({ slug }: { slug: CategorySlug }) {
  const colors: Record<CategorySlug, string> = {
    "bridal-lehengas":     "rgba(155,27,48,0.12)",
    "non-bridal-lehengas": "rgba(199,161,91,0.15)",
    "sarees-silk":         "rgba(42,7,16,0.1)",
    "sarees-banarasi":     "rgba(107,37,96,0.12)",
    "sarees-net":          "rgba(0,105,116,0.12)",
    "sarees-premium":      "rgba(107,37,96,0.18)",
  };
  return (
    <span
      className="px-2 py-0.5 text-[9px] tracking-[0.15em] uppercase"
      style={{ background: colors[slug], color: "#2A0710", fontFamily: "var(--font-body)" }}
    >
      {CATEGORY_META[slug].label}
    </span>
  );
}

// ─── Toast ──────────────────────────────────────────────────────────────────────
interface ToastState {
  type: "success" | "error";
  message: string;
}

function Toast({ toast, onDismiss }: { toast: ToastState | null; onDismiss: () => void }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3200);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;
  const isSuccess = toast.type === "success";

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-4 py-3.5 max-w-sm" style={{
      background: isSuccess ? "#2A0710" : "#fff",
      border: `1px solid ${isSuccess ? "rgba(199,161,91,0.35)" : "#9B1B30"}`,
      boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
      animation: "matwalji-toast-in 0.25s ease-out",
    }}>
      {isSuccess ? (
        <CheckCircle2 size={17} style={{ color: "#C7A15B", flexShrink: 0 }} />
      ) : (
        <XCircle size={17} style={{ color: "#9B1B30", flexShrink: 0 }} />
      )}
      <p className="text-sm leading-snug" style={{ color: isSuccess ? "#E8D2A6" : "#2A0710", fontFamily: "var(--font-body)" }}>
        {toast.message}
      </p>
      <button onClick={onDismiss} className="ml-1 flex-shrink-0" style={{ color: isSuccess ? "rgba(199,161,91,0.5)" : "#7a6a5a" }}>
        <X size={13} />
      </button>
      <style>{`
        @keyframes matwalji-toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteModal({
  title = "Delete Product", name, onConfirm, onCancel,
}: { title?: string; name: string; onConfirm: () => Promise<void>; onCancel: () => void }) {
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(42,7,16,0.65)" }}>
      <div className="w-full max-w-sm p-7 bg-white" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 flex items-center justify-center" style={{ background: "rgba(155,27,48,0.1)" }}>
            <AlertTriangle size={17} style={{ color: "#9B1B30" }} />
          </div>
          <h3 style={{ fontFamily: "var(--font-display)", color: "#2A0710", fontSize: "1.15rem", fontWeight: 400 }}>{title}</h3>
        </div>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
          Are you sure you want to delete <strong style={{ color: "#2A0710" }}>{name}</strong>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 border text-[10px] tracking-[0.18em] uppercase disabled:opacity-50"
            style={{ borderColor: "rgba(199,161,91,0.3)", color: "#7a6a5a", fontFamily: "var(--font-body)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 text-[10px] tracking-[0.18em] uppercase flex items-center justify-center gap-2 disabled:opacity-70"
            style={{ background: "#9B1B30", color: "#fff", fontFamily: "var(--font-body)" }}
          >
            {deleting && <Loader2 size={12} className="animate-spin" />}
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Form (Add / Edit) ─────────────────────────────────────────────────
interface FormProps {
  initial: Product;
  filterOptions: FilterOption[];
  onSave: (p: Product) => Promise<boolean>;
  onCancel: () => void;
  isEdit: boolean;
}

function ProductForm({ initial, filterOptions, onSave, onCancel, isEdit }: FormProps) {
  const [form, setForm] = useState<Product>({
    ...initial,
    colors: initial.colors ?? [],
    sizes: initial.sizes ?? [],
    images: initial.images ?? [],
  });
  const [errors, setErrors]         = useState<string[]>([]);
  const [imgMode, setImgMode]       = useState<"upload" | "url">("upload");
  const [uploading, setUploading]   = useState(false);
  const [saving, setSaving]         = useState(false);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImageFile(file);
      set("image", compressed);
    } catch {
      // Fall back to the raw file if it couldn't be decoded/resized for any reason.
      const reader = new FileReader();
      reader.onload = (ev) => set("image", ev.target?.result as string);
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  }

  function set<K extends keyof Product>(key: K, val: Product[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  // Managed lists from the Filters section, merged with any legacy values
  // already on this product so nothing gets silently dropped when editing.
  const colorChoices = useMemo((): FilterOption[] => {
    const managed = filterOptions.filter((f) => f.type === "color");
    const extra = (form.colors ?? []).filter((c) => !managed.some((m) => m.value.toLowerCase() === c.toLowerCase()));
    return [...managed, ...extra.map((value): FilterOption => ({ id: value, type: "color", value, hex: undefined }))];
  }, [filterOptions, form.colors]);

  const sizeChoices = useMemo((): FilterOption[] => {
    const managed = filterOptions.filter((f) => f.type === "size");
    const extra = (form.sizes ?? []).filter((s) => !managed.some((m) => m.value.toLowerCase() === s.toLowerCase()));
    return [...managed, ...extra.map((value): FilterOption => ({ id: value, type: "size", value }))];
  }, [filterOptions, form.sizes]);

  const tagChoices = useMemo(() => {
    const managed = filterOptions.filter((f) => f.type === "tag");
    if (form.tag && !managed.some((m) => m.value.toLowerCase() === form.tag!.toLowerCase())) {
      return [...managed, { id: form.tag, type: "tag" as const, value: form.tag }];
    }
    return managed;
  }, [filterOptions, form.tag]);

  function toggleColor(value: string) {
    setForm((f) => {
      const has = (f.colors ?? []).some((c) => c.toLowerCase() === value.toLowerCase());
      return { ...f, colors: has ? f.colors.filter((c) => c.toLowerCase() !== value.toLowerCase()) : [...(f.colors ?? []), value] };
    });
  }

  function toggleSize(value: string) {
    setForm((f) => {
      const has = (f.sizes ?? []).some((s) => s.toLowerCase() === value.toLowerCase());
      return { ...f, sizes: has ? (f.sizes ?? []).filter((s) => s.toLowerCase() !== value.toLowerCase()) : [...(f.sizes ?? []), value] };
    });
  }

  function validate(): boolean {
    const e: string[] = [];
    if (!form.name.trim())        e.push("Product name is required.");
    if (!form.priceRaw || form.priceRaw <= 0) e.push("Price must be greater than 0.");
    if (!form.fabric.trim())      e.push("Fabric is required.");
    if (!form.occasion.trim())    e.push("Occasion is required.");
    if (!form.description.trim()) e.push("Description is required.");
    if (!form.image.trim())       e.push("Main image URL is required.");
    setErrors(e);
    return e.length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    const priceFormatted = `₹ ${form.priceRaw.toLocaleString("en-IN")}`;
    const ok = await onSave({ ...form, price: priceFormatted, images: form.images.length ? form.images : [form.image] });
    setSaving(false);
    if (!ok) {
      setErrors(["Something went wrong while saving. Please check your connection and try again."]);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="h-px w-6" style={{ background: "#C7A15B" }} />
              <span className="text-[9px] tracking-[0.3em] uppercase" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>
                {isEdit ? "Edit Product" : "New Product"}
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", color: "#2A0710", fontSize: "1.6rem", fontWeight: 300 }}>
              {isEdit ? form.name || "Edit Product" : "Add New Product"}
            </h2>
          </div>
          <button onClick={onCancel} className="w-8 h-8 border flex items-center justify-center" style={{ borderColor: "rgba(199,161,91,0.3)" }}>
            <X size={14} style={{ color: "#7a6a5a" }} />
          </button>
        </div>

        {errors.length > 0 && (
          <div className="mb-5 p-4 border-l-2" style={{ background: "rgba(155,27,48,0.06)", borderColor: "#9B1B30" }}>
            {errors.map((e) => (
              <p key={e} className="text-xs" style={{ color: "#9B1B30", fontFamily: "var(--font-body)" }}>{e}</p>
            ))}
          </div>
        )}

        <div className="space-y-5">
          {/* Row: name + category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Product Name *">
              <input className={inputCls} style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Scarlet Zardozi Bridal Lehenga" />
            </Field>
            <Field label="Category *">
              <div className="relative">
                <select
                  className={inputCls + " appearance-none pr-8"}
                  style={inputStyle}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value as CategorySlug)}
                >
                  {CATEGORY_SLUGS.map((slug) => (
                    <option key={slug} value={slug}>{CATEGORY_META[slug].label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#C7A15B" }} />
              </div>
            </Field>
          </div>

          {/* Row: price + tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Price (₹) *">
              <input
                type="number"
                className={inputCls}
                style={inputStyle}
                value={form.priceRaw || ""}
                onChange={(e) => set("priceRaw", Number(e.target.value))}
                placeholder="e.g. 45000"
              />
            </Field>
            <Field label="Tag (optional)">
              <div className="relative">
                <select className={inputCls + " appearance-none pr-8"} style={inputStyle} value={form.tag || ""} onChange={(e) => set("tag", e.target.value || undefined)}>
                  <option value="">None</option>
                  {tagChoices.map((t) => (
                    <option key={t.id} value={t.value}>{t.value}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#C7A15B" }} />
              </div>
            </Field>
          </div>

          {/* Row: fabric + occasion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Fabric *">
              <input className={inputCls} style={inputStyle} value={form.fabric} onChange={(e) => set("fabric", e.target.value)} placeholder="e.g. Pure Kanjivaram Silk" />
            </Field>
            <Field label="Occasion *">
              <input className={inputCls} style={inputStyle} value={form.occasion} onChange={(e) => set("occasion", e.target.value)} placeholder="e.g. Wedding / Reception" />
            </Field>
          </div>

          {/* Description */}
          <Field label="Description *">
            <textarea
              rows={4}
              className={inputCls + " resize-none"}
              style={inputStyle}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the product, its craftsmanship, and occasion details..."
            />
          </Field>

          {/* Main image */}
          <Field label="Main Image *">
            <div className="flex gap-2 mb-3">
              {(["upload", "url"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setImgMode(m)}
                  className="px-3 py-1.5 text-[10px] tracking-widest uppercase border transition-all"
                  style={{
                    background: imgMode === m ? "#C7A15B" : "transparent",
                    color: imgMode === m ? "#2A0710" : "#C7A15B",
                    borderColor: "#C7A15B",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {m === "upload" ? "Upload from PC" : "Paste URL"}
                </button>
              ))}
            </div>
            {imgMode === "upload" ? (
              <>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed transition-all hover:border-[#C7A15B]"
                  style={{ borderColor: "rgba(199,161,91,0.3)", color: "#C7A15B" }}
                >
                  <Upload size={22} />
                  <span className="text-xs" style={{ fontFamily: "var(--font-body)", color: "#7a6a5a" }}>
                    {uploading ? "Processing…" : "Click to choose an image"}
                  </span>
                </button>
              </>
            ) : (
              <input
                className={inputCls}
                style={inputStyle}
                value={form.image.startsWith("data:") ? "" : form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="https://images.unsplash.com/..."
              />
            )}
            {form.image && (
              <div className="mt-3 w-20 h-24 overflow-hidden border" style={{ borderColor: "rgba(199,161,91,0.2)" }}>
                <img src={form.image} alt="preview" className="w-full h-full object-cover object-top" />
              </div>
            )}
          </Field>

          {/* Extra images */}
          <Field label="Additional Image URLs (one per line)">
            <textarea
              rows={3}
              className={inputCls + " resize-none"}
              style={inputStyle}
              value={(form.images ?? []).join("\n")}
              onChange={(e) => set("images", e.target.value.split("\n").filter((l) => l.trim()))}
              placeholder={"https://...\nhttps://..."}
            />
          </Field>

          {/* Colours + Sizes — dropdown pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Colours">
              <MultiSelectDropdown
                placeholder="Select colours"
                options={colorChoices}
                selected={form.colors ?? []}
                onToggle={toggleColor}
                showSwatch
              />
              {(form.colors ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {(form.colors ?? []).map((c) => (
                    <SelectionChip
                      key={c}
                      label={c}
                      swatch={colorChoices.find((o) => o.value.toLowerCase() === c.toLowerCase())?.hex}
                      onRemove={() => toggleColor(c)}
                    />
                  ))}
                </div>
              )}
            </Field>

            <Field label="Sizes">
              <MultiSelectDropdown
                placeholder="Select sizes"
                options={sizeChoices}
                selected={form.sizes ?? []}
                onToggle={toggleSize}
              />
              {(form.sizes ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {(form.sizes ?? []).map((s) => (
                    <SelectionChip key={s} label={s} onRemove={() => toggleSize(s)} />
                  ))}
                </div>
              )}
            </Field>
          </div>

          {/* Blouse details */}
          <Field label="Blouse Details (optional)">
            <input className={inputCls} style={inputStyle} value={form.blouseDetails || ""} onChange={(e) => set("blouseDetails", e.target.value)} placeholder="e.g. Deep V-neck embellished blouse included." />
          </Field>

          {/* Instagram */}
          <Field label="Instagram Reel/Post Link (optional)">
            <input
              className={inputCls}
              style={inputStyle}
              value={form.instagramUrl || ""}
              onChange={(e) => set("instagramUrl", e.target.value || undefined)}
              placeholder="https://www.instagram.com/reel/..."
            />
            <p className="mt-1.5 text-[10.5px]" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
              If set, this also appears as the product's video in the gallery — clicking it opens this reel on Instagram.
            </p>
          </Field>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t" style={{ borderColor: "rgba(199,161,91,0.15)" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-7 py-3 text-[10px] tracking-[0.22em] uppercase transition-all disabled:opacity-70"
              style={{ background: "#2A0710", color: "#C7A15B", fontFamily: "var(--font-body)" }}
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
            </button>
            <button
              onClick={onCancel}
              disabled={saving}
              className="px-6 py-3 border text-[10px] tracking-[0.22em] uppercase disabled:opacity-50"
              style={{ borderColor: "rgba(199,161,91,0.3)", color: "#7a6a5a", fontFamily: "var(--font-body)" }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Overview tab ──────────────────────────────────────────────────────────────
function CategoryBreakdownGroup({
  title, icon: Icon, slugs, products, maxCount,
}: {
  title: string; icon: typeof Shirt; slugs: CategorySlug[]; products: Product[]; maxCount: number;
}) {
  const total = products.filter((p) => slugs.includes(p.category)).length;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3.5">
        <Icon size={13} style={{ color: "#C7A15B" }} />
        <span className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "#2A0710", fontFamily: "var(--font-body)", fontWeight: 600 }}>{title}</span>
        <span className="text-[10px]" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>({total})</span>
      </div>
      <div className="space-y-3">
        {slugs.map((slug) => {
          const count = products.filter((p) => p.category === slug).length;
          return (
            <div key={slug} className="flex items-center gap-4">
              <div className="w-36 flex-shrink-0 text-[10.5px]" style={{ color: "#3a2a1a", fontFamily: "var(--font-body)" }}>{CATEGORY_META[slug].label}</div>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(199,161,91,0.12)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(count / maxCount) * 100}%`, background: "linear-gradient(to right, #2A0710, #C7A15B)" }}
                />
              </div>
              <div className="w-6 text-right text-[11px] font-medium" style={{ color: "#2A0710", fontFamily: "var(--font-body)" }}>{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Overview({ products }: { products: Product[] }) {
  const stats = [
    { label: "Total Products", value: products.length, icon: Package, color: "#2A0710" },
    { label: "New Arrivals",   value: products.filter((p) => p.tag === "New Arrival").length, icon: TrendingUp, color: "#C7A15B" },
    { label: "Tagged Pieces",  value: products.filter((p) => p.tag).length, icon: Tag, color: "#6D0010" },
    { label: "Categories",     value: CATEGORY_SLUGS.length, icon: Layers, color: "#00695C" },
  ];

  const maxCount = Math.max(...CATEGORY_SLUGS.map((slug) => products.filter((p) => p.category === slug).length), 1);

  return (
    <div className="p-8 space-y-8">
      <div>
        <p className="text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>Dashboard</p>
        <h2 style={{ fontFamily: "var(--font-display)", color: "#2A0710", fontSize: "1.8rem", fontWeight: 300 }}>Overview</h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="p-5 bg-white border transition-all duration-200 hover:-translate-y-0.5"
            style={{ borderColor: "rgba(199,161,91,0.15)", boxShadow: "0 2px 12px rgba(42,7,16,0.05)" }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-8 h-8 flex items-center justify-center border" style={{ borderColor: "rgba(199,161,91,0.25)" }}>
                <Icon size={14} style={{ color }} />
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "#2A0710", fontWeight: 300, lineHeight: 1 }}>{value}</div>
            <div className="text-[10px] tracking-[0.15em] uppercase mt-1" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Category breakdown, grouped by product family */}
      <div className="bg-white border p-6" style={{ borderColor: "rgba(199,161,91,0.15)" }}>
        <h3 className="text-[10px] tracking-[0.28em] uppercase mb-6" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>Products by Category</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CategoryBreakdownGroup title="Lehengas" icon={Shirt} slugs={LEHENGA_CATEGORIES} products={products} maxCount={maxCount} />
          <CategoryBreakdownGroup title="Sarees" icon={Scroll} slugs={SAREE_CATEGORIES} products={products} maxCount={maxCount} />
        </div>
      </div>

      {/* Recent products */}
      <div className="bg-white border p-6" style={{ borderColor: "rgba(199,161,91,0.15)" }}>
        <h3 className="text-[10px] tracking-[0.28em] uppercase mb-5" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>
          Recent Products ({Math.min(products.length, 5)})
        </h3>
        <div className="space-y-2">
          {[...products].reverse().slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center gap-4 py-2.5 border-b last:border-0" style={{ borderColor: "rgba(199,161,91,0.1)" }}>
              <img src={p.image} alt={p.name} className="w-10 h-12 object-cover object-top flex-shrink-0 bg-[#e8ddd5]" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#252525", fontFamily: "var(--font-display)" }}>{p.name}</p>
                <p className="text-[9.5px]" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>{CATEGORY_META[p.category].label}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold" style={{ color: "#2A0710", fontFamily: "var(--font-display)" }}>{p.price}</p>
                {p.tag && <CatBadge slug={p.category} />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Product grid card ──────────────────────────────────────────────────────────
function ProductGridCard({ product, onEdit, onDelete }: { product: Product; onEdit: () => void; onDelete: () => void }) {
  return (
    <div
      className="group relative bg-white border overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ borderColor: "rgba(199,161,91,0.18)" }}
    >
      <div className="relative overflow-hidden bg-[#e8ddd5]" style={{ aspectRatio: "3/4" }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        />
        {product.tag && (
          <div
            className="absolute top-2 left-2 px-2 py-0.5 text-[8.5px] tracking-[0.15em] uppercase"
            style={{ background: "#C7A15B", color: "#2A0710", fontFamily: "var(--font-body)" }}
          >
            {product.tag}
          </div>
        )}
        {/* Hover actions */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: "rgba(42,7,16,0.5)" }}
        >
          <button
            onClick={onEdit}
            className="w-9 h-9 flex items-center justify-center bg-white transition-colors hover:bg-[#C7A15B]"
            title="Edit"
          >
            <Pencil size={14} style={{ color: "#2A0710" }} />
          </button>
          <button
            onClick={onDelete}
            className="w-9 h-9 flex items-center justify-center bg-white transition-colors hover:bg-red-100"
            title="Delete"
          >
            <Trash2 size={14} style={{ color: "#9B1B30" }} />
          </button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate" style={{ color: "#252525", fontFamily: "var(--font-display)" }}>{product.name}</p>
        <p className="text-[10px] truncate mb-2" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>{product.fabric}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold flex-shrink-0" style={{ color: "#2A0710", fontFamily: "var(--font-display)" }}>{product.price}</p>
          <CatBadge slug={product.category} />
        </div>
      </div>
    </div>
  );
}

// ─── Products section (Lehengas / Sarees) ──────────────────────────────────────
interface ProductsSectionProps {
  title: string;
  subtitle: string;
  icon: typeof Shirt;
  categories: CategorySlug[];
  products: Product[];
  onEdit: (p: Product) => void;
  onDelete: (id: number) => Promise<boolean>;
  onAddNew: () => void;
}

function ProductsSection({ title, subtitle, icon: Icon, categories, products: allProducts, onEdit, onDelete, onAddNew }: ProductsSectionProps) {
  const [search, setSearch]           = useState("");
  const [catFilter, setCatFilter]     = useState<CategorySlug | "all">("all");
  const [view, setView]               = useState<"grid" | "table">("grid");
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const groupProducts = useMemo(() => allProducts.filter((p) => categories.includes(p.category)), [allProducts, categories]);

  const filtered = useMemo(() => {
    let list = groupProducts;
    if (catFilter !== "all") list = list.filter((p) => p.category === catFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.fabric.toLowerCase().includes(q) ||
        p.occasion.toLowerCase().includes(q)
      );
    }
    return list;
  }, [groupProducts, catFilter, search]);

  return (
    <div className="p-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 flex items-center justify-center flex-shrink-0" style={{ background: "rgba(199,161,91,0.12)" }}>
            <Icon size={19} style={{ color: "#C7A15B" }} />
          </div>
          <div>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>Manage</p>
            <h2 style={{ fontFamily: "var(--font-display)", color: "#2A0710", fontSize: "1.8rem", fontWeight: 300 }}>
              {title} <span style={{ color: "#C7A15B" }}>({filtered.length})</span>
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onAddNew}
          className="flex items-center gap-2 px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase flex-shrink-0 transition-all hover:opacity-90"
          style={{ background: "#2A0710", color: "#C7A15B", fontFamily: "var(--font-body)" }}
        >
          <PlusCircle size={13} /> Add {title.replace(/s$/, "")}
        </button>
      </div>

      {/* Search + filter + view toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#C7A15B" }} />
          <input
            className="w-full pl-9 pr-4 py-2.5 border outline-none text-sm transition-colors focus:border-[#C7A15B]"
            style={{ borderColor: "rgba(199,161,91,0.3)", background: "white", fontFamily: "var(--font-body)", color: "#252525" }}
            placeholder="Search by name, fabric, occasion…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            className="pl-3.5 pr-8 py-2.5 border outline-none text-[10.5px] tracking-[0.1em] appearance-none focus:border-[#C7A15B]"
            style={{ borderColor: "rgba(199,161,91,0.3)", background: "white", fontFamily: "var(--font-body)", color: "#3a2a1a" }}
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value as CategorySlug | "all")}
          >
            <option value="all">All {title}</option>
            {categories.map((s) => <option key={s} value={s}>{CATEGORY_META[s].label}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#C7A15B" }} />
        </div>
        {/* View toggle */}
        <div className="flex border flex-shrink-0" style={{ borderColor: "rgba(199,161,91,0.3)" }}>
          {([
            { id: "grid" as const, icon: LayoutGrid, label: "Grid view" },
            { id: "table" as const, icon: List, label: "Table view" },
          ]).map(({ id, icon: ViewIcon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              title={label}
              className="w-10 flex items-center justify-center transition-colors"
              style={{ background: view === id ? "#2A0710" : "white" }}
            >
              <ViewIcon size={14} style={{ color: view === id ? "#C7A15B" : "#7a6a5a" }} />
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center bg-white border" style={{ borderColor: "rgba(199,161,91,0.15)" }}>
          <Package size={28} className="mx-auto mb-3" style={{ color: "rgba(199,161,91,0.3)" }} />
          <p style={{ color: "#7a6a5a", fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 300 }}>No products found</p>
        </div>
      ) : view === "grid" ? (
        /* Grid view */
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductGridCard key={p.id} product={p} onEdit={() => onEdit(p)} onDelete={() => setDeleteTarget(p)} />
          ))}
        </div>
      ) : (
        /* Table view */
        <div className="overflow-x-auto" style={{ scrollbarWidth: "thin" }}>
          <div className="bg-white border min-w-[600px]" style={{ borderColor: "rgba(199,161,91,0.15)" }}>
            <div
              className="grid items-center px-4 py-3 border-b"
              style={{ gridTemplateColumns: "48px 1fr 160px 110px 80px 90px", borderColor: "rgba(199,161,91,0.15)", background: "#fdfaf7" }}
            >
              {["", "Product", "Category", "Price", "Tag", "Actions"].map((h) => (
                <span key={h} className="text-[9px] tracking-[0.25em] uppercase" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>{h}</span>
              ))}
            </div>

            {filtered.map((p) => (
              <div
                key={p.id}
                className="grid items-center px-4 py-3 border-b last:border-0 hover:bg-[#fdfaf7] transition-colors"
                style={{ gridTemplateColumns: "48px 1fr 160px 110px 80px 90px", borderColor: "rgba(199,161,91,0.1)" }}
              >
                <img src={p.image} alt={p.name} className="w-10 h-12 object-cover object-top flex-shrink-0 bg-[#e8ddd5]" />

                <div className="min-w-0 pr-4">
                  <p className="text-sm font-medium truncate" style={{ color: "#252525", fontFamily: "var(--font-display)" }}>{p.name}</p>
                  <p className="text-[10px] truncate" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>{p.fabric}</p>
                </div>

                <div><CatBadge slug={p.category} /></div>

                <p className="text-sm font-semibold" style={{ color: "#2A0710", fontFamily: "var(--font-display)" }}>{p.price}</p>

                <div>
                  {p.tag ? (
                    <span className="text-[9px] px-1.5 py-0.5 tracking-[0.1em]" style={{ background: "rgba(199,161,91,0.15)", color: "#2A0710", fontFamily: "var(--font-body)" }}>
                      {p.tag}
                    </span>
                  ) : (
                    <span style={{ color: "rgba(0,0,0,0.2)", fontSize: 12 }}>—</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="w-7 h-7 border flex items-center justify-center transition-all hover:border-[#C7A15B] hover:bg-[#2A0710] group"
                    style={{ borderColor: "rgba(199,161,91,0.3)" }}
                    title="Edit"
                  >
                    <Pencil size={11} className="group-hover:text-[#C7A15B]" style={{ color: "#7a6a5a" }} />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="w-7 h-7 border flex items-center justify-center transition-all hover:border-red-300 hover:bg-red-50 group"
                    style={{ borderColor: "rgba(199,161,91,0.3)" }}
                    title="Delete"
                  >
                    <Trash2 size={11} className="group-hover:text-red-500" style={{ color: "#7a6a5a" }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={async () => {
            const ok = await onDelete(deleteTarget.id);
            if (ok) setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Filters section (Colors / Sizes / Tags) ───────────────────────────────────
const FILTER_TYPE_META: Record<FilterType, { label: string; placeholder: string; hint: string }> = {
  color: { label: "Colours", placeholder: "e.g. Emerald Green", hint: "Used for the colour swatches shown on category filters and the product page." },
  size: { label: "Sizes", placeholder: "e.g. XXL or Blouse 44", hint: "Used for the size filter and the size picker on product pages." },
  tag: { label: "Tags", placeholder: "e.g. Trending", hint: "Shown as a badge on the product card and used for the \"New Arrivals\" filter." },
};

interface FilterRowProps {
  option: FilterOption;
  onSave: (opt: FilterOption) => Promise<boolean>;
  onDelete: (opt: FilterOption) => void;
}

function FilterRow({ option, onSave, onDelete }: FilterRowProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(option.value);
  const [hex, setHex] = useState(option.hex ?? "#C7A15B");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!value.trim()) return;
    setSaving(true);
    const ok = await onSave({ ...option, value: value.trim(), hex: option.type === "color" ? hex : option.hex });
    setSaving(false);
    if (ok) setEditing(false);
  }

  if (editing) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border" style={{ borderColor: "#C7A15B", background: "rgba(199,161,91,0.06)" }}>
        {option.type === "color" && (
          <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="w-7 h-7 flex-shrink-0 border-0 p-0" />
        )}
        <input
          autoFocus
          className="flex-1 min-w-0 px-2 py-1 border outline-none text-sm"
          style={{ borderColor: "rgba(199,161,91,0.3)", fontFamily: "var(--font-body)" }}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button onClick={handleSave} disabled={saving} className="w-7 h-7 flex items-center justify-center flex-shrink-0" style={{ background: "#2A0710" }} title="Save">
          {saving ? <Loader2 size={12} className="animate-spin" style={{ color: "#C7A15B" }} /> : <Check size={13} style={{ color: "#C7A15B" }} />}
        </button>
        <button onClick={() => { setEditing(false); setValue(option.value); setHex(option.hex ?? "#C7A15B"); }} className="w-7 h-7 flex items-center justify-center flex-shrink-0 border" style={{ borderColor: "rgba(199,161,91,0.3)" }} title="Cancel">
          <X size={12} style={{ color: "#7a6a5a" }} />
        </button>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-2.5 px-3 py-2 border transition-colors hover:bg-[#fdfaf7]" style={{ borderColor: "rgba(199,161,91,0.2)" }}>
      {option.type === "color" && (
        <span className="w-5 h-5 rounded-full flex-shrink-0 border" style={{ background: option.hex ?? "#C7A15B", borderColor: "rgba(0,0,0,0.15)" }} />
      )}
      <span className="flex-1 min-w-0 truncate text-sm" style={{ color: "#252525", fontFamily: "var(--font-body)" }}>{option.value}</span>
      <button onClick={() => setEditing(true)} className="w-7 h-7 flex items-center justify-center flex-shrink-0 border opacity-0 group-hover:opacity-100 transition-opacity" style={{ borderColor: "rgba(199,161,91,0.3)" }} title="Edit">
        <Pencil size={11} style={{ color: "#7a6a5a" }} />
      </button>
      <button onClick={() => onDelete(option)} className="w-7 h-7 flex items-center justify-center flex-shrink-0 border opacity-0 group-hover:opacity-100 transition-opacity hover:border-red-300 hover:bg-red-50" style={{ borderColor: "rgba(199,161,91,0.3)" }} title="Delete">
        <Trash2 size={11} style={{ color: "#7a6a5a" }} />
      </button>
    </div>
  );
}

interface FiltersSectionProps {
  filterOptions: FilterOption[];
  onAdd: (opt: Omit<FilterOption, "id">) => Promise<boolean>;
  onUpdate: (opt: FilterOption) => Promise<boolean>;
  onDelete: (opt: FilterOption) => Promise<boolean>;
}

function FiltersSection({ filterOptions, onAdd, onUpdate, onDelete }: FiltersSectionProps) {
  const [activeType, setActiveType] = useState<FilterType>("color");
  const [newValue, setNewValue] = useState("");
  const [newHex, setNewHex] = useState("#C7A15B");
  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FilterOption | null>(null);

  const items = filterOptions
    .filter((f) => f.type === activeType)
    .sort((a, b) => a.value.localeCompare(b.value));

  async function handleAdd() {
    if (!newValue.trim()) return;
    setAdding(true);
    const ok = await onAdd({ type: activeType, value: newValue.trim(), ...(activeType === "color" ? { hex: newHex } : {}) });
    setAdding(false);
    if (ok) { setNewValue(""); setNewHex("#C7A15B"); }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 flex items-center justify-center flex-shrink-0" style={{ background: "rgba(199,161,91,0.12)" }}>
          <SlidersHorizontal size={18} style={{ color: "#C7A15B" }} />
        </div>
        <div>
          <p className="text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>Manage</p>
          <h2 style={{ fontFamily: "var(--font-display)", color: "#2A0710", fontSize: "1.8rem", fontWeight: 300 }}>Filters</h2>
          <p className="text-xs mt-0.5" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
            The colour, size and tag values shown when adding a product and browsing the shop.
          </p>
        </div>
      </div>

      {/* Type pills */}
      <div className="flex gap-2 mb-6">
        {(Object.keys(FILTER_TYPE_META) as FilterType[]).map((t) => {
          const count = filterOptions.filter((f) => f.type === t).length;
          const active = activeType === t;
          return (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className="px-4 py-2 text-[10px] tracking-[0.18em] uppercase border transition-all"
              style={{
                fontFamily: "var(--font-body)",
                background: active ? "#2A0710" : "white",
                color: active ? "#C7A15B" : "#3a2a1a",
                borderColor: active ? "#2A0710" : "rgba(199,161,91,0.3)",
              }}
            >
              {FILTER_TYPE_META[t].label} ({count})
            </button>
          );
        })}
      </div>

      <p className="text-xs mb-4" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>{FILTER_TYPE_META[activeType].hint}</p>

      {/* Add new */}
      <div className="flex items-center gap-2 mb-5 p-3" style={{ background: "rgba(199,161,91,0.06)" }}>
        {activeType === "color" && (
          <input type="color" value={newHex} onChange={(e) => setNewHex(e.target.value)} className="w-9 h-9 flex-shrink-0 border-0 p-0" title="Swatch colour" />
        )}
        <input
          className={inputCls + " flex-1"}
          style={{ ...inputStyle, background: "white" }}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={FILTER_TYPE_META[activeType].placeholder}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newValue.trim()}
          className="flex items-center gap-2 px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase flex-shrink-0 transition-all disabled:opacity-50"
          style={{ background: "#2A0710", color: "#C7A15B", fontFamily: "var(--font-body)" }}
        >
          {adding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={13} />}
          Add
        </button>
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="py-14 text-center bg-white border" style={{ borderColor: "rgba(199,161,91,0.15)" }}>
          <SlidersHorizontal size={24} className="mx-auto mb-3" style={{ color: "rgba(199,161,91,0.3)" }} />
          <p style={{ color: "#7a6a5a", fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 300 }}>
            No {FILTER_TYPE_META[activeType].label.toLowerCase()} yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {items.map((opt) => (
            <FilterRow key={opt.id} option={opt} onSave={onUpdate} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal
          title={`Delete ${FILTER_TYPE_META[deleteTarget.type].label.replace(/s$/, "")}`}
          name={deleteTarget.value}
          onConfirm={async () => {
            const ok = await onDelete(deleteTarget);
            if (ok) setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

// ─── Home page section editors ─────────────────────────────────────────────────
const MAX_GALLERY_TILES = 12;
const MAX_SHOWN_PIECES = 24;
const CATEGORY_GROUPS: { label: string; slugs: CategorySlug[] }[] = [
  { label: "Lehengas", slugs: LEHENGA_CATEGORIES },
  { label: "Sarees", slugs: SAREE_CATEGORIES },
];

// Field-ordered key so "has anything changed?" never depends on object key order.
function sectionSnapshot(s: HomeSection): string {
  return JSON.stringify([s.visible, s.eyebrow, s.title, s.subtitle, s.mode, s.maxItems, s.categories, s.productIds, s.images, s.handle]);
}

function SectionEditorIntro({ title, description, visible, onVisibleChange }: {
  title: string; description: string; visible: boolean; onVisibleChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
      <div>
        <p className="text-[9px] tracking-[0.3em] uppercase mb-1" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>Home Page</p>
        <h2 style={{ fontFamily: "var(--font-display)", color: "#2A0710", fontSize: "1.8rem", fontWeight: 300 }}>{title}</h2>
        <p className="text-xs mt-1 max-w-xl" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>{description}</p>
      </div>
      <button
        onClick={() => onVisibleChange(!visible)}
        className="flex items-center gap-3 px-4 py-2.5 border transition-colors flex-shrink-0"
        style={{ borderColor: visible ? "#C7A15B" : "rgba(199,161,91,0.3)", background: visible ? "rgba(199,161,91,0.08)" : "white" }}
      >
        <span className="relative inline-block w-9 h-5 rounded-full transition-colors" style={{ background: visible ? "#2A0710" : "#d6cfc6" }}>
          <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all" style={{ left: visible ? 18 : 2 }} />
        </span>
        <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "#2A0710", fontFamily: "var(--font-body)" }}>
          {visible ? "Shown on site" : "Hidden from site"}
        </span>
      </button>
    </div>
  );
}

function Panel({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white border p-6" style={{ borderColor: "rgba(199,161,91,0.2)" }}>
      <div className="flex items-center gap-3 mb-5">
        <span className="w-6 h-6 flex items-center justify-center text-[10px] flex-shrink-0" style={{ background: "#2A0710", color: "#C7A15B" }}>{step}</span>
        <h3 className="text-[10px] tracking-[0.22em] uppercase" style={{ color: "#2A0710", fontFamily: "var(--font-body)" }}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-2 text-[10px] tracking-[0.12em] uppercase border transition-all"
      style={{
        fontFamily: "var(--font-body)",
        background: active ? "#2A0710" : "white",
        color: active ? "#C7A15B" : "#3a2a1a",
        borderColor: active ? "#2A0710" : "rgba(199,161,91,0.3)",
      }}
    >
      {children}
    </button>
  );
}

function CountStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const clamp = (n: number) => Math.min(MAX_SHOWN_PIECES, Math.max(1, n));
  return (
    <div className="inline-flex items-stretch border" style={{ borderColor: "rgba(199,161,91,0.3)" }}>
      <button onClick={() => onChange(clamp(value - 1))} className="w-10 flex items-center justify-center transition-colors hover:bg-[rgba(199,161,91,0.1)]" aria-label="Show fewer">
        <Minus size={14} style={{ color: "#2A0710" }} />
      </button>
      <span className="w-14 flex items-center justify-center text-lg" style={{ fontFamily: "var(--font-display)", color: "#2A0710", borderLeft: "1px solid rgba(199,161,91,0.3)", borderRight: "1px solid rgba(199,161,91,0.3)" }}>
        {value}
      </span>
      <button onClick={() => onChange(clamp(value + 1))} className="w-10 flex items-center justify-center transition-colors hover:bg-[rgba(199,161,91,0.1)]" aria-label="Show more">
        <Plus size={14} style={{ color: "#2A0710" }} />
      </button>
    </div>
  );
}

function SectionSaveBar({ dirty, saving, onSave, onDiscard }: {
  dirty: boolean; saving: boolean; onSave: () => void; onDiscard: () => void;
}) {
  return (
    <div className="sticky bottom-0 mt-8 py-4 flex items-center justify-between gap-4 border-t" style={{ background: "#F8F4EF", borderColor: "rgba(199,161,91,0.2)" }}>
      <p className="text-xs" style={{ color: dirty ? "#a0522d" : "#7a6a5a", fontFamily: "var(--font-body)" }}>
        {dirty ? "You have unsaved changes." : "All changes are saved."}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onDiscard}
          disabled={!dirty || saving}
          className="px-4 py-2.5 text-[10px] tracking-[0.2em] uppercase border transition-all disabled:opacity-40"
          style={{ borderColor: "rgba(199,161,91,0.3)", color: "#3a2a1a", fontFamily: "var(--font-body)" }}
        >
          Discard
        </button>
        <button
          onClick={onSave}
          disabled={!dirty || saving}
          className="flex items-center gap-2 px-5 py-2.5 text-[10px] tracking-[0.2em] uppercase transition-all disabled:opacity-40"
          style={{ background: "#2A0710", color: "#C7A15B", fontFamily: "var(--font-body)" }}
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
          Save section
        </button>
      </div>
    </div>
  );
}

interface ProductSectionEditorProps {
  section: HomeSection;
  products: Product[];
  autoRuleLabel: string;
  isAuto: (p: Product) => boolean;
  onSave: (s: HomeSection) => Promise<boolean>;
}

function ProductSectionEditor({ section, products, autoRuleLabel, isAuto, onSave }: ProductSectionEditorProps) {
  const [draft, setDraft]   = useState<HomeSection>(section);
  const [saving, setSaving] = useState(false);
  const [tab, setTab]       = useState<CategorySlug | "all">("all");
  const [search, setSearch] = useState("");
  const dirty = sectionSnapshot(draft) !== sectionSnapshot(section);

  function set<K extends keyof HomeSection>(key: K, value: HomeSection[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  const picked = draft.productIds.flatMap((id) => {
    const product = products.find((p) => p.id === id);
    return product ? [product] : [];
  });
  const autoMatches = products.filter(
    (p) => isAuto(p) && (draft.categories.length === 0 || draft.categories.includes(p.category))
  );
  const shownCount = Math.min(draft.maxItems, draft.mode === "manual" ? picked.length : autoMatches.length);
  const statusText = !draft.visible
    ? "Hidden from the home page. Turn it back on with the switch above."
    : shownCount === 0
      ? "No pieces match yet, so the section will not appear on the site."
      : `Showing ${shownCount} piece${shownCount === 1 ? "" : "s"} on the home page.`;

  const query = search.trim().toLowerCase();
  const tabProducts = products.filter((p) => tab === "all" || p.category === tab);
  const visibleProducts = tabProducts.filter((p) => !query || p.name.toLowerCase().includes(query));

  function countFor(slug: CategorySlug) {
    return products.filter((p) => p.category === slug).length;
  }

  function togglePick(id: number) {
    set("productIds", draft.productIds.includes(id)
      ? draft.productIds.filter((x) => x !== id)
      : [...draft.productIds, id]);
  }

  function addAllInTab() {
    const ids = tabProducts.map((p) => p.id).filter((id) => !draft.productIds.includes(id));
    set("productIds", [...draft.productIds, ...ids]);
  }

  function movePick(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= draft.productIds.length) return;
    const ids = [...draft.productIds];
    [ids[index], ids[target]] = [ids[target], ids[index]];
    set("productIds", ids);
  }

  function toggleCategory(slug: CategorySlug) {
    set("categories", draft.categories.includes(slug)
      ? draft.categories.filter((c) => c !== slug)
      : [...draft.categories, slug]);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  }

  return (
    <div className="p-8 max-w-5xl">
      <SectionEditorIntro
        title={section.title}
        description={statusText}
        visible={draft.visible}
        onVisibleChange={(v) => set("visible", v)}
      />

      <div className="space-y-5">
        <Panel step="1" title="Wording">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Small label">
              <input className={inputCls} style={inputStyle} value={draft.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
            </Field>
            <Field label="Heading">
              <input className={inputCls} style={inputStyle} value={draft.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
          </div>
          <div className="mt-5">
            <Field label="Description">
              <textarea rows={2} className={inputCls + " resize-none"} style={inputStyle} value={draft.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
            </Field>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setDraft((d) => ({ ...d, eyebrow: DEFAULT_HOME_SECTIONS[section.id].eyebrow, title: DEFAULT_HOME_SECTIONS[section.id].title, subtitle: DEFAULT_HOME_SECTIONS[section.id].subtitle }))}
              className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase"
              style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
            >
              <RotateCcw size={11} /> Restore original wording
            </button>
          </div>
        </Panel>

        <Panel step="2" title="Which pieces show">
          <div className="inline-flex border" style={{ borderColor: "rgba(199,161,91,0.3)" }}>
            {([
              { value: "auto", label: "Automatic" },
              { value: "manual", label: "Hand-picked" },
            ] as const).map((option) => {
              const active = draft.mode === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => set("mode", option.value)}
                  className="px-5 py-2.5 text-[10px] tracking-[0.18em] uppercase transition-all"
                  style={{ background: active ? "#2A0710" : "white", color: active ? "#C7A15B" : "#3a2a1a", fontFamily: "var(--font-body)" }}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {draft.mode === "auto" ? (
            <div className="mt-5">
              <p className="text-xs mb-3" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
                Automatically shows {autoRuleLabel}. Choose categories to narrow it down; with none selected, every category is included.
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_SLUGS.map((slug) => (
                  <FilterPill key={slug} active={draft.categories.includes(slug)} onClick={() => toggleCategory(slug)}>
                    {CATEGORY_META[slug].label}
                  </FilterPill>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
              Only the pieces you pick below appear, in the order you arrange them.
            </p>
          )}
        </Panel>

        <Panel step="3" title="How many show">
          <div className="flex items-center gap-5 flex-wrap">
            <CountStepper value={draft.maxItems} onChange={(n) => set("maxItems", n)} />
            <p className="text-xs" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
              pieces at most. {draft.mode === "manual" && picked.length > draft.maxItems
                ? `You have picked ${picked.length}, so the last ${picked.length - draft.maxItems} are kept but hidden.`
                : "Extra pieces are not shown on the site."}
            </p>
          </div>
        </Panel>

        {draft.mode === "manual" && (
          <>
            <Panel step="4" title="Choose pieces by category">
              <div className="flex flex-wrap items-center gap-2">
                <FilterPill active={tab === "all"} onClick={() => setTab("all")}>All ({products.length})</FilterPill>
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.label} className="flex flex-wrap items-center gap-2 ml-2">
                    <span className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>{group.label}</span>
                    {group.slugs.map((slug) => (
                      <FilterPill key={slug} active={tab === slug} onClick={() => setTab(slug)}>
                        {CATEGORY_META[slug].label} ({countFor(slug)})
                      </FilterPill>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <input
                  className={inputCls + " flex-1 min-w-[200px]"}
                  style={{ ...inputStyle, background: "white" }}
                  placeholder="Search by name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  onClick={addAllInTab}
                  disabled={tabProducts.length === 0}
                  className="px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase border transition-all disabled:opacity-40"
                  style={{ borderColor: "#C7A15B", color: "#2A0710", fontFamily: "var(--font-body)" }}
                >
                  Add all {tab === "all" ? "products" : CATEGORY_META[tab].label}
                </button>
                <button
                  onClick={() => set("productIds", [])}
                  disabled={draft.productIds.length === 0}
                  className="px-4 py-2.5 text-[10px] tracking-[0.15em] uppercase border transition-all disabled:opacity-40"
                  style={{ borderColor: "rgba(199,161,91,0.3)", color: "#7a6a5a", fontFamily: "var(--font-body)" }}
                >
                  Clear picks
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {visibleProducts.map((p) => {
                  const position = draft.productIds.indexOf(p.id);
                  const on = position !== -1;
                  return (
                    <button
                      key={p.id}
                      onClick={() => togglePick(p.id)}
                      className="text-left border transition-colors"
                      style={{ borderColor: on ? "#C7A15B" : "rgba(199,161,91,0.2)", background: on ? "rgba(199,161,91,0.08)" : "white" }}
                    >
                      <div className="aspect-[4/5] relative overflow-hidden bg-[#e0d5cc]">
                        {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                        {on && (
                          <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold" style={{ background: "#2A0710", color: "#C7A15B" }}>
                            #{position + 1}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs truncate" style={{ color: "#2A0710", fontFamily: "var(--font-body)" }}>{p.name || "Untitled"}</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="text-[10px] truncate" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
                            {CATEGORY_META[p.category]?.label}
                          </span>
                          <span className="text-[9.5px] tracking-[0.12em] uppercase flex-shrink-0" style={{ color: on ? "#a0522d" : "#C7A15B", fontFamily: "var(--font-body)" }}>
                            {on ? "Remove" : "Add"}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
                {visibleProducts.length === 0 && (
                  <p className="col-span-full py-10 text-center text-xs" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>No products match.</p>
                )}
              </div>
            </Panel>

            <Panel step="5" title={`Display order (${picked.length} picked)`}>
              {picked.length === 0 ? (
                <p className="text-xs" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>Nothing picked yet. Choose pieces above.</p>
              ) : (
                <div className="space-y-2">
                  {picked.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-2 border bg-[#fdfaf7]" style={{ borderColor: "rgba(199,161,91,0.2)", opacity: i < draft.maxItems ? 1 : 0.5 }}>
                      <span className="w-6 text-center text-sm flex-shrink-0" style={{ fontFamily: "var(--font-display)", color: "#C7A15B" }}>{i + 1}</span>
                      <div className="w-9 h-11 flex-shrink-0 overflow-hidden bg-[#e0d5cc]">
                        {p.image && <img src={p.image} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs truncate" style={{ color: "#2A0710", fontFamily: "var(--font-body)" }}>{p.name || "Untitled"}</p>
                        <p className="text-[10px] truncate" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
                          {CATEGORY_META[p.category]?.label}{i >= draft.maxItems ? " · hidden on site (over the limit)" : ""}
                        </p>
                      </div>
                      <button onClick={() => movePick(i, -1)} disabled={i === 0} className="p-2 transition-colors hover:bg-[rgba(199,161,91,0.12)] disabled:opacity-30" aria-label="Move up">
                        <ArrowUp size={14} style={{ color: "#2A0710" }} />
                      </button>
                      <button onClick={() => movePick(i, 1)} disabled={i === picked.length - 1} className="p-2 transition-colors hover:bg-[rgba(199,161,91,0.12)] disabled:opacity-30" aria-label="Move down">
                        <ArrowDown size={14} style={{ color: "#2A0710" }} />
                      </button>
                      <button onClick={() => togglePick(p.id)} className="p-2 transition-colors hover:bg-red-50" aria-label="Remove">
                        <X size={14} style={{ color: "#a33" }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </>
        )}
      </div>

      <SectionSaveBar
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onDiscard={() => setDraft(section)}
      />
    </div>
  );
}

interface GalleryEditorProps {
  section: HomeSection;
  onSave: (s: HomeSection) => Promise<boolean>;
}

function GalleryEditor({ section, onSave }: GalleryEditorProps) {
  const [draft, setDraft]   = useState<HomeSection>(section);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy]     = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const fileInputRef        = useRef<HTMLInputElement>(null);
  const replaceAtRef        = useRef<number | null>(null);
  const dirty = sectionSnapshot(draft) !== sectionSnapshot(section);

  function set<K extends keyof HomeSection>(key: K, value: HomeSection[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function openPicker(replaceAt: number | null) {
    replaceAtRef.current = replaceAt;
    fileInputRef.current?.click();
  }

  async function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/"));
    e.target.value = "";
    const replaceAt = replaceAtRef.current;
    replaceAtRef.current = null;
    if (files.length === 0) return;

    setBusy(true);
    setError(null);
    try {
      const srcs = await Promise.all(files.map((f) => compressImageFile(f)));
      setDraft((d) => {
        if (replaceAt !== null) {
          return { ...d, images: d.images.map((img, i) => (i === replaceAt ? { ...img, src: srcs[0] } : img)) };
        }
        const room = MAX_GALLERY_TILES - d.images.length;
        return { ...d, images: [...d.images, ...srcs.slice(0, room).map((src) => ({ src, alt: "" }))] };
      });
    } catch {
      setError("One of those photos could not be read. Try a different file.");
    } finally {
      setBusy(false);
    }
  }

  function moveTile(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= draft.images.length) return;
    const images = [...draft.images];
    [images[index], images[target]] = [images[target], images[index]];
    set("images", images);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  }

  return (
    <div className="p-8 max-w-5xl">
      <SectionEditorIntro
        title={section.title}
        description="The Instagram-style photo grid near the bottom of the home page. Upload, replace, reorder or remove tiles."
        visible={draft.visible}
        onVisibleChange={(v) => set("visible", v)}
      />

      <div className="space-y-5">
        <Panel step="1" title="Wording">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field label="Small label">
              <input className={inputCls} style={inputStyle} value={draft.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
            </Field>
            <Field label="Heading">
              <input className={inputCls} style={inputStyle} value={draft.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Instagram handle">
              <input className={inputCls} style={inputStyle} value={draft.handle} onChange={(e) => set("handle", e.target.value)} placeholder="@yourhandle" />
            </Field>
          </div>
        </Panel>

        <Panel step="2" title={`Photos (${draft.images.length} of ${MAX_GALLERY_TILES})`}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {draft.images.map((img, i) => (
              <div key={i} className="border bg-[#fdfaf7]" style={{ borderColor: "rgba(199,161,91,0.2)" }}>
                <div className="aspect-[4/3] overflow-hidden bg-[#e0d5cc] relative">
                  <img src={img.src} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold" style={{ background: "#2A0710", color: "#C7A15B" }}>{i + 1}</span>
                </div>
                <div className="flex items-center justify-between px-1.5 py-1">
                  <div className="flex">
                    <button onClick={() => moveTile(i, -1)} disabled={busy || i === 0} title="Move left" className="p-1.5 transition-colors hover:bg-[rgba(199,161,91,0.12)] disabled:opacity-30">
                      <ChevronLeft size={14} style={{ color: "#2A0710" }} />
                    </button>
                    <button onClick={() => moveTile(i, 1)} disabled={busy || i === draft.images.length - 1} title="Move right" className="p-1.5 transition-colors hover:bg-[rgba(199,161,91,0.12)] disabled:opacity-30">
                      <ChevronRight size={14} style={{ color: "#2A0710" }} />
                    </button>
                  </div>
                  <div className="flex">
                    <button onClick={() => openPicker(i)} disabled={busy} title="Replace photo" className="p-1.5 transition-colors hover:bg-[rgba(199,161,91,0.12)] disabled:opacity-40">
                      <Upload size={13} style={{ color: "#2A0710" }} />
                    </button>
                    <button onClick={() => set("images", draft.images.filter((_, j) => j !== i))} disabled={busy} title="Remove tile" className="p-1.5 transition-colors hover:bg-red-50 disabled:opacity-40">
                      <Trash2 size={13} style={{ color: "#a33" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {draft.images.length < MAX_GALLERY_TILES && (
              <button
                onClick={() => openPicker(null)}
                disabled={busy}
                className="aspect-[4/3] border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors hover:bg-white disabled:opacity-60"
                style={{ borderColor: "rgba(199,161,91,0.4)", color: "#7a6a5a" }}
              >
                {busy ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                <span className="text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-body)" }}>Add photos</span>
              </button>
            )}
          </div>

          {error && <p className="mt-4 text-xs" style={{ color: "#a33", fontFamily: "var(--font-body)" }}>{error}</p>}
          <p className="mt-4 text-[11px]" style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}>
            Tiles show left to right in this order. Every third tile is taller on desktop.
          </p>
        </Panel>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePick} />

      <SectionSaveBar
        dirty={dirty && !busy}
        saving={saving || busy}
        onSave={handleSave}
        onDiscard={() => setDraft(section)}
      />
    </div>
  );
}

// ─── Login gate ────────────────────────────────────────────────────────────────
function LoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw]         = useState("");
  const [error, setError]   = useState(false);
  const [visible, setVisible] = useState(false);

  function attempt() {
    if (pw === ADMIN_PASSWORD) { onSuccess(); }
    else { setError(true); setPw(""); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#2A0710" }}>
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 border mb-5" style={{ borderColor: "rgba(199,161,91,0.4)" }}>
            <ShoppingBag size={22} style={{ color: "#C7A15B" }} />
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", color: "#F8F4EF", fontSize: "1.8rem", fontWeight: 300 }}>Admin Panel</h1>
          <p className="text-[10px] tracking-[0.28em] uppercase mt-2" style={{ color: "rgba(199,161,91,0.55)", fontFamily: "var(--font-body)" }}>MATWALJI Sarees</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[9.5px] tracking-[0.2em] uppercase mb-2" style={{ color: "rgba(199,161,91,0.6)", fontFamily: "var(--font-body)" }}>
              Password
            </label>
            <div className="relative">
              <input
                type={visible ? "text" : "password"}
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(false); }}
                onKeyDown={(e) => e.key === "Enter" && attempt()}
                className="w-full px-4 py-3.5 pr-10 border outline-none text-sm transition-colors"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  borderColor: error ? "#9B1B30" : "rgba(199,161,91,0.25)",
                  color: "#F8F4EF",
                  fontFamily: "var(--font-body)",
                }}
                placeholder="Enter admin password"
                autoFocus
              />
              <button
                onClick={() => setVisible((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] tracking-widest"
                style={{ color: "rgba(199,161,91,0.4)", fontFamily: "var(--font-body)" }}
                title={visible ? "Hide password" : "Show password"}
              >
                {visible ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {error && <p className="text-[10px] mt-1.5" style={{ color: "#e57373", fontFamily: "var(--font-body)" }}>Incorrect password. Please try again.</p>}
          </div>

          <button
            onClick={attempt}
            className="w-full py-3.5 text-[10.5px] tracking-[0.25em] uppercase flex items-center justify-center gap-2 transition-all"
            style={{ background: "#C7A15B", color: "#2A0710", fontFamily: "var(--font-body)", fontWeight: 700 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#E8D2A6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#C7A15B"; }}
          >
            Sign In <ArrowUpRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin Page ────────────────────────────────────────────────────────────────
type AdminTab = "overview" | "lehengas" | "sarees" | "filters" | "home-featured" | "home-new-arrivals" | "home-capture-moments" | "add";

interface AdminPageProps {
  products: Product[];
  onAdd: (p: Product) => Promise<SaveResult>;
  onUpdate: (p: Product) => Promise<SaveResult>;
  onDelete: (id: number) => Promise<boolean>;
  filterOptions: FilterOption[];
  onAddFilter: (opt: Omit<FilterOption, "id">) => Promise<boolean>;
  onUpdateFilter: (opt: FilterOption) => Promise<boolean>;
  onDeleteFilter: (id: string) => Promise<boolean>;
  homeSections: Record<HomeSectionId, HomeSection>;
  onUpdateHomeSection: (s: HomeSection) => Promise<SaveResult>;
  onExit: () => void;
}

export default function AdminPage({
  products, onAdd, onUpdate, onDelete,
  filterOptions, onAddFilter, onUpdateFilter, onDeleteFilter,
  homeSections, onUpdateHomeSection,
  onExit,
}: AdminPageProps) {
  const [authed, setAuthed]         = useState(false);
  const [tab, setTab]               = useState<AdminTab>("overview");
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [newCategoryHint, setNewCategoryHint] = useState<CategorySlug | undefined>(undefined);
  // Which section (Lehengas/Sarees) to return to once the add/edit form is done.
  const [returnTab, setReturnTab]   = useState<"lehengas" | "sarees">("lehengas");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast]           = useState<ToastState | null>(null);

  if (!authed) return <LoginGate onSuccess={() => setAuthed(true)} />;

  function handleEdit(p: Product) {
    setEditTarget(p);
    setReturnTab(LEHENGA_CATEGORIES.includes(p.category) ? "lehengas" : "sarees");
    setTab("add");
  }

  function handleAddNew(section: "lehengas" | "sarees", defaultCategory: CategorySlug) {
    setEditTarget(null);
    setNewCategoryHint(defaultCategory);
    setReturnTab(section);
    setTab("add");
  }

  async function handleSave(p: Product): Promise<boolean> {
    const wasEdit = !!editTarget;
    const result = wasEdit ? await onUpdate(p) : await onAdd(p);
    if (result.ok) {
      setEditTarget(null);
      setTab(returnTab);
      setToast({ type: "success", message: wasEdit ? `"${p.name}" was updated.` : `"${p.name}" was added to the catalogue.` });
    } else {
      setToast({ type: "error", message: result.error ?? "Could not save this product. Please check your connection and try again." });
    }
    return result.ok;
  }

  async function handleDelete(id: number): Promise<boolean> {
    const target = products.find((p) => p.id === id);
    const ok = await onDelete(id);
    setToast(
      ok
        ? { type: "success", message: `"${target?.name ?? "Product"}" was deleted.` }
        : { type: "error", message: "Could not delete this product. Please try again." }
    );
    return ok;
  }

  function handleCancelForm() {
    setEditTarget(null);
    setTab(returnTab);
  }

  async function handleAddFilter(opt: Omit<FilterOption, "id">): Promise<boolean> {
    const ok = await onAddFilter(opt);
    setToast(
      ok
        ? { type: "success", message: `"${opt.value}" added.` }
        : { type: "error", message: `Could not add "${opt.value}". It may already exist.` }
    );
    return ok;
  }

  async function handleUpdateFilter(opt: FilterOption): Promise<boolean> {
    const ok = await onUpdateFilter(opt);
    setToast(
      ok
        ? { type: "success", message: `"${opt.value}" updated.` }
        : { type: "error", message: "Could not save this change." }
    );
    return ok;
  }

  async function handleSaveHomeSection(section: HomeSection): Promise<boolean> {
    const result = await onUpdateHomeSection(section);
    setToast(
      result.ok
        ? { type: "success", message: `"${section.title}" section was saved.` }
        : { type: "error", message: result.error ?? "Could not save this section. Please try again." }
    );
    return result.ok;
  }

  async function handleDeleteFilter(opt: FilterOption): Promise<boolean> {
    const ok = await onDeleteFilter(opt.id);
    setToast(
      ok
        ? { type: "success", message: `"${opt.value}" deleted.` }
        : { type: "error", message: "Could not delete this value." }
    );
    return ok;
  }

  const lehengaCount = products.filter((p) => LEHENGA_CATEGORIES.includes(p.category)).length;
  const sareeCount   = products.filter((p) => SAREE_CATEGORIES.includes(p.category)).length;

  const NAV_ITEMS = [
    { id: "overview" as AdminTab, label: "Overview", icon: LayoutDashboard, count: undefined as number | undefined },
    { id: "lehengas"  as AdminTab, label: "Lehengas", icon: Shirt,  count: lehengaCount },
    { id: "sarees"    as AdminTab, label: "Sarees",   icon: Scroll, count: sareeCount },
    { id: "filters"   as AdminTab, label: "Filters",  icon: SlidersHorizontal, count: filterOptions.length },
    { id: "home-featured" as AdminTab, label: "Featured Pieces", icon: Star, count: undefined as number | undefined },
    { id: "home-new-arrivals" as AdminTab, label: "New Arrivals", icon: Sparkles, count: undefined as number | undefined },
    { id: "home-capture-moments" as AdminTab, label: "Capture Moments", icon: Instagram, count: undefined as number | undefined },
    { id: "add"       as AdminTab, label: "Add Product", icon: PlusCircle, count: undefined as number | undefined },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F8F4EF", fontFamily: "var(--font-body)" }}>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-56 flex-shrink-0 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        style={{ background: "#2A0710", borderRight: "1px solid rgba(199,161,91,0.15)" }}
      >
        {/* Brand */}
        <div className="px-5 py-6 border-b" style={{ borderColor: "rgba(199,161,91,0.12)" }}>
          <MatwaljiLogo size="lg" />
          <p className="text-[8.5px] tracking-[0.28em] uppercase mt-2" style={{ color: "rgba(199,161,91,0.45)", fontFamily: "var(--font-body)" }}>Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon, count }) => {
            const active = id === "add" ? tab === "add" && !editTarget : tab === id;
            return (
              <Fragment key={id}>
                {id === "home-featured" && (
                  <p className="px-3 pt-4 pb-1 text-[8.5px] tracking-[0.28em] uppercase" style={{ color: "rgba(199,161,91,0.45)", fontFamily: "var(--font-body)" }}>
                    Home Page
                  </p>
                )}
                <button
                  onClick={() => {
                    setTab(id);
                    if (id !== "add") setEditTarget(null);
                    if (id === "add") { setNewCategoryHint(undefined); }
                  }}
                  className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left transition-all duration-150"
                  style={{
                    background: active ? "rgba(199,161,91,0.12)" : "transparent",
                    borderLeft: active ? "2px solid #C7A15B" : "2px solid transparent",
                  }}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={15} style={{ color: active ? "#C7A15B" : "rgba(199,161,91,0.45)" }} />
                    <span className="text-[10.5px] tracking-[0.12em] uppercase" style={{ color: active ? "#C7A15B" : "rgba(232,210,166,0.6)", fontFamily: "var(--font-body)" }}>
                      {label}
                    </span>
                  </span>
                  {count !== undefined && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        background: active ? "rgba(199,161,91,0.25)" : "rgba(232,210,166,0.1)",
                        color: active ? "#C7A15B" : "rgba(232,210,166,0.5)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              </Fragment>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: "rgba(199,161,91,0.12)" }}>
          <button
            onClick={onExit}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all hover:bg-white/5"
          >
            <Eye size={15} style={{ color: "rgba(199,161,91,0.45)" }} />
            <span className="text-[10.5px] tracking-[0.12em] uppercase" style={{ color: "rgba(232,210,166,0.6)", fontFamily: "var(--font-body)" }}>View Site</span>
          </button>
          <button
            onClick={() => setAuthed(false)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-all hover:bg-white/5"
          >
            <LogOut size={15} style={{ color: "rgba(199,161,91,0.45)" }} />
            <span className="text-[10.5px] tracking-[0.12em] uppercase" style={{ color: "rgba(232,210,166,0.6)", fontFamily: "var(--font-body)" }}>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b" style={{ background: "#2A0710", borderColor: "rgba(199,161,91,0.15)" }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: "#C7A15B" }}>
            <Menu size={20} />
          </button>
          <span className="text-[11px] tracking-widest uppercase" style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}>Admin Panel</span>
        </div>
        {tab === "overview" && <Overview products={products} />}
        {tab === "lehengas" && !editTarget && (
          <ProductsSection
            title="Lehengas"
            subtitle="Bridal and non-bridal lehenga collections"
            icon={Shirt}
            categories={LEHENGA_CATEGORIES}
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={() => handleAddNew("lehengas", LEHENGA_CATEGORIES[0])}
          />
        )}
        {tab === "sarees" && !editTarget && (
          <ProductsSection
            title="Sarees"
            subtitle="Silk, Banarasi, Net and Premium saree collections"
            icon={Scroll}
            categories={SAREE_CATEGORIES}
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddNew={() => handleAddNew("sarees", SAREE_CATEGORIES[0])}
          />
        )}
        {tab === "filters" && !editTarget && (
          <FiltersSection
            filterOptions={filterOptions}
            onAdd={handleAddFilter}
            onUpdate={handleUpdateFilter}
            onDelete={handleDeleteFilter}
          />
        )}
        {tab === "home-featured" && (
          <ProductSectionEditor
            key="home-featured"
            section={homeSections.featured}
            products={products}
            autoRuleLabel="every piece that carries a tag such as Bestseller or Heritage"
            isAuto={(p) => !!p.tag}
            onSave={handleSaveHomeSection}
          />
        )}
        {tab === "home-new-arrivals" && (
          <ProductSectionEditor
            key="home-new-arrivals"
            section={homeSections["new-arrivals"]}
            products={products}
            autoRuleLabel='every piece tagged "New Arrival"'
            isAuto={(p) => p.tag === "New Arrival"}
            onSave={handleSaveHomeSection}
          />
        )}
        {tab === "home-capture-moments" && (
          <GalleryEditor
            key="home-capture-moments"
            section={homeSections["capture-moments"]}
            onSave={handleSaveHomeSection}
          />
        )}
        {(tab === "add" || editTarget) && (
          <ProductForm
            initial={editTarget ?? blankProduct(products.map((p) => p.id), newCategoryHint)}
            filterOptions={filterOptions}
            onSave={handleSave}
            onCancel={handleCancelForm}
            isEdit={!!editTarget}
          />
        )}
      </main>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
