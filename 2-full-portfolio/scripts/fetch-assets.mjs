// One-time migration helper: downloads the original images from the old Framer site's CDN into
// .asset-cache/, then runs import-assets on them. The built site never requests anything from there.
// Only needed if public/images is ever lost; the images are already committed to the repo.
import fs from "node:fs/promises"
import path from "node:path"
import { importFolder } from "./import-assets.mjs"

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..")
const CACHE = path.join(ROOT, ".asset-cache")
const { files } = JSON.parse(await fs.readFile(path.join(ROOT, "lib/image-sources.json"), "utf8"))
const ORIGIN = ["https://framer", "usercontent.com/images/"].join("")

await fs.mkdir(CACHE, { recursive: true })
let failed = 0
for (const f of files) {
    const dest = path.join(CACHE, f)
    try {
        await fs.access(dest)
        continue
    } catch {}
    try {
        const res = await fetch(ORIGIN + f)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        await fs.writeFile(dest, Buffer.from(await res.arrayBuffer()))
        console.log("↓", f)
    } catch (e) {
        failed++
        console.error("✗", f, e.message)
    }
}
await importFolder(CACHE)
if (failed) {
    console.error(`${failed} download(s) failed. Re-run to retry; the rest are cached.`)
    process.exit(1)
}
