import { asset, hasAsset, assetId } from "@/lib/images"
import sources from "@/lib/image-sources.json"
import manifest from "@/lib/image-manifest.json"
import fs from "node:fs"
import path from "node:path"

describe("self-hosted images", () => {
    it("every image the pages use is in the manifest, with files on disk", () => {
        for (const f of sources.files) {
            expect(hasAsset(f), f).toBe(true)
            for (const v of (manifest as any)[assetId(f)].files) expect(fs.existsSync(path.join("public", v.src)), v.src).toBe(true)
        }
    })

    it("returns a local WebP with a srcset and intrinsic size", () => {
        const img = asset("bEbCD30d6mkFM0a6Oqcd2PBUU.png", "Reverse-engineering round")!
        expect(img.src).toMatch(/^\/images\/bEbCD30d6mkFM0a6Oqcd2PBUU-\d+\.webp$/)
        expect(img.srcSet).toContain("800w")
        expect(img.width).toBeGreaterThan(0)
        expect(img.alt).toBe("Reverse-engineering round")
    })

    it("an unknown image has no src, so components show the placeholder", () => {
        expect(asset("doesNotExist.png", "x")).toEqual({ alt: "x" })
    })
})
