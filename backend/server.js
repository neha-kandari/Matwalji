// server.ts
import "dotenv/config";
import express from "express";
import cors from "cors";

// api/_db.ts
import { MongoClient } from "mongodb";
var uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Missing MONGODB_URI environment variable");
}
var clientPromise;
if (!globalThis._matwaljiMongoClientPromise) {
  const client = new MongoClient(uri);
  globalThis._matwaljiMongoClientPromise = client.connect();
}
clientPromise = globalThis._matwaljiMongoClientPromise;
async function getDb() {
  const client = await clientPromise;
  return client.db("matwalji");
}
async function getNextProductId(db) {
  const col = db.collection("products");
  const last = await col.find({}).sort({ id: -1 }).limit(1).toArray();
  return (last[0]?.id ?? 0) + 1;
}

// api/products/index.ts
async function handler(req, res) {
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
    delete product._id;
    await col.insertOne(product);
    return res.status(201).json(product);
  }
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

// api/products/[id].ts
async function handler2(req, res) {
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
    delete update._id;
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

// api/filters/index.ts
var VALID_TYPES = /* @__PURE__ */ new Set(["color", "size", "tag"]);
function serialize(doc) {
  return { id: String(doc._id), type: doc.type, value: doc.value, hex: doc.hex };
}
async function handler3(req, res) {
  const db = await getDb();
  const col = db.collection("filterOptions");
  if (req.method === "GET") {
    const type = typeof req.query.type === "string" ? req.query.type : void 0;
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
    const doc = { type, value: value.trim() };
    if (type === "color" && typeof hex === "string" && hex.trim()) doc.hex = hex.trim();
    const result = await col.insertOne(doc);
    return res.status(201).json(serialize({ _id: result.insertedId, ...doc }));
  }
  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

// api/filters/[id].ts
import { ObjectId } from "mongodb";
function serialize2(doc) {
  return { id: String(doc._id), type: doc.type, value: doc.value, hex: doc.hex };
}
async function handler4(req, res) {
  const idParam = req.query.id;
  const id = typeof idParam === "string" ? idParam : "";
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid filter id" });
  }
  const _id = new ObjectId(id);
  const db = await getDb();
  const col = db.collection("filterOptions");
  if (req.method === "PUT") {
    const body = req.body ?? {};
    const update = {};
    if (typeof body.value === "string" && body.value.trim()) update.value = body.value.trim();
    if (typeof body.hex === "string") update.hex = body.hex.trim();
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "Nothing to update." });
    }
    const result = await col.findOneAndUpdate({ _id }, { $set: update }, { returnDocument: "after" });
    if (!result) return res.status(404).json({ error: "Filter option not found" });
    return res.status(200).json(serialize2(result));
  }
  if (req.method === "DELETE") {
    const result = await col.deleteOne({ _id });
    if (result.deletedCount === 0) return res.status(404).json({ error: "Filter option not found" });
    return res.status(204).end();
  }
  res.setHeader("Allow", "PUT, DELETE");
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

