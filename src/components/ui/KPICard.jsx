import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

function AnimatedCounter({ value, duration = 1.5 }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)

    useEffect(() => {
        let start = 0
        const end = parseFloat(value)
        if (isNaN(end)) { setCount(value); return }

        const startTime = performance.now()
        const step = (now) => {
            const elapsed = now - startTime
            const progress = Math.min(elapsed / (duration * 1000), 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(step)
            else setCount(end)
        }
        requestAnimationFrame(step)
    }, [value, duration])

    return <span>{typeof value === 'string' && value.includes('%') ? `${count}%` : count.toLocaleString()}</span>
}

export default function KPICard({ title, value, change, changeType, icon: Icon, suffix = '', gradient }) {
    const isPositive = changeType === 'positive'
    const gradientBg = gradient || 'linear-gradient(135deg, #f43f5e, #f472b6)'

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            whileHover={{ scale: 1.02 }}
            style={{ position: 'relative', overflow: 'hidden' }}
        >
            {/* Accent bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: gradientBg,
                borderRadius: '16px 16px 0 0',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <p style={{
                        color: 'var(--text-tertiary)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: 8,
                    }}>
                        {title}
                    </p>
                    <p style={{
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: '2rem',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        background: gradientBg,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        <AnimatedCounter value={parseFloat(value)} />{suffix}
                    </p>
                    {change && (
                        <p style={{
                            marginTop: 6,
                            fontSize: '0.82rem',
                            fontWeight: 600,
                            color: isPositive ? '#f97316' : '#e11d48',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                        }}>
                            {isPositive ? '↑' : '↓'} {change}
                            <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, marginLeft: 4 }}>vs last month</span>
                        </p>
                    )}
                </div>
                {Icon && (
                    <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: gradientBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.9,
                    }}>
                        <Icon size={22} color="white" />
                    </div>
                )}
            </div>
        </motion.div>
    )
}
