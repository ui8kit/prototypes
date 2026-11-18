#!/usr/bin/env python3
"""Mirror packages/blocks class strings into HTML ui8px can read."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLASSES = ROOT / "packages" / "blocks" / "src" / "classes.ts"
# The generated organisms (codegen-x/ui8kit packages/prototypes): their blocks, shapes and compose recipes carry the
# layout class strings of the simple line; they are linted here too (layout scope).
GENERATED = ROOT / "packages" / "blocks" / "src" / "generated" / "svelte"
GENERATED_GLOBS = ("blocks/*.svelte", "shapes/*.svelte", "shapes/*.ts")
# compose/recipes.ts: the token-only recipes of the compositions. Only the recipes the shipped compositions read are linted
# (generated/manifest.json recipes.used); the ones codegen-x marks as controls (recipes.controls: badge, link-button, …) go to
# their own file under the ui8px `controls` scope (.ui8px/policy/scopes.json, spacing "control": 4px steps allowed, the
# same owner rule 8 + 4 as kit controls), every other recipe to the layout scope.
GENERATED_MANIFEST = GENERATED.parent / "manifest.json"
RECIPES_TS = GENERATED / "compose" / "recipes.ts"
RECIPES_CONTROLS = ROOT / ".ui8px" / "extract" / "recipes-controls.html"
RECIPES_LAYOUT = ROOT / ".ui8px" / "extract" / "recipes-layout.html"
EXTRACT_DIR = ROOT / ".ui8px" / "extract"
EXTRACT_HTML = EXTRACT_DIR / "blocks.html"
CLASS_MAP = ROOT / ".ui8px" / "class-map.json"

STRING = re.compile(r'"([^"]+)"')
UTILITY_HINT = re.compile(
    r"(?:^|\s)(?:[a-z0-9-]+:)*(?:flex|inline-flex|grid|block|hidden|items-|justify-|"
    r"gap-|p[trblxy]?-|m[trblxy]?-|w-|h-|min-w-|min-h-|max-w-|max-h-|text-|font-|"
    r"bg-|border|rounded|shadow|object-|aspect-|overflow-|relative|absolute|fixed|"
    r"shrink|grow|container|mx-auto|inset-)"
)

SPACING_PREFIX = re.compile(
    r"^(?:[a-z0-9-]+:)*(?P<prefix>p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml|gap|gap-x|gap-y|"
    r"w|h|min-w|min-h|max-w|max-h|top|right|bottom|left|inset|inset-x|inset-y)-(?P<value>\d+)$"
)

CSS_PROP = {
    "p": "padding",
    "px": "padding-inline",
    "py": "padding-block",
    "pt": "padding-top",
    "pr": "padding-right",
    "pb": "padding-bottom",
    "pl": "padding-left",
    "m": "margin",
    "mx": "margin-inline",
    "my": "margin-block",
    "mt": "margin-top",
    "mr": "margin-right",
    "mb": "margin-bottom",
    "ml": "margin-left",
    "gap": "gap",
    "gap-x": "column-gap",
    "gap-y": "row-gap",
    "w": "width",
    "h": "height",
    "min-w": "min-width",
    "min-h": "min-height",
    "max-w": "max-width",
    "max-h": "max-height",
    "top": "top",
    "right": "right",
    "bottom": "bottom",
    "left": "left",
    "inset": "inset",
    "inset-x": "inset-inline",
    "inset-y": "inset-block",
}


def class_lists(source: str) -> list[str]:
    seen: list[str] = []
    for match in STRING.finditer(source):
        value = match.group(1).strip()
        if not value or not UTILITY_HINT.search(f" {value}"):
            continue
        if value not in seen:
            seen.append(value)
    return seen


def class_map(lists: list[str]) -> dict[str, str]:
    mapping: dict[str, str] = {}
    for raw in lists:
        for token in raw.split():
            base = token.split(":")[-1]
            parsed = SPACING_PREFIX.match(base)
            if not parsed:
                continue
            prop = CSS_PROP[parsed.group("prefix")]
            value = parsed.group("value")
            mapping[token] = f"{prop}: calc(var(--spacing) * {value});"
    return dict(sorted(mapping.items()))


def recipe_classes(recipe: dict) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    if recipe.get("base", "").strip():
        out.append(("base", recipe["base"].strip()))
    for key, values in recipe.get("byKey", {}).items():
        for value, cls in values.items():
            if cls.strip():
                out.append((f"byKey.{key}.{value}", cls.strip()))
    for index, compound in enumerate(recipe.get("compound", [])):
        if compound.get("class", "").strip():
            out.append((f"compound[{index}]", compound["class"].strip()))
    return out


def write_recipes() -> tuple[int, int]:
    """Mirror the used recipes of compose/recipes.ts into two HTML files, one per ui8px scope."""
    manifest = json.loads(GENERATED_MANIFEST.read_text(encoding="utf-8"))
    used = manifest.get("recipes", {}).get("used", [])
    controls = set(manifest.get("recipes", {}).get("controls", []))
    source = RECIPES_TS.read_text(encoding="utf-8")
    start = source.index("= {", source.index("export const RECIPES")) + 2
    end = source.index("\n};\n", start) + 2
    recipes = json.loads(source[start:end])
    counts = []
    for target, pick in ((RECIPES_CONTROLS, lambda r: r in controls), (RECIPES_LAYOUT, lambda r: r not in controls)):
        lines = ["<!doctype html>", "<!-- generated from packages/blocks/src/generated/svelte/compose/recipes.ts; do not edit -->", "<html><body>"]
        n = 0
        for name in used:
            if not pick(name):
                continue
            if name not in recipes:
                raise SystemExit(f"recipe {name} of generated/manifest.json is not in compose/recipes.ts")
            for where, cls in recipe_classes(recipes[name]):
                lines.append(f'<i data-src="recipes.ts#{name}.{where}" class="{cls}"></i>')
                n += 1
        lines.append("</body></html>")
        target.write_text("\n".join(lines) + "\n", encoding="utf-8")
        counts.append(n)
    return counts[0], counts[1]


def main() -> int:
    sources = [("classes.ts", CLASSES)]
    for pattern in GENERATED_GLOBS:
        sources.extend((p.relative_to(GENERATED.parent).as_posix(), p) for p in sorted(GENERATED.glob(pattern)))
    lists: list[str] = []
    origin: dict[str, str] = {}
    for name, path in sources:
        for raw in class_lists(path.read_text(encoding="utf-8")):
            if raw not in origin:
                origin[raw] = name
                lists.append(raw)
    EXTRACT_DIR.mkdir(parents=True, exist_ok=True)
    lines = [
        "<!doctype html>",
        "<!-- generated from packages/blocks/src/classes.ts and src/generated/svelte; do not edit -->",
        "<html><body>",
    ]
    for index, raw in enumerate(lists):
        lines.append(f'<i data-src="{origin[raw]}#{index}" class="{raw}"></i>')
    lines.append("</body></html>")
    EXTRACT_HTML.write_text("\n".join(lines) + "\n", encoding="utf-8")
    CLASS_MAP.write_text(json.dumps(class_map(lists), indent=2) + "\n", encoding="utf-8")
    print(f"wrote {EXTRACT_HTML.relative_to(ROOT)} ({len(lists)} class lists)")
    print(f"wrote {CLASS_MAP.relative_to(ROOT)}")
    controls, layout = write_recipes()
    print(f"wrote {RECIPES_CONTROLS.relative_to(ROOT)} ({controls} control class lists), {RECIPES_LAYOUT.relative_to(ROOT)} ({layout})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
