"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
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
import { Switch } from "@/components/ui/switch"
import { revalidateAll } from "@/hooks/use-api"

interface AddProductDialogProps {
    onAdd: (product: any) => void
}

export default function AddProductDialog({ onAdd }: AddProductDialogProps) {
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState("")

    // Dynamic data from API
    const [categories, setCategories] = useState<any[]>([])
    const [locations, setLocations] = useState<any[]>([])

    const [form, setForm] = useState({
        name: "",
        sku: "",
        category: "",
        location: "",
        costPrice: "",
        sellingPrice: "",
        stock: "",
        reorderPoint: "10",
        leadTime: "7",
        perishable: false,
    })

    // Fetch categories and locations when dialog opens
    useEffect(() => {
        if (!open) return
        Promise.all([fetch("/api/categories"), fetch("/api/locations")])
            .then(([catRes, locRes]) => Promise.all([catRes.json(), locRes.json()]))
            .then(([cats, locs]) => {
                if (Array.isArray(cats)) setCategories(cats)
                if (Array.isArray(locs)) setLocations(locs)
            })
            .catch((err) => console.error("Failed to load options:", err))
    }, [open])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.sku || !form.category || !form.location) return

        setSaving(true)
        setError("")

        try {
            // Find category ID
            const category = categories.find((c) => c.name === form.category)

            // Create the product
            const productRes = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    sku: form.sku,
                    category_id: category?.id || null,
                    cost_price: Number(form.costPrice) || 0,
                    selling_price: Number(form.sellingPrice) || 0,
                    lead_time_days: Number(form.leadTime) || 7,
                    perishable: form.perishable,
                }),
            })

            if (!productRes.ok) {
                const err = await productRes.json()
                throw new Error(err.error || "Failed to create product")
            }

            const product = await productRes.json()

            // Find location ID
            const location = locations.find((l) => l.name === form.location)
            if (!location) throw new Error("Location not found")

            // Create inventory record
            const stock = Number(form.stock) || 0
            const reorderPoint = Number(form.reorderPoint) || 10
            const status = stock <= 0 ? "critical" : stock <= reorderPoint ? "warning" : "good"

            const invRes = await fetch("/api/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    product_id: product.id,
                    location_id: location.id,
                    current_stock: stock,
                    reserved_stock: 0,
                    reorder_point: reorderPoint,
                    status,
                }),
            })

            if (!invRes.ok) {
                const err = await invRes.json()
                throw new Error(err.error || "Failed to create inventory record")
            }

            const inventoryRecord = await invRes.json()

            // Pass to parent for immediate UI update
            onAdd({
                id: inventoryRecord.id,
                name: form.name,
                sku: form.sku,
                category: form.category,
                location: form.location,
                stock,
                reserved: 0,
                costPrice: Number(form.costPrice) || 0,
                sellingPrice: Number(form.sellingPrice) || 0,
                reorderPoint,
                leadTime: Number(form.leadTime) || 7,
                status,
            })

            // Revalidate ALL SWR caches so dashboard, transfers, etc. pick up the new product
            revalidateAll()

            setForm({ name: "", sku: "", category: "", location: "", costPrice: "", sellingPrice: "", stock: "", reorderPoint: "10", leadTime: "7", perishable: false })
            setOpen(false)
        } catch (err: any) {
            console.error("Add product error:", err)
            setError(err.message || "Failed to save. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const updateField = (field: string, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }))
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError("") }}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] glass-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Add New Product</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Add a product to your inventory. This saves to the database and updates all dashboards.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="mt-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Product Name *</Label>
                            <Input id="name" placeholder="e.g. MacBook Pro" value={form.name} onChange={(e) => updateField("name", e.target.value)} className="bg-background/60" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU *</Label>
                            <Input id="sku" placeholder="e.g. MBP-14-M3" value={form.sku} onChange={(e) => updateField("sku", e.target.value)} className="bg-background/60" required />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select value={form.category} onValueChange={(v) => updateField("category", v)}>
                                <SelectTrigger className="bg-background/60"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Location *</Label>
                            <Select value={form.location} onValueChange={(v) => updateField("location", v)}>
                                <SelectTrigger className="bg-background/60"><SelectValue placeholder="Select" /></SelectTrigger>
                                <SelectContent>
                                    {locations.map((l) => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="costPrice">Cost Price ($)</Label>
                            <Input id="costPrice" type="number" step="0.01" placeholder="0.00" value={form.costPrice} onChange={(e) => updateField("costPrice", e.target.value)} className="bg-background/60" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sellingPrice">Selling Price ($)</Label>
                            <Input id="sellingPrice" type="number" step="0.01" placeholder="0.00" value={form.sellingPrice} onChange={(e) => updateField("sellingPrice", e.target.value)} className="bg-background/60" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Initial Stock</Label>
                            <Input id="stock" type="number" placeholder="0" value={form.stock} onChange={(e) => updateField("stock", e.target.value)} className="bg-background/60" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="reorderPoint">Reorder Point</Label>
                            <Input id="reorderPoint" type="number" value={form.reorderPoint} onChange={(e) => updateField("reorderPoint", e.target.value)} className="bg-background/60" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="leadTime">Lead Time (days)</Label>
                            <Input id="leadTime" type="number" value={form.leadTime} onChange={(e) => updateField("leadTime", e.target.value)} className="bg-background/60" />
                        </div>
                        <div className="flex items-end gap-2 pb-0.5">
                            <Switch checked={form.perishable} onCheckedChange={(v) => updateField("perishable", v)} />
                            <Label className="text-sm">Perishable</Label>
                        </div>
                    </div>
                    {error && (
                        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={!form.name || !form.sku || !form.category || !form.location || saving}>
                            {saving ? "Saving..." : <><Plus className="mr-1.5 h-4 w-4" />Add Product</>}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
