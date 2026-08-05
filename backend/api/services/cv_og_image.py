"""
Generazione dell'immagine Open Graph (social-card) per la pagina CV pubblica.

Genera un PNG 1200x630 con nome + tagline su uno sfondo con gradiente colore
legato alla categoria professionale del CV (stessa palette usata dal
frontend, vedi frontend/src/components/cv-template/categoryTheme.ts), cosi'
che condividendo il link su LinkedIn/WhatsApp/X si veda un'anteprima
personalizzata invece del logo generico della piattaforma.

Nota sul font: non e' garantito che l'ambiente serverless (Vercel Python
runtime) abbia font di sistema installati in un path prevedibile, e non
scarichiamo font esterni a runtime. Usiamo quindi il font bitmap scalabile
incluso in Pillow stesso (`ImageFont.load_default(size=...)`, disponibile
da Pillow 10.1) cosi' il risultato e' garantito ovunque senza dipendenze
aggiuntive. E' meno "brandizzato" del font Dosis/Source Sans usato nel
template pubblico vero e proprio, ma e' un compromesso deliberato per non
introdurre fragilita' legate a path di font di sistema o download a runtime.
"""
from __future__ import annotations

import io

from PIL import Image, ImageDraw, ImageFont

WIDTH = 1200
HEIGHT = 630

# Stessa palette (primo/ultimo colore del gradiente hero) di
# frontend/src/components/cv-template/categoryTheme.ts — tenere allineate
# se quella mappa cambia.
_CATEGORY_GRADIENTS: dict[str, tuple[str, str]] = {
    "digitale-it": ("#4338ca", "#7e22ce"),
    "ingegneri-tecnici": ("#334155", "#1d4ed8"),
    "sanitari-assistenziali": ("#0f766e", "#047857"),
    "commerciale-vendita": ("#d97706", "#e11d48"),
    "amministrative-finanziarie": ("#1d4ed8", "#0891b2"),
    "logistica": ("#c2410c", "#b91c1c"),
    "default": ("#4338ca", "#7e22ce"),
}


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def _draw_gradient(draw: ImageDraw.ImageDraw, start_hex: str, end_hex: str) -> None:
    start = _hex_to_rgb(start_hex)
    end = _hex_to_rgb(end_hex)
    for x in range(WIDTH):
        t = x / max(WIDTH - 1, 1)
        r = round(start[0] + (end[0] - start[0]) * t)
        g = round(start[1] + (end[1] - start[1]) * t)
        b = round(start[2] + (end[2] - start[2]) * t)
        draw.line([(x, 0), (x, HEIGHT)], fill=(r, g, b))


def _font(size: int) -> ImageFont.ImageFont:
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        # Pillow < 10.1: load_default() non accetta l'argomento size.
        return ImageFont.load_default()


def _wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), candidate, font=font)
        if bbox[2] - bbox[0] <= max_width or not current:
            current = candidate
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines[:3]


def generate_og_image_png(name: str, tagline: str, category: str, site_name: str = "Nordevit") -> bytes:
    """Genera un PNG 1200x630 in memoria, ritorna i bytes pronti per la response HTTP."""
    start_hex, end_hex = _CATEGORY_GRADIENTS.get(category or "default", _CATEGORY_GRADIENTS["default"])

    img = Image.new("RGB", (WIDTH, HEIGHT))
    draw = ImageDraw.Draw(img)
    _draw_gradient(draw, start_hex, end_hex)

    # Overlay scuro leggero nella fascia inferiore per far risaltare il testo
    # bianco a prescindere da quanto sia chiaro il gradiente in quel punto.
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    overlay_draw.rectangle([(0, HEIGHT - 280), (WIDTH, HEIGHT)], fill=(0, 0, 0, 80))
    img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(img)

    margin = 80
    name_font = _font(72)
    tagline_font = _font(36)
    brand_font = _font(28)

    draw.text((margin, 50), site_name.upper(), font=brand_font, fill=(255, 255, 255))

    name_lines = _wrap_text(draw, name or "CV Digitale", name_font, WIDTH - margin * 2)
    tagline_lines = _wrap_text(draw, tagline, tagline_font, WIDTH - margin * 2) if tagline else []

    # Calcola l'altezza totale del blocco di testo per ancorarlo in basso.
    line_gap = 12
    name_line_h = draw.textbbox((0, 0), "Ay", font=name_font)[3] + line_gap
    tagline_line_h = draw.textbbox((0, 0), "Ay", font=tagline_font)[3] + 8
    block_h = name_line_h * len(name_lines) + tagline_line_h * len(tagline_lines)

    y = HEIGHT - 70 - block_h
    for line in name_lines:
        draw.text((margin, y), line, font=name_font, fill=(255, 255, 255))
        y += name_line_h
    for line in tagline_lines:
        draw.text((margin, y), line, font=tagline_font, fill=(230, 230, 250))
        y += tagline_line_h

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()
