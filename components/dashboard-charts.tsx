"use client"

import { useEffect, useState } from "react"
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { useForecasts, useInventory } from "@/hooks/use-api"

const chartTooltipStyle = {
  backgroundColor: "oklch(0.97 0.01 85 / 0.9)",
  backdropFilter: "blur(12px)",
  border: "1px solid oklch(0.88 0.02 80 / 0.6)",
  borderRadius: "10px",
  padding: "10px 14px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
  color: "oklch(0.22 0.02 260)",
  fontSize: "13px",
}

// Demand forecast: actual vs predicted from the demand_forecasts table
export function DemandForecastChart({ data }: { data?: any[] }) {
  const { forecasts } = useForecasts()
  const chartData = data && data.length > 0 ? data : forecasts

  if (!chartData || chartData.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Demand Forecast</h3>
        <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
          No forecast data yet — add products and sales records to generate predictions.
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Demand Forecast</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5aada0" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#5aada0" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4a574" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#d4a574" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.86 0.02 80 / 0.4)" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
            <YAxis tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Area type="monotone" dataKey="actual" stroke="#5aada0" strokeWidth={2} fill="url(#gradActual)" name="Actual" connectNulls={false} />
            <Area type="monotone" dataKey="predicted" stroke="#d4a574" strokeWidth={2} strokeDasharray="6 3" fill="url(#gradPredicted)" name="Predicted" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Stock vs Reorder Point: computed from real inventory data
export function StockVsDemandChart({ data }: { data?: any[] }) {
  const { items } = useInventory()

  // Build chart data from real inventory: product name, current stock, reorder_point
  const chartData = data && data.length > 0 ? data : items.slice(0, 8).map((inv: any) => ({
    name: (inv.product?.name || "Unknown").slice(0, 12),
    stock: inv.current_stock,
    demand: inv.reorder_point, // reorder point acts as minimum demand threshold
  }))

  if (!chartData || chartData.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Stock vs Reorder Point</h3>
        <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
          No inventory data yet.
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Stock vs Reorder Point</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.86 0.02 80 / 0.4)" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "oklch(0.50 0.02 260)" }} />
            <YAxis tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Bar dataKey="stock" fill="#5aada0" radius={[4, 4, 0, 0]} name="Current Stock" />
            <Bar dataKey="demand" fill="#d4a574" radius={[4, 4, 0, 0]} name="Reorder Point" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Store Performance: revenue + healthy item % per location from /api/reports
export function StoreComparisonChart({ data }: { data?: any[] }) {
  const [reportData, setReportData] = useState<any[]>([])

  useEffect(() => {
    if (data && data.length > 0) return // prop override
    fetch("/api/reports")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d?.storeComparisonData)) {
          setReportData(d.storeComparisonData.map((s: any) => ({
            store: s.store.length > 12 ? s.store.slice(0, 12) + "…" : s.store,
            revenue: s.revenue,
            efficiency: s.efficiency,
          })))
        }
      })
      .catch(() => { })
  }, [data])

  const chartData = data && data.length > 0 ? data : reportData

  if (!chartData || chartData.length === 0) {
    return (
      <div className="glass-card rounded-xl p-5">
        <h3 className="mb-4 text-sm font-semibold text-foreground">Store Performance</h3>
        <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
          No location data yet — add locations and products to see performance.
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Store Performance</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.86 0.02 80 / 0.4)" />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }}
              tickFormatter={(v) => `Rs.${(v / 1000).toFixed(0)}K`}
            />
            <YAxis
              dataKey="store"
              type="category"
              tick={{ fontSize: 11, fill: "oklch(0.50 0.02 260)" }}
              width={90}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(v: number) => [`Rs.${v.toLocaleString()}`, "Revenue"]}
            />
            <Bar dataKey="revenue" fill="#5aada0" radius={[0, 4, 4, 0]} name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
