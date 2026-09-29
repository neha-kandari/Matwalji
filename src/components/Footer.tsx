import { Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";
import MatwaljiLogo from "./MatwaljiLogo";
import { SOCIAL_LINKS } from "../data/social";
import { CONTACT_INFO } from "../data/contact";
import type { Page } from "../types";

interface Props {
  setPage: (p: Page) => void;
}

export default function Footer({ setPage }: Props) {
  return (
    <footer style={{ background: "#160407" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-14 pb-7">
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b"
          style={{ borderColor: "rgba(199,161,91,0.12)" }}
        >
          {/* Brand */}
          <div>
            <MatwaljiLogo size="md" />
            <p
              className="mt-5 text-xs leading-relaxed"
              style={{ color: "rgba(232,210,166,0.45)", fontFamily: "var(--font-body)" }}
            >
              Elegance woven into every thread. Purveyors of luxury Indian ethnic fashion since 1998.
            </p>
            <div className="flex gap-2.5 mt-5">
              {[
                { Icon: Instagram, href: SOCIAL_LINKS.instagram },
                { Icon: Facebook, href: SOCIAL_LINKS.facebook },
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-7 h-7 border flex items-center justify-center transition-all duration-200 hover:bg-[#C7A15B] hover:border-[#C7A15B] hover:text-[#2A0710]"
                  style={{ borderColor: "rgba(199,161,91,0.25)", color: "#C7A15B" }}
                >
                  <Icon size={12} />
                </a>
              ))}
            </div>
          </div>

          {/* Collections */}
          <div>
            <p
              className="text-[9.5px] tracking-[0.28em] uppercase mb-5"
              style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
            >
              Lehengas
            </p>
            {(
              [
                { label: "Bridal Lehengas", page: "bridal-lehengas" as Page },
                { label: "Non-Bridal Lehengas", page: "non-bridal-lehengas" as Page },
              ] as const
            ).map((l) => (
              <button
                key={l.label}
                onClick={() => setPage(l.page)}
                className="block text-xs py-1.5 hover:text-[#C7A15B] transition-colors text-left"
                style={{ color: "rgba(232,210,166,0.45)", fontFamily: "var(--font-body)" }}
              >
                {l.label}
              </button>
            ))}

            <p
              className="text-[9.5px] tracking-[0.28em] uppercase mb-4 mt-6"
              style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
            >
              Designer Sarees
            </p>
            {(
              [
                { label: "Silk Sarees", page: "sarees-silk" as Page },
                { label: "Banarasi Sarees", page: "sarees-banarasi" as Page },
                { label: "Net Sarees", page: "sarees-net" as Page },
                { label: "Premium Sarees", page: "sarees-premium" as Page },
              ] as const
            ).map((l) => (
              <button
                key={l.label}
                onClick={() => setPage(l.page)}
                className="block text-xs py-1.5 hover:text-[#C7A15B] transition-colors text-left"
                style={{ color: "rgba(232,210,166,0.45)", fontFamily: "var(--font-body)" }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div>
            <p
              className="text-[9.5px] tracking-[0.28em] uppercase mb-5"
              style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
            >
              Explore
            </p>
            {(
              [
                { label: "Home", page: "home" as Page },
                { label: "About Us", page: "about" as Page },
                { label: "Contact", page: "contact" as Page },
                { label: "My Wishlist", page: "wishlist" as Page },
              ] as const
            ).map((l) => (
              <button
                key={l.label}
                onClick={() => setPage(l.page)}
                className="block text-xs py-1.5 hover:text-[#C7A15B] transition-colors text-left"
                style={{ color: "rgba(232,210,166,0.45)", fontFamily: "var(--font-body)" }}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Contact */}
          <div>
            <p
              className="text-[9.5px] tracking-[0.28em] uppercase mb-5"
              style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
            >
              Contact
            </p>
            {[
              { icon: Phone, text: CONTACT_INFO.phones.map((p) => p.display).join(" / ") },
              { icon: Mail, text: CONTACT_INFO.email },
              { icon: MapPin, text: `${CONTACT_INFO.addressLines.join(", ")}, ${CONTACT_INFO.landmark}` },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-start gap-2.5 mb-3">
                <Icon size={12} className="mt-0.5 flex-shrink-0" style={{ color: "#C7A15B" }} />
                <span
                  className="text-xs"
                  style={{ color: "rgba(232,210,166,0.45)", fontFamily: "var(--font-body)" }}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p
            className="text-[10px]"
            style={{ color: "rgba(232,210,166,0.3)", fontFamily: "var(--font-body)" }}
          >
            © 2025 MATWALJI Sarees. All rights reserved.
          </p>
          <p
            className="text-[10px]"
            style={{ color: "rgba(232,210,166,0.3)", fontFamily: "var(--font-body)" }}
          >
            Crafted with love in India
          </p>
        </div>
      </div>
    </footer>
  );
}
