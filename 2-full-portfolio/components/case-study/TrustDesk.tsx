"use client"
// Trust Desk case study page. Layout, scroll behaviour, type and colour come from CaseStudyKit.
// Slots whose screenshot is not in yet have an empty file name and show their labelled placeholder.
import * as React from "react"
import { CaseStudyShell, C, pickImage, Visual, Eyebrow, H2, H3, P, B, Note, Bullets, Stats, Table, Split, Column, Hero, Rail, Footer } from "./kit"
import { asset } from "@/lib/images"
import { useInternalLinks } from "@/lib/useInternalLinks"
import type { KitProps, Scene, ImageValue, Mode } from "./kit"

// Body font: Instrument Sans (free stand-in for Trivia Sans), self-hosted in /public/fonts.
const bodyFontOr = (v: KitProps["bodyFont"]) => (v?.fontFamily && !/^\W*Inter\b/i.test(v.fontFamily) ? v : { fontFamily: '"Instrument Sans"' })
// "Back to portfolio" lands on this project's card on the home page. An old "/" value counts as unset.
const homeLink = (v: string | undefined) => (!v || v === "/" ? "/#trust-desk" : v)

// Slot numbers follow the order the images appear in the write-up.
const IMG = {
    hero: asset("trust-desk-run-finished.png", "Trust Desk after a run: the Run finished card, agent nodes with their badges, the checker pill, and Needs you in the side panel"),
    ratingNode: asset("trust-desk-agent-node.png", "Email assistant node: three bars, Well proven, and a hover popover with its autonomy and record"),
    editPrompt: asset("trust-desk-edit-prompt.png", "Edit prompt asking “Why are you changing it?” with two choices"),
    delegateBefore: asset("", "The first Delegate screen as one long list"),
    delegateAfter: asset("", "Questions pinned to each agent, and a Before you start card that keeps Start locked"),
    stakes: asset("trust-desk-before-you-start-stakes.png", "Before you start at low stakes (left) and high stakes (right)"),
    returnView: asset("trust-desk-return-spot-check.png", "Return view after the Needs you item is handled: counts in the Run finished card and a spot-check card in the side panel"),
    notifications: asset("", "Five phone notification screens"),
    profileBefore: asset("", "The first agent profile, a full page of tables"),
    profileAfter: asset("trust-desk-agent-profile.png", "Agent profile drawer: autonomy meter, three numbers, reliability by task, autonomy history"),
    checker: asset("trust-desk-checker-profile.png", "Checker profile drawer: agreement with spot-checks, test mistakes caught, misses, and reliability by rule"),
    failure: asset("", "The failure view showing a mistake the checker missed"),
    study: asset("trust-desk-study.png", "The study page: plain summary (left) and trust layer (right), same task set"),
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

/** The one-line takeaway that opens a section. */
const Lead = ({ children }: { children: React.ReactNode }) => <P style={{ fontWeight: 600, color: C.ink, fontSize: 19, lineHeight: 1.45 }}>{children}</P>
/** A labelled point: bold label, then the detail. */
const Pt = ({ t, children }: { t: string; children: React.ReactNode }) => (
    <>
        <B>{t}</B> {children}
    </>
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
                        ["My decision", "Show each agent's track record for the task at hand, not its own confidence. Let it earn more freedom over time."],
                        ["Final design", "A trust layer: a check before agents start, alerts only for decisions, and a return view that leads with what needs you."],
                        ["Result", "A working app built in Claude Code, tested with [N] people using planted errors. [Headline result.]"],
                    ]}
                    image={img("hero")}
                    label="TD-01 · The return view"
                    caption="After a run: the Run finished card, agent nodes with their badges, the checker pill, and Needs you in the side panel."
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
                            "At a glance",
                            <Stats
                                m={m}
                                items={[
                                    ["[x of y]", "planted errors caught with the trust layer, vs [x of y] with a plain summary."],
                                    ["4", "ratings an agent moves through, earned from its record on each task type."],
                                    ["5", "agents in the working app: Gmail, Calendar, Docs, Slack and Notion."],
                                ]}
                            />,
                        ],
                        [
                            "Context",
                            <>
                                <Lead>When people come back, wrong results look as polished as right ones.</Lead>
                                <Bullets
                                    items={[
                                        <Pt t="What agents do now.">Draft and send email, book meetings and write documents while the person is busy elsewhere.</Pt>,
                                        <Pt t="The trust swing.">One visible mistake makes people stop delegating. Weeks without one make them stop checking.</Pt>,
                                        <Pt t="The gap.">
                                            Only 9% of workers trust AI with business-critical decisions, against 61% of executives (<Ext href="https://www.walkme.com/news-releases/enterprises-lose-51-workdays-per-employee-to-technology-friction-annually-despite-record-ai-investment-walkme-global-study-of-3750-finds/">WalkMe, 2026</Ext>).
                                        </Pt>,
                                    ]}
                                />
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
                    <Lead>Decision: design for calibrated trust, not control. People should rely on an agent when the evidence supports it, and check when it doesn't.</Lead>
                    <P>My first draft was a control canvas: a card for every agent showing its instructions, decisions and confidence, so agents could be tuned or paused one at a time, or interrupt each other. The research changed that:</P>
                    <Bullets
                        items={[
                            <Pt t="Control tools already existed.">Agent inboxes and fleet dashboards had already shipped.</Pt>,
                            <Pt t="What causes failures.">
                                Most multi-agent failures come from unclear goals and missing checks, not a lack of control (<Ext href="https://arxiv.org/abs/2503.13657v2">MAST</Ext>).
                            </Pt>,
                            <Pt t="Stated confidence.">
                                An agent's stated confidence sits at 80–100% whether it's right or not (<Ext href="https://arxiv.org/pdf/2306.13063">Xiong et al.</Ext>).
                            </Pt>,
                        ]}
                    />
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
                    w: 0.8,
                    render: (m) => (
                        <Column m={m}>
                            <Eyebrow>02</Eyebrow>
                            <H2 m={m}>Trust that's earned</H2>
                            <Lead>Each agent's record, per task type, decides how much it can do on its own.</Lead>
                            <P>The record is built from what actually happened to its results: did the person accept, correct or undo them, and did spot-checks agree?</P>
                            <H3>Three rules on top</H3>
                            <Bullets
                                items={[
                                    <Pt t="Counts, not percentages.">The interface shows three bars and a plain count, like “47 of 50”.</Pt>,
                                    <Pt t="Dropping a level.">Two mistakes in the last ten results drop the agent a level.</Pt>,
                                    <Pt t="Irreversible always asks,">whatever the rating.</Pt>,
                                ]}
                            />
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
                            title={<H3>The hardest part: what counts as “right”</H3>}
                            slots={[
                                { image: img("ratingNode"), label: "TD-02 · Agent node", caption: "Hovering an agent shows its autonomy and its record: “48 of 50 recent results right.”" },
                                { image: img("editPrompt"), label: "TD-03 · Edit prompt", caption: "Every edit asks why. Only “The agent got it wrong” counts against the agent." },
                            ]}
                        >
                            <P>An edit can mean the agent got it wrong, or that the person changed their mind. So every edit asks once, with one tap:</P>
                            <Bullets
                                items={[
                                    <Pt t="“The agent got it wrong”">counts against the agent. It's the only answer that does.</Pt>,
                                    <Pt t="“I changed what I want”">can be saved as a rule instead.</Pt>,
                                ]}
                            />
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
                    w: 1,
                    render: (m) => (
                        <Panel
                            m={m}
                            title={
                                <>
                                    <Eyebrow>03</Eyebrow>
                                    <H2 m={m}>Key design decisions</H2>
                                    <Lead>Five decisions.</Lead>
                                    <H3>1. Questions pinned to agents</H3>
                                </>
                            }
                            slots={[
                                { image: img("delegateBefore"), label: "TD-04 · Delegate, before", caption: "Before: the first Delegate screen, one long list of steps and questions." },
                                { image: img("delegateAfter"), label: "TD-05 · Delegate, after", caption: "After: questions pinned to each agent, and a “Before you start” card that keeps Start locked until the checks are seen." },
                            ]}
                        >
                            <P style={{ marginBottom: 0 }}>Of three canvas layouts, I kept the one where each question sits on the agent it's about. People don't have to match a warning in a side panel to its source.</P>
                        </Panel>
                    ),
                },
                {
                    w: 0.85,
                    render: (m) => (
                        <Panel
                            m={m}
                            title={<H3>2. A check that scales with the stakes</H3>}
                            slots={[{ image: img("stakes"), label: "TD-06 · Low and high stakes", caption: "Low stakes: nothing to check, Start ready. High stakes: every check answered, every rule confirmed, every agent asks first." }]}
                        >
                            <P>Before agents start, a “Before you start” card shows how often similar runs went fine, the agents' guesses, and the rules for “done right”.</P>
                            <Bullets items={["A low-stakes task starts right away.", "A task involving money needs every question answered, and every agent asks first.", "Start sits in the same place either way."]} />
                        </Panel>
                    ),
                },
                {
                    w: 0.85,
                    render: (m) => (
                        <Panel
                            m={m}
                            title={<H3>3. Exceptions first on return</H3>}
                            slots={[{ image: img("returnView"), label: "TD-07 · The return view", caption: "Back from a run: nothing needs you, 1 with caveats, 4 routine, and one routine result offered as a spot-check." }]}
                        >
                            <P style={{ marginBottom: 0 }}>First what needs you, then work done with caveats, then routine work, collapsed. One routine item is offered as a spot-check, so the records don't just reward clicking yes.</P>
                        </Panel>
                    ),
                },
                {
                    w: 0.85,
                    render: (m) => (
                        <Panel
                            m={m}
                            title={<H3>4. Alerts only for decisions</H3>}
                            slots={[{ image: img("notifications"), label: "TD-08 · Notifications", caption: "Bundled alerts. Reversible items can be approved from the notification; irreversible ones need a tap into the app." }]}
                        >
                            <P style={{ marginBottom: 0 }}>The phone only buzzes for things that can't be undone, or problems found. Everything else waits for a daily email, skipped on quiet days. No time estimates while agents work.</P>
                        </Panel>
                    ),
                },
                {
                    w: 1,
                    render: (m) => (
                        <Panel
                            m={m}
                            title={<H3>5. A profile you can read at a glance</H3>}
                            slots={[
                                { image: img("profileBefore"), label: "TD-09 · Profile, before", caption: "Before: the first agent profile, a full page of tables and text. From the design canvas." },
                                { image: img("profileAfter"), label: "TD-10 · Profile, after", caption: "After: the redesigned drawer you can read at a glance, with autonomy changed only here." },
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
                                <Lead>A checker agent reviews every result against the rules, so it needs a record of its own.</Lead>
                                <Bullets
                                    items={[
                                        <Pt t="Scored by people.">Every human spot-check scores the checker as well as the agent.</Pt>,
                                        <Pt t="Tested in the background.">Known-wrong results are planted to see whether it catches them.</Pt>,
                                        <Pt t="Separate.">It runs on a different model from the agents.</Pt>,
                                        <Pt t="Limited power.">It can flag and pause work, but never approve anything that can't be undone.</Pt>,
                                        <Pt t="Misses count twice.">When it misses something, the miss counts against both the checker and the agent.</Pt>,
                                    ]}
                                />
                            </>
                        }
                        right={
                            <div style={{ display: "grid", gap: 20 }}>
                                <Visual image={img("checker")} label="TD-11 · Checker profile" caption="The checker's own record: agreement with spot-checks, planted tests caught, and reliability by rule." style={{ aspectRatio: "16 / 10" }} />
                                <Visual image={img("failure")} label="TD-12 · Failure view" caption="When it misses something: where the mistake started, what the checker missed, and the agent going back to “Ask first.”" style={{ aspectRatio: "16 / 10" }} />
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
                                <Lead>A working app, tested against a plain summary with planted errors.</Lead>
                                <H3>The build</H3>
                                <Bullets
                                    items={[
                                        <Pt t="Briefed like a developer.">I gave Claude Code a spec, screen-by-screen designs, and the rules the code had to enforce.</Pt>,
                                        <Pt t="What exists.">A working app with agents for Gmail, Calendar, Docs, Slack and Notion, plus a test mode that runs without any accounts.</Pt>,
                                    ]}
                                />
                                <H3>The test</H3>
                                <Bullets items={["[N] people each reviewed two batches of ten agent results.", "One batch was shown as a plain summary, the other with the trust layer.", "Each batch had three planted errors."]} />
                                <Table
                                    small
                                    maxWidth={640}
                                    rows={[
                                        ["", "Plain summary", "Trust layer"],
                                        ["Errors caught", "[x of y]", "[x of y]"],
                                        ["Correct work accepted", "[x of y]", "[x of y]"],
                                    ]}
                                />
                                <Note style={{ marginBottom: 12 }}>[A quote from a session.]</Note>
                                <Note>
                                    <B>Early signal, not proof.</B> The test had [N] people.
                                </Note>
                            </>
                        }
                        right={<Visual image={img("study")} label="TD-13 · The study page" caption="The same kinds of results, shown two ways." style={{ aspectRatio: "4 / 3" }} />}
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
                    <Bullets
                        items={[
                            <Pt t="Use it myself.">A few weeks on my own email and calendar, to see how the records change with real work.</Pt>,
                            <Pt t="MVP 2.">Finding and adding agents based on their record.</Pt>,
                        ]}
                    />
                    <div style={{ height: 32 }} />
                    <H2 m={m}>What I learned</H2>
                    <Bullets
                        items={[
                            <Pt t="Control wasn't the hard part.">I started out designing for control. Most of the decisions that mattered were about what to leave out: the confidence score, the single trust number and the time estimates.</Pt>,
                            "[One or two lines in your own words about building it with Claude Code.]",
                        ]}
                    />
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
