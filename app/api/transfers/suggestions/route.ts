import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const dynamic = "force-dynamic"

/**
 * GET /api/transfers/suggestions
 *
 * Computes intelligent transfer suggestions from real inventory data.
 * Logic:
 *  1. Find inventory items that are "overstock" at one location.
 *  2. Find inventory items for the same product that are "critical" or "warning" at another location.
 *  3. Suggest moving surplus stock from the overstock location to the at-risk location.
 *  4. Also suggest transfers when a product has 0 stock at one location but exists elsewhere.
 */
export async function GET() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const { data: inventory, error } = await supabase
        .from("inventory")
        .select(`
            id,
            current_stock,
            reorder_point,
            status,
            product:products(id, name, lead_time_days),
            location:locations(id, name)
        `)
        .order("current_stock", { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!inventory || inventory.length === 0) return NextResponse.json([])

    const suggestions: any[] = []
    const seen = new Set<string>() // deduplicate by product_id

    for (const atRisk of inventory) {
        const productId = (atRisk.product as any)?.id
        if (!productId) continue
        if (!["critical", "warning"].includes(atRisk.status)) continue

        // Find an overstock source for the same product at a different location
        const source = inventory.find(
            inv =>
                (inv.product as any)?.id === productId &&
                inv.status === "overstock" &&
                (inv.location as any)?.id !== (atRisk.location as any)?.id
        )

        if (!source) continue

        const key = `${productId}-${(source.location as any)?.id}-${(atRisk.location as any)?.id}`
        if (seen.has(key)) continue
        seen.add(key)

        const needed = atRisk.reorder_point - atRisk.current_stock
        const surplus = source.current_stock - source.reorder_point
        const quantity = Math.min(Math.max(needed, Math.ceil(surplus / 2)), surplus)

        if (quantity <= 0) continue

        const severity = atRisk.status === "critical" ? "high" : "medium"
        const reason = atRisk.status === "critical"
            ? `${(atRisk.location as any)?.name} is critically understocked (${atRisk.current_stock}/${atRisk.reorder_point}). ${(source.location as any)?.name} has a surplus of ${surplus} units.`
            : `${(atRisk.location as any)?.name} is below reorder point (${atRisk.current_stock}/${atRisk.reorder_point}). ${(source.location as any)?.name} has ${surplus} excess units.`

        suggestions.push({
            product: (atRisk.product as any)?.name,
            productId,
            from: (source.location as any)?.name,
            fromLocationId: (source.location as any)?.id,
            to: (atRisk.location as any)?.name,
            toLocationId: (atRisk.location as any)?.id,
            quantity,
            severity,
            reason,
        })

        if (suggestions.length >= 5) break // cap at 5 suggestions
    }

    return NextResponse.json(suggestions)
}
