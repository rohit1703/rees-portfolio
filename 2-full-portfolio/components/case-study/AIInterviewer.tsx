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
                            "Story",
                            <P>
                                I was the only designer on a seven-person team and designed the full platform: the candidate assessment and the dashboards for TA, recruiters and leadership. I also ran the early POC testing and the TA interviews and synthesised the findings. The tool is used in real hiring, and the version described here is the second one, rebuilt after launch.
                            </P>,
                        ],
                        [
                            "Outcome",
                            <Stats
                                m={m}
                                items={[
                                    ["650+", "candidates screened since launch, as reported by the TA team"],
                                    ["400+", "engineer hours saved on first-round interviews, as reported by the TA team"],
                                    ["4 weeks", "to rebuild after candidates used AI to pass the automated rounds"],
                                ]}
                            />,
                        ],
                        [
                            "What it is today",
                            <>
                                <P>Candidates complete two rounds:</P>
                                <Cards
                                    m={m}
                                    items={[
                                        ["1 · Reverse engineering", "Candidates are given code written by AI and have to explain what the code does, how it works and find errors in it."],
                                        ["2 · System design", "A system design problem with an AI chatbot. The AI scores candidates partly on how much guidance they need to solve."],
                                    ]}
                                />
                                <P>
                                    TA, recruiters and leadership review the results, proctoring flags, and each candidate's hiring status on their own dashboards. After the assessment, candidates get an email with feedback on how they performed, but not the final result.
                                </P>
                                <Note>
                                    <B>Early signal.</B> Delivery managers ran a second interview with a few of the candidates who passed Version 2, and found them as capable as their results suggested. Candidates who passed Version 1 had shown clear gaps in the very concepts they'd scored full marks on. It's a small sample, but it's the first sign the new rounds measure real understanding. The rest of this case study covers how it got here.
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
                        <P>
                            The product was a technical screening platform to replace the manual first round. Early on, the most ambitious idea was an AI voice that would run the whole interview. Here's what decided it, in order:
                        </P>
                    }
                    points={[
                        { t: "Build time", b: "Engineering said a full AI interviewer couldn't be built in the time we had. That settled it." },
                        {
                            t: "POC testing",
                            b: "I'd already put junior employees through an early proof-of-concept, and what I saw backed the call. Their confidence dropped as they went. They couldn't tell whether the AI had understood their answers, the voice felt strange to talk to, and people less comfortable in English struggled to explain their thinking out loud.",
                        },
                        { t: "TA interviews", b: "TA raised the same worry: if candidates don't trust the process, the results aren't useful." },
                    ]}
                    outro={
                        <P style={{ color: C.ink }}>
                            <B>So Version 1 became a familiar technical assessment, with the AI chatbot only in the system design round.</B>
                        </P>
                    }
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
                                    <H2 m={m}>Version 1: a three-round assessment</H2>
                                    <P>
                                        Before any design, I built the research foundation: a TA and recruiter persona from primary research (the TA interviews), a candidate persona from secondary research, a user journey map, and a Kano prioritisation run with the team to decide what the MVP included.
                                    </P>
                                    <P>
                                        <B>I built the candidate persona around a deliberate worst case:</B> the least experienced candidate, on their most stressful day. If the assessment worked for them, it would work for everyone else.
                                    </P>
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
                                        The first version had three rounds: technical MCQ, coding, and system design. I based the format on familiar coding-test platforms, which most candidates already know, so they wouldn't have to learn a new interface under time pressure. The AI chatbot only appeared in system design.
                                    </P>
                                    <Flow items={["Technical MCQ", "Coding", "System design · AI here"]} highlight={[2]} />
                                    <P>
                                        <B>It shipped in about six weeks.</B>
                                    </P>
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
                <Short m={m} eyebrow="03" title="What launch showed us">
                    <P style={{ fontSize: 19, lineHeight: 1.6 }}>
                        Soon after launch, TA noticed candidates getting full marks on MCQ and coding and then doing badly in system design. The gap was too consistent to be chance. Candidates were using AI tools to answer the two automated rounds.
                    </P>
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
                                <P>The team decided to drop the MCQ round. I redesigned the coding round into the reverse-engineering task: rather than writing code, candidates explain AI-written code.</P>
                                <P>We couldn't stop candidates from using AI, so the round now checks whether they understand what it produces. System design stayed, because it was the one round that had held up.</P>
                                <Table
                                    small
                                    maxWidth={560}
                                    rows={[
                                        [<s style={{ opacity: 0.6 }}>MCQ</s>, "Coding → Reverse engineering", "System design"],
                                        ["Dropped", "Explain AI-written code", "Stayed"],
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
                            <P>A job assessment is stressful, and a nervous candidate performs below their level, which makes the results less accurate.</P>
                            <P>My first candidate interface had all the right information but was cluttered. I simplified the layout and added:</P>
                            <Bullets
                                items={[
                                    <>
                                        <B>A pre-test screen</B> with instructions and the timer, so candidates know what's coming before the clock starts
                                    </>,
                                    <>
                                        <B>Tooltips</B> that explain each part of the interface before the test begins
                                    </>,
                                    <>
                                        <B>A feedback email</B> after the assessment, which I suggested so candidates know how they performed and what happens next instead of waiting without hearing anything
                                    </>,
                                ]}
                            />
                            <Note>The idea that these reduce anxiety is a hypothesis. We haven't measured it.</Note>
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
                                    <P>Before starting, candidates accept permissions for full-screen recording and camera access. During the test, the system detects multiple faces in the frame and switching between tabs, and flags the affected responses.</P>
                                    <P>Flags appear on the reviewer side, where TA decides what to do with them, rather than as warnings that interrupt the candidate during the test.</P>
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
                                    <P>TA, recruiters and leadership each see assessment results, proctoring flags and where each candidate is in the hiring process.</P>
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
                    <H2 m={m}>What didn't get built, and what I'd push for</H2>
                    <P>
                        <B>Closing the proctoring gaps.</B> The current system is easy to get around. Someone off-camera can help, or a candidate can read from a second screen without switching tabs. I proposed detecting other voices and tracking eye movement. Both were cut for technical reasons. If they were added, I'd make sure flags still go to a human reviewer and never reject a candidate automatically, since eye tracking in particular produces false flags.
                    </P>
                    <P>
                        <B>Help during the test.</B> If a candidate's connection drops or something breaks mid-test, there's nobody they can contact. I wanted a built-in way to reach support immediately, so a technical problem doesn't turn into panic about their result. It wasn't built.
                    </P>
                    <div style={{ height: 32 }} />
                    <H2 m={m}>What I learned</H2>
                    <P>
                        The biggest early decision, how much of the product AI should run, was settled by build time. My part was testing it with people, and the POC showed the constraint pointed the right way: a fully AI-run interview would have cost candidates' trust. Keeping the rest a familiar assessment is also what made the tool shippable in six weeks.
                    </P>
                    <P>
                        The second lesson came from launch: candidates will bring AI to an AI assessment. The first version tried to test skills the AI could fake. The second version assumes they'll use AI and tests whether they understand the output.
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

