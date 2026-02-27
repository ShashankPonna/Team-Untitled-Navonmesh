import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET /api/inventory — list all inventory with product and location details
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const locationId = searchParams.get("location_id")
    const categoryId = searchParams.get("category_id")

    let query = supabase
        .from("inventory")
        .select(`
      *,
      product:products(*, category:categories(*)),
      location:locations(*)
    `)
        .order("updated_at", { ascending: false })

    if (status) query = query.eq("status", status)
    if (locationId) query = query.eq("location_id", locationId)
    if (categoryId) query = query.eq("product.category_id", categoryId)

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

// POST /api/inventory — add a new inventory record
export async function POST(request: Request) {
    const body = await request.json()

    const { data, error } = await supabase
        .from("inventory")
        .insert(body)
        .select(`
      *,
      product:products(*, category:categories(*)),
      location:locations(*)
    `)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
