import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db.js";

const VALID_TYPES = new Set(["color", "size", "tag"]);

interface FilterOptionDoc {
  type: string;
  value: string;
  hex?: string;
}

function serialize(doc: FilterOptionDoc & { _id: unknown }) {
  return { id: String(doc._id), type: doc.type, value: doc.value, hex: doc.hex };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = await getDb();
  const col = db.collection<FilterOptionDoc>("filterOptions");

  if (req.method === "GET") {
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const query = type && VALID_TYPES.has(type) ? { type } : {};
    const options = await col.find(query).sort({ type: 1, value: 1 }).toArray();
    return res.status(200).json(options.map(serialize));
  }

  if (req.method === "POST") {
    const body = req.body ?? {};
    const { type, value, hex } = body;
    if (!VALID_TYPES.has(type)) {
      return res.status(400).json({ error: "type must be one of color, size, tag." });
    }
    if (!value || typeof value !== "string" || !value.trim()) {
      return res.status(400).json({ error: "value is required." });
    }

    const existing = await col.findOne({ type, value: value.trim() });
    if (existing) {
      return res.status(409).json({ error: `"${value.trim()}" already exists for ${type}.` });
    }

    const doc: { type: string; value: string; hex?: string } = { type, value: value.trim() };
    if (type === "color" && typeof hex === "string" && hex.trim()) doc.hex = hex.trim();

    const result = await col.insertOne(doc);
    return res.status(201).json(serialize({ _id: result.insertedId, ...doc }));
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
