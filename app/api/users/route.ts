import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

// GET /api/users — list all app users
export async function GET() {
    const { data, error } = await supabase
        .from("app_users")
        .select("*")
        .order("name")

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

// POST /api/users — create a new user
export async function POST(request: Request) {
    const body = await request.json()

    const { data, error } = await supabase
        .from("app_users")
        .insert(body)
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
}

// DELETE /api/users — delete a user by id (passed in body)
export async function DELETE(request: Request) {
    const { id } = await request.json()

    const { error } = await supabase
        .from("app_users")
        .delete()
        .eq("id", id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
