"use client"
// SDK Manager case study page. Layout, scroll behaviour, type and colour come from CaseStudyKit.
import * as React from "react"
import { CaseStudyShell, Big, C, pickImage, Visual, vis, Eyebrow, H2, H3, P, B, Note, Bullets, Flow, Stats, Table, Split, Column, Hero, Rail, StepList, Fit, Footer } from "./kit"
import { asset } from "@/lib/images"
import { useInternalLinks } from "@/lib/useInternalLinks"
import type { KitProps, Scene, ImageValue, Mode } from "./kit"

// Body font: Instrument Sans (free stand-in for Trivia Sans), self-hosted in /public/fonts.
const bodyFontOr = (v: KitProps["bodyFont"]) => (v?.fontFamily && !/^\W*Inter\b/i.test(v.fontFamily) ? v : { fontFamily: '"Instrument Sans"' })
// "Back to portfolio" lands on this project's card on the home page. An old "/" value counts as unset.
const homeLink = (v: string | undefined) => (!v || v === "/" ? "/#sdk-manager" : v)

const IMG = {
    hero: asset("tcEakss8cGtH8q95eZdTrvcEs.png", "SDK Manager overview: every SDK group with its published and draft counts"),
    journeyMap: asset("K6zRjeKKMVjxZ71OK0q9LytsSU.png", "A journey map from before I joined"),
    droppedDropdown: asset("lUJ69Io7qh13fD3DacNhBouL034.png", "Dropped: screens split into workflow tabs, previewed one at a time"),
    droppedUploadFirst: asset("492QZ7djP2wsozcOVR24LAawEA.png", "Dropped: upload first"),
    droppedToggle: asset("6N4K5CS1XX0qxsjRsNXfLaqsM.png", "Dropped: a Select / Upload toggle"),
    droppedSplit: asset("HHff9zSr43b32NdAsbzNefQed5k.png", "Dropped: a Screens / Preview split"),
    catalogs: asset("kFQvab5XjHsog35HiSAgrXFgFo.png", "Catalogs"),
    configurations: asset("CxnOyN4LzT1Tn9GfVskwqjJOUOI.png", "Configurations"),
    restore: asset("xB4uSCSHhH5VkpN1wM3mDuSJc.png", "Restoring a deleted SDK"),
    templates: asset("IlnSjA3XszwsQQszStv8vVGdZ0.png", "Template catalog"),
}
type ImgKey = keyof typeof IMG

type Props = KitProps &
    Partial<Record<ImgKey, ImageValue>> & {
        heroMedia?: string
        inheritedMedia?: string
        finalMedia?: string
        staticMedia?: string
        nextLink?: string
        backLink?: string
        style?: React.CSSProperties
    }

const NAV = ["Overview", "What I worked from", "Assigning branding", "Tried and dropped", "Static components", "Reflection"]

function Dropped({ m, title, body, image, label }: { m: Mode; title: string; body: React.ReactNode; image: ImageValue; label: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", height: m.linear ? "auto" : "100%", gap: 16 }}>
            <div>
                <H3>{title}</H3>
                <P style={{ marginBottom: 0 }}>
                    <B>Why it was dropped:</B> {body}
                </P>
            </div>
            <Visual image={image} label={label} style={m.linear ? { aspectRatio: "16 / 10" } : { flex: 1 }} />
        </div>
    )
}

/**
 * SDK Manager case study page.
 */
