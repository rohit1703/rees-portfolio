import type { Metadata } from "next"
import CaseStudy from "@/components/case-study/AIInterviewer"
import { CASE_STUDIES, OG_IMAGE } from "@/lib/site"

const cs = CASE_STUDIES[0]

export const metadata: Metadata = {
    title: cs.title,
    description: cs.description,
    alternates: { canonical: "/ai-interviewer" },
    openGraph: { title: `${cs.title} · Reethika Chitithoti`, description: cs.description, url: "/ai-interviewer", type: "article", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: `${cs.title} · Reethika Chitithoti`, description: cs.description, images: [OG_IMAGE.url] },
}

export default function Page() {
    return (
        <main id="main" tabIndex={-1} style={{ outline: "none" }}>
            <CaseStudy nextLink="/sdk-manager" theme="pinterest" smoothness={0.05} stackBelow={900} />
        </main>
    )
}
