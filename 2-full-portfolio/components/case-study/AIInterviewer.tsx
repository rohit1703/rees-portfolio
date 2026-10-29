"use client"
// AI Interviewer case study page. Layout, scroll behaviour, type and colour come from CaseStudyKit.
import * as React from "react"
import { CaseStudyShell, C, pickImage, Visual, vis, full, Eyebrow, H2, H3, P, B, Note, Bullets, Flow, Stats, Cards, Table, Split, Column, Hero, Rail, StepList, Short, Fit, Footer } from "./kit"
import { asset } from "@/lib/images"
import { useInternalLinks } from "@/lib/useInternalLinks"
import type { KitProps, Scene, ImageValue } from "./kit"

// Body font: Instrument Sans (free stand-in for Trivia Sans), self-hosted in /public/fonts.
const bodyFontOr = (v: KitProps["bodyFont"]) => (v?.fontFamily && !/^\W*Inter\b/i.test(v.fontFamily) ? v : { fontFamily: '"Instrument Sans"' })
// "Back to portfolio" lands on this project's card on the home page. An old "/" value counts as unset.
const homeLink = (v: string | undefined) => (!v || v === "/" ? "/#ai-interviewer" : v)

// Before (AI-08) is the old cluttered instructions screen; After (AI-09) is the "Interview Hub" pre-test screen.
const IMG: Record<string, ImageValue> = {
    heroImage: asset("bEbCD30d6mkFM0a6Oqcd2PBUU.png", "The reverse-engineering round"),
    taPersona: asset("ypGhEoNCs14hvng9ujr5jVvyY.png", "TA and recruiter persona"),
    candidatePersona: asset("ZP0snmVycYABseVeCRSJNLYEVIg.png", "Candidate persona"),
    journeyMap: asset("tn6v94zpPiVuRrIiRpMtMIkw.png", "User journey map"),
    kano: asset("J21M6RvyQtb5SIdWuH0MuDudoc.png", "Kano prioritisation"),
    beforeImage: asset("rEcpyHGHPDD3fGnXmdWqB436aq0.png", "Before: the first version"),
    afterImage: asset("fxZNi6a29NB3vtfR33qxXd404vo.png", "After: the pre-test screen"),
    dashboardImage: asset("bRpe7QCtV8t2Rkixk4fB2qXVjpM.png", "Interview analysis report dashboard"),
}

type Props = KitProps & {
    heroImage?: ImageValue
    taPersona?: ImageValue
    candidatePersona?: ImageValue
    journeyMap?: ImageValue
    kano?: ImageValue
    v1Media?: string
    v2Media?: string
    beforeImage?: ImageValue
    afterImage?: ImageValue
    proctoringMedia?: string
    dashboardImage?: ImageValue
    nextLink?: string
    backLink?: string
    style?: React.CSSProperties
}

const NAV = ["Overview", "Where AI belonged", "Version 1", "What launch showed", "Version 2", "Nervous candidates", "Reflection"]

/**
 * AI Interviewer case study page.
 */
