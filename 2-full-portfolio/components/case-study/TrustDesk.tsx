"use client"
// Trust Desk case study page. Layout, scroll behaviour, type and colour come from CaseStudyKit.
// Images are not in yet: every visual slot shows its labelled placeholder until the file is added to IMG.
import * as React from "react"
import { CaseStudyShell, C, pickImage, Visual, Eyebrow, H2, H3, P, B, Note, Stats, Table, Split, Column, Hero, Rail, Footer } from "./kit"
import { asset } from "@/lib/images"
import { useInternalLinks } from "@/lib/useInternalLinks"
import type { KitProps, Scene, ImageValue, Mode } from "./kit"

// Body font: Instrument Sans (free stand-in for Trivia Sans), self-hosted in /public/fonts.
const bodyFontOr = (v: KitProps["bodyFont"]) => (v?.fontFamily && !/^\W*Inter\b/i.test(v.fontFamily) ? v : { fontFamily: '"Instrument Sans"' })
// "Back to portfolio" lands on this project's card on the home page. An old "/" value counts as unset.
const homeLink = (v: string | undefined) => (!v || v === "/" ? "/#trust-desk" : v)

// Add the file names here once the screenshots exist; until then each slot renders its placeholder.
// Slot numbers follow the order the images appear in the write-up.
const IMG = {
    hero: asset("", "Trust Desk: the return view in the built app"),
    ratingNode: asset("", "An agent node with its rating and autonomy"),
    editPrompt: asset("", "The edit prompt asking why the result is being changed"),
    delegateBefore: asset("", "The first Delegate screen as one long list"),
    beforeStart: asset("", "Before you start on the canvas with six agents"),
    returnView: asset("", "The return view after a six-agent run"),
    notifications: asset("", "Five phone notification screens"),
    profileBefore: asset("", "The first agent profile, a full page of tables"),
    profileAfter: asset("", "The redesigned agent profile drawer"),
    checker: asset("", "The checker's profile drawer"),
    failure: asset("", "The failure view showing a mistake the checker missed"),
    study: asset("", "The study page: plain summary and trust layer side by side"),
}
type ImgKey = keyof typeof IMG

type Props = KitProps &
    Partial<Record<ImgKey, ImageValue>> & {
        nextLink?: string
        backLink?: string
        style?: React.CSSProperties
    }

const NAV = ["Overview", "From control to trust", "Trust that's earned", "Key design decisions", "Who checks the checker", "Building and testing", "Reflection"]

const link: React.CSSProperties = { color: "inherit", textDecoration: "underline", textDecorationColor: C.accent2, textUnderlineOffset: 3 }
const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={link}>
        {children}
    </a>
)

type Slot = { image?: ImageValue; label: string; caption: string }

/** One panel of a horizontal run: a heading, its story and the visual(s) for it, filling the panel's height. Two slots sit side by side. */
function Panel({ m, title, children, slots = [] }: { m: Mode; title?: React.ReactNode; children: React.ReactNode; slots?: Slot[] }) {
    const pair = slots.length > 1 && !m.narrow
    return (
        <div style={{ display: "flex", flexDirection: "column", height: m.linear ? "auto" : "100%", gap: 16 }}>
            <div>
                {title}
                {children}
            </div>
            {slots.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: pair ? `repeat(${slots.length}, minmax(0, 1fr))` : "1fr", gap: 16, flex: m.linear ? undefined : 1, minHeight: 0 }}>
                    {slots.map((s) => (
                        <Visual key={s.label} image={s.image} label={s.label} caption={s.caption} style={m.linear ? { aspectRatio: "16 / 10" } : { minHeight: 0 }} />
                    ))}
                </div>
            )}
        </div>
    )
}

/**
 * Trust Desk case study page.
 */
