import { createClient, SupabaseClient } from "@supabase/supabase-js"

let _supabase: SupabaseClient | null = null

// Lazy-init so builds don't crash when env vars are placeholders
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key || url.includes("your-supabase")) {
      throw new Error(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
      )
    }
    _supabase = createClient(url, key)
  }
  return _supabase
}

// Convenience alias — use this in API routes
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as any)[prop]
  },
})

// Types for our database
export type Location = {
  id: string
  name: string
  type: "store" | "warehouse"
  city: string
  address?: string
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  created_at: string
}

export type Product = {
  id: string
  name: string
  sku: string
  category_id: string
  cost_price: number
  selling_price: number
  lead_time_days: number
  perishable: boolean
  created_at: string
  updated_at: string
  // joined fields
  category?: Category
}

export type Inventory = {
  id: string
  product_id: string
  location_id: string
  current_stock: number
  reserved_stock: number
  reorder_point: number
  status: "critical" | "warning" | "good" | "overstock" | "expiring"
  expiry_date?: string
  created_at: string
  updated_at: string
  // joined fields
  product?: Product
  location?: Location
}

export type Transfer = {
  id: string
  product_id: string
  from_location_id: string
  to_location_id: string
  quantity: number
  status: "pending" | "in_transit" | "completed" | "cancelled"
  notes?: string
  created_at: string
  updated_at: string
  // joined fields
  product?: Product
  from_location?: Location
  to_location?: Location
}

export type Alert = {
  id: string
  type: "reorder" | "transfer" | "expiry" | "stockout" | "overstock" | "supplier_delay"
  severity: "low" | "medium" | "high"
  product_id: string
  location_id: string
  message: string
  acknowledged: boolean
  created_at: string
  // joined fields
  product?: Product
  location?: Location
}

export type DemandForecast = {
  id: string
  category: string
  date: string
  actual_demand?: number
  predicted_demand: number
  lower_bound: number
  upper_bound: number
  created_at: string
}

export type Sale = {
  id: string
  product_id: string
  location_id: string
  quantity: number
  revenue: number
  date: string
  created_at: string
}
