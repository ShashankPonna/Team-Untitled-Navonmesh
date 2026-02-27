import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET /api/products — list all products
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get("category_id")

    let query = supabase
        .from("products")
        .select(`
      *,
      category:categories(*)
    `)
        .order("name")

    if (categoryId) query = query.eq("category_id", categoryId)

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

// POST /api/products — create a new product
export async function POST(request: Request) {
    const body = await request.json()

    const { data, error } = await supabase
        .from("products")
        .insert(body)
        .select(`*, category:categories(*)`)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}
