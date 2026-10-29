"use client"
// Trust Desk case study page. Layout, scroll behaviour, type and colour come from CaseStudyKit.
// Images are not in yet: every visual slot shows its labelled placeholder until the file is added to IMG.
import * as React from "react"
import { CaseStudyShell, C, pickImage, Visual, vis, Eyebrow, H2, H3, P, B, Note, Bullets, Stats, Cards, Table, Split, Hero, Rail, Fit, Footer } from "./kit"
import { asset } from "@/lib/images"
import { useInternalLinks } from "@/lib/useInternalLinks"
import type { KitProps, Scene, ImageValue, Mode } from "./kit"

// Body font: Instrument Sans (free stand-in for Trivia Sans), self-hosted in /public/fonts.
const bodyFontOr = (v: KitProps["bodyFont"]) => (v?.fontFamily && !/^\W*Inter\b/i.test(v.fontFamily) ? v : { fontFamily: '"Instrument Sans"' })
// "Back to portfolio" lands on this project's card on the home page. An old "/" value counts as unset.
const homeLink = (v: string | undefined) => (!v || v === "/" ? "/#trust-desk" : v)

// Add the file names here once the screenshots exist; until then each slot renders its placeholder.
const IMG = {
    hero: asset("", "Trust Desk: the return view in the built app"),
    firstDraft: asset("", "First draft: a control canvas with one card per agent"),
    trustLayer: asset("", "The trust layer: five moments around one record"),
    options: asset("", "Delegate screen: options A, B and C"),
    beforeStart: asset("", "Before you start, at low and high stakes"),
    away: asset("", "Phone notifications and the daily email"),
    profile: asset("", "Agent profile, before and after"),
    checker: asset("", "Checker profile"),
    app: asset("", "The working app"),
    study: asset("", "The study page: plain and trust-layer runs"),
}
type ImgKey = keyof typeof IMG

type Props = KitProps &
    Partial<Record<ImgKey, ImageValue>> & {
        nextLink?: string
        backLink?: string
        style?: React.CSSProperties
    }

const NAV = ["Overview", "Where I started", "What research changed", "One record", "What goes in first", "The screens", "Who checks the checker", "Numbers on trust", "Building and testing", "Reflection"]

const link: React.CSSProperties = { color: "inherit", textDecoration: "underline", textDecorationColor: C.accent2, textUnderlineOffset: 3 }
const Ext = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" style={link}>
        {children}
    </a>
)

