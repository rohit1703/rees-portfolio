"use client"

/** Last-resort error screen if the root layout itself fails. Must render its own <html> and <body>. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <html lang="en">
            <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F7F6F1", color: "#351E28" }}>
                <main role="alert" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, textAlign: "center" }}>
                    <h1 style={{ margin: 0 }}>Something went wrong</h1>
                    <button onClick={reset} style={{ font: "inherit", cursor: "pointer", padding: "10px 20px", borderRadius: 999, border: "2px solid #351E28", background: "#E9F056" }}>
                        Try again
                    </button>
                </main>
            </body>
        </html>
    )
}
