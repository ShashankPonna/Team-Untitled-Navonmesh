import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Boxes, ArrowRight, TrendingUp, Package, LayoutDashboard } from "lucide-react"

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col pt-16 selection:bg-primary/30">
            <main className="flex-1 flex items-center justify-center p-6 text-center">
                <div className="max-w-3xl space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="flex justify-center">
                        <div className="h-16 w-16 bg-primary/20 flex items-center justify-center rounded-2xl shadow-xl shadow-primary/10">
                            <Boxes className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
                        Welcome to <span className="text-primary italic">OptiStock AI</span>
                    </h1>
                    <p className="text-lg sm:text-2xl text-muted-foreground max-w-2xl mx-auto opacity-90">
                        The intelligent inventory optimization platform. Manage multi-location stock, predict demand, and stop stockouts before they happen.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
                        <Button asChild size="lg" className="h-14 px-8 text-lg font-semibold rounded-xl">
                            <Link href="/login">
                                Get Started <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold rounded-xl">
                            <Link href="/dashboard">
                                View Dashboard
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>

            <div className="py-20 bg-background/50 border-t border-border mt-auto">
                <div className="max-w-5xl mx-auto px-6 grid sm:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Predict Demand</h3>
                        <p className="text-muted-foreground text-sm">AI-driven forecasts to ensure you always have what you need.</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <LayoutDashboard className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Global Insights</h3>
                        <p className="text-muted-foreground text-sm">Monitor KPIs across all locations from a unified dashboard.</p>
                    </div>
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                            <Package className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold">Smart Transfers</h3>
                        <p className="text-muted-foreground text-sm">Automatically resolve shortages before they impact customers.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
