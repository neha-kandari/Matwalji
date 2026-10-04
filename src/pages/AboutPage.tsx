import GoldDivider from "../components/GoldDivider";

export default function AboutPage() {
  return (
    <div className="pt-[70px]" style={{ background: "#F8F4EF", minHeight: "100vh" }}>
      {/* Hero */}
      <div className="relative h-72 flex items-end overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1619516388835-2b60acc4049e?w=1600&h=500&fit=crop&auto=format"
          alt="Our Story"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0" style={{ background: "rgba(42,7,16,0.65)" }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full pb-10">
          <h1
            style={{
              fontFamily: "var(--font-display)",
              color: "#F8F4EF",
              fontSize: "3.8rem",
              fontWeight: 300,
              lineHeight: 1.1,
            }}
          >
            Our Story
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        {/* Story section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-20">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8" style={{ background: "#C7A15B" }} />
              <span
                className="text-[10px] tracking-[0.3em] uppercase"
                style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
              >
                Est. 1998 · Surat
              </span>
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2.5rem",
                color: "#2A0710",
                fontWeight: 300,
                lineHeight: 1.2,
              }}
            >
              Weaving Heritage Into Modern Luxury
            </h2>
            <GoldDivider className="my-6" />
            <div
              className="space-y-4 text-sm leading-relaxed"
              style={{ color: "#4a3a2a", fontFamily: "var(--font-body)" }}
            >
              <p>
                MATWALJI brings together the richness of Indian craftsmanship with the elegance of contemporary bridal fashion. Based in Delhi, we curate exquisite lehengas designed for brides who appreciate timeless beauty, intricate detail, and distinctive style.
              </p>
              <p>
                From classic bridal silhouettes to statement-making contemporary designs, every piece is thoughtfully selected for its craftsmanship, colour, and character.
              </p>
              <p>
                Today, MATWALJI is a destination for brides seeking memorable lehengas for their most special celebrations from traditional bridal looks to modern occasion wear, curated with a distinctly refined eye.
              </p>
            </div>
          </div>

          <div
            className="relative aspect-[4/5] overflow-hidden rounded-[2px] bg-[#e8ddd5]"
          >
            <img
              src="https://images.unsplash.com/photo-1617633150878-7df1d12a9a57?w=700&h=900&fit=crop&auto=format"
              alt="MATWALJI craftsmanship"
              className="w-full h-full object-cover object-top"
            />
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Heritage",
              text: "Rooted in Varanasi, Kanchipuram, Chanderi — India's greatest weaving traditions.",
            },
            {
              title: "Craftsmanship",
              text: "Every piece is hand-finished by artisans trained over decades in their ancestral craft.",
            },
            {
              title: "Exclusivity",
              text: "Limited production ensures each MATWALJI creation remains truly rare and precious.",
            },
          ].map(({ title, text }, i) => (
            <div
              key={i}
              className="p-8 border"
              style={{ borderColor: "rgba(199,161,91,0.2)", background: "white" }}
            >
              <div className="w-7 h-px mb-5" style={{ background: "#C7A15B" }} />
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.5rem",
                  color: "#2A0710",
                  fontWeight: 400,
                }}
                className="mb-3"
              >
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
              >
                {text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
