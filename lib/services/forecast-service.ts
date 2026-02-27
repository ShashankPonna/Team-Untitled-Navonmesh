/**
 * ForecastService - AI Demand Forecasting Logic
 * Implements Moving Average and ARIMA-style predictions
 */

export interface DemandPoint {
  date: string
  quantity: number
}

export interface ForecastResult {
  date: string
  predicted: number
  lower: number
  upper: number
  model: string
}

export class ForecastService {
  /**
   * Moving Average forecast
   * @param history - historical demand data
   * @param window - number of periods for moving average
   * @param periods - number of future periods to predict
   */
  static movingAverage(
    history: DemandPoint[],
    window: number = 7,
    periods: number = 30
  ): ForecastResult[] {
    const values = history.map((h) => h.quantity)
    const results: ForecastResult[] = []
    const extendedValues = [...values]

    for (let i = 0; i < periods; i++) {
      const start = Math.max(0, extendedValues.length - window)
      const slice = extendedValues.slice(start)
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length

      // Standard deviation for confidence interval
      const variance =
        slice.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / slice.length
      const stdDev = Math.sqrt(variance)

      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + i + 1)

      results.push({
        date: futureDate.toISOString().split("T")[0],
        predicted: Math.round(avg),
        lower: Math.round(avg - 1.96 * stdDev),
        upper: Math.round(avg + 1.96 * stdDev),
        model: "moving_average",
      })

      extendedValues.push(avg)
    }

    return results
  }

  /**
   * Simple Exponential Smoothing (lightweight ARIMA alternative)
   */
  static exponentialSmoothing(
    history: DemandPoint[],
    alpha: number = 0.3,
    periods: number = 30
  ): ForecastResult[] {
    const values = history.map((h) => h.quantity)
    if (values.length === 0) return []

    let forecast = values[0]
    const results: ForecastResult[] = []

    // Fit model on historical data
    for (let i = 1; i < values.length; i++) {
      forecast = alpha * values[i] + (1 - alpha) * forecast
    }

    // Calculate residual variance
    const residuals = values.slice(1).map((v, i) => {
      const fitted = alpha * values[i] + (1 - alpha) * (i > 0 ? values[i - 1] : values[0])
      return v - fitted
    })
    const variance =
      residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length
    const stdDev = Math.sqrt(variance)

    for (let i = 0; i < periods; i++) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + i + 1)
      const widening = Math.sqrt(i + 1)

      results.push({
        date: futureDate.toISOString().split("T")[0],
        predicted: Math.round(forecast),
        lower: Math.round(forecast - 1.96 * stdDev * widening),
        upper: Math.round(forecast + 1.96 * stdDev * widening),
        model: "exponential_smoothing",
      })
    }

    return results
  }

  /**
   * Calculate Mean Absolute Percentage Error (MAPE)
   */
  static calculateMAPE(actual: number[], predicted: number[]): number {
    if (actual.length !== predicted.length || actual.length === 0) return 0
    const sum = actual.reduce((acc, a, i) => {
      if (a === 0) return acc
      return acc + Math.abs((a - predicted[i]) / a)
    }, 0)
    return (sum / actual.length) * 100
  }

  /**
   * Aggregate store-level forecasts for warehouse demand
   */
  static aggregateForWarehouse(
    storeForecastsMap: Map<string, ForecastResult[]>
  ): ForecastResult[] {
    const aggregated: Map<string, { predicted: number; lower: number; upper: number }> = new Map()

    for (const forecasts of storeForecastsMap.values()) {
      for (const f of forecasts) {
        const existing = aggregated.get(f.date) || { predicted: 0, lower: 0, upper: 0 }
        aggregated.set(f.date, {
          predicted: existing.predicted + f.predicted,
          lower: existing.lower + f.lower,
          upper: existing.upper + f.upper,
        })
      }
    }

    return Array.from(aggregated.entries()).map(([date, vals]) => ({
      date,
      ...vals,
      model: "aggregated",
    }))
  }
}
