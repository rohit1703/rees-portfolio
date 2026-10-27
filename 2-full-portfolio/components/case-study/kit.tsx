"use client"
// Shared engine and design system for all case study pages.
// - The page frame stays still. Each section is a full-screen layer; scrolling makes the next
//   section rise up and settle in the place of the previous one, which recedes underneath.
// - The left side is whitespace with a small section index.
// - "steps" sections open their points one by one; "h" sections slide horizontally.
// - Short sections show the next section underneath at lower opacity.
// - Scroll is smoothed (eased toward the target every frame).
// - Phones (below "Stack below") keep the rising layers, but sections take their natural height,
//   sideways sections become swipe cards, and a slim top bar replaces the side nav.
// - With reduced motion, everything stacks vertically.
// The layered scroll is driven by plain requestAnimationFrame + transforms (no animation library), so it behaves
// the same as the original page: the document scrolls a tall track, and a sticky "stage" redraws each frame.
import * as React from "react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { ImageValue } from "@/lib/images"
export type { ImageValue } from "@/lib/images"

// ---------- Design tokens ----------
// Two palettes. Every component reads colours through CSS variables (C.*), so a page switches
// palette with the "Theme" control and nothing else changes.
//   ink        headings and key text
//   body       paragraphs
//   muted      captions, labels
//   accent     primary accent: section numbers, bullets, progress bar, "Next" underline
//   accent2    secondary accent: nav tick, timeline dots, the open step's number
//   highlight  highlighter behind key numbers and the active flow step (never text)
//   note       surface for notes and callouts
//   sage       lines, rail, dividers; soft = visual frames; paper = cards
//   block      colour block behind the hero (title area); onBlock / onBlockMuted / chip sit on it
// Type: headings Fjalla One (Google font, one weight: Regular 400; it is already a heavy condensed face, so no faux bold); body Trivia Sans.
export const THEMES = {
    // Pinterest 2026: Cassis, Orange Topaze, Wasabi, Cool Blue, Vert Sauge on warm paper
    pinterest: {
        ink: "#351E28",
        body: "#5C4A52",
        muted: "#7A6A70",
        line: "#DCDFD3",
        soft: "#ECEEE6",
        bg: "#F7F6F1",
        accent: "#FF5C34",
        accentText: "#C23A17",
        accent2: "#FF5C34",
        accent2Text: "#C23A17",
        highlight: "#E9F056",
        note: "#D7EFFF",
        sage: "#AEB8A0",
        paper: "#FFFFFF",
        block: "#351E28",
        onBlock: "#F7F6F1",
        onBlockMuted: "rgba(247,246,241,0.82)",
        chip: "#E9F056",
        onChip: "#351E28",
    },
    // Poster: white background, slate text, brick red + denim blue accents, mustard highlighter
    poster: {
        ink: "#1E293B",
        body: "#475569",
        muted: "#5B6B82",
        line: "#E2E8F0",
        soft: "#F1F5F9",
        bg: "#FFFFFF",
        accent: "#B53A24",
        accentText: "#B53A24",
        accent2: "#4674A6",
        accent2Text: "#3D6697",
        highlight: "#F5C059",
        note: "#E7EEF6",
        sage: "#CBD5E1",
        paper: "#F6F8FB",
        block: "#B53A24",
        onBlock: "#FFFFFF",
        onBlockMuted: "rgba(255,255,255,0.86)",
        chip: "rgba(0,0,0,0.18)",
        onChip: "#FFFFFF",
    },
}
export type ThemeName = keyof typeof THEMES
type ThemeKey = keyof (typeof THEMES)["pinterest"]
export const C = Object.fromEntries(Object.keys(THEMES.pinterest).map((k) => [k, `var(--cs-${k})`])) as Record<ThemeKey, string>
const themeVars = (t: ThemeName) => Object.fromEntries(Object.entries(THEMES[t] || THEMES.pinterest).map(([k, v]) => [`--cs-${k}`, v])) as React.CSSProperties
export const HEADING_FONT = `"Fjalla One", "Fjalla One Placeholder", "Arial Narrow", "Helvetica Neue", Arial, sans-serif`
export const BODY_FONT = `"Trivia Sans", "Trivia Sans Placeholder", "Helvetica Neue", Arial, sans-serif`
export const FONT = BODY_FONT
export type FontValue = { fontFamily?: string; fontWeight?: number | string; fontStyle?: string } | undefined
type Fonts = { display: React.CSSProperties; heading: React.CSSProperties; body: React.CSSProperties }
const FontCtx = React.createContext<Fonts>({ display: { fontFamily: HEADING_FONT, fontWeight: 400 }, heading: { fontFamily: HEADING_FONT, fontWeight: 400 }, body: { fontFamily: BODY_FONT } })
const useFonts = () => React.useContext(FontCtx)
/** H2, H3 and every other heading-font use (Fjalla One). */
function useH(): React.CSSProperties {
    return useFonts().heading
}
/** H1 (Fjalla One). */
function useDisplay(): React.CSSProperties {
    return useFonts().display
}

/** Props every case study page shares. Pages spread these, so type, colour and motion changes live here. */
export type KitProps = { theme?: string; headingFont?: FontValue; displayFont?: FontValue; bodyFont?: FontValue; smoothness?: number; stackBelow?: number }
// Defaults: theme "pinterest" (or "poster"), smoothness 0.05 (0.02–0.4), stackBelow 900px (phone layout below this width).
export const RP = 64
export const EMAIL = "reethikachitithoti@gmail.com"
export type Mode = { linear: boolean; narrow: boolean }
export type Panel = { w: number; render: (m: Mode) => React.ReactNode }
export type Scene =
    | { kind: "flow"; nav: number; fit?: boolean; node: (m: Mode) => React.ReactNode }
    | { kind: "steps"; nav: number; count: number; node: (m: Mode) => React.ReactNode }
    | { kind: "h"; nav: number; panels: Panel[] }

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
const StepCtx = React.createContext<number[]>([])
const SceneIdx = React.createContext(0)
/** True on phones: text gets more air, full-width visuals run edge to edge and open full screen on tap. */
const PhoneCtx = React.createContext(false)
/** True inside a phone swipe carousel (visuals stay inside their card). */
const CarouselCtx = React.createContext(false)
/** Side gutter on phones. */
export const PG = 24
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

function useWidth(ref: React.RefObject<HTMLElement | null>) {
    const [w, setW] = useState(0)
    useEffect(() => {
        const el = ref.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => setW(el.clientWidth))
        ro.observe(el)
        setW(el.clientWidth)
        return () => ro.disconnect()
    }, [ref])
    return w
}

function useReducedMotion() {
    const [r, setR] = useState(false)
    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
        const update = () => setR(mq.matches)
        update()
        mq.addEventListener?.("change", update)
        return () => mq.removeEventListener?.("change", update)
    }, [])
    return r
}

