"use client"

import { useState, useEffect } from "react"
import { Plus, Tag } from "lucide-react"
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

    const [categories, setCategories] = useState<any[]>([])
    const [locations, setLocations] = useState<any[]>([])
    const [newCategoryName, setNewCategoryName] = useState("")
    const [showNewCategory, setShowNewCategory] = useState(false)
    const [creatingCategory, setCreatingCategory] = useState(false)

    const [form, setForm] = useState({
        name: "",
        sku: "",
        category: "",
        categoryId: "",
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
                // If no categories, prompt to create one
                if (Array.isArray(cats) && cats.length === 0) setShowNewCategory(true)
            })
            .catch((err) => console.error("Failed to load options:", err))
    }, [open])

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return
        setCreatingCategory(true)
        setError("")
        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategoryName.trim() }),
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || "Failed to create category")
            }
            const newCat = await res.json()
            setCategories((prev) => [...prev, newCat])
            updateField("category", newCat.name)
            updateField("categoryId", newCat.id)
            setNewCategoryName("")
            setShowNewCategory(false)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setCreatingCategory(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.name || !form.sku || !form.categoryId || !form.location) return

        setSaving(true)
        setError("")

        try {
            // Create the product
            const productRes = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    sku: form.sku,
                    category_id: form.categoryId,
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

            revalidateAll()

            setForm({ name: "", sku: "", category: "", categoryId: "", location: "", costPrice: "", sellingPrice: "", stock: "", reorderPoint: "10", leadTime: "7", perishable: false })
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

    const canSubmit = form.name && form.sku && form.categoryId && form.location && !saving

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); setError(""); setShowNewCategory(false) }}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[540px] glass-card border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Add New Product</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Add a product to your inventory. Fills your dashboard with real data.
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
                        {/* Category selector with inline creation */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Category *</Label>
                                <button
                                    type="button"
                                    className="text-[11px] text-primary hover:underline"
                                    onClick={() => setShowNewCategory((p) => !p)}
                                >
                                    {showNewCategory ? "Select existing" : "+ New category"}
                                </button>
                            </div>
                            {showNewCategory ? (
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g. Electronics"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                        className="bg-background/60 flex-1"
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleCreateCategory() } }}
                                    />
                                    <Button type="button" size="sm" onClick={handleCreateCategory} disabled={!newCategoryName.trim() || creatingCategory} className="shrink-0">
                                        {creatingCategory ? "..." : <Tag className="h-4 w-4" />}
                                    </Button>
                                </div>
                            ) : (
                                <Select
                                    value={form.category}
                                    onValueChange={(v) => {
                                        const cat = categories.find((c) => c.name === v)
                                        updateField("category", v)
                                        updateField("categoryId", cat?.id || "")
                                    }}
                                >
                                    <SelectTrigger className="bg-background/60">
                                        <SelectValue placeholder={categories.length === 0 ? "No categories yet" : "Select"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}
                                        {categories.length === 0 && (
                                            <div className="px-3 py-2 text-xs text-muted-foreground">
                                                No categories — click "+ New category" above.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Location *</Label>
                            <Select value={form.location} onValueChange={(v) => updateField("location", v)}>
                                <SelectTrigger className="bg-background/60">
                                    <SelectValue placeholder={locations.length === 0 ? "No locations yet" : "Select"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {locations.map((l) => <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>)}
                                    {locations.length === 0 && (
                                        <div className="px-3 py-2 text-xs text-muted-foreground">
                                            Add a location in Settings first.
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="costPrice">Cost Price ($)</Label>
                            <Input id="costPrice" type="number" step="0.01" min="0" placeholder="0.00" value={form.costPrice} onChange={(e) => updateField("costPrice", e.target.value)} className="bg-background/60" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sellingPrice">Selling Price ($)</Label>
                            <Input id="sellingPrice" type="number" step="0.01" min="0" placeholder="0.00" value={form.sellingPrice} onChange={(e) => updateField("sellingPrice", e.target.value)} className="bg-background/60" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="stock">Initial Stock</Label>
                            <Input id="stock" type="number" min="0" placeholder="0" value={form.stock} onChange={(e) => updateField("stock", e.target.value)} className="bg-background/60" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="reorderPoint">Reorder Point</Label>
                            <Input id="reorderPoint" type="number" min="0" value={form.reorderPoint} onChange={(e) => updateField("reorderPoint", e.target.value)} className="bg-background/60" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="leadTime">Lead Time (days)</Label>
                            <Input id="leadTime" type="number" min="1" value={form.leadTime} onChange={(e) => updateField("leadTime", e.target.value)} className="bg-background/60" />
                        </div>
                        <div className="flex items-end gap-2 pb-0.5">
                            <Switch checked={form.perishable} onCheckedChange={(v) => updateField("perishable", v)} />
                            <Label className="text-sm">Perishable</Label>
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
                    )}
                    {locations.length === 0 && (
                        <p className="text-xs text-[var(--warning)] bg-[var(--warning)]/10 rounded-lg px-3 py-2">
                            ⚠️ You need to add a location in Settings before adding a product.
                        </p>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={!canSubmit}>
                            {saving ? "Saving..." : <><Plus className="mr-1.5 h-4 w-4" />Add Product</>}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
