"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Inter } from "next/font/google"
import { Boxes, LayoutDashboard, LogIn, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"] })

export function Navbar() {
    const pathname = usePathname()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Track scroll position to add a glassmorphism effect when scrolling down
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])


    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                isScrolled
                    ? "bg-background/80 backdrop-blur-md border-border/50 shadow-sm"
                    : "bg-transparent border-transparent"
            )}
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary group-hover:bg-primary/30 transition-colors">
                        <Boxes className="h-5 w-5" />
                    </div>
                    <span className={cn("text-xl font-bold tracking-tight", inter.className)}>
                        StockFlow
                    </span>
                </Link>

                {/* Desktop Navigation Placeholder */}
                <nav className="hidden md:flex items-center gap-8"></nav>

                {/* Desktop CTA Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" asChild className="hidden lg:flex text-sm font-medium">
                        <Link href="/login">
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign in
                        </Link>
                    </Button>
                    <Button asChild className="shadow-lg shadow-primary/20 text-sm font-medium rounded-full px-6">
                        <Link href="/dashboard">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                        </Link>
                    </Button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden flex items-center p-2 text-foreground"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={cn(
                    "md:hidden absolute top-16 left-0 right-0 bg-background border-b border-border/50 shadow-lg transition-all duration-300 overflow-hidden",
                    mobileMenuOpen ? "max-h-96 border-b opacity-100" : "max-h-0 border-transparent opacity-0"
                )}
            >
                <div className="flex flex-col p-6 gap-4">
                    <div className="flex flex-col gap-3 pt-2">
                        <Button variant="outline" asChild className="w-full justify-start">
                            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                <LogIn className="mr-2 h-4 w-4" />
                                Sign in
                            </Link>
                        </Button>
                        <Button asChild className="w-full justify-start shadow-lg shadow-primary/20">
                            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                <LayoutDashboard className="mr-2 h-4 w-4" />
                                Go to Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    )
}
