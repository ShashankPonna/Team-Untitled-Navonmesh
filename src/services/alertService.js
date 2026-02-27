import { supabase } from '../lib/supabase'
import { ShieldAlert, Thermometer, Package, Truck, Info, CheckCircle2 } from 'lucide-react'

// Helper to map DB severity and category to UI needs
const iconMap = {
    'stockout': ShieldAlert,
    'expiry': Thermometer,
    'overstock': Package,
    'replenishment': CheckCircle2,
    'supplier': Truck,
    'anomaly': Package,
    'system': Info
}

export const getAllAlerts = async () => {
    const { data, error } = await supabase
        .from('risk_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

    if (error) {
        console.error('Error fetching alerts page data', error)
        return []
    }

    return data.map(a => {
        // Simple heuristic to map generic alert_type to UI categories
        let typeGroup = 'system'
        if (a.alert_type.includes('stock')) typeGroup = a.alert_type.includes('over') ? 'overstock' : 'stockout'
        if (a.alert_type.includes('expiry')) typeGroup = 'expiry'
        if (a.alert_type.includes('demand')) typeGroup = 'anomaly'
        if (a.alert_type.includes('delay')) typeGroup = 'supplier'

        return {
            id: a.id,
            severity: a.severity, // critical, warning, info
            icon: iconMap[typeGroup] || Info,
            title: a.title,
            message: a.message,
            time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: typeGroup
        }
    })
}
