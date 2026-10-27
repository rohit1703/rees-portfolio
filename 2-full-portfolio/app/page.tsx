import HomePage from "@/components/home/HomePage"

// Values the Framer page set on the home component (everything else uses the component defaults).
export default function Home() {
    return (
        <main id="main" tabIndex={-1} style={{ outline: "none" }}>
            <HomePage
                aboutZoom={1.4}
                aboutFocus={25}
                aiLink="/ai-interviewer"
                sdkLink="/sdk-manager"
                petLink="/pet-health-scan"
                email="reethikachitithoti@gmail.com"
                linkedin="https://www.linkedin.com/in/reethika-c/"
                behance="https://www.behance.net/reethika104"
                resume="/Reethika_Chitithoti_Resume.pdf"
                badgeText="UX Designer"
                credit="Crafted by me, assisted by Claude"
                preloader
                smoothScroll
            />
        </main>
    )
}
