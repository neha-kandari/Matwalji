import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getDb, getNextProductId } from "../_db";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const db = await getDb();
  const col = db.collection("products");

  if (req.method === "GET") {
    const products = await col.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray();
    return res.status(200).json(products);
  }

  if (req.method === "POST") {
    const body = req.body ?? {};
    if (!body.name || typeof body.name !== "string") {
      return res.status(400).json({ error: "Product name is required." });
    }

    const id = await getNextProductId(db);
    const product = { ...body, id };
    delete (product as { _id?: unknown })._id;

    await col.insertOne(product);
    return res.status(201).json(product);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
