interface Props {
  eyebrow: string;
  title: string;
  subtitle?: string;
  light?: boolean;
}

export default function SectionHeader({ eyebrow, title, subtitle, light = false }: Props) {
  return (
    <div className="text-center mb-12 lg:mb-16">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="h-px w-8" style={{ background: "#C7A15B" }} />
        <span
          className="text-[10px] tracking-[0.32em] uppercase"
          style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
        >
          {eyebrow}
        </span>
        <div className="h-px w-8" style={{ background: "#C7A15B" }} />
      </div>

      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 4vw, 3.4rem)",
          fontWeight: 300,
          color: light ? "#F8F4EF" : "#2A0710",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          className="mt-4 max-w-md mx-auto text-sm leading-relaxed"
          style={{
            color: light ? "rgba(232,210,166,0.65)" : "#7a6a5a",
            fontFamily: "var(--font-body)",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
