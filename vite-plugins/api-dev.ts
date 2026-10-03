// Makes the Vercel serverless functions in /api work under plain `npm run dev`
// (Vite alone has no idea /api exists — that routing only happens under
// `vercel dev` or an actual Vercel deployment). Without this, every admin
// add/edit/delete silently 404s when the site is run the normal way.
//
// This is dev-only (apply: "serve"): it loads each api/*.ts handler through
// Vite's own transform pipeline (so TS/imports just work, no separate build
// step) and adapts plain Node req/res into the (req.query, req.body) /
// res.status().json() shape those handlers already expect from @vercel/node.
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin, ViteDevServer } from "vite";

interface ApiRoute {
  pattern: RegExp;
  module: string;
  paramName?: string;
}

const ROUTES: ApiRoute[] = [
  { pattern: /^\/api\/products\/?$/, module: "/api/products/index.ts" },
  { pattern: /^\/api\/products\/([^/]+)\/?$/, module: "/api/products/[id].ts", paramName: "id" },
  { pattern: /^\/api\/filters\/?$/, module: "/api/filters/index.ts" },
  { pattern: /^\/api\/filters\/([^/]+)\/?$/, module: "/api/filters/[id].ts", paramName: "id" },
  { pattern: /^\/api\/home-sections\/?$/, module: "/api/home-sections/index.ts" },
  { pattern: /^\/api\/home-sections\/([^/]+)\/?$/, module: "/api/home-sections/[id].ts", paramName: "id" },
];

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "DELETE") return undefined;
  const chunks: Uint8Array[] = [];
  for await (const chunk of req) chunks.push(chunk as Uint8Array);
  if (chunks.length === 0) return undefined;
  const raw = Buffer.concat(chunks).toString("utf-8");
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function apiDevMiddleware(): Plugin {
  return {
    name: "api-dev-middleware",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith("/api/")) return next();

        const url = new URL(req.url, "http://localhost");
        const route = ROUTES.find((r) => r.pattern.test(url.pathname));
        if (!route) return next();

        try {
          const match = url.pathname.match(route.pattern)!;
          const query: Record<string, string> = {};
          url.searchParams.forEach((v, k) => { query[k] = v; });
          if (route.paramName) query[route.paramName] = decodeURIComponent(match[1]);

          (req as IncomingMessage & { query?: unknown; body?: unknown }).query = query;
          (req as IncomingMessage & { query?: unknown; body?: unknown }).body = await readJsonBody(req);

          const adaptedRes = res as ServerResponse & { status: (code: number) => typeof res; json: (data: unknown) => void };
          adaptedRes.status = (code: number) => {
            res.statusCode = code;
            return res;
          };
          adaptedRes.json = (data: unknown) => {
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          };

          const mod = await server.ssrLoadModule(route.module);
          const handler = mod.default as (req: IncomingMessage, res: ServerResponse) => Promise<void>;
          await handler(req, adaptedRes);
        } catch (err) {
          console.error("[api-dev-middleware]", err);
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
          }
          res.end(JSON.stringify({ error: err instanceof Error ? err.message : "Internal dev server error" }));
        }
      });
    },
  };
}
