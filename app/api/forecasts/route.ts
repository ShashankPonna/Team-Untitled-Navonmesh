import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET /api/forecasts — get demand forecast data
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || "all"

    let query = supabase
        .from("demand_forecasts")
        .select("*")
        .order("date", { ascending: true })

    if (category !== "all") {
        query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to match the frontend format
    const formatted = (data || []).map((row) => {
        const date = new Date(row.date)
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return {
            date: monthNames[date.getMonth()],
            actual: row.actual_demand,
            predicted: row.predicted_demand,
            lower: row.lower_bound,
            upper: row.upper_bound,
        }
    })

    return NextResponse.json(formatted)
}
