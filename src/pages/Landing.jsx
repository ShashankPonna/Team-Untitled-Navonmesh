import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    TrendingUp, Package, Building2, Shield, Zap,
    BarChart3, ArrowRight, Globe, Brain, Bell
} from 'lucide-react'
import SupplyChainScene from '../components/three/SupplyChainScene'
import { Canvas3DErrorBoundary } from '../components/ui/ErrorBoundary'

const stats = [
    { value: '40%', label: 'Stockout Reduction' },
    { value: '85%', label: 'Forecast Accuracy' },
    { value: '30%', label: 'Cost Savings' },
    { value: '70%', label: 'Auto Replenishment' },
]

const features = [
    {
        icon: Brain,
        title: 'AI-Powered Forecasting',
        description: 'Multi-model ensemble (ARIMA, XGBoost, LSTM) with seasonal and event-aware demand prediction at SKU-level granularity.',
        gradient: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
    },
    {
        icon: Zap,
        title: 'Dynamic Replenishment',
        description: 'Auto-calculated reorder points, safety stock optimization, and real-time PO generation when thresholds are breached.',
        gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)',
    },
    {
        icon: Building2,
        title: 'Multi-Warehouse Intelligence',
        description: 'Cross-node inventory balancing with redistribution recommendations to eliminate overstock and emergency shipments.',
        gradient: 'linear-gradient(135deg, #14b8a6, #10b981)',
    },
    {
        icon: Package,
        title: 'Perishable Management',
        description: 'FIFO/FEFO rotation enforcement with expiry tracking, automated alerts at 7/3/1 day intervals before expiration.',
        gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    },
    {
        icon: BarChart3,
        title: 'Real-Time Dashboard',
        description: 'Unified inventory visibility with configurable KPI monitoring, drill-down analytics, and role-based executive views.',
        gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    },
    {
        icon: Globe,
        title: 'Enterprise Integrations',
        description: 'Pre-built connectors for SAP, Oracle, Dynamics with REST API and webhook support for custom WMS/POS systems.',
        gradient: 'linear-gradient(135deg, #ec4899, #f59e0b)',
    },
]

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}

const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] } }
}

export default function Landing() {
    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-canvas">
                    <Canvas3DErrorBoundary label="Supply Chain Visualization">
                        <SupplyChainScene />
                    </Canvas3DErrorBoundary>
                </div>
                <div className="hero-overlay" />
                <motion.div
                    className="hero-content"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 16px',
                            borderRadius: 9999,
                            background: 'rgba(6, 182, 212, 0.1)',
                            border: '1px solid rgba(6, 182, 212, 0.2)',
                            marginBottom: 24,
                            fontSize: '0.82rem',
                            color: '#22d3ee',
                            fontWeight: 600,
                        }}
                    >
                        <Shield size={14} />
                        Ticket #26008 · v1.0
                    </motion.div>

                    <h1>
                        <span className="gradient-text">Intelligent Inventory</span>
                        <br />Optimization Framework
                    </h1>
                    <p>
                        AI-powered supply chain intelligence that dynamically balances supply and demand,
                        minimizes stockouts, reduces overstock, and delivers actionable replenishment
                        recommendations across multi-node distribution networks.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/dashboard" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                            Launch Dashboard <ArrowRight size={18} />
                        </Link>
                        <Link to="/forecasting" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
                            Explore Forecasting
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Stats Bar */}
            <motion.section
                className="stats-bar"
                style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(148,163,184,0.08)',
                    borderBottom: '1px solid rgba(148,163,184,0.08)',
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                {stats.map((s, i) => (
                    <motion.div
                        key={i}
                        className="stat-item"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </motion.div>
                ))}
            </motion.section>

            {/* Features */}
            <section className="features-section">
                <motion.h2
                    className="gradient-text"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Core Capabilities
                </motion.h2>
                <motion.div
                    className="features-grid"
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                >
                    {features.map((f, i) => (
                        <motion.div key={i} className="feature-card glass-card" variants={item}>
                            <div className="feature-icon" style={{ background: f.gradient }}>
                                <f.icon size={22} />
                            </div>
                            <h3>{f.title}</h3>
                            <p>{f.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* CTA Footer */}
            <motion.section
                style={{
                    textAlign: 'center',
                    padding: '80px 24px',
                    background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.08), transparent 70%)',
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <h2 style={{ marginBottom: 16 }}>
                    Ready to <span className="gradient-text">Optimize</span>?
                </h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
                    Reduce stockouts by 40%, cut holding costs by 30%, and automate 70% of replenishment decisions.
                </p>
                <Link to="/dashboard" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: '1rem' }}>
                    Get Started <ArrowRight size={18} />
                </Link>
            </motion.section>
        </div>
    )
}
