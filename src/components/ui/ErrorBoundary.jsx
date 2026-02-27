import React from 'react'

export class Canvas3DErrorBoundary extends React.Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError() {
        return { hasError: true }
    }

    componentDidCatch(error, info) {
        console.warn('3D Scene Error (WebGL may be unavailable):', error.message)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    width: '100%',
                    height: this.props.height || '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.08), rgba(10,10,18,0.95))',
                    borderRadius: 16,
                    border: '1px solid rgba(148,163,184,0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Animated background dots */}
                    <div style={{ position: 'absolute', inset: 0, opacity: 0.15 }}>
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} style={{
                                position: 'absolute',
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                background: '#06b6d4',
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `float ${2 + Math.random() * 3}s ease-in-out infinite`,
                                animationDelay: `${Math.random() * 2}s`,
                            }} />
                        ))}
                    </div>
                    <div style={{ textAlign: 'center', zIndex: 1 }}>
                        <div style={{
                            fontSize: '3rem',
                            marginBottom: 12,
                            animation: 'float 3s ease-in-out infinite',
                        }}>
                            🌐
                        </div>
                        <p style={{
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: 4,
                        }}>
                            {this.props.label || '3D Visualization'}
                        </p>
                        <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
                            Interactive 3D scene — requires WebGL enabled browser
                        </p>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}
