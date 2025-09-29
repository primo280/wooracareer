"use client"

import { useState, useEffect } from "react"
import { AnalyticsChart } from "@/components/admin/AnalyticsChart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, BarChart3, TrendingUp } from "lucide-react"
import type { AdminAnalytics } from "@/types/admin"

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchAnalytics()
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export analytics data')
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analyses</h1>
            <p className="text-muted-foreground">
              Analyses complètes de la plateforme et insights
            </p>
          </div>
        </div>
        <div>Chargement des analyses...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Analyses</h1>
            <p className="text-muted-foreground">
              Analyses complètes de la plateforme et insights
            </p>
          </div>
        </div>
        <div>Erreur lors du chargement des données d'analyse</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analyses</h1>
          <p className="text-muted-foreground">
            Analyses complètes de la plateforme et insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleExport} className="bg-teal-600 hover:bg-teal-700">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Santé de la plateforme</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{analytics.overview.active_jobs > 0 ? 'Active' : 'Inactive'}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.overview.active_jobs} offres actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des candidatures</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-700">{analytics.overview.total_applications}</div>
            <p className="text-xs text-muted-foreground">
              Candidatures de tous les temps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement des utilisateurs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-500">
              {analytics.overview.total_users > 0 ? ((analytics.overview.total_applications / analytics.overview.total_users) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Candidatures par utilisateur
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-800">
              {analytics.overview.total_jobs > 0 ? ((analytics.overview.total_applications / analytics.overview.total_jobs) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Candidatures par offre
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Chart */}
      <AnalyticsChart data={analytics} />
    </div>
  )
}
