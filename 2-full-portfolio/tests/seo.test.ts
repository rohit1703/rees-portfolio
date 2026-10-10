import sitemap from "@/app/sitemap"
import robots from "@/app/robots"
import { metadata } from "@/app/layout"

it("sitemap lists the home page and the three case studies", () => {
    const urls = sitemap().map((e) => new URL(e.url).pathname)
    expect(urls).toEqual(["/", "/ai-interviewer", "/sdk-manager", "/pet-health-scan"])
})

it("robots points at the sitemap and hides the theme comparison page", () => {
    const r = robots()
    expect(String(r.sitemap)).toMatch(/\/sitemap\.xml$/)
    expect(JSON.stringify(r.rules)).toContain("/ai-interviewer-poster")
})

it("site metadata keeps the original title and description", () => {
    expect((metadata.title as any).default).toBe("Reethika Chitithoti — UX Designer")
    expect(metadata.description).toMatch(/start by finding out where people get stuck/)
    expect((metadata.twitter as any).card).toBe("summary_large_image")
})

it("case-study pages keep the social card when they set their own Open Graph data", async () => {
    for (const slug of ["ai-interviewer", "sdk-manager", "pet-health-scan"]) {
        const { metadata: m } = await import(`@/app/${slug}/page`)
        expect(JSON.stringify(m.openGraph.images)).toContain("/opengraph-image")
        expect(m.twitter.card).toBe("summary_large_image")
    }
})
