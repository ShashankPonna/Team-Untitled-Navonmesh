/**
 * SimulationService - What-If Scenario Engine
 */

import { InventoryService } from "./inventory-service"
import { RiskService } from "./risk-service"

export interface SimulationInput {
  currentStock: number
  avgDailyDemand: number
  leadTimeDays: number
  costPrice: number
  sellingPrice: number
  holdingCostPercent: number
  stdDevDemand: number
  demandMultiplier: number
  leadTimeDelay: number
}

export interface SimulationResult {
  // Before
  beforeROP: number
  beforeSafetyStock: number
  beforeHoldingCost: number
  beforeStockoutRisk: string
  beforeReorderQty: number
  // After
  afterROP: number
  afterSafetyStock: number
  afterHoldingCost: number
  afterStockoutRisk: string
  afterReorderQty: number
  // Impact
  lostSalesRisk: number
  additionalHoldingCost: number
  daysToStockout: number
}

export class SimulationService {
  static simulate(input: SimulationInput): SimulationResult {
    const {
      currentStock,
      avgDailyDemand,
      leadTimeDays,
      costPrice,
      sellingPrice,
      holdingCostPercent,
      stdDevDemand,
      demandMultiplier,
      leadTimeDelay,
    } = input

    // Before scenario
    const beforeSafetyStock = InventoryService.calculateSafetyStock(
      stdDevDemand,
      leadTimeDays
    )
    const beforeROP = InventoryService.calculateReorderPoint(
      avgDailyDemand,
      leadTimeDays,
      beforeSafetyStock
    )
    const beforeHolding = InventoryService.calculateHoldingCost(
      currentStock,
      costPrice,
      holdingCostPercent
    )
    const beforeRisk = RiskService.assessStockoutRisk(
      currentStock,
      avgDailyDemand,
      leadTimeDays
    )
    const beforeReorderQty = Math.ceil(avgDailyDemand * leadTimeDays * 1.2)

    // After scenario (with disruption)
    const newDemand = avgDailyDemand * demandMultiplier
    const newLeadTime = leadTimeDays + leadTimeDelay
    const newStdDev = stdDevDemand * Math.sqrt(demandMultiplier)

    const afterSafetyStock = InventoryService.calculateSafetyStock(
      newStdDev,
      newLeadTime
    )
    const afterROP = InventoryService.calculateReorderPoint(
      newDemand,
      newLeadTime,
      afterSafetyStock
    )
    const afterHolding = InventoryService.calculateHoldingCost(
      Math.max(currentStock, afterROP),
      costPrice,
      holdingCostPercent
    )
    const afterRisk = RiskService.assessStockoutRisk(
      currentStock,
      newDemand,
      newLeadTime
    )
    const afterReorderQty = Math.ceil(newDemand * newLeadTime * 1.2)

    // Impact metrics
    const excessDemand = Math.max(0, (newDemand - avgDailyDemand) * 30)
    const lostSalesRisk = Math.round(excessDemand * sellingPrice)
    const additionalHoldingCost = afterHolding - beforeHolding

    return {
      beforeROP,
      beforeSafetyStock,
      beforeHoldingCost: beforeHolding,
      beforeStockoutRisk: beforeRisk.level,
      beforeReorderQty,
      afterROP,
      afterSafetyStock,
      afterHoldingCost: afterHolding,
      afterStockoutRisk: afterRisk.level,
      afterReorderQty,
      lostSalesRisk,
      additionalHoldingCost,
      daysToStockout: afterRisk.daysToStockout,
    }
  }
}
