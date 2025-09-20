"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
} from "lucide-react"

interface StatsData {
  totalJobs: number
  activeJobs: number
  totalApplications: number
  pendingApplications: number
  thisMonthJobs: number
  thisMonthApplications: number
  avgSalary: number
  totalViews: number
}

interface StatsCardsProps {
  stats: StatsData
  loading?: boolean
}

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  const cards = [
    {
      title: "Total Offres",
      value: stats.totalJobs,
      icon: Briefcase,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: stats.thisMonthJobs > 0 ? "up" : "down",
      trendValue: Math.abs(stats.thisMonthJobs),
    },
    {
      title: "Offres Actives",
      value: stats.activeJobs,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "neutral",
      trendValue: 0,
    },
    {
      title: "Total Candidatures",
      value: stats.totalApplications,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: stats.thisMonthApplications > 0 ? "up" : "down",
      trendValue: Math.abs(stats.thisMonthApplications),
    },
    {
      title: "En Attente",
      value: stats.pendingApplications,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      trend: "neutral",
      trendValue: 0,
    },
    {
      title: "Salaire Moyen",
      value: `${stats.avgSalary.toLocaleString()}€`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      trend: "neutral",
      trendValue: 0,
    },
    {
      title: "Total Vues",
      value: stats.totalViews.toLocaleString(),
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      trend: "up",
      trendValue: 12,
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                  {card.trend !== "neutral" && (
                    <div className="flex items-center mt-2">
                      {card.trend === "up" ? (
                        <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                      )}
                      <span className={`text-xs ${
                        card.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {card.trendValue > 0 && `+${card.trendValue}`}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
