"use client"

import { useState, useEffect } from "react"
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { Download, FileText, DollarSign, TrendingDown, Package, ShieldAlert, BarChart2 } from "lucide-react"
import AppShell from "@/components/app-shell"
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/scroll-animations"
import AnimatedCounter from "@/components/animated-counter"
import { Button } from "@/components/ui/button"
import CsvUploadDialog from "@/components/csv-upload-dialog"
import { exportToCSV } from "@/lib/csv-export"
import Link from "next/link"

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

export default function ReportsPage() {
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/reports")
      .then(r => r.json())
      .then(d => setReportData(d))
      .catch(() => setReportData(null))
      .finally(() => setLoading(false))
  }, [])

  const hasData = !loading && reportData?.hasData

  const kpi = reportData?.kpi ?? { holdingCost: 0, lostRevenue: 0, inventoryValue: 0, wasteReduction: 0 }
  const categoryDistribution: any[] = reportData?.categoryDistribution ?? []
  const monthlyTurnover: any[] = reportData?.monthlyTurnover ?? []
  const storeComparisonData: any[] = reportData?.storeComparisonData ?? []

  const handleExport = () => {
    if (storeComparisonData.length > 0) {
      exportToCSV(storeComparisonData.map(s => ({
        Store: s.store,
        Efficiency: s.efficiency + "%",
        Stockouts: s.stockouts,
        Revenue: "$" + s.revenue.toLocaleString(),
      })), "inventory_report")
    }
  }

  return (
    <AppShell>
      <ScrollReveal>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">Reports & Analytics</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real cost intelligence and KPIs computed from your actual inventory and sales data.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasData && (
              <Button className="gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />Export Report
              </Button>
            )}
          </div>
        </div>
      </ScrollReveal>

      {/* Empty state */}
      {!loading && !hasData && (
        <div className="glass-card rounded-2xl p-12 text-center max-w-xl mx-auto mt-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <BarChart2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">No data to report yet</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Reports are calculated from your real inventory and sales data. Add products and record some sales to see live cost metrics, category breakdowns, and efficiency charts.
          </p>
          <Link href="/inventory">
            <Button className="mt-6 gap-2"><Package className="h-4 w-4" />Go to Inventory</Button>
          </Link>
        </div>
      )}

      {/* Main content */}
      {hasData && (
        <>
          {/* Cost KPIs */}
          <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
            <StaggerItem>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Holding Cost (est.)</p>
                    <AnimatedCounter value={kpi.holdingCost} prefix="$" className="text-xl font-bold text-foreground" />
                    <p className="text-[11px] text-muted-foreground">20% of inventory value</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                    <TrendingDown className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Potential Lost Revenue</p>
                    <AnimatedCounter value={kpi.lostRevenue} prefix="$" className="text-xl font-bold text-foreground" />
                    <p className="text-[11px] text-muted-foreground">From critical/low-stock items</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
                    <Package className="h-5 w-5 text-[var(--info)]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Inventory Value</p>
                    <AnimatedCounter value={kpi.inventoryValue} prefix="$" className="text-xl font-bold text-foreground" />
                  </div>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
                    <ShieldAlert className="h-5 w-5 text-[var(--success)]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Healthy Items</p>
                    <AnimatedCounter value={kpi.wasteReduction} suffix="%" decimals={1} className="text-xl font-bold text-foreground" />
                  </div>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Charts */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Category Distribution */}
            {categoryDistribution.length > 0 && (
              <ScrollReveal delay={0.1}>
                <div className="glass-card rounded-xl p-5">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">Category Distribution (by value)</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryDistribution} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value">
                          {categoryDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip contentStyle={chartTooltipStyle} formatter={(v) => `${v}%`} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ScrollReveal>
            )}

            {/* Monthly Turnover */}
            {monthlyTurnover.length > 0 && (
              <ScrollReveal delay={0.2}>
                <div className="glass-card rounded-xl p-5">
                  <h3 className="mb-4 text-sm font-semibold text-foreground">Inventory Turnover Trend</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTurnover}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.86 0.02 80 / 0.4)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
                        <YAxis tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
                        <Tooltip contentStyle={chartTooltipStyle} />
                        <Line type="monotone" dataKey="turnover" stroke="#5aada0" strokeWidth={2.5} dot={{ fill: "#5aada0", r: 5 }} name="Turnover" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </ScrollReveal>
            )}
          </div>

          {/* Store Efficiency */}
          {storeComparisonData.length > 0 && (
            <ScrollReveal delay={0.2} className="mt-6">
              <div className="glass-card rounded-xl p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Location Efficiency Comparison</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={storeComparisonData} barGap={6}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.86 0.02 80 / 0.4)" />
                      <XAxis dataKey="store" tick={{ fontSize: 11, fill: "oklch(0.50 0.02 260)" }} />
                      <YAxis tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="efficiency" fill="#5aada0" radius={[4, 4, 0, 0]} name="Healthy Items %" />
                      <Bar dataKey="stockouts" fill="#d4a574" radius={[4, 4, 0, 0]} name="Critical Items" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Quick Exports */}
          <ScrollReveal delay={0.25} className="mt-6">
            <div className="glass-card rounded-xl p-5">
              <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Exports</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Location Report", description: "Efficiency and stockouts per location", icon: FileText, key: "locations" },
                  { label: "Inventory Summary", description: "Current stock levels by location", icon: Package, key: "inventory" },
                  { label: "Financial Report", description: "Holding costs and value breakdown", icon: DollarSign, key: "financial" },
                ].map((exp) => (
                  <button
                    key={exp.label}
                    onClick={handleExport}
                    className="flex flex-col items-start gap-2 rounded-lg bg-background/50 p-4 text-left transition-all hover:bg-background/70 hover:shadow-sm"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <exp.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{exp.label}</p>
                      <p className="text-[11px] text-muted-foreground">{exp.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Download className="h-3 w-3" />Download CSV
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </>
      )}
    </AppShell>
  )
}
