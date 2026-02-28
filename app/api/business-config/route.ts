import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

// GET /api/business-config — load the current user's business config
export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data, error } = await supabase
        .from("business_config")
        .select("*")
        .eq("user_id", user.id)
        .single()

    if (error && error.code !== "PGRST116") { // PGRST116 = no rows found
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data ?? {})
}

// POST /api/business-config — upsert the current user's business config
export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()

    const { data, error } = await supabase
        .from("business_config")
        .upsert(
            { ...body, user_id: user.id },
            { onConflict: "user_id" }
        )
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
}
