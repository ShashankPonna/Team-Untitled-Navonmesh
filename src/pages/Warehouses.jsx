import { motion } from 'framer-motion'
import { Building2, MapPin, Truck, ArrowRightLeft } from 'lucide-react'
import AnimatedPage from '../components/ui/AnimatedPage'
import KPICard from '../components/ui/KPICard'
import GlobeScene from '../components/three/GlobeScene'
import { Canvas3DErrorBoundary } from '../components/ui/ErrorBoundary'

const warehouses = [
    { name: 'New York DC', code: 'NYC', stock: 8500, capacity: 12000, daysOfSupply: 14, skus: 3200, status: 'healthy', color: '#f43f5e' },
    { name: 'London Warehouse', code: 'LON', stock: 6200, capacity: 10000, daysOfSupply: 18, skus: 2800, status: 'healthy', color: '#f472b6' },
    { name: 'Tokyo Hub', code: 'TKY', stock: 9800, capacity: 11000, daysOfSupply: 11, skus: 4100, status: 'attention', color: '#f97316' },
    { name: 'Singapore DC', code: 'SGP', stock: 4300, capacity: 8000, daysOfSupply: 22, skus: 1900, status: 'healthy', color: '#fbbf24' },
    { name: 'Mumbai Warehouse', code: 'BOM', stock: 7100, capacity: 9000, daysOfSupply: 9, skus: 2600, status: 'critical', color: '#f472b6' },
    { name: 'Sydney DC', code: 'SYD', stock: 3800, capacity: 6000, daysOfSupply: 16, skus: 1500, status: 'healthy', color: '#e11d48' },
]

const redistributions = [
    { from: 'London', to: 'Mumbai', skus: 12, units: 2400, reason: 'Stockout prevention', priority: 'high', savings: '$18,200' },
    { from: 'Singapore', to: 'Tokyo', skus: 5, units: 800, reason: 'Demand surge', priority: 'medium', savings: '$6,500' },
    { from: 'NYC', to: 'Sydney', skus: 8, units: 1200, reason: 'Seasonal balancing', priority: 'low', savings: '$4,800' },
]

export default function Warehouses() {
    const util = (s, c) => Math.round((s / c) * 100)

    return (
        <AnimatedPage>
            <div className="page-header">
                <h1>Warehouses</h1>
                <p>Multi-node inventory visibility and redistribution intelligence across your global network.</p>
            </div>

            <div className="kpi-grid">
                <KPICard title="Total Warehouses" value="6" change="2 regions" changeType="positive" icon={Building2} gradient="linear-gradient(135deg, #f43f5e, #f472b6)" />
                <KPICard title="Total Stock Units" value="39700" change="3.2% up" changeType="positive" icon={MapPin} gradient="linear-gradient(135deg, #f97316, #fb923c)" />
                <KPICard title="In-Transit Shipments" value="14" change="5 arriving soon" changeType="positive" icon={Truck} gradient="linear-gradient(135deg, #f472b6, #e11d48)" />
                <KPICard title="Rebalance Savings" value="29" suffix="K" change="$29.5K monthly" changeType="positive" icon={ArrowRightLeft} gradient="linear-gradient(135deg, #fbbf24, #e11d48)" />
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
                {warehouses.map((wh, i) => (
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
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{wh.code}</p>
                            </div>
                            <span className={`badge ${wh.status === 'healthy' ? 'badge-success' : wh.status === 'attention' ? 'badge-warning' : 'badge-danger'}`}>
                                {wh.status}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock / Capacity</p>
                                <p style={{ fontWeight: 700, fontFamily: 'Outfit', fontSize: '1.1rem' }}>
                                    {wh.stock.toLocaleString()} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '0.85rem' }}>/ {wh.capacity.toLocaleString()}</span>
                                </p>
                            </div>
                            <div>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Days of Supply</p>
                                <p style={{
                                    fontWeight: 700,
                                    fontFamily: 'Outfit',
                                    fontSize: '1.1rem',
                                    color: wh.daysOfSupply <= 10 ? '#e11d48' : wh.daysOfSupply <= 14 ? '#fbbf24' : '#f97316',
                                }}>
                                    {wh.daysOfSupply}d
                                </p>
                            </div>
                        </div>

                        {/* Utilization bar */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                                <span>Utilization</span>
                                <span style={{ color: wh.color, fontWeight: 600 }}>{util(wh.stock, wh.capacity)}%</span>
                            </div>
                            <div className="gauge-bar">
                                <div
                                    className="gauge-fill"
                                    style={{
                                        width: `${util(wh.stock, wh.capacity)}%`,
                                        background: `linear-gradient(90deg, ${wh.color}, ${wh.color}80)`,
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
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
                        </tr>
                    </thead>
                    <tbody>
                        {redistributions.map((r, i) => (
                            <tr key={i}>
                                <td style={{ fontWeight: 600 }}>{r.from}</td>
                                <td style={{ fontWeight: 600 }}>→ {r.to}</td>
                                <td>{r.skus}</td>
                                <td>{r.units.toLocaleString()}</td>
                                <td style={{ color: 'var(--text-secondary)' }}>{r.reason}</td>
                                <td>
                                    <span className={`badge ${r.priority === 'high' ? 'badge-danger' : r.priority === 'medium' ? 'badge-warning' : 'badge-info'}`}>
                                        {r.priority}
                                    </span>
                                </td>
                                <td style={{ color: '#f97316', fontWeight: 600 }}>{r.savings}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AnimatedPage>
    )
}
