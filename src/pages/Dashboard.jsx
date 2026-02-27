import { useState, useEffect } from 'react'
import { getDashboardKPIs, getWarehouseUtilization, getRecentAlerts } from '../services/dashboardService'
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import {
    TrendingDown, TrendingUp, Package, DollarSign,
    AlertTriangle, Clock, CheckCircle2
} from 'lucide-react'
import AnimatedPage from '../components/ui/AnimatedPage'
import KPICard from '../components/ui/KPICard'
import ChartCard from '../components/ui/ChartCard'

const demandSupplyData = [
    { day: 'Jan 1', demand: 420, supply: 450, forecast: 410 },
    { day: 'Jan 5', demand: 380, supply: 430, forecast: 390 },
    { day: 'Jan 10', demand: 510, supply: 460, forecast: 480 },
    { day: 'Jan 15', demand: 590, supply: 520, forecast: 560 },
    { day: 'Jan 20', demand: 470, supply: 500, forecast: 480 },
    { day: 'Jan 25', demand: 620, supply: 550, forecast: 600 },
    { day: 'Feb 1', demand: 680, supply: 610, forecast: 650 },
    { day: 'Feb 5', demand: 540, supply: 580, forecast: 550 },
    { day: 'Feb 10', demand: 490, supply: 530, forecast: 500 },
    { day: 'Feb 15', demand: 720, supply: 640, forecast: 690 },
    { day: 'Feb 20', demand: 610, supply: 620, forecast: 600 },
    { day: 'Feb 25', demand: 550, supply: 570, forecast: 540 },
]

// Using original mock charts temporarily until historical tables are fully seeded.
const warehouseData = [
    { name: 'NYC', stock: 8500, capacity: 12000 },
    { name: 'London', stock: 6200, capacity: 10000 },
    { name: 'Tokyo', stock: 9800, capacity: 11000 },
    { name: 'Singapore', stock: 4300, capacity: 8000 },
    { name: 'Mumbai', stock: 7100, capacity: 9000 },
    { name: 'Sydney', stock: 3800, capacity: 6000 },
]

const categoryData = [
    { name: 'Electronics', value: 35, color: '#06b6d4' },
    { name: 'Perishables', value: 22, color: '#8b5cf6' },
    { name: 'Apparel', value: 18, color: '#3b82f6' },
    { name: 'Home & Garden', value: 15, color: '#10b981' },
    { name: 'Other', value: 10, color: '#64748b' },
]

// Removed static recent alerts
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: 'rgba(24, 24, 27, 0.95)',
            border: '1px solid rgba(148,163,184,0.15)',
            borderRadius: 10,
            padding: '12px 16px',
            backdropFilter: 'blur(8px)',
        }}>
            <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: 6 }}>{label}</p>
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color, fontSize: '0.85rem', fontWeight: 600 }}>
                    {p.name}: {p.value.toLocaleString()}
                </p>
            ))}
        </div>
    )
}

