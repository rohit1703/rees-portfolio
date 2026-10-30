import type { NextConfig } from "next"

// Security headers are applied to every route. The only third party is Google Analytics (gtag.js),
// so the content security policy allows this site plus Google's tag and analytics hosts.
const GA_HOSTS = "https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com"

const csp = [
    "default-src 'self'",
    `img-src 'self' data: blob: ${GA_HOSTS}`,
    "media-src 'self' blob:",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    // Next.js needs inline scripts for hydration; 'unsafe-eval' only in development (React refresh).
    `script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
    `connect-src 'self' ${GA_HOSTS}`,
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
