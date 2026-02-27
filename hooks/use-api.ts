import useSWR, { mutate as globalMutate } from "swr"

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error("API error")
    return res.json()
})

// ─── Global revalidation ─────────────────────────────────────────────────────
// Call this after any mutation to refresh all related data across pages
export function revalidateAll() {
    globalMutate("/api/dashboard")
    globalMutate("/api/inventory")
    globalMutate("/api/products")
    globalMutate("/api/transfers")
    globalMutate("/api/locations")
    globalMutate("/api/categories")
    globalMutate("/api/alerts")
}

// ─── Dashboard ──────────────────────────────────────────────────────────────
export function useDashboard() {
    const { data, error, isLoading, mutate } = useSWR("/api/dashboard", fetcher, {
        refreshInterval: 30000, // refresh every 30s
    })
    return { data, error, isLoading, mutate }
}

// ─── Inventory ──────────────────────────────────────────────────────────────
export function useInventory() {
    const { data, error, isLoading, mutate } = useSWR("/api/inventory", fetcher)
    return { items: data || [], error, isLoading, mutate }
}

// ─── Locations ──────────────────────────────────────────────────────────────
export function useLocations() {
    const { data, error, isLoading, mutate } = useSWR("/api/locations", fetcher)
    return { locations: data || [], error, isLoading, mutate }
}

// ─── Transfers ──────────────────────────────────────────────────────────────
export function useTransfers() {
    const { data, error, isLoading, mutate } = useSWR("/api/transfers", fetcher)
    return { transfers: data || [], error, isLoading, mutate }
}

// ─── Alerts ─────────────────────────────────────────────────────────────────
export function useAlerts() {
    const { data, error, isLoading, mutate } = useSWR("/api/alerts", fetcher)
    return { alerts: data || [], error, isLoading, mutate }
}

// ─── Forecasts ──────────────────────────────────────────────────────────────
export function useForecasts(category: string = "all") {
    const { data, error, isLoading, mutate } = useSWR(
        `/api/forecasts?category=${category}`,
        fetcher
    )
    return { forecasts: data || [], error, isLoading, mutate }
}

// ─── Products ───────────────────────────────────────────────────────────────
export function useProducts() {
    const { data, error, isLoading, mutate } = useSWR("/api/products", fetcher)
    return { products: data || [], error, isLoading, mutate }
}

// ─── Categories ─────────────────────────────────────────────────────────────
export function useCategories() {
    const { data, error, isLoading, mutate } = useSWR("/api/categories", fetcher)
    return { categories: data || [], error, isLoading, mutate }
}
