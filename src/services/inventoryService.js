import { supabase } from '../lib/supabase'

export const getInventoryList = async () => {
    const { data, error } = await supabase
        .from('inventory')
        .select(`
            id,
            product_id,
            location_type,
            quantity,
            reorder_level,
            products (sku, name, is_perishable),
            perishable_metadata (shelf_life_days)
        `)
        .order('quantity', { ascending: true })

    if (error) {
        console.error('Error fetching inventory:', error)
        return []
    }

    // Map output to match frontend shape
    return data.map(item => {
        const daysOfSupply = Math.round(item.quantity / 50) || 0 // Mock daily consumption rate
        let status = 'optimal'

        if (item.quantity <= item.reorder_level) status = 'critical'
        else if (daysOfSupply > 30) status = 'overstock'

        return {
            sku: item.products?.sku,
            name: item.products?.name,
            warehouse: item.location_type === 'warehouse' ? 'DC' : 'Store',
            stock: item.quantity,
            rop: item.reorder_level,
            safety: Math.round(item.reorder_level * 0.4),
            daysOfSupply,
            status
        }
    })
}

export const getPerishables = async () => {
    const { data, error } = await supabase
        .from('inventory')
        .select(`
            batch_number,
            expiry_date,
            products!inner (sku, name, is_perishable)
        `)
        .eq('products.is_perishable', true)
        .not('expiry_date', 'is', null)
        .order('expiry_date', { ascending: true })

    if (error) return []

    return data.map(item => {
        const expiry = new Date(item.expiry_date)
        const today = new Date()
        const diffTime = Math.abs(expiry - today)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Auto-markdown logic based on PRD
        let markdown = 0
        if (diffDays <= 1) markdown = 50
        else if (diffDays <= 3) markdown = 20
        else if (diffDays <= 7) markdown = 5

        return {
            sku: item.products?.sku,
            name: item.products?.name,
            batch: item.batch_number || 'UNKNOWN',
            expiry: item.expiry_date,
            daysLeft: diffDays,
            markdown,
            method: 'FEFO'
        }
    })
}

export const addProduct = async (productData) => {
    // Basic product insert
    const { data, error } = await supabase
        .from('products')
        .insert([{
            sku: productData.sku,
            name: productData.name,
            category: productData.category,
            unit_price: productData.unitPrice,
            is_perishable: productData.isPerishable
        }])
        .select()

    if (error) throw error
    return data[0]
}

export const addStock = async (stockData) => {
    const { data, error } = await supabase
        .from('inventory')
        .insert([{
            product_id: stockData.productId, // UUID
            location_type: stockData.locationType || 'warehouse',
            quantity: stockData.quantity,
            reorder_level: stockData.rop,
            batch_number: stockData.batchNumber || null,
            expiry_date: stockData.expiryDate || null
        }])

    if (error) throw error
    return true
}