/** One screen of the "Designing the screens" section: a heading, its story and the visual for it. */
function Screen({ m, title, children, image, label, caption }: { m: Mode; title: string; children: React.ReactNode; image?: ImageValue; label?: string; caption?: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", height: m.linear ? "auto" : "100%", gap: 16 }}>
            <div>
                <H3>{title}</H3>
                {children}
            </div>
            {label && <Visual image={image} label={label} caption={caption} style={m.linear ? { aspectRatio: "16 / 10" } : { flex: 1 }} />}
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
                        ["Team", "Just me. I used Claude for research and Claude Code to build it"],
                        ["Platform", "Web app"],
                    ]}
                    brief={[
                        ["Problem", "People who hand work to AI agents can't tell when the agents are reliable. After one visible mistake they stop delegating. After weeks without one, they stop checking."],
                        ["My decision", "Show each agent's track record on the kind of task at hand, instead of its own confidence, and let it earn more freedom as the record grows."],
                        ["Final design", "A trust layer with a check before agents start, notifications only for decisions, a return view that leads with what needs you, and a failure view that shows what went wrong and what changes."],
                        ["Result", "A working app built in Claude Code, tested with [N] people using planted errors. [Headline result after the sessions.]"],
                    ]}
                    image={img("hero")}
                    label="TD-01 · The return view"
                    caption="The return view in the built app"
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
                                    Agents can now draft and send email, book meetings and write documents on their own. The person who delegates usually isn't watching. They set the goal, do something else, and come back to a list of finished work where wrong results look as polished as right ones.
                                </P>
                                <P>
                                    I designed for non-technical people who delegate repetitive work, and kept the product domain-agnostic. For the prototype I used onboarding trip hosts as the test scenario.
                                </P>
                            </>,
                        ],
                        [
                            "The gap, in numbers",
                            <>
                                <Stats
                                    m={m}
                                    items={[
                                        ["9%", "of workers trust AI with business-critical decisions, against 61% of executives."],
                                        ["54%", "of workers had bypassed AI tools in the previous 30 days."],
                                        ["44%", "of multi-agent failures in the MAST study started in the system's design, not in any one agent."],
                                    ]}
                                />
                                <Note>
                                    Sources: <Ext href="https://www.walkme.com/news-releases/enterprises-lose-51-workdays-per-employee-to-technology-friction-annually-despite-record-ai-investment-walkme-global-study-of-3750-finds/">WalkMe, 2026</Ext> and <Ext href="https://arxiv.org/abs/2503.13657v2">MAST</Ext>.
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
            fit: true,
            node: (m) => (
                <Fit m={m}>
                    <Split
                        m={m}
                        left={
                            <>
                                <Eyebrow>01</Eyebrow>
                                <H2 m={m}>Where I started</H2>
                                <P>
                                    My first draft was a control canvas for multi-agent work. Each agent was a card that showed what it does, its strengths and weaknesses, its instructions, the decisions it considered, what it accessed, how predictable it is, a summary of its failures, and its confidence and accuracy.
                                </P>
                                <P>You could tune or pause one agent without stopping the rest. Agents could interrupt each other when one went wrong, and changing one agent would update the shared memory for all of them.</P>
                                <P>
                                    The person I had in mind is neither always present nor always in control. They show up at two moments: when they set the goal, and when they come back to check. They don't want to be asked about access or small decisions in between.
                                </P>
                            </>
                        }
                        right={<Visual image={img("firstDraft")} label="TD-02 · First draft" caption="The first draft: a control canvas, one card per agent" style={vis(m, "4 / 3")} />}
                    />
                </Fit>
            ),
        },
        {
            kind: "flow",
            nav: 2,
            node: (m) => (
                <div style={{ padding: m.linear ? "64px 0" : "14vh 0 8vh", maxWidth: 900 }}>
                    <Eyebrow>02</Eyebrow>
                    <H2 m={m}>What the research changed</H2>
                    <P>Before designing screens, I went through failure studies, calibration research, adoption surveys and the products already out there. Four findings changed the idea.</P>
                    <Cards
                        m={m}
                        items={[
                            ["Control surfaces already exist", "Agent inboxes, enterprise control planes and fleet dashboards had shipped. Another canvas for steering agents would add little."],
                            [
                                "Most multi-agent failures start in the design",
                                <>
                                    The <Ext href="https://arxiv.org/abs/2503.13657v2">MAST study</Ext> annotated over 1,600 runs across 7 frameworks and found 14 failure modes. System design issues were the biggest group, at 44.2%. Better goal-setting and checking mattered more than watching.
                                </>,
                            ],
                            [
                                "Agents can't rate themselves",
                                <>
                                    When models state their confidence, it sits between 80 and 100% whether they're right or not (<Ext href="https://arxiv.org/pdf/2306.13063">Xiong et al.</Ext>). The confidence panel in my draft would have misled people.
                                </>,
                            ],
                            ["The barrier is trust, not capability", "And more trust isn't the goal either. Trusting a system that still makes mistakes is a failure too."],
                        ]}
                    />
                    <P>
                        So the goal moved from reducing how often people step in to <B>calibrated trust</B>: rely when the evidence supports it, check when it doesn't. I logged 16 changes to the first draft. These were the main ones.
                    </P>
                    <Table
                        small
                        maxWidth={900}
                        rows={[
                            ["First draft", "Replaced with", "Why"],
                            ["Agents interrupt each other", "One checker agent", "Products had settled on one lead agent and a verifier"],
                            ["Confidence shown by the agent", "Evidence from past runs", "Stated confidence doesn't match accuracy"],
                            ["One trust score per agent", "A record per agent and task type", "An agent can be good at one task and bad at the next"],
                            ["Undo added later", "A reversibility label on every action", "Undo has to be planned before the action runs"],
                            ["Edits update shared memory", "Versioned edits with a preview (MVP 2)", "One mistake would spread to every agent"],
                        ]}
                    />
                </div>
            ),
        },
        {
            kind: "flow",
            nav: 2,
            node: (m) => (
                <div style={{ padding: m.linear ? "0 0 64px" : "4vh 0 10vh", maxWidth: 900 }}>
                    <H3>Fourteen problems people run into when delegating</H3>
                    <Table
                        small
                        maxWidth={900}
                        widths="minmax(0,0.8fr) minmax(0,3fr)"
                        rows={[
                            ["When", "Problems"],
                            ["Delegating", "Agents fill gaps silently · no idea what it will do · can't see where it's good or bad"],
                            ["Away", "Keep checking in · too many approval prompts"],
                            ["Returning", "A pile of activity · wrong output looks as polished as right · which agent did what?"],
                            ["Over time", "One failure wipes out months of success · corrections don't stick · same request, different results · accountable without control · losing the skill to judge the work · “teammate” framing sets wrong expectations"],
                        ]}
                    />
                    <P>
                        The closest existing work was OrchVis and Magentic-UI, where co-planning raised task completion from 30.3% to 51.9%. None of them showed a non-technical person the evidence at the moment they decide to rely on an agent. <B>That was the gap I designed for.</B>
                    </P>
                </div>
            ),
        },
        {
            kind: "flow",
            nav: 3,
            fit: true,
            node: (m) => (
                <Fit m={m}>
                    <Split
                        m={m}
                        left={
                            <>
                                <Eyebrow>03</Eyebrow>
                                <H2 m={m}>One record behind every moment</H2>
                                <P>
                                    The concept became a trust layer. Each agent keeps one evidence record for each type of task. Every screen reads from that record, and everything the person does (approve, fix, undo, spot-check) is written back to it.
                                </P>
                                <Table
                                    small
                                    widths="minmax(0,0.6fr) minmax(0,2.4fr)"
                                    rows={[
                                        ["Moment", "What the person sees"],
                                        ["Delegate", "The plan, each agent's record, its guesses, what's missing, and whether each action can be undone"],
                                        ["Away", "Nothing, unless a decision is needed"],
                                        ["Return", "What needs you first, then what's done with caveats, then routine work collapsed"],
                                        ["Inspect", "An agent's record by task type, its weak spots, and corrections that stuck"],
                                        ["Failure", "What went wrong, where it started, what can still be undone, and what changes next"],
                                    ]}
                                />
                                <P>
                                    The core flow is the <B>pre-response check</B>. Before the agents act, they show how likely this is to go well, what they're guessing, what information is missing, and how proven each agent is for this task. Likelihood comes from past runs, never from the agent itself.
                                </P>
                                <P>For work an agent hasn't done before, it borrows evidence from similar tasks and labels it “similar.” If there's nothing similar, it says so.</P>
                            </>
                        }
                        right={<Visual image={img("trustLayer")} label="TD-03 · Trust layer" caption="Every moment reads from the record, and every action writes back." style={vis(m, "4 / 3")} />}
                    />
                </Fit>
            ),
        },
        {
            kind: "flow",
            nav: 4,
            node: (m) => (
                <div style={{ padding: m.linear ? "64px 0" : "14vh 0 10vh", maxWidth: 820 }}>
                    <Eyebrow>04</Eyebrow>
                    <H2 m={m}>Deciding what goes in first</H2>
                    <Stats
                        m={m}
                        items={[
                            ["44", "features listed"],
                            ["19", "in MVP 1: the trust layer"],
                            ["8", "in MVP 2: finding agents and adding them to workflows based on their record"],
                        ]}
                    />
                    <P>MVP 2 comes second because a reputation only exists once agents have run in real workflows.</P>
                    <P>
                        The rest were deferred or rejected. I rejected self-reported confidence, agents interrupting each other, shared memory that updates on its own, a single trust score per agent, and “teammate” personas that suggest agents have judgement they don't.
                    </P>
                    <P>
                        Shadow mode, where an agent works in parallel while the person does the real task, moved to MVP 2. It doubles the person's effort and needs a longer study than MVP 1 testing. Live conversations with outside people moved there too, since they need their own reply rules and review.
                    </P>
                </div>
            ),
        },
        {
            kind: "h",
            nav: 5,
            panels: [
                {
                    w: 0.9,
                    render: (m) => (
                        <div style={{ display: "flex", flexDirection: "column", height: m.linear ? "auto" : "100%", gap: 16 }}>
                            <div>
                                <Eyebrow>05</Eyebrow>
                                <H2 m={m}>Designing the screens</H2>
                                <P>
                                    I tried three canvas directions for the Delegate screen. I picked Option C: agents as nodes, with each question pinned to the agent it's about and the request docked in a corner. Pinning questions to agents took load off the side panel and showed where each question came from.
                                </P>
                                <P style={{ marginBottom: 0 }}>From there I worked in review rounds. Most changes came from looking at the screens in sequence and seeing what didn't hold up.</P>
                            </div>
                            <Visual image={img("options")} label="TD-04 · Options A, B and C" caption="Option C kept: questions pinned to the agent they concern." style={m.linear ? { aspectRatio: "16 / 10" } : { flex: 1 }} />
                        </div>
                    ),
                },
                {
                    w: 1.0,
                    render: (m) => (
                        <Screen m={m} title="Before you start" image={img("beforeStart")} label="TD-05 · Before you start" caption="Same layout; only what's required changes.">
                            <P>Start stays locked until the person has reviewed the “done right” rules and opened every agent's questions. Answering is optional, but the questions have to be seen.</P>
                            <P>At first this check only existed for standard stakes. I designed low and high stakes as a separate flow so the existing screens stayed intact:</P>
                            <Table
                                small
                                widths="minmax(0,0.7fr) minmax(0,2.3fr)"
                                rows={[
                                    ["Stakes", "Before Start"],
                                    ["Low", "Starts right away. Rules can be viewed but don't need review"],
                                    ["Standard", "Review rules and open every agent's questions"],
                                    ["High (money, legal)", "Confirm each rule, answer every question. Every agent asks first, and “Try 1 first” is on by default"],
                                ]}
                            />
                            <P style={{ marginBottom: 0 }}>
                                In the first version, Start sat in a different place on the two screens, so I moved it to the same spot. The request and its stakes chip went into one card at the bottom, and hovering the chip explains why the task is low or high stakes. Likelihood, the rules, the safety settings and Start went into a “Before you start” card at the top left. The guess and missing-info tiles became clickable and highlight the agents they belong to. New agents got a callout saying not to rely on them heavily until they build a record. Rules people accept are saved for that type of task and reused the next time.
                            </P>
                        </Screen>
                    ),
                },
                {
                    w: 0.85,
                    render: (m) => (
                        <Screen m={m} title="While you're away" image={img("away")} label="TD-06 · Phone and email" caption="Phone for decisions, email for the overview.">
                            <P>Working agents get a glow border, and the side panel shows the 3–5 latest events. There are no time estimates, because a wrong estimate would cost trust.</P>
                            <P>
                                The phone gets decisions only: anything that can't be undone, problems the checker found, and failures. Reversible items can be approved from the notification, but irreversible ones need a tap into the app. On the first pass the phone action labels didn't fit their buttons, so I shortened them.
                            </P>
                            <P style={{ marginBottom: 0 }}>
                                The daily email went through two versions. The first was a text summary. The second is visual: three outcome tiles that stay the same every day, and a section per run that grows with the number of runs. On days when nothing ran, no email is sent.
                            </P>
                        </Screen>
                    ),
                },
                {
                    w: 0.6,
                    render: (m) => (
                        <Screen m={m} title="When you come back">
                            <P>
                                The return view shows Needs you first, then Done with caveats, then Routine, collapsed. Each item says why it surfaced. One routine item is offered as a spot-check, because a record built only on what people approve would reward clicking yes without reading.
                            </P>
                            <P style={{ marginBottom: 0 }}>Originally only irreversible actions had a badge (a lock). I added icons for all three states: can be undone, can be corrected, and cannot be undone.</P>
                        </Screen>
                    ),
                },
                {
                    w: 0.85,
                    render: (m) => (
                        <Screen m={m} title="Agent profile" image={img("profile")} label="TD-07 · Agent profile" caption="Before · text-heavy. After · mostly visual.">
                            <P>My first profile was mostly text, and it was hard to read. I redesigned it to be mostly visual: an autonomy meter, three number tiles, reliability bars for each task type, one weak-spot line, and an autonomy timeline.</P>
                            <P style={{ marginBottom: 0 }}>
                                Autonomy can only be changed here, through an Edit button. The level the evidence supports is tagged “Recommended”. In the hover popover on the canvas, autonomy had blended into the description text, so I moved it to its own row.
                            </P>
                        </Screen>
                    ),
                },
                {
                    w: 0.6,
                    render: (m) => (
                        <Screen m={m} title="When something goes wrong">
                            <P style={{ marginBottom: 0 }}>
                                Reporting a problem opens the failure view. It shows the path of the error on the canvas, which agent it started with, what the checker missed, the items it affected, and what changes going forward.
                            </P>
                        </Screen>
                    ),
                },
            ],
        },
        {
            kind: "flow",
            nav: 6,
            fit: true,
            node: (m) => (
                <Fit m={m}>
                    <Split
                        m={m}
                        left={
                            <>
                                <Eyebrow>06</Eyebrow>
                                <H2 m={m}>Who checks the checker</H2>
                                <P>The checker reviews every result against the rules. It's an agent too, so it needed a track record of its own, with people as the final reference.</P>
                                <P>
                                    Its record comes from three places. Every human spot-check also scores the checker. Known-wrong results are slipped in now and then to see whether it catches them. These tests run in the background, and people only see the results. It also runs on a different model from the agents, so the two don't share the same blind spots.
                                </P>
                                <P>Its authority is limited. It can flag and pause, but it can never approve anything that can't be undone. When it disagrees with an agent, the item goes to the person.</P>
                                <P>A few rules came out of the review:</P>
                                <Bullets
                                    items={[
                                        "Every agent checks its own work against its rules first, so a miss counts against both the agent and the checker.",
                                        "The agent's self-check only appears in the failure timeline. Day to day, it isn't information the person needs.",
                                        "When the checker is weak on a rule, that rule gets more spot-checks, sent as notifications.",
                                        "When no rule covered a mistake, it appears as a note with a “Set a rule” button, not as a requirement.",
                                    ]}
                                />
                                <P>The checker profile uses the same visual style as the agent profile.</P>
                            </>
                        }
                        right={<Visual image={img("checker")} label="TD-08 · Checker profile" caption="Agreement with your spot-checks, planted-test results and misses." style={vis(m, "4 / 3")} />}
                    />
                </Fit>
            ),
        },
        {
            kind: "flow",
            nav: 7,
            node: (m) => (
                <div style={{ padding: m.linear ? "64px 0" : "14vh 0 10vh", maxWidth: 900 }}>
                    <Eyebrow>07</Eyebrow>
                    <H2 m={m}>Putting numbers on trust</H2>
                    <P>To build the app I had to define the ratings. Each rating is per agent and per type of task, based on the last 50 results within 90 days.</P>
                    <Table
                        small
                        maxWidth={900}
                        rows={[
                            ["Rating", "Needs", "Recommended autonomy"],
                            ["New · no record", "0 results", "Ask first"],
                            ["Not proven", "Fewer than 10 results, or under 80% right", "Ask first"],
                            ["Partly proven", "10 or more results, 80–94% right", "Check after"],
                            ["Well proven", "30 or more results, 95% or more right, 5+ spot-checks agreed", "Just do it"],
                        ]}
                    />
                    <P>The interface never shows these percentages. People see three bars and a plain count, like “47 of 50.”</P>
                    <P>
                        <B>The hard part was deciding what counts as “right.”</B> If someone edits a result, the agent may have been wrong, or they may have changed what they want. The two can't be counted the same way. So an edit asks one question with one tap: “The agent got it wrong” counts against the agent. “I changed what I want” doesn't, and can be saved as a rule. If the result broke a rule, included a guess or was flagged, the first option is preselected.
                    </P>
                    <P>
                        Two corrections in the last ten results drop the agent one level. A serious miss, one that reached an outside person or can't be undone, drops it straight to Not proven and Ask first. A new agent with a good record on similar tasks starts at Partly proven.
                    </P>
                    <Note>For empty states, first use shows “Everything is new.” Sections with nothing in them are hidden. Agents with no record get dashed bars.</Note>
                </div>
            ),
        },
        {
            kind: "flow",
            nav: 8,
            fit: true,
            node: (m) => (
                <Fit m={m}>
                    <Split
                        m={m}
                        left={
                            <>
                                <Eyebrow>08</Eyebrow>
                                <H2 m={m}>Building it</H2>
                                <P>I first joined the screens into a clickable prototype, using onboarding trip hosts as the scenario and real Claude agents working on sample data.</P>
                                <P>
                                    Then I decided I didn't want a test version for one use case. I wanted a platform I could use myself. That meant real tools: Gmail and Calendar, Google Drive and Docs, web search, Slack and Notion. There's a built-in library of agents, and I can also make my own.
                                </P>
                                <P>
                                    I wrote a handoff for Claude Code, the same way I'd brief a developer. It had the product spec with every threshold, a UI spec for each screen, a build plan with checks for each milestone, the prototype, and the rules the code has to enforce. The most important rule is that anything that can't be undone always asks first.
                                </P>
                                <P>The app runs locally. It has a test mode with stand-in agents, so it can be shown without connecting any accounts.</P>
                            </>
                        }
                        right={<Visual image={img("app")} label="TD-09 · The working app" caption="The return view in the built app" style={vis(m, "4 / 3")} />}
                    />
                </Fit>
            ),
        },
        {
            kind: "flow",
            nav: 8,
            node: (m) => (
                <div style={{ padding: m.linear ? "64px 0" : "10vh 0 10vh", maxWidth: 900 }}>
                    <Eyebrow>09</Eyebrow>
                    <H2 m={m}>Testing</H2>
                    <P>
                        <B>The question I wanted answered:</B> do people accept correct work and catch wrong work more often with the trust layer than without it?
                    </P>
                    <P>
                        The research plan called for 8–12 people. I ran a smaller version with [N]. Each person reviewed two batches of ten agent results. One batch was shown as a plain summary and the other with the trust layer, and the order switched between people. Each batch had three planted errors:
                    </P>
                    <Bullets items={["one the checker flagged", "one where the agent had guessed", "one silent error from a well-proven agent"]} />
                    <P>Each batch also had one false alarm and one correct action that couldn't be undone. Anything people left alone counted as accepted.</P>
                    <Visual image={img("study")} label="TD-10 · The study page" caption="Plain and trust-layer runs" style={{ aspectRatio: "16 / 9", maxWidth: 760 }} />
                    <div style={{ height: 28 }} />
                    <P>
                        <B>What happened.</B> [Fill in after the sessions.]
                    </P>
                    <Table
                        small
                        maxWidth={760}
                        rows={[
                            ["", "Plain summary", "Trust layer"],
                            ["Planted errors caught", "[x of y]", "[x of y]"],
                            ["Correct work accepted", "[x of y]", "[x of y]"],
                            ["Silent error caught", "[x of y]", "[x of y]"],
                            ["False alarm accepted", "[x of y]", "[x of y]"],
                        ]}
                    />
                    <Note>[A quote from a session.]</Note>
                    <P>
                        <B>What I changed.</B> [One change based on the sessions.]
                    </P>
                    <P>With [N] people, this is an early signal, not proof.</P>
                </div>
            ),
        },
        {
            kind: "flow",
            nav: 9,
            node: (m) => (
                <div style={{ padding: m.narrow ? "64px 0 80px" : "14vh 0 14vh", maxWidth: 900 }}>
                    <H2 m={m}>What isn't built yet, and what I'd push for</H2>
                    <P>
                        <B>Using it for real.</B> The ratings only mean something after weeks of real work. Next I want to run it on my own email and calendar and see how the records change.
                    </P>
                    <P>
                        <B>Edge cases.</B> I parked these until the main screens were done: many checks on one agent, 10–30 agents on one canvas, 40+ caveats in one run, and several failures at once. Each has a proposed fix in the feature list, but none are designed.
                    </P>
                    <P>
                        <B>Parts of the spec not in the app yet.</B> These include pausing after the first item in high-stakes runs, undo deadlines with a warning before they close, and extra spot-checks when the checker is weak.
                    </P>
                    <P>
                        <B>MVP 2.</B> Finding agents by their record, adding them to workflows on probation, shadow mode, and live conversations with outside people.
                    </P>
                    <div style={{ height: 32 }} />
                    <H2 m={m}>What I learned</H2>
                    <P>
                        I started out designing for control, and the research showed control wasn't the hard part. Many of the decisions that mattered were about what to leave out: the agent's confidence score, a single trust number, time estimates.
                    </P>
                    <P>Defining “right” took longer than any screen. The ratings are only honest if a mistake by the agent and a change of mind by the person are counted differently.</P>
                    <P>[Add one or two lines in your own words about building it with Claude Code.]</P>
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
