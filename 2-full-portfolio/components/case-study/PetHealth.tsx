"use client"
// Pet Health Scan Suite case study page. Layout, scroll behaviour, type and colour come from CaseStudyKit.
// On desktop every image can be clicked to open full screen (phones already get this from the kit).
// The immunity result's before/after is a drag slider.
import * as React from "react"
import { createPortal } from "react-dom"
import { CaseStudyShell, Big, C, pickImage, Visual, vis, full, Eyebrow, H2, H3, P, B, Note, Bullets, Flow, Stats, Table, Split, Column, Hero, Rail, StepList, Fit, Footer } from "./kit"
import { asset } from "@/lib/images"
import { useInternalLinks } from "@/lib/useInternalLinks"
import type { KitProps, Scene, ImageValue, Mode } from "./kit"

// Body font: Instrument Sans (free stand-in for Trivia Sans), self-hosted in /public/fonts.
const bodyFontOr = (v: KitProps["bodyFont"]) => (v?.fontFamily && !/^\W*Inter\b/i.test(v.fontFamily) ? v : { fontFamily: '"Instrument Sans"' })
// "Back to portfolio" lands on this project's card on the home page. An old "/" value counts as unset.
const homeLink = (v: string | undefined) => (!v || v === "/" ? "/#pet-health-scan" : v)

const IMG = {
    hero: asset("aTXCKOpYTgCgJhF9lMdHmf1duM.png", "The Pet Health Scan suite, several tools across brands"),
    funnel: asset("dZ1ACM82iEzW3Yr5wUv4xM5RJCs.png", "Funnel from the analytics dashboard"),
    reminderEmail: asset("3kpyZXIPcxtk93rUwnn1P7gb34Y.jpg", "Parked: reminder email"),
    bannerRedesign: asset("Q99dgSOkDxivYiiAcS4IPGzX1M.jpg", "Dropped: banner redesign"),
    landingRedesign: asset("RGktINVEMv4S6ya1sFkFX8bSFLs.png", "Dropped: landing page redesign"),
    forms: asset("0ru6vpxpsAhmFZMdvU3dZEKvmmU.jpg", "Exit form and completion form"),
    decisionTree: asset("SfEDnB6FEXDBIrdcEoR3iMQAuo.png", "Immunity-check decision tree"),
    tryOne: asset("D6Oypxw0AMHbP4BdNtX1FTPeiRc.png", "Try 1: three swipeable pages, with the label and icon on the first page only"),
    tryTwoList: asset("8NWirisCFriDKt4yDGRJyxhIaVs.png", "Try 2: one scrolling page, sections under subheadings divided by lines"),
    tryTwoCards: asset("d8mjwiSV5tXJMnzQA6J4emHjDlU.png", "Try 2: one scrolling page, each section as its own tile"),
    before: asset("hGDPHfq5Gw7GKpQMHypHHwb8sa4.png", "Before: three swipeable pages, with the label and icon repeated on every page"),
    after: asset("ki7Sk3KEuCVdYWk5kFPQxX8a35Q.png", "After: a carousel card with the label once and labelled sections, vet consultation first"),
    brandLibrary: asset("lMhVd4dmhlddDB6G0Khalmn8Qtc.png", "Brand library: type and colour"),
    brandA: asset("eUCcvgZQi0yqvq0Mk0bj8VKAAoM.png", "Brand A"),
    brandB: asset("XT24sv6Obcm3DPDg6J4iMx4p4Ms.png", "Brand B, same tool after a library swap"),
    tints: asset("wl0w7ktqXvUlJ98hikO7wVE9IE.png", "Tints generated from a single brand colour"),
    photoErrors: asset("LC0j8F5oMfL4n6ku3WnqCHXjXJI.png", "Per-photo error states"),
    specsOne: asset("znVcYv5SY9Ro3ouVgSX658JhCvU.png", "Developer specs across breakpoints, mobile to desktop"),
    specsTwo: asset("ZViDgB6kJZJYq5neAukVVga0AdY.jpg", "Developer specs"),
}
type ImgKey = keyof typeof IMG

type Props = KitProps &
    Partial<Record<ImgKey, ImageValue>> & {
        nextLink?: string
        backLink?: string
        style?: React.CSSProperties
    }

const NAV = ["Overview", "What the data showed", "Six assumptions", "Four ideas", "What I designed", "Immunity result", "Theming", "Other work"]

