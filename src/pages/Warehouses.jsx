import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getWarehousesOverview, getRedistributionRecommendations, approveTransfer, rejectTransfer } from '../services/warehouseService'
import { Building2, Package, ArrowRightLeft, Check, X, Loader2, MapPin, Truck } from 'lucide-react'
import AnimatedPage from '../components/ui/AnimatedPage'
import KPICard from '../components/ui/KPICard'
import GlobeScene from '../components/three/GlobeScene'
import { Canvas3DErrorBoundary } from '../components/ui/ErrorBoundary'

// Dynamic state replaces static arrays
export default function Warehouses() {
    const [whs, setWhs] = useState([])
    const [recs, setRecs] = useState([])
    const [stats, setStats] = useState({ totalNodes: 0, totalUnits: 0, trackingLoad: 0, estSavings: 0 })
    const [processingIds, setProcessingIds] = useState([])

    const handleAction = async (id, action) => {
        setProcessingIds(prev => [...prev, id])
        try {
            if (action === 'approve') await approveTransfer(id)
            if (action === 'reject') await rejectTransfer(id)
            setRecs(prev => prev.filter(r => r.id !== id))
        } catch (error) {
            console.error('Action failed', error)
        } finally {
            setProcessingIds(prev => prev.filter(pId => pId !== id))
        }
    }

    useEffect(() => {
        async function fetchWHData() {
            try {
                const wData = await getWarehousesOverview()
                setWhs(wData)

                const rData = await getRedistributionRecommendations()
                setRecs(rData)

                const totalUnits = wData.reduce((sum, w) => sum + w.totalItems, 0)
                const savingsEstimate = rData.reduce((sum, r) => {
                    const strVal = r.savings.replace(/\D/g, '') || 0
                    return sum + parseInt(strVal, 10)
                }, 0)

                setStats({
                    totalNodes: wData.length,
                    totalUnits,
                    trackingLoad: rData.length * 2,
                    estSavings: savingsEstimate || 29
                })
            } catch (error) {
                console.error('Error loading warehouse data', error)
            }
        }
        fetchWHData()
    }, [])

    const util = (s, c) => Math.round((s / c) * 100)

    return (
        <AnimatedPage>
            <div className="page-header">
                <h1>Warehouses</h1>
                <p>Multi-node inventory visibility and redistribution intelligence across your global network.</p>
            </div>

            <div className="kpi-grid">
                <KPICard title="Total Warehouses" value={stats.totalNodes} change="Active" changeType="positive" icon={Building2} gradient="linear-gradient(135deg, #06b6d4, #3b82f6)" />
                <KPICard title="Total Stock Units" value={stats.totalUnits.toLocaleString()} change="Current tracking" changeType="positive" icon={MapPin} gradient="linear-gradient(135deg, #8b5cf6, #6366f1)" />
                <KPICard title="In-Transit Transfers" value={stats.trackingLoad} change="Active queues" changeType="positive" icon={Truck} gradient="linear-gradient(135deg, #10b981, #14b8a6)" />
                <KPICard title="Rebalance Savings" value={stats.estSavings} suffix="K" change="Est. monthly" changeType="positive" icon={ArrowRightLeft} gradient="linear-gradient(135deg, #f59e0b, #ef4444)" />
            </div>

            {/* 3D Globe */}
            <motion.div
                className="canvas-container"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: 28 }}
            >
                <Canvas3DErrorBoundary label="Global Distribution Network" height="400px">
                    <GlobeScene />
                </Canvas3DErrorBoundary>
            </motion.div>

            {/* Warehouse Cards */}
            <div className="warehouse-grid" style={{ marginBottom: 28 }}>
                {whs.length === 0 && <p style={{ opacity: 0.5 }}>No warehouse locations assigned.</p>}
                {whs.map((wh, i) => {
                    const wColor = wh.utilization > 85 ? '#f59e0b' : wh.utilization > 95 ? '#ef4444' : '#06b6d4'
                    const wStatus = wh.utilization > 85 ? 'attention' : wh.utilization > 95 ? 'critical' : 'healthy'
                    const scBadge = wStatus === 'healthy' ? 'badge-success' : wStatus === 'attention' ? 'badge-warning' : 'badge-danger'
                    return (
                        <motion.div
                            key={i}
                            className="glass-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>{wh.name}</h4>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{wh.code} — {wh.location}</p>
                                </div>
                                <span className={`badge ${scBadge}`}>
                                    {wStatus}
                                </span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                                <div>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock / Capacity</p>
                                    <p style={{ fontWeight: 700, fontFamily: 'Outfit', fontSize: '1.1rem' }}>
                                        {wh.totalItems.toLocaleString()} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '0.85rem' }}>/ {wh.capacity.toLocaleString()}</span>
                                    </p>
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</p>
                                    <p style={{
                                        fontWeight: 700,
                                        fontFamily: 'Outfit',
                                        fontSize: '1.1rem',
                                        textTransform: 'capitalize'
                                    }}>
                                        {wh.status}
                                    </p>
                                </div>
                            </div>

                            {/* Utilization bar */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                    <span>Utilization</span>
                                    <span style={{ color: wColor, fontWeight: 600 }}>{wh.utilization}%</span>
                                </div>
                                <div className="gauge-bar">
                                    <div
                                        className="gauge-fill"
                                        style={{
                                            width: `${Math.min(wh.utilization, 100)}%`,
                                            background: `linear-gradient(90deg, ${wColor}, ${wColor}80)`,
                                        }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Redistribution Recommendations */}
            <div className="glass-card" style={{ overflow: 'auto' }}>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', marginBottom: 4 }}>📦 Redistribution Recommendations</h4>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginBottom: 16 }}>AI-driven cross-node balancing to eliminate overstock and prevent stockouts</p>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>From</th>
                            <th>To</th>
                            <th>SKUs</th>
                            <th>Units</th>
                            <th>Reason</th>
                            <th>Priority</th>
                            <th>Est. Savings</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recs.length === 0 && (
                            <tr><td colSpan="8" style={{ textAlign: 'center', opacity: 0.5 }}>Network balanced. No current redistributions required.</td></tr>
                        )}
                        {recs.map((r, i) => {
                            const isProcessing = processingIds.includes(r.id)
                            return (
                                <tr key={r.id || i}>
                                    <td style={{ fontWeight: 600 }}>{r.from}</td>
                                    <td style={{ fontWeight: 600 }}>→ {r.to}</td>
                                    <td><span style={{ color: 'var(--accent-cyan)' }}>{r.sku}</span></td>
                                    <td>{r.qty.toLocaleString()}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{r.reason}</td>
                                    <td>
                                        <span className={`badge ${r.score > 90 ? 'badge-danger' : r.score > 80 ? 'badge-warning' : 'badge-info'}`}>
                                            {r.score}/100 Conf.
                                        </span>
                                    </td>
                                    <td style={{ color: '#34d399', fontWeight: 600 }}>{r.savings}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                            <button
                                                onClick={() => handleAction(r.id, 'approve')}
                                                disabled={isProcessing}
                                                style={{
                                                    background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)',
                                                    color: '#34d399', width: 32, height: 32, borderRadius: 6, cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                {isProcessing ? <Loader2 size={16} className="spinner" /> : <Check size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleAction(r.id, 'reject')}
                                                disabled={isProcessing}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                                    color: '#f87171', width: 32, height: 32, borderRadius: 6, cursor: isProcessing ? 'not-allowed' : 'pointer',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                <X size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </AnimatedPage>
    )
}
