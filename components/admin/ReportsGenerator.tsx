"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import { FileText, Download, Calendar, Users, Briefcase, TrendingUp } from "lucide-react"
import type { AdminReport, GenerateReportRequest } from "@/types/admin"

interface ReportsGeneratorProps {
  reports: AdminReport[]
  onRefresh: () => void
}

export function ReportsGenerator({ reports, onRefresh }: ReportsGeneratorProps) {
  const [selectedReportType, setSelectedReportType] = useState<string>("")
  const [dateRange, setDateRange] = useState<string>("30")
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any[]>([])

  const handleGenerateReport = async () => {
    if (!selectedReportType) {
      toast({
        title: "Error",
        description: "Please select a report type",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const request: GenerateReportRequest = {
        reportType: selectedReportType as any,
        dateRange,
      }

      const response = await fetch("/api/admin/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      })

      if (response.ok) {
        const data = await response.json()
        setReportData(data.data || [])
        toast({
          title: "Success",
          description: "Report generated successfully",
        })
      } else {
        throw new Error("Failed to generate report")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = () => {
    if (reportData.length === 0) {
      toast({
        title: "Error",
        description: "No report data to download",
        variant: "destructive",
      })
      return
    }

    const csvContent = convertToCSV(reportData)
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedReportType}_report_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Report downloaded successfully",
    })
  }

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return ""

    const headers = Object.keys(data[0])
    const csvRows = [
      headers.join(","),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header]
          return typeof value === "string" && value.includes(",") ? `"${value}"` : value
        }).join(",")
      )
    ]

    return csvRows.join("\n")
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case "jobs":
        return <Briefcase className="h-5 w-5" />
      case "applications":
        return <FileText className="h-5 w-5" />
      case "users":
        return <Users className="h-5 w-5" />
      case "overview":
        return <TrendingUp className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getReportDescription = (type: string) => {
    switch (type) {
      case "jobs":
        return "Generate a report of all jobs with statistics"
      case "applications":
        return "Generate a report of all applications with candidate details"
      case "users":
        return "Generate a report of all users and their activity"
      case "overview":
        return "Generate a comprehensive overview report"
      default:
        return "Generate a custom report"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reports</h2>
          <p className="text-muted-foreground">Generate and download platform reports</p>
        </div>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </CardTitle>
          <CardDescription>
            Select a report type and generate downloadable reports
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jobs">Jobs Report</SelectItem>
                  <SelectItem value="applications">Applications Report</SelectItem>
                  <SelectItem value="users">Users Report</SelectItem>
                  <SelectItem value="overview">Overview Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="dateRange">Date Range (Days)</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={loading || !selectedReportType}
              className="bg-teal-600 hover:bg-teal-700"
            >
              {loading ? "Generating..." : "Generate Report"}
            </Button>
            {reportData.length > 0 && (
              <Button onClick={handleDownloadReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {reportData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              {reportData.length} records found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(reportData[0]).map((header) => (
                      <TableHead key={header} className="capitalize">
                        {header.replace(/([A-Z])/g, ' $1').trim()}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <TableCell key={cellIndex}>
                          {typeof value === "boolean" ? (
                            <Badge variant={value ? "default" : "secondary"}>
                              {value ? "Yes" : "No"}
                            </Badge>
                          ) : (
                            String(value || "")
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {reportData.length > 10 && (
              <div className="text-center mt-4 text-sm text-muted-foreground">
                Showing first 10 records. Download CSV for complete data.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Reports */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Reports
            </CardTitle>
            <CardDescription>
              Previously generated reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getReportIcon(report.reportType)}
                    <div>
                      <div className="font-medium capitalize">
                        {report.reportType} Report
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Generated on {new Date(report.generatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {report.data.length} records
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
