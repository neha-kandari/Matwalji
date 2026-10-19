import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cloudinary } from "./_cloudinary.js";

const MAX_DATA_URL_LENGTH = 15 * 1024 * 1024; // ~15MB of base64, comfortably above a compressed photo

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body ?? {};
  const data = body.data;

  // Only a data: URI is accepted (what the admin's file picker produces after
  // client-side compression) — never a remote URL, so this endpoint can't be
  // turned into a proxy that makes our server fetch arbitrary third-party URLs.
  if (typeof data !== "string" || !data.startsWith("data:image/")) {
    return res.status(400).json({ error: "data must be an image data URL." });
  }
  if (data.length > MAX_DATA_URL_LENGTH) {
    return res.status(413).json({ error: "Image is too large." });
  }

  const folder = typeof body.folder === "string" && /^[a-zA-Z0-9/_-]+$/.test(body.folder) ? body.folder : "matwalji/uploads";

  try {
    const result = await cloudinary.uploader.upload(data, { folder });
    return res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error("[api/upload]", err);
    return res.status(502).json({ error: "Could not upload image to Cloudinary." });
  }
}
