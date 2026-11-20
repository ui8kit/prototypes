/**
 * A page saved by the catalog is a @ui8kit/contract page-spec v2 document: blocks `{ id, item, variant, props }` with the
 * settings inside `props` (docs/adr/0001-settings-in-props.md). The schema is the published one (`@ui8kit/contract`
 * 0.4 `schemas/page-spec-v2.schema.json`, which references `page-spec.schema.json` for safe text); the host checks of
 * the spec (`unknown_item`, `unknown_variant`, `props_invalid`) are `validateInstance`. The synced block contracts are
 * block-contract/v1 documents (`schemas/block-contract.schema.json`, 0.4: `variants[].settings`).
 */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFileSync, readdirSync } from "node:fs";
import { describe, it } from "node:test";
import { Ajv2020 } from "ajv/dist/2020.js";
import { sampleContent } from "./fixtures";
import { BLOCKS, MODELS, validateInstance } from "./registry";
import { defaultVariantId, type BlockInstance } from "./types";

const require = createRequire(import.meta.url);
const schema = (name: string) => JSON.parse(readFileSync(require.resolve(`@ui8kit/contract/schemas/${name}.schema.json`), "utf8"));
const ajv = new Ajv2020({ allErrors: true, strict: false });
ajv.addSchema(schema("page-spec"));
const validatePage = ajv.compile(schema("page-spec-v2"));

function page(blocks: BlockInstance[]): unknown {
  return { version: 2, slug: "home", title: "Home", locale: "en", blocks };
}
const saved = (): BlockInstance[] =>
  BLOCKS.map((b, i) => ({ id: `${b.id}-${i}`, item: b.id, variant: defaultVariantId(b), props: { ...sampleContent(MODELS[b.model]!.spec), level: 2, padding: "spacious", ...(b.settings.align ? { align: "center" } : {}), landmarkLabel: b.id } }));

describe("page-spec v2 (@ui8kit/contract)", () => {
  it("a saved page with settings in props is valid for the schema and for the registry", () => {
    const blocks = saved();
    assert.ok(validatePage(page(blocks)), JSON.stringify(validatePage.errors));
    for (const b of blocks) assert.deepEqual(validateInstance(b).issues, [], b.item);
  });

  it("the old `options` field is not page-spec v2 (additionalProperties: false)", () => {
    const [first] = saved();
    const legacy = { ...first!, options: { padding: "compact" } } as unknown as BlockInstance;
    assert.equal(validatePage(page([legacy])), false);
    assert.ok(validatePage.errors!.some((e) => e.keyword === "additionalProperties" && e.params.additionalProperty === "options"));
  });
});

describe("block-contract/v1 (@ui8kit/contract 0.4)", () => {
  const validateContract = ajv.compile(schema("block-contract"));
  const dir = new URL("../generated/contracts/", import.meta.url);
  const items = readdirSync(dir).filter((d) => !d.endsWith(".json"));
  it("every synced contract validates, variants[].settings included", () => {
    assert.deepEqual(items.sort(), BLOCKS.map((b) => b.id).sort());
    for (const item of items) {
      const c = JSON.parse(readFileSync(new URL(`${item}/1.json`, dir), "utf8"));
      assert.ok(validateContract(c), `${item}: ${JSON.stringify(validateContract.errors)}`);
    }
  });
});
