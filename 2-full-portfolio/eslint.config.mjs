import next from "eslint-config-next/core-web-vitals"

const config = [
    ...next,
    {
        rules: {
            // Images use plain <img> with local WebP srcsets (see lib/images.ts), so next/image isn't needed.
            "@next/next/no-img-element": "off",
            // Case-study copy is written with plain apostrophes and quotes; React renders them correctly.
            "react/no-unescaped-entities": "off",
            // Measurement effects (ResizeObserver, scroll, image fallbacks) intentionally sync state after layout.
            "react-hooks/set-state-in-effect": "warn",
            "react-hooks/exhaustive-deps": "warn",
        },
    },
    {
        // Rail/Cards take [label, node] tuples; each node is rendered on its own, not as a list child.
        files: ["components/case-study/**"],
        rules: { "react/jsx-key": "off" },
    },
    { files: ["tests/**"], rules: { "@next/next/no-html-link-for-pages": "off" } },
    { ignores: [".next/**", "node_modules/**", "scripts/**", "next-env.d.ts"] },
]

export default config
