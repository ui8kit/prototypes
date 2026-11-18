#!/usr/bin/env python3
"""Structural discipline for packages/blocks.

Fails when a block file leaks raw utility classes, bare HTML, nested Block,
literal copy, or forbidden style tokens. Layout and shape files may compose
kit primitives; they still must not embed Tailwind string literals.

Interactive kit widgets (Button, Dialog, Select, accordion/tabs/carousel, …)
are forbidden in packages/blocks except Button on CtaShape. Image/Picture/Source
belong only in Media.svelte. Organisms never import @ui8kit/kit.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BLOCKS = ROOT / "packages" / "blocks" / "src"
BLOCKS_PKG = ROOT / "packages" / "blocks" / "package.json"
MAX_RAW_UTILITIES = 0

SKIP_TOP = {"layout", "shapes", "content", "manifest"}
LAYOUT_DIRS = {"layout"}
SHAPE_DIRS = {"shapes"}

UTILITY_TOKEN = re.compile(
    r"(?:[a-z0-9-]+:)*"
    r"(?:flex|inline-flex|grid|block|hidden|contents|sr-only|"
    r"items-|justify-|content-|self-|"
    r"gap-|p[trblxy]?-|m[trblxy]?-|"
    r"w-|h-|min-w-|min-h-|max-w-|max-h-|"
    r"text-|font-|leading-|tracking-|"
    r"bg-|border|rounded|shadow|object-|aspect-|overflow-|"
    r"relative|absolute|fixed|sticky|static|inset-|"
    r"col-span-|row-span-|order-|basis-|grow|shrink|"
    r"container|mx-auto)"
)

CLASS_LITERAL = re.compile(
    r"""class\s*=\s*(?:"([^"]*)"|'([^']*)'|{\s*"([^"]*)"\s*}|{\s*'([^']*)'\s*})"""
)
CN_STRING = re.compile(r"""\bcn\s*\((.*?)\)""", re.S)
QUOTED = re.compile(r"""["'`]([^"'`]+)["'`]""")
LOWER_TAG = re.compile(r"<(?P<tag>[a-z][a-z0-9]*)\b")
BLOCK_OPEN = re.compile(r"<Block\b")
EACH_BLOCK = re.compile(r"\{#each\b[\s\S]*?<Block\b", re.M)
STYLE_ATTR = re.compile(r"\bstyle\s*=")
FORBIDDEN_CLASS = re.compile(
    r"\b(?:rounded-(?:sm|md|lg|xl|2xl|3xl)|shadow(?:-sm|-md|-lg|-xl)?|"
    r"bg-gradient-|from-|via-|to-(?:r|l|t|b|tr|tl|br|bl)\b|"
    r"bg-(?:red|blue|green|yellow|purple|pink|orange|zinc|slate|gray|neutral|stone)-\d+|"
    r"text-(?:red|blue|green|yellow|purple|pink|orange)-\d+)\b"
)
LITERAL_TEXT = re.compile(r">([^<{]*[A-Za-z][^<{]*)<")
LITERAL_ATTR = re.compile(
    r"""\b(?:aria-label|alt|title|placeholder|label)\s*=\s*["']([^"']*[A-Za-z][^"']*)["']"""
)
ALLOWED_TAGS = {
    "script",
    "style",
}

ALLOWED_SHAPE_IMPORTS = {
    "Avatar",
    "CtaShape",
    "Dot",
    "Heading",
    "Media",
    "TextLine",
}
ALLOWED_LAYOUT_IMPORTS = {"Block", "Container", "Grid", "Group", "Stack"}

# Kit widgets that are not rectangles. Accordion/tabs/carousel are not in v3 kit;
# if they appear later they join this set. Button is allowed only on CtaShape.
KIT_INTERACTIVE = {
    "Accordion",
    "Button",
    "Carousel",
    "Checkbox",
    "Dialog",
    "Disclosure",
    "Summary",
    "Form",
    "Icon",
    "Input",
    "Label",
    "Link",
    "Meter",
    "Progress",
    "Radio",
    "Select",
    "SelectOption",
    "SelectOptGroup",
    "Switch",
    "Tabs",
    "Text",
    "Textarea",
}
KIT_MEDIA = {"Image", "Picture", "Source"}
KIT_IMPORT = re.compile(
    r"import\s+(?:type\s+)?(?:\{([^}]+)\}|(\w+))\s+from\s+[\"']@ui8kit/kit(?:/[^\"']+)?[\"']"
)


def strip_comments(source: str) -> str:
    source = re.sub(r"<!--.*?-->", "", source, flags=re.S)
    source = re.sub(r"<script[\s\S]*?</script>", " ", source)
    return source


def imported_kit_names(source: str) -> list[str]:
    names: list[str] = []
    for match in KIT_IMPORT.finditer(source):
        body = match.group(1) or match.group(2) or ""
        for raw in body.split(","):
            token = re.sub(r"^type\s+", "", raw.strip())
            name = token.split(" as ")[0].strip()
            if name:
                names.append(name)
    return names


def interactive_markup(markup: str) -> set[str]:
    found: set[str] = set()
    for name in KIT_INTERACTIVE | KIT_MEDIA:
        if re.search(rf"<{name}\b", markup):
            found.add(name)
    return found


def tokens_in(value: str) -> list[str]:
    return [part for part in value.split() if UTILITY_TOKEN.match(part)]


def count_raw_utilities(source: str) -> tuple[int, list[str]]:
    found: list[str] = []
    for match in CLASS_LITERAL.finditer(source):
        raw = next((group for group in match.groups() if group is not None), "")
        found.extend(tokens_in(raw))
    for match in CN_STRING.finditer(source):
        for quoted in QUOTED.findall(match.group(1)):
            found.extend(tokens_in(quoted))
    return len(found), found


