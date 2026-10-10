import "@testing-library/jest-dom/vitest"
import { vi, afterEach } from "vitest"
import { cleanup } from "@testing-library/react"

afterEach(() => cleanup())

// next/navigation: a fake router whose push() the tests can inspect.
export const push = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn(), back: vi.fn() }) }))

// Browser APIs jsdom doesn't implement.
class RO {
    observe() {}
    unobserve() {}
    disconnect() {}
}
class IO {
    constructor(private cb: IntersectionObserverCallback) {}
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return []
    }
}
;(globalThis as any).ResizeObserver = RO
;(globalThis as any).IntersectionObserver = IO
export let reduceMotion = false
export const setReduceMotion = (v: boolean) => (reduceMotion = v)
window.matchMedia = ((q: string) => ({
    matches: q.includes("reduce") ? reduceMotion : false,
    media: q,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
})) as any
window.scrollTo = (() => {}) as any
Element.prototype.scrollIntoView = function () {}
;(document as any).elementsFromPoint = () => []
