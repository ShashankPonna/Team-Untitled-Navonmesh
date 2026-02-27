import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isSignUp, setIsSignUp] = useState(false)
    const navigate = useNavigate()

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        let authError = null

        if (isSignUp) {
            const { error } = await supabase.auth.signUp({
                email,
                password
            })
            authError = error
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })
            authError = error
        }

        if (authError) {
            setError(authError.message)
            setLoading(false)
        } else {
            if (isSignUp) {
                alert('Account created successfully! You can now log in.')
                setIsSignUp(false)
                setLoading(false)
                setPassword('')
            } else {
                navigate('/dashboard')
            }
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            padding: 24,
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Effects */}
            <div style={{
                position: 'absolute',
                top: '20%',
                left: '20%',
                width: 400,
                height: 400,
                background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, rgba(6,182,212,0) 70%)',
                filter: 'blur(40px)',
                borderRadius: '50%'
            }} />

            <motion.div
                className="glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    width: '100%',
                    maxWidth: 420,
                    padding: 40,
                    position: 'relative',
                    zIndex: 10
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: 16,
                        background: 'rgba(6,182,212,0.1)',
                        border: '1px solid rgba(6,182,212,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <LogIn size={32} color="#06b6d4" />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontFamily: 'Outfit, sans-serif', marginBottom: 8 }}>
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h1>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                        {isSignUp ? 'Sign up to StockFlow Platform' : 'Sign in to StockFlow Platform'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)',
                        borderRadius: 8,
                        padding: '12px 16px',
                        marginBottom: 24,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12
                    }}>
                        <AlertCircle size={18} color="#ef4444" style={{ marginTop: 2 }} />
                        <p style={{ color: '#f87171', fontSize: '0.85rem', lineHeight: 1.4 }}>{error}</p>
                    </div>
                )}

                <form onSubmit={handleAuth}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    background: 'rgba(15,23,42,0.6)',
                                    border: '1px solid rgba(148,163,184,0.2)',
                                    borderRadius: 8,
                                    padding: '12px 16px 12px 44px',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                placeholder="name@company.com"
                                onFocus={(e) => e.target.style.borderColor = 'rgba(6,182,212,0.5)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(148,163,184,0.2)'}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: 32 }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <Lock size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    background: 'rgba(15,23,42,0.6)',
                                    border: '1px solid rgba(148,163,184,0.2)',
                                    borderRadius: 8,
                                    padding: '12px 16px 12px 44px',
                                    color: 'white',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s'
                                }}
                                placeholder="••••••••"
                                onFocus={(e) => e.target.style.borderColor = 'rgba(6,182,212,0.5)'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(148,163,184,0.2)'}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            padding: '14px',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'opacity 0.2s',
                            boxShadow: '0 4px 14px rgba(6,182,212,0.3)'
                        }}
                    >
                        {loading ? 'Authenticating...' : isSignUp ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: 24, textAlign: 'center', paddingTop: 20 }}>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignUp(!isSignUp)
                                setError(null)
                            }}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#06b6d4',
                                fontWeight: 600,
                                cursor: 'pointer',
                                padding: 0,
                                fontSize: '0.9rem'
                            }}
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
