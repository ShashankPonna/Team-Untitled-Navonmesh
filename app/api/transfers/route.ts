import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

// GET /api/transfers — list transfers scoped to the current user
export async function GET(request: Request) {
    const supabase = await createClient()
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

// POST /api/transfers — create a new transfer owned by the current user
export async function POST(request: Request) {
    const supabase = await createClient()
    const body = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await supabase
        .from("transfers")
        .insert({ ...body, user_id: user.id })
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