export default function TrustDeskCaseStudy(props: Props) {
    const img = (k: ImgKey) => pickImage(props[k], IMG[k])
    const { nextLink = "/ai-interviewer" } = props
    const backLink = homeLink(props.backLink)
    const onLinks = useInternalLinks()

    const scenes: Scene[] = [
        {
            kind: "flow",
            nav: 0,
            node: (m) => (
                <Hero
                    m={m}
                    tags={["Self-initiated", "Agentic AI"]}
                    title="Trust Desk"
                    subtitle="An app that shows people when they can rely on their AI agents, and when they should check the work."
                    cells={[
                        ["Role", "Designer, self-initiated"],
                        ["Timeline", "October 2026"],
                        ["Team", "Just me, with Claude for research and Claude Code for the build"],
                        ["Platform", "Web app"],
                    ]}
                    brief={[
                        ["Problem", "People who hand work to AI agents can't tell when the agents are reliable."],
                        ["My decision", "Show each agent's track record for the task at hand, not its own confidence, and let it earn more freedom over time."],
                        ["Final design", "A trust layer: a check before agents start, alerts only for decisions, and a return view that leads with what needs you."],
                        ["Result", "A working app built in Claude Code, tested with [N] people using planted errors. [Headline result.]"],
                    ]}
                    image={img("hero")}
                    label="TD-01 · The return view"
                    caption="The return view in the built app."
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
                            <P>
                                Agents now draft and send email, book meetings and write documents while the person is busy elsewhere. When they come back, wrong results look as polished as right ones. One visible mistake makes people stop delegating, and weeks without one make them stop checking.
                            </P>,
                        ],
                        [
                            "The trust gap",
                            <>
                                <Stats
                                    m={m}
                                    items={[
                                        ["9%", "of workers trust AI with business-critical decisions."],
                                        ["61%", "of executives do."],
                                    ]}
                                />
                                <Note>
                                    Source: <Ext href="https://www.walkme.com/news-releases/enterprises-lose-51-workdays-per-employee-to-technology-friction-annually-despite-record-ai-investment-walkme-global-study-of-3750-finds/">WalkMe, 2026</Ext>.
                                </Note>
                            </>,
                        ],
                    ]}
                />
            ),
        },
        {
            kind: "flow",
            nav: 1,
            node: (m) => (
                <div style={{ padding: m.linear ? "64px 0" : "14vh 0 10vh", maxWidth: 820 }}>
                    <Eyebrow>01</Eyebrow>
                    <H2 m={m}>From control to trust</H2>
                    <P>My first draft was a control canvas: a card for every agent showing its instructions, decisions and confidence, so that agents could be tuned or paused one at a time, or interrupt each other.</P>
                    <P>
                        The research changed that. Control tools like agent inboxes and fleet dashboards had already shipped. Most multi-agent failures come from unclear goals and missing checks, not from a lack of control (<Ext href="https://arxiv.org/abs/2503.13657v2">MAST</Ext>). And an agent's stated confidence sits at 80–100% whether it's right or not (<Ext href="https://arxiv.org/pdf/2306.13063">Xiong et al.</Ext>).
                    </P>
                    <P>
                        So the goal became <B>calibrated trust</B>: people should rely on an agent when the evidence supports it, and check when it doesn't.
                    </P>
                    <Table
                        small
                        maxWidth={720}
                        rows={[
                            ["First draft", "Became"],
                            ["Agents interrupt each other", "One checker agent"],
                            ["Confidence shown by the agent", "Evidence from past runs"],
                            ["One trust score per agent", "A record per agent and task type"],
                            ["Undo added later", "A reversibility label on every action"],
                        ]}
                    />
                </div>
            ),
        },
        {
            kind: "h",
            nav: 2,
            panels: [
                {
                    w: 0.75,
                    render: (m) => (
                        <Column m={m}>
                            <Eyebrow>02</Eyebrow>
                            <H2 m={m}>Trust that's earned</H2>
                            <P>
                                Each agent keeps a record for each type of task, built from what actually happened to its results. Did the person accept them, correct them or undo them, and did spot-checks agree? That record decides how much the agent can do on its own.
                            </P>
                            <P>The interface shows three bars and a plain count, like “47 of 50”, never percentages. Two mistakes in the last ten results drop the agent a level. Anything that can't be undone always asks, whatever the rating.</P>
                        </Column>
                    ),
                },
                {
                    w: 0.85,
                    render: (m) => (
                        <Column m={m} maxWidth={820}>
                            <H3>Four ratings, per agent and per type of task</H3>
                            <Table
                                small
                                maxWidth={820}
                                rows={[
                                    ["Rating", "Needs", "Agent may"],
                                    ["New", "No results yet", "Ask first"],
                                    ["Not proven", "Under 10 results, or under 80% right", "Ask first"],
                                    ["Partly proven", "10+ results, 80–94% right", "Act, then you check"],
                                    ["Well proven", "30+ results, 95%+ right", "Just do it"],
                                ]}
                            />
                        </Column>
                    ),
                },
                {
                    w: 1,
                    render: (m) => (
                        <Panel
                            m={m}
                            title={<H3>What counts as right</H3>}
                            slots={[
                                { image: img("ratingNode"), label: "TD-02 · Agent node", caption: "Hovering an agent shows its autonomy and its record: “48 of 50 recent results right.”" },
                                { image: img("editPrompt"), label: "TD-03 · Edit prompt", caption: "Every edit asks why. Only “The agent got it wrong” counts against the agent." },
                            ]}
                        >
                            <P style={{ marginBottom: 0 }}>
                                The hardest part was deciding what counts as right. An edit can mean the agent got it wrong, or that the person changed their mind. So an edit asks once, with one tap. Only “The agent got it wrong” counts against the agent. “I changed what I want” can be saved as a rule instead.
                            </P>
                        </Panel>
                    ),
                },
            ],
        },
        {
            kind: "h",
            nav: 3,
            panels: [
                {
                    w: 0.85,
                    render: (m) => (
                        <Panel
                            m={m}
                            title={
                                <>
                                    <Eyebrow>03</Eyebrow>
                                    <H2 m={m}>Key design decisions</H2>
                                    <H3>Questions pinned to agents</H3>
                                </>
                            }
                            slots={[{ image: img("delegateBefore"), label: "TD-04 · Delegate, first draft", caption: "Before: the first Delegate screen, one long list of steps and questions." }]}
                        >
                            <P style={{ marginBottom: 0 }}>Of three canvas layouts, I kept the one where each question sits on the agent it's about, so people don't have to match a warning in a side panel to its source.</P>
                        </Panel>
                    ),
                },
                {
                    w: 0.85,
                    render: (m) => (
                        <Panel
                            m={m}
                            title={<H3>A check that scales with the stakes</H3>}
                            slots={[{ image: img("beforeStart"), label: "TD-05 · Before you start", caption: "After: questions pinned to each agent, and a “Before you start” card that keeps Start locked until the checks are seen." }]}
                        >
                            <P style={{ marginBottom: 0 }}>
                                Before agents start, a “Before you start” card shows how often similar runs went fine, the agents' guesses and the rules for “done right”. A low-stakes task starts right away. A task involving money needs every question answered and every agent asks first. Start sits in the same place either way.
                            </P>
                        </Panel>
                    ),
                },
                {
                    w: 0.85,
                    render: (m) => (
                        <Panel
                            m={m}
                            title={<H3>Exceptions first on return</H3>}
                            slots={[{ image: img("returnView"), label: "TD-06 · The return view", caption: "Back after a six-agent run: 5 need you, 3 with caveats, 4 routine. Nothing that cannot be undone happened without you." }]}
                        >
                            <P style={{ marginBottom: 0 }}>People see what needs them first, then work done with caveats, then routine work, collapsed. One routine item is offered as a spot-check, so the records don't just reward clicking yes.</P>
                        </Panel>
                    ),
                },
                {
                    w: 0.85,
                    render: (m) => (
                        <Panel
                            m={m}
                            title={<H3>Alerts only for decisions</H3>}
                            slots={[{ image: img("notifications"), label: "TD-07 · Notifications", caption: "Bundled alerts. Reversible items can be approved from the notification; irreversible ones need a tap into the app." }]}
                        >
                            <P style={{ marginBottom: 0 }}>The phone only buzzes for things that can't be undone or problems found. Everything else waits for a daily email, which is skipped on quiet days. There are no time estimates while agents work.</P>
                        </Panel>
                    ),
                },
                {
                    w: 1,
                    render: (m) => (
                        <Panel
                            m={m}
                            title={<H3>A profile you can read at a glance</H3>}
                            slots={[
                                { image: img("profileBefore"), label: "TD-08 · Profile, before", caption: "Before: a full page of tables and text." },
                                { image: img("profileAfter"), label: "TD-09 · Profile, after", caption: "After: a drawer you can read at a glance, with autonomy changed only here." },
                            ]}
                        >
                            <P style={{ marginBottom: 0 }}>My first agent profile was mostly text. I redesigned it around a meter, three numbers and reliability bars for each task. Autonomy can only be changed here, with the level the evidence supports marked “Recommended.”</P>
                        </Panel>
                    ),
                },
            ],
        },
        {
            kind: "flow",
            nav: 4,
            node: (m) => (
                <div style={{ padding: m.linear ? "64px 0" : "12vh 0 10vh" }}>
                    <Split
                        m={m}
                        left={
                            <>
                                <Eyebrow>04</Eyebrow>
                                <H2 m={m}>Who checks the checker</H2>
                                <P>
                                    A checker agent reviews every result against the rules. It needed a record of its own, so every human spot-check scores it as well, and known-wrong results are planted in the background to see whether it catches them. It runs on a different model from the agents, and it can flag and pause work but never approve anything that can't be undone. When it misses something, the miss counts against both the checker and the agent.
                                </P>
                            </>
                        }
                        right={
                            <div style={{ display: "grid", gap: 20 }}>
                                <Visual image={img("checker")} label="TD-10 · Checker profile" caption="The checker's own record: agreement with spot-checks, planted tests caught, and reliability by rule." style={{ aspectRatio: "16 / 10" }} />
                                <Visual image={img("failure")} label="TD-11 · Failure view" caption="When it misses something: where the mistake started, what the checker missed, and the agent going back to “Ask first.”" style={{ aspectRatio: "16 / 10" }} />
                            </div>
                        }
                    />
                </div>
            ),
        },
        {
            kind: "flow",
            nav: 5,
            node: (m) => (
                <div style={{ padding: m.linear ? "64px 0" : "12vh 0 10vh" }}>
                    <Split
                        m={m}
                        left={
                            <>
                                <Eyebrow>05</Eyebrow>
                                <H2 m={m}>Building and testing it</H2>
                                <P>
                                    I briefed Claude Code the way I'd brief a developer, with a spec, screen-by-screen designs and the rules the code had to enforce. The result is a working app with agents for Gmail, Calendar, Docs, Slack and Notion, and a test mode that runs without any accounts.
                                </P>
                                <P>To test the main idea, [N] people each reviewed two batches of ten agent results, one shown as a plain summary and one with the trust layer. Each batch had three planted errors.</P>
                                <Table
                                    small
                                    maxWidth={640}
                                    rows={[
                                        ["", "Plain summary", "Trust layer"],
                                        ["Errors caught", "[x of y]", "[x of y]"],
                                        ["Correct work accepted", "[x of y]", "[x of y]"],
                                    ]}
                                />
                                <Note>[A quote from a session.]</Note>
                                <P>With [N] people, this is an early signal, not proof.</P>
                            </>
                        }
                        right={<Visual image={img("study")} label="TD-12 · The study page" caption="The same kinds of results, shown two ways." style={{ aspectRatio: "4 / 3" }} />}
                    />
                </div>
            ),
        },
        {
            kind: "flow",
            nav: 6,
            node: (m) => (
                <div style={{ padding: m.narrow ? "64px 0 80px" : "14vh 0 14vh", maxWidth: 900 }}>
                    <H2 m={m}>What's next</H2>
                    <P>I'll use it on my own email and calendar for a few weeks to see how the records change with real work. After that comes MVP 2: finding and adding agents based on their record.</P>
                    <div style={{ height: 32 }} />
                    <H2 m={m}>What I learned</H2>
                    <P>I started out designing for control, but control wasn't the hard part. Most of the decisions that mattered were about what to leave out, like the confidence score, the single trust number and the time estimates.</P>
                    <P>[One or two lines in your own words about building it with Claude Code.]</P>
                    <Footer m={m} nextLabel="AI Interviewer" nextHref={nextLink} backHref={backLink} />
                </div>
            ),
        },
    ]

    return (
        <div onClick={onLinks} style={{ display: "contents" }}>
            <CaseStudyShell {...props} bodyFont={bodyFontOr(props.bodyFont)} title="Trust Desk" nav={NAV} scenes={scenes} />
        </div>
    )
}
