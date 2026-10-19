import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";
import { isSectionId, parseSection, sectionsCollection, serialize } from "../_homeSections.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = req.query.id;
  if (!isSectionId(id)) {
    return res.status(404).json({ error: "Unknown home page section." });
  }

  if (req.method === "PUT") {
    const parsed = parseSection(id, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });

    const db = await getDb();
    await sectionsCollection(db).updateOne({ id }, { $set: parsed.doc }, { upsert: true });
    return res.status(200).json(serialize(parsed.doc));
  }

  res.setHeader("Allow", "PUT");
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
