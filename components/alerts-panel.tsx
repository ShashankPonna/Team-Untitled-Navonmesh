"use client"

import {
  AlertTriangle,
  ArrowLeftRight,
  Clock,
  PackageX,
  Package,
  Truck,
  Loader2,
} from "lucide-react"
import { useAlerts } from "@/hooks/use-api"
import { alertsData as fallbackAlerts } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

const typeConfig = {
  reorder: { icon: Package, color: "text-primary", bg: "bg-primary/10", label: "Reorder" },
  transfer: { icon: ArrowLeftRight, color: "text-[var(--info)]", bg: "bg-[var(--info)]/10", label: "Transfer" },
  expiry: { icon: Clock, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10", label: "Expiry" },
  stockout: { icon: PackageX, color: "text-destructive", bg: "bg-destructive/10", label: "Stockout" },
  overstock: { icon: Package, color: "text-muted-foreground", bg: "bg-muted", label: "Overstock" },
  supplier_delay: { icon: Truck, color: "text-[var(--warning)]", bg: "bg-[var(--warning)]/10", label: "Supplier" },
}

const severityBadge = {
  high: "bg-destructive/15 text-destructive",
  medium: "bg-[var(--warning)]/15 text-[var(--warning)]",
  low: "bg-muted text-muted-foreground",
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

export default function AlertsPanel() {
  const { alerts: apiAlerts, isLoading } = useAlerts()

  // Map API data to the format the UI expects, or fallback to mock
  const alerts = apiAlerts.length > 0
    ? apiAlerts.map((a: any) => ({
      id: a.id,
      type: a.type,
      severity: a.severity,
      product: a.product?.name || "Unknown",
      location: a.location?.name || "Unknown",
      message: a.message,
      time: formatTimeAgo(a.created_at),
    }))
    : fallbackAlerts

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Active Alerts
        </h3>
        <div className="flex items-center gap-1.5">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">
                {alerts.filter((a: any) => a.severity === "high").length} critical
              </span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
        {alerts.map((alert: any) => {
          const config = typeConfig[alert.type as keyof typeof typeConfig]
          if (!config) return null
          const Icon = config.icon
          return (
            <div
              key={alert.id}
              className="flex gap-3 rounded-lg bg-background/50 p-3 transition-colors hover:bg-background/80"
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  config.bg
                )}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {alert.product}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                      severityBadge[alert.severity as keyof typeof severityBadge]
                    )}
                  >
                    {alert.severity}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                  {alert.message}
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">
                    {alert.location}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">
                    {alert.time}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
