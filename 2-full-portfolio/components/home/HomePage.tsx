"use client"
// Reethika's home page, built on the Fox X template's layout and motion, in the portfolio design system.
// Intro: REE and THIKA rise on a spring (stiffness 450, damping 60) with a slowly turning hand-painted-style sunflower
//   between them; the navbar and its blur strip drop in; then the whole name travels and shrinks into the navbar's top-left,
//   where it stays as the site mark. The hero copy then drops in on the left: the role, the value statement, the lines
//   about roles / location / email with the "(contact me)" note, and a "Selected work" button that jumps to the Work section.
//   Curved section edges flatten on scroll, intro copy rises word by word (25px + fade), the about photo sharpens out of a
//   blur behind a colour wipe, the badge turns with the scroll, work images drift gently on a parallax and zoom slightly on
//   hover with a round arrow button, the menu slides in from the right with a curved leading edge over a blurred page, the
//   footer's "Let's talk" layers close up as it scrolls in, and wheel scrolling is eased.
// Reduced motion, or arriving on a #section link from a case study, skips the intro and shows the settled page.
// Layout: desktop ≥ 1100px, tablet 810–1099px (work cards stack image-over-text), phone < 810px.
// Each work card is one link, with an id (#ai-interviewer, #sdk-manager, #pet-health-scan) so a case study's "Back" link lands on it.
// Work images are shown whole (no crop); the middle card puts its image on the left.
// Word-by-word text keeps real spaces between words, so screen readers, reader mode and copy-paste get normal sentences.
// Tokens: Paper / Cassis / Orange Topaze / Wasabi / Cool Blue; Fjalla One headings, Instrument Sans body, Caveat notes.
import * as React from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useAnimation, useScroll, useTransform, useInView } from "motion/react"
import Crossword from "./Crossword"
import { asset, type ImageValue } from "@/lib/images"
import { useInternalLinks, SCROLL_KEY } from "@/lib/useInternalLinks"

type Img = ImageValue

const T = {
    paper: "#F7F6F1",
    ink: "#351E28",
    body: "#5C4A52",
    muted: "#7A6A70",
    accent: "#FF5C34",
    accentText: "#C23A17",
    wasabi: "#E9F056",
    cool: "#D7EFFF",
    sage: "#AEB8A0",
    line: "#DCDFD3",
    soft: "#ECEEE6",
    onDark: "rgba(247,246,241,0.86)",
    onDarkMuted: "rgba(247,246,241,0.6)",
    darkLine: "rgba(247,246,241,0.16)",
}
const HEADING = `"Fjalla One", "Arial Narrow", "Helvetica Neue", Arial, sans-serif`
const BODY = `"Instrument Sans", "Trivia Sans", "Helvetica Neue", Arial, sans-serif` // Instrument Sans: free stand-in for Trivia Sans
const SCRIPT = `"Caveat", "Segoe Print", cursive`
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]
const IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1]
const SPRING = { type: "spring" as const, stiffness: 450, damping: 60, mass: 1 }
const EMAIL_DEFAULT = "reethikachitithoti@gmail.com"
const VALUE_DEFAULT = "Engineer-turned-designer. I make complicated tools easier to use, starting with where people actually get stuck."

const DEFAULTS = {
    ai: asset("bEbCD30d6mkFM0a6Oqcd2PBUU.png", "AI Interviewer: the reverse-engineering round"),
    sdk: asset("tcEakss8cGtH8q95eZdTrvcEs.png", "SDK Manager: the SDK overview on a laptop"),
    pet: asset("aTXCKOpYTgCgJhF9lMdHmf1duM.png", "Pet Health Scan Suite: several scan tools across brands"),
    about: asset("sFlsCeS7T4TCJ7kBDTCdz4doSg.jpg", "Reethika smiling, standing beside a large blank poster"),
}

const useIso = typeof window !== "undefined" ? useLayoutEffect : useEffect


const pick = (v: Img, fb: Img): Img => (v && v.src ? v : fb)

function useWidth(ref: React.RefObject<HTMLElement | null>) {
    const [w, setW] = useState(1200)
    useIso(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => React.startTransition(() => setW(el.clientWidth)))
        ro.observe(el)
        setW(el.clientWidth)
        return () => ro.disconnect()
    }, [ref])
    return w
}

// ---------- Small motion pieces ----------

/** Hero label line: drops into place from above, behind a mask (template: y -21 → 0, spring, 2.6s). */
function DropLine({ live, delay, children, style }: { live: boolean; delay: number; children: React.ReactNode; style?: React.CSSProperties }) {
    return (
        <span style={{ display: "block", overflow: "hidden", ...style }}>
            <motion.span style={{ display: "block" }} initial={live ? { y: "-105%" } : false} animate={{ y: "0%" }} transition={{ ...SPRING, delay }}>
                {children}
            </motion.span>
        </span>
    )
}

/** Words rise 25px and fade in, one after another, when scrolled into view (template text effect). */
function Words({ text, live, style, as = "p", delay = 0 }: { text: string; live: boolean; style?: React.CSSProperties; as?: "p" | "h2"; delay?: number }) {
    const ref = useRef<HTMLElement>(null)
    const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: "0px 0px -10% 0px" })
    const Tag = as as any
    if (!live) return <Tag style={style}>{text}</Tag>
    return (
        <Tag ref={ref} style={style}>
            {/* Each word animates on its own, but a real space sits between words, so the text reads and copies normally. */}
            {text.split(" ").map((w, i, all) => (
                <React.Fragment key={i}>
                    <span style={{ display: "inline-block", overflow: "clip", verticalAlign: "top", paddingBottom: 4, marginBottom: -4, paddingRight: 2, marginRight: -2 }}>
                        <motion.span style={{ display: "inline-block" }} initial={{ y: 25, opacity: 0 }} animate={inView ? { y: 0, opacity: 1 } : { y: 25, opacity: 0 }} transition={{ duration: 0.6, ease: EASE, delay: delay + i * 0.02 }}>
                            {w}
                        </motion.span>
                    </span>
                    {i < all.length - 1 ? " " : null}
                </React.Fragment>
            ))}
        </Tag>
    )
}

/** Fades and lifts a block when it scrolls into view. */
function Rise({ live, children, style, delay = 0, y = 60 }: { live: boolean; children: React.ReactNode; style?: React.CSSProperties; delay?: number; y?: number }) {
    if (!live) return <div style={style}>{children}</div>
    return (
        <motion.div style={style} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -8% 0px" }} transition={{ ...SPRING, stiffness: 200, damping: 40, delay }}>
            {children}
        </motion.div>
    )
}

/**
 * Curved section edge (template "Circle Wrapper": a 150%-wide ellipse in a 100px band).
 * side "top": a hump of `color` rising into the area above; it flattens as it scrolls up the screen.
 * side "bottom": `color` hanging down into `bg`.
 */
