import { render, fireEvent } from "@testing-library/react"
import { useInternalLinks, SCROLL_KEY } from "@/lib/useInternalLinks"
import { push } from "./setup"

function Harness() {
    const on = useInternalLinks()
    return (
        <div onClick={on}>
            <a href="/sdk-manager">case</a>
            <a href="/#ai-interviewer">card</a>
            <a href="mailto:x@y.z">mail</a>
            <a href="https://www.linkedin.com/in/x" target="_blank" rel="noreferrer">ext</a>
            <a href="/Reethika_Chitithoti_Resume.pdf" download>cv</a>
        </div>
    )
}

describe("useInternalLinks", () => {
    beforeEach(() => {
        push.mockClear()
        sessionStorage.clear()
        window.history.pushState({}, "", "/pet-health-scan")
    })

    it("routes same-site links client-side and remembers the #card", () => {
        const { getByText } = render(<Harness />)
        fireEvent.click(getByText("case"))
        expect(push).toHaveBeenCalledWith("/sdk-manager")
        fireEvent.click(getByText("card"))
        expect(push).toHaveBeenCalledWith("/#ai-interviewer")
        expect(sessionStorage.getItem(SCROLL_KEY)).toBe("ai-interviewer")
    })

    it("leaves mailto, new-tab, downloads and modifier-clicks to the browser", () => {
        const { getByText } = render(<Harness />)
        fireEvent.click(getByText("mail"))
        fireEvent.click(getByText("ext"))
        fireEvent.click(getByText("cv"))
        fireEvent.click(getByText("case"), { metaKey: true })
        expect(push).not.toHaveBeenCalled()
    })
})
