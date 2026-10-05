import GoldDivider from "../components/GoldDivider";

export default function AboutPage() {
  return (
    <div className="pt-[70px]" style={{ background: "#F8F4EF", minHeight: "100vh" }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img
          src="/AboutHero.png"
          alt="Our Story"
          className="block w-full h-auto"
        />
        <div className="hidden sm:block absolute inset-0" style={{ background: "rgba(42,7,16,0.6)" }} />
        <div className="relative sm:absolute sm:inset-0 z-10 flex items-center justify-center text-center bg-[#2A0710] sm:bg-transparent">
          <div className="w-full max-w-3xl mx-auto px-6 py-10 sm:py-0">
            <h1
              style={{
                fontFamily: "var(--font-display)",
                color: "#F8F4EF",
                fontSize: "clamp(2rem, 6vw, 4.5rem)",
                fontWeight: 400,
                lineHeight: 1.05,
              }}
            >
              Our <em style={{ color: "#C7A15B", fontStyle: "italic" }}>Story</em>
            </h1>
            <p
              className="mt-4"
              style={{
                fontFamily: "var(--font-display)",
                color: "#E8D2A6",
                fontStyle: "italic",
                fontSize: "clamp(0.95rem, 2.2vw, 1.6rem)",
              }}
            >
              Weaving Heritage Into Modern Luxury
            </p>
          </div>
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
                Est. 1958 · Delhi
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
              src="/aboutUs.png"
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
