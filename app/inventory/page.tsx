"use client"

import { useState } from "react"
import {
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PackageX,
  ArrowUpDown,
} from "lucide-react"
import AppShell from "@/components/app-shell"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-animations"
import AnimatedCounter from "@/components/animated-counter"
import { inventoryItems, locations } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const statusConfig = {
  critical: { label: "Critical", color: "bg-destructive/15 text-destructive", icon: AlertTriangle },
  warning: { label: "Low Stock", color: "bg-[var(--warning)]/15 text-[var(--warning)]", icon: AlertTriangle },
  good: { label: "Healthy", color: "bg-[var(--success)]/15 text-[var(--success)]", icon: CheckCircle2 },
  expiring: { label: "Expiring", color: "bg-[var(--warning)]/15 text-[var(--warning)]", icon: Clock },
  overstock: { label: "Overstock", color: "bg-[var(--info)]/15 text-[var(--info)]", icon: PackageX },
}

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [locationFilter, setLocationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<string>("name")
  const [sortAsc, setSortAsc] = useState(true)

  const filtered = inventoryItems
    .filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLocation =
        locationFilter === "all" || item.location === locationFilter
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter
      return matchesSearch && matchesLocation && matchesStatus
    })
    .sort((a, b) => {
      const aVal = a[sortField as keyof typeof a]
      const bVal = b[sortField as keyof typeof b]
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortAsc
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  const totalValue = inventoryItems.reduce(
    (sum, item) => sum + item.stock * item.costPrice,
    0
  )
  const criticalCount = inventoryItems.filter(
    (i) => i.status === "critical"
  ).length
  const lowStockCount = inventoryItems.filter(
    (i) => i.status === "warning"
  ).length

  return (
    <AppShell>
      <ScrollReveal>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
              Inventory Management
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track stock levels, transfers, and alerts per location.
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>
      </ScrollReveal>

      {/* Summary */}
      <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-3" staggerDelay={0.08}>
        <StaggerItem>
          <div className="glass-card rounded-xl p-5">
            <p className="text-xs text-muted-foreground">Total Inventory Value</p>
            <AnimatedCounter value={totalValue} prefix="$" className="text-2xl font-bold text-foreground" />
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="glass-card rounded-xl p-5">
            <p className="text-xs text-muted-foreground">Critical Items</p>
            <AnimatedCounter value={criticalCount} className="text-2xl font-bold text-destructive" />
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="glass-card rounded-xl p-5">
            <p className="text-xs text-muted-foreground">Low Stock Items</p>
            <AnimatedCounter value={lowStockCount} className="text-2xl font-bold text-[var(--warning)]" />
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Filters */}
      <ScrollReveal delay={0.1} className="mt-6">
        <div className="glass-card flex flex-wrap items-center gap-3 rounded-xl p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background/60"
            />
          </div>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-[160px] bg-background/60">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-background/60">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Low Stock</SelectItem>
              <SelectItem value="good">Healthy</SelectItem>
              <SelectItem value="expiring">Expiring</SelectItem>
              <SelectItem value="overstock">Overstock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ScrollReveal>

      {/* Table */}
      <ScrollReveal delay={0.15} className="mt-4">
        <div className="glass-card overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { key: "name", label: "Product" },
                    { key: "sku", label: "SKU" },
                    { key: "category", label: "Category" },
                    { key: "location", label: "Location" },
                    { key: "stock", label: "Stock" },
                    { key: "costPrice", label: "Value" },
                    { key: "status", label: "Status" },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className="px-5 py-3 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => toggleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        <ArrowUpDown className="h-3 w-3 opacity-50" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const config = statusConfig[item.status]
                  const StatusIcon = config.icon
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border/40 transition-colors hover:bg-background/40 last:border-0"
                    >
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-medium text-foreground">{item.name}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-mono text-muted-foreground">{item.sku}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.category}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{item.location}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">{item.stock}</span>
                          {item.reserved > 0 && (
                            <span className="text-[11px] text-muted-foreground">
                              {item.reserved} reserved
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">
                        ${(item.stock * item.costPrice).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="secondary" className={cn("gap-1", config.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {config.label}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No items found matching your filters.
            </div>
          )}
        </div>
      </ScrollReveal>
    </AppShell>
  )
}
