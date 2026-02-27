"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Boxes, Loader2, KeyRound } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [isLogin, setIsLogin] = useState(true)

    const [form, setForm] = useState({
        email: "",
        password: "",
    })

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: form.email,
                    password: form.password,
                })
                if (error) throw error
                router.push("/dashboard")
                router.refresh()
            } else {
                const { error } = await supabase.auth.signUp({
                    email: form.email,
                    password: form.password,
                })
                if (error) throw error
                setError("Check your email for the confirmation link.")
            }
        } catch (err: any) {
            setError(err.message || "Failed to authenticate.")
        } finally {
            setLoading(false)
        }
    }

    // Direct access helper
    const handleDemoAccess = async () => {
        setLoading(true)
        setError("")
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: "admin@optistock.ai",
                password: "password123",
            })
            if (error) throw error
            router.push("/dashboard")
            router.refresh()
        } catch (err: any) {
            setError(err.message || "Failed to authenticate.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <div className="max-w-md w-full glass-card-strong p-8 rounded-2xl border border-border mt-[-5%]">
                <div className="flex flex-col items-center mb-6">
                    <div className="h-12 w-12 bg-primary/20 flex items-center justify-center rounded-xl mb-4">
                        <Boxes className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">{isLogin ? "Welcome Back" : "Create Account"}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {isLogin ? "Sign in to your OptiStock AI workspace" : "Get started with inventory optimization"}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@optistock.ai"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            className="bg-background/60 h-11"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            className="bg-background/60 h-11"
                        />
                    </div>

                    {error && (
                        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-lg border border-destructive/20 font-medium">
                            {error}
                        </div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/20">
                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {isLogin ? "Sign In" : "Sign Up"}
                    </Button>

                    {isLogin && (
                        <Button type="button" variant="outline" disabled={loading} onClick={handleDemoAccess} className="w-full h-11 mt-2 text-primary gap-2">
                            <KeyRound className="w-4 h-4" /> Direct Access
                        </Button>
                    )}
                </form>

                <div className="mt-6 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin)
                            setError("")
                        }}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
                    >
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    )
}
