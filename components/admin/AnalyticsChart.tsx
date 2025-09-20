"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Users, Briefcase, FileText, Bell } from "lucide-react"
import type { AdminAnalytics } from "@/types/admin"

interface AnalyticsChartProps {
  data: AdminAnalytics
}

export function AnalyticsChart({ data }: AnalyticsChartProps) {
  const { overview, jobsByStatus, applicationsByStatus, recentActivity } = data

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_jobs}</div>
            <p className="text-xs text-muted-foreground">
              {overview.active_jobs} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_applications}</div>
            <p className="text-xs text-muted-foreground">
              {overview.pending_applications} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_users}</div>
            <p className="text-xs text-muted-foreground">
              {overview.total_candidates} candidates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_notifications}</div>
            <p className="text-xs text-muted-foreground">
              {overview.unread_notifications} unread
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Jobs by Status</CardTitle>
          <CardDescription>Distribution of jobs across different statuses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobsByStatus.map((item) => (
            <div key={item.status} className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{item.status}</span>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
                <Progress
                  value={(item.count / Math.max(...jobsByStatus.map(j => j.count))) * 100}
                  className="mt-2"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Applications by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Applications by Status</CardTitle>
          <CardDescription>Distribution of applications across different statuses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {applicationsByStatus.map((item) => (
            <div key={item.status} className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{item.status}</span>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
                <Progress
                  value={(item.count / Math.max(...applicationsByStatus.map(a => a.count))) * 100}
                  className="mt-2"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest jobs and applications from the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center space-x-4">
                <Badge variant={activity.type === 'job' ? 'default' : 'secondary'}>
                  {activity.type}
                </Badge>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
