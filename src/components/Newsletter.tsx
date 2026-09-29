import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section
      className="py-20 px-6 lg:px-10 text-center border-t border-b"
      style={{ background: "#F8F4EF", borderColor: "rgba(199,161,91,0.18)" }}
    >
      <div className="max-w-xl mx-auto">
        <div className="flex justify-center items-center gap-3 mb-4">
          <div className="h-px w-8" style={{ background: "#C7A15B" }} />
          <span
            className="text-[10px] tracking-[0.32em] uppercase"
            style={{ color: "#C7A15B", fontFamily: "var(--font-body)" }}
          >
            Stay in Touch
          </span>
          <div className="h-px w-8" style={{ background: "#C7A15B" }} />
        </div>

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2.4rem",
            color: "#2A0710",
            fontWeight: 300,
            lineHeight: 1.2,
          }}
        >
          First to Know, First to Wear
        </h2>

        <p
          className="mt-4 mb-8 text-sm"
          style={{ color: "#7a6a5a", fontFamily: "var(--font-body)" }}
        >
          New arrivals, exclusive drops, and private bridal appointments — delivered to your inbox.
        </p>

        {done ? (
          <p
            style={{
              color: "#C7A15B",
              fontFamily: "var(--font-display)",
              fontSize: "1.2rem",
              fontStyle: "italic",
            }}
          >
            Thank you. We will be in touch.
          </p>
        ) : (
          <div className="flex flex-col sm:flex-row">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-5 py-3.5 border outline-none text-sm placeholder:text-[#c0b0a0] sm:border-y sm:border-l sm:border-r-0"
              style={{
                borderColor: "rgba(199,161,91,0.35)",
                background: "white",
                fontFamily: "var(--font-body)",
                color: "#252525",
              }}
            />
            <button
              onClick={() => email && setDone(true)}
              className="px-7 py-3.5 text-[10px] tracking-[0.22em] uppercase transition-opacity hover:opacity-90 w-full sm:w-auto"
              style={{ background: "#2A0710", color: "#C7A15B", fontFamily: "var(--font-body)" }}
            >
              Subscribe
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
