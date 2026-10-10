// Post-build checks:
//  1. Nothing the site serves points at Framer (no framer.com / framerusercontent.com / framer.website / framer.app).
//  2. Every image the pages use exists locally in public/images.
// Exits non-zero on any failure, so it can gate a deploy (npm run check).
import fs from "node:fs/promises"
import path from "node:path"

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const BANNED = /framer(usercontent)?\.com|framer\.website|framer\.app|framerstatic|framer-motion/i
const SCAN = [".next/static", ".next/server/app", "public"]
const TEXT = /\.(js|mjs|css|html|json|rsc|txt|xml|svg|body|meta)$/i
const problems = []

async function walk(dir) {
    let entries = []
    try {
        entries = await fs.readdir(dir, { withFileTypes: true })
    } catch {
        return
    }
    for (const e of entries) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) await walk(p)
        else if (TEXT.test(e.name)) {
            const s = await fs.readFile(p, "utf8")
            const m = s.match(BANNED)
            if (m) problems.push(`${path.relative(ROOT, p)} mentions "${m[0]}"`)
        }
    }
}

try {
    await fs.access(path.join(ROOT, ".next/server/app"))
} catch {
    console.error("No build found. Run `npm run build` first.")
    process.exit(1)
}
for (const d of SCAN) await walk(path.join(ROOT, d))

const { files } = JSON.parse(await fs.readFile(path.join(ROOT, "lib/image-sources.json"), "utf8"))
const manifest = JSON.parse(await fs.readFile(path.join(ROOT, "lib/image-manifest.json"), "utf8"))
for (const f of files) {
    const id = f.replace(/\.[^.]+$/, "")
    const entry = manifest[id]
    if (!entry) {
        problems.push(`image ${id} is missing from lib/image-manifest.json (run npm run fetch-assets)`)
        continue
    }
    for (const v of entry.files) {
        try {
            await fs.access(path.join(ROOT, "public", v.src))
        } catch {
            problems.push(`image file missing: public${v.src}`)
        }
    }
}

if (problems.length) {
    console.error("✗ Build check failed:\n  " + problems.join("\n  "))
    process.exit(1)
}
console.log(`✓ No Framer references in the build output, and all ${files.length} images are self-hosted.`)
