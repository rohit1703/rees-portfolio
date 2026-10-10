"use client"
// One click handler on a page wrapper turns plain <a href="/..."> links into client-side navigations,
// so moving between the home page and case studies doesn't reload fonts and scripts.
// A "#section" in the link is remembered, so the home page can scroll to that project's card on arrival.
import * as React from "react"
import { useRouter } from "next/navigation"

export const SCROLL_KEY = "rc-scroll-to"

export function useInternalLinks() {
    const router = useRouter()
    return React.useCallback(
        (e: React.MouseEvent) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
            const a = (e.target as HTMLElement).closest?.("a[href]") as HTMLAnchorElement | null
            if (!a || a.target === "_blank" || a.hasAttribute("download")) return
            const href = a.getAttribute("href") || ""
            // Only same-site page links ("/sdk-manager", "/#work"); in-page "#…" links and mailto: stay native.
            if (!href.startsWith("/") || href.startsWith("//")) return
            const [path, hash = ""] = href.split("#")
            if ((path || "/") === window.location.pathname) return // same page: let the browser jump to the hash
            e.preventDefault()
            try {
                if (hash) sessionStorage.setItem(SCROLL_KEY, hash)
            } catch {
                // Storage can be blocked (private mode); the hash in the URL still works.
            }
            router.push(href)
        },
        [router]
    )
}
