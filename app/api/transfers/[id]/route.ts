import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// PATCH /api/transfers/[id] — update transfer status
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabase
        .from("transfers")
        .update(body)
        .eq("id", id)
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

    return NextResponse.json(data)
}
