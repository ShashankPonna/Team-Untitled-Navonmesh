"use client"

import { useState } from "react"
import {
  Building2,
  MapPin,
  Users,
  Bell,
  Shield,
  Database,
  Save,
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
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const [businessType, setBusinessType] = useState("multi_store")
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [autoReorder, setAutoReorder] = useState(false)
  const [riskThreshold, setRiskThreshold] = useState("medium")

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
        <Tabs defaultValue="business" className="space-y-6">
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
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bizName">Business Name</Label>
                  <Input id="bizName" defaultValue="Acme Corp" className="bg-background/60" />
                </div>
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger className="bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
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
                  <Input id="contactEmail" type="email" defaultValue="admin@acmecorp.com" className="bg-background/60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="est">
                    <SelectTrigger className="bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="est">Eastern (EST)</SelectItem>
                      <SelectItem value="cst">Central (CST)</SelectItem>
                      <SelectItem value="mst">Mountain (MST)</SelectItem>
                      <SelectItem value="pst">Pacific (PST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Locations Tab */}
          <TabsContent value="locations">
            <div className="glass-card rounded-xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">Manage Locations</h3>
                <Button size="sm" className="gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  Add Location
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { name: "Downtown Store", type: "store", city: "New York", status: "active" },
                  { name: "Mall Central", type: "store", city: "Los Angeles", status: "active" },
                  { name: "Airport Store", type: "store", city: "Chicago", status: "active" },
                  { name: "Suburb East", type: "store", city: "Houston", status: "active" },
                  { name: "Warehouse A", type: "warehouse", city: "Dallas", status: "active" },
                ].map((loc) => (
                  <div key={loc.name} className="flex items-center justify-between rounded-lg bg-background/50 p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-lg",
                        loc.type === "warehouse" ? "bg-primary/10" : "bg-[var(--success)]/10"
                      )}>
                        <MapPin className={cn("h-4 w-4", loc.type === "warehouse" ? "text-primary" : "text-[var(--success)]")} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{loc.name}</p>
                        <p className="text-xs text-muted-foreground">{loc.city} - {loc.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--success)]">
                        Active
                      </span>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="glass-card rounded-xl p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">User Management</h3>
                <Button size="sm" className="gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Add User
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { name: "John Admin", email: "john@acmecorp.com", role: "admin", location: "All Locations" },
                  { name: "Sarah Manager", email: "sarah@acmecorp.com", role: "store_manager", location: "Downtown Store" },
                  { name: "Mike Inventory", email: "mike@acmecorp.com", role: "store_manager", location: "Mall Central" },
                  { name: "Lisa Warehouse", email: "lisa@acmecorp.com", role: "store_manager", location: "Warehouse A" },
                ].map((user) => (
                  <div key={user.email} className="flex items-center justify-between rounded-lg bg-background/50 p-4">
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
                          user.role === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        )}>
                          {user.role === "admin" ? "Admin" : "Store Manager"}
                        </span>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{user.location}</p>
                      </div>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
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
                    <SelectTrigger className="w-[130px] bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
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
                    <SelectTrigger className="bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
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
                    <SelectTrigger className="bg-background/60">
                      <SelectValue />
                    </SelectTrigger>
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
