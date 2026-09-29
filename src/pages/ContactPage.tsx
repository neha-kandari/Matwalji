import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { SOCIAL_LINKS } from "../data/social";
import { CONTACT_INFO } from "../data/contact";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [done, setDone] = useState(false);

  return (
    <div className="pt-[70px]" style={{ background: "#F8F4EF", minHeight: "100vh" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-16">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-2">
          <div className="h-px w-8" style={{ background: "#C7A15B" }} />
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
          >
            We're Here
          </span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "3.5rem",
            color: "#2A0710",
            fontWeight: 300,
          }}
          className="mb-12"
        >
          Get in Touch
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            {done ? (
              <div className="text-center py-12">
                <Send size={32} className="mx-auto mb-5" style={{ color: "#C7A15B" }} />
                <p
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "#2A0710",
                    fontSize: "1.8rem",
                    fontWeight: 300,
                  }}
                >
                  Message Received
                </p>
                <p
                  className="mt-3 text-sm"
                  style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
                >
                  We will respond within 24 hours.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {[
                  { key: "name", label: "Full Name", type: "text" },
                  { key: "email", label: "Email", type: "email" },
                  { key: "phone", label: "Phone", type: "tel" },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label
                      className="block text-[9.5px] tracking-[0.18em] uppercase mb-2"
                      style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
                    >
                      {label}
                    </label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="w-full px-5 py-3 border outline-none text-sm focus:border-[#C7A15B] transition-colors"
                      style={{
                        borderColor: "rgba(199,161,91,0.3)",
                        background: "white",
                        fontFamily: "var(--font-body)",
                        color: "#252525",
                      }}
                    />
                  </div>
                ))}

                <div>
                  <label
                    className="block text-[9.5px] tracking-[0.18em] uppercase mb-2"
                    style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
                  >
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-5 py-3 border outline-none text-sm resize-none focus:border-[#C7A15B] transition-colors"
                    style={{
                      borderColor: "rgba(199,161,91,0.3)",
                      background: "white",
                      fontFamily: "var(--font-body)",
                      color: "#252525",
                    }}
                  />
                </div>

                <button
                  onClick={() => form.name && form.email && setDone(true)}
                  className="w-full py-4 text-[10px] tracking-[0.22em] uppercase flex items-center justify-center gap-2.5"
                  style={{ background: "#2A0710", color: "#C7A15B", fontFamily: "var(--font-body)" }}
                >
                  <Send size={13} /> Send Message
                </button>
              </div>
            )}
          </div>

          {/* Contact info */}
          <div className="space-y-8">
            {[
              { icon: Phone, title: "Call Us", lines: [CONTACT_INFO.phones.map((p) => p.display).join(" / "), "Mon–Sat, 10am–7pm IST"] },
              { icon: Mail, title: "Email Us", lines: [CONTACT_INFO.email, "Reply within 24 hours"] },
              { icon: MapPin, title: "Visit Us", lines: [...CONTACT_INFO.addressLines, CONTACT_INFO.landmark] },
            ].map(({ icon: Icon, title, lines }, i) => (
              <div key={i} className="flex gap-5">
                <div
                  className="w-10 h-10 border flex items-center justify-center flex-shrink-0"
                  style={{ borderColor: "rgba(199,161,91,0.35)" }}
                >
                  <Icon size={15} style={{ color: "#C7A15B" }} />
                </div>
                <div>
                  <p
                    className="text-[9.5px] tracking-[0.2em] uppercase mb-1"
                    style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
                  >
                    {title}
                  </p>
                  {lines.map((l, j) => (
                    <p
                      key={j}
                      className="text-sm"
                      style={{
                        color: j === 0 ? "#252525" : "#7a6a5a",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {l}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {/* WhatsApp CTA */}
            <a
              href={SOCIAL_LINKS.whatsapp}
              className="flex items-center justify-center gap-2.5 py-3.5 text-[10px] tracking-[0.22em] uppercase border transition-all duration-200 hover:bg-[#25D366] hover:border-[#25D366] hover:text-white"
              style={{ color: "#25D366", borderColor: "#25D366", fontFamily: "var(--font-body)" }}
            >
              <Phone size={13} /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
