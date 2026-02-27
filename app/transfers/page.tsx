"use client"

import { useState, useCallback } from "react"
import {
  ArrowRight,
  Plus,
  Truck,
  CheckCircle2,
  Clock,
  Package,
  MapPin,
  Loader2,
} from "lucide-react"
import AppShell from "@/components/app-shell"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-animations"
import AnimatedCounter from "@/components/animated-counter"
import { useTransfers, useLocations, revalidateAll } from "@/hooks/use-api"
import { transferHistory as fallbackTransfers, locations as fallbackLocations } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import NewTransferDialog from "@/components/new-transfer-dialog"

const statusStyles = {
  completed: { label: "Completed", color: "bg-[var(--success)]/15 text-[var(--success)]", icon: CheckCircle2 },
  in_transit: { label: "In Transit", color: "bg-primary/15 text-primary", icon: Truck },
  pending: { label: "Pending", color: "bg-[var(--warning)]/15 text-[var(--warning)]", icon: Clock },
}

const transferSuggestions = [
  { product: "AirPods Pro", from: "Warehouse A", to: "Mall Central", quantity: 80, reason: "Mall Central has 5-day stockout risk, Warehouse A has 200+ surplus." },
  { product: "MacBook Pro 14\"", from: "Warehouse A", to: "Downtown", quantity: 25, reason: "Downtown below reorder point (5/15). Warehouse A has adequate stock." },
  { product: "Wireless Mouse", from: "Warehouse A", to: "Airport", quantity: 30, reason: "Airport dropping below safety stock. Next supplier delivery in 4 days." },
]

