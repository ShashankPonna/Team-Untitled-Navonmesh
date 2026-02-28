"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

function getRiskScore(status: string): number {
  switch (status) {
    case "critical": return 0.90
    case "warning": return 0.55
    case "expiring": return 0.65
    case "overstock": return 0.35
    case "good": return 0.10
    default: return 0.20
  }
}

function getRiskColor(risk: number) {
  if (risk >= 0.7) return "bg-destructive/80 text-primary-foreground"
  if (risk >= 0.4) return "bg-[var(--warning)]/80 text-foreground"
  return "bg-[var(--success)]/60 text-foreground"
}

function getRiskLabel(risk: number) {
  if (risk >= 0.7) return "High"
  if (risk >= 0.4) return "Med"
  return "Safe"
}

export default function RiskHeatmap() {
  const [heatmapData, setHeatmapData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch inventory with product + location info
    fetch("/api/inventory?include=product,location")
      .then(r => r.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) return
        // Build product×location risk grid from real inventory rows
        const rows: any[] = data.map(inv => ({
          product: inv.product?.name || "Unknown",
          location: inv.location?.name || "Unknown",
          risk: getRiskScore(inv.status),
          status: inv.status,
        }))
        setHeatmapData(rows)
      })
      .catch(() => setHeatmapData([]))
      .finally(() => setLoading(false))
  }, [])

  const locations = [...new Set(heatmapData.map(d => d.location))]
  const products = [...new Set(heatmapData.map(d => d.product))]
    .slice(0, 6) // cap at 6 columns for readability

  const noData = !loading && heatmapData.length === 0

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Risk Heatmap</h3>

      {loading && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {noData && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">No inventory data to display.</p>
          <p className="text-xs text-muted-foreground mt-1">Add products to see the risk heatmap.</p>
        </div>
      )}

      {!loading && !noData && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="pb-3 text-left text-xs font-medium text-muted-foreground min-w-[80px]">Location</th>
                  {products.map(p => (
                    <th key={p} className="pb-3 text-center text-xs font-medium text-muted-foreground max-w-[80px] truncate px-1">
                      {p.length > 12 ? p.slice(0, 12) + "…" : p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {locations.map(loc => (
                  <tr key={loc}>
                    <td className="py-1.5 pr-4 text-xs font-medium text-foreground whitespace-nowrap">{loc}</td>
                    {products.map(prod => {
                      const entry = heatmapData.find(d => d.location === loc && d.product === prod)
                      if (!entry) {
                        return (
                          <td key={prod} className="p-1.5">
                            <div className="flex items-center justify-center rounded-lg py-2 text-xs font-medium bg-muted/30 text-muted-foreground/40">
                              —
                            </div>
                          </td>
                        )
                      }
                      return (
                        <td key={prod} className="p-1.5">
                          <div
                            title={`${prod} @ ${loc}: ${entry.status} (${Math.round(entry.risk * 100)}%)`}
                            className={cn(
                              "flex items-center justify-center rounded-lg py-2 text-xs font-medium transition-transform hover:scale-105 cursor-default",
                              getRiskColor(entry.risk)
                            )}
                          >
                            {getRiskLabel(entry.risk)}
                            <span className="ml-1 opacity-70">{Math.round(entry.risk * 100)}%</span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-[var(--success)]/60" />
              <span className="text-[11px] text-muted-foreground">Safe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-[var(--warning)]/80" />
              <span className="text-[11px] text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded bg-destructive/80" />
              <span className="text-[11px] text-muted-foreground">High</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
