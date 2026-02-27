// ─── Mock Data for OptiStock AI ─────────────────────────────────────────────

export const kpiData = {
  totalInventoryValue: 2847650,
  totalInventoryValueChange: 12.5,
  riskAlerts: 23,
  riskAlertsChange: -8.3,
  forecastedDemand: 18420,
  forecastedDemandChange: 15.2,
  expiryAlerts: 7,
  expiryAlertsChange: -22.1,
  overstockAlerts: 12,
  overstockAlertsChange: 5.4,
  serviceLevel: 96.8,
  fillRate: 94.2,
  stockoutRate: 3.2,
  inventoryTurnover: 8.4,
}

export const demandForecastData = [
  { date: "Jan", actual: 4200, predicted: 4050, lower: 3700, upper: 4400 },
  { date: "Feb", actual: 3800, predicted: 3900, lower: 3500, upper: 4300 },
  { date: "Mar", actual: 5100, predicted: 4850, lower: 4400, upper: 5300 },
  { date: "Apr", actual: 4700, predicted: 4800, lower: 4300, upper: 5300 },
  { date: "May", actual: 5500, predicted: 5350, lower: 4900, upper: 5800 },
  { date: "Jun", actual: 6200, predicted: 5900, lower: 5400, upper: 6400 },
  { date: "Jul", actual: null, predicted: 6300, lower: 5700, upper: 6900 },
  { date: "Aug", actual: null, predicted: 6800, lower: 6100, upper: 7500 },
  { date: "Sep", actual: null, predicted: 5900, lower: 5200, upper: 6600 },
]

export const stockVsDemandData = [
  { name: "Electronics", stock: 4500, demand: 3800 },
  { name: "Clothing", stock: 3200, demand: 3600 },
  { name: "Food", stock: 2800, demand: 3100 },
  { name: "Home", stock: 2100, demand: 1800 },
  { name: "Sports", stock: 1500, demand: 1900 },
  { name: "Beauty", stock: 1800, demand: 1600 },
]

export const storeComparisonData = [
  { store: "Downtown", revenue: 125000, efficiency: 94, stockouts: 2 },
  { store: "Mall Central", revenue: 98000, efficiency: 88, stockouts: 5 },
  { store: "Airport", revenue: 78000, efficiency: 91, stockouts: 3 },
  { store: "Suburb East", revenue: 65000, efficiency: 85, stockouts: 7 },
  { store: "Warehouse A", revenue: 210000, efficiency: 97, stockouts: 1 },
]

export const riskHeatmapData = [
  { location: "Downtown", product: "Laptops", risk: 0.85, type: "stockout" as const },
  { location: "Downtown", product: "Headphones", risk: 0.3, type: "safe" as const },
  { location: "Downtown", product: "Cables", risk: 0.15, type: "overstock" as const },
  { location: "Mall Central", product: "Laptops", risk: 0.45, type: "medium" as const },
  { location: "Mall Central", product: "Headphones", risk: 0.92, type: "stockout" as const },
  { location: "Mall Central", product: "Cables", risk: 0.6, type: "medium" as const },
  { location: "Airport", product: "Laptops", risk: 0.2, type: "safe" as const },
  { location: "Airport", product: "Headphones", risk: 0.7, type: "stockout" as const },
  { location: "Airport", product: "Cables", risk: 0.35, type: "safe" as const },
  { location: "Suburb East", product: "Laptops", risk: 0.55, type: "medium" as const },
  { location: "Suburb East", product: "Headphones", risk: 0.1, type: "overstock" as const },
  { location: "Suburb East", product: "Cables", risk: 0.8, type: "stockout" as const },
]

export const alertsData = [
  { id: 1, type: "reorder" as const, severity: "high" as const, product: "MacBook Pro 14", location: "Downtown", message: "Stock below reorder point. Current: 5, ROP: 15. Suggested order: 50 units.", time: "2 min ago" },
  { id: 2, type: "transfer" as const, severity: "medium" as const, product: "AirPods Pro", location: "Mall Central", message: "Surplus at Warehouse A (200 units). Transfer 80 to Mall Central recommended.", time: "15 min ago" },
  { id: 3, type: "expiry" as const, severity: "high" as const, product: "Organic Milk 1L", location: "Suburb East", message: "48 units expiring in 3 days. Suggest 25% discount for clearance.", time: "30 min ago" },
  { id: 4, type: "stockout" as const, severity: "high" as const, product: "USB-C Hub", location: "Airport", message: "Predicted stockout in 2 days. Lead time is 5 days. Expedite order.", time: "1 hr ago" },
  { id: 5, type: "overstock" as const, severity: "low" as const, product: "Phone Cases", location: "Warehouse A", message: "180 days of inventory on hand. Consider redistribution or promotion.", time: "2 hrs ago" },
  { id: 6, type: "supplier_delay" as const, severity: "medium" as const, product: "Samsung TV 65", location: "Downtown", message: "Supplier delivery delayed by 7 days. New ETA: Mar 15. Adjust ROP.", time: "3 hrs ago" },
]

