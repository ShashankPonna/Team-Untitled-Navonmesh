"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { revalidateAll } from "@/hooks/use-api"

interface NewTransferDialogProps {
    onAdd: (transfer: any) => void
}

export default function NewTransferDialog({ onAdd }: NewTransferDialogProps) {
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    // Dynamic data from API
    const [products, setProducts] = useState<any[]>([])
    const [locations, setLocations] = useState<any[]>([])

    const [form, setForm] = useState({
        product: "",
        from: "",
        to: "",
        quantity: "",
        notes: "",
    })

    // Fetch products and locations when dialog opens
    useEffect(() => {
        if (!open) return
        Promise.all([fetch("/api/products"), fetch("/api/locations")])
            .then(([prodRes, locRes]) => Promise.all([prodRes.json(), locRes.json()]))
            .then(([prods, locs]) => {
                if (Array.isArray(prods)) setProducts(prods)
                if (Array.isArray(locs)) setLocations(locs)
            })
            .catch((err) => console.error("Failed to load options:", err))
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.product || !form.from || !form.to || !form.quantity || form.from === form.to) return

        setSaving(true)
        setError("")

        try {
            // Find product and location IDs from fetched data
            const product = products.find((p) => p.name === form.product)
            const fromLoc = locations.find((l) => l.name === form.from)
            const toLoc = locations.find((l) => l.name === form.to)

            if (!product) throw new Error("Product not found")
            if (!fromLoc || !toLoc) throw new Error("Location not found")

            const res = await fetch("/api/transfers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: product.id,
                    from_location_id: fromLoc.id,
                    to_location_id: toLoc.id,
                    quantity: Number(form.quantity),
                    status: "pending",
                    notes: form.notes || null,
                }),
            })

            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to create transfer")
            }

            const transfer = await res.json()

            onAdd({
                id: transfer.id,
                product: form.product,
                from: form.from,
                to: form.to,
                quantity: Number(form.quantity),
                status: "pending",
                date: new Date().toISOString().split("T")[0],
                notes: form.notes,
            })

            // Revalidate all caches
            revalidateAll()

            setForm({ product: "", from: "", to: "", quantity: "", notes: "" })
            setOpen(false)
        } catch (err: any) {
            console.error("Create transfer error:", err)
            setError(err.message || "Failed to save. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const updateField = (field: string, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    const locationNames = locations.map((l) => l.name)

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError("") }}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Transfer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px] glass-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Create Transfer</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Move stock between locations. Products and locations are loaded from the database.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                    <div className="space-y-2">
                        <Label>Product *</Label>
                        <Select value={form.product} onValueChange={(v) => updateField("product", v)}>
                            <SelectTrigger className="bg-background/60"><SelectValue placeholder={products.length ? "Select product" : "Loading..."} /></SelectTrigger>
                            <SelectContent>
                                {products.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
                        <div className="space-y-2">
                            <Label>From *</Label>
                            <Select value={form.from} onValueChange={(v) => updateField("from", v)}>
                                <SelectTrigger className="bg-background/60"><SelectValue placeholder="Source" /></SelectTrigger>
                                <SelectContent>
                                    {locationNames.filter((l) => l !== form.to).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <ArrowRight className="mb-2 h-4 w-4 text-muted-foreground" />
                        <div className="space-y-2">
                            <Label>To *</Label>
                            <Select value={form.to} onValueChange={(v) => updateField("to", v)}>
                                <SelectTrigger className="bg-background/60"><SelectValue placeholder="Destination" /></SelectTrigger>
                                <SelectContent>
                                    {locationNames.filter((l) => l !== form.from).map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="qty">Quantity *</Label>
                        <Input id="qty" type="number" min="1" placeholder="Enter quantity" value={form.quantity} onChange={(e) => updateField("quantity", e.target.value)} className="bg-background/60" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (optional)</Label>
                        <Textarea id="notes" placeholder="Reason for transfer..." value={form.notes} onChange={(e) => updateField("notes", e.target.value)} className="bg-background/60 resize-none" rows={2} />
                    </div>
                    {error && (
                        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={!form.product || !form.from || !form.to || !form.quantity || form.from === form.to || saving}>
                            {saving ? "Saving..." : <><Plus className="mr-1.5 h-4 w-4" />Create Transfer</>}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