export default function AIInterviewerCaseStudy(props: Props) {
    const img = (k: keyof typeof IMG) => pickImage(props[k as keyof Props] as ImageValue, IMG[k])
    const { nextLink = "/sdk-manager" } = props
    const backLink = homeLink(props.backLink)
    const onLinks = useInternalLinks()

    const scenes: Scene[] = [
        {
            kind: "flow",
            nav: 0,
            node: (m) => (
                <Hero
                    m={m}
                    tags={["Sole Designer", "Internal AI MVP"]}
                    title="AI Interviewer"
                    subtitle="An internal web app that runs the first round of technical screening, so engineers don't have to."
                    cells={[
                        ["Role", "UX Designer (sole designer)"],
                        ["Timeline", "~6 weeks to MVP · launched Jan 2026 · reworked Jul 2026"],
                        ["Team", "3 data scientists, 1 front-end, 1 back-end, 1 DevOps, me"],
                        ["Platform", "Internal web app"],
                    ]}
                    brief={[
                        ["Problem", "Engineers lost hours to first-round technical interviews. Version 1 was beaten by candidates using AI."],
                        ["My decision", "Test understanding, not output. Candidates explain and debug AI-written code, then design a system with an AI chatbot."],
                        ["Final design", "Two proctored candidate rounds, dashboards for TA, recruiters and leadership, and a feedback email to every candidate."],
                        ["Result", "650+ candidates screened, 400+ engineer hours saved (TA's figures). Rebuilt in 4 weeks."],
                    ]}
                    image={img("heroImage")}
                    label="AI-05 · Reverse-engineering round"
                />
            ),
        },
        {
            kind: "flow",
            nav: 0,
            node: (m) => (
                <Rail
                    m={m}
                    items={[
                        [
                            "Outcome",
                            <Stats
                                m={m}
                                items={[
                                    ["650+", "candidates screened since launch (TA team's figure)"],
                                    ["400+", "engineer hours saved on first-round interviews (TA team's figure)"],
                                    ["4 weeks", "to rebuild after candidates used AI to pass"],
                                ]}
                            />,
                        ],
                        [
                            "My role",
                            <Bullets
                                items={[
                                    "Only designer on a seven-person team.",
                                    "Designed the full platform: the candidate assessment, plus dashboards for TA (Talent Acquisition), recruiters and leadership.",
                                    "Ran the early POC (proof of concept) testing and the TA interviews, and synthesised the findings.",
                                    "The tool is used in real hiring. This is Version 2, rebuilt after launch.",
                                ]}
                            />,
                        ],
                        [
                            "How it works today",
                            <>
                                <P>
                                    <B>Two rounds, then review.</B>
                                </P>
                                <Cards
                                    m={m}
                                    items={[
                                        ["1 · Reverse engineering", "Candidates get AI-written code. They explain what it does, how it works, and find its errors."],
                                        ["2 · System design", "Candidates solve a design problem with an AI chatbot. The AI scores them partly on how much guidance they need."],
                                        ["3 · Review", "TA, recruiters and leadership see results, proctoring flags and each candidate's hiring status on their own dashboards."],
                                        ["4 · Feedback", "Every candidate gets an email on how they performed (not the final result)."],
                                    ]}
                                />
                                <Note>
                                    <B>Early signal.</B> Delivery managers re-interviewed a few Version 2 passers and found them as capable as their scores. Version 1 passers had shown clear gaps in concepts they'd scored full marks on. Small sample, but the first sign the new rounds measure real understanding.
                                </Note>
                            </>,
                        ],
                    ]}
                />
            ),
        },
        {
            kind: "steps",
            nav: 1,
            count: 3,
            node: (m) => (
                <StepList
                    m={m}
                    eyebrow="01"
                    title="Where AI belonged"
                    intro={
                        <>
                            <P style={{ color: C.ink }}>
                                <B>Decision: AI only in the system design round. Everything else stays a familiar assessment.</B>
                            </P>
                            <P>The most ambitious idea was an AI voice running the whole interview. Here's what decided it, in order:</P>
                        </>
                    }
                    points={[
                        { t: "Build time", b: "Engineering said a full AI interviewer couldn't be built in the time we had. This settled it." },
                        {
                            t: "POC testing",
                            b: (
                                <>
                                    I'd put junior employees through an early proof of concept, and what I saw backed the call. Their confidence dropped as they went:
                                    <Bullets items={["they couldn't tell whether the AI understood them", "the voice felt strange to talk to", "people less comfortable in English struggled to explain out loud"]} />
                                </>
                            ),
                        },
                        { t: "TA interviews", b: "TA raised the same worry: if candidates don't trust the process, the results aren't useful." },
                    ]}
                />
            ),
        },
        {
            kind: "h",
            nav: 2,
            panels: [
                {
                    w: 0.95,
                    render: (m) => (
                        <Split
                            m={m}
                            left={
                                <>
                                    <Eyebrow>02</Eyebrow>
                                    <H2 m={m}>Version 1: three rounds</H2>
                                    <P>
                                        <B>Shipped in about six weeks: Technical MCQ → Coding → System design (AI here).</B>
                                    </P>
                                    <P>Research I built before any design:</P>
                                    <Bullets
                                        items={[
                                            <>
                                                <B>TA and recruiter persona</B>, from the TA interviews.
                                            </>,
                                            <>
                                                <B>Candidate persona</B>, from secondary research. A deliberate worst case: the least experienced candidate on their most stressful day. If it worked for them, it would work for everyone.
                                            </>,
                                            <>
                                                <B>User journey map.</B>
                                            </>,
                                            <>
                                                <B>Kano prioritisation</B>, run with the team to set the MVP scope.
                                            </>,
                                        ]}
                                    />
                                </>
                            }
                            right={
                                <>
                                    <Visual image={img("taPersona")} label="AI-07 · TA persona" caption="TA and recruiter persona, from the TA interviews" style={vis(m, "4 / 3")} />
                                    <Visual image={img("candidatePersona")} label="AI-06 · Candidate persona" caption="Candidate persona: a deliberate worst case, from secondary research" style={vis(m, "4 / 3")} />
                                </>
                            }
                        />
                    ),
                },
                {
                    w: 1.1,
                    render: (m) => (
                        <div style={{ display: "grid", gridTemplateColumns: m.narrow ? "minmax(0,1fr)" : "repeat(2, minmax(0,1fr))", gap: m.narrow ? 20 : 32, height: m.linear ? "auto" : "100%" }}>
                            <Visual image={img("journeyMap")} label="AI-01 · Journey map" caption="User journey map" style={full(m, "4 / 3")} />
                            <Visual image={img("kano")} label="AI-02 · Kano" caption="Kano prioritisation" style={full(m, "4 / 3")} />
                        </div>
                    ),
                },
                {
                    w: 1,
                    render: (m) => (
                        <Split
                            m={m}
                            left={
                                <>
                                    <P>
                                        <B>Why a familiar format:</B> I based it on coding-test platforms candidates already know, so nobody had to learn a new interface under time pressure. The AI chatbot only appeared in system design.
                                    </P>
                                    <Flow items={["Technical MCQ", "Coding", "System design · AI here"]} highlight={[2]} />
                                </>
                            }
                            right={<Visual file={props.v1Media} label="AI-03 · Version 1 video" caption="Version 1: three rounds" style={vis(m)} />}
                        />
                    ),
                },
            ],
        },
        {
            kind: "flow",
            nav: 3,
            node: (m) => (
                <Short m={m} eyebrow="03" title="What launch showed">
                    <P style={{ fontSize: 19, lineHeight: 1.6, color: C.ink }}>
                        <B>Candidates were using AI to pass the two automated rounds.</B>
                    </P>
                    <P style={{ fontSize: 19, lineHeight: 1.6 }}>TA saw a pattern: full marks on MCQ and coding, then poor results in system design. Too consistent to be chance.</P>
                </Short>
            ),
        },
        {
            kind: "flow",
            nav: 4,
            fit: true,
            node: (m) => (
                <Fit m={m}>
                    <Split
                        m={m}
                        left={
                            <>
                                <Eyebrow>04</Eyebrow>
                                <H2 m={m}>Version 2: testing understanding</H2>
                                <P style={{ color: C.ink }}>
                                    <B>We couldn't stop candidates using AI. So the round now checks whether they understand what AI produces.</B>
                                </P>
                                <Table
                                    small
                                    maxWidth={560}
                                    rows={[
                                        ["Round", "Change", "Note"],
                                        ["MCQ", "Dropped", "The team's decision"],
                                        ["Coding", "Became reverse engineering: explain AI-written code", "My redesign"],
                                        ["System design", "Stayed", "The one round that had held up"],
                                    ]}
                                />
                            </>
                        }
                        right={<Visual file={props.v2Media} label="AI-04 · Version 2 video" caption="Version 2: two rounds" style={vis(m)} />}
                    />
                </Fit>
            ),
        },
        {
            kind: "h",
            nav: 5,
            panels: [
                {
                    w: 0.62,
                    render: (m) => (
                        <Column m={m}>
                            <Eyebrow>05</Eyebrow>
                            <H2 m={m}>Designing for nervous candidates</H2>
                            <P style={{ color: C.ink }}>
                                <B>A nervous candidate scores below their level, which makes results less accurate.</B>
                            </P>
                            <P>My first candidate interface had the right information but was cluttered. I simplified the layout and added:</P>
                            <Bullets
                                items={[
                                    <>
                                        <B>A pre-test screen</B> with instructions and the timer, so candidates know what's coming before the clock starts.
                                    </>,
                                    <>
                                        <B>Tooltips</B> explaining each part of the interface before the test begins.
                                    </>,
                                    <>
                                        <B>A feedback email</B> after the assessment (my suggestion), so candidates aren't left waiting without hearing anything.
                                    </>,
                                ]}
                            />
                            <Note>
                                <B>Hypothesis, not measured.</B> We haven't tested whether these reduce anxiety.
                            </Note>
                        </Column>
                    ),
                },
                { w: 0.78, render: (m) => <Visual image={img("beforeImage")} label="AI-08 · Before" caption="Before: the first version" style={full(m)} /> },
                { w: 0.78, render: (m) => <Visual image={img("afterImage")} label="AI-09 · After" caption="After: the pre-test screen" style={full(m)} /> },
                {
                    w: 1,
                    render: (m) => (
                        <Split
                            m={m}
                            cols="minmax(0,0.75fr) minmax(0,1.25fr)"
                            left={
                                <>
                                    <H3>Proctoring</H3>
                                    <Bullets
                                        items={[
                                            <>
                                                <B>Before the test:</B> candidates allow full-screen recording and camera access.
                                            </>,
                                            <>
                                                <B>During:</B> the system flags responses when it detects multiple faces or tab switching.
                                            </>,
                                            <>
                                                <B>Where flags go:</B> to reviewers, where TA decides. They never interrupt the candidate mid-test.
                                            </>,
                                        ]}
                                    />
                                </>
                            }
                            right={<Visual file={props.proctoringMedia} label="AI-11 · Proctoring video" caption="Permissions and proctoring" style={vis(m)} />}
                        />
                    ),
                },
                {
                    w: 1,
                    render: (m) => (
                        <Split
                            m={m}
                            cols="minmax(0,0.75fr) minmax(0,1.25fr)"
                            left={
                                <>
                                    <H3>Dashboards</H3>
                                    <P>TA, recruiters and leadership each see results, proctoring flags and each candidate's place in the hiring process.</P>
                                </>
                            }
                            right={<Visual image={img("dashboardImage")} label="AI-10 · Dashboard" caption="Interview analysis report dashboard" style={vis(m)} />}
                        />
                    ),
                },
            ],
        },
        {
            kind: "flow",
            nav: 6,
            node: (m) => (
                <div style={{ padding: m.narrow ? "64px 0 80px" : "14vh 0 18vh", maxWidth: 760 }}>
                    <H2 m={m}>What didn't get built</H2>
                    <P>
                        <B>Closing proctoring gaps.</B> The system is easy to get around: someone off-camera can help, or a candidate can read from a second screen without switching tabs. I proposed detecting other voices and tracking eye movement. Both were cut for technical reasons. If they were added, I'd make sure flags still go to a human reviewer and never reject a candidate automatically, since eye tracking in particular produces false flags.
                    </P>
                    <P>
                        <B>Help during the test.</B> If a connection drops mid-test, there's nobody to contact. I wanted built-in support so a technical problem doesn't become panic about the result. Not built.
                    </P>
                    <div style={{ height: 32 }} />
                    <H2 m={m}>What I learned</H2>
                    <P>
                        <B>Build time settled the biggest decision. My part was testing it with people.</B> The POC showed the constraint pointed the right way: a fully AI-run interview would have cost candidates' trust. Keeping the rest familiar is what made a 6-week ship possible.
                    </P>
                    <P>
                        <B>Candidates will bring AI to an AI assessment.</B> Version 1 tested skills AI could fake. Version 2 assumes candidates use AI, and tests whether they understand the output.
                    </P>
                    <Footer m={m} nextLabel="SDK Manager" nextHref={nextLink} backHref={backLink} />
                </div>
            ),
        },
    ]

    return (
        <div onClick={onLinks} style={{ display: "contents" }}>
            <CaseStudyShell {...props} bodyFont={bodyFontOr(props.bodyFont)} title="AI Interviewer" nav={NAV} scenes={scenes} />
        </div>
    )
}