export const inventoryItems = [
  { id: 1, name: "MacBook Pro 14\"", sku: "ELEC-001", category: "Electronics", location: "Downtown", stock: 5, reserved: 2, costPrice: 1499, sellingPrice: 1999, leadTime: 7, reorderPoint: 15, status: "critical" as const },
  { id: 2, name: "AirPods Pro", sku: "ELEC-002", category: "Electronics", location: "Mall Central", stock: 12, reserved: 3, costPrice: 189, sellingPrice: 249, leadTime: 5, reorderPoint: 20, status: "warning" as const },
  { id: 3, name: "USB-C Hub", sku: "ELEC-003", category: "Electronics", location: "Airport", stock: 45, reserved: 5, costPrice: 29, sellingPrice: 49, leadTime: 3, reorderPoint: 30, status: "good" as const },
  { id: 4, name: "Organic Milk 1L", sku: "FOOD-001", category: "Food", location: "Suburb East", stock: 120, reserved: 0, costPrice: 3.5, sellingPrice: 5.99, leadTime: 2, reorderPoint: 50, status: "expiring" as const },
  { id: 5, name: "Nike Air Max", sku: "SPRT-001", category: "Sports", location: "Downtown", stock: 85, reserved: 10, costPrice: 89, sellingPrice: 149, leadTime: 14, reorderPoint: 25, status: "good" as const },
  { id: 6, name: "Samsung TV 65\"", sku: "ELEC-004", category: "Electronics", location: "Warehouse A", stock: 200, reserved: 15, costPrice: 799, sellingPrice: 1299, leadTime: 10, reorderPoint: 30, status: "overstock" as const },
  { id: 7, name: "Phone Cases Assorted", sku: "ACCS-001", category: "Accessories", location: "Warehouse A", stock: 540, reserved: 20, costPrice: 5, sellingPrice: 19.99, leadTime: 7, reorderPoint: 100, status: "overstock" as const },
  { id: 8, name: "Wireless Mouse", sku: "ELEC-005", category: "Electronics", location: "Airport", stock: 8, reserved: 1, costPrice: 19, sellingPrice: 39.99, leadTime: 4, reorderPoint: 15, status: "warning" as const },
]

export const transferHistory = [
  { id: 1, product: "AirPods Pro", from: "Warehouse A", to: "Mall Central", quantity: 80, status: "in_transit" as const, date: "2026-02-25" },
  { id: 2, product: "USB-C Hub", from: "Warehouse A", to: "Airport", quantity: 50, status: "completed" as const, date: "2026-02-23" },
  { id: 3, product: "Phone Cases", from: "Warehouse A", to: "Downtown", quantity: 100, status: "pending" as const, date: "2026-02-27" },
  { id: 4, product: "Nike Air Max", from: "Downtown", to: "Suburb East", quantity: 20, status: "completed" as const, date: "2026-02-20" },
  { id: 5, product: "Wireless Mouse", from: "Warehouse A", to: "Airport", quantity: 30, status: "in_transit" as const, date: "2026-02-26" },
]

export const locations = [
  { id: 1, name: "Downtown", type: "store" as const, city: "New York", products: 124, totalValue: 485000 },
  { id: 2, name: "Mall Central", type: "store" as const, city: "Los Angeles", products: 98, totalValue: 320000 },
  { id: 3, name: "Airport", type: "store" as const, city: "Chicago", products: 76, totalValue: 210000 },
  { id: 4, name: "Suburb East", type: "store" as const, city: "Houston", products: 85, totalValue: 175000 },
  { id: 5, name: "Warehouse A", type: "warehouse" as const, city: "Dallas", products: 342, totalValue: 1657650 },
]

export const forecastAccuracyData = [
  { month: "Oct", mape: 8.2 },
  { month: "Nov", mape: 6.5 },
  { month: "Dec", mape: 12.1 },
  { month: "Jan", mape: 5.8 },
  { month: "Feb", mape: 4.3 },
  { month: "Mar", mape: 3.9 },
]

export const costMetrics = {
  holdingCost: 142382,
  holdingCostChange: -3.2,
  lostRevenue: 34500,
  lostRevenueChange: -18.5,
  inventoryValue: 2847650,
  inventoryValueChange: 12.5,
  wasteReduction: 67.3,
  wasteReductionChange: 15.8,
}
