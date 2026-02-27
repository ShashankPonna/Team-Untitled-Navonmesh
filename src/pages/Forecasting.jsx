import { useState } from 'react'
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import { Brain, Activity, Clock, Award } from 'lucide-react'
import AnimatedPage from '../components/ui/AnimatedPage'
import KPICard from '../components/ui/KPICard'
import ChartCard from '../components/ui/ChartCard'

const forecastData = {
    '7': [
        { day: 'Mon', arima: 420, xgboost: 435, lstm: 440, actual: 430 },
        { day: 'Tue', arima: 390, xgboost: 410, lstm: 405, actual: 400 },
        { day: 'Wed', arima: 480, xgboost: 470, lstm: 485, actual: 475 },
        { day: 'Thu', arima: 510, xgboost: 520, lstm: 515, actual: 518 },
        { day: 'Fri', arima: 460, xgboost: 475, lstm: 470, actual: 465 },
        { day: 'Sat', arima: 550, xgboost: 560, lstm: 555, actual: 558 },
        { day: 'Sun', arima: 380, xgboost: 390, lstm: 385, actual: 388 },
    ],
    '30': [
        { day: 'W1', arima: 2800, xgboost: 2900, lstm: 2870, actual: 2850 },
        { day: 'W2', arima: 3100, xgboost: 3050, lstm: 3080, actual: 3060 },
        { day: 'W3', arima: 2650, xgboost: 2750, lstm: 2700, actual: 2720 },
        { day: 'W4', arima: 3400, xgboost: 3350, lstm: 3380, actual: 3370 },
    ],
    '90': [
        { day: 'Jan', arima: 12000, xgboost: 12500, lstm: 12300, actual: 12200 },
        { day: 'Feb', arima: 11500, xgboost: 11800, lstm: 11700, actual: 11600 },
        { day: 'Mar', arima: 13200, xgboost: 13000, lstm: 13100, actual: 13050 },
    ],
}

const anomalies = [
    { time: '2024-02-15 09:23', sku: 'SKU-4821', type: 'spike', magnitude: '+85%', confidence: '94%', status: 'confirmed' },
    { time: '2024-02-14 16:12', sku: 'SKU-1092', type: 'drop', magnitude: '-42%', confidence: '88%', status: 'investigating' },
    { time: '2024-02-14 11:45', sku: 'SKU-7734', type: 'spike', magnitude: '+56%', confidence: '91%', status: 'resolved' },
    { time: '2024-02-13 20:30', sku: 'SKU-3390', type: 'drop', magnitude: '-31%', confidence: '82%', status: 'confirmed' },
    { time: '2024-02-13 08:15', sku: 'SKU-5567', type: 'spike', magnitude: '+120%', confidence: '97%', status: 'confirmed' },
]

const modelLeaderboard = [
    { model: 'XGBoost', mape: '12.3%', rmse: '45.2', r2: '0.94', status: 'active' },
    { model: 'LSTM', mape: '13.1%', rmse: '48.7', r2: '0.93', status: 'active' },
    { model: 'ARIMA', mape: '16.8%', rmse: '52.1', r2: '0.89', status: 'standby' },
    { model: 'Ensemble', mape: '10.9%', rmse: '40.3', r2: '0.96', status: 'primary' },
]

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

    return (
        <AnimatedPage>
            <div className="page-header">
                <h1>Demand Forecasting</h1>
                <p>Multi-model ensemble predictions with anomaly detection and SKU-level accuracy.</p>
            </div>

            {/* KPIs */}
            <div className="kpi-grid">
                <KPICard title="Forecast Accuracy" value="87" suffix="%" change="4.2%" changeType="positive" icon={Brain} gradient="linear-gradient(135deg, #06b6d4, #3b82f6)" />
                <KPICard title="Anomalies Detected" value="14" change="3 new" changeType="negative" icon={Activity} gradient="linear-gradient(135deg, #ef4444, #f59e0b)" />
                <KPICard title="Avg Lead Time" value="3.2" suffix="d" change="1.8d" changeType="positive" icon={Clock} gradient="linear-gradient(135deg, #8b5cf6, #6366f1)" />
                <KPICard title="Best Model" value="96" suffix="%" change="Ensemble" changeType="positive" icon={Award} gradient="linear-gradient(135deg, #10b981, #14b8a6)" />
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
                <ChartCard title="Model Comparison" subtitle={`${horizon}-day forecast: ARIMA vs XGBoost vs LSTM vs Actual`}>
                    <LineChart data={forecastData[horizon]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                        <Line type="monotone" dataKey="actual" stroke="#f1f5f9" strokeWidth={2.5} dot={{ r: 4 }} name="Actual" />
                        <Line type="monotone" dataKey="arima" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="ARIMA" />
                        <Line type="monotone" dataKey="xgboost" stroke="#06b6d4" strokeWidth={1.5} dot={false} name="XGBoost" />
                        <Line type="monotone" dataKey="lstm" stroke="#8b5cf6" strokeWidth={1.5} dot={false} name="LSTM" />
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
                            {modelLeaderboard.map((m, i) => (
                                <tr key={i}>
                                    <td style={{ fontWeight: 600 }}>{m.model}</td>
                                    <td>{m.mape}</td>
                                    <td>{m.rmse}</td>
                                    <td>{m.r2}</td>
                                    <td>
                                        <span className={`badge ${m.status === 'primary' ? 'badge-success' : m.status === 'active' ? 'badge-info' : 'badge-warning'}`}>
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
                        {anomalies.map((a, i) => (
                            <tr key={i}>
                                <td style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>{a.time}</td>
                                <td style={{ fontWeight: 600 }}>{a.sku}</td>
                                <td>
                                    <span className={`badge ${a.type === 'spike' ? 'badge-danger' : 'badge-warning'}`}>
                                        {a.type === 'spike' ? '↑ Spike' : '↓ Drop'}
                                    </span>
                                </td>
                                <td style={{ fontWeight: 600, color: a.type === 'spike' ? '#f87171' : '#fbbf24' }}>{a.magnitude}</td>
                                <td>{a.confidence}</td>
                                <td>
                                    <span className={`badge ${a.status === 'confirmed' ? 'badge-danger' : a.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                                        {a.status}
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
