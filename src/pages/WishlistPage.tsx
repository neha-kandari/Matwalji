import { useState } from "react";
import { Heart, Send } from "lucide-react";
import GoldDivider from "../components/GoldDivider";
import { CATEGORY_META } from "../data/categories";
import { SOCIAL_LINKS } from "../data/social";
import type { Page, Product } from "../types";

interface Props {
  wishlist: Product[];
  onRemove: (id: number) => void;
  setPage: (p: Page) => void;
}

export default function WishlistPage({ wishlist, onRemove, setPage }: Props) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function buildWhatsAppMessage(): string {
    const lines = [
      "Hi MATWALJI! I'd like to enquire about these pieces from my wishlist:",
      "",
      ...wishlist.map((item, i) => `${i + 1}. ${item.name} – ${item.price}`),
      "",
      `Name: ${form.name}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email}`,
    ];
    if (form.city) lines.push(`City: ${form.city}`);
    if (form.message) lines.push(`Special Requirements: ${form.message}`);
    return lines.join("\n");
  }

  function handleSubmit() {
    if (!(form.name && form.phone && form.email)) return;
    window.open(`${SOCIAL_LINKS.whatsapp}?text=${encodeURIComponent(buildWhatsAppMessage())}`, "_blank");
    setSubmitted(true);
  }

  // ── Confirmation screen ──────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="pt-[70px] min-h-screen flex items-center justify-center"
        style={{ background: "#F8F4EF" }}
      >
        <div className="text-center max-w-md px-6">
          <div
            className="inline-flex items-center justify-center w-16 h-16 border-2 mb-6"
            style={{ borderColor: "#C7A15B" }}
          >
            <Heart size={28} fill="#C7A15B" style={{ color: "#C7A15B" }} />
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.8rem",
              color: "#2A0710",
              fontWeight: 300,
            }}
          >
            Enquiry Received
          </h2>
          <GoldDivider className="my-5" />
          <p
            className="mb-8 text-sm leading-relaxed"
            style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
          >
            Thank you, <strong>{form.name}</strong>. We've opened WhatsApp with your selection —
            just hit send there and our style consultant will get back to you within 24 hours.
          </p>
          <button
            onClick={() => setPage("home")}
            className="px-8 py-3.5 text-[11px] tracking-[0.22em] uppercase"
            style={{ background: "#2A0710", color: "#C7A15B", fontFamily: "var(--font-body)" }}
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[70px]" style={{ background: "#F8F4EF", minHeight: "100vh" }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-12">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8" style={{ background: "#C7A15B" }} />
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
          >
            Your Selection
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "3rem",
            color: "#2A0710",
            fontWeight: 300,
          }}
          className="mb-10"
        >
          My Wishlist
        </h1>

        {/* Empty state */}
        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={44} className="mx-auto mb-4" style={{ color: "rgba(199,161,91,0.25)" }} />
            <p
              style={{
                fontFamily: "var(--font-display)",
                color: "#7a6a5a",
                fontSize: "1.5rem",
                fontWeight: 300,
              }}
            >
              Your wishlist is empty
            </p>
            <button
              onClick={() => setPage("bridal-lehengas")}
              className="mt-6 px-8 py-3 text-[11px] tracking-[0.22em] uppercase"
              style={{ background: "#2A0710", color: "#C7A15B", fontFamily: "var(--font-body)" }}
            >
              Explore Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            {/* Wishlist items */}
            <div className="lg:col-span-3 space-y-3">
              {wishlist.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 bg-white"
                  style={{ boxShadow: "0 2px 12px rgba(42,7,16,0.05)" }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-28 object-cover object-top flex-shrink-0 bg-[#e8ddd5]"
                  />
                  <div className="flex-1">
                    <p
                      className="text-[9.5px] tracking-[0.2em] uppercase mb-0.5"
                      style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
                    >
                      {CATEGORY_META[item.category].label}
                    </p>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        color: "#252525",
                        fontSize: "1.1rem",
                        fontWeight: 400,
                      }}
                    >
                      {item.name}
                    </h3>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
                    >
                      {item.fabric}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-price)",
                        color: "#2A0710",
                        fontSize: "0.95rem",
                        fontWeight: 500,
                      }}
                      className="mt-1.5"
                    >
                      {item.price}
                    </p>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="mt-2.5 text-[9.5px] tracking-[0.18em] uppercase border-b hover:text-[#C7A15B] hover:border-[#C7A15B] transition-all"
                      style={{
                        color: "#7a6a5a",
                        borderColor: "rgba(122,106,90,0.25)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Enquiry form */}
            <div className="lg:col-span-2">
              <div
                className="p-6 bg-white"
                style={{ boxShadow: "0 2px 20px rgba(42,7,16,0.07)" }}
              >
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#2A0710",
                    fontSize: "1.5rem",
                    fontWeight: 400,
                  }}
                  className="mb-1"
                >
                  Send Enquiry
                </h3>
                <GoldDivider className="my-4" />

                <div className="space-y-4">
                  {[
                    { key: "name", label: "Full Name", type: "text" },
                    { key: "phone", label: "Phone Number", type: "tel" },
                    { key: "email", label: "Email Address", type: "email" },
                    { key: "city", label: "City", type: "text" },
                  ].map(({ key, label, type }) => (
                    <div key={key}>
                      <label
                        className="block text-[9.5px] tracking-[0.18em] uppercase mb-1.5"
                        style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
                      >
                        {label}
                      </label>
                      <input
                        type={type}
                        value={form[key as keyof typeof form]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full px-4 py-2.5 border outline-none text-sm transition-colors focus:border-[#C7A15B]"
                        style={{
                          borderColor: "rgba(199,161,91,0.3)",
                          background: "#fdfaf7",
                          fontFamily: "var(--font-body)",
                          color: "#252525",
                        }}
                      />
                    </div>
                  ))}

                  <div>
                    <label
                      className="block text-[9.5px] tracking-[0.18em] uppercase mb-1.5"
                      style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
                    >
                      Special Requirements
                    </label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Blouse size, colour preference, occasion details..."
                      className="w-full px-4 py-2.5 border outline-none text-sm resize-none focus:border-[#C7A15B] transition-colors placeholder:text-[#c0b0a0]"
                      style={{
                        borderColor: "rgba(199,161,91,0.3)",
                        background: "#fdfaf7",
                        fontFamily: "var(--font-body)",
                        color: "#252525",
                      }}
                    />
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full py-3.5 text-[10px] tracking-[0.22em] uppercase flex items-center justify-center gap-2"
                    style={{ background: "#2A0710", color: "#C7A15B", fontFamily: "var(--font-body)" }}
                  >
                    <Send size={12} />
                    Send via WhatsApp ({wishlist.length}{" "}
                    {wishlist.length === 1 ? "piece" : "pieces"})
                  </button>
                  <p
                    className="text-[9.5px] text-center"
                    style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
                  >
                    Opens WhatsApp with your details and full wishlist pre-filled.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
