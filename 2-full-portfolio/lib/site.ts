// Site-wide details used for metadata, the sitemap and social cards.
// The absolute origin matters: social previews fetch /opengraph-image from it, so a stale origin means no card.
// Order: NEXT_PUBLIC_SITE_URL if set, else the production domain Vercel exposes at build time (follows
// project renames and custom domains), else the last known vercel.app address.
const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || (vercelProduction ? `https://${vercelProduction}` : "https://reethika-chitithoti.vercel.app")).replace(/\/$/, "")
export const SITE_NAME = "Reethika Chitithoti"
export const SITE_TITLE = "Reethika Chitithoti — UX Designer"
export const SITE_DESCRIPTION =
    "Reethika Chitithoti, UX designer. I work on technical products, from an AI hiring tool to a no-code builder, and start by finding out where people get stuck."

export const CASE_STUDIES = [
    {
        slug: "ai-interviewer",
        title: "AI Interviewer",
        description: "Case study: designing an internal AI screening tool as the sole designer, and rebuilding it after candidates used AI to pass the automated rounds.",
    },
    {
        slug: "sdk-manager",
        title: "SDK Manager",
        description: "Case study: redesigning how brand SDKs get branded and built in a no-code desktop web app, as its sole designer.",
    },
    {
        slug: "pet-health-scan",
        title: "Pet Health Scan Suite",
        description: "Case study: finding out why pet owners abandon an AI dental scan, across white-label health-check tools on pet-brand websites.",
    },
] as const

/** The social card drawn by app/opengraph-image.tsx. Pages that set their own openGraph must list it again. */
export const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: SITE_TITLE }
