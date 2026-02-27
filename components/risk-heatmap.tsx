"use client"

import { riskHeatmapData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

function getRiskColor(risk: number) {
  if (risk >= 0.7) return "bg-destructive/80 text-primary-foreground"
  if (risk >= 0.4) return "bg-[var(--warning)]/80 text-[var(--warning-foreground)]"
  return "bg-[var(--success)]/60 text-[var(--success-foreground)]"
}

function getRiskLabel(risk: number) {
  if (risk >= 0.7) return "High"
  if (risk >= 0.4) return "Medium"
  return "Safe"
}

export default function RiskHeatmap() {
  const locations = [...new Set(riskHeatmapData.map((d) => d.location))]
  const products = [...new Set(riskHeatmapData.map((d) => d.product))]

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Risk Heatmap
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="pb-3 text-left text-xs font-medium text-muted-foreground">
                Location
              </th>
              {products.map((p) => (
                <th
                  key={p}
                  className="pb-3 text-center text-xs font-medium text-muted-foreground"
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc}>
                <td className="py-1.5 pr-4 text-xs font-medium text-foreground">
                  {loc}
                </td>
                {products.map((prod) => {
                  const entry = riskHeatmapData.find(
                    (d) => d.location === loc && d.product === prod
                  )
                  if (!entry) return <td key={prod} />
                  return (
                    <td key={prod} className="p-1.5">
                      <div
                        className={cn(
                          "flex items-center justify-center rounded-lg py-2 text-xs font-medium transition-transform hover:scale-105",
                          getRiskColor(entry.risk)
                        )}
                      >
                        {getRiskLabel(entry.risk)}
                        <span className="ml-1 opacity-70">
                          {(entry.risk * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
    </div>
  )
}
