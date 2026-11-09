import type { Metadata } from "next"
import CaseStudy from "@/components/case-study/TrustDesk"
import { CASE_STUDIES, OG_IMAGE } from "@/lib/site"

const cs = CASE_STUDIES[3]

export const metadata: Metadata = {
    title: cs.title,
    description: cs.description,
    alternates: { canonical: "/trust-desk" },
    openGraph: { title: `${cs.title} · Reethika Chitithoti`, description: cs.description, url: "/trust-desk", type: "article", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: `${cs.title} · Reethika Chitithoti`, description: cs.description, images: [OG_IMAGE.url] },
}

export default function Page() {
    return (
        <main id="main" tabIndex={-1} style={{ outline: "none" }}>
            <CaseStudy nextLink="/ai-interviewer" theme="pinterest" smoothness={0.05} stackBelow={900} />
        </main>
    )
}
