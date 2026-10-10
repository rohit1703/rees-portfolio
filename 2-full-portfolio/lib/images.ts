// Local, self-hosted images. Every image on the site comes from /public/images, described by
// lib/image-manifest.json (written by scripts/fetch-assets.mjs or scripts/import-assets.mjs).
// If an image is missing from the manifest, components show a labelled placeholder instead of a broken image.
import manifest from "./image-manifest.json"

export type ImageValue = { src?: string; srcSet?: string; alt?: string; width?: number; height?: number } | undefined

type Entry = { width: number; height: number; files: { w: number; src: string }[] }
const MANIFEST = manifest as Record<string, Entry>

/** Strips the extension: "bEbCD30d6mkFM0a6Oqcd2PBUU.png" → "bEbCD30d6mkFM0a6Oqcd2PBUU". */
export const assetId = (file: string) => file.replace(/\.[a-z0-9]+$/i, "")

/** Looks up a local image by its original file name and returns src, srcSet and intrinsic size. */
export function asset(file: string, alt: string): ImageValue {
    const e = MANIFEST[assetId(file)]
    if (!e || !e.files.length) return { alt }
    const files = [...e.files].sort((a, b) => a.w - b.w)
    const largest = files[files.length - 1]
    return {
        src: largest.src,
        srcSet: files.length > 1 ? files.map((f) => `${f.src} ${f.w}w`).join(", ") : undefined,
        alt,
        width: e.width,
        height: e.height,
    }
}

/** True when every image in the list is present locally (used by tests and the build check). */
export const hasAsset = (file: string) => !!MANIFEST[assetId(file)]?.files.length
