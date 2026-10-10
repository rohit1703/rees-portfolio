import type { Metadata, Viewport } from "next"
import "./globals.css"
import Providers from "./providers"
import { SITE_URL, SITE_TITLE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site"

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME }],
    alternates: { canonical: "/" },
    openGraph: { type: "website", siteName: SITE_NAME, title: SITE_TITLE, description: SITE_DESCRIPTION, url: "/", locale: "en_IN" },
    twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
    robots: { index: true, follow: true },
}

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#F7F6F1",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                {/* The two faces every page needs first; the rest load on demand. */}
                <link rel="preload" href="/fonts/fjalla-one-latin-400-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                <link rel="preload" href="/fonts/instrument-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
            </head>
            <body>
                <a href="#main" className="skip-link">
                    Skip to content
                </a>
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
