"use client"

import { type LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import AnimatedCounter from "./animated-counter"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: number
  change: number
  prefix?: string
  suffix?: string
  icon: LucideIcon
  iconColor?: string
  decimals?: number
}

export default function KpiCard({
  title,
  value,
  change,
  prefix = "",
  suffix = "",
  icon: Icon,
  iconColor = "text-primary",
  decimals = 0,
}: KpiCardProps) {
  const isPositive = change >= 0

  return (
    <div className="glass-card rounded-xl p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            decimals={decimals}
            className="text-2xl font-bold text-foreground"
          />
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            iconColor === "text-primary" && "bg-primary/10",
            iconColor === "text-destructive" && "bg-destructive/10",
            iconColor === "text-success" && "bg-[var(--success)]/10",
            iconColor === "text-warning" && "bg-[var(--warning)]/10",
            iconColor === "text-info" && "bg-[var(--info)]/10"
          )}
        >
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        {isPositive ? (
          <TrendingUp className="h-3.5 w-3.5 text-[var(--success)]" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
        )}
        <span
          className={cn(
            "text-xs font-medium",
            isPositive ? "text-[var(--success)]" : "text-destructive"
          )}
        >
          {isPositive ? "+" : ""}
          {change}%
        </span>
        <span className="text-xs text-muted-foreground">vs last month</span>
      </div>
    </div>
  )
}
