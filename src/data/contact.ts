// Single source of truth for MATWALJI's real contact details, referenced by
// the Footer and Contact page so they can't drift out of sync.
export const CONTACT_INFO = {
  addressLines: [
    "4401, 1st Floor, Nai Sarak",
    "Chandni Chowk, Delhi-06",
  ],
  landmark: "Opposite Mawari School",
  email: "matwalji13@gmail.com",
  phones: [
    { display: "+91 89290 69038", raw: "8929069038" },
    { display: "+91 99903 94567", raw: "9990394567" },
  ],
};

// Universal Google Maps search link (works on mobile — opens the Maps app —
// and desktop, without needing an exact geocoded address/place ID).
export const GOOGLE_MAPS_URL =
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [...CONTACT_INFO.addressLines, CONTACT_INFO.landmark].join(", ")
  )}`;
