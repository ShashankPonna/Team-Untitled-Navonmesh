/**
 * OptimizationService - Multi-store coordination and transfer suggestions
 */

export interface LocationStock {
  locationId: string
  locationName: string
  locationType: "store" | "warehouse"
  currentStock: number
  avgDailyDemand: number
  leadTimeDays: number
  safetyStock: number
  reorderPoint: number
}

export interface TransferSuggestion {
  productId: string
  fromLocationId: string
  fromLocationName: string
  toLocationId: string
  toLocationName: string
  quantity: number
  reason: string
  priority: "high" | "medium" | "low"
}

export class OptimizationService {
  /**
   * Suggest transfers between locations to balance stock
   */
  static suggestTransfers(
    productId: string,
    locationStocks: LocationStock[]
  ): TransferSuggestion[] {
    const suggestions: TransferSuggestion[] = []

    // Identify surplus and shortage locations
    const surplus = locationStocks.filter(
      (ls) => ls.currentStock > ls.reorderPoint * 2
    )
    const shortage = locationStocks
      .filter((ls) => ls.currentStock <= ls.reorderPoint)
      .sort((a, b) => a.currentStock - b.currentStock) // most urgent first

    for (const short of shortage) {
      const needed = short.reorderPoint - short.currentStock + short.safetyStock

      for (const surp of surplus) {
        const available = surp.currentStock - surp.reorderPoint - surp.safetyStock
        if (available <= 0) continue

        const transferQty = Math.min(needed, available)
        if (transferQty <= 0) continue

        suggestions.push({
          productId,
          fromLocationId: surp.locationId,
          fromLocationName: surp.locationName,
          toLocationId: short.locationId,
          toLocationName: short.locationName,
          quantity: transferQty,
          reason: `${short.locationName} below ROP (${short.currentStock}/${short.reorderPoint}). ${surp.locationName} has ${available} surplus units.`,
          priority:
            short.currentStock < short.safetyStock ? "high" : "medium",
        })

        break // one source per shortage
      }
    }

    return suggestions
  }

  /**
   * Generate warehouse reorder suggestions based on aggregated store forecasts
   */
  static warehouseReorderSuggestion(
    warehouseStock: number,
    aggregatedStoreDemand: number,
    leadTimeDays: number,
    safetyStock: number
  ): { shouldReorder: boolean; suggestedQty: number; urgency: string } {
    const rop = Math.ceil(aggregatedStoreDemand * leadTimeDays + safetyStock)
    const shouldReorder = warehouseStock <= rop

    if (!shouldReorder) {
      return { shouldReorder: false, suggestedQty: 0, urgency: "none" }
    }

    const suggestedQty = Math.ceil(
      aggregatedStoreDemand * leadTimeDays * 1.5 - warehouseStock + safetyStock
    )
    const daysOfStock =
      aggregatedStoreDemand > 0
        ? Math.floor(warehouseStock / aggregatedStoreDemand)
        : Infinity
    const urgency =
      daysOfStock < leadTimeDays
        ? "critical"
        : daysOfStock < leadTimeDays * 2
        ? "high"
        : "medium"

    return { shouldReorder: true, suggestedQty: Math.max(0, suggestedQty), urgency }
  }

  /**
   * Smart redistribution for perishable items
   * Move near-expiry stock from low-demand store to high-demand store
   */
  static suggestPerishableRedistribution(
    locationStocks: (LocationStock & { daysToExpiry?: number })[]
  ): TransferSuggestion[] {
    const suggestions: TransferSuggestion[] = []

    const withExpiry = locationStocks.filter(
      (ls) => ls.daysToExpiry !== undefined && ls.daysToExpiry <= 7
    )
    const highDemand = locationStocks
      .filter((ls) => !ls.daysToExpiry || ls.daysToExpiry > 14)
      .sort((a, b) => b.avgDailyDemand - a.avgDailyDemand)

    for (const expiring of withExpiry) {
      if (highDemand.length === 0) break

      const target = highDemand[0]
      const transferQty = Math.min(
        expiring.currentStock,
        Math.ceil(target.avgDailyDemand * (expiring.daysToExpiry || 3))
      )

      if (transferQty > 0) {
        suggestions.push({
          productId: "",
          fromLocationId: expiring.locationId,
          fromLocationName: expiring.locationName,
          toLocationId: target.locationId,
          toLocationName: target.locationName,
          quantity: transferQty,
          reason: `${transferQty} units expiring in ${expiring.daysToExpiry}d at ${expiring.locationName}. ${target.locationName} has high demand (${target.avgDailyDemand}/day).`,
          priority: "high",
        })
      }
    }

    return suggestions
  }
}
