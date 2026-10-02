import { useState } from "react";
import { Heart, ArrowRight, Star } from "lucide-react";
import type { Product } from "../types";

interface Props {
  product: Product;
  wishlisted: boolean;
  onWishlist: () => void;
  onView: () => void;
}

export default function ProductCard({ product, wishlisted, onWishlist, onView }: Props) {
  const [hovered, setHovered] = useState(false);

  const isNew = product.tag === "New Arrival";

  return (
    <div
      className="group flex flex-col bg-white overflow-hidden cursor-pointer relative"
      style={{
        boxShadow: hovered
          ? "0 12px 40px rgba(42,7,16,0.14)"
          : "0 2px 16px rgba(42,7,16,0.07)",
        transition: "box-shadow 0.35s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onView}
    >
      {/* New arrival left-edge accent */}
      {isNew && (
        <div
          className="absolute left-0 top-0 bottom-0 z-10"
          style={{ width: 3, background: "linear-gradient(to bottom, #C7A15B, #E8D2A6, #C7A15B)" }}
        />
      )}

      {/* ── Image area ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: "2/3" }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top"
          style={{
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.75s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />

        {/* Gradient base */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(26,5,8,0.5) 0%, transparent 50%)" }}
        />

        {/* Tag badge */}
        {product.tag && (
          <div
            className="absolute top-3 left-3 px-2.5 py-[3px] text-[8.5px] tracking-[0.22em] uppercase z-10"
            style={{
              background: isNew ? "#2A0710" : "#C7A15B",
              color: isNew ? "#C7A15B" : "#2A0710",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
            }}
          >
            {product.tag}
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); onWishlist(); }}
          className="absolute top-3 right-3 z-10 flex items-center justify-center transition-all duration-250"
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: wishlisted ? "#C7A15B" : "rgba(255,255,255,0.93)",
            boxShadow: "0 2px 10px rgba(0,0,0,0.14)",
          }}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={14}
            fill={wishlisted ? "#2A0710" : "none"}
            style={{ color: wishlisted ? "#2A0710" : "#C7A15B" }}
          />
        </button>

        {/* Hover overlay */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center py-3.5 transition-all duration-350"
          style={{
            background: "rgba(42,7,16,0.9)",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <span
            className="flex items-center gap-2 text-[10px] tracking-[0.26em] uppercase transition-all duration-300"
            style={{ color: "#E8D2A6", fontFamily: "var(--font-body)" }}
          >
            View Details <ArrowRight size={11} style={{ color: "#C7A15B" }} />
          </span>
        </div>

      </div>

      {/* ── Minimal info bar ── */}
      <div className="px-3 pt-3 pb-3">
        {/* Name */}
        <h3
          className="truncate mb-1.5"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "0.95rem",
            color: "#2A0710",
            fontWeight: 400,
            lineHeight: 1.3,
          }}
          title={product.name}
        >
          {product.name}
        </h3>

        <div className="flex items-center justify-between gap-2">
          {/* Price */}
          <span
            style={{
              fontFamily: "var(--font-price)",
              fontSize: "0.9rem",
              color: "#2A0710",
              fontWeight: 600,
            }}
          >
            {product.price}
          </span>

          {/* Rating pill */}
          <div
            className="flex items-center gap-1 px-2 py-1 rounded-sm"
            style={{ background: "rgba(199,161,91,0.1)", border: "1px solid rgba(199,161,91,0.25)" }}
          >
            <Star size={9} fill="#C7A15B" style={{ color: "#C7A15B" }} />
            <span style={{ fontFamily: "var(--font-body)", fontSize: "0.68rem", color: "#2A0710", fontWeight: 600, letterSpacing: "0.04em" }}>5.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
