import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb } from "../_db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const id = Number(req.query.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }

  const db = await getDb();
  const col = db.collection("products");

  if (req.method === "GET") {
    const product = await col.findOne({ id }, { projection: { _id: 0 } });
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.status(200).json(product);
  }

  if (req.method === "PUT") {
    const body = req.body ?? {};
    const update = { ...body, id };
    delete (update as { _id?: unknown })._id;

    const result = await col.findOneAndUpdate(
      { id },
      { $set: update },
      { returnDocument: "after", projection: { _id: 0 } }
    );
    if (!result) return res.status(404).json({ error: "Product not found" });
    return res.status(200).json(result);
  }

  if (req.method === "DELETE") {
    const result = await col.deleteOne({ id });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Product not found" });
    return res.status(204).end();
  }

  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
