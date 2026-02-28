import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

/** Returns a signed percentage change. Returns 0 when there is no previous data. */
function pctChange(current: number, previous: number): number {
    if (previous === 0) return 0
    return Math.round(((current - previous) / previous) * 1000) / 10
}

// GET /api/dashboard — aggregated KPIs and chart data for the dashboard
export async function GET() {
    try {
        const supabase = await createClient()

        const now = new Date()

        // Time-window boundaries
        const thisWeekStart = new Date(now)
        thisWeekStart.setDate(now.getDate() - 7)

        const lastWeekStart = new Date(now)
        lastWeekStart.setDate(now.getDate() - 14)

        const next30End = new Date(now)
        next30End.setDate(now.getDate() + 30)

        const prev30Start = new Date(now)
        prev30Start.setDate(now.getDate() - 30)

        const toISO = (d: Date) => d.toISOString()

        // Fetch all data in parallel (RLS automatically scopes to current user)
        const [
            inventoryRes,
            alertsRes,
            forecastsRes,
            // Alert time windows for change calculations
            thisWeekAlertsRes,
            lastWeekAlertsRes,
            // Forecast windows for change calculations
            nextMonthForecastsRes,
            prevMonthForecastsRes,
            // Sales windows: used as a proxy for inventory-value change
            thisWeekSalesRes,
            lastWeekSalesRes,
        ] = await Promise.all([
            supabase.from("inventory").select("*, product:products(name, cost_price, selling_price, category_id, category:categories(name))"),
            supabase.from("alerts").select("*").eq("acknowledged", false),
            supabase.from("demand_forecasts").select("*").order("date"),

            // This-week alerts (last 7 days)
            supabase.from("alerts").select("type, severity, created_at")
                .gte("created_at", toISO(thisWeekStart)),

            // Last-week alerts (8–14 days ago)
            supabase.from("alerts").select("type, severity, created_at")
                .gte("created_at", toISO(lastWeekStart))
                .lt("created_at", toISO(thisWeekStart)),

            // Forecasts for the next 30 days
            supabase.from("demand_forecasts").select("predicted_demand, date")
                .gte("date", now.toISOString().split("T")[0])
                .lte("date", next30End.toISOString().split("T")[0]),

            // Forecasts for the previous 30 days
            supabase.from("demand_forecasts").select("predicted_demand, date")
                .gte("date", prev30Start.toISOString().split("T")[0])
                .lt("date", now.toISOString().split("T")[0]),

            // Sales revenue this week
            supabase.from("sales").select("revenue")
                .gte("date", thisWeekStart.toISOString().split("T")[0]),

            // Sales revenue last week
            supabase.from("sales").select("revenue")
                .gte("date", lastWeekStart.toISOString().split("T")[0])
                .lt("date", thisWeekStart.toISOString().split("T")[0]),
        ])

        if (inventoryRes.error) console.error("Inventory query error:", inventoryRes.error)
        if (alertsRes.error) console.error("Alerts query error:", alertsRes.error)
        if (forecastsRes.error) console.error("Forecasts query error:", forecastsRes.error)

        const inventory = inventoryRes.data || []
        const alerts = alertsRes.data || []
        const forecasts = forecastsRes.data || []

        // ─── Time-window data ─────────────────────────────────────────────
        const thisWeekAlerts = thisWeekAlertsRes.data || []
        const lastWeekAlerts = lastWeekAlertsRes.data || []

        const nextMonthForecasts = nextMonthForecastsRes.data || []
        const prevMonthForecasts = prevMonthForecastsRes.data || []

        const thisWeekRevenue = (thisWeekSalesRes.data || []).reduce(
            (sum: number, s: any) => sum + Number(s.revenue), 0
        )
        const lastWeekRevenue = (lastWeekSalesRes.data || []).reduce(
            (sum: number, s: any) => sum + Number(s.revenue), 0
        )

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

        // ─── Real change calculations ────────────────────────────────────
        // Inventory Value change: use sales revenue as a proxy (most reliable time-series signal)
        const totalInventoryValueChange = pctChange(thisWeekRevenue, lastWeekRevenue)

        // Risk Alerts change: high-severity + stockout + reorder alerts this week vs last week
        const thisWeekRisk = thisWeekAlerts.filter(
            (a: any) => a.severity === "high" || a.type === "stockout" || a.type === "reorder"
        ).length
        const lastWeekRisk = lastWeekAlerts.filter(
            (a: any) => a.severity === "high" || a.type === "stockout" || a.type === "reorder"
        ).length
        const riskAlertsChange = pctChange(thisWeekRisk, lastWeekRisk)

        // Forecasted Demand change: next 30 days total vs previous 30 days total
        const nextMonthDemand = nextMonthForecasts.reduce(
            (sum: number, f: any) => sum + (f.predicted_demand || 0), 0
        )
        const prevMonthDemand = prevMonthForecasts.reduce(
            (sum: number, f: any) => sum + (f.predicted_demand || 0), 0
        )
        const forecastedDemandChange = pctChange(nextMonthDemand, prevMonthDemand)

        // Expiry Alerts change
        const thisWeekExpiry = thisWeekAlerts.filter((a: any) => a.type === "expiry").length
        const lastWeekExpiry = lastWeekAlerts.filter((a: any) => a.type === "expiry").length
        const expiryAlertsChange = pctChange(thisWeekExpiry, lastWeekExpiry)

        // Overstock Alerts change
        const thisWeekOverstock = thisWeekAlerts.filter((a: any) => a.type === "overstock").length
        const lastWeekOverstock = lastWeekAlerts.filter((a: any) => a.type === "overstock").length
        const overstockAlertsChange = pctChange(thisWeekOverstock, lastWeekOverstock)

        const kpi = {
            totalInventoryValue: Math.round(totalInventoryValue),
            totalInventoryValueChange,
            riskAlerts,
            riskAlertsChange,
            forecastedDemand,
            forecastedDemandChange,
            expiryAlerts,
            expiryAlertsChange,
            overstockAlerts,
            overstockAlertsChange,
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

