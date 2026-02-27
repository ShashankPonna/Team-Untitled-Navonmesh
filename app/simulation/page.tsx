"use client"

import { useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { FlaskConical, Zap, Clock, TrendingUp, AlertTriangle } from "lucide-react"
import AppShell from "@/components/app-shell"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-animations"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

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

const baseMetrics = {
  rop: 15,
  safetyStock: 8,
  avgDailyDemand: 12,
  leadTime: 7,
  holdingCost: 2450,
  stockoutRisk: "Medium",
  lostSalesRisk: 3400,
  reorderQty: 50,
}

export default function SimulationPage() {
  const [demandMultiplier, setDemandMultiplier] = useState([1.0])
  const [leadTimeDelay, setLeadTimeDelay] = useState([0])
  const [scenario, setScenario] = useState("custom")

  const simulated = useMemo(() => {
    const mult = demandMultiplier[0]
    const delay = leadTimeDelay[0]
    const newDemand = baseMetrics.avgDailyDemand * mult
    const newLeadTime = baseMetrics.leadTime + delay
    const newSafetyStock = Math.ceil(1.65 * 4 * Math.sqrt(newLeadTime))
    const newRop = Math.ceil(newDemand * newLeadTime + newSafetyStock)
    const newHolding = Math.round(baseMetrics.holdingCost * (1 + (mult - 1) * 0.3 + delay * 0.05))
    const daysToStockout = 5 / newDemand
    const newStockoutRisk =
      daysToStockout < newLeadTime ? "High" : daysToStockout < 2 * newLeadTime ? "Medium" : "Safe"
    const newLostSales = Math.round(
      Math.max(0, (newDemand - baseMetrics.avgDailyDemand) * 30 * 49)
    )
    const newReorderQty = Math.ceil(newDemand * newLeadTime * 1.2)

    return {
      rop: newRop,
      safetyStock: newSafetyStock,
      avgDailyDemand: Math.round(newDemand * 10) / 10,
      leadTime: newLeadTime,
      holdingCost: newHolding,
      stockoutRisk: newStockoutRisk,
      lostSalesRisk: newLostSales,
      reorderQty: newReorderQty,
    }
  }, [demandMultiplier, leadTimeDelay])

  const comparisonData = [
    { metric: "ROP", before: baseMetrics.rop, after: simulated.rop },
    { metric: "Safety Stock", before: baseMetrics.safetyStock, after: simulated.safetyStock },
    { metric: "Reorder Qty", before: baseMetrics.reorderQty, after: simulated.reorderQty },
    { metric: "Holding Cost", before: baseMetrics.holdingCost, after: simulated.holdingCost },
  ]

  const applyPreset = (preset: string) => {
    setScenario(preset)
    switch (preset) {
      case "demand_spike":
        setDemandMultiplier([2.0])
        setLeadTimeDelay([0])
        break
      case "supply_disruption":
        setDemandMultiplier([1.0])
        setLeadTimeDelay([7])
        break
      case "peak_season":
        setDemandMultiplier([1.5])
        setLeadTimeDelay([3])
        break
      default:
        setDemandMultiplier([1.0])
        setLeadTimeDelay([0])
    }
  }

  return (
    <AppShell>
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
            What-If Simulation
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Model demand spikes, supply disruptions, and their impact on inventory.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Controls */}
        <ScrollReveal delay={0.1} className="lg:col-span-1">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <FlaskConical className="h-5 w-5 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Scenario Parameters</h3>
            </div>

            {/* Presets */}
            <div className="mb-6">
              <label className="mb-2 block text-xs font-medium text-muted-foreground">Preset Scenarios</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "demand_spike", label: "Demand Spike", icon: Zap },
                  { key: "supply_disruption", label: "Supply Issue", icon: Clock },
                  { key: "peak_season", label: "Peak Season", icon: TrendingUp },
                  { key: "custom", label: "Custom", icon: FlaskConical },
                ].map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => applyPreset(preset.key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
                      scenario === preset.key
                        ? "bg-primary/15 text-primary"
                        : "bg-background/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <preset.icon className="h-3.5 w-3.5" />
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Demand Multiplier */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Demand Multiplier
                </label>
                <span className="text-sm font-bold text-foreground">
                  {demandMultiplier[0].toFixed(1)}x
                </span>
              </div>
              <Slider
                value={demandMultiplier}
                onValueChange={setDemandMultiplier}
                min={0.5}
                max={3.0}
                step={0.1}
                className="[&_[role=slider]]:bg-primary"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>0.5x</span>
                <span>3.0x</span>
              </div>
            </div>

            {/* Lead Time Delay */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Lead Time Delay (days)
                </label>
                <span className="text-sm font-bold text-foreground">
                  +{leadTimeDelay[0]}d
                </span>
              </div>
              <Slider
                value={leadTimeDelay}
                onValueChange={setLeadTimeDelay}
                min={0}
                max={14}
                step={1}
                className="[&_[role=slider]]:bg-[var(--warning)]"
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>0</span>
                <span>14 days</span>
              </div>
            </div>

            {/* Impact Preview */}
            <div className="rounded-lg bg-background/50 p-4">
              <h4 className="mb-3 text-xs font-semibold text-foreground">Simulated Impact</h4>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">New Demand</span>
                  <span className="font-medium text-foreground">{simulated.avgDailyDemand}/day</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">New Lead Time</span>
                  <span className="font-medium text-foreground">{simulated.leadTime} days</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Stockout Risk</span>
                  <span className={cn(
                    "font-medium",
                    simulated.stockoutRisk === "High" ? "text-destructive" :
                    simulated.stockoutRisk === "Medium" ? "text-[var(--warning)]" :
                    "text-[var(--success)]"
                  )}>
                    {simulated.stockoutRisk}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Lost Sales Risk</span>
                  <span className="font-medium text-foreground">${simulated.lostSalesRisk.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Results */}
        <ScrollReveal delay={0.2} className="lg:col-span-2">
          <div className="flex flex-col gap-6">
            {/* Before/After Comparison */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Before vs After</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.86 0.02 80 / 0.4)" />
                    <XAxis dataKey="metric" tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
                    <YAxis tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="before" fill="#5aada0" radius={[4, 4, 0, 0]} name="Current" />
                    <Bar dataKey="after" fill="#d4a574" radius={[4, 4, 0, 0]} name="Simulated" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Metric Cards */}
            <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-4" staggerDelay={0.06}>
              {[
                { label: "New ROP", before: baseMetrics.rop, after: simulated.rop },
                { label: "Safety Stock", before: baseMetrics.safetyStock, after: simulated.safetyStock },
                { label: "Reorder Qty", before: baseMetrics.reorderQty, after: simulated.reorderQty },
                { label: "Holding Cost", before: baseMetrics.holdingCost, after: simulated.holdingCost, prefix: "$" },
              ].map((m) => {
                const changed = m.after !== m.before
                const increased = m.after > m.before
                return (
                  <StaggerItem key={m.label}>
                    <div className="glass-card rounded-xl p-4">
                      <p className="text-[11px] text-muted-foreground">{m.label}</p>
                      <p className="mt-1 text-lg font-bold text-foreground">
                        {m.prefix || ""}{m.after.toLocaleString()}
                      </p>
                      {changed && (
                        <p className={cn(
                          "mt-0.5 text-[11px] font-medium",
                          increased ? "text-destructive" : "text-[var(--success)]"
                        )}>
                          {increased ? "+" : ""}{m.after - m.before} from {m.prefix || ""}{m.before.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </StaggerItem>
                )
              })}
            </StaggerContainer>
          </div>
        </ScrollReveal>
      </div>
    </AppShell>
  )
}
