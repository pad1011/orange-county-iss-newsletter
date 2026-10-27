#!/usr/bin/env python3
"""Make a photo safe and small enough for the Inside ISS web page.

Usage:
  python3 prepare_photo.py SOURCE assets/YYYY-MM-short-name.jpg [--crop 16:9]   make the web copy
  python3 prepare_photo.py --check FILE [FILE ...]                 only report hidden data

What it does:
- Turns the photo the right way up (phone photos are often stored sideways).
- Converts colors to standard sRGB, then keeps ONLY the pixels: no EXIF (camera,
  date/time, GPS location), XMP, IPTC, comments or color profile.
- Shrinks it to at most 1600 pixels on the long side and under 500 KB.
- Reads JPEG, PNG, WebP, GIF, TIFF; iPhone HEIC needs `pip install pillow-heif`.
Exits 1 if the result still has hidden data or is over 500 KB.
"""
import io, os, re, sys
from PIL import Image, ImageCms, ImageOps

MAX_BYTES = 500 * 1024      # the CLAUDE.md / verify limit
TARGET = 480 * 1024         # a little room under the limit
LONG_EDGE = 1600            # about 2x the widest the page shows a photo


def is_heif(path):
    head = open(path, "rb").read(12)
    return head[4:8] == b"ftyp" and head[8:12] in (b"heic", b"heix", b"hevc", b"hevx", b"mif1", b"msf1")


def load(src):
    if is_heif(src):
        try:
            import pillow_heif
        except ImportError:
            sys.exit("This is an iPhone HEIC photo. First run:  python3 -m pip install --quiet pillow-heif\n"
                     "then run this command again.")
        pillow_heif.register_heif_opener()
    return Image.open(src)


def to_srgb(im):
    icc = im.info.get("icc_profile")
    has_alpha = im.mode in ("RGBA", "LA", "PA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if has_alpha else "RGB")
    if icc:
        try:
            im = ImageCms.profileToProfile(im, ImageCms.ImageCmsProfile(io.BytesIO(icc)),
                                           ImageCms.createProfile("sRGB"), outputMode=im.mode)
        except Exception:
            pass  # unreadable profile: keep the pixels as they are
    if has_alpha:  # flatten see-through areas onto white
        bg = Image.new("RGB", im.size, (255, 255, 255))
        bg.paste(im, mask=im.getchannel("A"))
        im = bg
    fresh = Image.new("RGB", im.size)  # a brand-new image: only pixels, no metadata
    fresh.paste(im)
    return fresh


def hidden_data(path):
    """List metadata blocks in a JPEG, PNG or WebP file by reading its structure."""
    data = open(path, "rb").read()
    found = []
    if data[:2] == b"\xff\xd8":                                   # JPEG segments
        i = 2
        while i + 4 <= len(data) and data[i] == 0xFF:
            marker, length = data[i + 1], int.from_bytes(data[i + 2:i + 4], "big")
            if marker == 0xDA:                                    # pixel data starts
                break
            seg = data[i + 4:i + 2 + length]
            if marker == 0xE1 and seg.startswith(b"Exif\x00\x00"):
                gps = b"\x88\x25" in seg or b"\x25\x88" in seg
                found.append("EXIF camera data" + (" with GPS location" if gps else ""))
            elif marker == 0xE1:
                found.append("XMP data" + (" with GPS location" if b"GPS" in seg else ""))
            elif marker == 0xED:
                found.append("IPTC data")
            elif marker == 0xFE:
                found.append("a hidden comment")
            i += 2 + length
    elif data[:8] == b"\x89PNG\r\n\x1a\n":                       # PNG chunks
        i = 8
        while i + 8 <= len(data):
            size, tag = int.from_bytes(data[i:i + 4], "big"), data[i + 4:i + 8]
            body = data[i + 8:i + 8 + size]
            if tag == b"eXIf":
                found.append("EXIF camera data")
            elif tag in (b"iTXt", b"tEXt", b"zTXt") and (b"XML:com.adobe.xmp" in body or b"GPS" in body):
                found.append("XMP data")
            i += 12 + size
    elif data[:4] == b"RIFF" and data[8:12] == b"WEBP":          # WebP chunks
        i = 12
        while i + 8 <= len(data):
            tag, size = data[i:i + 4], int.from_bytes(data[i + 4:i + 8], "little")
            if tag == b"EXIF":
                found.append("EXIF camera data")
            elif tag == b"XMP ":
                found.append("XMP data")
            i += 8 + size + (size & 1)
    return found


def save_under_limit(im, path):
    for q in (85, 82, 78, 74, 70, 65, 60, 55, 50):
        buf = io.BytesIO()
        im.save(buf, "JPEG", quality=q, optimize=True, progressive=True, subsampling="4:2:0")
        if buf.tell() <= TARGET:
            break
    with open(path, "wb") as f:
        f.write(buf.getvalue())
    return q


def main():
    args = sys.argv[1:]
    crop = None
    if "--crop" in args:
        k = args.index("--crop")
        cw, ch = (float(x) for x in args[k + 1].split(":"))
        crop = cw / ch
        del args[k:k + 2]
    if args[:1] == ["--check"]:
        bad = False
        for f in args[1:]:
            found = hidden_data(f)
            bad |= bool(found)
            print(f"{f}: " + ("clean" if not found else "HIDDEN DATA: " + ", ".join(found)))
        sys.exit(1 if bad else 0)
    if len(args) != 2:
        sys.exit(__doc__)
    src, out = args
    if not re.fullmatch(r"assets/\d{4}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*\.jpg", out):
        sys.exit("Name the new file like assets/2026-11-team-photo.jpg (year-month, lowercase words, hyphens).")
    if os.path.exists(out):
        sys.exit(f"{out} already exists, and an archived edition may use it. Pick a new name.")
    im = load(src)
    im = ImageOps.exif_transpose(im)              # upright, using the Orientation tag
    im = to_srgb(im)
    if crop:  # cut equal amounts from both sides (or top and bottom) to fit the frame
        w, h = im.size
        if w / h > crop:
            nw = round(h * crop); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else:
            nh = round(w / crop); im = im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh))
    im.thumbnail((LONG_EDGE, LONG_EDGE), Image.Resampling.LANCZOS)  # never enlarges
    q = save_under_limit(im, out)
    size, found = os.path.getsize(out), hidden_data(out)
    problems = found + ([f"{size // 1024} KB is over 500 KB"] if size > MAX_BYTES else [])
    print(f"{out}: {im.width}x{im.height} px, {size // 1024} KB (JPEG quality {q}), "
          + ("no hidden data (no GPS location)" if not problems else "PROBLEM: " + "; ".join(problems)))
    print(f'Use in index.html: <img src="{out}" alt="..." width="{im.width}" height="{im.height}">')
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
