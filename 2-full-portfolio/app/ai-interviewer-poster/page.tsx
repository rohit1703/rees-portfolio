import type { Metadata } from "next"
import CaseStudy from "@/components/case-study/AIInterviewer"

// Comparison page: the AI Interviewer case study in the "Poster" theme. Kept out of search results.
export const metadata: Metadata = {
    title: "AI Interviewer (Poster theme)",
    robots: { index: false, follow: true },
    alternates: { canonical: "/ai-interviewer" },
}

export default function Page() {
    return (
        <main id="main" tabIndex={-1} style={{ outline: "none", background: "#fff" }}>
            <CaseStudy nextLink="/sdk-manager" theme="poster" smoothness={0.05} stackBelow={900} />
        </main>
    )
}
