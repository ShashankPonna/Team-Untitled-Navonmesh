import Papa from 'papaparse'
import { supabase } from '../lib/supabase'

export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length) {
                    reject(results.errors)
                } else {
                    resolve(results.data)
                }
            },
            error: (error) => {
                reject(error)
            }
        })
    })
}

export const syncSalesData = async (data) => {
    // Map parsed data to DB schema
    // Expecting columns like: product_id OR sku, store_id, quantity, sale_date, total_price
    // For robust logic, we'd need to resolve SKUs to UUIDs
    try {
        // We'll assume the CSV is pre-formatted, or we do a simple insert.
        // For the hackathon scale, doing bulk inserts:
        const payload = data.map(item => ({
            product_id: item.product_id || null, // Best effort
            store_id: item.store_id || null,
            quantity: parseInt(item.quantity || 1, 10),
            total_price: parseFloat(item.total_price || 0),
            sale_date: item.sale_date || new Date().toISOString()
        }))

        // Supabase limits bulk inserts, so we insert all in one go if < ~10k rows
        const { error } = await supabase
            .from('sales')
            .insert(payload)

        if (error) throw error
        return { success: true, count: payload.length }
    } catch (err) {
        console.error('Failed to sync sales:', err)
        return { success: false, error: err.message }
    }
}

export const syncInventoryData = async (data) => {
    // Expecting columns like: product_id, location_id, location_type, quantity, batch_number, expiry_date
    try {
        const payload = data.map(item => ({
            product_id: item.product_id || null,
            location_id: item.location_id || null,
            location_type: item.location_type || 'warehouse',
            quantity: parseInt(item.quantity || 0, 10),
            batch_number: item.batch_number || null,
            expiry_date: item.expiry_date || null
        }))

        const { error } = await supabase
            .from('inventory')
            .insert(payload) // Assuming insert for brand new snapshot

        if (error) throw error
        return { success: true, count: payload.length }
    } catch (err) {
        console.error('Failed to sync inventory:', err)
        return { success: false, error: err.message }
    }
}
