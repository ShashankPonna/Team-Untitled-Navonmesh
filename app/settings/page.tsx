"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  Building2,
  MapPin,
  Users,
  Bell,
  Shield,
  Database,
  Save,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react"
import AppShell from "@/components/app-shell"
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
} from "@/components/scroll-animations"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"



function SettingsContent() {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "business"

  const [businessType, setBusinessType] = useState("multi_store")
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [autoReorder, setAutoReorder] = useState(false)
  const [riskThreshold, setRiskThreshold] = useState("medium")

  // Business config state
  const [bizConfig, setBizConfig] = useState({
    name: "",
    type: "multi_store",
    email: "",
    timezone: "ist",
  })
  const [bizLoading, setBizLoading] = useState(true)
  const [bizSaving, setBizSaving] = useState(false)
  const [bizSaved, setBizSaved] = useState(false)
  const [bizError, setBizError] = useState("")

  // Location state
  const [locations, setLocations] = useState<any[]>([])
  const [locLoading, setLocLoading] = useState(true)
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [locSaving, setLocSaving] = useState(false)
  const [locError, setLocError] = useState("")
  const [newLocation, setNewLocation] = useState({ name: "", type: "store", city: "" })

  // User state
  const [users, setUsers] = useState<any[]>([])
  const [userLoading, setUserLoading] = useState(true)
  const [showAddUser, setShowAddUser] = useState(false)
  const [userSaving, setUserSaving] = useState(false)
  const [userError, setUserError] = useState("")
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "store_manager", location: "All Locations" })

  // Fetch business config from Supabase on mount
  useEffect(() => {
    fetch("/api/business-config")
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setBizConfig({
            name: data.name || "",
            type: data.type || "multi_store",
            email: data.email || "",
            timezone: data.timezone || "ist",
          })
        }
      })
      .catch(() => { })
      .finally(() => setBizLoading(false))
  }, [])

  const handleSaveBizConfig = async () => {
    setBizSaving(true)
    setBizError("")
    setBizSaved(false)
    try {
      const res = await fetch("/api/business-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bizConfig),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save")
      setBizSaved(true)
      setTimeout(() => setBizSaved(false), 3000)
    } catch (err: any) {
      setBizError(err.message)
    } finally {
      setBizSaving(false)
    }
  }

  // Fetch locations from Supabase on mount
  useEffect(() => {
    fetch("/api/locations")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setLocations(data)
      })
      .catch(() => setLocations([]))
      .finally(() => setLocLoading(false))
  }, [])

  // Fetch users from Supabase on mount
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setUsers(data)
      })
      .catch(() => setUsers([]))
      .finally(() => setUserLoading(false))
  }, [])

  const handleAddLocation = async () => {
    if (!newLocation.name || !newLocation.city) return
    setLocSaving(true)
    setLocError("")

    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLocation),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to add location")
      }
      const data = await res.json()
      setLocations((prev) => [...prev, data])
      setNewLocation({ name: "", type: "store", city: "" })
      setShowAddLocation(false)
    } catch (err: any) {
      console.error("Add location error:", err)
      setLocError(err.message || "Could not save to database")
    } finally {
      setLocSaving(false)
    }
  }

  const handleDeleteLocation = async (id: string) => {
    setLocations((prev) => prev.filter((l) => l.id !== id))
    try {
      await fetch("/api/locations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
    } catch (err) {
      console.error("Delete location error:", err)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email) return
    setUserSaving(true)
    setUserError("")

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to add user")
      }
      const data = await res.json()
      setUsers((prev) => [...prev, data])
      setNewUser({ name: "", email: "", role: "store_manager", location: "All Locations" })
      setShowAddUser(false)
    } catch (err: any) {
      console.error("Add user error:", err)
      setUserError(err.message || "Could not save to database")
    } finally {
      setUserSaving(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
    try {
      await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
    } catch (err) {
      console.error("Delete user error:", err)
    }
  }

  return (
    <AppShell>
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-balance">
            Settings
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure your business, locations, users, and system preferences.
          </p>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <Tabs defaultValue={activeTab} className="space-y-6">
          <TabsList className="glass-card h-auto flex-wrap gap-1 p-1">
            <TabsTrigger value="business" className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Building2 className="h-3.5 w-3.5" />
              Business
            </TabsTrigger>
            <TabsTrigger value="locations" className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <MapPin className="h-3.5 w-3.5" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Users className="h-3.5 w-3.5" />
              Users
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Bell className="h-3.5 w-3.5" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-1.5 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Database className="h-3.5 w-3.5" />
              System
            </TabsTrigger>
          </TabsList>

          {/* Business Tab */}
          <TabsContent value="business">
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-6 text-base font-semibold text-foreground">Business Configuration</h3>
              {bizLoading ? (
                <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading config...
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="bizName">Business Name</Label>
                    <Input
                      id="bizName"
                      placeholder="e.g. Acme Corp"
                      value={bizConfig.name}
                      onChange={(e) => setBizConfig(p => ({ ...p, name: e.target.value }))}
                      className="bg-background/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Select value={bizConfig.type} onValueChange={(v) => setBizConfig(p => ({ ...p, type: v }))}>
                      <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_store">Single Store</SelectItem>
                        <SelectItem value="multi_store">Multi-Store Chain</SelectItem>
                        <SelectItem value="warehouse_model">Store + Warehouse</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="e.g. admin@yourcompany.com"
                      value={bizConfig.email}
                      onChange={(e) => setBizConfig(p => ({ ...p, email: e.target.value }))}
                      className="bg-background/60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={bizConfig.timezone} onValueChange={(v) => setBizConfig(p => ({ ...p, timezone: v }))}>
                      <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ist">India (IST)</SelectItem>
                        <SelectItem value="est">Eastern (EST)</SelectItem>
                        <SelectItem value="cst">Central (CST)</SelectItem>
                        <SelectItem value="mst">Mountain (MST)</SelectItem>
                        <SelectItem value="pst">Pacific (PST)</SelectItem>
                        <SelectItem value="gmt">GMT</SelectItem>
                        <SelectItem value="cet">Central Europe (CET)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {bizError && (
                <p className="mt-4 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{bizError}</p>
              )}
              <div className="mt-6 flex items-center justify-end gap-3">
                {bizSaved && <span className="text-xs text-[var(--success)]">✓ Saved successfully</span>}
                <Button className="gap-2" onClick={handleSaveBizConfig} disabled={bizSaving || bizLoading}>
                  {bizSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {bizSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ═══ Locations Tab ═══ */}
          <TabsContent value="locations">
            <div className="glass-card rounded-xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">Manage Locations</h3>
                <Dialog open={showAddLocation} onOpenChange={(v) => { setShowAddLocation(v); setLocError("") }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Add Location
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[420px] glass-card border-border">
                    <DialogHeader>
                      <DialogTitle>Add New Location</DialogTitle>
                      <DialogDescription>Add a new store or warehouse. This saves to the database.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-2 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="locName">Location Name *</Label>
                        <Input id="locName" placeholder="e.g. South Mall" value={newLocation.name} onChange={(e) => setNewLocation((p) => ({ ...p, name: e.target.value }))} className="bg-background/60" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={newLocation.type} onValueChange={(v) => setNewLocation((p) => ({ ...p, type: v }))}>
                            <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="store">Store</SelectItem>
                              <SelectItem value="warehouse">Warehouse</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="locCity">City *</Label>
                          <Input id="locCity" placeholder="e.g. Miami" value={newLocation.city} onChange={(e) => setNewLocation((p) => ({ ...p, city: e.target.value }))} className="bg-background/60" />
                        </div>
                      </div>
                      {locError && (
                        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{locError}</p>
                      )}
                      <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowAddLocation(false)}>Cancel</Button>
                        <Button onClick={handleAddLocation} disabled={!newLocation.name || !newLocation.city || locSaving}>
                          {locSaving ? "Saving..." : <><Plus className="mr-1.5 h-4 w-4" />Add Location</>}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {locLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading locations...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {locations.map((loc) => (
                    <div key={loc.id} className="flex items-center justify-between rounded-lg bg-background/50 p-4 transition-colors hover:bg-background/70">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg",
                          loc.type === "warehouse" ? "bg-primary/10" : "bg-[var(--success)]/10"
                        )}>
                          <MapPin className={cn("h-4 w-4", loc.type === "warehouse" ? "text-primary" : "text-[var(--success)]")} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{loc.name}</p>
                          <p className="text-xs text-muted-foreground">{loc.city} — {loc.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--success)]">
                          Active
                        </span>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteLocation(loc.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ═══ Users Tab ═══ */}
          <TabsContent value="users">
            <div className="glass-card rounded-xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">User Management</h3>
                <Dialog open={showAddUser} onOpenChange={(v) => { setShowAddUser(v); setUserError("") }}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1.5">
                      <Plus className="h-3.5 w-3.5" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[440px] glass-card border-border">
                    <DialogHeader>
                      <DialogTitle>Add New User</DialogTitle>
                      <DialogDescription>Invite a team member. This saves to the database.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-2 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="userName">Full Name *</Label>
                          <Input id="userName" placeholder="Jane Doe" value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))} className="bg-background/60" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="userEmail">Email *</Label>
                          <Input id="userEmail" type="email" placeholder="jane@acmecorp.com" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} className="bg-background/60" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Select value={newUser.role} onValueChange={(v) => setNewUser((p) => ({ ...p, role: v }))}>
                            <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="store_manager">Store Manager</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Assigned Location</Label>
                          <Select value={newUser.location} onValueChange={(v) => setNewUser((p) => ({ ...p, location: v }))}>
                            <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="All Locations">All Locations</SelectItem>
                              {locations.map((loc) => (
                                <SelectItem key={loc.id} value={loc.name}>{loc.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {userError && (
                        <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{userError}</p>
                      )}
                      <div className="flex justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
                        <Button onClick={handleAddUser} disabled={!newUser.name || !newUser.email || userSaving}>
                          {userSaving ? "Saving..." : <><Plus className="mr-1.5 h-4 w-4" />Add User</>}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {userLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading users...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between rounded-lg bg-background/50 p-4 transition-colors hover:bg-background/70">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-medium text-primary">{user.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className={cn(
                            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                            user.role === "admin" ? "bg-primary/10 text-primary" : user.role === "viewer" ? "bg-muted text-muted-foreground" : "bg-[var(--info)]/10 text-[var(--info)]"
                          )}>
                            {user.role === "admin" ? "Admin" : user.role === "viewer" ? "Viewer" : "Store Manager"}
                          </span>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">{user.location}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteUser(user.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-6 text-base font-semibold text-foreground">Notification Preferences</h3>
              <div className="flex flex-col gap-6">
                {[
                  { label: "Email Alerts", description: "Receive critical alerts via email", state: emailAlerts, setter: setEmailAlerts },
                  { label: "Auto Reorder", description: "Automatically create purchase orders when stock hits ROP", state: autoReorder, setter: setAutoReorder },
                ].map((setting) => (
                  <div key={setting.label} className="flex items-center justify-between rounded-lg bg-background/50 p-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch checked={setting.state} onCheckedChange={setting.setter} />
                  </div>
                ))}
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Risk Alert Threshold</p>
                    <p className="text-xs text-muted-foreground">Minimum severity to trigger notifications</p>
                  </div>
                  <Select value={riskThreshold} onValueChange={setRiskThreshold}>
                    <SelectTrigger className="w-[130px] bg-background/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <div className="glass-card rounded-xl p-6">
              <h3 className="mb-6 text-base font-semibold text-foreground">System Configuration</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Forecast Model</Label>
                  <Select defaultValue="moving_avg">
                    <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="moving_avg">Moving Average</SelectItem>
                      <SelectItem value="arima">ARIMA</SelectItem>
                      <SelectItem value="prophet">Prophet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Default Forecast Period</Label>
                  <Select defaultValue="30">
                    <SelectTrigger className="bg-background/60"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="14">14 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zScore">Z-Score (Safety Stock)</Label>
                  <Input id="zScore" type="number" defaultValue="1.65" step="0.05" className="bg-background/60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryThreshold">Expiry Alert (days before)</Label>
                  <Input id="expiryThreshold" type="number" defaultValue="7" className="bg-background/60" />
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save System Config
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </ScrollReveal>
    </AppShell>
  )
}

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  )
}
