import type { NextConfig } from "next"

// Security headers are applied to every route. The site loads nothing from other origins,
// so the content security policy only allows this site (plus mailto: and outbound links).
const csp = [
    "default-src 'self'",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    // Next.js needs inline scripts for hydration; 'unsafe-eval' only in development (React refresh).
    `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self' mailto:",
].join("; ")

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    images: { unoptimized: true },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "Content-Security-Policy", value: csp },
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
                ],
            },
            {
                source: "/(images|fonts)/:path*",
                headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
            },
            {
                // Video file names aren't content-hashed, so cache for a week rather than forever.
                source: "/video/:path*",
                headers: [{ key: "Cache-Control", value: "public, max-age=604800" }],
            },
        ]
    },
    async redirects() {
        // Older links pointed at /home-page (the Framer page path); keep them working.
        return [{ source: "/home-page", destination: "/", permanent: true }]
    },
}

export default nextConfig
