import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllAlerts } from '../services/alertService'
import {
    AlertTriangle, Clock, CheckCircle2, Info, Bell,
    ShieldAlert, Package, Thermometer, Truck
} from 'lucide-react'
import AnimatedPage from '../components/ui/AnimatedPage'

// Data loaded dynamically
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
    critical: { color: '#f87171', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)' },
    warning: { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
    info: { color: '#22d3ee', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)' },
}

export default function Alerts() {
    const [filter, setFilter] = useState('all')
    const [severityFilter, setSeverityFilter] = useState('all')
    const [alertsData, setAlertsData] = useState([])

    useEffect(() => {
        async function fetchAlerts() {
            const data = await getAllAlerts()
            setAlertsData(data)
        }
        fetchAlerts()
    }, [])

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
                                background: 'rgba(239,68,68,0.12)',
                                border: '1px solid rgba(239,68,68,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                            }}
                        >
                            <Bell size={20} color="#f87171" />
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
                            <p style={{ fontSize: '0.8rem', color: '#f87171', fontWeight: 600 }}>{criticalCount} Critical</p>
                            <p style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>{warningCount} Warnings</p>
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
                        <CheckCircle2 size={40} color="#22d3ee" style={{ marginBottom: 12 }} />
                        <h4>All Clear</h4>
                        <p style={{ color: 'var(--text-tertiary)' }}>No alerts match the current filters.</p>
                    </div>
                )}
            </div>
        </AnimatedPage>
    )
}
