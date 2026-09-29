import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ObjectId } from "mongodb";
import { getDb } from "../_db";

interface FilterOptionDoc {
  type: string;
  value: string;
  hex?: string;
}

function serialize(doc: FilterOptionDoc & { _id: unknown }) {
  return { id: String(doc._id), type: doc.type, value: doc.value, hex: doc.hex };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const idParam = req.query.id;
  const id = typeof idParam === "string" ? idParam : "";
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid filter id" });
  }
  const _id = new ObjectId(id);

  const db = await getDb();
  const col = db.collection<FilterOptionDoc>("filterOptions");

  if (req.method === "PUT") {
    const body = req.body ?? {};
    const update: { value?: string; hex?: string } = {};
    if (typeof body.value === "string" && body.value.trim()) update.value = body.value.trim();
    if (typeof body.hex === "string") update.hex = body.hex.trim();

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Nothing to update." });
    }

    const result = await col.findOneAndUpdate({ _id }, { $set: update }, { returnDocument: "after" });
    if (!result) return res.status(404).json({ error: "Filter option not found" });
    return res.status(200).json(serialize(result));
  }

  if (req.method === "DELETE") {
    const result = await col.deleteOne({ _id });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Filter option not found" });
    return res.status(204).end();
  }

  res.setHeader("Allow", "PUT, DELETE");
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
