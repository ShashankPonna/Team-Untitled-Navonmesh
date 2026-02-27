import { motion } from 'framer-motion'
import { Package, ShieldAlert, Clock, Thermometer } from 'lucide-react'
import AnimatedPage from '../components/ui/AnimatedPage'
import KPICard from '../components/ui/KPICard'
import WarehouseScene from '../components/three/WarehouseScene'
import { Canvas3DErrorBoundary } from '../components/ui/ErrorBoundary'

const inventoryItems = [
    { sku: 'SKU-4821', name: 'Wireless Headphones', warehouse: 'NYC', stock: 120, rop: 200, safety: 80, status: 'critical', daysOfSupply: 2 },
    { sku: 'SKU-1092', name: 'Organic Coffee Beans', warehouse: 'London', stock: 4500, rop: 1000, safety: 400, status: 'overstock', daysOfSupply: 45 },
    { sku: 'SKU-7734', name: 'Running Shoes', warehouse: 'Tokyo', stock: 890, rop: 600, safety: 250, status: 'optimal', daysOfSupply: 14 },
    { sku: 'SKU-3390', name: 'Fresh Salmon Fillet', warehouse: 'Singapore', stock: 300, rop: 150, safety: 60, status: 'expiring', daysOfSupply: 8 },
    { sku: 'SKU-5567', name: 'Smart Watch Pro', warehouse: 'Mumbai', stock: 45, rop: 100, safety: 40, status: 'critical', daysOfSupply: 3 },
    { sku: 'SKU-8923', name: 'Bottled Water 24pk', warehouse: 'NYC', stock: 2200, rop: 800, safety: 300, status: 'optimal', daysOfSupply: 18 },
    { sku: 'SKU-6641', name: 'Bluetooth Speaker', warehouse: 'Sydney', stock: 670, rop: 500, safety: 200, status: 'optimal', daysOfSupply: 12 },
    { sku: 'SKU-2205', name: 'Greek Yogurt 6pk', warehouse: 'London', stock: 180, rop: 200, safety: 80, status: 'expiring', daysOfSupply: 4 },
]

const perishables = [
    { sku: 'SKU-3390', name: 'Fresh Salmon Fillet', expiry: '2024-02-20', daysLeft: 3, method: 'FEFO', batch: 'B-2024-0215' },
    { sku: 'SKU-2205', name: 'Greek Yogurt 6pk', expiry: '2024-02-22', daysLeft: 5, method: 'FIFO', batch: 'B-2024-0210' },
    { sku: 'SKU-9081', name: 'Organic Milk 1L', expiry: '2024-02-19', daysLeft: 2, method: 'FEFO', batch: 'B-2024-0216' },
    { sku: 'SKU-4455', name: 'Baby Spinach 500g', expiry: '2024-02-24', daysLeft: 7, method: 'FIFO', batch: 'B-2024-0212' },
    { sku: 'SKU-7720', name: 'Artisan Bread Loaf', expiry: '2024-02-18', daysLeft: 1, method: 'FEFO', batch: 'B-2024-0217' },
]

const statusConfig = {
    critical: { color: '#f87171', bg: 'rgba(239,68,68,0.12)', label: 'Stockout Risk' },
    overstock: { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', label: 'Overstock' },
    optimal: { color: '#34d399', bg: 'rgba(16,185,129,0.12)', label: 'Optimal' },
    expiring: { color: '#f87171', bg: 'rgba(239,68,68,0.12)', label: 'Expiring' },
}

export default function Inventory() {
    return (
        <AnimatedPage>
            <div className="page-header">
                <h1>Inventory</h1>
                <p>Dynamic safety stock, reorder point calculator, and perishable goods management.</p>
            </div>

            <div className="kpi-grid">
                <KPICard title="Total SKUs Tracked" value="24850" change="320 new" changeType="positive" icon={Package} gradient="linear-gradient(135deg, #06b6d4, #3b82f6)" />
                <KPICard title="Stockout Risks" value="12" change="3 critical" changeType="negative" icon={ShieldAlert} gradient="linear-gradient(135deg, #ef4444, #f59e0b)" />
                <KPICard title="Avg Days of Supply" value="14" suffix="d" change="2.1d improved" changeType="positive" icon={Clock} gradient="linear-gradient(135deg, #8b5cf6, #6366f1)" />
                <KPICard title="Expiry Alerts" value="8" change="2 urgent" changeType="negative" icon={Thermometer} gradient="linear-gradient(135deg, #ef4444, #8b5cf6)" />
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
                        {inventoryItems.map((item, i) => {
                            const sc = statusConfig[item.status]
                            return (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>{item.sku}</td>
                                    <td>{item.name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{item.warehouse}</td>
                                    <td style={{ fontWeight: 600 }}>{item.stock.toLocaleString()}</td>
                                    <td>{item.rop.toLocaleString()}</td>
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
                            <th>Alert</th>
                        </tr>
                    </thead>
                    <tbody>
                        {perishables.map((p, i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 600, color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>{p.sku}</td>
                                <td>{p.name}</td>
                                <td style={{ color: 'var(--text-tertiary)' }}>{p.batch}</td>
                                <td>{p.expiry}</td>
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
                                    {p.daysLeft <= 1 ? (
                                        <span className="badge badge-danger" style={{ animation: 'pulse-glow 1.5s infinite' }}>🔴 CRITICAL</span>
                                    ) : p.daysLeft <= 3 ? (
                                        <span className="badge badge-warning">⚠️ URGENT</span>
                                    ) : (
                                        <span className="badge badge-success">✓ OK</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AnimatedPage>
    )
}
