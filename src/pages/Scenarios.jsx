import { useState, useMemo } from 'react'
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { FlaskConical, TrendingUp, AlertTriangle, Shield } from 'lucide-react'
import AnimatedPage from '../components/ui/AnimatedPage'
import ChartCard from '../components/ui/ChartCard'

function generateScenarioData(demandSpike, supplyDisruption, leadTimeChange) {
    const baseData = [
        { month: 'Jan', baseline: 4200, stock: 5000 },
        { month: 'Feb', baseline: 4500, stock: 4800 },
        { month: 'Mar', baseline: 5100, stock: 4600 },
        { month: 'Apr', baseline: 4800, stock: 4900 },
        { month: 'May', baseline: 5500, stock: 4400 },
        { month: 'Jun', baseline: 5200, stock: 4700 },
        { month: 'Jul', baseline: 5800, stock: 4200 },
        { month: 'Aug', baseline: 5400, stock: 4500 },
        { month: 'Sep', baseline: 4900, stock: 4800 },
        { month: 'Oct', baseline: 5600, stock: 4300 },
        { month: 'Nov', baseline: 6200, stock: 3900 },
        { month: 'Dec', baseline: 7000, stock: 3500 },
    ]

    return baseData.map(d => {
        const demandMultiplier = 1 + demandSpike / 100
        const supplyMultiplier = 1 - supplyDisruption / 100
        const leadTimeImpact = leadTimeChange * 50

        const scenarioDemand = Math.round(d.baseline * demandMultiplier)
        const scenarioStock = Math.round(
            Math.max(0, (d.stock * supplyMultiplier) - leadTimeImpact)
        )
        const stockout = scenarioDemand > scenarioStock

        return {
            ...d,
            scenarioDemand,
            scenarioStock,
            gap: scenarioStock - scenarioDemand,
            stockout,
        }
    })
}

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
                    {p.name}: {p.value?.toLocaleString()}
                </p>
            ))}
        </div>
    )
}

export default function Scenarios() {
    const [demandSpike, setDemandSpike] = useState(25)
    const [supplyDisruption, setSupplyDisruption] = useState(15)
    const [leadTimeChange, setLeadTimeChange] = useState(3)

    const scenarioData = useMemo(
        () => generateScenarioData(demandSpike, supplyDisruption, leadTimeChange),
        [demandSpike, supplyDisruption, leadTimeChange]
    )

    const stockoutMonths = scenarioData.filter(d => d.stockout).length
    const avgGap = Math.round(scenarioData.reduce((acc, d) => acc + d.gap, 0) / scenarioData.length)
    const worstMonth = scenarioData.reduce((min, d) => d.gap < min.gap ? d : min, scenarioData[0])

    return (
        <AnimatedPage>
            <div className="page-header">
                <h1>Scenario Planning</h1>
                <p>What-if simulation for demand shocks, supply disruptions, and lead time changes.</p>
            </div>

            {/* Sliders */}
            <div className="glass-card" style={{ marginBottom: 28 }}>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>🎛️ Scenario Parameters</h4>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginBottom: 20 }}>
                    Adjust parameters to simulate supply chain stress scenarios
                </p>
                <div className="slider-group">
                    <div className="slider-item">
                        <label>
                            Demand Spike
                            <span>+{demandSpike}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="200"
                            value={demandSpike}
                            onChange={e => setDemandSpike(Number(e.target.value))}
                        />
                    </div>
                    <div className="slider-item">
                        <label>
                            Supply Disruption
                            <span>-{supplyDisruption}%</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="80"
                            value={supplyDisruption}
                            onChange={e => setSupplyDisruption(Number(e.target.value))}
                        />
                    </div>
                    <div className="slider-item">
                        <label>
                            Lead Time Change
                            <span>+{leadTimeChange} days</span>
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="14"
                            value={leadTimeChange}
                            onChange={e => setLeadTimeChange(Number(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            {/* Impact Summary */}
            <div className="kpi-grid">
                <div className="glass-card" style={{ textAlign: 'center', borderTop: `3px solid ${stockoutMonths > 3 ? '#e11d48' : stockoutMonths > 0 ? '#fbbf24' : '#f97316'}` }}>
                    <AlertTriangle size={24} color={stockoutMonths > 3 ? '#e11d48' : stockoutMonths > 0 ? '#fbbf24' : '#f97316'} style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: stockoutMonths > 3 ? '#e11d48' : stockoutMonths > 0 ? '#fbbf24' : '#f97316' }}>
                        {stockoutMonths}
                    </p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stockout Months</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', borderTop: `3px solid ${avgGap < 0 ? '#e11d48' : '#f97316'}` }}>
                    <TrendingUp size={24} color={avgGap < 0 ? '#e11d48' : '#f97316'} style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: avgGap < 0 ? '#e11d48' : '#f97316' }}>
                        {avgGap > 0 ? '+' : ''}{avgGap.toLocaleString()}
                    </p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Stock Gap</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', borderTop: '3px solid #e11d48' }}>
                    <Shield size={24} color="#e11d48" style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: '#e11d48' }}>
                        {worstMonth.month}
                    </p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Worst Month ({worstMonth.gap.toLocaleString()})</p>
                </div>
                <div className="glass-card" style={{ textAlign: 'center', borderTop: '3px solid #f472b6' }}>
                    <FlaskConical size={24} color="#f472b6" style={{ marginBottom: 8 }} />
                    <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: '#f472b6' }}>
                        {Math.round((stockoutMonths / 12) * 100)}%
                    </p>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Risk Score</p>
                </div>
            </div>

            {/* Comparison Charts */}
            <div className="comparison-grid" style={{ marginTop: 28 }}>
                <ChartCard title="Baseline vs Scenario — Demand" subtitle="Original demand projection overlaid with scenario spike">
                    <AreaChart data={scenarioData}>
                        <defs>
                            <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f472b6" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="scenarioGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#e11d48" stopOpacity={0.3} />
                                <stop offset="100%" stopColor="#e11d48" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                        <Area type="monotone" dataKey="baseline" stroke="#f472b6" fill="url(#baseGrad)" strokeWidth={2} name="Baseline Demand" />
                        <Area type="monotone" dataKey="scenarioDemand" stroke="#e11d48" fill="url(#scenarioGrad)" strokeWidth={2} name="Scenario Demand" />
                    </AreaChart>
                </ChartCard>

                <ChartCard title="Stock Gap Analysis" subtitle="Projected inventory surplus/deficit under scenario conditions">
                    <BarChart data={scenarioData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                        <Bar
                            dataKey="gap"
                            name="Stock Gap"
                            radius={[4, 4, 0, 0]}
                            fill="#f43f5e"
                        >
                            {scenarioData.map((entry, idx) => (
                                <rect key={idx} fill={entry.gap < 0 ? '#e11d48' : '#f97316'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ChartCard>
            </div>
        </AnimatedPage>
    )
}
