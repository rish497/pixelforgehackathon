from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"

BACKGROUND_PATH = ASSETS / "pixel-forge-ai-forge-background.png"
ICON_PATH = ASSETS / "pixel-forge-ai-icon.png"
WORDMARK_PATH = ASSETS / "pixel-forge-ai-wordmark.png"

FONT_BOLD = Path("C:/Windows/Fonts/seguisb.ttf")
FONT_REGULAR = Path("C:/Windows/Fonts/segoeui.ttf")


def cover(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    target_width, target_height = size
    source_ratio = image.width / image.height
    target_ratio = target_width / target_height

    if source_ratio > target_ratio:
        height = target_height
        width = round(height * source_ratio)
    else:
        width = target_width
        height = round(width / source_ratio)

    resized = image.resize((width, height), Image.Resampling.LANCZOS)
    left = (width - target_width) // 2
    top = (height - target_height) // 2
    return resized.crop((left, top, left + target_width, top + target_height))


def fit_width(image: Image.Image, width: int) -> Image.Image:
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.NEAREST)


def place_center(canvas: Image.Image, image: Image.Image, y: int) -> None:
    x = (canvas.width - image.width) // 2
    canvas.alpha_composite(image, (x, y))


def centered_text(
    canvas: Image.Image,
    text: str,
    y: int,
    size: int,
    fill: str,
    spacing: int = 0,
) -> None:
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(str(FONT_BOLD), size)

    if spacing == 0:
        bounds = draw.textbbox((0, 0), text, font=font)
        width = bounds[2] - bounds[0]
        draw.text(((canvas.width - width) / 2, y), text, font=font, fill=fill)
        return

    widths = [draw.textlength(character, font=font) for character in text]
    total_width = sum(widths) + spacing * (len(text) - 1)
    x = (canvas.width - total_width) / 2
    for character, character_width in zip(text, widths):
        draw.text((x, y), character, font=font, fill=fill)
        x += character_width + spacing


def create_canvas(size: tuple[int, int]) -> Image.Image:
    source = Image.open(BACKGROUND_PATH).convert("RGBA")
    canvas = cover(source, size)
    overlay = Image.new("RGBA", size, (2, 3, 12, 102))
    canvas.alpha_composite(overlay)

    vertical = Image.new("RGBA", size)
    vertical_pixels = vertical.load()
    for y in range(size[1]):
        distance = abs((y / max(size[1] - 1, 1)) - 0.5) * 2
        alpha = round(22 + distance * 72)
        for x in range(size[0]):
            vertical_pixels[x, y] = (3, 4, 13, alpha)
    canvas.alpha_composite(vertical)
    return canvas


