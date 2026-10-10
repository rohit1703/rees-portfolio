"use client"
import { MotionConfig } from "motion/react"

/** Motion respects the visitor's "reduce motion" setting everywhere: transforms jump to their end state. */
export default function Providers({ children }: { children: React.ReactNode }) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