// api/_homeSections.ts
var SECTION_IDS = ["featured", "new-arrivals", "capture-moments"];
var CATEGORY_IDS = [
  "bridal-lehengas",
  "non-bridal-lehengas",
  "sarees-silk",
  "sarees-banarasi",
  "sarees-net",
  "sarees-premium"
];
var MAX_TEXT = 300;
var MAX_IMAGES = 12;
var MAX_ITEMS = 24;
var MAX_PRODUCT_PICKS = 100;
function isSectionId(value) {
  return typeof value === "string" && SECTION_IDS.includes(value);
}
function sectionsCollection(db) {
  return db.collection("homeSections");
}
function serialize3(doc) {
  return {
    id: doc.id,
    eyebrow: doc.eyebrow,
    title: doc.title,
    subtitle: doc.subtitle,
    visible: doc.visible,
    mode: doc.mode,
    maxItems: doc.maxItems,
    categories: doc.categories,
    productIds: doc.productIds,
    images: doc.images,
    handle: doc.handle
  };
}
function parseSection(id, body) {
  const input = body ?? {};
  const fail = (error) => ({ ok: false, error });
  const texts = {};
  for (const key of ["eyebrow", "title", "subtitle", "handle"]) {
    const value = input[key] ?? "";
    if (typeof value !== "string") return fail(`${key} must be text.`);
    if (value.length > MAX_TEXT) return fail(`${key} is too long (max ${MAX_TEXT} characters).`);
    texts[key] = value.trim();
  }
  if (!texts.title) return fail("A section heading is required.");
  const visible = input.visible ?? true;
  if (typeof visible !== "boolean") return fail("visible must be true or false.");
  const mode = input.mode ?? "auto";
  if (mode !== "auto" && mode !== "manual") return fail("mode must be auto or manual.");
  const maxItems = input.maxItems ?? 8;
  if (!Number.isInteger(maxItems) || maxItems < 1 || maxItems > MAX_ITEMS) {
    return fail(`The number of pieces must be between 1 and ${MAX_ITEMS}.`);
  }
  const rawCategories = input.categories ?? [];
  if (!Array.isArray(rawCategories) || !rawCategories.every((c) => typeof c === "string" && CATEGORY_IDS.includes(c))) {
    return fail("Unknown category selected.");
  }
  const rawIds = input.productIds ?? [];
  if (!Array.isArray(rawIds) || !rawIds.every((n) => Number.isInteger(n))) {
    return fail("productIds must be a list of product numbers.");
  }
  if (rawIds.length > MAX_PRODUCT_PICKS) return fail(`At most ${MAX_PRODUCT_PICKS} pieces can be picked.`);
  const rawImages = input.images ?? [];
  if (!Array.isArray(rawImages) || rawImages.length > MAX_IMAGES) {
    return fail(`A section can hold up to ${MAX_IMAGES} images.`);
  }
  const images = [];
  for (const item of rawImages) {
    const src = item?.src;
    const alt = item?.alt;
    if (typeof src !== "string" || !src.trim()) return fail("Every gallery tile needs a picture.");
    images.push({ src: src.trim(), alt: typeof alt === "string" ? alt.trim().slice(0, 160) : "" });
  }
  const isGallery = id === "capture-moments";
  return {
    ok: true,
    doc: {
      id,
      ...texts,
      visible,
      mode,
      maxItems,
      categories: isGallery ? [] : [...new Set(rawCategories)],
      productIds: isGallery ? [] : [...new Set(rawIds)],
      images: isGallery ? images : []
    }
  };
}

// api/home-sections/index.ts
async function handler5(req, res) {
  if (req.method === "GET") {
    const db = await getDb();
    const docs = await sectionsCollection(db).find({}).toArray();
    return res.status(200).json(docs.map(serialize3));
  }
  res.setHeader("Allow", "GET");
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

// api/home-sections/[id].ts
async function handler6(req, res) {
  const id = req.query.id;
  if (!isSectionId(id)) {
    return res.status(404).json({ error: "Unknown home page section." });
  }
  if (req.method === "PUT") {
    const parsed = parseSection(id, req.body);
    if (!parsed.ok) return res.status(400).json({ error: parsed.error });
    const db = await getDb();
    await sectionsCollection(db).updateOne({ id }, { $set: parsed.doc }, { upsert: true });
    return res.status(200).json(serialize3(parsed.doc));
  }
  res.setHeader("Allow", "PUT");
  return res.status(405).json({ error: `Method ${req.method} not allowed` });
}

// api/_cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
var cloudName = process.env.CLOUDINARY_CLOUD_NAME;
var apiKey = process.env.CLOUDINARY_API_KEY;
var apiSecret = process.env.CLOUDINARY_API_SECRET;
if (!cloudName || !apiKey || !apiSecret) {
  throw new Error("Missing CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY or CLOUDINARY_API_SECRET environment variable");
}
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true
});

// api/upload.ts
var MAX_DATA_URL_LENGTH = 15 * 1024 * 1024;
async function handler7(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const body = req.body ?? {};
  const data = body.data;
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

// server.ts
function withParam(handler8, paramName) {
  return async (req, res) => {
    Object.defineProperty(req, "query", {
      value: { ...req.query, [paramName]: req.params[paramName] },
      writable: true,
      configurable: true
    });
    await handler8(req, res);
  };
}
function wrap(handler8) {
  return (req, res, next) => {
    handler8(req, res).catch(next);
  };
}
var app = express();
var allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "").split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : true }));
app.use(express.json({ limit: "15mb" }));
app.get("/api/products", wrap(handler));
app.post("/api/products", wrap(handler));
app.get("/api/products/:id", wrap(withParam(handler2, "id")));
app.put("/api/products/:id", wrap(withParam(handler2, "id")));
app.delete("/api/products/:id", wrap(withParam(handler2, "id")));
app.get("/api/filters", wrap(handler3));
app.post("/api/filters", wrap(handler3));
app.put("/api/filters/:id", wrap(withParam(handler4, "id")));
app.delete("/api/filters/:id", wrap(withParam(handler4, "id")));
app.get("/api/home-sections", wrap(handler5));
app.put("/api/home-sections/:id", wrap(withParam(handler6, "id")));
app.post("/api/upload", wrap(handler7));
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});
app.use((err, _req, res, _next) => {
  console.error("[server]", err);
  if (!res.headersSent) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
});
var port = Number(process.env.PORT) || 3e3;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
