// Read-only live contract smoke test. No accounts, bookings or reviews are created.
const fs = require("node:fs"), path = require("node:path"), Module = require("node:module"), assert = require("node:assert/strict"), ts = require("typescript");
const schemaPath = path.resolve(__dirname, "../src/types/api.ts");
const contracts = new Module(schemaPath);
contracts.filename = schemaPath;
contracts.paths = Module._nodeModulePaths(path.dirname(schemaPath));
contracts._compile(ts.transpileModule(fs.readFileSync(schemaPath, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, schemaPath);
const { searchSchema, detailSchema, eventSchema, reviewSchema, pageSchema, optionsSchema } = contracts.exports;
const base = (process.argv[2] || "https://quivibe.vercel.app").replace(/\/$/, "");
async function get(resource, schema) {
  const response = await fetch(base + "/api/mobile/" + resource, { signal: AbortSignal.timeout(30000), redirect: "error" });
  assert.equal(response.status, 200, resource);
  return schema.parse(await response.json());
}
(async () => {
  const catalogue = await get("venues?page=1", searchSchema);
  assert.ok(catalogue.places.length <= 12, "Catalogue page limit");
  const options = await get("search-options", optionsSchema);
  const events = await get("events", pageSchema(eventSchema));
  if (catalogue.places.length) {
    const venue = await get("venues/" + encodeURIComponent(catalogue.places[0].slug), detailSchema);
    await get("reviews/" + encodeURIComponent(venue.id), pageSchema(reviewSchema));
  }
  for (const resource of ["session", "favorites", "reservations", "reviews/mine"]) {
    const response = await fetch(base + "/api/mobile/" + resource, { signal: AbortSignal.timeout(30000), redirect: "error" });
    assert.equal(response.status, 401, "Anonymous access denied: " + resource);
  }
  console.log(JSON.stringify({ validated: true, base, venues: catalogue.total, pageSize: catalogue.places.length, categories: options.categories.length, neighborhoods: options.neighborhoods.length, upcomingEvents: events.total, anonymousPrivateAccess: "denied" }));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
