#!/usr/bin/env python3
"""Install UI8Kit Svelte primitives from github.com/ui8kit/registry.

Prefers the official CLI (`npx ui8kit@3 init/add`) when the network can reach
the registry CDN and npm. Falls back to copying registry item files via the
GitHub API (same bytes the CLI would write). Never edits primitive sources.
"""

from __future__ import annotations

import base64
import hashlib
import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
KIT_DIR = "packages/kit/src"
OWNER = "ui8kit"
REPO = "registry"
RUNTIME = "svelte"
SOURCE = "https://registry.buildy.tw/svelte"
CLI_VERSION = "3.5.0"


def gh_api(path: str) -> dict | list:
    raw = subprocess.check_output(["gh", "api", path], text=True)
    return json.loads(raw)


def gh_file(path: str) -> dict:
    data = gh_api(f"repos/{OWNER}/{REPO}/contents/{path}")
    if isinstance(data, list):
        raise RuntimeError(f"expected file, got directory: {path}")
    content = data.get("content") or ""
    encoding = data.get("encoding")
    if encoding == "base64":
        decoded = base64.b64decode("".join(content.split())).decode("utf-8")
    else:
        decoded = content
    return json.loads(decoded)


def hash_content(content: str) -> str:
    return hashlib.sha256(content.replace("\r\n", "\n").encode("utf-8")).hexdigest()


def render_rules(content: str, kit: str, globs: str) -> str:
    return content.replace("{kit}", kit).replace("{globs}", globs)


def write_file(rel: str, content: str) -> None:
    dest = ROOT / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(content if content.endswith("\n") or not content else content, encoding="utf-8")
    if not dest.read_text(encoding="utf-8").endswith("\n") and content:
        dest.write_text(content + ("\n" if not content.endswith("\n") else ""), encoding="utf-8")


def try_official_cli() -> bool:
    env = os.environ.copy()
    cmds = [
        [
            "npx",
            "--yes",
            "ui8kit@3",
            "init",
            "--yes",
            "--framework",
            "svelte",
            "--dir",
            KIT_DIR,
        ],
        ["npx", "--yes", "ui8kit@3", "add", "--all"],
    ]
    try:
        for cmd in cmds:
            subprocess.run(cmd, cwd=ROOT, check=True, env=env)
        return True
    except (OSError, subprocess.CalledProcessError) as exc:
        print(f"official CLI unavailable ({exc}); installing from GitHub registry", file=sys.stderr)
        return False


def install_from_github() -> None:
    index = gh_file(f"r/{RUNTIME}/index.json")
    version = index.get("version") or "3.4.0"
    lock_items: dict[str, dict] = {}

    for component in index["components"]:
        name = component["name"]
        ctype = component["type"]
        if ctype == "registry:utils":
            item = gh_file(f"r/{RUNTIME}/utils/utils.json")
        elif ctype == "registry:rules":
            item = gh_file(f"r/{RUNTIME}/rules/rules.json")
        elif ctype == "registry:ui":
            item = gh_file(f"r/{RUNTIME}/components/ui/{name}.json")
        else:
            print(f"skip unsupported type {ctype} ({name})", file=sys.stderr)
            continue

        files_map: dict[str, str] = {}
        for file in item.get("files", []):
            target = (file.get("target") or file.get("path") or "").lstrip("/")
            content = file.get("content") or ""
            if ctype == "registry:rules":
                rel = target
                kit = f"{KIT_DIR}/ui"
                globs = f"{KIT_DIR}/**/*.svelte"
                content = render_rules(content, kit, globs)
            else:
                rel = f"{KIT_DIR}/{target}"
            if not content.endswith("\n"):
                content += "\n"
            write_file(rel, content)
            files_map[rel.replace("\\", "/")] = hash_content(content)
            print(f"wrote {rel}")

        key = f"registry.buildy.tw|{RUNTIME}|{name}"
        lock_items[key] = {
            "name": name,
            "type": ctype,
            "source": SOURCE,
            "version": item.get("digest") or version,
            "runtime": RUNTIME,
            "files": dict(sorted(files_map.items())),
        }

    lock = {
        "lockVersion": 2,
        "cli": CLI_VERSION,
        "items": dict(sorted(lock_items.items())),
    }
    lock_path = ROOT / "ui8kit.lock.json"
    lock_path.write_text(json.dumps(lock, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {lock_path.relative_to(ROOT)}")


def write_config() -> None:
    config = {
        "$schema": "https://registry.buildy.tw/schema/config.json",
        "contractVersion": "2.0.0",
        "framework": "svelte",
        "runtime": "svelte",
        "typescript": True,
        "dir": KIT_DIR,
        "globalCss": "apps/blocks/src/app.css",
        "aliases": {
            "@": f"./{KIT_DIR}",
            "@/ui": f"./{KIT_DIR}/ui",
            "@/utils": f"./{KIT_DIR}/utils",
            "@/lib": f"./{KIT_DIR}/presets",
            "@/components": f"./{KIT_DIR}/components",
            "@/blocks": f"./{KIT_DIR}/blocks",
            "@/layouts": f"./{KIT_DIR}/layouts",
            "@/variants": f"./{KIT_DIR}/variants",
            "@/widgets": f"./{KIT_DIR}/widgets",
        },
        "registry": "@ui8kit",
        "importStyle": "alias",
    }
    path = ROOT / "ui8kit.config.json"
    path.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {path.relative_to(ROOT)}")


def main() -> int:
    write_config()
    if try_official_cli():
        return 0
    install_from_github()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