export default function Dashboard() {
    const [kpis, setKpis] = useState({
        inventoryValue: 0,
        activeAlerts: 0,
        autoOrders: 0,
        forecastAccuracy: 87,
        stockoutRate: 10.2
    })
    const [alerts, setAlerts] = useState([])
    const [warehouses, setWarehouses] = useState(warehouseData)

    useEffect(() => {
        async function fetchDashboard() {
            try {
                const data = await getDashboardKPIs()
                setKpis(data)

                const recentAlerts = await getRecentAlerts()
                if (recentAlerts.length > 0) setAlerts(recentAlerts)
                else setAlerts([
                    { type: 'critical', message: 'Stockout risk: SKU-4821 (NYC) — 2 days supply remaining', time: '5 min ago' },
                    { type: 'warning', message: 'Overstock detected: SKU-1092 (London) — 45 days supply', time: '12 min ago' }
                ])

                const whData = await getWarehouseUtilization()
                if (whData.length > 0) setWarehouses(whData)

            } catch (error) {
                console.error('Failed to load dashboard data:', error)
            }
        }
        fetchDashboard()
    }, [])

    return (
        <AnimatedPage>
            <div className="page-header">
                <h1>Dashboard</h1>
                <p>Real-time inventory intelligence across your entire supply chain.</p>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid">
                <KPICard
                    title="Stockout Rate"
                    value={kpis.stockoutRate}
                    suffix="%"
                    change="7.8%"
                    changeType="positive"
                    icon={TrendingDown}
                    gradient="linear-gradient(135deg, #ef4444, #f59e0b)"
                />
                <KPICard
                    title="Forecast Accuracy"
                    value={kpis.forecastAccuracy}
                    suffix="%"
                    change="4.2%"
                    changeType="positive"
                    icon={TrendingUp}
                    gradient="linear-gradient(135deg, #06b6d4, #3b82f6)"
                />
                <KPICard
                    title="Inventory Total"
                    value={kpis.inventoryValue.toLocaleString()}
                    suffix=""
                    change=""
                    changeType="negative"
                    icon={DollarSign}
                    gradient="linear-gradient(135deg, #8b5cf6, #6366f1)"
                />
                <KPICard
                    title="Auto Orders"
                    value={kpis.autoOrders}
                    suffix=""
                    change=""
                    changeType="positive"
                    icon={Package}
                    gradient="linear-gradient(135deg, #10b981, #14b8a6)"
                />
            </div>

            {/* Charts Row */}
            <div className="charts-grid">
                <ChartCard title="Demand vs Supply" subtitle="30-day rolling comparison with forecast overlay">
                    <AreaChart data={demandSupplyData}>
                        <defs>
                            <linearGradient id="demandGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="supplyGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }} />
                        <Area type="monotone" dataKey="demand" stroke="#06b6d4" fill="url(#demandGradient)" strokeWidth={2} name="Demand" />
                        <Area type="monotone" dataKey="supply" stroke="#8b5cf6" fill="url(#supplyGradient)" strokeWidth={2} name="Supply" />
                        <Area type="monotone" dataKey="forecast" stroke="#f59e0b" fill="none" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                    </AreaChart>
                </ChartCard>

                <ChartCard title="Stock by Warehouse" subtitle="Current utilization across distribution nodes">
                    <BarChart data={warehouses} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }} />
                        <Bar dataKey="stock" name="Current Stock" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="capacity" name="Capacity" fill="#1e293b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartCard>
            </div>

            {/* Bottom Row */}
            <div className="charts-grid">
                <ChartCard title="Inventory by Category" subtitle="Distribution of stock value by product category" height={280}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {categoryData.map((entry, i) => (
                                <Cell key={i} fill={entry.color} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '0.8rem', color: '#94a3b8' }}
                            formatter={(value) => <span style={{ color: '#94a3b8' }}>{value}</span>}
                        />
                    </PieChart>
                </ChartCard>

                {/* Recent Alerts */}
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', marginBottom: 4 }}>Recent Alerts</h4>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>Latest system notifications</p>
                        </div>
                        <span className="badge badge-danger" style={{ animation: 'pulse-glow 2s infinite' }}>{kpis.activeAlerts} Active</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                        {alerts.map((alert, i) => (
                            <div key={i} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 10,
                                padding: '10px 12px',
                                borderRadius: 8,
                                background: 'rgba(24, 24, 27, 0.4)',
                                border: '1px solid rgba(148,163,184,0.05)',
                            }}>
                                {alert.type === 'critical' ? <AlertTriangle size={16} color="#f87171" style={{ marginTop: 2, flexShrink: 0 }} /> :
                                    alert.type === 'warning' ? <Clock size={16} color="#fbbf24" style={{ marginTop: 2, flexShrink: 0 }} /> :
                                        <CheckCircle2 size={16} color="#22d3ee" style={{ marginTop: 2, flexShrink: 0 }} />}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{alert.message}</p>
                                    <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: 2 }}>{alert.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AnimatedPage>
    )
}
