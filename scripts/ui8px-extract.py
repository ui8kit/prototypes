#!/usr/bin/env python3
"""Mirror packages/blocks class strings into HTML ui8px can read."""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CLASSES = ROOT / "packages" / "blocks" / "src" / "classes.ts"
# The generated wireframes (codegen-x/ui8kit packages/prototypes): their blocks and shapes carry the layout class strings
# of the simple line (rectangles on the kit Box, no recipe); they are linted here too (layout scope).
GENERATED = ROOT / "packages" / "blocks" / "src" / "generated" / "svelte"
GENERATED_GLOBS = ("blocks/*.svelte", "shapes/*.svelte")
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
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
