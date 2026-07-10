import { defineConfig } from "next-openapi-gen";

// Config for next-openapi-gen. Running `openapi-gen generate` scans the App
// Router handlers under app/api, reads their Zod schemas + JSDoc `@` tags, and
// writes the OpenAPI document to public/openapi.json.
//
// The generated paths come out as the bare public contract (/forecast,
// /health, /locations) — the same paths the pay gateway proxies to
// ${UPSTREAM_ORIGIN}/api/* and the pay-skills catalog consumes.
export default defineConfig({
  openapi: "3.1.0",
  info: {
    title: "Weather Pro",
    version: "v1",
    description:
      "Paid weather forecasts: current conditions and a 7-day outlook per city, with a free list of supported locations.",
  },
  apiDir: "app/api",
  routerType: "app",
  schemaDir: "app/api",
  schemaType: "zod",
  outputFile: "openapi.json",
  outputDir: "./public",
  // Only emit handlers explicitly tagged with @openapi. This keeps the thin
  // /api/openapi.json serving route (which has no @openapi tag) out of the spec.
  includeOpenApiRoutes: true,
});
