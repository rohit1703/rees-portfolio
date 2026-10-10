"use client"
// "Clue me in": an interactive crossword of keywords about Reethika, for the home page (just above the footer).
// Matches the screenshots she shared: numbered grid, Across / Down clues, "click a square to start", Reveal / Hide answers,
// "that's me!" when solved. Styled with the portfolio tokens (Paper, Cassis, Wasabi, Cool Blue, Fjalla One, Caveat).
// Card up to 750px wide, squares up to 33px.
import * as React from "react"
import { useEffect, useMemo, useRef, useState } from "react"

type Dir = "across" | "down"
type Word = { n: number; dir: Dir; r: number; c: number; answer: string; clue: string; len: string }

const WORDS: Word[] = [
    { n: 1, dir: "down", r: 0, c: 3, answer: "EMPATHETIC", clue: "Feels what the user feels", len: "10" },
    { n: 2, dir: "down", r: 0, c: 8, answer: "CURIOUS", clue: 'Always asking "but why?"', len: "7" },
    { n: 3, dir: "down", r: 2, c: 12, answer: "PERSISTENT", clue: "Doesn't stop at the first failed prototype", len: "10" },
    { n: 4, dir: "across", r: 3, c: 0, answer: "DETAILORIENTED", clue: "Notices the 1px misalignment", len: "6-8" },
    { n: 5, dir: "across", r: 6, c: 6, answer: "MESSY", clue: "Like the first wall of sticky notes", len: "5" },
]
const ROWS = 12
const COLS = 14

const C = {
    ink: "#351E28",
    body: "#5C4A52",
    muted: "#7A6A70",
    accentText: "#C23A17",
    wasabi: "#E9F056",
    cool: "#D7EFFF",
    card: "#FFFFFF",
    line: "#DCDFD3",
}
const HEADING = `"Fjalla One", "Arial Narrow", "Helvetica Neue", Arial, sans-serif`
const BODY = `"Instrument Sans", "Trivia Sans", "Helvetica Neue", Arial, sans-serif`
const SCRIPT = `"Caveat", "Segoe Print", cursive`

// Wrong letters show in red as soon as they are typed.
const WRONG = "#D92D20"

type Cell = { answer: string; num?: number; words: number[] }
const key = (r: number, c: number) => `${r},${c}`
const cellsOf = (w: Word) => w.answer.split("").map((_, i) => (w.dir === "across" ? key(w.r, w.c + i) : key(w.r + i, w.c)))

type CrosswordProps = { title?: string; issue?: string; style?: React.CSSProperties }

