"use client"

import { useState, useEffect } from "react"
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { TrendingUp, Target, Brain, Calendar, BarChart2, Package } from "lucide-react"
import AppShell from "@/components/app-shell"
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/scroll-animations"
import AnimatedCounter from "@/components/animated-counter"
import { useForecasts, useLocations } from "@/hooks/use-api"
import CsvUploadDialog from "@/components/csv-upload-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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

export default function ForecastingPage() {
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [forecastPeriod, setForecastPeriod] = useState("30")
  const [modelType, setModelType] = useState("moving_avg")
  const [uploadedData, setUploadedData] = useState<any[]>([])

  // API-computed report data (includes product forecasts)
  const [reportData, setReportData] = useState<any>(null)
  const [loadingReport, setLoadingReport] = useState(true)

  const { forecasts: apiForecast } = useForecasts()
  const { locations: apiLocations } = useLocations()

  useEffect(() => {
    fetch("/api/reports")
      .then(r => r.json())
      .then(d => setReportData(d))
      .catch(() => setReportData(null))
      .finally(() => setLoadingReport(false))
  }, [])

  const locations = apiLocations.map((l: any) => ({ id: l.id, name: l.name }))

  // Use uploaded CSV data first, then API forecast data
  const demandChartData = uploadedData.length > 0 ? uploadedData : apiForecast

  const productForecasts: any[] = reportData?.productForecasts || []
  const hasData = !loadingReport && reportData?.hasData

  const totalPredicted = productForecasts.reduce((sum, p) => {
    return sum + (forecastPeriod === "7" ? p.predicted7 : forecastPeriod === "14" ? p.predicted14 : p.predicted30)
  }, 0)

  const avgAccuracy = productForecasts.filter(p => p.accuracy !== null).length > 0
    ? productForecasts.filter(p => p.accuracy !== null).reduce((sum, p) => sum + p.accuracy, 0) / productForecasts.filter(p => p.accuracy !== null).length
    : null

  return (
    <AppShell>
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">AI Demand Forecasting</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Moving average predictions computed from your real sales data.
          </p>
        </div>
      </ScrollReveal>

      {/* Empty state */}
      {!loadingReport && !hasData && (
        <div className="glass-card rounded-2xl p-12 text-center max-w-xl mx-auto mt-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <BarChart2 className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">No data to forecast yet</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Forecasts are computed from your sales data. Add products and inventory first, then generate some sales records, and forecasts will appear automatically.
          </p>
          <Link href="/inventory">
            <Button className="mt-6 gap-2"><Package className="h-4 w-4" />Go to Inventory</Button>
          </Link>
        </div>
      )}

      {/* Main content — only shown when data exists */}
      {(hasData || uploadedData.length > 0) && (
        <>
          {/* Controls */}
          <ScrollReveal delay={0.1}>
            <div className="glass-card mb-6 flex flex-wrap items-center gap-4 rounded-xl p-4">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[180px] bg-background/60"><SelectValue placeholder="Location" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map((loc: any) => <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
                <SelectTrigger className="w-[150px] bg-background/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={modelType} onValueChange={setModelType}>
                <SelectTrigger className="w-[180px] bg-background/60"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="moving_avg">Moving Average</SelectItem>
                  <SelectItem value="arima">ARIMA (coming soon)</SelectItem>
                </SelectContent>
              </Select>
              <CsvUploadDialog
                onUpload={setUploadedData}
                expectedColumns={["date", "actual", "predicted"]}
                title="Upload Forecast Data"
                description="Upload a CSV with columns: date, actual, predicted. Optionally include lower and upper bounds."
                triggerLabel="Upload CSV"
              />
            </div>
          </ScrollReveal>

          {/* KPIs */}
          <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
            <StaggerItem>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Predicted ({forecastPeriod}d)</p>
                    <AnimatedCounter value={totalPredicted} className="text-xl font-bold text-foreground" />
                  </div>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--success)]/10">
                    <Target className="h-5 w-5 text-[var(--success)]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avg Accuracy</p>
                    {avgAccuracy !== null
                      ? <AnimatedCounter value={avgAccuracy} suffix="%" decimals={1} className="text-xl font-bold text-foreground" />
                      : <p className="text-xl font-bold text-foreground">—</p>
                    }
                  </div>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--info)]/10">
                    <Brain className="h-5 w-5 text-[var(--info)]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Model</p>
                    <p className="text-xl font-bold text-foreground">{modelType === "moving_avg" ? "Mov. Avg" : "ARIMA"}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="glass-card rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)]/10">
                    <Calendar className="h-5 w-5 text-[var(--warning)]" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Products Tracked</p>
                    <AnimatedCounter value={productForecasts.length} className="text-xl font-bold text-foreground" />
                  </div>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Demand Chart (from demand_forecasts table or CSV upload) */}
          {demandChartData.length > 0 && (
            <ScrollReveal delay={0.1} className="mt-6">
              <div className="glass-card rounded-xl p-5">
                <h3 className="mb-4 text-sm font-semibold text-foreground">Historical vs Predicted Demand</h3>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={demandChartData}>
                      <defs>
                        <linearGradient id="fgActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5aada0" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#5aada0" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="fgPred" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#d4a574" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="#d4a574" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.86 0.02 80 / 0.4)" />
                      <XAxis dataKey="date" tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
                      <YAxis tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
                      <Tooltip contentStyle={chartTooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Area type="monotone" dataKey="actual" stroke="#5aada0" strokeWidth={2.5} fill="url(#fgActual)" name="Actual" connectNulls={false} />
                      <Area type="monotone" dataKey="predicted" stroke="#d4a574" strokeWidth={2} strokeDasharray="6 3" fill="url(#fgPred)" name="Predicted" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Product Forecasts Table */}
          <ScrollReveal delay={0.2} className="mt-6">
            <div className="glass-card rounded-xl p-5">
              <h3 className="mb-1 text-sm font-semibold text-foreground">Product-Level Forecasts</h3>
              <p className="mb-4 text-xs text-muted-foreground">Computed using moving average of your recorded sales data.</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Product</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Avg/sale</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">7-Day</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">14-Day</th>
                      <th className="pb-3 text-right text-xs font-medium text-muted-foreground">30-Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productForecasts.map((pf) => (
                      <tr key={pf.product} className="border-b border-border/50 last:border-0">
                        <td className="py-3 text-sm font-medium text-foreground">{pf.product}</td>
                        <td className="py-3 text-right text-sm text-muted-foreground">{pf.current.toLocaleString()}</td>
                        <td className="py-3 text-right text-sm text-foreground">{pf.predicted7.toLocaleString()}</td>
                        <td className="py-3 text-right text-sm text-foreground">{pf.predicted14.toLocaleString()}</td>
                        <td className="py-3 text-right text-sm font-medium text-foreground">{pf.predicted30.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollReveal>
        </>
      )}
    </AppShell>
  )
}
