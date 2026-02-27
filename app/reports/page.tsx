"use client"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import {
  Download,
  Upload,
  FileText,
  DollarSign,
  TrendingDown,
  Package,
  ShieldAlert,
} from "lucide-react"
import AppShell from "@/components/app-shell"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-animations"
import AnimatedCounter from "@/components/animated-counter"
import { costMetrics, storeComparisonData } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import CsvUploadDialog from "@/components/csv-upload-dialog"
import { exportToCSV } from "@/lib/csv-export"

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

const categoryDistribution = [
  { name: "Electronics", value: 45, color: "#5aada0" },
  { name: "Clothing", value: 20, color: "#d4a574" },
  { name: "Food", value: 15, color: "#8fb8a0" },
  { name: "Sports", value: 12, color: "#c9956a" },
  { name: "Accessories", value: 8, color: "#7bc4b9" },
]

const monthlyTurnover = [
  { month: "Sep", turnover: 6.8 },
  { month: "Oct", turnover: 7.2 },
  { month: "Nov", turnover: 8.1 },
  { month: "Dec", turnover: 9.5 },
  { month: "Jan", turnover: 7.8 },
  { month: "Feb", turnover: 8.4 },
]

export default function ReportsPage() {
  const handleExport = () => {
    const exportData = storeComparisonData.map((s: any) => ({
      Store: s.store,
      Revenue: s.revenue,
      Turnover: s.turnover || "N/A",
    }))
    exportToCSV(exportData, "inventory_report")
  }

  const handleImport = (rows: any[]) => {
    console.log("Imported report data:", rows)
    // In a full implementation, this would update the report data
  }

  return (
    <AppShell>
      <ScrollReveal>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
              Reports & Analytics
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cost intelligence, KPI tracking, and exportable business reports.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CsvUploadDialog
              onUpload={handleImport}
              expectedColumns={["store", "revenue"]}
              title="Import Report Data"
              description="Upload a CSV with columns: store, revenue. Optionally include turnover."
              triggerLabel="Import CSV"
            />
            <Button className="gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </ScrollReveal>

      {/* Cost KPIs */}
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
        <StaggerItem>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Holding Cost</p>
                <AnimatedCounter value={costMetrics.holdingCost} prefix="$" className="text-xl font-bold text-foreground" />
                <p className="text-[11px] text-[var(--success)]">{costMetrics.holdingCostChange}% vs last month</p>
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
                <p className="text-xs text-muted-foreground">Lost Revenue</p>
                <AnimatedCounter value={costMetrics.lostRevenue} prefix="$" className="text-xl font-bold text-foreground" />
                <p className="text-[11px] text-[var(--success)]">{costMetrics.lostRevenueChange}% vs last month</p>
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
                <AnimatedCounter value={costMetrics.inventoryValue} prefix="$" className="text-xl font-bold text-foreground" />
                <p className="text-[11px] text-primary">+{costMetrics.inventoryValueChange}%</p>
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
                <p className="text-xs text-muted-foreground">Waste Reduction</p>
                <AnimatedCounter value={costMetrics.wasteReduction} suffix="%" decimals={1} className="text-xl font-bold text-foreground" />
                <p className="text-[11px] text-[var(--success)]">+{costMetrics.wasteReductionChange}%</p>
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScrollReveal delay={0.1}>
          <div className="glass-card rounded-xl p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Category Distribution
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="glass-card rounded-xl p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Inventory Turnover Trend
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTurnover}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.86 0.02 80 / 0.4)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} domain={[5, 11]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="turnover" stroke="#5aada0" strokeWidth={2.5} dot={{ fill: "#5aada0", r: 5 }} name="Turnover" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Store Efficiency */}
      <ScrollReveal delay={0.2} className="mt-6">
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Store Efficiency Comparison
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeComparisonData} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.86 0.02 80 / 0.4)" />
                <XAxis dataKey="store" tick={{ fontSize: 11, fill: "oklch(0.50 0.02 260)" }} />
                <YAxis tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="efficiency" fill="#5aada0" radius={[4, 4, 0, 0]} name="Efficiency %" />
                <Bar dataKey="stockouts" fill="#d4a574" radius={[4, 4, 0, 0]} name="Stockouts" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </ScrollReveal>

      {/* Export Options */}
      <ScrollReveal delay={0.25} className="mt-6">
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Exports</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Forecast Report", description: "Demand predictions for all products", icon: FileText },
              { label: "Inventory Summary", description: "Current stock levels by location", icon: Package },
              { label: "Financial Report", description: "Cost analysis and profit metrics", icon: DollarSign },
              { label: "Risk Assessment", description: "Stockout and overstock risk report", icon: ShieldAlert },
            ].map((exp) => (
              <button
                key={exp.label}
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
                  <Download className="h-3 w-3" />
                  Download CSV
                </div>
              </button>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </AppShell>
  )
}
