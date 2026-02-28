import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

// GET /api/inventory — list inventory scoped to the current user
export async function GET(request: Request) {
    const supabase = await createClient()
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

// POST /api/inventory — add a new inventory record owned by the current user
export async function POST(request: Request) {
    const supabase = await createClient()
    const body = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await supabase
        .from("inventory")
        .insert({ ...body, user_id: user.id })
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
