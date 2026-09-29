import { useState, useRef } from "react";
import { Heart, Menu, X, Search, ChevronDown, ChevronRight } from "lucide-react";
import MatwaljiLogo from "./MatwaljiLogo";
import { NAV_STRUCTURE } from "../data/categories";
import type { Page, Product } from "../types";

interface Props {
  page: Page;
  setPage: (p: Page) => void;
  setSelectedProduct: (p: Product | null) => void;
  wishlistCount: number;
  scrolled: boolean;
}

export default function Navbar({ page, setPage, setSelectedProduct, wishlistCount, scrolled }: Props) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHome = page === "home";
  const bg = !isHome || scrolled
    ? "bg-[#2A0710] shadow-md shadow-black/20"
    : "bg-transparent";

  function navTo(p: Page) {
    setPage(p);
    setOpenDropdown(null);
    setMobileOpen(false);
    setSelectedProduct(null);
  }

  function handleMouseEnter(label: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(label);
  }

  function handleMouseLeave() {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 180);
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${bg}`}>
        <div className="max-w-7xl mx-auto px-5 lg:px-10">
          <div className="flex items-center justify-between h-[70px]">
            {/* Logo */}
            <button onClick={() => navTo("home")}>
              <MatwaljiLogo />
            </button>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-7">
              {NAV_STRUCTURE.map((item) =>
                item.dropdown ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className="flex items-center gap-1 text-[11px] tracking-[0.22em] uppercase transition-colors duration-200"
                      style={{
                        color:
                          openDropdown === item.label
                            ? "#C7A15B"
                            : "rgba(232,210,166,0.8)",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      {item.label}
                      <ChevronDown
                        size={11}
                        className={`transition-transform duration-200 ${
                          openDropdown === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown panel */}
                    {openDropdown === item.label && (
                      <div
                        className="absolute top-full mt-3 min-w-[240px] border py-2"
                        style={{ right: 0 }}
                        style={{
                          background: "#1e0609",
                          borderColor: "rgba(199,161,91,0.25)",
                          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
                        }}
                        onMouseEnter={() => handleMouseEnter(item.label)}
                        onMouseLeave={handleMouseLeave}
                      >
                        {item.dropdown.map((sub) => (
                          <button
                            key={sub.page}
                            onClick={() => navTo(sub.page)}
                            className="w-full text-left px-5 py-3 group hover:bg-[#2A0710] transition-colors duration-150"
                          >
                            <p
                              className="text-[11.5px] tracking-[0.18em] uppercase group-hover:text-[#C7A15B] transition-colors"
                              style={{ color: "#E8D2A6", fontFamily: "var(--font-body)" }}
                            >
                              {sub.label}
                            </p>
                            <p
                              className="text-[10px] mt-0.5"
                              style={{
                                color: "rgba(199,161,91,0.5)",
                                fontFamily: "var(--font-body)",
                              }}
                            >
                              {sub.sub}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    key={item.label}
                    onClick={() => navTo(item.page!)}
                    className="text-[11px] tracking-[0.22em] uppercase transition-colors duration-200"
                    style={{
                      color: page === item.page ? "#C7A15B" : "rgba(232,210,166,0.8)",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {item.label}
                  </button>
                )
              )}
            </div>

            {/* Icon group */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSearchOpen(true)}
                className="transition-colors hover:text-[#E8D2A6]"
                style={{ color: "#C7A15B" }}
              >
                <Search size={17} />
              </button>

              <button
                onClick={() => navTo("wishlist")}
                className="relative transition-colors hover:text-[#E8D2A6]"
                style={{ color: "#C7A15B" }}
              >
                <Heart size={17} />
                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-semibold"
                    style={{ background: "#C7A15B", color: "#2A0710" }}
                  >
                    {wishlistCount}
                  </span>
                )}
              </button>

              <button
                className="lg:hidden transition-colors"
                style={{ color: "#C7A15B" }}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X size={21} /> : <Menu size={21} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="lg:hidden border-t"
            style={{ background: "#1a0508", borderColor: "rgba(199,161,91,0.15)" }}
          >
            {NAV_STRUCTURE.map((item) => (
              <div
                key={item.label}
                className="border-b"
                style={{ borderColor: "rgba(199,161,91,0.08)" }}
              >
                {item.dropdown ? (
                  <>
                    <button
                      className="flex items-center justify-between w-full px-6 py-4 text-[11px] tracking-[0.22em] uppercase"
                      style={{ color: "#E8D2A6", fontFamily: "var(--font-body)" }}
                      onClick={() =>
                        setMobileExpanded(
                          mobileExpanded === item.label ? null : item.label
                        )
                      }
                    >
                      {item.label}
                      <ChevronDown
                        size={12}
                        style={{ color: "#C7A15B" }}
                        className={`transition-transform duration-200 ${
                          mobileExpanded === item.label ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {mobileExpanded === item.label && (
                      <div className="pb-2" style={{ background: "rgba(42,7,16,0.5)" }}>
                        {item.dropdown.map((sub) => (
                          <button
                            key={sub.page}
                            onClick={() => navTo(sub.page)}
                            className="flex items-center justify-between w-full px-8 py-3 text-[11px] tracking-[0.18em] uppercase hover:text-[#C7A15B] transition-colors"
                            style={{
                              color: "rgba(232,210,166,0.7)",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            <span>{sub.label}</span>
                            <span
                              style={{
                                color: "rgba(199,161,91,0.45)",
                                fontSize: 9,
                              }}
                            >
                              {sub.sub}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => navTo(item.page!)}
                    className="block w-full text-left px-6 py-4 text-[11px] tracking-[0.22em] uppercase"
                    style={{
                      color: page === item.page ? "#C7A15B" : "#E8D2A6",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-28 px-6"
          style={{ background: "rgba(26,5,8,0.97)", backdropFilter: "blur(10px)" }}
          onClick={() => setSearchOpen(false)}
        >
          <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div
              className="flex items-center gap-4 border-b pb-4"
              style={{ borderColor: "#C7A15B" }}
            >
              <Search size={20} style={{ color: "#C7A15B" }} />
              <input
                autoFocus
                placeholder="Search sarees, lehengas, collections..."
                className="flex-1 bg-transparent text-2xl outline-none"
                style={{ fontFamily: "var(--font-display)", color: "#E8D2A6" }}
              />
              <button onClick={() => setSearchOpen(false)} style={{ color: "#C7A15B" }}>
                <X size={20} />
              </button>
            </div>
            <div className="mt-8 space-y-1">
              <p
                className="text-[10px] tracking-[0.3em] uppercase mb-4"
                style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
              >
                Popular Searches
              </p>
              {[
                "Bridal Banarasi Saree",
                "Red Bridal Lehenga",
                "Kanjivaram Silk",
                "Net Party Saree",
                "Non-Bridal Lehenga",
              ].map((t) => (
                <button
                  key={t}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 w-full py-2.5 hover:text-[#C7A15B] transition-colors"
                  style={{
                    color: "rgba(232,210,166,0.65)",
                    fontFamily: "var(--font-display)",
                    fontSize: 19,
                  }}
                >
                  <ChevronRight size={13} style={{ color: "#C7A15B" }} />
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