function Curve({ color, bg = "transparent", side, live, size = 100 }: { color: string; bg?: string; side: "top" | "bottom"; live: boolean; size?: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.2"] })
    const flat = useTransform(scrollYProgress, [0, 1], [1, 0])
    // Only the drawing flattens (scaleY), so the page height never changes while scrolling.
    return (
        <div ref={ref} aria-hidden="true" style={{ position: "relative", width: "100%", height: size, overflow: "hidden", background: bg, flex: "none" }}>
            <motion.div style={{ position: "absolute", inset: 0, transformOrigin: side === "top" ? "50% 100%" : "50% 0%", scaleY: live ? flat : 1 }}>
                <div style={{ position: "absolute", left: "-25%", width: "150%", height: "750%", borderRadius: "50%", background: color, ...(side === "top" ? { top: 0 } : { bottom: 0 }) }} />
            </motion.div>
        </div>
    )
}

/** Hand-drawn arrow used next to the Caveat notes. */
function Scribble({ color, flip, size = 34 }: { color: string; flip?: boolean; size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" style={{ transform: flip ? "scaleX(-1)" : undefined, flex: "none" }}>
            <path d="M36 6C24 6 12 12 8 30" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
            <path d="M3 24l5 7 6-5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

/** Hand-drawn arrow that curves over and points left, at the contact lines. */
function PointLeft({ color }: { color: string }) {
    return (
        <svg width={52} height={30} viewBox="0 0 52 30" fill="none" aria-hidden="true" style={{ flex: "none" }}>
            <path d="M48 12C38 1 20 2 6 19" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
            <path d="M5 11l1 9 9-1" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function ArrowUpRight({ color, size = 18 }: { color: string; size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 15L15 5M7 5h8v8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

/** Circular badge ("UX DESIGNER") that turns as the page scrolls (template badge). The text is stretched to fit the ring exactly, on a Cassis disc so it reads over the photo. */
function Badge({ text, color, size, live }: { text: string; color: string; size: number; live: boolean }) {
    const id = "badge" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
    const ring = `${text} · `.repeat(2)
    const { scrollY } = useScroll()
    const rotate = useTransform(scrollY, (v) => v * 0.2)
    return (
        <motion.div style={{ width: size, height: size, rotate: live ? rotate : 0 }}>
            <svg viewBox="0 0 120 120" width={size} height={size} aria-label={text} role="img">
                <defs>
                    <path id={id} d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
                </defs>
                <circle cx={60} cy={60} r={59} fill={T.ink} />
                <text style={{ fontFamily: HEADING, fontSize: 15.2, letterSpacing: 2.6, textTransform: "uppercase" }} fill={color} textLength={289} lengthAdjust="spacing">
                    <textPath href={`#${id}`}>{ring}</textPath>
                </text>
                <path d="M60 46 L63 57 L74 60 L63 63 L60 74 L57 63 L46 60 L57 57 Z" fill={color} />
            </svg>
        </motion.div>
    )
}

/**
 * Hero flower when no photo is set: a hand-painted-style sunflower that slowly turns, with no card behind it.
 * Two rings of streaky golden petals with wobbly, watercolour edges, an orange glow under the head,
 * and a dark olive seed head speckled with gold. Drawn in code, so it's ours and stays sharp at any size.
 */
function Sunflower({ live }: { live: boolean }) {
    const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "")
    const rnd = (n: number) => {
        const x = Math.sin(n * 12.9898) * 43758.5453
        return x - Math.floor(x)
    }
    const PETAL = "M0,-28 C19,-40 22,-76 3,-95 C0,-98 -4,-97 -6,-94 C-23,-76 -19,-40 0,-28 Z"
    const petal = (k: number, ring: 0 | 1) => {
        const n = 14
        const rot = (360 / n) * k + (ring ? 360 / n / 2 : 0) + (rnd(k + ring * 50) - 0.5) * 5
        const s = ring ? 0.93 + rnd(k + 7) * 0.08 : 0.98 + rnd(k + 3) * 0.09
        return (
            <g key={ring + "-" + k} transform={`rotate(${rot}) scale(${s.toFixed(3)})`}>
                <path d={PETAL} fill={`url(#${uid}${ring ? "pb" : "pf"})`} />
                <path d="M0,-36 C1,-55 1,-75 0,-88" stroke="#FFE68A" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.5} />
                <path d="M-8,-42 C-11,-58 -9,-76 -4,-86" stroke="#F0A81E" strokeWidth={1.6} strokeLinecap="round" fill="none" opacity={0.55} />
                <path d="M8,-44 C11,-60 9,-74 4,-84" stroke="#F0A81E" strokeWidth={1.3} strokeLinecap="round" fill="none" opacity={0.4} />
            </g>
        )
    }
    const seeds = Array.from({ length: 150 }, (_, i) => {
        const a = (i * 137.508 * Math.PI) / 180
        const r = 3.1 * Math.sqrt(i + 0.5)
        return { x: r * Math.cos(a), y: r * Math.sin(a), r, k: i }
    }).filter((d) => d.r > 17 && d.r < 39)
    return (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <motion.svg
                viewBox="-100 -100 200 200"
                style={{ width: "94%", height: "94%", overflow: "visible", willChange: "transform" }}
                animate={live ? { rotate: 360 } : undefined}
                transition={{ duration: 32, ease: "linear", repeat: Infinity }}
            >
                <defs>
                    <linearGradient id={uid + "pf"} x1="0" y1="-30" x2="0" y2="-95" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#F4A91C" />
                        <stop offset="0.45" stopColor="#FFC93A" />
                        <stop offset="1" stopColor="#FFD95E" />
                    </linearGradient>
                    <linearGradient id={uid + "pb"} x1="0" y1="-30" x2="0" y2="-95" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#E9951A" />
                        <stop offset="1" stopColor="#F9C23A" />
                    </linearGradient>
                    <radialGradient id={uid + "hd"}>
                        <stop offset="0" stopColor="#2C2810" />
                        <stop offset="0.5" stopColor="#3A3112" />
                        <stop offset="0.82" stopColor="#4F3D14" />
                        <stop offset="1" stopColor="#5E4818" />
                    </radialGradient>
                    {/* Watercolour edges: a little turbulence pushes the outlines around */}
                    <filter id={uid + "paint"} x="-10%" y="-10%" width="120%" height="120%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={4} result="n" />
                        <feDisplacementMap in="SourceGraphic" in2="n" scale={4} xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                    <filter id={uid + "soft"} x="-30%" y="-30%" width="160%" height="160%">
                        <feGaussianBlur stdDeviation={3} />
                    </filter>
                </defs>
                <g filter={`url(#${uid}paint)`}>
                    {Array.from({ length: 14 }, (_, k) => petal(k, 1))}
                    {Array.from({ length: 14 }, (_, k) => petal(k, 0))}
                </g>
                <circle r={47} fill="#E8901A" opacity={0.7} filter={`url(#${uid}soft)`} />
                <g filter={`url(#${uid}paint)`}>
                    <circle r={42} fill={`url(#${uid}hd)`} />
                    <circle r={20} fill="#231F0C" opacity={0.55} filter={`url(#${uid}soft)`} />
                </g>
                {seeds.map((d) => (
                    <circle key={d.k} cx={d.x.toFixed(2)} cy={d.y.toFixed(2)} r={(0.9 + rnd(d.k) * 0.8).toFixed(2)} fill={d.k % 5 === 0 ? "#7C8A3A" : "#C08A2E"} opacity={0.45 + rnd(d.k + 9) * 0.4} />
                ))}
            </motion.svg>
        </div>
    )
}

/** Width of the flower slot between REE and THIKA, as a share of the font size (the template card's tilted footprint). */
const NAME_GAP = 0.669

/**
 * REE [sunflower] THIKA at a given size. The hero shows it big for the intro; the navbar shows it small as the site mark.
 * Both are the same proportions, so the big one can scale straight down onto the small one.
 * `rise` gives the intro delays for REE and THIKA rising from below (template: 580px at 260px type).
 */
function NameMark({ fs, live, rootRef, reeRef, thikaRef, rise }: { fs: number; live: boolean; rootRef?: React.Ref<HTMLSpanElement>; reeRef?: React.Ref<HTMLSpanElement>; thikaRef?: React.Ref<HTMLSpanElement>; rise?: [number, number] }) {
    const cardH = fs * 0.76
    const cardW = cardH * 0.866
    const part = (text: string, ref: React.Ref<HTMLSpanElement> | undefined, delay?: number) => (
        <motion.span ref={ref} initial={live && delay !== undefined ? { y: fs * 2.2 } : false} animate={{ y: 0 }} transition={{ ...SPRING, delay: delay ?? 0 }} style={{ position: "relative", zIndex: 1, display: "block" }}>
            {text}
        </motion.span>
    )
    return (
        <span ref={rootRef} aria-hidden="true" style={{ display: "flex", alignItems: "center", fontFamily: HEADING, fontWeight: 400, fontSize: fs, lineHeight: 0.8, letterSpacing: 0, textTransform: "uppercase", whiteSpace: "nowrap", color: "inherit" }}>
            {part("Ree", reeRef, rise?.[0])}
            <span style={{ position: "relative", flex: "none", width: fs * NAME_GAP, alignSelf: "stretch" }}>
                <span style={{ position: "absolute", left: "50%", top: "50%", width: cardW, height: cardH, marginLeft: -cardW / 2, marginTop: -cardH / 2, zIndex: 2, display: "block", transform: "rotate(8deg)" }}>
                    <Sunflower live={live} />
                </span>
            </span>
            {part("Thika", thikaRef, rise?.[1])}
        </span>
    )
}

/** Image with an empty-state placeholder (also shown if the image fails to load). */
function Photo({ image, label, fit = "cover", style, dark, sizes = "(max-width: 810px) 100vw, 50vw", eager }: { image: Img; label: string; fit?: "cover" | "contain"; style?: React.CSSProperties; dark?: boolean; sizes?: string; eager?: boolean }) {
    const [failed, setFailed] = useState(false)
    useEffect(() => setFailed(false), [image?.src])
    if (image?.src && !failed)
        return (
            <img
                src={image.src}
                srcSet={image.srcSet}
                sizes={image.srcSet ? sizes : undefined}
                width={image.width}
                height={image.height}
                alt={image.alt || label}
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                onError={() => setFailed(true)}
                style={{ width: "100%", height: "100%", objectFit: fit, display: "block", ...style }}
            />
        )
    return (
        <div role="img" aria-label={`Placeholder: ${label}`} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8, background: dark ? "rgba(247,246,241,0.06)" : T.soft, border: `2px dashed ${dark ? T.darkLine : T.sage}`, boxSizing: "border-box", color: dark ? T.onDarkMuted : T.muted, textAlign: "center", padding: 16, ...style }}>
            <span style={{ fontFamily: SCRIPT, fontSize: 26, lineHeight: 1 }}>{label}</span>
            <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>Image unavailable</span>
        </div>
    )
}

// ---------- Work cards (case-study styling: white cards, Cool Blue chips, Wasabi highlight, sage image frame) ----------

type Project = {
    id: string
    n: string
    chips: string[]
    title: string
    body: [string, string, string]
    image: Img
    href?: string
}

function ProjectCard({ p, narrow, stack, live, flip }: { p: Project; narrow: boolean; stack: boolean; live: boolean; flip?: boolean }) {
    const ref = useRef<HTMLAnchorElement>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
    const drift = useTransform(scrollYProgress, [0, 1], [-12, 12])
    const [hover, setHover] = useState(false)
    // The whole card is one link to the case study.
    return (
        <Rise live={live}>
            <a
                ref={ref}
                id={p.id}
                href={p.href}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onFocus={() => setHover(true)}
                onBlur={() => setHover(false)}
                style={{
                    scrollMarginTop: narrow ? 90 : 120,
                    background: "#fff",
                    border: `1px solid ${hover ? T.sage : T.line}`,
                    boxShadow: hover ? "0 18px 44px rgba(53,30,40,0.08)" : "0 0 0 rgba(53,30,40,0)",
                    transition: "border-color 0.3s, box-shadow 0.3s",
                    borderRadius: 20,
                    padding: narrow ? 16 : stack ? 22 : 28,
                    display: "grid",
                    gridTemplateColumns: stack ? "minmax(0,1fr)" : flip ? "minmax(0,1.05fr) minmax(0,0.95fr)" : "minmax(0,0.95fr) minmax(0,1.05fr)",
                    gap: narrow ? 22 : stack ? 28 : 48,
                    alignItems: "center",
                    textDecoration: "none",
                    color: "inherit",
                    cursor: "pointer",
                }}
            >
                {/* Text */}
                <div style={{ order: stack ? 2 : flip ? 2 : 1, padding: narrow ? "0 4px 6px" : stack ? "0 8px 10px" : flip ? "8px 12px 8px 0" : "8px 0 8px 12px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginBottom: 18 }}>
                        <span style={{ fontFamily: HEADING, fontSize: 18, color: T.accentText, marginRight: 4 }}>{p.n}</span>
                        {p.chips.map((c) => (
                            <span key={c} style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: T.ink, background: T.cool, borderRadius: 999, padding: "6px 12px" }}>
                                {c}
                            </span>
                        ))}
                    </div>
                    <h3 style={{ fontFamily: HEADING, fontWeight: 400, fontSize: narrow ? 32 : 42, lineHeight: 1.02, letterSpacing: "0.005em", margin: "0 0 16px", color: T.ink }}>{p.title}</h3>
                    <p style={{ fontSize: narrow ? 15.5 : 16, lineHeight: 1.6, color: T.body, margin: "0 0 28px", maxWidth: "34em" }}>
                        {p.body[0]}
                        {/* Highlighter band from just above the baseline to the bottom of the descenders (the original's marker look). */}
                        <span style={{ background: `linear-gradient(transparent 56%, ${T.wasabi} 56%, ${T.wasabi} 82%, transparent 82%)`, color: T.ink, fontWeight: 700, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{p.body[1]}</span>
                        {p.body[2]}
                    </p>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 700, letterSpacing: "0.04em", color: T.ink, textDecoration: "underline", textDecorationColor: T.accent, textDecorationThickness: 2, textUnderlineOffset: 6 }}>
                        Read the case study
                        <motion.span aria-hidden="true" animate={{ x: hover ? 6 : 0 }} transition={{ duration: 0.25 }}>
                            →
                        </motion.span>
                    </span>
                </div>

                {/* Image: shown whole (no crop), a gentle parallax drift, a small zoom on hover, round arrow button (template work card) */}
                <div style={{ order: stack ? 1 : flip ? 1 : 2, position: "relative", aspectRatio: stack && !narrow ? "16 / 9" : "4 / 3", borderRadius: 14, overflow: "hidden", background: T.soft, isolation: "isolate" }}>
                    <motion.div style={{ position: "absolute", inset: 0, y: live ? drift : 0 }}>
                        <motion.div style={{ position: "absolute", inset: narrow ? 8 : 14 }} initial={false} animate={{ scale: hover ? 1.04 : 1 }} transition={{ duration: 0.8, ease: EASE }}>
                            <Photo image={p.image} label={p.title} fit="contain" />
                        </motion.div>
                    </motion.div>
                    <motion.span
                        aria-hidden="true"
                        initial={false}
                        animate={{ opacity: hover ? 1 : 0, scale: hover ? 1 : 1.1 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        style={{ position: "absolute", top: narrow ? 12 : 18, right: narrow ? 12 : 18, width: narrow ? 52 : 64, height: narrow ? 52 : 64, borderRadius: 99, background: T.wasabi, display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <ArrowUpRight color={T.ink} size={narrow ? 18 : 20} />
                    </motion.span>
                </div>
            </a>
        </Rise>
    )
}

// ---------- Navbar + menu ----------

function MenuIcon({ open, color }: { open: boolean; color: string }) {
    // Template: two lines that close into one while the menu is open.
    return (
        <span style={{ position: "relative", display: "block", width: 40, height: 13 }} aria-hidden="true">
            <motion.span style={{ position: "absolute", left: 0, right: 0, height: 2, top: 0 }} initial={false} animate={{ y: open ? 5.5 : 0, backgroundColor: color }} transition={{ duration: 0.4, ease: EASE }} />
            <motion.span style={{ position: "absolute", left: 0, right: 0, height: 2, bottom: 0 }} initial={false} animate={{ y: open ? -5.5 : 0, backgroundColor: color }} transition={{ duration: 0.4, ease: EASE }} />
        </span>
    )
}

function MenuLink({ label, n, onClick }: { label: string; n: number; onClick: () => void }) {
    const [h, setH] = useState(false)
    return (
        <a
            href="#"
            onClick={(e) => {
                e.preventDefault()
                onClick()
            }}
            onMouseEnter={() => setH(true)}
            onMouseLeave={() => setH(false)}
            style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", textDecoration: "none", color: T.paper, borderBottom: `1px solid ${T.darkLine}` }}
        >
            <motion.span aria-hidden="true" initial={false} animate={{ opacity: h ? 1 : 0, x: h ? 0 : -10, rotate: h ? 0 : -45 }} transition={{ duration: 0.3, ease: EASE }} style={{ position: "absolute", left: 0, display: "flex" }}>
                <ArrowUpRight color={T.wasabi} size={16} />
            </motion.span>
            <motion.span initial={false} animate={{ x: h ? 26 : 0, color: h ? T.wasabi : T.paper }} transition={{ duration: 0.3, ease: EASE }} style={{ fontFamily: HEADING, fontSize: 44, lineHeight: 1.12, textTransform: "uppercase", letterSpacing: "0.005em" }}>
                {label}
            </motion.span>
            <span style={{ fontSize: 12, color: T.onDarkMuted, fontVariantNumeric: "tabular-nums" }}>0{n}</span>
        </a>
    )
}

const RESUME_NAME = "Reethika_Chitithoti_Resume.pdf"
/**
 * Saves a file instead of opening it. If the file sits on another origin the download attribute alone is ignored,
 * so it's fetched and saved as a blob. If that fails it opens in a new tab.
 */
function downloadFile(e: React.MouseEvent, url: string, name: string) {
    e.preventDefault()
    e.stopPropagation()
    fetch(url)
        .then((r) => {
            if (!r.ok) throw new Error(String(r.status))
            return r.blob()
        })
        .then((b) => {
            const u = URL.createObjectURL(b)
            const a = document.createElement("a")
            a.href = u
            a.download = name
            document.body.appendChild(a)
            a.click()
            a.remove()
            setTimeout(() => URL.revokeObjectURL(u), 2000)
        })
        .catch(() => window.open(url, "_blank", "noopener"))
}

/** Square social button with a tooltip that tips in on hover (template socials). */
function Social({ glyph, href, name, dark, download }: { glyph: string; href: string; name: string; dark?: boolean; download?: string }) {
    const [h, setH] = useState(false)
    return (
        <a href={href} download={download} onClick={download ? (e) => downloadFile(e, href, download) : undefined} target={href.startsWith("mailto") || download ? undefined : "_blank"} rel="noopener noreferrer" aria-label={name} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onFocus={() => setH(true)} onBlur={() => setH(false)} style={{ position: "relative", width: 40, height: 40, borderRadius: 10, background: dark ? T.paper : "#fff", color: T.ink, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, textDecoration: "none", flex: "none" }}>
            {glyph}
            <motion.span aria-hidden="true" initial={false} animate={{ opacity: h ? 1 : 0, scale: h ? 1 : 0.9, rotate: h ? 0 : 15, y: h ? 0 : 4 }} transition={{ duration: 0.3, ease: EASE }} style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, transformOrigin: "0% 100%", whiteSpace: "nowrap", background: T.wasabi, color: T.ink, fontSize: 13, fontWeight: 600, padding: "6px 10px", borderRadius: 8, pointerEvents: "none" }}>
                {name}
            </motion.span>
        </a>
    )
}

/** Bold run inside body copy. */
const B = ({ children }: { children: React.ReactNode }) => <strong style={{ color: T.ink, fontWeight: 600 }}>{children}</strong>

// ---------- Main ----------

type HomePageProps = {
    heroImage?: Img
    aboutImage?: Img
    aboutZoom?: number
    aboutFocus?: number
    aiImage?: Img
    sdkImage?: Img
    petImage?: Img
    aiLink?: string
    sdkLink?: string
    petLink?: string
    email?: string
    linkedin?: string
    resume?: string
    behance?: string
    badgeText?: string
    credit?: string
    valueLine?: string
    /** Kept for older callers; the intro no longer has a photo preloader. */
    preloader?: boolean
    smoothScroll?: boolean
    style?: React.CSSProperties
}

/** Reethika's home page (Fox X layout and motion, portfolio design system). */
export default function HomePage(props: HomePageProps) {
    const {
        aiLink = "/ai-interviewer",
        sdkLink = "/sdk-manager",
        petLink = "/pet-health-scan",
        email = EMAIL_DEFAULT,
        linkedin = "https://www.linkedin.com/in/reethika-c/",
        resume = "",
        behance = "https://www.behance.net/reethika104",
        badgeText = "Product Designer",
        credit = "Crafted by me, assisted by Claude",
        valueLine = VALUE_DEFAULT,
        aboutZoom = 1.4,
        aboutFocus = 25,
        smoothScroll = true,
        style,
    } = props
    // Motion runs on the live page; prefers-reduced-motion turns it off (see also <MotionConfig reducedMotion="user"> in the layout).
    const live = true
    const [reduced, setReduced] = useState(false)
    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return
        setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    }, [])
    const motionOn = live && !reduced

    const rootRef = useRef<HTMLDivElement>(null)
    const width = useWidth(rootRef)
    const onLinks = useInternalLinks()
    const narrow = width < 810
    const tablet = !narrow && width < 1100 // 810–1099px: tablet layout
    // Side padding: 20px on phones; on wider screens it grows so the content never exceeds ~1180px.
    const pad = narrow ? 20 : Math.max(40, Math.round((width - 1180) / 2))

    // ---- Fit REE [flower] THIKA to the width ----
    const reeRef = useRef<HTMLSpanElement>(null)
    const thikaRef = useRef<HTMLSpanElement>(null)
    const [fs, setFs] = useState(260)
    useIso(() => {
        const fit = () => {
            const a = reeRef.current
            const b = thikaRef.current
            if (!a || !b) return
            const base = parseFloat(getComputedStyle(a).fontSize) || 100
            const ratio = (a.offsetWidth + b.offsetWidth) / base
            const avail = width - pad * 2
            if (ratio > 0 && avail > 0) setFs(Math.max(48, Math.floor((avail / (ratio + NAME_GAP)) * 0.99)))
        }
        fit()
        if (typeof document !== "undefined" && (document as any).fonts?.ready) (document as any).fonts.ready.then(fit)
    }, [width, pad])

    // ---- Intro timeline: the template's timings, less the 1.2s its photo preloader took (there is no photo here) ----
    const at = (s: number) => Math.max(0, s - 1.2)
    const navFs = narrow ? 20 : 24

    // ---- The big name rises, then travels and shrinks onto the navbar mark, which takes over once it lands ----
    const bigRef = useRef<HTMLDivElement>(null) // the moving layer
    const nameRef = useRef<HTMLSpanElement>(null) // the name inside it (what gets measured)
    const markRef = useRef<HTMLHeadingElement>(null) // the navbar mark it lands on
    const brand = useAnimation()
    const [fixedRect, setFixedRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
    const [brandDone, setBrandDone] = useState(false)
    useEffect(() => {
        // Arriving from a case study's "Back to portfolio" (a #section link) skips the intro and lands on that card.
        let want = typeof window !== "undefined" ? decodeURIComponent(window.location.hash.slice(1)) : ""
        try {
            want = want || sessionStorage.getItem(SCROLL_KEY) || ""
            sessionStorage.removeItem(SCROLL_KEY)
        } catch {}
        const target = want ? document.getElementById(want) : null
        if (!motionOn || target) {
            setBrandDone(true)
            if (target) [120, 600].forEach((ms) => setTimeout(() => target.scrollIntoView({ block: "start" }), ms))
            return
        }
        let cancelled = false
        const t = setTimeout(() => {
            const from = nameRef.current?.getBoundingClientRect()
            const to = markRef.current?.getBoundingClientRect()
            if (!from || !to || !from.height) return setBrandDone(true)
            // Pin the layer where the name is now, then slide and scale it (from its top-left corner) onto the mark.
            setFixedRect({ top: from.top, left: from.left, width: from.width, height: from.height })
            requestAnimationFrame(() => {
                if (cancelled) return
                brand.start({ x: to.left - from.left, y: to.top - from.top, scale: to.height / from.height, transition: { duration: 0.9, ease: IN_OUT } }).then(() => {
                    if (!cancelled) setBrandDone(true)
                })
            })
        }, at(3.0) * 1000)
        return () => {
            cancelled = true
            clearTimeout(t)
        }
    }, [motionOn])

    const [ctaHover, setCtaHover] = useState(false)

    // ---- Menu ----
    const [open, setOpen] = useState(false)
    useEffect(() => {
        if (typeof document === "undefined" || !live) return
        document.documentElement.style.overflow = open ? "hidden" : ""
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [open, live])
    const go = (id: string) => {
        setOpen(false)
        const el = typeof document !== "undefined" ? document.getElementById(id) : null
        if (el) setTimeout(() => el.scrollIntoView({ behavior: motionOn ? "smooth" : "auto", block: "start" }), motionOn ? 450 : 0)
    }

    // ---- Eased wheel scrolling (template uses smooth scroll). Touch and keyboard scrolling stay native. ----
    useEffect(() => {
        if (!motionOn || !smoothScroll || typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) return
        const html = document.documentElement
        let target = window.scrollY
        let cur = window.scrollY
        let raf = 0
        let running = false
        const max = () => html.scrollHeight - window.innerHeight
        const step = () => {
            cur += (target - cur) * 0.1
            if (Math.abs(target - cur) < 0.5) {
                cur = target
                running = false
                window.scrollTo(0, cur)
                return
            }
            window.scrollTo(0, cur)
            raf = requestAnimationFrame(step)
        }
        const scrollsInside = (el: EventTarget | null, dy: number) => {
            let n = el as HTMLElement | null
            while (n && n !== document.body) {
                const cs = getComputedStyle(n)
                if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight) {
                    if ((dy > 0 && n.scrollTop + n.clientHeight < n.scrollHeight) || (dy < 0 && n.scrollTop > 0)) return true
                }
                n = n.parentElement
            }
            return false
        }
        const onWheel = (e: WheelEvent) => {
            if (e.ctrlKey || html.style.overflow === "hidden") return
            const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY
            if (scrollsInside(e.target, dy)) return
            e.preventDefault()
            if (!running) target = cur = window.scrollY
            target = Math.max(0, Math.min(max(), target + dy))
            if (!running) {
                running = true
                raf = requestAnimationFrame(step)
            }
        }
        const onScroll = () => {
            if (!running) target = cur = window.scrollY
        }
        window.addEventListener("wheel", onWheel, { passive: false })
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => {
            window.removeEventListener("wheel", onWheel)
            window.removeEventListener("scroll", onScroll)
            cancelAnimationFrame(raf)
        }
    }, [motionOn, smoothScroll])

    // ---- Nav colour follows the section under it ----
    const [navDark, setNavDark] = useState(false)
    useEffect(() => {
        if (typeof window === "undefined") return
        let raf = 0
        const check = () => {
            raf = 0
            const els = document.elementsFromPoint(Math.max(40, pad + 10), 40)
            const sec = els.map((e) => (e as HTMLElement).closest?.("[data-nav]")).find(Boolean) as HTMLElement | undefined
            const d = sec?.getAttribute("data-nav") === "dark"
            setNavDark((prev) => (prev === d ? prev : d))
        }
        const on = () => {
            if (!raf) raf = requestAnimationFrame(check)
        }
        check()
        window.addEventListener("scroll", on, { passive: true })
        window.addEventListener("resize", on)
        return () => {
            window.removeEventListener("scroll", on)
            window.removeEventListener("resize", on)
            if (raf) cancelAnimationFrame(raf)
        }
    }, [pad])
    const navColor = open ? T.paper : navDark ? T.paper : T.ink
    const logoColor = navDark && !open ? T.paper : T.ink

    const ai = pick(props.aiImage, DEFAULTS.ai)
    const sdk = pick(props.sdkImage, DEFAULTS.sdk)
    const pet = pick(props.petImage, DEFAULTS.pet)

    const label: React.CSSProperties = { fontSize: narrow ? 12.5 : 14, fontWeight: 600, letterSpacing: "0.01em", textTransform: "uppercase", lineHeight: 1.4, color: T.ink }
    const leftLines = ["Product Designer"]
    const leftLines2 = ["Open to product design roles", "Bangalore / Remote"]

    const projects: Project[] = [
        {
            id: "ai-interviewer",
            n: "01",
            chips: ["Sole Designer", "Internal AI MVP"],
            title: "AI Interviewer",
            body: ["Engineers were losing hours to first-round technical interviews. I was the only designer on the tool that took them over: the candidate test, the dashboards TA works from, and ", "rebuilt the product after v1 met reality.", ""],
            image: ai,
            href: aiLink,
        },
        {
            id: "sdk-manager",
            n: "02",
            chips: ["Sole Designer", "B2B No-Code Platform"],
            title: "SDK Manager",
            body: ["A no-code platform the client's brand teams use to build pet health-check tools. ", "Iterating a live platform from how teams actually used it", ". I redesigned how branding gets assigned, so screens stopped getting missed, and pushed for reusable components: a header change is now one edit, not one per screen."],
            image: sdk,
            href: sdkLink,
        },
        {
            id: "pet-health-scan",
            n: "03",
            chips: ["UX Designer", "Consumer AI / Mobile Web"],
            title: "Pet Health Scan Suite",
            body: ["88% of people who opened the dental scan left before uploading a photo, and nobody knew why. ", "I used funnel data to find where people drop off, then asked why", ", turned a ten-outcome result into one readable card, and set up brand libraries that cut re-skinning a tool from about two days to a couple of minutes."],
            image: pet,
            href: petLink,
        },
    ]

    const sectionTitle = (t: string): React.ReactNode => <h2 style={{ fontFamily: HEADING, fontWeight: 400, fontSize: narrow ? 44 : tablet ? 54 : 64, lineHeight: 0.95, textTransform: "uppercase", letterSpacing: "0.005em", color: T.ink, margin: "0 0 32px" }}>{t}</h2>
    const smallLabel: React.CSSProperties = { fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: T.muted, fontWeight: 700, marginBottom: 14 }
    const bullet = (items: React.ReactNode[]) => (
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map((it, i) => (
                <li key={i} style={{ display: "flex", gap: 12, fontSize: 16, lineHeight: 1.55, color: T.body }}>
                    <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 999, background: T.accent, marginTop: 10, flex: "none" }} />
                    <span>{it}</span>
                </li>
            ))}
        </ul>
    )
    const curveSize = narrow ? 56 : 100
    const socials: [string, string, string][] = (
        [
            ["@", `mailto:${email}`, "Email"],
            ["in", linkedin, "LinkedIn"],
            ["Bē", behance, "Behance"],
            ["CV", resume, "Resume"],
        ] as [string, string, string][]
    ).filter(([, h]) => !!h)

    return (
        <div ref={rootRef} id="top" onClick={onLinks} style={{ ...style, position: "relative", width: "100%", overflowX: "clip", background: T.paper, color: T.ink, fontFamily: BODY, WebkitFontSmoothing: "antialiased" }}>

            {/* The big name: rises into the middle of the hero, then travels into the navbar (see the brand effect above). */}
            {!brandDone && (
                <motion.div
                    ref={bigRef}
                    animate={brand}
                    aria-hidden="true"
                    style={
                        fixedRect
                            ? { position: "fixed", ...fixedRect, zIndex: 130, transformOrigin: "0 0", pointerEvents: "none" }
                            : { position: "absolute", left: pad, width: `calc(100% - ${pad * 2}px)`, top: narrow ? "44svh" : "50svh", marginTop: -fs * 0.46, padding: `${fs * 0.06}px 0`, overflow: "hidden", zIndex: 130, pointerEvents: "none" }
                    }
                >
                    <NameMark fs={fs} live={motionOn} rootRef={nameRef} reeRef={reeRef} thikaRef={thikaRef} rise={[at(1.6), at(1.8)]} />
                </motion.div>
            )}

            {/* Soft blur strip under the navbar (template "Blur with Effect") */}
            <motion.div
                aria-hidden="true"
                initial={motionOn ? { opacity: 0 } : false}
                animate={{ opacity: 1 }}
                transition={{ duration: 0, delay: at(2) }}
                style={{ position: "fixed", top: 0, left: 0, right: 0, height: narrow ? 80 : 110, zIndex: 115, pointerEvents: "none", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", WebkitMaskImage: "linear-gradient(#000 0%, #000 30%, rgba(0,0,0,0) 100%)", maskImage: "linear-gradient(#000 0%, #000 30%, rgba(0,0,0,0) 100%)" }}
            />

            {/* Navbar: drops in from above */}
            <motion.header
                initial={motionOn ? { y: -100 } : false}
                animate={{ y: 0 }}
                transition={{ ...SPRING, delay: at(2) }}
                style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 120, display: "flex", alignItems: "center", justifyContent: "space-between", padding: narrow ? "18px 20px" : "20px 30px", pointerEvents: "none" }}
            >
                {/* Site mark: the name and flower, shown once the big name has landed on it */}
                <motion.a
                    href="#top"
                    onClick={(e) => {
                        e.preventDefault()
                        go("top")
                    }}
                    initial={false}
                    animate={{ color: logoColor, opacity: brandDone ? 1 : 0 }}
                    transition={{ color: { duration: 0.4 }, opacity: { duration: 0 } }}
                    style={{ pointerEvents: brandDone ? "auto" : "none", display: "block", textDecoration: "none" }}
                >
                    <h1 ref={markRef} aria-label="Reethika" style={{ margin: 0, fontWeight: 400, lineHeight: 0.8 }}>
                        <NameMark fs={navFs} live={motionOn} />
                    </h1>
                </motion.a>
                <div style={{ display: "flex", alignItems: "center", gap: narrow ? 22 : 36 }}>
                    {/* Resume: downloads the PDF set in the "Resume (PDF)" control */}
                    {resume && (
                        <motion.a
                            href={resume}
                            download={RESUME_NAME}
                            onClick={(e) => downloadFile(e, resume, RESUME_NAME)}
                            aria-label="Download resume (PDF)"
                            initial={false}
                            animate={{ color: navColor }}
                            transition={{ duration: 0.4 }}
                            style={{ pointerEvents: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontSize: narrow ? 13 : 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", textDecoration: "none" }}
                        >
                            <span style={{ textDecoration: "underline", textDecorationColor: T.accent, textDecorationThickness: 2, textUnderlineOffset: 5 }}>Resume</span>
                            <span aria-hidden="true" style={{ fontSize: "1.1em", lineHeight: 1 }}>↓</span>
                        </motion.a>
                    )}
                    <button onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} style={{ all: "unset", pointerEvents: "auto", cursor: "pointer", padding: 10, margin: -10 } as React.CSSProperties}>
                        <MenuIcon open={open} color={navColor} />
                    </button>
                </div>
            </motion.header>

            {/* Menu: blurred page + panel sliding in from the right with a curved leading edge */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            key="veil"
                            onClick={() => setOpen(false)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.45 }}
                            style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(247,246,241,0.12)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
                        />
                        <motion.nav
                            key="panel"
                            aria-label="Main menu"
                            initial={{ x: "calc(100% + 120px)" }}
                            animate={{ x: 0 }}
                            exit={{ x: "calc(100% + 120px)" }}
                            transition={{ type: "spring", stiffness: 220, damping: 32, mass: 1 }}
                            style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: narrow ? "100vw" : "clamp(420px, 34vw, 560px)", zIndex: 110, background: T.ink, color: T.paper, boxSizing: "border-box" }}
                        >
                            {/* Curved leading edge: bulges while the panel travels, then settles flat */}
                            <motion.div
                                aria-hidden="true"
                                initial={{ scaleX: 1 }}
                                animate={{ scaleX: 0 }}
                                exit={{ scaleX: 1 }}
                                transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
                                style={{ position: "absolute", top: "-25%", left: -100, width: 200, height: "150%", borderRadius: "50%", background: T.ink, transformOrigin: "100% 50%" }}
                            />
                            <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: narrow ? "110px 24px 32px" : "135px 80px 40px", boxSizing: "border-box", overflowY: "auto" }}>
                                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}>
                                    {[
                                        ["Home", "top"],
                                        ["About", "about"],
                                        ["Work", "work"],
                                        ["Let's talk", "contact"],
                                    ].map(([t, id], i) => (
                                        <MenuLink key={id} label={t} n={i + 1} onClick={() => go(id)} />
                                    ))}
                                </motion.div>
                                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.35 }} style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 40 }}>
                                    <div style={{ display: "flex", gap: 6 }}>
                                        {socials.map(([g, h, n]) => (
                                            <Social key={n} glyph={g} href={h} name={n} download={n === "Resume" ? RESUME_NAME : undefined} />
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px", fontSize: 12.5, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                        {[
                                            ["AI Interviewer", aiLink],
                                            ["SDK Manager", sdkLink],
                                            ["Pet Health Scan Suite", petLink],
                                        ].map(([t, h]) => (
                                            <a key={t} href={h} style={{ color: T.paper, textDecoration: "underline", textDecorationColor: T.darkLine, textUnderlineOffset: 4 }}>
                                                {t}
                                            </a>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: 12.5, color: T.onDarkMuted, letterSpacing: "0.06em", textTransform: "uppercase" }}>© {new Date().getFullYear()} Reethika Chitithoti</div>
                                </motion.div>
                            </div>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>

            {/* ---------------- Hero ---------------- */}
            <section data-nav="light" style={{ position: "relative", zIndex: 0, height: narrow ? "88svh" : "100svh", minHeight: narrow ? 560 : 640, display: "flex", flexDirection: "column", justifyContent: "center", padding: `${narrow ? 96 : 120}px ${pad}px ${narrow ? 40 : 56}px`, boxSizing: "border-box" }}>
                {/* Hero copy, centred, dropping in once the name has moved up into the navbar */}
                <div style={{ maxWidth: narrow ? "none" : 820, margin: "0 auto", textAlign: "center" }}>
                    {leftLines.map((t) => (
                        <DropLine key={t} live={motionOn} delay={at(3.3)} style={label}>
                            {t}
                        </DropLine>
                    ))}
                    <div style={{ height: narrow ? 16 : 22 }} />
                    {valueLine && (
                        <DropLine live={motionOn} delay={at(3.35)} style={{ fontSize: narrow ? 26 : "clamp(28px, 2.9vw, 42px)", lineHeight: 1.14, fontWeight: 500, letterSpacing: "-0.01em", color: T.ink, textWrap: "balance" } as React.CSSProperties}>
                            {valueLine}
                        </DropLine>
                    )}
                    <div style={{ height: narrow ? 24 : 32 }} />
                    <div style={{ position: "relative", width: "max-content", maxWidth: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: narrow ? 8 : 10 }}>
                        {leftLines2.map((t) => (
                            <DropLine key={t} live={motionOn} delay={at(3.45)} style={label}>
                                {t}
                            </DropLine>
                        ))}
                        <DropLine live={motionOn} delay={at(3.45)} style={label}>
                            <a href={`mailto:${email}`} style={{ color: T.ink, textDecoration: "underline", textDecorationColor: T.accent, textUnderlineOffset: 4, textDecorationThickness: 2, textTransform: "none", fontSize: narrow ? 13 : 15 }}>
                                {email}
                            </a>
                        </DropLine>
                        {/* "(contact me)" sits level with the email line, so the arrow points at the address */}
                        {!narrow && (
                            <motion.div initial={motionOn ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ ...SPRING, delay: at(3.9) }} style={{ position: "absolute", left: "calc(100% + 14px)", bottom: -4, height: 30, display: "flex", alignItems: "center", gap: 8, color: T.accentText, whiteSpace: "nowrap" }}>
                                <PointLeft color={T.accentText} />
                                <span style={{ fontFamily: SCRIPT, fontSize: 24, lineHeight: 1, marginTop: -16 }}>(contact me)</span>
                            </motion.div>
                        )}
                    </div>
                    <div style={{ height: narrow ? 28 : 36 }} />
                    {/* Jump to the work: the page's first call to action */}
                    <DropLine live={motionOn} delay={at(3.6)} style={{ paddingBottom: 2 }}>
                        <a
                            href="#work"
                            onClick={(e) => {
                                e.preventDefault()
                                go("work")
                            }}
                            onMouseEnter={() => setCtaHover(true)}
                            onMouseLeave={() => setCtaHover(false)}
                            onFocus={() => setCtaHover(true)}
                            onBlur={() => setCtaHover(false)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 12, background: T.ink, color: T.paper, borderRadius: 999, padding: narrow ? "13px 20px 13px 22px" : "15px 22px 15px 26px", fontSize: narrow ? 13 : 14, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none" }}
                        >
                            Selected work
                            <motion.span aria-hidden="true" initial={false} animate={{ y: ctaHover ? 4 : 0 }} transition={{ duration: 0.25 }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 99, background: T.wasabi, color: T.ink, fontSize: 15, lineHeight: 1 }}>
                                ↓
                            </motion.span>
                        </a>
                    </DropLine>
                </div>
            </section>

            {/* ---------------- Everything below scrolls up over the hero ---------------- */}
            <div style={{ position: "relative", zIndex: 1 }}>
                <Curve color={T.ink} side="top" live={motionOn} size={curveSize} />

                {/* About */}
                <section id="about" data-nav="dark" style={{ background: T.ink, color: T.paper, padding: narrow ? `56px ${pad}px 80px` : tablet ? `110px ${pad}px 120px` : `150px ${pad}px 150px` }}>
                    <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: narrow ? "minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1fr)", gap: narrow ? 56 : tablet ? 56 : 100, alignItems: "center" }}>
                        <div style={{ maxWidth: 400, justifySelf: narrow ? "start" : "center", order: narrow ? 2 : 1 }}>
                            <Words as="h2" live={motionOn} text="Helloo! I am Reethika" style={{ fontFamily: HEADING, fontWeight: 400, fontSize: narrow ? 28 : 31, lineHeight: 1.05, textTransform: "uppercase", color: T.wasabi, margin: "0 0 26px" }} />
                            {[
                                "I studied electronics engineering before I studied design, so a room full of developers feels familiar. It's probably why I keep ending up on technical products: an AI screening tool, a no-code SDK builder.",
                                "I'd rather find out why people get stuck than guess. Sometimes that's interviews, sometimes it's funnel data, sometimes it's sitting with QA while they break things.",
                                "I've been the only designer on a team and one of several. Now I'm looking for a product team where I can take a problem from research to release.",
                                "Outside work it's puzzles and crosswords. Same habit, really: read the clues, try a guess, don't ink it in until it fits.",
                            ].map((t, i) => (
                                <Words key={i} live={motionOn} text={t} delay={0.05} style={{ fontSize: narrow ? 15.5 : 16.5, fontWeight: 400, lineHeight: 1.55, color: T.onDark, margin: "0 0 18px" }} />
                            ))}
                        </div>
                        <div style={{ position: "relative", order: narrow ? 1 : 2, marginRight: narrow ? 0 : "clamp(40px, 6vw, 100px)" }}>
                            <AboutImage image={pick(props.aboutImage, DEFAULTS.about)} live={motionOn} narrow={narrow} zoom={aboutZoom} focusY={aboutFocus} />
                            <div style={{ position: "absolute", zIndex: 3, ...(narrow ? { top: 12, right: 12 } : { top: -56, left: -56 }) }}>
                                <Badge text={badgeText} color={T.wasabi} size={narrow ? 92 : 128} live={motionOn} />
                            </div>
                        </div>
                    </div>
                </section>
                <Curve color={T.ink} bg={T.paper} side="bottom" live={motionOn} size={curveSize} />

                {/* Work */}
                <section id="work" data-nav="light" style={{ background: T.paper, padding: narrow ? `110px ${pad}px 0` : `220px ${pad}px 0` }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: narrow ? 40 : 80 }}>
                        <div style={{ position: "relative" }}>
                            {/* Sized from the component's own width (not vw), so it never runs off a phone frame. */}
                            <Words as="h2" live={motionOn} text="Work" style={{ fontFamily: HEADING, fontWeight: 400, fontSize: narrow ? Math.round(width * 0.2) : Math.min(Math.round(width * 0.13), 190), lineHeight: 0.95, textTransform: "uppercase", color: T.ink, margin: 0 }} />
                            <span style={{ position: "absolute", left: "100%", top: 0, marginLeft: narrow ? 4 : 10, marginTop: narrow ? 2 : 8, fontFamily: HEADING, fontSize: narrow ? 16 : 28, color: T.accentText }}>(03)</span>
                        </div>
                    </div>
                    <div style={{ maxWidth: 1380, margin: "0 auto", display: "flex", flexDirection: "column", gap: narrow ? 20 : 28 }}>
                        {projects.map((p, i) => (
                            <ProjectCard key={p.n} p={p} narrow={narrow} stack={width < 1100} live={motionOn} flip={i === 1} />
                        ))}
                    </div>
                </section>

                {/* Skills */}
                <section data-nav="light" style={{ background: T.paper, padding: narrow ? `96px ${pad}px 0` : `160px ${pad}px 0` }}>
                    <div style={{ maxWidth: 1380, margin: "0 auto", borderTop: `1px solid ${T.line}`, paddingTop: narrow ? 56 : 96 }}>
                        <Rise live={motionOn}>
                            {sectionTitle("Skills")}
                            <div style={{ display: "grid", gridTemplateColumns: narrow ? "minmax(0,1fr)" : "repeat(3, minmax(0,1fr))", gap: narrow ? 36 : 48 }}>
                                <div>
                                    <div style={smallLabel}>Tools</div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                        {["Figma", "Miro", "Notion", "Claude Design", "Illustrator"].map((s) => (
                                            <span key={s} style={{ fontSize: 14, color: T.ink, background: "#fff", border: `1px solid ${T.line}`, borderRadius: 999, padding: "6px 14px" }}>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div style={smallLabel}>UX & research</div>
                                    {bullet(["Information architecture", "Research synthesis", "Journey mapping", "Funnel analysis and metrics", "Hypothesis-driven design", "Kano prioritisation"])}
                                </div>
                                <div>
                                    <div style={smallLabel}>Design</div>
                                    {bullet(["Wireframing and prototyping", "UI design for web and mobile", "Interaction design", "Multi-brand theming", "Design systems and component libraries", "Developer specs and handoff"])}
                                </div>
                            </div>
                        </Rise>
                    </div>
                </section>

                {/* Experience + Education: side by side from 1000px, stacked below */}
                <section data-nav="light" style={{ background: T.paper, padding: narrow ? `64px ${pad}px 0` : `110px ${pad}px 0` }}>
                    <div style={{ maxWidth: 1380, margin: "0 auto", borderTop: `1px solid ${T.line}`, paddingTop: narrow ? 56 : 96, display: "grid", gridTemplateColumns: width < 1000 ? "minmax(0,1fr)" : "minmax(0,1.15fr) minmax(0,0.85fr)", gap: width < 1000 ? 56 : 80 }}>
                        <Rise live={motionOn}>
                            {sectionTitle("Experience")}
                            {/* Same titles and dates as the resume */}
                            <div style={{ fontSize: 14, color: T.muted, marginBottom: 6 }}>Jan 2025 – Present · Hyderabad, India</div>
                            <div style={{ fontFamily: HEADING, fontSize: 28, lineHeight: 1.1, color: T.ink }}>Grid Dynamics</div>
                            <div style={{ fontSize: 15, color: T.body, margin: "6px 0 20px" }}>UX Designer</div>
                            {bullet([
                                <>
                                    <B>AI Interviewer:</B> sole designer on an internal AI screening tool, from research to MVP in six weeks.
                                </>,
                                <>
                                    <B>SDK Manager:</B> sole designer on an enterprise no-code SDK builder that cut build time from weeks to days.
                                </>,
                                <>
                                    <B>Pet Health Scan Suite:</B> UX for around 15 white-label AI health tools across around 10 pet brands.
                                </>,
                            ])}
                            <div style={{ borderTop: `1px solid ${T.line}`, margin: "36px 0 28px" }} />
                            <div style={{ fontSize: 14, color: T.muted, marginBottom: 6 }}>Sep 2022 – May 2023 · Hyderabad, India</div>
                            <div style={{ fontFamily: HEADING, fontSize: 28, lineHeight: 1.1, color: T.ink }}>Cognizant</div>
                            <div style={{ fontSize: 15, color: T.body, margin: "6px 0 20px" }}>Software Tester</div>
                            {bullet([
                                "Functional and regression testing; logged UI bugs, broken flows and accessibility defects.",
                                "Wrote UI automation scripts in Visual Studio.",
                            ])}
                        </Rise>
                        <Rise live={motionOn} delay={0.08}>
                            {sectionTitle("Education")}
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {[
                                    ["2023–2025", "M.Des, Human Centered Design", "Srishti Manipal Institute of Art, Design and Technology"],
                                    ["2018–2022", "B.E, Electronics and Communication Engineering", "MVSR Engineering College"],
                                ].map(([y, d, s]) => (
                                    <div key={d} style={{ background: "#fff", border: `1px solid ${T.line}`, borderRadius: 14, padding: narrow ? 20 : 26 }}>
                                        <div style={{ fontSize: 14, color: T.muted, marginBottom: 8 }}>{y}</div>
                                        <div style={{ fontFamily: HEADING, fontSize: 22, lineHeight: 1.15, color: T.ink, marginBottom: 6 }}>{d}</div>
                                        <div style={{ fontSize: 15, lineHeight: 1.5, color: T.body }}>{s}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ ...smallLabel, marginTop: 36 }}>Talks and papers</div>
                            {bullet([
                                <>
                                    <B>IndiaHCI 2024, IIT Bombay:</B> presented a design research project on the role of haptic communication in children's holistic development.
                                </>,
                                <>
                                    <B>ISDRS 2024, Nepal:</B> co-authored a paper on post-consumer textile waste and its management.
                                </>,
                            ])}
                        </Rise>
                    </div>
                </section>

                {/* Crossword, just above the footer */}
                <section data-nav="light" style={{ background: T.paper, padding: narrow ? `88px ${pad}px 72px` : `150px ${pad}px 140px` }}>
                    <Rise live={motionOn} style={{ maxWidth: 750, margin: "0 auto" }}>
                        <Crossword />
                    </Rise>
                </section>

                {/* Footer */}
                <Curve color={T.ink} bg={T.paper} side="top" live={motionOn} size={curveSize} />
                <Footer id="contact" email={email} linkedin={linkedin} behance={behance} credit={credit} narrow={narrow} pad={pad} live={motionOn} onTop={() => go("top")} />
            </div>
        </div>
    )
}

/**
 * About photo (template "Blur Image"): the frame rises 80px and fades in, a Wasabi panel sweeps up across it,
 * and the photo sharpens out of a heavy blur while settling from 1.2× to 1×.
 */
function AboutImage({ image, live, narrow, zoom = 1, focusY = 30 }: { image: Img; live: boolean; narrow: boolean; zoom?: number; focusY?: number }) {
    // Zoom and focus come from the "About photo zoom" / "About photo focus" controls.
    const frame: React.CSSProperties = { objectPosition: `50% ${focusY}%`, transform: `scale(${zoom})`, transformOrigin: `50% ${focusY}%` }
    const ref = useRef<HTMLDivElement>(null)
    const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" })
    const on = !live || inView
    return (
        <motion.div ref={ref} initial={live ? { opacity: 0, y: 80 } : false} animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 80 }} transition={{ ...SPRING, stiffness: 120, damping: 30 }} style={{ position: "relative", width: "100%", aspectRatio: narrow ? "4 / 5" : "640 / 672", maxHeight: 700, borderRadius: 15, overflow: "hidden", background: "rgba(247,246,241,0.06)" }}>
            <motion.div style={{ position: "absolute", inset: 0 }} initial={live ? { scale: 1.2 } : false} animate={{ scale: on ? 1 : 1.2 }} transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}>
                {image?.src && <div style={{ position: "absolute", inset: 0, filter: "blur(30px)" }}><Photo image={image} label="Your photo" dark style={frame} /></div>}
                <motion.div style={{ position: "absolute", inset: 0 }} initial={live && image?.src ? { opacity: 0 } : false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: 1, ease: EASE, delay: 0.7 }}>
                    <Photo image={image} label="Your photo" dark style={frame} />
                </motion.div>
            </motion.div>
            {live && <motion.div aria-hidden="true" style={{ position: "absolute", inset: 0, background: T.wasabi }} initial={{ y: "101%" }} animate={on ? { y: ["101%", "0%", "-101%"] } : { y: "101%" }} transition={{ duration: 1.3, ease: IN_OUT, times: [0, 0.45, 1] }} />}
        </motion.div>
    )
}

