// Turns a folder of source images into web-ready WebP files in public/images, in up to three widths,
// and writes lib/image-manifest.json (sizes + file list) that lib/images.ts reads.
//
//   node scripts/import-assets.mjs <folder>
//
// Files are matched by name without extension, e.g. "bEbCD30d6mkFM0a6Oqcd2PBUU.png" or ".webp".
// To replace an image on the site, drop a new file with the same base name into the folder and re-run.
import fs from "node:fs/promises"
import path from "node:path"
import sharp from "sharp"

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const OUT = path.join(ROOT, "public/images")
const MANIFEST = path.join(ROOT, "lib/image-manifest.json")
const WIDTHS = [800, 1600, 2400]

export async function importFolder(dir) {
    await fs.mkdir(OUT, { recursive: true })
    let manifest = {}
    try {
        manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8"))
    } catch {}
    const files = (await fs.readdir(dir)).filter((f) => /\.(png|jpe?g|webp|avif|gif)$/i.test(f))
    for (const f of files) {
        const id = f.replace(/\.[^.]+$/, "")
        const src = path.join(dir, f)
        const meta = await sharp(src).metadata()
        const widths = WIDTHS.filter((w) => w < meta.width)
        if (widths.length < WIDTHS.length) widths.push(Math.min(meta.width, WIDTHS[WIDTHS.length - 1]))
        const out = []
        for (const w of [...new Set(widths)]) {
            const name = `${id}-${w}.webp`
            await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(path.join(OUT, name))
            out.push({ w, src: `/images/${name}` })
        }
        manifest[id] = { width: meta.width, height: meta.height, files: out }
        console.log(`✓ ${id}  ${meta.width}×${meta.height}  → ${out.map((o) => o.w).join(", ")}`)
    }
    const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)))
    await fs.writeFile(MANIFEST, JSON.stringify(sorted, null, 2) + "\n")
    console.log(`\n${files.length} image(s) processed, manifest has ${Object.keys(sorted).length}.`)
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
    const dir = process.argv[2]
    if (!dir) {
        console.error("Usage: node scripts/import-assets.mjs <folder-of-images>")
        process.exit(1)
    }
    importFolder(path.resolve(dir)).catch((e) => {
        console.error(e)
        process.exit(1)
    })
}
