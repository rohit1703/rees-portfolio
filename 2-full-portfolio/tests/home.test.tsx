import { render, screen, fireEvent, act } from "@testing-library/react"
import HomePage from "@/components/home/HomePage"

const renderHome = () =>
    render(<HomePage resume="/Reethika_Chitithoti_Resume.pdf" linkedin="https://www.linkedin.com/in/reethika-c/" behance="https://www.behance.net/reethika104" preloader smoothScroll />)

describe("Home page", () => {
    it("renders every section with its copy", () => {
        renderHome()
        expect(screen.getByRole("heading", { level: 1, name: "Reethika" })).toBeInTheDocument()
        for (const h of ["Helloo! I am Reethika", "Work", "Skills", "Experience", "Education"]) expect(screen.getAllByRole("heading", { name: new RegExp(h, "i") }).length).toBeGreaterThan(0)
        expect(screen.getByText("Grid Dynamics")).toBeInTheDocument()
        expect(screen.getByText(/Crafted by me, assisted by Claude/)).toBeInTheDocument()
    })

    it("each work card links to its case study and carries the anchor id", () => {
        renderHome()
        for (const [id, href] of [
            ["ai-interviewer", "/ai-interviewer"],
            ["sdk-manager", "/sdk-manager"],
            ["pet-health-scan", "/pet-health-scan"],
            ["trust-desk", "/trust-desk"],
        ]) {
            const card = document.getElementById(id)!
            expect(card.tagName).toBe("A")
            expect(card).toHaveAttribute("href", href)
        }
    })

    it("work images are local and lazy-loaded", () => {
        renderHome()
        const img = screen.getByAltText(/AI Interviewer: the reverse-engineering round/)
        expect(img.getAttribute("src")).toMatch(/^\/images\//)
        expect(img).toHaveAttribute("loading", "lazy")
    })

    it("a failed image falls back to a labelled placeholder", () => {
        renderHome()
        const img = screen.getByAltText(/SDK Manager: the SDK overview/)
        act(() => {
            fireEvent.error(img)
        })
        expect(screen.getByRole("img", { name: "Placeholder: SDK Manager" })).toBeInTheDocument()
    })

    it("the menu opens, lists sections, and closes with Escape", () => {
        renderHome()
        fireEvent.click(screen.getByRole("button", { name: "Open menu" }))
        expect(screen.getByRole("navigation", { name: "Main menu" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true")
        act(() => {
            fireEvent.keyDown(window, { key: "Escape" })
        })
        expect(screen.getByRole("button", { name: "Open menu" })).toHaveAttribute("aria-expanded", "false")
    })

    it("offers the resume as a same-site download and the contact links", () => {
        renderHome()
        const cv = screen.getByRole("link", { name: "Download resume (PDF)" })
        expect(cv).toHaveAttribute("href", "/Reethika_Chitithoti_Resume.pdf")
        expect(cv).toHaveAttribute("download", "Reethika_Chitithoti_Resume.pdf")
        expect(screen.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute("href", "https://www.linkedin.com/in/reethika-c/")
        expect(screen.getAllByRole("link", { name: /reethikachitithoti@gmail.com/ })[0]).toHaveAttribute("href", "mailto:reethikachitithoti@gmail.com")
    })
})
