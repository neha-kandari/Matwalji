import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";
import { sectionsCollection, serialize } from "../_homeSections.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    const db = await getDb();
    const docs = await sectionsCollection(db).find({}).toArray();
    return res.status(200).json(docs.map(serialize));
  }

  res.setHeader("Allow", "GET");
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