export default function Crossword(props: CrosswordProps) {
    const { title = "Clue me in", issue = "No. 01", style } = props
    const grid = useMemo(() => {
        const m: Record<string, Cell> = {}
        WORDS.forEach((w, wi) => {
            cellsOf(w).forEach((k, i) => {
                if (!m[k]) m[k] = { answer: w.answer[i], words: [] }
                m[k].words.push(wi)
                if (i === 0) m[k].num = w.n
            })
        })
        return m
    }, [])

    const [entries, setEntries] = useState<Record<string, string>>({})
    const [active, setActive] = useState<string | null>(null)
    const [dir, setDir] = useState<Dir>("across")
    const [revealed, setRevealed] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const boxRef = useRef<HTMLDivElement>(null)
    const [w, setW] = useState(680)

    useEffect(() => {
        const el = boxRef.current
        if (!el || typeof ResizeObserver === "undefined") return
        const ro = new ResizeObserver(() => React.startTransition(() => setW(el.clientWidth)))
        ro.observe(el)
        setW(el.clientWidth)
        return () => ro.disconnect()
    }, [])

    const narrow = w < 520
    const cell = Math.max(18, Math.min(33, Math.floor(w / COLS)))
    const gridW = cell * COLS

    const wordAt = (k: string, d: Dir) => {
        const c = grid[k]
        if (!c) return -1
        return c.words.find((wi) => WORDS[wi].dir === d) ?? -1
    }
    const activeWord = active ? (wordAt(active, dir) >= 0 ? wordAt(active, dir) : grid[active].words[0]) : -1
    const activeCells = activeWord >= 0 ? new Set(cellsOf(WORDS[activeWord])) : new Set<string>()

    const isWordSolved = (wi: number) => cellsOf(WORDS[wi]).every((k) => (entries[k] || "") === grid[k].answer)
    const solvedWords = WORDS.map((_, wi) => isWordSolved(wi))
    const allSolved = solvedWords.every(Boolean)
    const anyEntry = Object.values(entries).some(Boolean)

    const focus = () => inputRef.current?.focus({ preventScroll: true })

    const select = (k: string) => {
        if (revealed) return
        const c = grid[k]
        if (!c) return
        if (active === k && c.words.length > 1) setDir(dir === "across" ? "down" : "across")
        else if (wordAt(k, dir) < 0) setDir(WORDS[c.words[0]].dir)
        setActive(k)
        focus()
    }

    const selectWord = (wi: number) => {
        if (revealed) return
        const cs = cellsOf(WORDS[wi])
        const firstEmpty = cs.find((k) => !entries[k]) || cs[0]
        setDir(WORDS[wi].dir)
        setActive(firstEmpty)
        focus()
    }

    const step = (k: string, d: Dir, delta: number) => {
        const [r, c] = k.split(",").map(Number)
        const nk = d === "across" ? key(r, c + delta) : key(r + delta, c)
        return grid[nk] ? nk : null
    }

    const type = (ch: string) => {
        if (!active) return
        const next = { ...entries, [active]: ch }
        setEntries(next)
        const n = step(active, dir, 1)
        if (n) setActive(n)
    }

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!active || revealed) return
        const k = e.key
        if (/^[a-zA-Z]$/.test(k)) {
            e.preventDefault()
            type(k.toUpperCase())
        } else if (k === "Backspace") {
            e.preventDefault()
            if (entries[active]) setEntries({ ...entries, [active]: "" })
            else {
                const p = step(active, dir, -1)
                if (p) {
                    setEntries({ ...entries, [p]: "" })
                    setActive(p)
                }
            }
        } else if (k.startsWith("Arrow")) {
            e.preventDefault()
            const d: Dir = k === "ArrowLeft" || k === "ArrowRight" ? "across" : "down"
            const delta = k === "ArrowLeft" || k === "ArrowUp" ? -1 : 1
            const n = step(active, d, delta)
            if (n) {
                setActive(n)
                if (wordAt(n, d) >= 0) setDir(d)
            }
        } else if (k === "Tab") {
            e.preventDefault()
            const next = (activeWord + (e.shiftKey ? WORDS.length - 1 : 1)) % WORDS.length
            selectWord(next)
        } else if (k === "Escape") {
            setActive(null)
            inputRef.current?.blur()
        }
    }

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value
        const ch = v.slice(-1)
        if (/^[a-zA-Z]$/.test(ch)) type(ch.toUpperCase())
        e.target.value = ""
    }

    const status = revealed || allSolved ? "that's me!" : anyEntry ? "keep going…" : "click a square to start"

    const clue = (wi: number) => {
        const wd = WORDS[wi]
        const on = wi === activeWord && !revealed
        const done = solvedWords[wi] && !revealed
        return (
            <li key={wi}>
                <button
                    onClick={() => selectWord(wi)}
                    style={{
                        all: "unset",
                        cursor: revealed ? "default" : "pointer",
                        display: "grid",
                        gridTemplateColumns: narrow ? "22px 1fr" : "26px 1fr",
                        gap: 6,
                        fontSize: narrow ? 13 : 17,
                        lineHeight: 1.45,
                        color: C.ink,
                        padding: "2px 6px",
                        margin: "0 -6px",
                        borderRadius: 6,
                        background: on ? C.cool : "transparent",
                        textDecorationLine: done ? "line-through" : "none",
                        textDecorationColor: "rgba(53,30,40,0.35)",
                    }}
                >
                    <strong style={{ fontWeight: 700 }}>{wd.n}</strong>
                    <span>
                        {wd.clue} ({wd.len})
                    </span>
                </button>
            </li>
        )
    }

    const label: React.CSSProperties = { fontSize: narrow ? 12 : 14, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: C.ink, paddingBottom: 6, borderBottom: `1px solid ${C.line}`, marginBottom: 6 }

    return (
        <div style={{ ...style, position: "relative", width: "100%", maxWidth: 750, margin: "0 auto", fontFamily: BODY, color: C.ink }}>
            <div style={{ background: C.card, border: `3px solid ${C.ink}`, borderRadius: 18, boxShadow: `7px 7px 0 ${C.ink}`, padding: narrow ? "16px 14px 16px" : "22px 30px 22px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, paddingBottom: 10, borderBottom: `3px solid ${C.ink}`, marginBottom: 14 }}>
                    <h3 style={{ margin: 0, fontFamily: HEADING, fontWeight: 400, fontSize: narrow ? 22 : 32, lineHeight: 1, letterSpacing: "0.005em" }}>{title}</h3>
                    <span style={{ fontSize: narrow ? 13 : 15, letterSpacing: "0.22em", color: C.muted, textTransform: "uppercase", whiteSpace: "nowrap" }}>{issue}</span>
                </div>
                <div ref={boxRef} style={{ width: "100%" }}>
                    <div role="grid" aria-label="Crossword grid" style={{ position: "relative", width: gridW, height: cell * ROWS, margin: "0 auto" }} onClick={focus}>
                        {Object.entries(grid).map(([k, c]) => {
                            const [r, col] = k.split(",").map(Number)
                            const isActive = k === active && !revealed
                            const inWord = activeCells.has(k) && !revealed
                            const solved = c.words.some((wi) => solvedWords[wi])
                            const letter = revealed ? c.answer : entries[k] || ""
                            return (
                                <div
                                    key={k}
                                    role="gridcell"
                                    data-k={k}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        select(k)
                                    }}
                                    style={{ position: "absolute", left: col * cell, top: r * cell, width: cell + 2, height: cell + 2, boxSizing: "border-box", border: `2px solid ${C.ink}`, background: isActive ? C.wasabi : inWord ? C.cool : solved && !revealed ? "#F4F7C9" : C.card, cursor: revealed ? "default" : "pointer" }}
                                >
                                    {c.num && <span style={{ position: "absolute", top: 1, left: 3, fontSize: Math.max(8, cell * 0.24), fontWeight: 700, lineHeight: 1 }}>{c.num}</span>}
                                    <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SCRIPT, fontSize: cell * 0.62, color: !revealed && letter && letter !== c.answer ? WRONG : C.ink, paddingTop: 2 }}>{letter}</span>
                                </div>
                            )
                        })}
                        <input ref={inputRef} aria-label="Type a letter" onKeyDown={onKeyDown} onChange={onChange} style={{ position: "absolute", left: 0, top: 0, width: 1, height: 1, opacity: 0, border: 0, padding: 0, pointerEvents: "none" }} />
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: narrow ? "minmax(0,1fr)" : "repeat(2, minmax(0,1fr))", gap: narrow ? 14 : 30, marginTop: 18 }}>
                    <div>
                        <div style={label}>Across</div>
                        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>{[3, 4].map(clue)}</ol>
                    </div>
                    <div>
                        <div style={label}>Down</div>
                        <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>{[0, 1, 2].map(clue)}</ol>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 14 }}>
                    <span aria-live="polite" style={{ fontFamily: SCRIPT, fontSize: narrow ? 20 : 27, color: C.accentText, lineHeight: 1 }}>{status}</span>
                    <button onClick={() => { setRevealed(!revealed); setActive(null) }} style={{ all: "unset", cursor: "pointer", fontFamily: BODY, fontWeight: 700, fontSize: narrow ? 13 : 15, letterSpacing: "0.14em", textTransform: "uppercase", color: C.ink, background: C.wasabi, border: `3px solid ${C.ink}`, borderRadius: 999, padding: narrow ? "7px 16px" : "10px 22px", whiteSpace: "nowrap" }}>
                        {revealed ? "Hide answers" : "Reveal"}
                    </button>
                </div>
            </div>
        </div>
    )
}

