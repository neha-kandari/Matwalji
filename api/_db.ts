import { MongoClient, type Db } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}

// Reuse the client across warm serverless invocations instead of opening a
// new connection on every request.
declare global {
  // eslint-disable-next-line no-var
  var _matwaljiMongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (!globalThis._matwaljiMongoClientPromise) {
  const client = new MongoClient(uri);
  globalThis._matwaljiMongoClientPromise = client.connect();
}
clientPromise = globalThis._matwaljiMongoClientPromise;

export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db("matwalji");
}

export async function getNextProductId(db: Db): Promise<number> {
  const col = db.collection("products");
  const last = await col.find({}).sort({ id: -1 }).limit(1).toArray();
  return (last[0]?.id ?? 0) + 1;
}
