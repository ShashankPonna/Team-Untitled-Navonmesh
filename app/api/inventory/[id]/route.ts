import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET /api/inventory/[id] — get a single inventory item
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const { data, error } = await supabase
        .from("inventory")
        .select(`
      *,
      product:products(*, category:categories(*)),
      location:locations(*)
    `)
        .eq("id", id)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
}

// PATCH /api/inventory/[id] — update an inventory item
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
        .from("inventory")
        .update(body)
        .eq("id", id)
        .select(`
      *,
      product:products(*, category:categories(*)),
      location:locations(*)
    `)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

// DELETE /api/inventory/[id] — delete an inventory item
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    const { error } = await supabase
        .from("inventory")
        .delete()
        .eq("id", id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
