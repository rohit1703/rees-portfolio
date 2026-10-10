import fs from "node:fs"
import path from "node:path"

// The site's own source must not reference Framer's runtime, CDN or editor APIs.
// (scripts/fetch-assets.mjs is the one deliberate exception: a migration helper that never ships.)
const BANNED = /framerusercontent|framer\.com|framer\.website|framer\.app|from ["']framer|framer-motion|addPropertyControls|ControlType|RenderTarget/
const DIRS = ["app", "components", "lib"]

function files(dir: string): string[] {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)]))
}

it("no Framer references in app, components or lib", () => {
    const hits = DIRS.flatMap(files)
        .filter((f) => /\.(tsx?|css|json|mjs)$/.test(f))
        .filter((f) => BANNED.test(fs.readFileSync(f, "utf8")))
    expect(hits).toEqual([])
})