def add_corner_label(canvas: Image.Image, text: str) -> None:
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(str(FONT_BOLD), max(15, canvas.width // 75))
    draw.text(
        (canvas.width * 0.055, canvas.height * 0.065),
        text,
        font=font,
        fill="#70DDFF",
    )


def build_wide() -> Path:
    canvas = create_canvas((1600, 900))
    icon = fit_width(Image.open(ICON_PATH).convert("RGBA"), 150)
    wordmark = fit_width(Image.open(WORDMARK_PATH).convert("RGBA"), 1320)

    add_corner_label(canvas, "OFFICIAL PRESS ASSET")
    place_center(canvas, icon, 145)
    place_center(canvas, wordmark, 375)
    centered_text(canvas, "BUILD WHAT'S NEXT WITH AI", 585, 38, "#70DDFF", 3)

    output = ASSETS / "banner-wide-1600x900.png"
    canvas.convert("RGB").save(output, quality=95, optimize=True)
    return output


def build_square() -> Path:
    canvas = create_canvas((1080, 1080))
    icon = fit_width(Image.open(ICON_PATH).convert("RGBA"), 190)
    wordmark = fit_width(Image.open(WORDMARK_PATH).convert("RGBA"), 930)

    add_corner_label(canvas, "PIXEL FORGE / PRESS")
    place_center(canvas, icon, 220)
    place_center(canvas, wordmark, 515)
    centered_text(canvas, "BUILD · LEARN · WIN", 690, 38, "#70DDFF", 4)

    output = ASSETS / "social-square-1080x1080.png"
    canvas.convert("RGB").save(output, quality=95, optimize=True)
    return output


def build_story() -> Path:
    canvas = create_canvas((1080, 1920))
    icon = fit_width(Image.open(ICON_PATH).convert("RGBA"), 230)
    wordmark = fit_width(Image.open(WORDMARK_PATH).convert("RGBA"), 960)

    add_corner_label(canvas, "OFFICIAL STORY ASSET")
    place_center(canvas, icon, 430)
    place_center(canvas, wordmark, 805)
    centered_text(canvas, "BUILD · LEARN · WIN", 1010, 38, "#70DDFF", 4)
    centered_text(canvas, "FORGED BY AI", 1100, 54, "#F7F8FF", 1)

    output = ASSETS / "story-1080x1920.png"
    canvas.convert("RGB").save(output, quality=95, optimize=True)
    return output


def build_link_preview() -> Path:
    canvas = create_canvas((1200, 630))
    icon = fit_width(Image.open(ICON_PATH).convert("RGBA"), 155)
    wordmark = fit_width(Image.open(WORDMARK_PATH).convert("RGBA"), 830)

    add_corner_label(canvas, "PIXEL FORGE AI / PRESS KIT")
    canvas.alpha_composite(icon, (85, 230))
    canvas.alpha_composite(wordmark, (290, 235))
    draw = ImageDraw.Draw(canvas)
    font = ImageFont.truetype(str(FONT_BOLD), 29)
    draw.text((292, 365), "BUILD WHAT'S NEXT WITH AI", font=font, fill="#70DDFF")

    output = ASSETS / "link-preview-1200x630.png"
    canvas.convert("RGB").save(output, quality=95, optimize=True)
    return output


def write_press_notes() -> Path:
    text = """PIXEL FORGE AI HACKATHON — OFFICIAL PRESS NOTES

Announcement line
Pixel Forge AI Hackathon brings developers, designers, creators, and innovators together to build functional AI-powered solutions that solve real problems.

Boilerplate
Pixel Forge AI Hackathon is an online hackathon where developers, designers, creators, and innovators build functional projects using artificial intelligence. Participants may work independently or in teams of up to four, using AI to address real-world challenges across work, education, creativity, productivity, hobbies, and everyday life. Projects can range from chatbots and creative tools to automation systems and autonomous AI agents, with an emphasis on usefulness, creativity, and meaningful AI integration.

Event facts
- Format: Online
- Teams: Solo or teams of up to 4
- Platform: Devpost
- Website: https://pixelforgejam.org/
- Devpost: https://pixel-forge-ai-hackathon-08.devpost.com/
- Discord: https://discord.gg/mM8PpjGyM6
- Press contact: pixelforgejam@gmail.com

Approved hashtags
#PixelForgeAI #PixelForgeHackathon #AIHackathon #BuildWithAI #ArtificialIntelligence #Hackathon #OpenSource
"""
    output = ASSETS / "press-notes.txt"
    output.write_text(text, encoding="utf-8")
    return output


def build_zip(generated: list[Path]) -> None:
    source_assets = [BACKGROUND_PATH, ICON_PATH, WORDMARK_PATH]
    archive = ASSETS / "pixel-forge-ai-press-kit.zip"
    with ZipFile(archive, "w", ZIP_DEFLATED) as bundle:
        for path in source_assets + generated:
            bundle.write(path, path.name)


def main() -> None:
    generated = [
        build_wide(),
        build_square(),
        build_story(),
        build_link_preview(),
        write_press_notes(),
    ]
    build_zip(generated)


if __name__ == "__main__":
    main()
