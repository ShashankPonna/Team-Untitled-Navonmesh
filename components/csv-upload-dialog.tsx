"use client"

import { useState, useRef } from "react"
import { Upload, FileUp, X, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface CsvUploadDialogProps {
    onUpload: (data: any[]) => void
    expectedColumns: string[]
    title?: string
    description?: string
    triggerLabel?: string
    triggerVariant?: "default" | "outline"
}

export default function CsvUploadDialog({
    onUpload,
    expectedColumns,
    title = "Upload CSV",
    description = "Upload a CSV file with your data.",
    triggerLabel = "Upload CSV",
    triggerVariant = "outline",
}: CsvUploadDialogProps) {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<any[]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState<"idle" | "preview" | "done">("idle")
    const inputRef = useRef<HTMLInputElement>(null)

    const parseCSV = (text: string) => {
        const lines = text.trim().split("\n")
        if (lines.length < 2) {
            setError("CSV must have at least a header row and one data row.")
            return
        }

        const hdrs = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
        setHeaders(hdrs)

        // Check if expected columns exist
        const missing = expectedColumns.filter((c) => !hdrs.some((h) => h.toLowerCase() === c.toLowerCase()))
        if (missing.length > 0) {
            setError(`Missing columns: ${missing.join(", ")}. Expected: ${expectedColumns.join(", ")}`)
            return
        }

        const rows = lines.slice(1).map((line) => {
            const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""))
            const row: any = {}
            hdrs.forEach((h, i) => {
                const val = vals[i] || ""
                row[h] = isNaN(Number(val)) || val === "" ? val : Number(val)
            })
            return row
        }).filter((row) => Object.values(row).some((v) => v !== ""))

        setPreview(rows.slice(0, 5))
        setError("")
        setStatus("preview")
        return rows
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (!f) return
        if (!f.name.endsWith(".csv")) {
            setError("Please upload a .csv file")
            return
        }
        setFile(f)
        setError("")

        const reader = new FileReader()
        reader.onload = (ev) => {
            const text = ev.target?.result as string
            parseCSV(text)
        }
        reader.readAsText(f)
    }

    const handleConfirm = () => {
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const text = ev.target?.result as string
            const lines = text.trim().split("\n")
            const hdrs = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))
            const rows = lines.slice(1).map((line) => {
                const vals = line.split(",").map((v) => v.trim().replace(/"/g, ""))
                const row: any = {}
                hdrs.forEach((h, i) => {
                    const val = vals[i] || ""
                    row[h] = isNaN(Number(val)) || val === "" ? val : Number(val)
                })
                return row
            }).filter((row) => Object.values(row).some((v) => v !== ""))

            onUpload(rows)
            setStatus("done")
            setTimeout(() => {
                setOpen(false)
                setFile(null)
                setPreview([])
                setHeaders([])
                setStatus("idle")
            }, 1200)
        }
        reader.readAsText(file)
    }

    const reset = () => {
        setFile(null)
        setPreview([])
        setHeaders([])
        setError("")
        setStatus("idle")
        if (inputRef.current) inputRef.current.value = ""
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
            <DialogTrigger asChild>
                <Button variant={triggerVariant} className="gap-2 bg-background/60">
                    <Upload className="h-4 w-4" />
                    {triggerLabel}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px] glass-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">{title}</DialogTitle>
                    <DialogDescription className="text-muted-foreground">{description}</DialogDescription>
                </DialogHeader>

                {status === "done" ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--success)]/15">
                            <Check className="h-7 w-7 text-[var(--success)]" />
                        </div>
                        <p className="text-sm font-medium text-foreground">Upload successful!</p>
                        <p className="text-xs text-muted-foreground">{file?.name} has been imported.</p>
                    </div>
                ) : (
                    <div className="mt-2 space-y-4">
                        {/* Drop zone */}
                        <div
                            className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/80 bg-background/30 p-8 transition-colors hover:border-primary/50 cursor-pointer"
                            onClick={() => inputRef.current?.click()}
                        >
                            <FileUp className="h-8 w-8 text-muted-foreground" />
                            <div className="text-center">
                                <p className="text-sm font-medium text-foreground">
                                    {file ? file.name : "Click to upload or drag & drop"}
                                </p>
                                <p className="text-xs text-muted-foreground">CSV files only</p>
                            </div>
                            {file && (
                                <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); reset() }}>
                                    <X className="mr-1.5 h-3 w-3" />
                                    Remove
                                </Button>
                            )}
                            <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                        </div>

                        {/* Expected format hint */}
                        <div className="rounded-lg bg-background/50 p-3">
                            <p className="text-[11px] font-medium text-muted-foreground mb-1">Expected columns:</p>
                            <p className="text-xs text-foreground font-mono">{expectedColumns.join(", ")}</p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 p-3">
                                <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive shrink-0" />
                                <p className="text-xs text-destructive">{error}</p>
                            </div>
                        )}

                        {/* Preview */}
                        {status === "preview" && preview.length > 0 && (
                            <div>
                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                    Preview (first {preview.length} rows):
                                </p>
                                <div className="overflow-x-auto rounded-lg border border-border">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-border bg-background/50">
                                                {headers.map((h) => (
                                                    <th key={h} className="px-3 py-2 text-left font-medium text-muted-foreground">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {preview.map((row, i) => (
                                                <tr key={i} className="border-b border-border/40 last:border-0">
                                                    {headers.map((h) => (
                                                        <td key={h} className="px-3 py-1.5 text-foreground">{String(row[h] ?? "")}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-1">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button onClick={handleConfirm} disabled={status !== "preview"}>
                                <Upload className="mr-1.5 h-4 w-4" />
                                Import Data
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
