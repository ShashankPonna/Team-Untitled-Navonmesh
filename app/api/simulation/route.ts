import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const supabase = await createClient()
        const now = new Date()

        const prev30Start = new Date(now)
        prev30Start.setDate(now.getDate() - 30)

        const [inventoryRes, salesRes] = await Promise.all([
            // get all inventory items with full product details
            supabase.from("inventory").select("*, product:products(*)"),
            // get sales from the last 30 days
            supabase.from("sales").select("quantity, revenue").gte("date", prev30Start.toISOString().split("T")[0])
        ])

        if (inventoryRes.error) throw inventoryRes.error
        if (salesRes.error) throw salesRes.error

        const inventory = inventoryRes.data || []
        const sales = salesRes.data || []

        if (inventory.length === 0) {
            return NextResponse.json({
                hasData: false,
                baseMetrics: {
                    rop: 0,
                    safetyStock: 0,
                    avgDailyDemand: 0,
                    leadTime: 0,
                    holdingCost: 0,
                    stockoutRisk: "Safe",
                    lostSalesRisk: 0,
                    reorderQty: 0,
                }
            })
        }

        // Aggregate values
        let totalRop = 0
        let totalSafetyStock = 0
        let totalLeadTime = 0
        let totalHoldingCost = 0
        let productsCount = 0
        let totalReorderQty = 0

        for (const item of inventory) {
            const product = item.product as any
            const cost = Number(product?.cost_price || 0)
            const leadTime = Number(product?.lead_time_days || 7)

            totalRop += item.reorder_point
            // Approx safety stock logic: 50% of ROP conceptually if we don't have per-item std_dev
            totalSafetyStock += Math.ceil(item.reorder_point * 0.5)
            // Approx holding cost per year (20% of inventory value)
            totalHoldingCost += item.current_stock * cost * 0.2

            totalLeadTime += leadTime

            // Standard reorder quantity is around demand * leadtime. We'll approximate:
            totalReorderQty += item.reorder_point * 1.5

            productsCount++
        }

        const avgLeadTime = productsCount > 0 ? Math.round(totalLeadTime / productsCount) : 7

        // Avg daily demand = total sales in last 30 days / 30
        const totalSalesQ = sales.reduce((sum: number, s: any) => sum + s.quantity, 0)
        let avgDailyDemand = Math.round((totalSalesQ / 30) * 10) / 10

        // If no sales, fallback to a proxy based on ROP so the simulation still works visually
        if (avgDailyDemand === 0 && totalRop > 0) {
            // Assume 1 replenishment cycle per month on average
            avgDailyDemand = Math.round((totalRop / 30) * 10) / 10
        }

        let totalRevenue30d = sales.reduce((sum: number, s: any) => sum + Number(s.revenue), 0)
        let avgDailyRevenue = totalRevenue30d / 30
        if (avgDailyRevenue === 0 && avgDailyDemand > 0) {
            // Rough proxy if revenue column wasn't filled correctly
            avgDailyRevenue = avgDailyDemand * 50 // arbitrary $50/unit
        }

        // Lost sales risk (Value of sales for 5 days of demand)
        const lostSalesRisk = Math.round(avgDailyRevenue * 5)

        const stockoutRisk = "Medium" // Global status, could be derived

        return NextResponse.json({
            hasData: true,
            baseMetrics: {
                rop: totalRop,
                safetyStock: totalSafetyStock,
                avgDailyDemand,
                leadTime: avgLeadTime,
                holdingCost: Math.round(totalHoldingCost),
                stockoutRisk,
                lostSalesRisk,
                reorderQty: Math.round(totalReorderQty),
            }
        })

    } catch (err) {
        console.error("Simulation API error:", err)
        return NextResponse.json({ error: "Failed to load simulation baselines" }, { status: 500 })
    }
}
