/**
 * InventoryService - Stock management and reorder intelligence
 */

export interface InventoryItem {
  productId: string
  locationId: string
  currentStock: number
  reservedStock: number
  avgDailyDemand: number
  leadTimeDays: number
  holdingCostPercent: number
  costPrice: number
  sellingPrice: number
  perishable: boolean
  expiryDate?: string
}

export interface ReorderSuggestion {
  productId: string
  locationId: string
  currentStock: number
  reorderPoint: number
  safetyStock: number
  suggestedQuantity: number
  suggestedDate: string
  estimatedCost: number
}

export class InventoryService {
  static readonly DEFAULT_Z_SCORE = 1.65 // 95% service level

  /**
   * Calculate Safety Stock
   * Safety Stock = Z * StdDev(demand) * sqrt(LeadTime)
   */
  static calculateSafetyStock(
    stdDevDemand: number,
    leadTimeDays: number,
    zScore: number = this.DEFAULT_Z_SCORE
  ): number {
    return Math.ceil(zScore * stdDevDemand * Math.sqrt(leadTimeDays))
  }

  /**
   * Calculate Reorder Point
   * ROP = (Avg Daily Demand * Lead Time) + Safety Stock
   */
  static calculateReorderPoint(
    avgDailyDemand: number,
    leadTimeDays: number,
    safetyStock: number
  ): number {
    return Math.ceil(avgDailyDemand * leadTimeDays + safetyStock)
  }

  /**
   * Days of Inventory
   */
  static daysOfInventory(currentStock: number, avgDailyDemand: number): number {
    if (avgDailyDemand <= 0) return Infinity
    return Math.round(currentStock / avgDailyDemand)
  }

  /**
   * Calculate Economic Order Quantity (EOQ)
   * EOQ = sqrt((2 * D * S) / H)
   */
  static calculateEOQ(
    annualDemand: number,
    orderingCost: number,
    holdingCost: number
  ): number {
    if (holdingCost <= 0) return 0
    return Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / holdingCost))
  }

  /**
   * Generate reorder suggestion for an item
   */
  static getReorderSuggestion(
    item: InventoryItem,
    stdDevDemand: number
  ): ReorderSuggestion | null {
    const safetyStock = this.calculateSafetyStock(
      stdDevDemand,
      item.leadTimeDays
    )
    const rop = this.calculateReorderPoint(
      item.avgDailyDemand,
      item.leadTimeDays,
      safetyStock
    )

    const availableStock = item.currentStock - item.reservedStock

    if (availableStock <= rop) {
      const suggestedQty = Math.max(
        rop - availableStock + safetyStock,
        Math.ceil(item.avgDailyDemand * item.leadTimeDays * 1.5)
      )

      const reorderDate = new Date()
      const daysToStockout = item.avgDailyDemand > 0
        ? Math.floor(availableStock / item.avgDailyDemand)
        : 0
      reorderDate.setDate(
        reorderDate.getDate() + Math.max(0, daysToStockout - item.leadTimeDays)
      )

      return {
        productId: item.productId,
        locationId: item.locationId,
        currentStock: item.currentStock,
        reorderPoint: rop,
        safetyStock,
        suggestedQuantity: suggestedQty,
        suggestedDate: reorderDate.toISOString().split("T")[0],
        estimatedCost: suggestedQty * item.costPrice,
      }
    }

    return null
  }

  /**
   * Calculate holding cost
   */
  static calculateHoldingCost(
    avgInventory: number,
    costPerUnit: number,
    holdingPercent: number
  ): number {
    return Math.round(avgInventory * costPerUnit * (holdingPercent / 100))
  }

  /**
   * Calculate inventory turnover
   */
  static inventoryTurnover(
    costOfGoodsSold: number,
    avgInventoryValue: number
  ): number {
    if (avgInventoryValue <= 0) return 0
    return Math.round((costOfGoodsSold / avgInventoryValue) * 10) / 10
  }
}
