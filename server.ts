// Production server for non-Vercel hosts (e.g. Hostinger's hPanel Node.js
// Web App). Vercel deploys each file in /api as its own serverless function;
// a plain host instead needs one long-running process, so this wires the
// same handlers into an Express app and serves the Vite build alongside them.
//
// The handlers in /api are reused unchanged — their (req, res) => {} shape
// already matches Express (req.query, req.body, res.status().json() all work
// natively), so this file is pure routing/plumbing, not a rewrite.
// Loads .env locally; on Hostinger the real values come from hPanel's
// environment variables panel instead, and this becomes a harmless no-op.
import "dotenv/config";
import express, { type Request, type RequestHandler, type Response } from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import productsIndex from "./api/products/index.js";
import productsById from "./api/products/[id].js";
import filtersIndex from "./api/filters/index.js";
import filtersById from "./api/filters/[id].js";
import homeSectionsIndex from "./api/home-sections/index.js";
import homeSectionsById from "./api/home-sections/[id].js";
import uploadHandler from "./api/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type ApiHandler = (req: Request, res: Response) => Promise<void>;

// The /api handlers read a route param (e.g. product id) off req.query,
// following Vercel's convention. Express puts it in req.params instead, so
// this copies it across before handing off. req.query is a read-only getter
// in Express 5, so it's replaced wholesale rather than mutated in place.
function withParam(handler: ApiHandler, paramName: string): ApiHandler {
  return async (req, res) => {
    Object.defineProperty(req, "query", {
      value: { ...req.query, [paramName]: req.params[paramName] },
      writable: true,
      configurable: true,
    });
    await handler(req, res);
  };
}

function wrap(handler: ApiHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res).catch(next);
  };
}

const app = express();
// Default 100kb limit is too small for a base64-encoded photo upload.
app.use(express.json({ limit: "15mb" }));

app.get("/api/products", wrap(productsIndex));
app.post("/api/products", wrap(productsIndex));
app.get("/api/products/:id", wrap(withParam(productsById, "id")));
app.put("/api/products/:id", wrap(withParam(productsById, "id")));
app.delete("/api/products/:id", wrap(withParam(productsById, "id")));

app.get("/api/filters", wrap(filtersIndex));
app.post("/api/filters", wrap(filtersIndex));
app.put("/api/filters/:id", wrap(withParam(filtersById, "id")));
app.delete("/api/filters/:id", wrap(withParam(filtersById, "id")));

app.get("/api/home-sections", wrap(homeSectionsIndex));
app.put("/api/home-sections/:id", wrap(withParam(homeSectionsById, "id")));

app.post("/api/upload", wrap(uploadHandler));

// Any other /api/* request is an unknown endpoint, not a page — fail as
// JSON instead of falling through to the SPA's index.html below.
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "Not found" });
});

const distDir = path.join(__dirname, "dist");
app.use(express.static(distDir));

// SPA fallback: let react-router handle every non-API route client-side.
// (No path pattern: Express 5's path-to-regexp rejects a bare "*", and this
// being the last middleware already means every unmatched GET lands here.)
app.use((_req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.use((err: unknown, _req: Request, res: Response, _next: (err?: unknown) => void) => {
  console.error("[server]", err);
  if (!res.headersSent) {
    res.status(500).json({ error: err instanceof Error ? err.message : "Internal server error" });
  }
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