const footLink: React.CSSProperties = { color: T.paper, textDecoration: "underline", textDecorationColor: T.accent, textUnderlineOffset: 5, textDecorationThickness: 2 }

/** Footer: "Let's talk" stacked in blurred, clipped layers that close up as the footer scrolls in (template footer). */
function Footer({ id, email, linkedin, behance, credit, narrow, pad, live, onTop }: { id: string; email: string; linkedin: string; behance: string; credit: string; narrow: boolean; pad: number; live: boolean; onTop: () => void }) {
    const ref = useRef<HTMLElement>(null)
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] })
    const spread = useTransform(scrollYProgress, [0, 1], [1, 0])
    const layers = [
        { o: 0.25, b: 8 },
        { o: 0.45, b: 4 },
        { o: 0.7, b: 1.5 },
        { o: 1, b: 0 },
    ]
    const measure = useRef<HTMLSpanElement>(null)
    const [fsz, setFsz] = useState(200)
    useIso(() => {
        const fit = () => {
            const el = measure.current
            const box = ref.current
            if (!el || !box) return
            const cs = getComputedStyle(box)
            const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)
            const base = parseFloat(getComputedStyle(el).fontSize) || 200
            const r = el.offsetWidth / base
            if (r > 0 && avail > 0) setFsz(Math.floor((avail / r) * 0.98))
        }
        fit()
        if (typeof window !== "undefined") window.addEventListener("resize", fit)
        if (typeof document !== "undefined" && (document as any).fonts?.ready) (document as any).fonts.ready.then(fit)
        return () => {
            if (typeof window !== "undefined") window.removeEventListener("resize", fit)
        }
    }, [narrow])
    return (
        <footer ref={ref} id={id} data-nav="dark" style={{ background: T.ink, color: T.paper, padding: narrow ? `40px ${pad}px 28px` : `40px ${pad}px 36px`, overflow: "hidden" }}>
            <a href={`mailto:${email}`} aria-label={`Let's talk: email ${email}`} style={{ display: "block", textDecoration: "none", color: T.paper, position: "relative", fontSize: fsz }}>
                <span ref={measure} aria-hidden="true" style={{ position: "absolute", visibility: "hidden", whiteSpace: "nowrap", fontFamily: HEADING, textTransform: "uppercase", letterSpacing: "-0.005em" }}>
                    Let's talk
                </span>
                {layers.map((l, i) => (
                    <LayerLine key={i} i={i} total={layers.length} opacity={l.o} blur={l.b} spread={spread} live={live} narrow={narrow} />
                ))}
            </a>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, color: T.wasabi, margin: narrow ? "8px 0 40px 8px" : "6px 0 70px 12vw" }}>
                <svg width="38" height="38" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <path d="M6 6c4 14 14 22 28 24" stroke={T.wasabi} strokeWidth="1.6" strokeLinecap="round" />
                    <path d="M28 24l6 6-7 4" stroke={T.wasabi} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: SCRIPT, fontSize: narrow ? 26 : 28, lineHeight: 1 }}>(send a mail)</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase", color: T.onDarkMuted }}>
                <span>© {new Date().getFullYear()} Reethika Chitithoti</span>
                <span style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 28px", textTransform: "none", letterSpacing: 0, fontSize: 15 }}>
                    <a href={`mailto:${email}`} style={footLink}>
                        {email}
                    </a>
                    <a href={linkedin || undefined} target="_blank" rel="noopener noreferrer" style={footLink}>
                        LinkedIn ↗
                    </a>
                    <a href={behance || undefined} target="_blank" rel="noopener noreferrer" style={footLink}>
                        Behance ↗
                    </a>
                </span>
                <button onClick={onTop} style={{ all: "unset", cursor: "pointer", color: T.paper, fontSize: 14, letterSpacing: "0.08em" }}>
                    Back to top ↑
                </button>
            </div>
            {credit && (
                <div style={{ marginTop: narrow ? 22 : 28, paddingTop: 16, borderTop: `1px solid ${T.darkLine}`, textAlign: "center", fontFamily: SCRIPT, fontSize: narrow ? 20 : 22, lineHeight: 1.2, color: T.onDarkMuted }}>
                    {credit}
                </div>
            )}
        </footer>
    )
}

function LayerLine({ i, total, opacity, blur, spread, live, narrow }: { i: number; total: number; opacity: number; blur: number; spread: any; live: boolean; narrow: boolean }) {
    const fromBottom = total - 1 - i
    const y = useTransform(spread, (s: number) => `${-fromBottom * (narrow ? 4 : 6) * s}vh`)
    return (
        <motion.div
            aria-hidden={i < total - 1}
            style={{
                fontFamily: HEADING,
                fontSize: "1em",
                lineHeight: 0.78,
                textTransform: "uppercase",
                letterSpacing: "-0.005em",
                whiteSpace: "nowrap",
                textAlign: "center",
                opacity,
                filter: blur ? `blur(${blur}px)` : undefined,
                marginTop: i === 0 ? 0 : "-0.66em",
                y: live ? y : 0,
                clipPath: i < total - 1 ? "inset(0 0 55% 0)" : undefined,
            }}
        >
            Let's talk
        </motion.div>
    )
}

