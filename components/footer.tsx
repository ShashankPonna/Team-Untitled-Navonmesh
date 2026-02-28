import Link from "next/link"
import { Boxes, Github } from "lucide-react"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="relative mt-12 border-t border-border/50 bg-background/60 backdrop-blur-xl py-8 overflow-hidden">
            {/* Decorative background effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-[100px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    <div className="md:col-span-2 space-y-3">
                        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80 w-fit">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary">
                                <Boxes className="h-4 w-4" />
                            </div>
                            StockFlow
                        </Link>
                        <p className="text-xs text-muted-foreground/80 max-w-sm leading-relaxed">
                            The intelligent inventory optimization platform. Predict demand, manage multi-location stock, and prevent stockouts with AI-driven insights.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-border/40 gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {currentYear} Navonmesh Copy. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <a
                            href="https://github.com/ShashankPonna/Team-Untitled-Navonmesh/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="GitHub Profile"
                        >
                            <Github className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
