from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "src" / "assets" / "images" / "custom-wine-gifts.webp"
target = root / "dist" / "assets" / "images" / "og-eventpartner-ge-wine-social-v1.jpg"

image = Image.open(source).convert("RGB")
width, height = image.size
target_ratio = 600 / 315
crop_height = min(height, round(width / target_ratio))
available = max(0, height - crop_height)
top = round(available * 0.55)
crop = image.crop((0, top, width, top + crop_height))
crop = crop.resize((600, 315), Image.Resampling.LANCZOS)
target.parent.mkdir(parents=True, exist_ok=True)
crop.save(target, "JPEG", quality=90, optimize=True, progressive=True)
print(f"Generated {target.relative_to(root)} from {source.name}: {image.size} -> {crop.size}")
