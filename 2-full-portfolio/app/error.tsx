"use client"
import { useEffect } from "react"
import Link from "next/link"

/** Shown if a page throws while rendering. The visitor can retry or go home; the error goes to the console for debugging. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error)
    }, [error])
    return (
        <main id="main" role="alert" style={{ minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 24, textAlign: "center" }}>
            <h1 style={{ fontFamily: '"Fjalla One", "Arial Narrow", sans-serif', fontWeight: 400, fontSize: 48, textTransform: "uppercase", margin: 0 }}>Something went wrong</h1>
            <p style={{ fontSize: 17, color: "#5C4A52", margin: 0, maxWidth: "40ch" }}>This page hit a snag while loading. Trying again usually fixes it.</p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
                <button onClick={reset} style={{ font: "inherit", fontWeight: 700, cursor: "pointer", background: "#E9F056", color: "#351E28", border: "3px solid #351E28", borderRadius: 999, padding: "10px 22px" }}>
                    Try again
                </button>
                <Link href="/" style={{ alignSelf: "center", color: "#351E28", fontWeight: 600, textDecoration: "underline", textDecorationColor: "#FF5C34", textDecorationThickness: 2, textUnderlineOffset: 5 }}>
                    Go to the home page
                </Link>
            </div>
        </main>
    )
}