export default function TransfersPage() {
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [localTransfers, setLocalTransfers] = useState<any[]>([])
  const [approvedSuggestions, setApprovedSuggestions] = useState<Set<number>>(new Set())
  const { transfers: apiTransfers, isLoading } = useTransfers()
  const { locations: apiLocations } = useLocations()

  const handleAddTransfer = useCallback((transfer: any) => {
    setLocalTransfers((prev) => [transfer, ...prev])
  }, [])

  const handleApproveSuggestion = useCallback(async (index: number, sug: any) => {
    setApprovedSuggestions((prev) => new Set(prev).add(index))

    try {
      // Look up product and location IDs
      const [prodRes, locRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/locations"),
      ])
      const prods = await prodRes.json()
      const locs = await locRes.json()

      const product = prods.find?.((p: any) => p.name === sug.product)
      const fromLoc = locs.find?.((l: any) => l.name === sug.from)
      const toLoc = locs.find?.((l: any) => l.name === sug.to)

      if (product && fromLoc && toLoc) {
        const res = await fetch("/api/transfers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_id: product.id,
            from_location_id: fromLoc.id,
            to_location_id: toLoc.id,
            quantity: sug.quantity,
            status: "in_transit",
          }),
        })
        const data = await res.json()
        setLocalTransfers((prev) => [{
          id: data.id || crypto.randomUUID(),
          product: sug.product,
          from: sug.from,
          to: sug.to,
          quantity: sug.quantity,
          status: "in_transit",
          date: new Date().toISOString().split("T")[0],
        }, ...prev])
        revalidateAll()
        return
      }
    } catch (err) {
      console.error("Failed to save approval to Supabase:", err)
    }

    // Fallback: add locally
    setLocalTransfers((prev) => [{
      id: crypto.randomUUID(),
      product: sug.product,
      from: sug.from,
      to: sug.to,
      quantity: sug.quantity,
      status: "in_transit",
      date: new Date().toISOString().split("T")[0],
    }, ...prev])
  }, [])

  const handleStatusChange = useCallback(async (id: string, newStatus: string) => {
    // Optimistic UI update
    setLocalTransfers((prev) =>
      prev.map((t) => t.id === id ? { ...t, status: newStatus } : t)
    )

    // Persist to Supabase
    try {
      await fetch(`/api/transfers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      revalidateAll()
    } catch (err) {
      console.error("Failed to update transfer status:", err)
    }
  }, [])

  // Map API transfers to flat format or fallback
  const apiHistory = apiTransfers.length > 0
    ? apiTransfers.map((t: any) => ({
      id: t.id,
      product: t.product?.name || "Unknown",
      from: t.from_location?.name || "Unknown",
      to: t.to_location?.name || "Unknown",
      quantity: t.quantity,
      status: t.status,
      date: t.created_at?.split("T")[0] || "",
    }))
    : fallbackTransfers
  const rawTransferHistory = [...localTransfers, ...apiHistory]
  const transferHistory = Array.from(new Map(rawTransferHistory.map(item => [item.id, item])).values())

  const locations = apiLocations.length > 0 ? apiLocations : fallbackLocations

  const inTransit = transferHistory.filter((t: any) => t.status === "in_transit").length
  const completed = transferHistory.filter((t: any) => t.status === "completed").length
  const pending = transferHistory.filter((t: any) => t.status === "pending").length

  return (
    <AppShell>
      <ScrollReveal>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
              Stock Transfers
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Coordinate inter-location stock movements and AI-suggested transfers.
            </p>
          </div>
          <NewTransferDialog onAdd={handleAddTransfer} />
        </div>
      </ScrollReveal>

      {/* KPIs */}
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-3" staggerDelay={0.08}>
        <StaggerItem>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">In Transit</p>
                <AnimatedCounter value={inTransit} className="text-2xl font-bold text-foreground" />
              </div>
            </div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
                <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completed (30d)</p>
                <AnimatedCounter value={completed} className="text-2xl font-bold text-foreground" />
              </div>
            </div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
                <Clock className="h-5 w-5 text-[var(--warning)]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Pending Approval</p>
                <AnimatedCounter value={pending} className="text-2xl font-bold text-foreground" />
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* AI Suggestions */}
      {showSuggestions && (
        <ScrollReveal delay={0.15} className="mt-6">
          <div className="glass-card rounded-xl p-5 border-l-4 border-l-primary">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">
                  AI Transfer Suggestions
                </h3>
              </div>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Dismiss
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {transferSuggestions.map((sug, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-lg bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <span>{sug.product}</span>
                      <span className="text-muted-foreground">({sug.quantity} units)</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {sug.from}
                      <ArrowRight className="h-3 w-3" />
                      {sug.to}
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {sug.reason}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 gap-1.5"
                    disabled={approvedSuggestions.has(i)}
                    onClick={() => handleApproveSuggestion(i, sug)}
                  >
                    {approvedSuggestions.has(i) ? (
                      <><CheckCircle2 className="h-3.5 w-3.5 text-[var(--success)]" /> Approved</>
                    ) : (
                      <><ArrowRight className="h-3.5 w-3.5" /> Approve</>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* Transfer History */}
      <ScrollReveal delay={0.2} className="mt-6">
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="border-b border-border p-5">
            <h3 className="text-sm font-semibold text-foreground">Transfer History</h3>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading transfers...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Product</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">From</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">To</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Qty</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Date</th>
                    <th className="px-5 py-3 text-right text-xs font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transferHistory.map((transfer: any) => {
                    const config = statusStyles[transfer.status as keyof typeof statusStyles]
                    if (!config) return null
                    const StatusIcon = config.icon
                    return (
                      <tr key={transfer.id} className="border-b border-border/40 last:border-0 hover:bg-background/40 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-foreground">{transfer.product}</td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{transfer.from}</td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{transfer.to}</td>
                        <td className="px-5 py-3.5 text-right text-sm font-medium text-foreground">{transfer.quantity}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant="secondary" className={cn("gap-1", config.color)}>
                            <StatusIcon className="h-3 w-3" />
                            {config.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{transfer.date}</td>
                        <td className="px-5 py-3.5 text-right">
                          {transfer.status === "pending" && (
                            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => handleStatusChange(transfer.id, "in_transit")}>
                              <Truck className="h-3 w-3" /> Ship
                            </Button>
                          )}
                          {transfer.status === "in_transit" && (
                            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => handleStatusChange(transfer.id, "completed")}>
                              <CheckCircle2 className="h-3 w-3" /> Complete
                            </Button>
                          )}
                          {transfer.status === "completed" && (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ScrollReveal>

      {/* Location Overview */}
      <ScrollReveal delay={0.25} className="mt-6">
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Location Network
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {locations.map((loc: any) => (
              <div
                key={loc.id}
                className="flex flex-col gap-2 rounded-lg bg-background/50 p-4 transition-all hover:bg-background/70"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    loc.type === "warehouse" ? "bg-primary" : "bg-[var(--success)]"
                  )} />
                  <span className="text-sm font-medium text-foreground">{loc.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{loc.city}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{loc.products || 0} products</span>
                  <span className="font-medium text-foreground">${((loc.totalValue || 0) / 1000).toFixed(0)}K</span>
                </div>
                <Badge variant="secondary" className="w-fit text-[10px] capitalize">
                  {loc.type}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </AppShell>
  )
}
