import Link from "next/link"

export const metadata = { title: "Page not found" }

export default function NotFound() {
    return (
        <main id="main" style={{ minHeight: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, padding: 24, textAlign: "center" }}>
            <p style={{ fontFamily: "Caveat, cursive", fontSize: 30, color: "#C23A17", margin: 0 }}>wrong square…</p>
            <h1 style={{ fontFamily: '"Fjalla One", "Arial Narrow", sans-serif', fontWeight: 400, fontSize: "clamp(56px, 12vw, 140px)", lineHeight: 0.9, textTransform: "uppercase", margin: 0 }}>404</h1>
            <p style={{ fontSize: 18, color: "#5C4A52", margin: 0, maxWidth: "34ch" }}>This page doesn&apos;t exist. The work is on the home page.</p>
            <Link href="/#work" style={{ color: "#351E28", fontWeight: 700, textDecoration: "underline", textDecorationColor: "#FF5C34", textDecorationThickness: 2, textUnderlineOffset: 5 }}>
                Back to the portfolio →
            </Link>
        </main>
    )
}
