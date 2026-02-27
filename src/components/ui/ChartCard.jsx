import { motion } from 'framer-motion'
import { ResponsiveContainer } from 'recharts'

export default function ChartCard({ title, subtitle, children, height = 300 }) {
    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
        >
            <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', marginBottom: 4 }}>{title}</h4>
                {subtitle && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>{subtitle}</p>}
            </div>
            <div style={{ width: '100%', height }}>
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </div>
        </motion.div>
    )
}