def organism_dirs() -> set[str]:
    found: set[str] = set()
    if not BLOCKS.is_dir():
        return found
    for path in BLOCKS.iterdir():
        if not path.is_dir() or path.name in SKIP_TOP:
            continue
        if any(path.glob("*.svelte")):
            found.add(path.name)
    return found


def kind_for(path: Path, organisms: set[str]) -> str:
    rel = path.relative_to(BLOCKS)
    top = rel.parts[0]
    if top in organisms:
        return "organism"
    if top in LAYOUT_DIRS:
        return "layout"
    if top in SHAPE_DIRS:
        return "shape"
    return "other"


def check_file(path: Path, organisms: set[str]) -> list[str]:
    errors: list[str] = []
    source = path.read_text(encoding="utf-8")
    markup = strip_comments(source)
    kind = kind_for(path, organisms)
    rel = path.relative_to(ROOT).as_posix()

    count, found = count_raw_utilities(source)
    print(f"raw-utilities {rel}: {count} (budget {MAX_RAW_UTILITIES})")
    if count > MAX_RAW_UTILITIES:
        errors.append(
            f"{rel}: {count} raw utility classes {found}; budget is {MAX_RAW_UTILITIES}. "
            "Move them to packages/blocks/src/classes.ts and consume layout/shape props."
        )

    if STYLE_ATTR.search(markup):
        errors.append(f"{rel}: inline style is not allowed")

    forbidden = FORBIDDEN_CLASS.findall(source)
    if forbidden:
        errors.append(f"{rel}: forbidden classes {forbidden}")

    if kind == "organism":
        opens = BLOCK_OPEN.findall(source)
        if len(opens) != 1:
            errors.append(f"{rel}: expected exactly one Block root, found {len(opens)}")
        if EACH_BLOCK.search(source):
            errors.append(f"{rel}: Block inside {{#each}} is not allowed")
        for match in LOWER_TAG.finditer(markup):
            tag = match.group("tag")
            if tag not in ALLOWED_TAGS:
                errors.append(f"{rel}: bare HTML <{tag}>")
        for match in LITERAL_TEXT.finditer(markup):
            text = match.group(1).strip()
            if text:
                errors.append(f"{rel}: literal text {text!r}")
        for match in LITERAL_ATTR.finditer(source):
            errors.append(f"{rel}: literal naming text {match.group(1)!r}")

    kit_names = imported_kit_names(source)
    interactive = [name for name in kit_names if name in KIT_INTERACTIVE]
    media_names = [name for name in kit_names if name in KIT_MEDIA]
    cta_file = path.name == "CtaShape.svelte"
    media_file = path.name == "Media.svelte"

    if kind == "organism" and kit_names:
        errors.append(
            f"{rel}: organisms must not import @ui8kit/kit; use layout shells and shapes"
        )

    if interactive and not (cta_file and set(interactive) <= {"Button"}):
        errors.append(
            f"{rel}: interactive kit {interactive}; only CtaShape may use Button. "
            "Accordion, tabs, carousel and other widgets are stacks/groups of rectangles."
        )

    if media_names and not media_file:
        errors.append(f"{rel}: Image/Picture/Source belong only in Media.svelte (media in a rectangle)")

    tags = interactive_markup(markup)
    bad_tags = {name for name in tags if name in KIT_INTERACTIVE}
    if cta_file:
        bad_tags.discard("Button")
    if bad_tags:
        errors.append(f"{rel}: interactive markup {sorted(bad_tags)}")
    media_tags = {name for name in tags if name in KIT_MEDIA}
    if media_tags and not media_file:
        errors.append(f"{rel}: media markup {sorted(media_tags)} outside Media.svelte")

    return errors


def check_manifests(organisms: set[str]) -> list[str]:
    errors: list[str] = []
    for name in sorted(organisms):
        directory = BLOCKS / name
        manifests = list(directory.glob("*.block.ts"))
        rel = directory.relative_to(ROOT).as_posix()
        if len(manifests) != 1:
            found = ", ".join(path.name for path in manifests) or "none"
            errors.append(f"{rel}: expected exactly one *.block.ts, found {found}")
        elif manifests[0].name != f"{name}.block.ts":
            errors.append(
                f"{rel}: manifest file should be {name}.block.ts, found {manifests[0].name}"
            )
    try:
        pkg = json.loads(BLOCKS_PKG.read_text(encoding="utf-8"))
        listed = {Path(item).name for item in pkg.get("ui8kit", {}).get("blockRoot", [])}
        if listed != organisms:
            errors.append(
                f"packages/blocks/package.json ui8kit.blockRoot {sorted(listed)} "
                f"does not match organism dirs {sorted(organisms)}"
            )
    except (OSError, json.JSONDecodeError) as exc:
        errors.append(f"packages/blocks/package.json: {exc}")
    return errors


def main() -> int:
    files = sorted(BLOCKS.rglob("*.svelte"))
    if not files:
        print("no block svelte files", file=sys.stderr)
        return 1

    organisms = organism_dirs()
    errors: list[str] = []
    print(f"max raw utility classes per block file: {MAX_RAW_UTILITIES}")
    print(
        "budget justification: remaining utilities live in classes.ts; "
        "organisms pass Block/Container/Stack/Grid/shape props only."
    )
    print(f"organism dirs: {', '.join(sorted(organisms)) or '(none)'}")
    print("interactive kit: Button allowed only in CtaShape.svelte")
    errors.extend(check_manifests(organisms))
    for path in files:
        errors.extend(check_file(path, organisms))

    if errors:
        print("check-blocks failed:", file=sys.stderr)
        for error in errors:
            print(f"  {error}", file=sys.stderr)
        return 1

    print("check-blocks: ok")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
