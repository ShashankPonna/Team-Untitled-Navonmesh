"use client"

import { useState } from "react"
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Upload, TrendingUp, Target, Brain, Calendar } from "lucide-react"
import AppShell from "@/components/app-shell"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-animations"
import AnimatedCounter from "@/components/animated-counter"
import { useForecasts, useLocations } from "@/hooks/use-api"
import { demandForecastData as fallbackForecast, forecastAccuracyData, locations as fallbackLocations } from "@/lib/mock-data"
import CsvUploadDialog from "@/components/csv-upload-dialog"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

const productForecasts = [
  { product: "MacBook Pro 14\"", current: 5200, predicted7: 5800, predicted14: 11200, predicted30: 24500, accuracy: 94.2 },
  { product: "AirPods Pro", current: 3800, predicted7: 4100, predicted14: 8400, predicted30: 18200, accuracy: 91.8 },
  { product: "USB-C Hub", current: 2100, predicted7: 2400, predicted14: 4600, predicted30: 9800, accuracy: 96.1 },
  { product: "Nike Air Max", current: 1500, predicted7: 1800, predicted14: 3400, predicted30: 7200, accuracy: 89.5 },
  { product: "Samsung TV 65\"", current: 800, predicted7: 950, predicted14: 1800, predicted30: 3900, accuracy: 92.7 },
]

export default function ForecastingPage() {
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [forecastPeriod, setForecastPeriod] = useState("30")
  const [modelType, setModelType] = useState("moving_avg")
  const [uploadedData, setUploadedData] = useState<any[]>([])

  const { forecasts: apiForecast } = useForecasts()
  const { locations: apiLocations } = useLocations()
  const demandForecastData = uploadedData.length > 0 ? uploadedData : (apiForecast.length > 0 ? apiForecast : fallbackForecast)
  const locations = apiLocations.length > 0 ? apiLocations.map((l: any) => ({ id: l.id, name: l.name })) : fallbackLocations

  const handleCsvUpload = (rows: any[]) => {
    setUploadedData(rows)
  }

  return (
    <AppShell>
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
            AI Demand Forecasting
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Machine learning powered demand predictions across all locations.
          </p>
        </div>
      </ScrollReveal>

      {/* Controls */}
      <ScrollReveal delay={0.1}>
        <div className="glass-card mb-6 flex flex-wrap items-center gap-4 rounded-xl p-4">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-[180px] bg-background/60">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc: any) => (
                <SelectItem key={loc.id} value={loc.name}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
            <SelectTrigger className="w-[150px] bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="14">14 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Select value={modelType} onValueChange={setModelType}>
            <SelectTrigger className="w-[180px] bg-background/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="moving_avg">Moving Average</SelectItem>
              <SelectItem value="arima">ARIMA</SelectItem>
            </SelectContent>
          </Select>
          <CsvUploadDialog
            onUpload={handleCsvUpload}
            expectedColumns={["date", "actual", "predicted"]}
            title="Upload Forecast Data"
            description="Upload a CSV with columns: date, actual, predicted. Optionally include lower and upper bounds."
            triggerLabel="Upload CSV"
          />
        </div>
      </ScrollReveal>

      {/* Forecast KPIs */}
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
        <StaggerItem>
          <div className="glass-card rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Predicted</p>
                <AnimatedCounter value={18420} className="text-xl font-bold text-foreground" />
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
                <p className="text-xs text-muted-foreground">Avg Accuracy (MAPE)</p>
                <AnimatedCounter value={4.3} suffix="%" decimals={1} className="text-xl font-bold text-foreground" />
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
                <p className="text-xs text-muted-foreground">Model Type</p>
                <p className="text-xl font-bold text-foreground">
                  {modelType === "moving_avg" ? "MA" : "ARIMA"}
                </p>
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
                <p className="text-xs text-muted-foreground">Forecast Window</p>
                <p className="text-xl font-bold text-foreground">{forecastPeriod} Days</p>
              </div>
            </div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Forecast Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScrollReveal delay={0.1}>
          <div className="glass-card rounded-xl p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Historical vs Predicted Demand
            </h3>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={demandForecastData}>
                  <defs>
                    <linearGradient id="fgActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5aada0" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#5aada0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fgPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4a574" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#d4a574" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fgBand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#d4a574" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#d4a574" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.86 0.02 80 / 0.4)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Area type="monotone" dataKey="upper" stroke="none" fill="url(#fgBand)" name="Upper Bound" />
                  <Area type="monotone" dataKey="lower" stroke="none" fill="transparent" name="Lower Bound" />
                  <Area type="monotone" dataKey="actual" stroke="#5aada0" strokeWidth={2.5} fill="url(#fgActual)" name="Actual" connectNulls={false} />
                  <Area type="monotone" dataKey="predicted" stroke="#d4a574" strokeWidth={2} strokeDasharray="6 3" fill="url(#fgPred)" name="Predicted" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="glass-card rounded-xl p-5">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Forecast Accuracy (MAPE %)
            </h3>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={forecastAccuracyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.86 0.02 80 / 0.4)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} />
                  <YAxis tick={{ fontSize: 12, fill: "oklch(0.50 0.02 260)" }} domain={[0, 15]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="mape" stroke="#5aada0" strokeWidth={2.5} dot={{ fill: "#5aada0", r: 5 }} name="MAPE %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Product Forecasts Table */}
      <ScrollReveal delay={0.2} className="mt-6">
        <div className="glass-card rounded-xl p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground">
            Product-Level Forecasts
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left text-xs font-medium text-muted-foreground">Product</th>
                  <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Current/wk</th>
                  <th className="pb-3 text-right text-xs font-medium text-muted-foreground">7-Day</th>
                  <th className="pb-3 text-right text-xs font-medium text-muted-foreground">14-Day</th>
                  <th className="pb-3 text-right text-xs font-medium text-muted-foreground">30-Day</th>
                  <th className="pb-3 text-right text-xs font-medium text-muted-foreground">Accuracy</th>
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
                    <td className="py-3 text-right">
                      <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
                        {pf.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>
    </AppShell>
  )
}
