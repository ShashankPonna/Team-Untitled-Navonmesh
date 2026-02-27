import { useState, useEffect } from 'react'
import { getForecastData, getForecastModels, getAnomalies } from '../services/forecastingService'
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { Brain, Activity, Clock, Award } from 'lucide-react'
import AnimatedPage from '../components/ui/AnimatedPage'
import KPICard from '../components/ui/KPICard'
import ChartCard from '../components/ui/ChartCard'

// Dynamic state will replace static consts
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

export default function Forecasting() {
    const [horizon, setHorizon] = useState('7')
    const [forecastSeries, setForecastSeries] = useState([])
    const [models, setModels] = useState([])
    const [anomalyList, setAnomalyList] = useState([])
    const [stats, setStats] = useState({ accuracy: 0, anomalies: 0, leadTime: 0, bestModel: '' })

    useEffect(() => {
        async function fetchForecastingDashboard() {
            try {
                // Number interpretation
                const hDays = parseInt(horizon)

                const series = await getForecastData(hDays)
                setForecastSeries(series)

                const mdls = await getForecastModels()
                setModels(mdls)

                const anoms = await getAnomalies()
                setAnomalyList(anoms)

                // Simple metric derivation
                const best = mdls.reduce((prev, current) => (prev.accuracy > current.accuracy) ? prev : current, { accuracy: 0, name: 'None' })

                setStats({
                    accuracy: best.accuracy?.toFixed(1) || 0,
                    anomalies: anoms.length,
                    leadTime: 3.2, // Still mock or calculated via supply chain table
                    bestModel: best.name?.split(' ')[0] || 'Unknown'
                })
            } catch (e) { console.error('Error on forecasting screen:', e) }
        }
        fetchForecastingDashboard()
    }, [horizon])

    return (
        <AnimatedPage>
            <div className="page-header">
                <h1>Demand Forecasting</h1>
                <p>Multi-model ensemble predictions with anomaly detection and SKU-level accuracy.</p>
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
                <KPICard title="Forecast Accuracy" value={stats.accuracy} suffix="%" change="Calculated" changeType="positive" icon={Brain} gradient="linear-gradient(135deg, #06b6d4, #3b82f6)" />
                <KPICard title="Anomalies Detected" value={stats.anomalies} change="Since Yesterday" changeType="negative" icon={Activity} gradient="linear-gradient(135deg, #ef4444, #f59e0b)" />
                <KPICard title="Avg Lead Time" value={stats.leadTime} suffix="d" change="1.8d" changeType="positive" icon={Clock} gradient="linear-gradient(135deg, #8b5cf6, #6366f1)" />
                <KPICard title="Best Model" value={stats.bestModel} suffix="" change="Auto-selected" changeType="positive" icon={Award} gradient="linear-gradient(135deg, #10b981, #14b8a6)" />
            </div>

            {/* Horizon Selector */}
            <div className="filter-chips" style={{ marginBottom: 20 }}>
                {['7', '30', '90'].map(h => (
                    <button
                        key={h}
                        className={`chip ${horizon === h ? 'active' : ''}`}
                        onClick={() => setHorizon(h)}
                    >
                        {h} Days
                    </button>
                ))}
            </div>

            {/* Forecast Chart */}
            <div className="charts-grid">
                <ChartCard title="Model Comparison" subtitle={`${horizon}-day forecast: LSTM vs Prophet vs XGBoost`}>
                    <LineChart data={forecastSeries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                        <Line type="monotone" dataKey="lstm" stroke="#8b5cf6" strokeWidth={2.5} dot={false} name="LSTM" />
                        <Line type="monotone" dataKey="prophet" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Prophet" />
                        <Line type="monotone" dataKey="xgboost" stroke="#06b6d4" strokeWidth={1.5} dot={false} name="XGBoost" />
                    </LineChart>
                </ChartCard>

                {/* Model Leaderboard */}
                <div className="glass-card">
                    <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', marginBottom: 4 }}>Model Leaderboard</h4>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginBottom: 16 }}>Auto-selected by validation score</p>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Model</th>
                                <th>MAPE</th>
                                <th>RMSE</th>
                                <th>R²</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {models.length === 0 && (
                                <tr><td colSpan="5" style={{ textAlign: 'center', opacity: 0.5 }}>No forecast models mapped in system.</td></tr>
                            )}
                            {models.map((m, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600 }}>{m.name}</td>
                                    <td>{(100 - m.accuracy).toFixed(2)}%</td>
                                    <td>-</td>
                                    <td>-</td>
                                    <td>
                                        <span className={`badge ${m.status.includes('Primary') ? 'badge-success' : m.status.includes('Active') ? 'badge-info' : 'badge-warning'}`}>
                                            {m.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Anomaly Timeline */}
            <div className="glass-card" style={{ marginTop: 24 }}>
                <h4 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.05rem', marginBottom: 4 }}>Anomaly Detection Timeline</h4>
                <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem', marginBottom: 16 }}>Real-time demand anomalies flagged within 15 minutes of ingestion</p>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>SKU</th>
                            <th>Type</th>
                            <th>Magnitude</th>
                            <th>Confidence</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {anomalyList.length === 0 && (
                            <tr><td colSpan="6" style={{ textAlign: 'center', opacity: 0.5 }}>No anomalies detected.</td></tr>
                        )}
                        {anomalyList.map((a, i) => (
                            <tr key={i}>
                                <td style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{a.date}</td>
                                <td style={{ fontWeight: 600 }}>{a.sku}</td>
                                <td>
                                    <span className={`badge ${a.type === 'Spike' ? 'badge-danger' : 'badge-warning'}`}>
                                        {a.type === 'Spike' ? '↑ Spike' : '↓ Drop'}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600, color: a.type === 'Spike' ? '#f87171' : '#fbbf24' }}>-</td>
                                <td>-</td>
                                <td>
                                    <span className={`badge ${a.impact === 'High' ? 'badge-danger' : 'badge-warning'}`}>
                                        {a.impact}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AnimatedPage>
    )
}