export default function SDKManagerCaseStudy(props: Props) {
    const img = (k: ImgKey) => pickImage(props[k], IMG[k])
    const { nextLink = "/pet-health-scan" } = props
    const backLink = homeLink(props.backLink)
    const onLinks = useInternalLinks()

    const scenes: Scene[] = [
        {
            kind: "flow",
            nav: 0,
            node: (m) => (
                <Hero
                    m={m}
                    tags={["Sole Designer", "B2B No-Code Platform"]}
                    title="SDK Manager"
                    subtitle="Redesigning how brand SDKs get branded and built, in a no-code desktop web app."
                    cells={[
                        ["Role", "UX Designer. Joined Feb 2025, sole designer since Apr 2025"],
                        ["Timeline", "Phase 1 shipped Jul 2025. Phase 2 in progress"],
                        ["Team", "1 BA · 3 backend · 4 frontend · 2 QA · 1 DevOps"],
                        ["Platform", "Desktop web app, no-code builder"],
                    ]}
                    brief={[
                        ["Problem", "Assigning branding took 4 steps, one hidden, so screens were missed before publish. Shared components were rebuilt on every screen."],
                        ["My decision", "Cut branding to 2 steps and flag missed screens before publish. Propose static components, built once per SDK."],
                        ["Final design", "A two-step branding flow with a pre-publish check, and static components every screen reuses."],
                        ["Result", "The BA's missed-screen reports stopped. A header change is 1 edit, not 1 per screen."],
                    ]}
                    file={props.heroMedia}
                    image={img("hero")}
                    label="SDK-12 · Overview"
                    caption="The SDK Manager overview"
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
                            "Context",
                            <>
                                <P>
                                    <B>What it is.</B> A no-code platform a global pet-care company uses to build branded SDKs for its brands. An SDK here is the set of screens behind a tool like a pet health scan, typically 23–28 screens. The Pet Health Scan Suite tools are built here.
                                </P>
                                <P>
                                    <B>Who uses it.</B> The company's brand and technology teams, who create, brand and publish SDKs for each brand.
                                </P>
                                <P>
                                    <B>Before the platform.</B> Every SDK was designed and built by hand: 2–3 weeks each, only 7–8 ever shipped.
                                </P>
                                <P>
                                    <B>Where I came in.</B> Another designer set the direction and early flows, then handed over two months after I joined. Since Apr 2025 I've been the only designer, working with a BA and engineering through Phase 1 and into Phase 2.
                                </P>
                            </>,
                        ],
                        [
                            "At a glance",
                            <>
                                <P>
                                    <B>My results first. The platform's result last.</B>
                                </P>
                                <Stats
                                    m={m}
                                    items={[
                                        ["Stopped", "The BA's missed-screen reports, after the branding redesign shipped (4 → 2 steps to choose a brand). Mine."],
                                        ["1 edit", "to change a header across a whole SDK, instead of one on each of 18–24 screens. Mine."],
                                        ["3–4 days", "to build an SDK, down from 2–3 weeks. 44+ SDKs published since Jul 2025. The platform as a whole."],
                                    ]}
                                />
                            </>,
                        ],
                        [
                            "What I did",
                            <>
                                <Bullets
                                    items={[
                                        <>
                                            <B>Redesigned how branding is assigned:</B> 4 steps down to 2, with missed screens flagged before publish. Explored 5 versions.
                                        </>,
                                        <>
                                            <B>Proposed static components:</B> recurring components built once, not on every screen. Rejected at first, approved after QA hit the same problem.
                                        </>,
                                    ]}
                                />
                                <div style={{ fontSize: 13, color: C.muted, margin: "8px 0 8px" }}>How an SDK gets built</div>
                                <Flow items={["Create SDK", "Create version", "Build screens", "Assign branding (part 1)", "Publish"]} highlight={[2, 3]} />
                                <Note>Static components (part 2) live in Build screens.</Note>
                            </>,
                        ],
                    ]}
                />
            ),
        },
        {
            kind: "flow",
            nav: 1,
            fit: true,
            node: (m) => (
                <Fit m={m}>
                    <Split
                        m={m}
                        left={
                            <>
                                <Eyebrow>01</Eyebrow>
                                <H2 m={m}>What I worked from</H2>
                                <P style={{ color: C.ink }}>
                                    <B>No direct user research. Three secondhand sources:</B>
                                </P>
                                <Bullets
                                    items={[
                                        <>
                                            <B>Journey maps</B>, made before I joined: building a new SDK, editing an existing one.
                                        </>,
                                        <>
                                            <B>BA reports</B> from the teams using the platform, including screens missed during branding.
                                        </>,
                                        <>
                                            <B>QA feedback</B> from testers building SDKs end to end.
                                        </>,
                                    ]}
                                />
                            </>
                        }
                        right={<Visual image={img("journeyMap")} label="SDK-06 · Journey map" caption="A journey map from before I joined" style={vis(m, "4 / 3")} />}
                    />
                </Fit>
            ),
        },
        {
            kind: "flow",
            nav: 2,
            node: (m) => (
                <div style={{ padding: m.linear ? "64px 0" : "12vh 0 10vh" }}>
                    <Split
                        m={m}
                        left={
                            <>
                                <Eyebrow>02 · Assigning branding to an SDK version</Eyebrow>
                                <H2 m={m}>What I inherited</H2>
                                <P style={{ color: C.ink }}>
                                    <B>Two problems: a 4-step brand choice with a hidden step, and one long page where screens got missed.</B>
                                </P>
                                <P>Every SDK version gets one brand, which sets its images, colours and fonts.</P>
                                <P>
                                    <B>Choosing the brand.</B> Each card had a toggle, and the copy said to "individually enable brands", which suggested several could be on.
                                </P>
                                <Flow items={["Toggle", "Hidden menu", "Apply", "Save"]} highlight={[1]} />
                                <P>
                                    <B>Assigning images.</B> Every screen needing a brand image sat on one long page, each with its own upload box.
                                </P>
                                <P>
                                    <B>Diagnosis:</B> The BA reported missed screens. I traced it to page length: upload boxes were easy to scroll past, and the gap only showed up later as an error.
                                </P>
                            </>
                        }
                        right={<Visual file={props.inheritedMedia} label="SDK-01 · Inherited flow video" caption="The flow I inherited: four steps, one of them hidden" style={{ aspectRatio: "16 / 10" }} />}
                    />
                </div>
            ),
        },
        {
            kind: "steps",
            nav: 2,
            count: 5,
            node: (m) => (
                <StepList
                    m={m}
                    eyebrow="02 · Assigning branding"
                    title="What I changed"
                    points={[
                        {
                            t: "Two steps to choose a brand",
                            b: "Select a card, click Next. Copy says choose one. The checkbox sits outside the card so long names aren't cut off. Only published brands show, with filters by brand and country.",
                        },
                        {
                            t: "One section at a time",
                            b: "Screens grouped by workflow under dropdowns. Sections in bold, screens indented beneath.",
                        },
                        {
                            t: "Missed screens are visible",
                            b: "Grouping could hide closed screens, the same risk I was removing. So screens with an image get a check mark, and publishing with one missing shows a warning and a red mark on the dropdown.",
                        },
                        { t: "Select, don't drag", b: "One click applies an image." },
                        { t: "Apply to all", b: "One image to every screen at once." },
                    ]}
                    aside={<Visual file={props.finalMedia} label="SDK-02 · Final branding video" caption="Assigning branding: final design" style={vis(m)} />}
                    asideCols="minmax(0,0.95fr) minmax(0,1.05fr)"
                />
            ),
        },
        {
            kind: "h",
            nav: 3,
            panels: [
                {
                    w: 0.55,
                    render: (m) => (
                        <Column m={m}>
                            <Eyebrow>03</Eyebrow>
                            <H2 m={m}>What I tried and dropped</H2>
                            <P style={{ color: C.ink }}>
                                <B>5 versions, 4 dropped. Each taught me something about what the final design had to do.</B>
                            </P>
                        </Column>
                    ),
                },
                {
                    w: 0.7,
                    render: (m) => (
                        <Dropped
                            m={m}
                            title="Workflow tabs, one screen at a time (almost approved)"
                            body="Screens were split into tabs with one preview at a time, so there was no way to see which were done or flag the missing ones."
                            image={img("droppedDropdown")}
                            label="SDK-07 · Workflow tabs"
                        />
                    ),
                },
                {
                    w: 0.7,
                    render: (m) => <Dropped m={m} title="Upload first" body="Put the upload box above the brand images. Uploading new images is the less common task." image={img("droppedUploadFirst")} label="SDK-08 · Upload first" />,
                },
                {
                    w: 0.7,
                    render: (m) => (
                        <Dropped
                            m={m}
                            title="A Select / Upload radio toggle"
                            body="Kept the panel short, but only one option was visible at a time, so someone who needed to upload could miss it. The final design shows both."
                            image={img("droppedToggle")}
                            label="SDK-09 · Select / Upload toggle"
                        />
                    ),
                },
                {
                    w: 0.7,
                    render: (m) => (
                        <Dropped
                            m={m}
                            title="A Screens / Preview split"
                            body="Mirrored the builder's Sections / Preview pattern, so it would have felt familiar. But it brought back the long scroll, and switching views added clicks."
                            image={img("droppedSplit")}
                            label="SDK-10 · Screens / Preview split"
                        />
                    ),
                },
                {
                    w: 0.6,
                    render: (m) => (
                        <Column m={m}>
                            <Big m={m}>4 → 2</Big>
                            <H3>steps to choose a brand</H3>
                            <P>Shipped after Phase 1, with section-by-section image assignment and missed screens flagged before publish.</P>
                        </Column>
                    ),
                },
            ],
        },
        {
            kind: "steps",
            nav: 4,
            count: 4,
            node: (m) => (
                <StepList
                    m={m}
                    eyebrow="04 · Static components"
                    title="Build once, use on every screen"
                    intro={
                        <P>
                            <B>The problem:</B> brand header, tool header, feedback forms and result components appear on 18–24 of an SDK's 23–28 screens. The builder couldn't reuse a component, so users rebuilt each one every time. Slow, and every rebuild risked one screen drifting from the rest.
                        </P>
                    }
                    points={[
                        { t: "Build once", b: "A Static Components tab sits next to the Sections tab in Create SDK Version, using the same drag-and-drop builder." },
                        { t: "Place anywhere", b: 'Dropped onto screens as placeholders labelled "Static", so it\'s clear the content lives elsewhere.' },
                        { t: "Edit once", b: "One edit updates every screen that uses it." },
                        { t: "No per-screen override", b: "No SDK needed a different header on one screen, so I didn't add one." },
                    ]}
                    aside={<Visual file={props.staticMedia} label="SDK-14 · Static components video" caption="Static Components" style={vis(m)} />}
                    asideCols="minmax(0,0.95fr) minmax(0,1.05fr)"
                />
            ),
        },
        {
            kind: "flow",
            nav: 4,
            node: (m) => (
                <div style={{ padding: m.linear ? "64px 0" : "16vh 0 8vh", maxWidth: 760 }}>
                    <Eyebrow>04 · Static components</Eyebrow>
                    <H2 m={m}>It took two pitches</H2>
                    <Table
                        rows={[
                            ["First pitch", "During QA", "Second pitch"],
                            [
                                <>
                                    <B>Turned down.</B> A sizeable feature for frontend, and the benefit wasn't obvious yet.
                                </>,
                                <>
                                    <B>Same problem, seen first-hand.</B> Testers building full SDKs rebuilt the same headers on every screen.
                                </>,
                                <>
                                    <B>Approved.</B> The team had now felt the repetition, not just heard me describe it.
                                </>,
                            ],
                        ]}
                    />
                    <H3>Result: 1 edit instead of 1 per screen</H3>
                    <P>Shipped after Phase 1. Each SDK has 3–5 static components, each built once instead of on 18–24 screens. A header change is now 1 edit.</P>
                </div>
            ),
        },
        {
            kind: "flow",
            nav: 5,
            node: (m) => (
                <div style={{ padding: m.narrow ? "64px 0 80px" : "14vh 0 14vh", maxWidth: 900 }}>
                    <H2 m={m}>What I'd change</H2>
                    <P>
                        <B>Measure my own changes from the start.</B> The build-time numbers are for the whole platform. For my two changes I have no tracked time data: the BA's reports say missed screens stopped, but I can't say how much time was saved. Next time I'd agree 1–2 metrics with the BA before release.
                    </P>
                    <div style={{ height: 32 }} />
                    <H3>Other parts I designed</H3>
                    <Bullets items={["Template creation, including import from JSON", "Catalogs", "Configurations and validation across flows", "Configuration history with restore"]} />
                    <div style={{ display: "grid", gridTemplateColumns: m.narrow ? "minmax(0,1fr)" : "repeat(2, minmax(0,1fr))", gap: 24, marginTop: 16 }}>
                        <Visual image={img("catalogs")} label="SDK-03 · Catalogs" caption="Catalogs" style={{ aspectRatio: "16 / 10" }} />
                        <Visual image={img("configurations")} label="SDK-04 · Configurations" caption="Configurations" style={{ aspectRatio: "16 / 10" }} />
                        <Visual image={img("restore")} label="SDK-05 · Restore" caption="Restoring a deleted SDK" style={{ aspectRatio: "16 / 10" }} />
                        <Visual image={img("templates")} label="SDK-11 · Template catalog" caption="Template catalog" style={{ aspectRatio: "16 / 10" }} />
                    </div>
                    <Footer m={m} nextLabel="Pet Health Scan Suite" nextHref={nextLink} backHref={backLink} />
                </div>
            ),
        },
    ]

    return (
        <div onClick={onLinks} style={{ display: "contents" }}>
            <CaseStudyShell {...props} bodyFont={bodyFontOr(props.bodyFont)} title="SDK Manager" nav={NAV} scenes={scenes} />
        </div>
    )
}

