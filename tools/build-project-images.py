"""Generate project JPEG variants. Requires Pillow; originals remain unchanged."""

import hashlib
import json
from pathlib import Path
import re

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
PROJECTS = ROOT / "assets/project"
SIZES = {"thumbnail": 192, "cover": 720, "preview": 1280}
manifest = {}

for project in ("super-resolution", "vegetation", "sea-ice", "internship"):
    markdown = (PROJECTS / f"{project}.md").read_text()
    images = re.findall(r'!\[[^\]]*\]\(([^\s)]+\.jpg)(?: "[^"]*")?\)', markdown)
    for relative in images:
        original = PROJECTS / relative
        source_hash = hashlib.sha256(original.read_bytes()).hexdigest()
        variants = {"sourceHash": source_hash}
        with Image.open(original) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            for kind, edge in SIZES.items():
                resized = image.copy()
                resized.thumbnail((edge, edge), Image.Resampling.LANCZOS)
                destination = PROJECTS / "optimized" / project / f"{source_hash[:16]}-{kind}.jpg"
                destination.parent.mkdir(parents=True, exist_ok=True)
                resized.save(destination, "JPEG", quality=85, subsampling=0, optimize=True, progressive=True)
                variants[kind] = {
                    "src": destination.relative_to(ROOT).as_posix(),
                    "width": resized.width,
                    "height": resized.height,
                }
        manifest[original.relative_to(ROOT).as_posix()] = variants

(PROJECTS / "image-variants.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
print(f"Prepared thumbnail, cover and preview variants for {len(manifest)} project images.")