/** Full-screen viewer for desktop. Opens fitted to the screen; click the image (or Zoom) for full size and scroll around. */
function Viewer({ image, onClose }: { image: ImageValue; onClose: () => void }) {
    const [zoom, setZoom] = React.useState(false)
    React.useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
        window.addEventListener("keydown", onKey)
        return () => {
            document.body.style.overflow = prev
            window.removeEventListener("keydown", onKey)
        }
    }, [onClose])
    if (typeof document === "undefined" || !image?.src) return null
    const btn: React.CSSProperties = { all: "unset", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#fff", padding: "10px 16px", borderRadius: 999, background: "rgba(255,255,255,0.14)" }
    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={image.alt || "Image"}
            onClick={(e) => {
                e.stopPropagation()
                if (e.target === e.currentTarget) onClose()
            }}
            style={{ position: "fixed", inset: 0, zIndex: 2147483000, background: "rgba(14,11,12,0.94)", display: "flex", flexDirection: "column", fontFamily: '"Instrument Sans", sans-serif' }}
        >
            <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 16px 12px 24px" }} onClick={(e) => e.stopPropagation()}>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.75)" }}>{image.alt}</span>
                <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" onClick={() => setZoom((z) => !z)} style={btn}>
                        {zoom ? "Fit to screen" : "Full size"}
                    </button>
                    <button type="button" onClick={onClose} aria-label="Close" style={btn}>
                        Close ✕
                    </button>
                </div>
            </div>
            <div
                onClick={(e) => {
                    e.stopPropagation()
                    if (e.target === e.currentTarget) onClose()
                }}
                style={{ flex: 1, minHeight: 0, overflow: zoom ? "auto" : "hidden", display: "flex", alignItems: zoom ? "flex-start" : "center", justifyContent: zoom ? "flex-start" : "center", padding: zoom ? 0 : "0 32px 32px" }}
            >
                <img
                    src={image.src}
                    alt={image.alt || ""}
                    onClick={(e) => {
                        e.stopPropagation()
                        setZoom((z) => !z)
                    }}
                    style={zoom ? { display: "block", flex: "none", maxWidth: "none", cursor: "zoom-out", margin: "0 auto" } : { display: "block", maxWidth: "100%", maxHeight: "100%", objectFit: "contain", cursor: "zoom-in", borderRadius: 8 }}
                />
            </div>
        </div>,
        document.body
    )
}

/** On desktop, makes a visual clickable to open full screen, with a small "Enlarge" chip. On phones the kit already does this. */
function Enlarge({ m, image, style, children }: { m: Mode; image: ImageValue; style?: React.CSSProperties; children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)
    if (m.linear || !image?.src) return <>{children}</>
    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`Open full screen: ${image.alt || ""}`}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setOpen(true)}
            style={{ position: "relative", display: "flex", flexDirection: "column", minHeight: 0, cursor: "zoom-in", ...style }}
        >
            {children}
            <span aria-hidden="true" style={{ position: "absolute", right: 12, top: 12, display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: "rgba(20,16,18,0.72)", color: "#fff", fontSize: 12.5, fontWeight: 600, pointerEvents: "none" }}>
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8.5 1.5h4v4M5.5 12.5h-4v-4M12.5 1.5 8 6M1.5 12.5 6 8" />
                </svg>
                Enlarge
            </span>
            {open && <Viewer image={image} onClose={() => setOpen(false)} />}
        </div>
    )
}

/** A Visual that opens full screen on click (desktop). `size` is the slot's sizing; the image fills it. */
function ZoomVisual({ m, image, label, caption, size }: { m: Mode; image: ImageValue; label: string; caption?: string; size: React.CSSProperties }) {
    if (m.linear) return <Visual image={image} label={label} caption={caption} style={size} />
    return (
        <Enlarge m={m} image={image} style={size}>
            <Visual image={image} label={label} caption={caption} style={{ flex: 1, minHeight: 0 }} />
        </Enlarge>
    )
}

/**
 * Before/after slider: both images sit in one frame, and dragging the handle (or the range input under it,
 * which also works with the keyboard) wipes from the "before" to the "after".
 */
