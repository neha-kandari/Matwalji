// JSON API server, deployed as its own Hostinger Node.js (Express) app,
// separate from the frontend (deployed separately as a static Vite build).
// They used to run as one process with Express also serving the frontend's
// static files, but Hostinger's importer couldn't reliably classify a repo
// that mixed Vite and Express signals in one package.json — splitting them
// into two single-purpose apps is Hostinger's own documented fix for that.
// Because of the split, the frontend now calls this API cross-origin, so
// CORS is required below (see FRONTEND_ORIGIN).
//
// The handlers in /api are reused unchanged — their (req, res) => {} shape
// already matches Express (req.query, req.body, res.status().json() all work
// natively), so this file is pure routing/plumbing, not a rewrite.
// Loads .env locally; on Hostinger the real values come from hPanel's
// environment variables panel instead, and this becomes a harmless no-op.
//
// `npm run build` compiles this file to server.js, which is committed (not
// gitignored) so a host that scans the raw repo before building — as
// Hostinger does — finds a real .js entry file immediately. Don't hand-edit
// server.js; it's overwritten on every build.
import "dotenv/config";
import express, { type Request, type RequestHandler, type Response } from "express";
import cors from "cors";

import productsIndex from "./api/products/index.js";
import productsById from "./api/products/[id].js";
import filtersIndex from "./api/filters/index.js";
import filtersById from "./api/filters/[id].js";
import homeSectionsIndex from "./api/home-sections/index.js";
import homeSectionsById from "./api/home-sections/[id].js";
import uploadHandler from "./api/upload.js";

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

// FRONTEND_ORIGIN can be a comma-separated list (e.g. your production domain
// plus a local dev URL). Left unset, every origin is allowed — fine while
// nothing here reads cookies/sessions (the admin "login" is a client-side
// password check, not a server session), but set it once the frontend's
// real domain is known to stop other sites from being able to call this API
// from a browser.
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins.length > 0 ? allowedOrigins : true }));

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

// Anything else is an unknown endpoint — this app serves no pages.
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
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
