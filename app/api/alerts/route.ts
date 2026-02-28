import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

// GET /api/alerts — list alerts scoped to the current user
export async function GET(request: Request) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get("severity")
    const type = searchParams.get("type")
    const acknowledged = searchParams.get("acknowledged")

    let query = supabase
        .from("alerts")
        .select(`
      *,
      product:products(name, sku),
      location:locations(name)
    `)
        .order("created_at", { ascending: false })

    if (severity) query = query.eq("severity", severity)
    if (type) query = query.eq("type", type)
    if (acknowledged !== null && acknowledged !== undefined) {
        query = query.eq("acknowledged", acknowledged === "true")
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

// POST /api/alerts — create a new alert owned by the current user
export async function POST(request: Request) {
    const supabase = await createClient()
    const body = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await supabase
        .from("alerts")
        .insert({ ...body, user_id: user.id })
        .select(`
      *,
      product:products(name, sku),
      location:locations(name)
    `)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
