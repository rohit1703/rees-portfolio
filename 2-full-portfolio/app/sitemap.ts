import type { MetadataRoute } from "next"
import { SITE_URL, CASE_STUDIES } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
    const now = new Date()
    return [
        { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
        ...CASE_STUDIES.map((c) => ({ url: `${SITE_URL}/${c.slug}`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
    ]
}
