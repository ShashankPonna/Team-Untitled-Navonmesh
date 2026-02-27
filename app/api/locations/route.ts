import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET /api/locations — list all locations with computed stats
export async function GET() {
    const { data: locations, error } = await supabase
        .from("locations")
        .select("*")
        .order("name")

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Enrich each location with product count and total inventory value
    const enriched = await Promise.all(
        (locations || []).map(async (loc) => {
            const { data: inventory } = await supabase
                .from("inventory")
                .select("current_stock, product:products(cost_price)")
                .eq("location_id", loc.id)

            const products = inventory?.length || 0
            const totalValue = (inventory || []).reduce((sum, inv) => {
                const cost = (inv.product as any)?.cost_price || 0
                return sum + inv.current_stock * cost
            }, 0)

            return { ...loc, products, totalValue: Math.round(totalValue) }
        })
    )

    return NextResponse.json(enriched)
}

// POST /api/locations — create a new location
export async function POST(request: Request) {
    const body = await request.json()

    const { data, error } = await supabase
        .from("locations")
        .insert(body)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}

// DELETE /api/locations — delete a location by id
export async function DELETE(request: Request) {
    const { id } = await request.json()

    const { error } = await supabase
        .from("locations")
        .delete()
        .eq("id", id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
