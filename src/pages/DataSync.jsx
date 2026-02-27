import { useState, useRef } from 'react'
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react'
import AnimatedPage from '../components/ui/AnimatedPage'
import { parseCSV, syncSalesData, syncInventoryData } from '../services/dataSyncService'

export default function DataSync() {
    const [file, setFile] = useState(null)
    const [targetTable, setTargetTable] = useState('sales')
    const [status, setStatus] = useState('idle') // idle, parsing, syncing, success, error
    const [message, setMessage] = useState('')
    const fileRef = useRef(null)

    const handleFileChange = (e) => {
        const selected = e.target.files[0]
        if (selected && selected.type === 'text/csv' || selected?.name.endsWith('.csv')) {
            setFile(selected)
            setStatus('idle')
            setMessage('')
        } else {
            setStatus('error')
            setMessage('Please select a valid CSV file.')
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setStatus('parsing')
        try {
            const data = await parseCSV(file)

            setStatus('syncing')
            let result;
            if (targetTable === 'sales') {
                result = await syncSalesData(data)
            } else {
                result = await syncInventoryData(data)
            }

            if (result.success) {
                setStatus('success')
                setMessage(`Successfully synchronized ${result.count} records.`)
                setFile(null)
                if (fileRef.current) fileRef.current.value = ''
            } else {
                setStatus('error')
                setMessage(`Sync failed: ${result.error}`)
            }
        } catch (err) {
            setStatus('error')
            setMessage(err.message || 'Failed to process CSV file.')
        }
    }

    return (
        <AnimatedPage>
            <div className="page-header" style={{ marginBottom: 32 }}>
                <h1>Data Synchronization</h1>
                <p>Bulk upload offline sales data, bulk inventory snapshots, or adjustments via CSV format.</p>
            </div>

            <div className="glass-card" style={{ maxWidth: 640, margin: '0 auto', padding: 40 }}>
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileSpreadsheet color="#06b6d4" />
                    CSV Upload Portal
                </h3>

                {/* Target Selection */}
                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12, fontWeight: 500 }}>Target Destination</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {['sales', 'inventory'].map(t => (
                            <button
                                key={t}
                                onClick={() => setTargetTable(t)}
                                style={{
                                    padding: '12px',
                                    borderRadius: 8,
                                    border: `1px solid ${targetTable === t ? 'rgba(6,182,212,0.5)' : 'rgba(148,163,184,0.1)'}`,
                                    background: targetTable === t ? 'rgba(6,182,212,0.1)' : 'rgba(15,23,42,0.4)',
                                    color: targetTable === t ? '#22d3ee' : '#cbd5e1',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {t} Table
                            </button>
                        ))}
                    </div>
                </div>

                {/* File Drop/Select */}
                <div
                    onClick={() => fileRef.current?.click()}
                    style={{
                        border: '2px dashed rgba(148,163,184,0.2)',
                        borderRadius: 12,
                        padding: 48,
                        textAlign: 'center',
                        cursor: 'pointer',
                        background: 'rgba(15,23,42,0.2)',
                        marginBottom: 24,
                        transition: 'border-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(148,163,184,0.2)'}
                >
                    <input
                        type="file"
                        accept=".csv"
                        ref={fileRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />

                    <UploadCloud size={48} color={file ? '#22d3ee' : '#64748b'} style={{ margin: '0 auto 16px' }} />
                    <h4 style={{ color: 'white', marginBottom: 8, fontSize: '1rem' }}>
                        {file ? file.name : 'Click to upload or drag and drop'}
                    </h4>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                        {file ? `${(file.size / 1024).toFixed(1)} KB` : 'CSV files only (max 10MB)'}
                    </p>
                </div>

                {/* Status Handling */}
                {status === 'error' && (
                    <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: 16, borderRadius: 8, display: 'flex', gap: 12, marginBottom: 24, color: '#f87171' }}>
                        <AlertCircle size={20} />
                        <span style={{ fontSize: '0.9rem' }}>{message}</span>
                    </div>
                )}

                {status === 'success' && (
                    <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: 16, borderRadius: 8, display: 'flex', gap: 12, marginBottom: 24, color: '#34d399' }}>
                        <CheckCircle2 size={20} />
                        <span style={{ fontSize: '0.9rem' }}>{message}</span>
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || status === 'parsing' || status === 'syncing'}
                    style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: 16,
                        fontWeight: 600,
                        fontSize: '1rem',
                        cursor: (!file || status === 'parsing' || status === 'syncing') ? 'not-allowed' : 'pointer',
                        opacity: (!file || status === 'parsing' || status === 'syncing') ? 0.6 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12
                    }}
                >
                    {(status === 'parsing' || status === 'syncing') && <Loader2 className="spinner" size={20} />}
                    {status === 'parsing' ? 'Parsing CSV...' : status === 'syncing' ? 'Syncing database...' : 'Upload Data'}
                </button>
            </div>
        </AnimatedPage>
    )
}
