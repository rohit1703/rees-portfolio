import type { Metadata } from "next"
import CaseStudy from "@/components/case-study/SDKManager"
import { CASE_STUDIES, OG_IMAGE } from "@/lib/site"

const cs = CASE_STUDIES[1]

export const metadata: Metadata = {
    title: cs.title,
    description: cs.description,
    alternates: { canonical: "/sdk-manager" },
    openGraph: { title: `${cs.title} · Reethika Chitithoti`, description: cs.description, url: "/sdk-manager", type: "article", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: `${cs.title} · Reethika Chitithoti`, description: cs.description, images: [OG_IMAGE.url] },
}

export default function Page() {
    return (
        <main id="main" tabIndex={-1} style={{ outline: "none" }}>
            <CaseStudy nextLink="/pet-health-scan" theme="pinterest" smoothness={0.05} stackBelow={900} inheritedMedia="/video/sdk-01-inherited-flow.mp4" finalMedia="/video/sdk-02-final-branding.mp4" staticMedia="/video/sdk-14-static-components.mp4" />
        </main>
    )
}
