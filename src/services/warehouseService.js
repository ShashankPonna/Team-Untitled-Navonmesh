import { supabase } from '../lib/supabase'

export const getWarehousesOverview = async () => {
    // Basic aggregation
    const { data, error } = await supabase
        .from('warehouses')
        .select(`
            name,
            code,
            address,
            capacity_units,
            status,
            inventory(quantity)
        `)

    if (error) {
        console.error('Error fetching warehouses:', error)
        return []
    }

    return data.map(wh => {
        const totalItems = wh.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0
        const capacity = wh.capacity_units || 10000
        const utilization = Math.round((totalItems / capacity) * 100)

        // Mock coordinates strictly for the 3D map if address is missing
        const lat = wh.address?.lat || (Math.random() * 80 - 40)
        const lng = wh.address?.lng || (Math.random() * 360 - 180)

        return {
            name: wh.name,
            code: wh.code,
            location: wh.address?.city || 'Global facility',
            totalItems,
            utilization,
            capacity,
            coordinates: [lat, lng],
            status: wh.status
        }
    })
}

export const getRedistributionRecommendations = async () => {
    // In reality, this queries 'transfers' or a specific materialized view for rebalancing
    // We mock the specific structured logic for now but pull real items to transfer
    const { data, error } = await supabase
        .from('inventory')
        .select('product_id, quantity, location_type, products(sku, name)')
        .limit(10)

    if (error || !data.length) return [
        { id: 1, sku: 'SKU-4821', from: 'London', to: 'NYC', qty: 150, reason: 'Stockout risk in NYC (2 days left)', savings: '$1,200', score: 94 },
        { id: 2, sku: 'SKU-1092', from: 'Tokyo', to: 'Singapore', qty: 500, reason: 'Excess in Tokyo (45 days)', savings: '$850', score: 88 },
        { id: 3, sku: 'SKU-5567', from: 'Mumbai', to: 'Sydney', qty: 100, reason: 'Demand spike predicted', savings: '$2,400', score: 91 }
    ]

    // Provide pseudo-recommendations based on actual DB items
    return data.slice(0, 3).map((item, i) => ({
        id: item.product_id + i,
        sku: item.products?.sku || 'Unknown',
        from: item.location_type === 'warehouse' ? 'Warehouse A' : 'Store B',
        to: 'Target Node',
        qty: Math.min(item.quantity, 100),
        reason: 'Cost Optimization',
        savings: 'Est. calculated',
        score: Math.round(70 + Math.random() * 25)
    }))
}

export const approveTransfer = async (transferId) => {
    // Mock approve transfer (In reality this inserts to transfers table and updates inventory)
    console.log(`Transfer ${transferId} approved`)
    return true
}

export const rejectTransfer = async (transferId) => {
    // Mock reject transfer
    console.log(`Transfer ${transferId} rejected`)
    return true
}
