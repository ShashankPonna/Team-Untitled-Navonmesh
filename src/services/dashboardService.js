import { supabase } from '../lib/supabase'

// Fetch aggregate KPIs for the dashboard
export const getDashboardKPIs = async () => {
    // Note: To mimic complex aggregates without extensive backend RPCs, we fetch partial data
    // In a production app, these would be dedicated view queries or RPCs.

    // 1. Get Inventory Value (Total)
    const { data: inventoryData, error: invError } = await supabase
        .from('inventory')
        .select(`quantity, unit_cost_avg, product_id, products(unit_cost)`)

    // 2. Count Active Risk Alerts
    const { count: alertsCount, error: alertsError } = await supabase
        .from('risk_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false)
        .in('severity', ['warning', 'critical'])

    // 3. Count Auto Orders (Reorder Recommendations status = ordered)
    const { count: ordersCount, error: ordersError } = await supabase
        .from('reorder_recommendations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ordered')

    if (invError) console.error('Error fetching inventory KPI:', invError)

    const totalValue = inventoryData?.reduce((sum, item) => {
        const cost = item.unit_cost_avg || item.products?.unit_cost || 0
        return sum + (item.quantity * cost)
    }, 0) || 0

    return {
        inventoryValue: totalValue,
        activeAlerts: alertsCount || 0,
        autoOrders: ordersCount || 0,
        // Mocking forecast accuracy for now, as it requires historical test sets
        forecastAccuracy: 87.4,
        stockoutRate: 10.2
    }
}

export const getWarehouseUtilization = async () => {
    const { data, error } = await supabase
        .from('warehouses')
        .select(`
            name,
            code,
            capacity_units,
            inventory(quantity)
        `)

    if (error) {
        console.error('Error fetching warehouse utilization', error)
        return []
    }

    return data.map(wh => {
        const currentStock = wh.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0
        return {
            name: wh.code,
            stock: currentStock,
            capacity: wh.capacity_units || 10000 // Fallback if null
        }
    })
}

export const getRecentAlerts = async (limit = 5) => {
    const { data, error } = await supabase
        .from('risk_alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Error fetching alerts', error)
        return []
    }

    return data.map(a => ({
        type: a.severity,
        message: a.message || a.title,
        time: new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }))
}