function BeforeAfter({ m, before, after, beforeLabel, afterLabel }: { m: Mode; before: ImageValue; after: ImageValue; beforeLabel: string; afterLabel: string }) {
    const [pos, setPos] = React.useState(50)
    const box = React.useRef<HTMLDivElement>(null)
    const dragging = React.useRef(false)
    const setFrom = (clientX: number) => {
        const r = box.current?.getBoundingClientRect()
        if (!r || r.width <= 0) return
        setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)))
    }
    const img: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", padding: m.narrow ? 10 : 16, boxSizing: "border-box", userSelect: "none", pointerEvents: "none" }
    const pill: React.CSSProperties = { position: "absolute", top: 12, fontSize: 12.5, fontWeight: 600, padding: "5px 10px", borderRadius: 999, pointerEvents: "none", whiteSpace: "nowrap" }
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, height: m.linear ? "auto" : "100%", minHeight: 0 }}>
            <div
                ref={box}
                onPointerDown={(e) => {
                    dragging.current = true
                    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
                    setFrom(e.clientX)
                }}
                onPointerMove={(e) => dragging.current && setFrom(e.clientX)}
                onPointerUp={() => (dragging.current = false)}
                onPointerCancel={() => (dragging.current = false)}
                style={{ position: "relative", flex: m.linear ? undefined : 1, minHeight: 0, aspectRatio: m.linear ? "1 / 1" : undefined, borderRadius: 14, overflow: "hidden", background: C.soft, cursor: "ew-resize", touchAction: "pan-y" }}
            >
                {after?.src && <img src={after.src} srcSet={after.srcSet} alt={after.alt || afterLabel} draggable={false} style={img} />}
                <div style={{ position: "absolute", inset: 0, background: C.soft, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
                    {before?.src && <img src={before.src} srcSet={before.srcSet} alt={before.alt || beforeLabel} draggable={false} style={img} />}
                </div>
                <span style={{ ...pill, left: 12, background: C.ink, color: C.bg, opacity: pos > 12 ? 1 : 0, transition: "opacity .2s" }}>{beforeLabel}</span>
                <span style={{ ...pill, right: 12, background: C.highlight, color: C.ink, opacity: pos < 88 ? 1 : 0, transition: "opacity .2s" }}>{afterLabel}</span>
                <div aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, left: `${pos}%`, width: 2, marginLeft: -1, background: C.ink, pointerEvents: "none" }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", width: 40, height: 40, margin: "-20px 0 0 -20px", borderRadius: 999, background: C.paper, border: `2px solid ${C.ink}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: C.ink, boxShadow: "0 4px 14px rgba(0,0,0,0.12)" }}>
                        ‹ ›
                    </div>
                </div>
            </div>
            <input
                type="range"
                min={0}
                max={100}
                value={Math.round(pos)}
                onChange={(e) => setPos(Number(e.target.value))}
                aria-label={`Compare: ${beforeLabel} and ${afterLabel}`}
                style={{ width: "100%", margin: 0, accentColor: "#FF5C34", flex: "none" }}
            />
        </div>
    )
}

function Idea({ m, status, title, aimed, why, image, label }: { m: Mode; status: string; title: string; aimed: string; why: string; image: ImageValue; label: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", height: m.linear ? "auto" : "100%", gap: 14 }}>
            <div>
                <div style={{ display: "inline-block", fontSize: 12, color: C.ink, border: `1px solid ${C.line}`, borderRadius: 999, padding: "3px 10px", marginBottom: 10 }}>{status}</div>
                <H3>{title}</H3>
                <P style={{ fontSize: 14.5, marginBottom: 6 }}>
                    <B>Aimed at:</B> {aimed}
                </P>
                <P style={{ fontSize: 14.5, marginBottom: 0 }}>{why}</P>
            </div>
            <ZoomVisual m={m} image={image} label={label} size={m.linear ? { aspectRatio: "4 / 3" } : { flex: 1 }} />
        </div>
    )
}

function BigNumber({ m, n, label, children }: { m: Mode; n: string; label: string; children: React.ReactNode }) {
    return (
        <Column m={m}>
            <Big m={m}>{n}</Big>
            <H3>{label}</H3>
            {children}
        </Column>
    )
}

/**
 * Pet Health Scan Suite case study page.
 */
