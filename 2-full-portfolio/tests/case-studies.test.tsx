import { render, screen, fireEvent } from "@testing-library/react"
import AIInterviewer from "@/components/case-study/AIInterviewer"
import SDKManager from "@/components/case-study/SDKManager"
import PetHealth from "@/components/case-study/PetHealth"
import { setReduceMotion } from "./setup"

const pages = [
    { C: AIInterviewer, title: "AI Interviewer", next: "SDK Manager", nextHref: "/sdk-manager", back: "/#ai-interviewer", nav: "Where AI belonged" },
    { C: SDKManager, title: "SDK Manager", next: "Pet Health Scan Suite", nextHref: "/pet-health-scan", back: "/#sdk-manager", nav: "Tried and dropped" },
    { C: PetHealth, title: "Pet Health Scan Suite", next: "AI Interviewer", nextHref: "/ai-interviewer", back: "/#pet-health-scan", nav: "Immunity result" },
]

describe.each(pages)("$title case study", ({ C, title, next, nextHref, back, nav }) => {
    afterEach(() => setReduceMotion(false))

    it("renders the hero, section nav and footer links (layered layout)", () => {
        render(<C nextLink={nextHref} />)
        expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument()
        expect(screen.getByRole("navigation", { name: "Case study sections" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: nav })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: `Next: ${next} →` })).toHaveAttribute("href", nextHref)
        expect(screen.getByRole("link", { name: "← Back to portfolio" })).toHaveAttribute("href", back)
        expect(screen.getAllByRole("link", { name: "← Home" })[0]).toHaveAttribute("href", back)
    })

    it("hero image loads eagerly from /images; the rest lazily", () => {
        render(<C nextLink={nextHref} />)
        const imgs = Array.from(document.querySelectorAll("img"))
        expect(imgs.length).toBeGreaterThan(2)
        expect(imgs.every((i) => i.getAttribute("src")!.startsWith("/images/"))).toBe(true)
        expect(imgs[0]).toHaveAttribute("loading", "eager")
        expect(imgs.slice(1).some((i) => i.getAttribute("loading") === "lazy")).toBe(true)
    })

    it("with reduced motion, falls back to a plain stacked page", () => {
        setReduceMotion(true)
        render(<C nextLink={nextHref} />)
        expect(screen.queryByRole("navigation", { name: "Case study sections" })).not.toBeInTheDocument()
        expect(screen.getByRole("heading", { level: 1, name: title })).toBeInTheDocument()
    })
})

describe("Pet Health interactions", () => {
    it("before/after slider responds to the keyboard-accessible range input", () => {
        render(<PetHealth />)
        const range = screen.getByRole("slider", { name: /Compare/ })
        fireEvent.change(range, { target: { value: "20" } })
        expect(range).toHaveValue("20")
    })

    it("Enlarge opens a full-screen viewer that closes with Escape", () => {
        render(<PetHealth />)
        fireEvent.click(screen.getAllByRole("button", { name: /Open full screen/ })[0])
        expect(screen.getByRole("dialog")).toBeInTheDocument()
        fireEvent.keyDown(window, { key: "Escape" })
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })
})
