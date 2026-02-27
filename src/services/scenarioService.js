import { supabase } from '../lib/supabase'

export const getBaselineScenarioData = async () => {
    // In a real app we'd query historical sales or future base forecasts
    // Here we'll generate the baseline using the DB's forecast_data
    const { data, error } = await supabase
        .from('forecast_data')
        .select('forecast_date, predicted_demand')
        .order('forecast_date', { ascending: true })
        .limit(12) // proxy for 12 months

    if (error || !data.length) {
        // Fallback if no data
        return [
            { month: 'Jan', baseline: 4200, stock: 5000 },
            { month: 'Feb', baseline: 4500, stock: 4800 },
            { month: 'Mar', baseline: 5100, stock: 4600 },
            { month: 'Apr', baseline: 4800, stock: 4900 },
            { month: 'May', baseline: 5500, stock: 4400 },
            { month: 'Jun', baseline: 5200, stock: 4700 },
            { month: 'Jul', baseline: 5800, stock: 4200 },
            { month: 'Aug', baseline: 5400, stock: 4500 },
            { month: 'Sep', baseline: 4900, stock: 4800 },
            { month: 'Oct', baseline: 5600, stock: 4300 },
            { month: 'Nov', baseline: 6200, stock: 3900 },
            { month: 'Dec', baseline: 7000, stock: 3500 },
        ]
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return data.map((d, i) => {
        return {
            month: months[i % 12],
            baseline: Math.round(d.predicted_demand || 4000),
            // We invent a base stock for the scenario simulation roughly matching demand
            stock: Math.round((d.predicted_demand || 4000) * 1.1)
        }
    })
}
