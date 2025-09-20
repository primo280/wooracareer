"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { Save, Settings, Database, Mail, Shield, Globe, User, Briefcase } from "lucide-react"
import type { AdminSettings } from "@/types/admin"

interface SettingsPanelProps {
  settings: AdminSettings[]
  onRefresh: () => void
}

export function SettingsPanel({ settings, onRefresh }: SettingsPanelProps) {
  const [platformSettings, setPlatformSettings] = useState({
    platform_name: "Job Board Platform",
    platform_description: "A modern job board platform",
    contact_email: "admin@example.com",
    maintenance_mode: false,
    allow_registrations: true,
    require_email_verification: true,
    max_jobs_per_user: 10,
    application_deadline_days: 30
  })

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load settings from API
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings && data.settings.length > 0) {
          const platformData = data.settings.find((s: AdminSettings) => s.category === "platform")
          if (platformData) {
            setPlatformSettings(platformData.data)
          }
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: "platform",
          data: platformSettings
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        })
        onRefresh()
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setPlatformSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage platform configuration</p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Platform Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Platform Settings
            </CardTitle>
            <CardDescription>
              Basic platform configuration and branding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="platform_name">Platform Name</Label>
                <Input
                  id="platform_name"
                  value={platformSettings.platform_name}
                  onChange={(e) => handleInputChange("platform_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={platformSettings.contact_email}
                  onChange={(e) => handleInputChange("contact_email", e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="platform_description">Platform Description</Label>
              <Textarea
                id="platform_description"
                value={platformSettings.platform_description}
                onChange={(e) => handleInputChange("platform_description", e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              Control user registration and access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow_registrations">Allow New Registrations</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to register on the platform
                </p>
              </div>
              <Switch
                id="allow_registrations"
                checked={platformSettings.allow_registrations}
                onCheckedChange={(checked) => handleInputChange("allow_registrations", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="require_email_verification">Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require email verification for new accounts
                </p>
              </div>
              <Switch
                id="require_email_verification"
                checked={platformSettings.require_email_verification}
                onCheckedChange={(checked) => handleInputChange("require_email_verification", checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Put the platform in maintenance mode
                </p>
              </div>
              <Switch
                id="maintenance_mode"
                checked={platformSettings.maintenance_mode}
                onCheckedChange={(checked) => handleInputChange("maintenance_mode", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Job Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Settings
            </CardTitle>
            <CardDescription>
              Configure job posting limits and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_jobs_per_user">Max Jobs Per User</Label>
                <Input
                  id="max_jobs_per_user"
                  type="number"
                  value={platformSettings.max_jobs_per_user}
                  onChange={(e) => handleInputChange("max_jobs_per_user", parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="application_deadline_days">Default Application Deadline (Days)</Label>
                <Input
                  id="application_deadline_days"
                  type="number"
                  value={platformSettings.application_deadline_days}
                  onChange={(e) => handleInputChange("application_deadline_days", parseInt(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Information
            </CardTitle>
            <CardDescription>
              Current system statistics and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {settings.map((setting) => (
                <div key={setting.category} className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">
                    {Object.keys(setting.data).length}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {setting.category.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
