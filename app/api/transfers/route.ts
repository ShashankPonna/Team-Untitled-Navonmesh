import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET /api/transfers — list all transfers with product and location details
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = supabase
        .from("transfers")
        .select(`
      *,
      product:products(name, sku),
      from_location:locations!transfers_from_location_id_fkey(name),
      to_location:locations!transfers_to_location_id_fkey(name)
    `)
        .order("created_at", { ascending: false })

    if (status) query = query.eq("status", status)

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

// POST /api/transfers — create a new transfer
export async function POST(request: Request) {
    const body = await request.json()

    const { data, error } = await supabase
        .from("transfers")
        .insert(body)
        .select(`
      *,
      product:products(name, sku),
      from_location:locations!transfers_from_location_id_fkey(name),
      to_location:locations!transfers_to_location_id_fkey(name)
    `)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
