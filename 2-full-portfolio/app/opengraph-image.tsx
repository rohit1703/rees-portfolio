import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import path from "node:path"

// Social card for every page, drawn at build time in the portfolio's colours and type.
export const alt = "Reethika Chitithoti — UX Designer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
    const dir = path.join(process.cwd(), "assets/og")
    const [fjalla, instrument] = await Promise.all([readFile(path.join(dir, "fjalla-one-latin-400-normal.woff")), readFile(path.join(dir, "instrument-sans-latin-500-normal.woff"))])
    return new ImageResponse(
        (
            <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#351E28", color: "#F7F6F1", padding: "72px 80px", fontFamily: "Instrument Sans" }}>
                <div style={{ display: "flex", gap: 12 }}>
                    {["UX Designer", "Bangalore / Remote"].map((t) => (
                        <div key={t} style={{ display: "flex", background: "#E9F056", color: "#351E28", borderRadius: 999, padding: "10px 22px", fontSize: 26 }}>
                            {t}
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ fontFamily: "Fjalla One", fontSize: 150, lineHeight: 0.9, textTransform: "uppercase", letterSpacing: "0.005em" }}>Reethika</div>
                    <div style={{ fontFamily: "Fjalla One", fontSize: 150, lineHeight: 0.9, textTransform: "uppercase", color: "#E9F056" }}>Chitithoti</div>
                </div>
                <div style={{ display: "flex", fontSize: 30, lineHeight: 1.35, color: "rgba(247,246,241,0.86)", maxWidth: 900 }}>
                    I make complicated tools easier to use, starting with where people actually get stuck.
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                { name: "Fjalla One", data: fjalla, weight: 400, style: "normal" },
                { name: "Instrument Sans", data: instrument, weight: 500, style: "normal" },
            ],
        }
    )
}
