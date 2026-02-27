/**
 * RiskService - Stockout, overstock, and perishable risk detection
 */

export type RiskLevel = "high" | "medium" | "safe"
export type AlertType = "stockout" | "overstock" | "expiry" | "reorder" | "transfer" | "supplier_delay"

export interface RiskAssessment {
  productId: string
  locationId: string
  riskLevel: RiskLevel
  riskType: AlertType
  daysToStockout: number
  message: string
  severity: "high" | "medium" | "low"
}

export interface PerishableRisk {
  productId: string
  locationId: string
  daysToExpiry: number
  suggestedDiscount: number
  estimatedRecovery: number
  wastePrevention: number
}

export class RiskService {
  /**
   * Assess stockout risk
   * High: days_to_stockout < lead_time
   * Medium: days_to_stockout < 2 * lead_time
   * Safe: otherwise
   */
  static assessStockoutRisk(
    currentStock: number,
    forecastedDailyDemand: number,
    leadTimeDays: number
  ): { level: RiskLevel; daysToStockout: number } {
    const daysToStockout =
      forecastedDailyDemand > 0
        ? Math.floor(currentStock / forecastedDailyDemand)
        : Infinity

    let level: RiskLevel = "safe"
    if (daysToStockout < leadTimeDays) {
      level = "high"
    } else if (daysToStockout < 2 * leadTimeDays) {
      level = "medium"
    }

    return { level, daysToStockout: Math.min(daysToStockout, 999) }
  }

  /**
   * Assess overstock risk
   */
  static assessOverstockRisk(
    daysOfInventory: number,
    threshold: number = 90
  ): { level: RiskLevel; excess: boolean } {
    if (daysOfInventory > threshold * 2) {
      return { level: "high", excess: true }
    }
    if (daysOfInventory > threshold) {
      return { level: "medium", excess: true }
    }
    return { level: "safe", excess: false }
  }

  /**
   * Assess perishable inventory risk
   */
  static assessPerishableRisk(
    expiryDate: string,
    currentStock: number,
    sellingPrice: number,
    costPrice: number,
    avgDailyDemand: number
  ): PerishableRisk | null {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysToExpiry = Math.ceil(
      (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysToExpiry > 14) return null

    // Units that can be sold before expiry
    const sellableUnits = Math.min(
      currentStock,
      Math.ceil(avgDailyDemand * daysToExpiry)
    )
    const excessUnits = currentStock - sellableUnits

    // Discount suggestion: higher discount for closer to expiry
    let suggestedDiscount = 0
    if (daysToExpiry <= 3) suggestedDiscount = 50
    else if (daysToExpiry <= 7) suggestedDiscount = 25
    else suggestedDiscount = 15

    const discountedPrice = sellingPrice * (1 - suggestedDiscount / 100)
    const estimatedRecovery = excessUnits * discountedPrice
    const totalWasteIfNotActed = excessUnits * costPrice
    const wastePrevention =
      totalWasteIfNotActed > 0
        ? Math.round((estimatedRecovery / totalWasteIfNotActed) * 100)
        : 0

    return {
      productId: "",
      locationId: "",
      daysToExpiry,
      suggestedDiscount,
      estimatedRecovery: Math.round(estimatedRecovery),
      wastePrevention,
    }
  }

  /**
   * Generate comprehensive risk assessment
   */
  static generateRiskAssessment(params: {
    productId: string
    locationId: string
    currentStock: number
    forecastedDailyDemand: number
    leadTimeDays: number
    daysOfInventory: number
    productName: string
    locationName: string
  }): RiskAssessment {
    const stockout = this.assessStockoutRisk(
      params.currentStock,
      params.forecastedDailyDemand,
      params.leadTimeDays
    )

    if (stockout.level === "high") {
      return {
        productId: params.productId,
        locationId: params.locationId,
        riskLevel: "high",
        riskType: "stockout",
        daysToStockout: stockout.daysToStockout,
        message: `${params.productName} at ${params.locationName}: stockout in ${stockout.daysToStockout} days (lead time: ${params.leadTimeDays}d).`,
        severity: "high",
      }
    }

    const overstock = this.assessOverstockRisk(params.daysOfInventory)
    if (overstock.excess && overstock.level === "high") {
      return {
        productId: params.productId,
        locationId: params.locationId,
        riskLevel: "medium",
        riskType: "overstock",
        daysToStockout: stockout.daysToStockout,
        message: `${params.productName} at ${params.locationName}: ${params.daysOfInventory} days of inventory. Consider redistribution.`,
        severity: "low",
      }
    }

    return {
      productId: params.productId,
      locationId: params.locationId,
      riskLevel: stockout.level,
      riskType: stockout.level === "medium" ? "reorder" : "stockout",
      daysToStockout: stockout.daysToStockout,
      message: `${params.productName} at ${params.locationName}: ${stockout.daysToStockout} days of stock remaining.`,
      severity: stockout.level === "medium" ? "medium" : "low",
    }
  }
}
