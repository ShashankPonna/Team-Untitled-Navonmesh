import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getInventoryList, getPerishables, addProduct } from '../services/inventoryService'
import { Package, ShieldAlert, Clock, Thermometer, Plus, X, Loader2 } from 'lucide-react'
import AnimatedPage from '../components/ui/AnimatedPage'
import KPICard from '../components/ui/KPICard'
import WarehouseScene from '../components/three/WarehouseScene'
import { Canvas3DErrorBoundary } from '../components/ui/ErrorBoundary'

// Dynamic state will replace these

const statusConfig = {
    critical: { color: '#f87171', bg: 'rgba(239,68,68,0.12)', label: 'Stockout Risk' },
    overstock: { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', label: 'Overstock' },
    optimal: { color: '#34d399', bg: 'rgba(16,185,129,0.12)', label: 'Optimal' },
    expiring: { color: '#f87171', bg: 'rgba(239,68,68,0.12)', label: 'Expiring' },
}

export default function Inventory() {
    const [inventoryItems, setInventoryItems] = useState([])
    const [perishables, setPerishables] = useState([])
    const [stats, setStats] = useState({ total: 0, critical: 0, avgSupply: 0, expiryAlerts: 0 })

    // Modal State
    const [isAddProductOpen, setIsAddProductOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [productForm, setProductForm] = useState({ sku: '', name: '', category: 'General', unitPrice: 0, isPerishable: false })

    const handleAddProduct = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            await addProduct(productForm)
            setIsAddProductOpen(false)
            setProductForm({ sku: '', name: '', category: 'General', unitPrice: 0, isPerishable: false })
            // Re-fetch
            const inv = await getInventoryList()
            setInventoryItems(inv)
        } catch (error) {
            console.error(error)
            alert('Failed to add product: ' + error.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        async function fetchInventory() {
            const inv = await getInventoryList()
            const per = await getPerishables()

            setInventoryItems(inv)
            setPerishables(per)

            // Calculate KPIs
            const total = inv.length
            const critical = inv.filter(i => i.status === 'critical').length
            const sumSupply = inv.reduce((sum, item) => sum + item.daysOfSupply, 0)
            const avgSupply = total > 0 ? Math.round(sumSupply / total) : 0
            const expiryAlerts = per.filter(p => p.daysLeft <= 3).length

            setStats({ total, critical, avgSupply, expiryAlerts })
        }
        fetchInventory()
    }, [])

    return (
        <AnimatedPage>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1>Inventory Deep-Dive</h1>
                    <p>Real-time tracking of safety stock, lead times, and FEFO expiry prioritization.</p>
                </div>
                <button
                    onClick={() => setIsAddProductOpen(true)}
                    style={{
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 16px',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 14px rgba(6,182,212,0.3)',
                        transition: 'transform 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <Plus size={18} /> Add Product
                </button>
            </div>

            <div className="kpi-grid">
                <KPICard title="Total SKUs Tracked" value={stats.total} change="" changeType="positive" icon={Package} gradient="linear-gradient(135deg, #06b6d4, #3b82f6)" />
                <KPICard title="Stockout Risks" value={stats.critical} change="" changeType="negative" icon={ShieldAlert} gradient="linear-gradient(135deg, #ef4444, #f59e0b)" />
                <KPICard title="Avg Days of Supply" value={stats.avgSupply} suffix="d" change="" changeType="positive" icon={Clock} gradient="linear-gradient(135deg, #8b5cf6, #6366f1)" />
                <KPICard title="Expiry Alerts" value={stats.expiryAlerts} change="Urgent" changeType="negative" icon={Thermometer} gradient="linear-gradient(135deg, #ef4444, #8b5cf6)" />
            </div>

            {/* 3D Warehouse */}
            <motion.div
                className="canvas-container"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: 28 }}
            >
                <Canvas3DErrorBoundary label="Warehouse Visualization" height="400px">
                    <WarehouseScene />
                </Canvas3DErrorBoundary>
            </motion.div>

            {/* Inventory Table */}
            <div className="glass-card" style={{ marginBottom: 24, overflow: 'auto' }}>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', marginBottom: 4 }}>Reorder Points & Safety Stock</h4>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginBottom: 16 }}>Dynamic calculations based on lead time, demand variability, and service level targets</p>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Product</th>
                            <th>Warehouse</th>
                            <th>Stock</th>
                            <th>ROP</th>
                            <th>Safety Stock</th>
                            <th>Days Supply</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventoryItems.length === 0 && (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '32px 0', opacity: 0.5 }}>No inventory data available yet. Add products to Supabase.</td></tr>
                        )}
                        {inventoryItems.map((item, i) => {
                            const sc = statusConfig[item.status] || statusConfig.optimal
                            return (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>{item.sku}</td>
                                    <td>{item.name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{item.warehouse}</td>
                                    <td style={{ fontWeight: 600 }}>{item.stock?.toLocaleString()}</td>
                                    <td>{item.rop?.toLocaleString()}</td>
                                    <td>{item.safety}</td>
                                    <td>
                                        <span style={{ fontWeight: 600, color: item.daysOfSupply <= 3 ? '#f87171' : item.daysOfSupply <= 7 ? '#fbbf24' : '#34d399' }}>
                                            {item.daysOfSupply}d
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{
                                            display: 'inline-flex',
                                            padding: '4px 10px',
                                            borderRadius: 9999,
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            color: sc.color,
                                            background: sc.bg,
                                            border: `1px solid ${sc.color}30`,
                                        }}>
                                            {sc.label}
                                        </span>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Perishable Tracker */}
            <div className="glass-card" style={{ overflow: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', marginBottom: 4 }}>🧊 Perishable Goods — FIFO/FEFO Tracker</h4>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>Expiry alerts at 7, 3, and 1 day intervals</p>
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>Product</th>
                            <th>Batch</th>
                            <th>Expiry</th>
                            <th>Days Left</th>
                            <th>Rotation</th>
                            <th>Markdown</th>
                            <th>Alert</th>
                        </tr>
                    </thead>
                    <tbody>
                        {perishables.length === 0 ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '32px 0', opacity: 0.5 }}>No perishable tracking data yet.</td></tr>
                        ) : (
                            perishables.map((p, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>{p.sku}</td>
                                    <td>{p.name}</td>
                                    <td style={{ color: 'var(--text-tertiary)' }}>{p.batch}</td>
                                    <td>{new Date(p.expiry).toLocaleDateString()}</td>
                                    <td>
                                        <span style={{
                                            fontWeight: 700,
                                            color: p.daysLeft <= 1 ? '#f87171' : p.daysLeft <= 3 ? '#fbbf24' : p.daysLeft <= 7 ? '#fb923c' : '#34d399',
                                            fontSize: '0.95rem',
                                        }}>
                                            {p.daysLeft}d
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge badge-info">{p.method}</span>
                                    </td>
                                    <td>
                                        {p.markdown > 0 ? (
                                            <span style={{ color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                ↓ {p.markdown}%
                                            </span>
                                        ) : (
                                            <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                                        )}
                                    </td>
                                    <td>
                                        {p.daysLeft <= 1 ? (
                                            <span className="badge badge-danger" style={{ animation: 'pulse-glow 1.5s infinite' }}>🔴 CRITICAL</span>
                                        ) : p.daysLeft <= 3 ? (
                                            <span className="badge badge-warning">⚠️ URGENT</span>
                                        ) : (
                                            <span className="badge badge-success">✓ OK</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Product Modal */}
            <AnimatePresence>
                {isAddProductOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(15,23,42,0.8)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 1000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 24
                        }}
                        onClick={() => setIsAddProductOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            style={{
                                background: '#1e293b',
                                border: '1px solid rgba(148,163,184,0.1)',
                                borderRadius: 16,
                                padding: 32,
                                width: '100%',
                                maxWidth: 480,
                                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem' }}>Add New Product</h3>
                                <button
                                    onClick={() => setIsAddProductOpen(false)}
                                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddProduct}>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 8 }}>SKU Code</label>
                                    <input
                                        type="text"
                                        required
                                        value={productForm.sku}
                                        onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', color: 'white' }}
                                        placeholder="e.g. SKU-1001"
                                    />
                                </div>
                                <div style={{ marginBottom: 16 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 8 }}>Product Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={productForm.name}
                                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', color: 'white' }}
                                        placeholder="Type product name"
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 8 }}>Category</label>
                                        <input
                                            type="text"
                                            value={productForm.category}
                                            onChange={e => setProductForm({ ...productForm, category: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', color: 'white' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: 8 }}>Unit Price ($)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={productForm.unitPrice}
                                            onChange={e => setProductForm({ ...productForm, unitPrice: e.target.value })}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: 8, background: '#0f172a', border: '1px solid rgba(148,163,184,0.2)', color: 'white' }}
                                        />
                                    </div>
                                </div>
                                <div style={{ marginBottom: 32 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={productForm.isPerishable}
                                            onChange={e => setProductForm({ ...productForm, isPerishable: e.target.checked })}
                                            style={{ width: 18, height: 18, accentColor: '#06b6d4' }}
                                        />
                                        <span style={{ fontSize: '0.9rem', color: '#e2e8f0' }}>Is this item highly perishable?</span>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: '12px',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 8,
                                        opacity: isSubmitting ? 0.7 : 1
                                    }}
                                >
                                    {isSubmitting ? <Loader2 className="spinner" size={18} /> : 'Save Product'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AnimatedPage >
    )
}
