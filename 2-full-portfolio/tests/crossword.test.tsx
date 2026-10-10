import { render, screen, fireEvent } from "@testing-library/react"
import Crossword from "@/components/home/Crossword"

const cell = (k: string) => document.querySelector(`[data-k="${k}"]`) as HTMLElement
const input = () => screen.getByLabelText("Type a letter")

describe("Crossword", () => {
    it("starts with the prompt and both clue lists", () => {
        render(<Crossword />)
        expect(screen.getByText("click a square to start")).toBeInTheDocument()
        expect(screen.getByText("Across")).toBeInTheDocument()
        expect(screen.getByText("Down")).toBeInTheDocument()
        expect(screen.getByText(/Notices the 1px misalignment/)).toBeInTheDocument()
    })

    it("typing fills squares, advances, and marks wrong letters red", () => {
        render(<Crossword />)
        fireEvent.click(cell("3,0")) // 4 across: DETAILORIENTED
        fireEvent.keyDown(input(), { key: "d" })
        expect(cell("3,0")).toHaveTextContent("D")
        fireEvent.keyDown(input(), { key: "x" }) // wrong: should be E
        const wrong = cell("3,1").querySelectorAll("span")
        expect(cell("3,1")).toHaveTextContent("X")
        expect((wrong[wrong.length - 1] as HTMLElement).style.color).toBe("rgb(217, 45, 32)")
        expect(screen.getByText("keep going…")).toBeInTheDocument()
    })

    it("Backspace clears, and clicking a clue selects its word", () => {
        render(<Crossword />)
        fireEvent.click(cell("6,6"))
        fireEvent.keyDown(input(), { key: "m" })
        fireEvent.keyDown(input(), { key: "Backspace" })
        fireEvent.keyDown(input(), { key: "Backspace" })
        expect(cell("6,6")).not.toHaveTextContent("M")
        fireEvent.click(screen.getByText(/Always asking/))
        fireEvent.keyDown(input(), { key: "c" })
        expect(cell("0,8")).toHaveTextContent("C")
    })

    it("solving a word strikes its clue; Reveal shows everything", () => {
        render(<Crossword />)
        fireEvent.click(screen.getByText(/Like the first wall of sticky notes/))
        for (const ch of "MESSY") fireEvent.keyDown(input(), { key: ch })
        expect(screen.getByText(/Like the first wall/).closest("button")!.style.textDecorationLine).toBe("line-through")
        fireEvent.click(screen.getByRole("button", { name: "Reveal" }))
        expect(screen.getByText("that's me!")).toBeInTheDocument()
        expect(cell("9,3")).toHaveTextContent("C") // last letter of EMPATHETIC
        fireEvent.click(screen.getByRole("button", { name: "Hide answers" }))
        expect(screen.getByRole("button", { name: "Reveal" })).toBeInTheDocument()
    })
})
