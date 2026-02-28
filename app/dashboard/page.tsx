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
  Package,
  MapPin,
  ArrowRight,
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
import { useDashboard } from "@/hooks/use-api"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  const { data, isLoading } = useDashboard()

  const kpi = data?.kpi
  const hasData = kpi && kpi.totalInventoryValue > 0

  // ── Empty state: user has no inventory data yet ─────────────────────────────
  if (!isLoading && !hasData) {
    return (
      <AppShell>
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Real-time inventory intelligence.</p>
          </div>
        </ScrollReveal>

        <div className="glass-card rounded-2xl p-12 text-center max-w-2xl mx-auto mt-8">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <BarChart3 className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Welcome to StockFlow</h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Your dashboard is empty because you haven&apos;t added any inventory yet. Follow these steps to get started:
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 text-left">
            <div className="rounded-xl bg-background/50 p-5 border border-border/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Step 1: Add Locations</p>
              <p className="text-xs text-muted-foreground mt-1">Create your stores and warehouses so you can track inventory per location.</p>
              <Link href="/settings">
                <Button variant="outline" size="sm" className="mt-3 gap-1.5 w-full">
                  Go to Settings <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
            <div className="rounded-xl bg-background/50 p-5 border border-border/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-3">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-semibold text-foreground">Step 2: Add Products</p>
              <p className="text-xs text-muted-foreground mt-1">Add your products with pricing, stock levels, and reorder points.</p>
              <Link href="/inventory">
                <Button variant="outline" size="sm" className="mt-3 gap-1.5 w-full">
                  Go to Inventory <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Once you add products, your dashboard will automatically calculate KPIs, charts, and AI-powered alerts.
          </p>
        </div>
      </AppShell>
    )
  }

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
            value={kpi?.totalInventoryValue ?? 0}
            change={kpi?.totalInventoryValueChange ?? 0}
            prefix="Rs."
            icon={DollarSign}
            iconColor="text-primary"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Risk Alerts"
            value={kpi?.riskAlerts ?? 0}
            change={kpi?.riskAlertsChange ?? 0}
            icon={AlertTriangle}
            iconColor="text-destructive"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Forecasted Demand"
            value={kpi?.forecastedDemand ?? 0}
            change={kpi?.forecastedDemandChange ?? 0}
            icon={TrendingUp}
            iconColor="text-primary"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Expiry Alerts"
            value={kpi?.expiryAlerts ?? 0}
            change={kpi?.expiryAlertsChange ?? 0}
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
            value={kpi?.overstockAlerts ?? 0}
            change={kpi?.overstockAlertsChange ?? 0}
            icon={PackageX}
            iconColor="text-info"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Service Level"
            value={kpi?.serviceLevel ?? 0}
            change={kpi?.serviceLevelChange ?? 0}
            suffix="%"
            decimals={1}
            icon={Gauge}
            iconColor="text-success"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Fill Rate"
            value={kpi?.fillRate ?? 0}
            change={kpi?.fillRateChange ?? 0}
            suffix="%"
            decimals={1}
            icon={Percent}
            iconColor="text-primary"
          />
        </StaggerItem>
        <StaggerItem>
          <KpiCard
            title="Inventory Turnover"
            value={kpi?.inventoryTurnover ?? 0}
            change={kpi?.inventoryTurnoverChange ?? 0}
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
          <DemandForecastChart data={data?.demandForecastData} />
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <StockVsDemandChart data={data?.stockVsDemandData} />
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

