---
name: add-photo
description: Prepare a photo for the Inside ISS newsletter page. Removes hidden GPS location and camera data, turns it the right way up, and shrinks it under 500 KB. Use whenever the user attaches a photo or a Word/PDF file with pictures for the newsletter, or asks to add or replace an image.
allowed-tools: Bash(python3 ${CLAUDE_SKILL_DIR}/scripts/prepare_photo.py *) Bash(python3 .claude/skills/add-photo/scripts/prepare_photo.py *)
---

# Add a photo to the newsletter

Never copy a photo straight into `assets/`. Photos from phones and cameras often contain the exact GPS location where they were taken, and this page is public.

1. **Find the file.** A photo attached in this session is visible to you, and the message also says where it was saved ("The attached image is also saved at ..."). Other files (Word, PDF, iPhone HEIC) show up as an `@"<path>"` reference. Use that path. If there is no path, ask the user to attach it again.
2. **Pictures inside Word or PDF files** keep their hidden data too. Pull them out first: for a .docx, `unzip -j -o "<file.docx>" 'word/media/*' -d /tmp/photos`; for a .pdf, `pdfimages -all "<file.pdf>" /tmp/photos/img`. Treat each picture as an attached photo.
3. **Ask before using it** (AskUserQuestion): who or what is in the photo (use names exactly as given, never guess), whether we have the right to use it and the people in it are OK with a public page, and where on the page it goes.
4. **Make the web copy:** `python3 ${CLAUDE_SKILL_DIR}/scripts/prepare_photo.py "<source>" assets/YYYY-MM-short-name.jpg` (add `--crop 16:9` to match the data-center photo's shape). Use the edition month and 2 to 4 words in the name, and never overwrite an existing file in `assets/`. iPhone HEIC files need `python3 -m pip install --quiet pillow-heif` first; the script says so.
5. **Write alt text:** one plain sentence, about 15 words or fewer, saying what matters for the story. Don't start with "photo of". Use `alt=""` only for pure decoration. Show it to the user for approval.
6. Add the image to `index.html` with `width` and `height` attributes, then run the `verify` skill. It fails if any image still has hidden data.

If attaching doesn't work, tell the user to remove the location first (Windows: right-click the photo > Properties > Details > "Remove Properties and Personal Information" > "Create a copy with all possible properties removed"), then upload that copy on GitHub. Still run step 4 on it afterward.