/** Image slot helper: a dropped-in image wins, otherwise the stored default. */
export const pickImage = (v: ImageValue, fallback: ImageValue): ImageValue => (v && v.src ? v : fallback)

// ---------- Primitives ----------
/** Full-screen viewer for a visual on phones. Fit to screen first; tap twice (or the button) to zoom in and pan. */
function Lightbox({ src, srcSet, video, alt, onClose }: { src: string; srcSet?: string; video?: boolean; alt: string; onClose: () => void }) {
    const [zoom, setZoom] = useState(false)
    const box = useRef<HTMLDivElement>(null)
    const tapAt = useRef({ t: 0, fx: 0.5, fy: 0.5 })
    useEffect(() => {
        const prev = document.body.style.overflow
        document.body.style.overflow = "hidden"
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
        window.addEventListener("keydown", onKey)
        return () => {
            document.body.style.overflow = prev
            window.removeEventListener("keydown", onKey)
        }
    }, [onClose])
    useEffect(() => {
        const el = box.current
        if (!el || !zoom) return
        const { fx, fy } = tapAt.current
        el.scrollLeft = fx * el.scrollWidth - el.clientWidth / 2
        el.scrollTop = fy * el.scrollHeight - el.clientHeight / 2
    }, [zoom])
    const onTap = (e: React.MouseEvent<HTMLElement>) => {
        const now = Date.now()
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
        const fx = (e.clientX - r.left) / r.width
        const fy = (e.clientY - r.top) / r.height
        if (now - tapAt.current.t < 320) {
            tapAt.current = { t: 0, fx, fy }
            setZoom((z) => !z)
        } else tapAt.current = { t: now, fx, fy }
    }
    const media: React.CSSProperties = zoom ? { width: "260%", maxWidth: "none", height: "auto", display: "block", flex: "none" } : { maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto", display: "block", objectFit: "contain" }
    const btn: React.CSSProperties = { all: "unset", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#fff", padding: "10px 14px", minHeight: 24, borderRadius: 999, background: "rgba(255,255,255,0.14)" }
    if (typeof document === "undefined") return null
    return createPortal(
        <div role="dialog" aria-modal="true" aria-label={alt} style={{ position: "fixed", inset: 0, zIndex: 2147483000, background: "#0E0B0C", display: "flex", flexDirection: "column", fontFamily: BODY_FONT }}>
            <div style={{ flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 12px 10px 18px" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{video ? "Rotate for a bigger view" : zoom ? "Drag to look around" : "Tap twice to zoom, or rotate"}</span>
                <div style={{ display: "flex", gap: 8 }}>
                    {!video && (
                        <button type="button" onClick={() => setZoom((z) => !z)} style={btn}>
                            {zoom ? "Fit" : "Zoom"}
                        </button>
                    )}
                    <button type="button" onClick={onClose} aria-label="Close" style={btn}>
                        Close ✕
                    </button>
                </div>
            </div>
            <div ref={box} style={{ flex: 1, minHeight: 0, overflow: zoom ? "auto" : "hidden", display: "flex", alignItems: zoom ? "flex-start" : "center", justifyContent: zoom ? "flex-start" : "center", padding: zoom ? 0 : "0 8px 24px", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
                {video ? <video src={src} autoPlay muted loop playsInline controls style={media} /> : <img src={src} srcSet={zoom ? undefined : srcSet} alt={alt} onClick={onTap} style={media} />}
            </div>
        </div>,
        document.body
    )
}

export function Visual({ image, file, label, caption, style, fit = "contain", noBleed, priority }: { image?: ImageValue; file?: string; label: string; caption?: string; style?: React.CSSProperties; fit?: "contain" | "cover"; noBleed?: boolean; priority?: boolean }) {
    const phone = React.useContext(PhoneCtx)
    // A file or image that fails to load falls back to the labelled placeholder, never a broken-image icon.
    const [failed, setFailed] = useState(false)
    const src = image?.src
    useEffect(() => setFailed(false), [src, file])
    const inCarousel = React.useContext(CarouselCtx)
    const fig = useRef<HTMLElement>(null)
    const [bleed, setBleed] = useState(false)
    const [open, setOpen] = useState(false)
    const fill: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: fit }
    const has = !failed && (!!file || !!(image && image.src))
    const isVideo = !!file && /\.(mp4|webm|mov)(\?|#|$)/i.test(file)
    // On phones, a visual that takes the full text width runs edge to edge (side-by-side pairs and visuals inside cards don't).
    useIsoLayoutEffect(() => {
        if (!phone || inCarousel || noBleed) return setBleed(false)
        const check = () => {
            const el = fig.current
            const inner = el?.closest("[data-cs-inner]") as HTMLElement | null
            if (!el || !inner) return
            const content = inner.clientWidth - PG * 2
            const w = el.offsetWidth
            setBleed(Math.abs(w - content) < 3 || Math.abs(w - content - PG * 2) < 3)
        }
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [phone, inCarousel, noBleed])
    let media: React.ReactNode
    const imgProps = { loading: priority ? ("eager" as const) : ("lazy" as const), decoding: "async" as const, fetchPriority: priority ? ("high" as const) : undefined, onError: () => setFailed(true) }
    if (has && file) {
        media = isVideo ? <video src={file} autoPlay muted loop playsInline onError={() => setFailed(true)} style={fill} /> : <img src={file} alt={caption || label} style={fill} {...imgProps} />
    } else if (has && image && image.src) {
        media = <img src={image.src} srcSet={image.srcSet} sizes={phone ? "100vw" : "(max-width: 1440px) 60vw, 900px"} width={image.width} height={image.height} alt={image.alt || caption || label} style={fill} {...imgProps} />
    } else {
        media = (
            <>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden="true">
                    <line x1="0" y1="0" x2="100" y2="100" style={{ stroke: C.sage }} strokeWidth={1} vectorEffect="non-scaling-stroke" />
                    <line x1="100" y1="0" x2="0" y2="100" style={{ stroke: C.sage }} strokeWidth={1} vectorEffect="non-scaling-stroke" />
                </svg>
                <span style={{ position: "absolute", left: 12, top: 10, fontSize: 12, color: C.muted, background: C.paper, padding: "2px 6px", borderRadius: 4 }}>{label}</span>
            </>
        )
    }
    const zoomable = phone && has
    const alt = (image && image.alt) || caption || label
    return (
        <figure ref={fig as React.RefObject<HTMLElement>} style={{ margin: 0, display: "flex", flexDirection: "column", gap: 8, minHeight: 0, ...style, ...(bleed ? { marginLeft: -PG, marginRight: -PG } : {}) }}>
            <div
                role={zoomable ? "button" : has ? undefined : "img"}
                tabIndex={zoomable ? 0 : undefined}
                aria-label={zoomable ? `Open full screen: ${alt}` : has ? undefined : `Placeholder: ${label}`}
                onClick={zoomable ? () => setOpen(true) : undefined}
                onKeyDown={zoomable ? (e) => (e.key === "Enter" || e.key === " ") && setOpen(true) : undefined}
                style={{ position: "relative", flex: 1, minHeight: 120, borderRadius: bleed ? 0 : 14, overflow: "hidden", background: C.soft, cursor: zoomable ? "zoom-in" : undefined }}
            >
                {media}
                {zoomable && (
                    <span aria-hidden="true" style={{ position: "absolute", right: 10, bottom: 10, width: 32, height: 32, borderRadius: 999, background: "rgba(20,16,18,0.62)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8.5 1.5h4v4M5.5 12.5h-4v-4M12.5 1.5 8 6M1.5 12.5 6 8" />
                        </svg>
                    </span>
                )}
            </div>
            {caption && <figcaption style={{ fontSize: 13, color: C.muted, lineHeight: 1.4, padding: bleed ? `0 ${PG}px` : 0 }}>{caption}</figcaption>}
            {open && <Lightbox src={file || image!.src!} srcSet={file ? undefined : image?.srcSet} video={isVideo} alt={alt} onClose={() => setOpen(false)} />}
        </figure>
    )
}

/** Visual sizing: fills its cell when staged, fixed ratio when linear. */
export const vis = (m: Mode, ratio = "16 / 10"): React.CSSProperties => (m.linear ? { aspectRatio: ratio } : { flex: 1 })
/** Full-height visual inside a panel when staged. */
export const full = (m: Mode, ratio = "16 / 10"): React.CSSProperties => (m.linear ? { aspectRatio: ratio } : { height: "100%" })

export function Eyebrow({ children }: { children: React.ReactNode }) {
    // A leading section number ("02 · ...") is set in the accent colour.
    if (typeof children === "string") {
        const mm = children.match(/^(\d{2})(.*)$/)
        if (mm)
            return (
                <div style={{ fontSize: 13, letterSpacing: "0.02em", color: C.muted, marginBottom: 14, fontVariantNumeric: "tabular-nums" }}>
                    <span style={{ color: C.accentText, fontWeight: 600 }}>{mm[1]}</span>
                    {mm[2]}
                </div>
            )
    }
    return <div style={{ fontSize: 13, letterSpacing: "0.02em", color: C.muted, marginBottom: 14, fontVariantNumeric: "tabular-nums" }}>{children}</div>
}
/** Highlighter behind a key number or phrase. */
export function Mark({ children }: { children: React.ReactNode }) {
    return <span style={{ background: `linear-gradient(transparent 58%, ${C.highlight} 58%, ${C.highlight} 92%, transparent 92%)`, padding: "0 0.06em", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>{children}</span>
}
/** Large result number with the highlighter. */
export function Big({ m, children }: { m: Mode; children: React.ReactNode }) {
    const h = useH()
    return (
        <div style={{ fontWeight: 700, ...h, fontSize: m.narrow ? 52 : 84, letterSpacing: "0", color: C.ink, lineHeight: 1, marginBottom: 18 }}>
            <Mark>{children}</Mark>
        </div>
    )
}
export function H2({ children, m }: { children: React.ReactNode; m: Mode }) {
    const h = useH()
    return <h2 style={{ fontWeight: 700, ...h, fontSize: m.narrow ? 34 : 44, lineHeight: m.narrow ? 1.12 : 1.1, letterSpacing: "0.003em", color: C.ink, margin: m.narrow ? "0 0 22px" : "0 0 20px" }}>{children}</h2>
}
export function H3({ children }: { children: React.ReactNode }) {
    const h = useH()
    return <h3 style={{ fontWeight: 700, ...h, fontSize: 24, lineHeight: 1.2, letterSpacing: "0.005em", color: C.ink, margin: "0 0 12px" }}>{children}</h3>
}
export function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    const phone = React.useContext(PhoneCtx)
    return <p style={{ fontSize: 17, lineHeight: phone ? 1.68 : 1.6, color: C.body, margin: phone ? "0 0 20px" : "0 0 14px", maxWidth: "60ch", ...style }}>{children}</p>
}
export const B = ({ children }: { children: React.ReactNode }) => <strong style={{ color: C.ink, fontWeight: 600 }}>{children}</strong>

export function Note({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
    const phone = React.useContext(PhoneCtx)
    return <div style={{ fontSize: phone ? 15.5 : 14.5, lineHeight: phone ? 1.6 : 1.55, color: C.ink, background: C.note, borderRadius: 12, padding: "14px 16px", maxWidth: 640, ...style }}>{children}</div>
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
    const phone = React.useContext(PhoneCtx)
    return (
        <ul style={{ margin: phone ? "0 0 20px" : "0 0 14px", padding: 0, listStyle: "none", color: C.body, fontSize: 17, lineHeight: phone ? 1.65 : 1.6, maxWidth: "60ch" }}>
            {items.map((it, i) => (
                <li key={i} style={{ position: "relative", paddingLeft: 20, marginBottom: phone ? 14 : 8 }}>
                    <span aria-hidden="true" style={{ position: "absolute", left: 2, top: "0.68em", width: 6, height: 6, borderRadius: "50%", background: C.accent }} />
                    {it}
                </li>
            ))}
        </ul>
    )
}

export function Flow({ items, highlight = [] }: { items: string[]; highlight?: number[] }) {
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", margin: "4px 0 18px", fontSize: 14, color: C.ink }}>
            {items.map((r, i) => (
                <React.Fragment key={r}>
                    {i > 0 && <span style={{ color: C.muted }}>→</span>}
                    <span style={{ border: `1px solid ${highlight.includes(i) ? C.highlight : C.sage}`, background: highlight.includes(i) ? C.highlight : "transparent", fontWeight: highlight.includes(i) ? 600 : 400, borderRadius: 999, padding: "5px 12px" }}>{r}</span>
                </React.Fragment>
            ))}
        </div>
    )
}

export function Stats({ m, items }: { m: Mode; items: [string, string][] }) {
    const h = useH()
    return (
        <div style={{ display: "grid", gridTemplateColumns: m.narrow ? "minmax(0,1fr)" : `repeat(${items.length}, minmax(0,1fr))`, gap: 12, maxWidth: 760 }}>
            {items.map(([n, l]) => (
                <div key={n} style={{ background: C.paper, borderRadius: 14, padding: "20px 18px 22px" }}>
                    <div style={{ fontWeight: 700, ...h, fontSize: 32, letterSpacing: "0", color: C.ink, marginBottom: 8, lineHeight: 1.1 }}>
                        <Mark>{n}</Mark>
                    </div>
                    <div style={{ fontSize: m.narrow ? 15 : 14, lineHeight: 1.5, color: C.body }}>{l}</div>
                </div>
            ))}
        </div>
    )
}

export function Cards({ m, items, cols }: { m: Mode; items: [React.ReactNode, React.ReactNode][]; cols?: number }) {
    const n = cols || items.length
    return (
        <div style={{ display: "grid", gridTemplateColumns: m.narrow ? "minmax(0,1fr)" : `repeat(${n}, minmax(0,1fr))`, gap: m.narrow ? 14 : 12, maxWidth: 760, marginBottom: m.narrow ? 24 : 18 }}>
            {items.map(([t, d], i) => (
                <div key={i} style={{ background: C.paper, borderRadius: 14, padding: m.narrow ? "18px 18px 20px" : "16px 18px" }}>
                    <div style={{ fontSize: m.narrow ? 16 : 15, fontWeight: 600, color: C.ink, marginBottom: 8 }}>{t}</div>
                    <div style={{ fontSize: m.narrow ? 15 : 14, lineHeight: 1.6, color: C.body }}>{d}</div>
                </div>
            ))}
        </div>
    )
}

/** Simple bordered table. First row is the header. */
export function Table({ rows, widths, maxWidth = 760, small }: { rows: React.ReactNode[][]; widths?: string; maxWidth?: number; small?: boolean }) {
    const cols = widths || `repeat(${rows[0].length}, minmax(0,1fr))`
    return (
        <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden", maxWidth, marginBottom: 18, background: C.paper }}>
            {rows.map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: cols, borderTop: i > 0 ? `1px solid ${C.line}` : undefined, background: i === 0 ? C.soft : undefined }}>
                    {r.map((c, j) => (
                        <div key={j} style={{ padding: small ? "8px 12px" : "10px 14px", fontSize: small ? 13 : 14, lineHeight: 1.45, color: i === 0 ? C.ink : C.body, fontWeight: i === 0 ? 600 : 400, borderLeft: j > 0 ? `1px solid ${C.line}` : undefined }}>
                            {c}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

export function Split({ m, left, right, cols = "minmax(0,0.9fr) minmax(0,1.1fr)" }: { m: Mode; left: React.ReactNode; right: React.ReactNode; cols?: string }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: m.narrow ? "minmax(0,1fr)" : cols, gap: m.narrow ? 20 : 40, height: m.linear ? "auto" : "100%", alignItems: m.linear ? "start" : "stretch" }}>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: m.linear ? "flex-start" : "center", minHeight: 0 }}>{left}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, minHeight: 0 }}>{right}</div>
        </div>
    )
}

/** A centred text-only column for a panel or short section. */
export function Column({ m, children, maxWidth = 720 }: { m: Mode; children: React.ReactNode; maxWidth?: number }) {
    return <div style={{ display: "flex", flexDirection: "column", justifyContent: m.linear ? "flex-start" : "center", height: m.linear ? "auto" : "100%", maxWidth }}>{children}</div>
}

// ---------- Section templates ----------
/** Joins the last two words with a non-breaking space so a line never ends on a single orphan word. */
const noOrphan = (t: string) => t.replace(/\s+(\S+)\s*$/, " $1")
/** Width of the hero visual on desktop (it keeps a 16:10 image). */
const VIS_W = "min(480px, 40%)"

/** The case study in four cells (problem, decision, final design, result), read before anything else. */
export function Brief({ m, items }: { m: Mode; items: [string, string][] }) {
    return (
        <section aria-label="In short" style={{ marginTop: m.narrow ? 28 : 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, whiteSpace: "nowrap" }}>In short</span>
                <span aria-hidden="true" style={{ flex: 1, height: 1, background: C.line }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: m.narrow ? "minmax(0,1fr)" : "repeat(4, minmax(0,1fr))", gap: m.narrow ? 12 : 16 }}>
                {items.map(([k, v], i) => {
                    // The result cell is the highlighted one; the rest match the fact file above.
                    const last = i === items.length - 1
                    return (
                        <div key={k} style={{ background: last ? C.chip : C.paper, color: last ? C.onChip : C.ink, border: `1px solid ${last ? C.chip : C.line}`, borderRadius: 14, padding: m.narrow ? "16px 18px" : "18px 20px" }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: "0.02em", marginBottom: 8, display: "flex", alignItems: "baseline", gap: 8 }}>
                                <span style={{ fontFamily: HEADING_FONT, fontWeight: 400, fontSize: 15, color: C.accent2 }}>{String(i + 1).padStart(2, "0")}</span>
                                {k}
                            </div>
                            <div style={{ fontSize: 15, lineHeight: 1.5 }}>{v}</div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export function Hero({ m, eyebrow, tags, title, subtitle, cells, brief, image, file, label, caption }: { m: Mode; eyebrow?: string; tags?: string[]; title: string; subtitle: string; cells: [string, string][]; brief?: [string, string][]; image?: ImageValue; file?: string; label: string; caption?: string }) {
    const d = useDisplay()
    // The title area sits on a full-bleed colour block; the hero visual hangs over its bottom edge.
    // The fact file (role, timeline, team, platform) spans the full width below, clear of the visual.
    const hang = m.narrow ? 56 : 140
    const bleed = m.narrow ? `0 -${PG}px` : `0 -${RP}px 0 0`
    const chips = tags && tags.length ? tags : eyebrow ? [eyebrow] : []
    return (
        <header style={{ paddingBottom: m.narrow ? 48 : "8vh" }}>
            <div style={{ position: "relative", background: C.block, color: C.onBlock, margin: bleed, padding: m.narrow ? `56px ${PG}px 0` : `13vh ${RP}px 0 56px` }}>
                {/* Title sets the width: it stays on one line, and the subtitle wraps to the title's width. */}
                <div style={{ width: m.narrow ? "100%" : "max-content", maxWidth: "100%", paddingBottom: m.narrow ? 0 : `max(8vh, calc(${VIS_W} * 0.625 - ${hang - 56}px))` }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
                        {chips.map((t) => (
                            <span key={t} style={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.02em", background: C.chip, color: C.onChip, borderRadius: 999, padding: "5px 12px", whiteSpace: "nowrap" }}>
                                {t}
                            </span>
                        ))}
                    </div>
                    <h1 style={{ ...d, fontSize: m.narrow ? 48 : "clamp(52px, 5.6vw, 80px)", lineHeight: 1.02, letterSpacing: "0", color: C.onBlock, margin: "0 0 22px", whiteSpace: m.narrow ? "normal" : "nowrap" }}>{title}</h1>
                    <P style={{ fontSize: 20, lineHeight: 1.5, color: C.onBlockMuted, margin: 0, maxWidth: "none", ...(m.narrow ? {} : { width: 0, minWidth: "100%" }), textWrap: "pretty" } as React.CSSProperties}>
                        {noOrphan(subtitle)}
                    </P>
                </div>
                {/* The visual is pinned to the block's bottom-right corner and hangs over its edge, whatever the title length. */}
                <Visual
                    image={image}
                    file={file}
                    label={label}
                    caption={caption}
                    priority
                    noBleed
                    style={
                        m.narrow
                            ? { aspectRatio: "16 / 10", marginTop: 28, marginBottom: -hang, position: "relative", zIndex: 1 }
                            : { position: "absolute", right: RP, bottom: -(hang + (caption ? 26 : 0)), width: VIS_W, aspectRatio: caption ? "16 / 11.3" : "16 / 10", zIndex: 1 }
                    }
                />
            </div>
            <div style={{ marginTop: hang + (caption ? 28 : 0) + (m.narrow ? 24 : 36), paddingLeft: m.narrow ? 0 : 56 }}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: m.narrow ? "minmax(0,1fr)" : `repeat(${cells.length}, minmax(0,1fr))`,
                        background: C.paper,
                        border: `1px solid ${C.line}`,
                        borderRadius: 14,
                    }}
                >
                    {cells.map(([k, v], i) => (
                        <div key={k} style={{ padding: "16px 18px", borderLeft: !m.narrow && i > 0 ? `1px solid ${C.line}` : undefined, borderTop: m.narrow && i > 0 ? `1px solid ${C.line}` : undefined }}>
                            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{k}</div>
                            <div style={{ fontSize: 14.5, lineHeight: 1.45, color: C.ink }}>{v}</div>
                        </div>
                    ))}
                </div>
                {brief && <Brief m={m} items={brief} />}
            </div>
        </header>
    )
}

export function Rail({ m, items }: { m: Mode; items: [string, React.ReactNode][] }) {
    return (
        <div style={{ position: "relative", padding: m.narrow ? "72px 0 64px 32px" : "10vh 0 14vh 32px" }}>
            <div aria-hidden="true" style={{ position: "absolute", left: 5, top: m.narrow ? 82 : "calc(10vh + 10px)", bottom: m.narrow ? 74 : "calc(14vh + 10px)", width: 1, background: C.sage }} />
            {items.map(([label, node], i) => (
                <div key={label} style={{ position: "relative", paddingBottom: i === items.length - 1 ? 0 : 64 }}>
                    <span aria-hidden="true" style={{ position: "absolute", left: -32, top: 6, width: 11, height: 11, borderRadius: "50%", background: C.bg, border: `2px solid ${C.accent2}`, boxSizing: "border-box" }} />
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>{label}</div>
                    {node}
                </div>
            ))}
        </div>
    )
}

/** Points that open one at a time while the section holds still. */
export function StepList({ m, eyebrow, title, intro, points, outro, aside, asideCols }: { m: Mode; eyebrow: string; title: string; intro?: React.ReactNode; points: { t: string; b: React.ReactNode }[]; outro?: React.ReactNode; aside?: React.ReactNode; asideCols?: string }) {
    const steps = React.useContext(StepCtx)
    const idx = React.useContext(SceneIdx)
    const active = steps[idx] ?? 0
    const list = (
        <div style={{ maxWidth: 720 }}>
            <Eyebrow>{eyebrow}</Eyebrow>
            <H2 m={m}>{title}</H2>
            {intro}
            <div style={{ marginTop: 14, borderBottom: `1px solid ${C.sage}` }}>
                {points.map((pt, i) => {
                    const open = m.linear || i === active
                    const seen = m.linear || i <= active
                    return (
                        <div key={pt.t} style={{ borderTop: `1px solid ${C.sage}`, padding: m.narrow ? "18px 0" : "13px 0" }}>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                                <span style={{ fontSize: 13, fontWeight: 600, color: open ? C.accent2Text : seen ? C.ink : C.muted, fontVariantNumeric: "tabular-nums", transition: "color .5s" }}>{String(i + 1).padStart(2, "0")}</span>
                                <span style={{ fontSize: 18, fontWeight: 600, color: seen ? C.ink : C.muted, transition: "color .5s" }}>{pt.t}</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0, transition: m.linear ? undefined : "grid-template-rows .7s cubic-bezier(.22,.61,.36,1), opacity .6s ease" }}>
                                <div style={{ overflow: "hidden" }}>
                                    <div style={{ margin: m.narrow ? "10px 0 2px" : "8px 0 2px 31px", fontSize: m.narrow ? 16.5 : 16, lineHeight: m.narrow ? 1.65 : 1.6, color: C.body, maxWidth: "60ch" }}>{pt.b}</div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            {outro && <div style={{ marginTop: 20 }}>{outro}</div>}
        </div>
    )
    const body = aside ? <Split m={m} left={list} right={aside} cols={asideCols || "minmax(0,1fr) minmax(0,1fr)"} /> : list
    return <div style={{ height: m.linear ? "auto" : "100%", display: "flex", alignItems: "center", padding: m.linear ? (m.narrow ? "72px 0 56px" : "64px 0") : "6vh 0", boxSizing: "border-box" }}>{aside ? <div style={{ width: "100%", height: m.linear ? "auto" : "100%" }}>{body}</div> : body}</div>
}

/** A short text section: the next section waits underneath it. */
export function Short({ m, eyebrow, title, children }: { m: Mode; eyebrow?: string; title: string; children: React.ReactNode }) {
    return (
        <div style={{ padding: m.linear ? (m.narrow ? "72px 0 56px" : "64px 0") : "16vh 0 8vh", maxWidth: 760 }}>
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            <H2 m={m}>{title}</H2>
            {children}
        </div>
    )
}

/** A section that fills exactly one screen. */
export function Fit({ m, children }: { m: Mode; children: React.ReactNode }) {
    return <div style={{ height: m.linear ? "auto" : "100%", padding: m.linear ? (m.narrow ? "72px 0 56px" : "64px 0") : "11vh 0", boxSizing: "border-box" }}>{children}</div>
}

/** The home page lives at "/". Older links pointed at "/home-page", so those are rewritten (keeping any #section). */
export const homePath = (h: string | undefined, fallback = "/") => {
    if (!h) return fallback
    return h.replace(/^\/home-page\/?(?=#|$)/, "/")
}

export function Footer({ m, nextLabel, nextHref, backHref }: { m: Mode; nextLabel: string; nextHref?: string; backHref?: string }) {
    const h = useH()
    return (
        <div style={{ marginTop: 48, paddingTop: 28, borderTop: `1px solid ${C.sage}`, display: "flex", flexDirection: m.narrow ? "column" : "row", gap: m.narrow ? 16 : 32, alignItems: m.narrow ? "flex-start" : "baseline", justifyContent: "space-between", maxWidth: 760 }}>
            <a href={nextHref || "#"} style={{ fontWeight: 700, ...h, fontSize: 24, letterSpacing: "0.005em", color: C.ink, textDecoration: "none", borderBottom: `3px solid ${C.accent}`, paddingBottom: 3 }}>
                Next: {nextLabel} →
            </a>
            <div style={{ fontSize: 14, color: C.muted }}>
                <a href={homePath(backHref)} style={{ color: C.muted, textDecoration: "none" }}>
                    ← Back to portfolio
                </a>
                <span> · </span>
                <a href={`mailto:${EMAIL}`} style={{ color: C.muted }}>
                    {EMAIL}
                </a>
            </div>
        </div>
    )
}

// ---------- Linear page (reduced motion / canvas) ----------
function LinearPage({ scenes, m }: { scenes: Scene[]; m: Mode }) {
    return (
        <div data-cs-inner="" style={{ padding: m.narrow ? `0 ${PG}px` : `0 ${RP}px 0 30%` }}>
            {scenes.map((s, i) =>
                s.kind === "h" ? (
                    <div key={i} style={{ padding: "64px 0", display: "flex", flexDirection: "column", gap: 64 }}>
                        {s.panels.map((pn, j) => (
                            <div key={j}>{pn.render(m)}</div>
                        ))}
                    </div>
                ) : (
                    <div key={i}>{s.node(m)}</div>
                )
            )}
        </div>
    )
}

/** Phone version of a sideways section: native swipeable cards with the next one peeking in, plus a counter. */
function HCarousel({ panels, m }: { panels: Panel[]; m: Mode }) {
    const ref = useRef<HTMLDivElement>(null)
    const [idx, setIdx] = useState(0)
    const onScroll = () => {
        const el = ref.current
        if (!el) return
        const kids = Array.from(el.children) as HTMLElement[]
        const x = el.scrollLeft
        let best = 0
        kids.forEach((k, i) => {
            if (Math.abs(k.offsetLeft - el.offsetLeft - x - PG) < Math.abs(kids[best].offsetLeft - el.offsetLeft - x - PG)) best = i
        })
        if (best >= panels.length) best = panels.length - 1
        if (best !== idx) setIdx(best)
    }
    return (
        <div style={{ padding: "48px 0 40px" }}>
            <div
                ref={ref}
                onScroll={onScroll}
                className="cs-carousel"
                style={{ display: "flex", alignItems: "flex-start", gap: 16, overflowX: "auto", overflowY: "hidden", scrollSnapType: "x mandatory", scrollPaddingLeft: PG, margin: `0 -${PG}px`, padding: `0 ${PG}px 4px`, WebkitOverflowScrolling: "touch", overscrollBehaviorX: "contain", scrollbarWidth: "none" } as React.CSSProperties}
            >
                <CarouselCtx.Provider value={true}>
                    {panels.map((pn, j) => (
                        <div key={j} style={{ flex: "0 0 88%", scrollSnapAlign: "start", minWidth: 0 }}>
                            {pn.render(m)}
                        </div>
                    ))}
                </CarouselCtx.Provider>
                <div aria-hidden="true" style={{ flex: "0 0 4px" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
                <div style={{ display: "flex", gap: 6 }}>
                    {panels.map((_, j) => (
                        <span key={j} style={{ width: j === idx ? 18 : 6, height: 6, borderRadius: 3, background: j === idx ? C.accent : C.sage, transition: "width .3s, background .3s" }} />
                    ))}
                </div>
                <span style={{ fontSize: 12.5, color: C.muted, fontVariantNumeric: "tabular-nums" }}>
                    {idx + 1} / {panels.length}
                    {idx === 0 ? " · swipe →" : ""}
                </span>
            </div>
        </div>
    )
}

// ---------- Stage: sections are stacked layers; the next one rises over the current ----------
type Seg = { S: number; E: number; enter: number; peek: number; hold: number; over: number }

function Stage({ title, nav, scenes, smoothness, phone, homeHref }: { title: string; nav: string[]; scenes: Scene[]; smoothness: number; phone: boolean; homeHref: string }) {
    const [steps, setSteps] = useState<number[]>([])
    const inited = useRef(false)
    // On phones every section lays out at its natural height (points open, sideways sections as swipe cards);
    // the rising-layer motion stays the same.
    const m: Mode = phone ? { linear: true, narrow: true } : { linear: false, narrow: false }
    const side = phone ? PG : RP
    const trackRef = useRef<HTMLDivElement>(null)
    const winRef = useRef<HTMLDivElement>(null)
    const layerEls = useRef<(HTMLDivElement | null)[]>([])
    const innerEls = useRef<(HTMLDivElement | null)[]>([])
    const hTracks = useRef<(HTMLDivElement | null)[]>([])
    const hVps = useRef<(HTMLDivElement | null)[]>([])
    const hBars = useRef<(HTMLDivElement | null)[]>([])
    const progRef = useRef<HTMLDivElement>(null)
    const segs = useRef<{ wh: number; total: number; list: Seg[]; dists: number[] }>({ wh: 800, total: 0, list: [], dists: [] })
    const motion = useRef({ cur: 0, target: 0, raf: 0, last: 0 })
    const lastSteps = useRef("")
    const lastNav = useRef(-1)
    const [trackH, setTrackH] = useState(0)
    const [win, setWin] = useState(800)
    const [navActive, setNavActive] = useState(0)
    const [touch, setTouch] = useState(false)
    const winW = useWidth(winRef)
    const fonts = useFonts()
    useEffect(() => {
        if (typeof window !== "undefined" && window.matchMedia) setTouch(window.matchMedia("(pointer: coarse)").matches)
    }, [])
    // Touch screens already have momentum; easing on top of it feels like lag, so follow the finger 1:1.
    const ease = touch ? 1 : clamp(smoothness, 0.02, 0.4)
    const natural = (s: Scene) => phone || (s.kind === "flow" && !s.fit)

    const apply = React.useCallback(
        (v: number) => {
            const { wh, list, dists, total } = segs.current
            if (!list.length) return
            const stepNow: number[] = []
            let navNow = 0
            list.forEach((g, j) => {
                const layer = layerEls.current[j]
                const inner = innerEls.current[j]
                if (!layer) return
                let y = 0
                let op = 1
                if (j > 0) {
                    const prev = list[j - 1]
                    if (v >= g.E) {
                        y = 0
                    } else if (v >= g.S) {
                        const t = (v - g.S) / g.enter
                        y = g.peek * (1 - t)
                        op = 0.3 + 0.7 * Math.min(1, t * 2)
                    } else if (v >= prev.E) {
                        y = g.peek
                        op = 0.3
                    } else if (v >= prev.S) {
                        const t = (v - prev.S) / Math.max(1, prev.enter)
                        y = wh + (g.peek - wh) * t
                        op = 0.3
                    } else {
                        y = wh
                        op = 0
                    }
                    if (y >= wh - 0.5) op = 0
                    // Phones: the rising section is solid, so text underneath never shows through it.
                    else if (phone) op = 1
                }
                const next = list[j + 1]
                let sc = 1
                let dim = 1
                if (next && v > next.S) {
                    const tc = clamp((v - next.S) / next.enter, 0, 1)
                    sc = 1 - 0.035 * tc
                    dim = 1 - 0.55 * tc
                }
                layer.style.transform = `translate3d(0,${y}px,0) scale(${sc})`
                layer.style.opacity = String(op)
                layer.style.visibility = next && v >= next.E + 2 ? "hidden" : "visible"
                layer.style.boxShadow = y > 0.5 && y < wh - 0.5 ? "0 -18px 40px rgba(0,0,0,0.07)" : "none"
                if (inner) inner.style.opacity = String(dim)

                const t = g.hold > 0 ? clamp((v - g.E) / g.hold, 0, 1) : 0
                const s = scenes[j]
                if (!phone && s.kind === "h") {
                    const tr = hTracks.current[j]
                    if (tr) tr.style.transform = `translate3d(${-t * dists[j]}px,0,0)`
                    const bar = hBars.current[j]
                    if (bar) bar.style.transform = `scaleX(${t})`
                } else if (!phone && s.kind === "steps") {
                    stepNow[j] = Math.min(s.count - 1, Math.floor(t * s.count))
                } else if (inner && g.over > 0) {
                    inner.style.transform = `translate3d(0,${-t * g.over}px,0)`
                }
                if (v >= g.S + g.enter * 0.5) navNow = s.nav
            })
            if (progRef.current) progRef.current.style.transform = `scaleX(${total > 0 ? clamp(v / total, 0, 1) : 0})`
            const key = stepNow.join(",")
            if (key !== lastSteps.current) {
                lastSteps.current = key
                setSteps(stepNow)
            }
            if (navNow !== lastNav.current) {
                lastNav.current = navNow
                setNavActive(navNow)
            }
        },
        [scenes, phone]
    )

    const measure = React.useCallback(() => {
        const w = winRef.current
        if (!w) return
        const wh = w.clientHeight
        const list: Seg[] = []
        const dists: number[] = []
        const heights: number[] = []
        scenes.forEach((s, i) => {
            const inner = innerEls.current[i]
            heights[i] = natural(s) ? (inner ? inner.scrollHeight : wh) : wh
            const tr = hTracks.current[i]
            const vp = hVps.current[i]
            dists[i] = !phone && tr && vp ? Math.max(0, tr.scrollWidth - vp.clientWidth) : 0
        })
        let cursor = 0
        scenes.forEach((s, j) => {
            const prevH = j > 0 ? heights[j - 1] : wh
            // Phones: every section rises from the bottom edge (no half-height peek, so no faded text sitting under the next section).
            const peek = j === 0 ? 0 : !phone && prevH < wh * 0.8 ? clamp(prevH + 24, wh * 0.5, wh) : wh
            const enter = j === 0 ? 0 : Math.max(peek, 240)
            const over = natural(s) ? Math.max(0, heights[j] - wh) : 0
            const hold = phone ? over : s.kind === "steps" ? wh * 0.55 * s.count : s.kind === "h" ? dists[j] : over
            const S = cursor
            const E = S + enter
            cursor = E + hold
            list.push({ S, E, enter, peek, hold, over })
        })
        segs.current = { wh, total: cursor, list, dists }
        setTrackH(wh + cursor)
        setWin(wh)
        apply(motion.current.cur)
    }, [scenes, apply, phone])

    useIsoLayoutEffect(() => {
        measure()
        if (typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => measure())
        if (winRef.current) ro.observe(winRef.current)
        innerEls.current.forEach((t) => t && ro.observe(t))
        hTracks.current.forEach((t) => t && ro.observe(t))
        return () => ro.disconnect()
    }, [measure, winW])

    useEffect(() => {
        const M = motion.current
        const tick = (t: number) => {
            const dt = M.last ? Math.min(64, t - M.last) : 16.7
            M.last = t
            const k = 1 - Math.pow(1 - ease, dt / 16.7)
            M.cur += (M.target - M.cur) * k
            if (Math.abs(M.target - M.cur) < 0.1) M.cur = M.target
            apply(M.cur)
            if (M.cur !== M.target) M.raf = requestAnimationFrame(tick)
            else {
                M.raf = 0
                M.last = 0
            }
        }
        const onScroll = () => {
            const tr = trackRef.current
            if (!tr) return
            M.target = clamp(-tr.getBoundingClientRect().top, 0, segs.current.total)
            if (!M.raf) M.raf = requestAnimationFrame(tick)
        }
        onScroll()
        if (!inited.current) {
            inited.current = true
            M.cur = M.target
        }
        apply(M.cur)
        document.addEventListener("scroll", onScroll, { passive: true, capture: true })
        window.addEventListener("resize", onScroll)
        return () => {
            document.removeEventListener("scroll", onScroll, true)
            window.removeEventListener("resize", onScroll)
            if (M.raf) cancelAnimationFrame(M.raf)
            M.raf = 0
        }
    }, [apply, ease])

    const jump = (navIndex: number) => {
        const j = scenes.findIndex((s) => s.nav === navIndex)
        const tr = trackRef.current
        const g = segs.current.list[j]
        if (j < 0 || !tr || !g) return
        window.scrollTo({ top: window.scrollY + tr.getBoundingClientRect().top + g.E + 1, behavior: "auto" })
    }

    const unit = Math.max(0, winW - RP)
    const pad = Math.max(56, win * 0.1)

    const navLink: React.CSSProperties = { color: C.ink, fontWeight: 600, textDecoration: "underline", textDecorationColor: C.accent, textDecorationThickness: 2, textUnderlineOffset: 4 }

    const sideNav = (
        <div style={{ position: "relative", display: "flex", alignItems: "center", paddingLeft: 40, zIndex: 50, background: C.bg }}>
            <div style={{ fontWeight: 700, ...fonts.heading, position: "absolute", top: 32, left: 40, fontSize: 17, letterSpacing: "0.01em", color: C.ink }}>{title}</div>
            {/* Home lands on this project's card on the home page (same as "Back to portfolio"); Contact opens an email. */}
            <div style={{ position: "absolute", top: 64, left: 40, display: "flex", alignItems: "center", gap: 18, ...fonts.body, fontSize: 13.5 }}>
                <a href={homeHref} style={navLink}>
                    ← Home
                </a>
                <a href={`mailto:${EMAIL}`} style={navLink}>
                    Contact
                </a>
            </div>
            <nav aria-label="Case study sections" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {nav.map((label, i) => {
                    const on = i === navActive
                    return (
                        <button
                            key={label}
                            onClick={() => jump(i)}
                            aria-current={on ? "true" : undefined}
                            style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: "6px 0", ...fonts.body, fontSize: 13.5, fontWeight: on ? 600 : 400, color: on ? C.ink : C.muted, transition: "color .4s" }}
                        >
                            <span style={{ width: on ? 24 : 12, height: on ? 2 : 1, background: on ? C.accent2 : C.sage, transition: "width .4s, background .4s" }} />
                            <span>{label}</span>
                        </button>
                    )
                })}
            </nav>
        </div>
    )

    // Phone: a slim bar with Home, the title and Contact, plus overall progress, in place of the side nav.
    const topBar = (
        <div style={{ position: "relative", zIndex: 50, background: C.bg, borderBottom: `1px solid ${C.line}`, height: 46, flex: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: `0 ${PG}px` }}>
            <a href={homeHref} style={{ ...navLink, ...fonts.body, fontSize: 13, whiteSpace: "nowrap", flex: "none" }}>
                ← Home
            </a>
            <span style={{ fontWeight: 700, ...fonts.heading, fontSize: 15, letterSpacing: "0.01em", color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", minWidth: 0, textAlign: "center" }}>{title}</span>
            <a href={`mailto:${EMAIL}`} style={{ ...navLink, ...fonts.body, fontSize: 13, whiteSpace: "nowrap", flex: "none" }}>
                Contact
            </a>
            <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, bottom: -1, height: 2 }}>
                <div ref={progRef} style={{ height: "100%", width: "100%", background: C.accent, transform: "scaleX(0)", transformOrigin: "left center" }} />
            </div>
        </div>
    )

    return (
        <StepCtx.Provider value={steps}>
            <style>{`.cs-stage{height:100vh;height:100svh}.cs-carousel::-webkit-scrollbar{display:none}`}</style>
            <div ref={trackRef} style={{ position: "relative", height: trackH || "100vh" }}>
                <div
                    className="cs-stage"
                    style={{ position: "sticky", top: 0, overflow: "hidden", background: C.bg, ...(phone ? { display: "flex", flexDirection: "column" } : { display: "grid", gridTemplateColumns: "minmax(200px, 30%) minmax(0,1fr)" }) }}
                >
                    {phone ? topBar : sideNav}

                    <div ref={winRef} style={{ position: "relative", height: phone ? undefined : "100%", flex: phone ? 1 : undefined, minHeight: 0, overflow: "hidden" }}>
                        {scenes.map((s, i) => {
                            const fullH = !natural(s)
                            return (
                                <div
                                    key={i}
                                    ref={(el) => {
                                        layerEls.current[i] = el
                                    }}
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: "100%",
                                        overflow: "hidden",
                                        background: C.bg,
                                        zIndex: i + 1,
                                        transformOrigin: "50% 0%",
                                        willChange: "transform, opacity",
                                        transform: i === 0 ? "none" : "translate3d(0,100%,0)",
                                    }}
                                >
                                    <div
                                        data-cs-inner=""
                                        ref={(el) => {
                                            innerEls.current[i] = el
                                        }}
                                        style={{ height: fullH ? "100%" : undefined, paddingRight: !phone && s.kind === "h" ? 0 : side, paddingLeft: phone ? side : 0, boxSizing: "border-box", willChange: "transform, opacity" }}
                                    >
                                        <SceneIdx.Provider value={i}>
                                            {s.kind === "h" && phone ? (
                                                <HCarousel panels={s.panels} m={m} />
                                            ) : s.kind === "h" ? (
                                                <div style={{ position: "relative", height: "100%", boxSizing: "border-box", padding: `${pad}px 0` }}>
                                                    <div
                                                        ref={(el) => {
                                                            hVps.current[i] = el
                                                        }}
                                                        style={{ width: "100%", height: "100%", overflow: "hidden" }}
                                                    >
                                                        <div
                                                            ref={(el) => {
                                                                hTracks.current[i] = el
                                                            }}
                                                            style={{ display: "flex", gap: 48, height: "100%", width: "max-content", paddingRight: RP, willChange: "transform" }}
                                                        >
                                                            {s.panels.map((pn, j) => (
                                                                <div key={j} style={{ width: unit * pn.w, flex: "none", height: "100%" }}>
                                                                    {pn.render(m)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div aria-hidden="true" style={{ position: "absolute", left: 0, right: RP, bottom: pad * 0.45, height: 2, background: C.line }}>
                                                        <div
                                                            ref={(el) => {
                                                                hBars.current[i] = el
                                                            }}
                                                            style={{ height: "100%", width: "100%", background: C.accent, transform: "scaleX(0)", transformOrigin: "left center" }}
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                s.node(m)
                                            )}
                                        </SceneIdx.Provider>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </StepCtx.Provider>
    )
}

/** The whole case-study page: picks the staged or the stacked layout. */
export function CaseStudyShell({ title, nav, scenes, smoothness = 0.05, stackBelow = 900, style, theme = "pinterest", headingFont, displayFont, bodyFont, homeHref, backLink }: { title: string; nav: string[]; scenes: Scene[]; style?: React.CSSProperties; homeHref?: string; backLink?: string } & KitProps) {
    // Where Home goes: an explicit homeHref, else the page's Back link, else this project's card on the home page ("/").
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").replace(/-suite$/, "")
    const home = homePath(homeHref || (backLink && backLink !== "/" ? backLink : ""), `/#${slug}`)
    const rootRef = useRef<HTMLDivElement>(null)
    const width = useWidth(rootRef)
    const reduced = useReducedMotion()
    const narrow = width > 0 && width < stackBelow
    // Reduced motion gets the plain stacked page; phones get the layered stage in its phone form.
    const linear = reduced
    const fonts = React.useMemo<Fonts>(() => {
        // An unset font (or the old editor's default, Inter) counts as "not picked", so the Fjalla One / Trivia Sans stacks win.
        const picked = (v: FontValue) => !!v?.fontFamily && !/^\W*Inter\b/i.test(v.fontFamily)
        const fam = (v: FontValue, fb: string) => (picked(v) ? `${v!.fontFamily}, ${fb}` : fb)
        // Fjalla One ships in one weight (Regular 400) and is already heavy, so headings use 400; asking for
        // bold would make the browser fake it. A different heading font picked in the panel gets 800 (H1) / 700.
        const dFam = fam(picked(displayFont) ? displayFont : headingFont, HEADING_FONT)
        const hFam = fam(headingFont, HEADING_FONT)
        const single = (f: string) => /^\W*Fjalla/i.test(f)
        return {
            display: { fontFamily: dFam, fontWeight: single(dFam) ? 400 : 800 },
            heading: { fontFamily: hFam, fontWeight: single(hFam) ? 400 : 700 },
            body: { fontFamily: fam(bodyFont, BODY_FONT) },
        }
    }, [displayFont?.fontFamily, headingFont?.fontFamily, bodyFont?.fontFamily])
    return (
        <FontCtx.Provider value={fonts}>
          <PhoneCtx.Provider value={narrow}>
            <div ref={rootRef} style={{ ...style, ...themeVars(theme as ThemeName), position: "relative", width: "100%", background: C.bg, color: C.ink, ...fonts.body, boxSizing: "border-box", WebkitFontSmoothing: "antialiased" }}>
                {linear ? <LinearPage scenes={scenes} m={{ linear: true, narrow }} /> : <Stage title={title} nav={nav} scenes={scenes} smoothness={smoothness} phone={narrow} homeHref={home} />}
            </div>
          </PhoneCtx.Provider>
        </FontCtx.Provider>
    )
}
