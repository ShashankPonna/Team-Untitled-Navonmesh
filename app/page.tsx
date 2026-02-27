"use client"

import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Clock,
  PackageX,
  Gauge,
  Percent,
  BarChart3,
} from "lucide-react"
import AppShell from "@/components/app-shell"
import KpiCard from "@/components/kpi-card"
import {
  DemandForecastChart,
  StockVsDemandChart,
  StoreComparisonChart,
} from "@/components/dashboard-charts"
import RiskHeatmap from "@/components/risk-heatmap"
import AlertsPanel from "@/components/alerts-panel"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  ScaleOnScroll,
} from "@/components/scroll-animations"
import { kpiData } from "@/lib/mock-data"

export default function DashboardPage() {
  return (
    <AppShell>
      {/* Header */}
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time inventory intelligence across all locations.
          </p>
        </div>
      </ScrollReveal>

      {/* KPI Cards */}
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
        <StaggerItem>
          <KpiCard
            title="Inventory Value"
            value={kpiData.totalInventoryValue}
            change={kpiData.totalInventoryValueChange}
            prefix="$"
            icon={DollarSign}
            iconColor="text-primary"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Risk Alerts"
            value={kpiData.riskAlerts}
            change={kpiData.riskAlertsChange}
            icon={AlertTriangle}
            iconColor="text-destructive"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Forecasted Demand"
            value={kpiData.forecastedDemand}
            change={kpiData.forecastedDemandChange}
            icon={TrendingUp}
            iconColor="text-primary"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Expiry Alerts"
            value={kpiData.expiryAlerts}
            change={kpiData.expiryAlertsChange}
            icon={Clock}
            iconColor="text-warning"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Secondary KPIs */}
      <StaggerContainer className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.08}>
        <StaggerItem>
          <KpiCard
            title="Overstock Alerts"
            value={kpiData.overstockAlerts}
            change={kpiData.overstockAlertsChange}
            icon={PackageX}
            iconColor="text-info"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Service Level"
            value={kpiData.serviceLevel}
            change={2.1}
            suffix="%"
            decimals={1}
            icon={Gauge}
            iconColor="text-success"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Fill Rate"
            value={kpiData.fillRate}
            change={1.8}
            suffix="%"
            decimals={1}
            icon={Percent}
            iconColor="text-primary"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Inventory Turnover"
            value={kpiData.inventoryTurnover}
            change={5.2}
            suffix="x"
            decimals={1}
            icon={BarChart3}
            iconColor="text-primary"
          />
        </StaggerItem>
      </StaggerContainer>

      {/* Charts Row 1 */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScrollReveal delay={0.1}>
          <DemandForecastChart />
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <StockVsDemandChart />
        </ScrollReveal>
      </div>

      {/* Charts Row 2 */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ScrollReveal delay={0.1} className="lg:col-span-1">
          <StoreComparisonChart />
        </ScrollReveal>
        <ScaleOnScroll className="lg:col-span-2">
          <RiskHeatmap />
        </ScaleOnScroll>
      </div>

      {/* Alerts */}
      <div className="mt-6">
        <ScrollReveal delay={0.15}>
          <AlertsPanel />
        </ScrollReveal>
      </div>
    </AppShell>
  )
}
