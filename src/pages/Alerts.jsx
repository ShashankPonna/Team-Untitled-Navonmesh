import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    AlertTriangle, Clock, CheckCircle2, Info, Bell,
    ShieldAlert, Package, Thermometer, Truck
} from 'lucide-react'
import AnimatedPage from '../components/ui/AnimatedPage'

const alertsData = [
    { id: 1, severity: 'critical', icon: ShieldAlert, title: 'Stockout Imminent: SKU-4821', message: 'Wireless Headphones at NYC warehouse — only 2 days of supply remaining. Auto-PO triggered for 500 units.', time: '5 min ago', category: 'stockout' },
    { id: 2, severity: 'critical', icon: Thermometer, title: 'Expiry Critical: SKU-7720', message: 'Artisan Bread Loaf expires tomorrow. 120 units at risk. FEFO rotation applied, priority dispatch initiated.', time: '12 min ago', category: 'expiry' },
    { id: 3, severity: 'warning', icon: Package, title: 'Overstock Alert: SKU-1092', message: 'Organic Coffee Beans at London warehouse — 45 days supply, 350% above optimal. Consider redistribution to Mumbai DC.', time: '28 min ago', category: 'overstock' },
    { id: 4, severity: 'warning', icon: Thermometer, title: 'Expiry Warning: SKU-3390', message: 'Fresh Salmon Fillet expires in 3 days. 300 units across Singapore DC. FEFO queue updated.', time: '1 hr ago', category: 'expiry' },
    { id: 5, severity: 'info', icon: CheckCircle2, title: 'Auto-PO Generated: SKU-7734', message: 'Running Shoes — 500 units ordered from supplier. Estimated delivery in 3 business days to Tokyo Hub.', time: '1 hr ago', category: 'replenishment' },
    { id: 6, severity: 'warning', icon: Truck, title: 'Supplier Delay: PO-2024-0893', message: 'Shipment from Shenzhen Electronics delayed by 2 days. ETA updated. Safety stock buffer activated.', time: '2 hrs ago', category: 'supplier' },
    { id: 7, severity: 'info', icon: CheckCircle2, title: 'Model Retrained Successfully', message: 'Ensemble forecast model retrained on latest 30-day data. Accuracy improved from 85.1% to 87.2% MAPE.', time: '2 hrs ago', category: 'system' },
    { id: 8, severity: 'critical', icon: ShieldAlert, title: 'Stockout Risk: SKU-5567', message: 'Smart Watch Pro at Mumbai — 3 days supply. Demand surge detected (+120%). Emergency PO recommended.', time: '3 hrs ago', category: 'stockout' },
    { id: 9, severity: 'info', icon: Info, title: 'Redistribution Completed', message: 'Transfer of 1,200 units from NYC to Sydney completed. Transit time: 4 days. Stock balanced.', time: '4 hrs ago', category: 'replenishment' },
    { id: 10, severity: 'warning', icon: Package, title: 'Demand Anomaly Detected: SKU-5567', message: 'Unusual demand spike of +120% for Smart Watch Pro in Mumbai region. Investigation recommended.', time: '5 hrs ago', category: 'anomaly' },
]

const categories = [
    { key: 'all', label: 'All Alerts' },
    { key: 'stockout', label: 'Stockout' },
    { key: 'expiry', label: 'Expiry' },
    { key: 'overstock', label: 'Overstock' },
    { key: 'replenishment', label: 'Replenishment' },
    { key: 'supplier', label: 'Supplier' },
    { key: 'anomaly', label: 'Anomaly' },
    { key: 'system', label: 'System' },
]

const severityConfig = {
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
    warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
    info: { color: '#06b6d4', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)' },
}

export default function Alerts() {
    const [filter, setFilter] = useState('all')
    const [severityFilter, setSeverityFilter] = useState('all')

    const filtered = alertsData.filter(a => {
        if (filter !== 'all' && a.category !== filter) return false
        if (severityFilter !== 'all' && a.severity !== severityFilter) return false
        return true
    })

    const criticalCount = alertsData.filter(a => a.severity === 'critical').length
    const warningCount = alertsData.filter(a => a.severity === 'warning').length

    return (
        <AnimatedPage>
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1>Alerts & Notifications</h1>
                        <p>Configurable alert system for stockout risk, overstock, expiry, and supplier delays.</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 12,
                                background: 'rgba(239,68,68,0.15)',
                                border: '1px solid rgba(239,68,68,0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            <Bell size={20} color="#ef4444" />
                            <span style={{
                                position: 'absolute',
                                top: -4,
                                right: -4,
                                width: 18,
                                height: 18,
                                borderRadius: '50%',
                                background: '#ef4444',
                                color: 'white',
                                fontSize: '0.65rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {criticalCount}
                            </span>
                        </motion.div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>{criticalCount} Critical</p>
                            <p style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>{warningCount} Warnings</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Severity Filters */}
            <div className="filter-chips">
                {['all', 'critical', 'warning', 'info'].map(s => (
                    <button
                        key={s}
                        className={`chip ${severityFilter === s ? 'active' : ''}`}
                        onClick={() => setSeverityFilter(s)}
                        style={severityFilter === s && s !== 'all' ? {
                            borderColor: severityConfig[s]?.color,
                            color: severityConfig[s]?.color,
                            background: severityConfig[s]?.bg,
                        } : {}}
                    >
                        {s === 'all' ? 'All Severity' : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Category Filters */}
            <div className="filter-chips">
                {categories.map(c => (
                    <button
                        key={c.key}
                        className={`chip ${filter === c.key ? 'active' : ''}`}
                        onClick={() => setFilter(c.key)}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {/* Alert Feed */}
            <div className="alert-feed">
                <AnimatePresence>
                    {filtered.map((alert) => {
                        const sc = severityConfig[alert.severity]
                        const Icon = alert.icon
                        return (
                            <motion.div
                                key={alert.id}
                                className="alert-item glass-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                style={{
                                    borderLeft: `3px solid ${sc.color}`,
                                }}
                            >
                                <div className={`alert-icon ${alert.severity}`}>
                                    <Icon size={18} />
                                </div>
                                <div className="alert-content" style={{ flex: 1 }}>
                                    <h4>{alert.title}</h4>
                                    <p>{alert.message}</p>
                                </div>
                                <div className="alert-meta">
                                    <span className={`badge ${alert.severity === 'critical' ? 'badge-danger' : alert.severity === 'warning' ? 'badge-warning' : 'badge-info'}`}>
                                        {alert.severity}
                                    </span>
                                    <p className="time" style={{ marginTop: 4 }}>{alert.time}</p>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                {filtered.length === 0 && (
                    <div className="glass-card" style={{ textAlign: 'center', padding: 48 }}>
                        <CheckCircle2 size={40} color="#10b981" style={{ marginBottom: 12 }} />
                        <h4>All Clear</h4>
                        <p style={{ color: 'var(--text-tertiary)' }}>No alerts match the current filters.</p>
                    </div>
                )}
            </div>
        </AnimatedPage>
    )
}
