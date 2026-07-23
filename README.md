# Sumedh Gaikwad — Portfolio Website

A 7-page HTML/CSS/JS portfolio: a homepage plus six gallery pages, one per
art category. No build tools, no server, no database — everything runs by
just opening the HTML files in a browser.

## How to view it

Double-click `index.html` to open it in your browser. Click any of the six
folders (Portraits, Concept Art, Cover Art, Sequential Art, One Pager,
Character Designs) to browse that category.

## How to add your own art (no coding required)

Each category has its own folder inside `assets/`:

```
assets/
  portraits/
  character-concept/
  music-covers/
  sequential-art/
  one-pager/
  character-designs/
```

To add a piece of art:

1. **Copy your image file** (`.jpg`, `.png`, or `.webp`) into the matching
   folder — e.g. drop a portrait into `assets/portraits/`.
2. **Open the `images.js` file** inside that same folder in any text editor
   (Notepad, VS Code, etc).
3. **Add one line** to the list with your file name, for example:

   ```js
   window.GALLERY_IMAGES = [
     { file: "warrior-sketch.jpg", caption: "Warrior concept, ink + digital" },
     { file: "moonlit-portrait.png", caption: "" },
   ];
   ```

   The `caption` is optional — leave it as `""` if you don't want a label
   under the thumbnail. The order of this list is the order the art appears
   on the page, so put your newest or best work first.
4. **Save the file** and refresh the page in your browser — your art will
   appear in the gallery grid automatically.

That's it — no rebuilding, no uploading to a server, no touching any of the
other files.

## Project structure

```
sumedh-portfolio/
  index.html                 → Homepage (hero, about, folder grid)
  portraits.html             → Stylized Portraits gallery
  character-concept.html     → Character Concept Art gallery
  music-covers.html          → Music Cover Art gallery
  sequential-art.html        → Sequential Art gallery
  one-pager.html             → One Pager gallery
  character-designs.html     → Character Designs gallery
  css/style.css               → All site styling
  js/main.js                  → Navigation + scroll animations
  js/gallery.js                → Builds each gallery grid + lightbox
  assets/<category>/images.js  → The art list for that category (edit this)
  assets/<category>/           → Put your actual image files here
```

## Putting this online

If you'd eventually like a live link to share (instead of just opening the
files locally), you can drag this whole folder into a free static host like
Netlify Drop, GitHub Pages, or Vercel — no changes to the code are needed.

## Customizing text

- **Name / bio**: edit the "About Me" section in `index.html`.
- **Colors / fonts**: all defined at the top of `css/style.css` under
  `:root` — change the hex values there to re-theme the whole site.