export default function PetHealthCaseStudy(props: Props) {
    const img = (k: ImgKey) => pickImage(props[k], IMG[k])
    const { nextLink = "/ai-interviewer" } = props
    const backLink = homeLink(props.backLink)
    const onLinks = useInternalLinks()
    const pair = (m: Mode): React.CSSProperties => ({ display: "grid", gridTemplateColumns: m.narrow ? "minmax(0,1fr)" : "repeat(2, minmax(0,1fr))", gap: m.narrow ? 20 : 24, height: m.linear ? "auto" : "100%" })

    const scenes: Scene[] = [
        {
            kind: "flow",
            nav: 0,
            node: (m) => (
                <Hero
                    m={m}
                    tags={["UX Designer", "Consumer AI / Mobile Web"]}
                    title="Pet Health Scan Suite"
                    subtitle="Finding out why pet owners abandon an AI dental scan, across around 15 white-label health-check tools on around 10 pet-brand websites."
                    cells={[
                        ["Role", "UX Designer, working alongside a senior designer"],
                        ["Timeline", "May 2025 to September 2026, part-time alongside other projects"],
                        ["Team", "1 senior designer · 5 frontend · 2 backend · 2 QA · 1 DevOps"],
                        ["Platform", "Mobile first, also used on tablet and desktop"],
                    ]}
                    brief={[
                        ["Problem", "88% of people who opened the dental scan left before uploading a photo, and nobody knew why. The immunity check's 10-outcome result ran across three pages."],
                        ["My decision", "Use funnel data to find where people drop off, then ask why with short feedback forms at those points. Rebuild the result into labelled sections, vet advice first."],
                        ["Final design", "Feedback forms at the drop-off points, a sectioned carousel result for the immunity check, and brand libraries so a tool can be re-skinned in minutes."],
                        ["Result", "Drop-off reasons are now captured in the flow. Every result now has the same six labelled sections, most on two cards instead of three. Re-skinning a tool fell from about two days to under two minutes, across 12–13 tools."],
                    ]}
                    image={img("hero")}
                    label="PH-01 · Hero"
                    caption="Several tools across brands"
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
                                    <B>What it is.</B> A white-label suite of AI health-check tools that pet brands embed on their own websites. There are tools for teeth, skin, weight, fleas and more. A pet owner takes a photo of their dog or cat, answers a few questions, and gets a plain-language result with next steps.
                                </P>
                                <P>
                                    <B>What it's for.</B> Guidance, not diagnosis. The tools help owners spot problems early and decide whether to see a vet. They don't replace one. For most people the flow ends at the result. Signing up and chatting with a live vet are there, but secondary.
                                </P>
                                <P>
                                    <B>Who uses it.</B> Pet owners who find a tool on a brand's website, mostly on their phones.
                                </P>
                                <P>
                                    <B>Where it's built.</B> The tools are built and branded in SDK Manager, the internal no-code platform in my other case study. The tool is ours to change. The brand's website around it is not.
                                </P>
                            </>,
                        ],
                        [
                            "At a glance",
                            <>
                                <Stats
                                    m={m}
                                    items={[
                                        ["88%", "left before even uploading a photo. I designed a way to find out why."],
                                        ["6 sections", "a 10-outcome result, now split into the same labelled sections every time, vet advice first."],
                                        ["< 2 min", "to re-skin a tool for a new brand, down from about two days by my estimate. I re-skinned 12–13 tools this way."],
                                    ]}
                                />
                                <div style={{ fontSize: 13, color: C.muted, margin: "28px 0 8px" }}>How a scan works</div>
                                <Flow items={["Landing page", "Start", "Take or upload a photo", "Answer questions", "Result"]} highlight={[2]} />
                                <P>A tool only helps if someone gets to the end. An owner who leaves partway gets no result and no guidance.</P>
                            </>,
                        ],
                        [
                            "My role",
                            <>
                                <P>The senior designer owned the client relationship, the research, and the base flow every tool shares. I worked within that flow. My own work was:</P>
                                <Bullets
                                    items={[
                                        "the drop-off investigation, from hypotheses to shipped feedback forms",
                                        "the immunity check's decision tree and results redesign",
                                        "UI changes across tools, and one new tool",
                                        "developer specs",
                                        "font naming and brand libraries for theming",
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
            fit: true,
            node: (m) => (
                <Fit m={m}>
                    <Split
                        m={m}
                        left={
                            <>
                                <Eyebrow>01 · Why people left the dental scan</Eyebrow>
                                <H2 m={m}>What the data showed</H2>
                                <Table
                                    small
                                    maxWidth={520}
                                    widths="minmax(0,1.6fr) minmax(0,0.8fr) minmax(0,0.9fr)"
                                    rows={[
                                        ["Step", "People", "From previous"],
                                        ["Viewed the page", "44,749", ""],
                                        ["Started the tool", "6,780", "15%"],
                                        [<B>Tried to upload a photo</B>, <B>813</B>, <B>12%</B>],
                                        ["Photo upload succeeded", "624", "77%"],
                                        ["Reached the last tracked step", "583", "93%"],
                                    ]}
                                />
                                <P>The 189 uploads that failed (23%) were photos the AI rejected, because they didn't follow the photo instructions or weren't the right kind of image. Once a photo was in, almost everyone finished. The analytics showed where people left, but not why.</P>
                            </>
                        }
                        right={
                            <>
                                <ZoomVisual m={m} image={img("funnel")} label="PH-12 · Funnel" caption="Funnel from the analytics dashboard" size={vis(m)} />
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
                                    <Note style={{ margin: 0 }}>
                                        <B>85%</B> of visitors never started. This happens on the landing page, before the tool.
                                    </Note>
                                    <Note style={{ margin: 0, background: C.soft }}>
                                        <B>88%</B> of people who started left before trying to upload a photo. This happens inside the tool, and it's the one this work focused on.
                                    </Note>
                                </div>
                            </>
                        }
                    />
                </Fit>
            ),
        },
        {
            kind: "steps",
            nav: 2,
            count: 6,
            node: (m) => (
                <StepList
                    m={m}
                    eyebrow="02"
                    title="Six assumptions"
                    intro={<P>Every reason I could think of for the drop.</P>}
                    points={[
                        { t: "The dog isn't there", b: "The owner opens the tool when their pet isn't around." },
                        { t: "Hesitation to share a photo", b: "Owners aren't sure about sending a picture of their pet to an AI." },
                        { t: "The benefit isn't clear", b: "Owners don't see what they'd get out of the scan." },
                        { t: "The purpose isn't clear", b: "The page explains what the tool does, not why it matters." },
                        { t: "It doesn't feel necessary", b: "Owners think they can check their dog's teeth themselves." },
                        { t: "The Start button is hard to find", b: "On the landing page, disclaimers and secondary text push Start below the fold." },
                    ]}
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
                            <H2 m={m}>Four ideas, one kept</H2>
                            <P>I designed a fix for each group of guesses. Three were mocked up and set aside: one parked, two dropped.</P>
                        </Column>
                    ),
                },
                {
                    w: 0.9,
                    render: (m) => (
                        <Idea
                            m={m}
                            status="Parked"
                            title="A reminder email"
                            aimed="The dog isn't there, the owner is busy, or they were only exploring."
                            why="When someone leaves at the photo step, let them enter an email and a time to be reminded to finish. Storing emails needed a new backend database, connected to every brand. Too much build for a guess."
                            image={img("reminderEmail")}
                            label="PH-02 · Reminder email"
                        />
                    ),
                },
                {
                    w: 0.9,
                    render: (m) => (
                        <Idea
                            m={m}
                            status="Dropped"
                            title="Banner redesign"
                            aimed="Benefit and purpose of the tool unclear."
                            why={'A problem-led headline ("Is your dog one of the 8 out of 10 with oral health issues?"), a clear Start button, and a supporting stat from the brand\'s own site. The banner belongs to the brand, and we couldn\'t change it.'}
                            image={img("bannerRedesign")}
                            label="PH-03 · Banner redesign"
                        />
                    ),
                },
                {
                    w: 0.9,
                    render: (m) => (
                        <Idea
                            m={m}
                            status="Dropped"
                            title="Landing page redesign"
                            aimed="Tool not necessary, Start hard to find."
                            why="Start moved into the first screen, copy reframed around catching problems early, disclaimer moved lower. Each brand owns its landing page. It couldn't be changed from the tool's side, and 10 brands wouldn't all agree to the same change."
                            image={img("landingRedesign")}
                            label="PH-04 · Landing page redesign"
                        />
                    ),
                },
                {
                    w: 0.7,
                    render: (m) => (
                        <Column m={m}>
                            <H3>So the fourth idea was to ask first</H3>
                            <P>Each of these bet on one guess being right, and each needed either new backend work or sign-off from every brand. So the fourth idea was to find out which guess was true first, with something that fit inside the tool.</P>
                            <Note>
                                <B>Why ask instead of fixing the screens?</B> Reviewing the existing pages did turn up a visible problem: the buried Start button. But that sits on the landing page, before the tool. The drop inside the tool could be practical, like the dog not being nearby, or about trust, like unease with an AI reading a photo. Looking at screens can't tell those apart. A one-question form inside the tool could, and it didn't need any brand's sign-off.
                            </Note>
                        </Column>
                    ),
                },
            ],
        },
        {
            kind: "h",
            nav: 4,
            panels: [
                {
                    w: 0.62,
                    render: (m) => (
                        <Column m={m}>
                            <Eyebrow>04</Eyebrow>
                            <H2 m={m}>What I designed</H2>
                            <P>Two short forms: one when someone leaves partway through, and one when they finish.</P>
                            <P>
                                <B>When they appear.</B> The leaving form appears when someone taps the tool's close button, navigates away, or closes the browser tab on desktop. The finishing form appears after a scan is submitted, on selected result screens, or while browsing Additional Resources.
                            </P>
                            <P>
                                <B>Not asking twice.</B> Each person sees the form once per session. It only returns if their cookies are cleared or expire, and the cookie duration can be configured per brand.
                            </P>
                        </Column>
                    ),
                },
                { w: 1.35, render: (m) => <ZoomVisual m={m} image={img("forms")} label="PH-05 · Exit and completion forms" caption="Exit form and completion form" size={full(m, "4 / 3")} /> },
                {
                    w: 0.78,
                    render: (m) => (
                        <Column m={m}>
                            <H3>Leaving partway: one question, seven one-tap reasons</H3>
                            <P>The same form appears wherever someone leaves. The client's legal team set the seven reasons, so the wording isn't mine. I designed the form around them and mapped each reason to the guess it tests.</P>
                            <Table
                                small
                                maxWidth={620}
                                widths="minmax(0,1.6fr) minmax(0,1fr)"
                                rows={[
                                    ["Reason (set by legal)", "Tests my guess"],
                                    ["My dog isn't available right now", "Dog isn't there"],
                                    ["I'll try this again later", "None. New: timing"],
                                    ["It's too difficult to take a clear photo", "None. New: photo is hard"],
                                    ["This isn't what I was looking for", "Purpose isn't clear"],
                                    ["I have questions about the AI's accuracy", "None. New: trust in the result"],
                                    ["I'm not comfortable with AI dental analysis", "Hesitation to share a photo"],
                                    ["Other", "Anything else"],
                                ]}
                            />
                            <Note>
                                <B>Not a perfect match.</B> Three of my guesses aren't on the list: the benefit isn't clear, it doesn't feel necessary, and Start is hard to find. Those mostly play out on the brand's landing page, before anyone reaches the form. Legal's list added three reasons I hadn't considered, which widened what the form could learn.
                            </Note>
                        </Column>
                    ),
                },
                {
                    w: 0.62,
                    render: (m) => (
                        <Column m={m}>
                            <H3>Finishing</H3>
                            <P>A star rating, then one question whose options depend on the rating: short statements for 1 to 3 stars, more detailed ones for 4 to 5. The comment box is optional.</P>
                            <H3>Cheap to answer, easy to leave</H3>
                            <Bullets items={["One question, one tap, no answer selected by default.", "Skip & Exit sits next to Submit.", "The form closes in one click."]} />
                        </Column>
                    ),
                },
                {
                    w: 0.78,
                    render: (m) => (
                        <Column m={m}>
                            <H3>Result</H3>
                            <P>The forms shipped in August 2026. I moved off the project the following month, before enough responses had come in, so I don't have the results. Success was to be measured by how many people answer instead of skipping, and by which reasons come up most. Before I left, I set out what each leading reason should lead to, in some cases back to an idea that was dropped:</P>
                            <Bullets
                                items={[
                                    <>
                                        <B>"My dog isn't available right now" or "I'll try this again later"</B> → the parked reminder email, this time with evidence to justify the backend work
                                    </>,
                                    <>
                                        <B>"It's too difficult to take a clear photo"</B> → better photo guidance before the upload step, which would also cut the 23% of uploads that get rejected
                                    </>,
                                    <>
                                        <B>"This isn't what I was looking for"</B> → the banner and landing page copy
                                    </>,
                                    <>
                                        <B>AI accuracy or comfort</B> → clearer explanation of how the AI works and what it's for
                                    </>,
                                ]}
                            />
                            <Note>This is the plan I handed over, not an outcome.</Note>
                        </Column>
                    ),
                },
            ],
        },
        {
            kind: "flow",
            nav: 5,
            fit: true,
            node: (m) => (
                <Fit m={m}>
                    <Split
                        m={m}
                        left={
                            <>
                                <Eyebrow>05</Eyebrow>
                                <H2 m={m}>Making a 10-outcome result readable</H2>
                                <P>
                                    Most scan tools follow one path. The immunity check's result depends on several answers: sex, neutered or spayed, pregnancy or breeding plans, and existing symptoms. Those combine into <B>ten possible results</B>.
                                </P>
                                <P>The result is where an owner learns what's going on with their pet, what to do about it, and whether to see a vet. Two things had to work: each result needed the right content, and an owner needed to find the answer quickly.</P>
                                <P>
                                    <B>Mapped the logic.</B> I drew the full decision tree, every combination of answers and the result it leads to. From it I worked out which category each result belongs to, which label it gets, and what shows under it. That made the branching explicit for developers and QA.
                                </P>
                                <P>
                                    <B>What was wrong with the result.</B> Each result ran across two or three swipeable pages. The pet's category label and a dog icon repeated at the top of every page, taking up space without adding anything. Below them sat one long paragraph. It was hard to read, and hard to tell what the result was actually saying.
                                </P>
                            </>
                        }
                        right={<ZoomVisual m={m} image={img("decisionTree")} label="PH-06 · Decision tree" caption="Immunity-check decision tree" size={vis(m, "4 / 3")} />}
                    />
                </Fit>
            ),
        },
        {
            kind: "h",
            nav: 5,
            panels: [
                {
                    w: 0.95,
                    render: (m) => (
                        <div style={{ display: "flex", flexDirection: "column", height: m.linear ? "auto" : "100%", gap: 14 }}>
                            <div>
                                <Eyebrow>Try 1</Eyebrow>
                                <H3>Label and icon on the first page only</H3>
                                <P style={{ marginBottom: 0 }}>Removing the repeated label and icon from the later pages cut the repetition and freed up space. But the content was still one long paragraph, so finding anything in it was no easier.</P>
                            </div>
                            <ZoomVisual m={m} image={img("tryOne")} label="PH-16 · Try 1" caption="Label and icon on the first page only, paragraphs on all three" size={m.linear ? { aspectRatio: "4 / 3" } : { flex: 1 }} />
                        </div>
                    ),
                },
                {
                    w: 1.15,
                    render: (m) => (
                        <div style={{ display: "flex", flexDirection: "column", height: m.linear ? "auto" : "100%", gap: 14 }}>
                            <div>
                                <Eyebrow>Try 2</Eyebrow>
                                <H3>Subheadings on one scrolling page</H3>
                                <P style={{ marginBottom: 0 }}>I dropped the dog icon, kept the label, and split the paragraph into sections under subheadings, so an owner could see what was where. It was one page to scroll through. The client turned it down: every other tool shows results as swipeable cards, and they wanted this one to match.</P>
                            </div>
                            <div style={{ ...pair(m), flex: 1, minHeight: 0 }}>
                                <ZoomVisual m={m} image={img("tryTwoList")} label="PH-14 · Try 2, divided list" caption="Subheadings divided by lines" size={m.linear ? { aspectRatio: "3 / 4" } : { height: "100%" }} />
                                <ZoomVisual m={m} image={img("tryTwoCards")} label="PH-15 · Try 2, tiles" caption="Each section as a tile" size={m.linear ? { aspectRatio: "3 / 4" } : { height: "100%" }} />
                            </div>
                        </div>
                    ),
                },
                {
                    w: 1.05,
                    render: (m) => (
                        <div style={{ display: "flex", flexDirection: "column", height: m.linear ? "auto" : "100%", gap: 14 }}>
                            <div>
                                <Eyebrow>Final</Eyebrow>
                                <H3>Subheadings in a swipeable carousel</H3>
                                <P style={{ marginBottom: 0 }}>I kept the subheadings from Try 2 and moved them into the carousel format the other tools use. Every result now has the same six labelled sections, with the vet consultation first, so the most important advice is the first thing an owner reads. The label appears once and the icon is gone. Most results went from three cards to two; the few that still need three no longer fill each one with text. Drag to compare.</P>
                            </div>
                            <div style={{ flex: m.linear ? undefined : 1, minHeight: 0 }}>
                                <BeforeAfter m={m} before={img("before")} after={img("after")} beforeLabel="Before · 3 pages" afterLabel="After · 2 cards" />
                            </div>
                        </div>
                    ),
                },
                {
                    w: 0.55,
                    render: (m) => (
                        <BigNumber m={m} n="6" label="labelled sections in every result, most on two cards instead of three">
                            <P>Shipped. All ten results now use the same six labelled sections, in the same carousel format as the other tools, and most fit on two cards instead of three.</P>
                            <Note>It wasn't tested with pet owners.</Note>
                        </BigNumber>
                    ),
                },
            ],
        },
        {
            kind: "h",
            nav: 6,
            panels: [
                {
                    w: 1.1,
                    render: (m) => (
                        <Split
                            m={m}
                            left={
                                <>
                                    <Eyebrow>06</Eyebrow>
                                    <H2 m={m}>Re-skinning a tool for a new brand</H2>
                                    <P>Each tool runs on around 10 brands, each with its own colours and fonts. Re-skinning a tool's design files for another brand meant changing colours and text styles by hand, which I estimate took about two days per tool.</P>
                                    <Bullets
                                        items={[
                                            <>
                                                <B>Consistent names.</B> Colour roles follow the client's fixed mapping. I named the font styles so every tool uses the same names for the same roles.
                                            </>,
                                            <>
                                                <B>One library per brand.</B> Each brand's colours and fonts live in one Figma library. Swapping the library re-skins a whole tool at once, because the names match across brands.
                                            </>,
                                        ]}
                                    />
                                </>
                            }
                            right={<ZoomVisual m={m} image={img("brandLibrary")} label="PH-08 · Brand library" caption="Brand library: type and colour" size={vis(m, "4 / 3")} />}
                        />
                    ),
                },
                {
                    w: 1.15,
                    render: (m) => (
                        <div style={pair(m)}>
                            <ZoomVisual m={m} image={img("brandA")} label="PH-09 · Brand A" caption="Brand A" size={full(m, "3 / 4")} />
                            <ZoomVisual m={m} image={img("brandB")} label="PH-10 · Brand B" caption="Brand B, same tool after a library swap" size={full(m, "3 / 4")} />
                        </div>
                    ),
                },
                {
                    w: 1.1,
                    render: (m) => (
                        <Split
                            m={m}
                            cols="minmax(0,0.8fr) minmax(0,1.2fr)"
                            left={
                                <>
                                    <H3>Brands with one colour</H3>
                                    <P>Some brands supplied a single colour. I generated a full set of tints from it with a plugin, so every colour role in the tool was still filled.</P>
                                    <div style={{ marginTop: 24 }}>
                                        <Big m={m}>{"< 2 min"}</Big>
                                    </div>
                                    <P>Setting up a new brand's library takes 10–15 minutes, to define its font styles and colours. After that, re-skinning a tool's design takes a minute or two instead of about two days, and the same library re-skins every tool.</P>
                                    <P>
                                        <B>Used for real.</B> I re-skinned 12–13 tools this way, across 3–4 brands.
                                    </P>
                                </>
                            }
                            right={<ZoomVisual m={m} image={img("tints")} label="PH-17 · Tints" caption="Tints generated from a single brand colour" size={vis(m)} />}
                        />
                    ),
                },
            ],
        },
        {
            kind: "flow",
            nav: 7,
            node: (m) => (
                <div style={{ padding: m.narrow ? "64px 0 80px" : "14vh 0 14vh", maxWidth: 1100 }}>
                    <H2 m={m}>Other work on the suite</H2>
                    <Bullets
                        items={[
                            <>
                                <B>Multi-photo errors.</B> One tool needs three photos from different angles, so I designed an error for each photo that points to the one that failed.
                            </>,
                            <>
                                <B>Developer specs.</B> For my screens, and one new tool built on the existing flow.
                            </>,
                        ]}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: m.narrow ? "minmax(0,1fr)" : "repeat(2, minmax(0,1fr))", gap: 24, marginTop: 16 }}>
                        <ZoomVisual m={m} image={img("photoErrors")} label="PH-11 · Photo errors" caption="Per-photo error states" size={{ aspectRatio: "16 / 10", gridColumn: m.narrow ? undefined : "1 / span 2" }} />
                        <ZoomVisual m={m} image={img("specsOne")} label="PH-18 · Specs" caption="Developer specs across breakpoints, mobile to desktop" size={{ aspectRatio: "16 / 10" }} />
                        <ZoomVisual m={m} image={img("specsTwo")} label="PH-19 · Specs" caption="Developer specs" size={{ aspectRatio: "16 / 10" }} />
                    </div>
                    <Footer m={m} nextLabel="AI Interviewer" nextHref={nextLink} backHref={backLink} />
                </div>
            ),
        },
    ]

    return (
        <div onClick={onLinks} style={{ display: "contents" }}>
            <CaseStudyShell {...props} bodyFont={bodyFontOr(props.bodyFont)} title="Pet Health Scan Suite" nav={NAV} scenes={scenes} />
        </div>
    )
}

