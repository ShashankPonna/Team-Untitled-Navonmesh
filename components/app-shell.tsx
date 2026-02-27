"use client"

import dynamic from "next/dynamic"
import Navigation from "./navigation"
import type { ReactNode } from "react"

const ThreeBackground = dynamic(() => import("./three-background"), {
  ssr: false,
})

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <ThreeBackground />
      <Navigation />
      <main className="relative z-10 mx-auto max-w-[1440px] px-4 pt-20 pb-12 lg:px-8">
        {children}
      </main>
    </div>
  )
}
