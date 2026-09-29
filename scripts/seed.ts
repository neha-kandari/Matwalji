// One-off script to load the products and filter values currently hardcoded
// in src/data/ into MongoDB. Run with: npm run seed
import "dotenv/config";
import { MongoClient } from "mongodb";
import { ALL_PRODUCTS } from "../src/data/products";
import { DEFAULT_FILTER_OPTIONS } from "../src/data/filters";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI environment variable (add it to .env)");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("matwalji");

  const productsCol = db.collection("products");
  for (const product of ALL_PRODUCTS) {
    await productsCol.updateOne({ id: product.id }, { $set: product }, { upsert: true });
  }
  console.log(`Seeded ${ALL_PRODUCTS.length} products into the "matwalji.products" collection.`);

  const filtersCol = db.collection("filterOptions");
  for (const { type, value, hex } of DEFAULT_FILTER_OPTIONS) {
    const doc: { type: string; value: string; hex?: string } = { type, value };
    if (hex) doc.hex = hex;
    await filtersCol.updateOne({ type, value }, { $set: doc }, { upsert: true });
  }
  console.log(`Seeded ${DEFAULT_FILTER_OPTIONS.length} filter options into the "matwalji.filterOptions" collection.`);

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
