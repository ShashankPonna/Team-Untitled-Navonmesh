import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

// GET /api/dashboard — aggregated KPIs and chart data for the dashboard
export async function GET() {
    try {
        const supabase = await createClient()

        // Fetch all data in parallel (RLS automatically scopes to current user)
        const [
            inventoryRes,
            alertsRes,
            forecastsRes,
        ] = await Promise.all([
            supabase.from("inventory").select("*, product:products(name, cost_price, selling_price, category_id, category:categories(name))"),
            supabase.from("alerts").select("*").eq("acknowledged", false),
            supabase.from("demand_forecasts").select("*").order("date"),
        ])

        if (inventoryRes.error) console.error("Inventory query error:", inventoryRes.error)
        if (alertsRes.error) console.error("Alerts query error:", alertsRes.error)
        if (forecastsRes.error) console.error("Forecasts query error:", forecastsRes.error)

        const inventory = inventoryRes.data || []
        const alerts = alertsRes.data || []
        const forecasts = forecastsRes.data || []

        // ─── KPI calculations ─────────────────────────────────────────────
        const totalInventoryValue = inventory.reduce((sum: number, inv: any) => {
            const cost = inv.product?.cost_price || 0
            return sum + inv.current_stock * Number(cost)
        }, 0)

        const riskAlerts = alerts.filter(
            (a: any) => a.severity === "high" || a.type === "stockout" || a.type === "reorder"
        ).length

        const forecastedDemand = forecasts
            .filter((f: any) => f.actual_demand === null || f.actual_demand === 0)
            .reduce((sum: number, f: any) => sum + (f.predicted_demand || 0), 0)

        const expiryAlerts = alerts.filter((a: any) => a.type === "expiry").length
        const overstockAlerts = alerts.filter((a: any) => a.type === "overstock").length

        const totalItems = inventory.length
        const goodItems = inventory.filter(
            (i: any) => i.status === "good" || i.status === "overstock"
        ).length
        const serviceLevel = totalItems > 0 ? Math.round((goodItems / totalItems) * 1000) / 10 : 0

        const totalStock = inventory.reduce((s: number, i: any) => s + i.current_stock, 0)
        const totalReserved = inventory.reduce((s: number, i: any) => s + i.reserved_stock, 0)
        const fillRate = totalStock > 0
            ? Math.round(((totalStock - totalReserved) / totalStock) * 1000) / 10
            : 0

        const criticalItems = inventory.filter((i: any) => i.status === "critical" || i.status === "warning").length
        const stockoutRate = totalItems > 0 ? Math.round((criticalItems / totalItems) * 1000) / 10 : 0

        const kpi = {
            totalInventoryValue: Math.round(totalInventoryValue),
            totalInventoryValueChange: 12.5,
            riskAlerts,
            riskAlertsChange: -8.3,
            forecastedDemand,
            forecastedDemandChange: 15.2,
            expiryAlerts,
            expiryAlertsChange: -22.1,
            overstockAlerts,
            overstockAlertsChange: 5.4,
            serviceLevel,
            fillRate,
            stockoutRate,
            inventoryTurnover: 8.4,
        }

        // ─── Demand Forecast chart data ───────────────────────────────────
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const demandForecastData = forecasts.map((f: any) => {
            const d = new Date(f.date)
            return {
                date: monthNames[d.getMonth()],
                actual: f.actual_demand,
                predicted: f.predicted_demand,
                lower: f.lower_bound,
                upper: f.upper_bound,
            }
        })

        // ─── Stock vs Demand by category ──────────────────────────────────
        const categoryMap: Record<string, { stock: number; demand: number }> = {}
        for (const inv of inventory) {
            const catName = (inv as any).product?.category?.name || "Other"
            if (!categoryMap[catName]) categoryMap[catName] = { stock: 0, demand: 0 }
            categoryMap[catName].stock += inv.current_stock
            categoryMap[catName].demand += inv.reorder_point * 2
        }
        const stockVsDemandData = Object.entries(categoryMap).map(([name, vals]) => ({
            name,
            stock: vals.stock,
            demand: vals.demand,
        }))

        return NextResponse.json({
            kpi,
            demandForecastData,
            stockVsDemandData,
        })
    } catch (err) {
        console.error("Dashboard API error:", err)
        return NextResponse.json(
            { error: "Failed to fetch dashboard data", details: String(err) },
            { status: 500 }
        )
    }
}
