/**
 * Export an array of objects to CSV and trigger a browser download.
 */
export function exportToCSV(data: Record<string, any>[], filename: string) {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvRows = [
        headers.join(","),
        ...data.map((row) =>
            headers
                .map((h) => {
                    const val = row[h]
                    // Wrap strings containing commas/quotes in double-quotes
                    if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
                        return `"${val.replace(/"/g, '""')}"`
                    }
                    return val ?? ""
                })
                .join(",")
        ),
    ]

    const csvString = csvRows.join("\n")
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}
