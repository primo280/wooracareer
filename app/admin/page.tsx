"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Briefcase,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Shield,
  Home,
  Settings,
  LogOut,
  Filter,
  Download,
  Upload,
} from "lucide-react"
import { toast } from 'react-toastify'
import { z } from "zod"
import { createJobSchema } from "@/app/api/admin/jobs/schema"

interface Job {
  id: number
  title: string
  company: string
  location: string
  type: string
  salaryMin?: number
  salaryMax?: number
  status: string
  applications: number
  views: number
  createdAt: string
  expiresAt?: string
  description?: string
  requirements?: string
  benefits?: string
  tags?: string[]
  jobImage?: string
  jobPdf?: string
}

interface Application {
  id: number
  job_title: string
  candidate_name: string
  candidate_email: string
  status: string
  applied_at: string
  cover_letter: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [stats, setStats] = useState({
    total_jobs: 0,
    active_jobs: 0,
    total_applications: 0,
    pending_applications: 0,
    total_views: 0,
  })
  const [recentJobs, setRecentJobs] = useState<Job[]>([])
  const [recentApplications, setRecentApplications] = useState<Application[]>([])
  const [deleteJobId, setDeleteJobId] = useState<number | null>(null)

  // Job form state
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "CDI",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    benefits: "",
    skills: "",
    companyLogo: "",
    companyWebsite: "",
    expiresAt: "",
    jobImage: "",
    jobPdf: "",
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (data.success) {
        setJobForm(prev => ({ ...prev, jobImage: data.url }))
        toast.success('Image uploadée avec succès')
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload de l\'image')
    }
  }

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (data.success) {
        setJobForm(prev => ({ ...prev, jobPdf: data.url }))
        toast.success('PDF uploadé avec succès')
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload du PDF')
    }
  }

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/sign-in")
      return
    }

    if ((session.user as any)?.role !== "ADMIN") {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  const fetchJobs = async () => {
    try {
      const jobsResponse = await fetch("/api/admin/jobs")
      const jobsData = await jobsResponse.json()
      if (jobsData.jobs) {
        setJobs(jobsData.jobs)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des offres :", error)
    }
  }

  const fetchApplications = async () => {
    try {
      const applicationsResponse = await fetch("/api/admin/applications")
      const applicationsData = await applicationsResponse.json()
      if (applicationsData.applications) {
        setApplications(applicationsData.applications)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des candidatures :", error)
    }
  }

  const fetchStats = async () => {
    try {
      const analyticsResponse = await fetch("/api/admin/analytics")
      const analyticsData = await analyticsResponse.json()
      if (analyticsData.success) {
        if (analyticsData.overview) {
          setStats(analyticsData.overview)
        }
        if (analyticsData.recentJobs) {
          setRecentJobs(analyticsData.recentJobs)
        }
        if (analyticsData.recentApplications) {
          setRecentApplications(analyticsData.recentApplications)
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques :", error)
    }
  }

  // Fetch data effect
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchJobs(),
        fetchApplications(),
        fetchStats()
      ])
      setLoading(false)
    }

    fetchData()
  }, [])

  // If still loading or not authorized, show loading or unauthorized
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!session || (session.user as any)?.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès non autorisé</h2>
          <p className="text-gray-600 mb-4">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <Button onClick={() => router.push("/dashboard")}>Retour au tableau de bord</Button>
        </div>
      </div>
    )
  }

  const handleCreateJob = () => {
    setEditingJob(null)
    setJobForm({
      title: "",
      company: "",
      location: "",
      type: "CDI",
      salaryMin: "",
      salaryMax: "",
      description: "",
      requirements: "",
      benefits: "",
      skills: "",
      companyLogo: "",
      companyWebsite: "",
      expiresAt: "",
      jobImage: "",
      jobPdf: "",
    })
    setShowJobForm(true)
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setJobForm({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salaryMin: job.salaryMin?.toString() || "",
      salaryMax: job.salaryMax?.toString() || "",
      description: job.description || "",
      requirements: job.requirements || "",
      benefits: job.benefits || "",
      skills: job.tags?.join(", ") || "",
      companyLogo: "",
      companyWebsite: "",
      expiresAt: job.expiresAt ? new Date(job.expiresAt).toISOString().split('T')[0] : "",
      jobImage: job.jobImage || "",
      jobPdf: job.jobPdf || "",
    })
    setShowJobForm(true)
  }

  const handleSaveJob = async () => {
    try {
      // Client-side validation with Zod
      const jobData: any = {
        ...jobForm,
        tags: jobForm.skills.split(",").map((s) => s.trim()).filter(s => s.trim()),
      }

      // Handle salary fields
      if (jobForm.salaryMin.trim()) {
        const salaryMin = Number.parseInt(jobForm.salaryMin)
        if (!isNaN(salaryMin) && salaryMin >= 0) {
          jobData.salaryMin = salaryMin
        }
      }
      if (jobForm.salaryMax.trim()) {
        const salaryMax = Number.parseInt(jobForm.salaryMax)
        if (!isNaN(salaryMax) && salaryMax >= 0) {
          jobData.salaryMax = salaryMax
        }
      }

      // Handle expiresAt
      if (jobForm.expiresAt.trim()) {
        const expiresDate = new Date(jobForm.expiresAt)
        if (!isNaN(expiresDate.getTime())) {
          jobData.expiresAt = expiresDate.toISOString()
        }
      }

      const validationResult = createJobSchema.safeParse(jobData)
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(", ")
        toast.error("Erreur de validation : " + errors)
        return
      }

      const method = editingJob ? "PUT" : "POST"
      const url = "/api/admin/jobs"

      const requestData = editingJob ? { id: editingJob.id, ...jobData } : jobData

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (data.success) {
        setShowJobForm(false)
        toast.success(editingJob ? "Offre mise à jour avec succès." : "Offre créée avec succès.")
        // Refresh data
        await Promise.all([fetchJobs(), fetchStats()])
      } else {
        toast.error(data.error || "Erreur lors de la sauvegarde")
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'offre :", error)
      toast.error("Erreur lors de la sauvegarde de l'offre.")
    }
  }

  const handleDeleteJob = (jobId: number) => {
    setDeleteJobId(jobId)
  }

  const confirmDeleteJob = async () => {
    if (!deleteJobId) return

    try {
      const response = await fetch(`/api/admin/jobs?ids=${deleteJobId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Offre supprimée avec succès.")
        await Promise.all([fetchJobs(), fetchStats()])
      } else {
        toast.error(data.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de l'offre :", error)
      toast.error("Erreur lors de la suppression de l'offre.")
    } finally {
      setDeleteJobId(null)
    }
  }

  const handleUpdateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const data = await response.json()

      if (data.success) {
        setApplications(applications.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app)))
      } else {
        alert(data.error || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la candidature :", error)
      alert("Erreur lors de la mise à jour")
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 text-white border-0">Actif</Badge>
      case "paused":
        return <Badge className="bg-yellow-500 text-white border-0">En pause</Badge>
      case "expired":
        return <Badge className="bg-red-500 text-white border-0">Expiré</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500 text-white border-0">En attente</Badge>
      case "reviewing":
        return <Badge className="bg-blue-500 text-white border-0">En cours</Badge>
      case "interview":
        return <Badge className="bg-purple-500 text-white border-0">Entretien</Badge>
      case "accepted":
        return <Badge className="bg-green-500 text-white border-0">Accepté</Badge>
      case "rejected":
        return <Badge className="bg-red-500 text-white border-0">Refusé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de bord Admin</h1>
              <p className="text-sm sm:text-base text-gray-600">Gérez vos offres d'emploi et candidatures</p>
            </div>

            <Button onClick={handleCreateJob} className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle offre
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Offres</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total_jobs}</p>
                  </div>
                  <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Offres Actives</p>
                    <p className="text-2xl sm:text-3xl font-bold text-teal-600">{stats.active_jobs}</p>
                  </div>
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Candidatures</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.total_applications}</p>
                  </div>
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-teal-600" />
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">En Attente</p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pending_applications}</p>
                  </div>
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Vues</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.total_views}</p>
                  </div>
                  <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Offres récentes</CardTitle>
              <CardDescription className="text-sm sm:text-base">Les 5 dernières offres ajoutées</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="space-y-4">
                {recentJobs.length > 0 ? (
                  recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm sm:text-base truncate" title={job.title}>
                          {job.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 truncate" title={job.company}>
                          {job.company}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(job.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`/jobs/${job.id}`, "_blank")}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune offre récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Candidatures récentes</CardTitle>
              <CardDescription className="text-sm sm:text-base">Les 5 dernières candidatures reçues</CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              <div className="space-y-4">
                {recentApplications.length > 0 ? (
                  recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm sm:text-base truncate" title={application.job_title}>
                          {application.job_title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 truncate" title={application.candidate_name}>
                          {application.candidate_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(application.applied_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getApplicationStatusBadge(application.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune candidature récente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">Offres d'emploi</TabsTrigger>
            <TabsTrigger value="applications">Candidatures</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Rechercher par titre ou entreprise..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="paused">En pause</SelectItem>
                      <SelectItem value="expired">Expiré</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Jobs Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl">Offres d'emploi ({filteredJobs.length})</CardTitle>
                </div>
                <Button onClick={handleCreateJob} className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle offre
                </Button>
              </CardHeader>
              <CardContent className="p-0 overflow-visible">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Poste</TableHead>
                        <TableHead className="min-w-[150px]">Entreprise</TableHead>
                        <TableHead className="min-w-[120px]">Localisation</TableHead>
                        <TableHead className="min-w-[120px]">Salaire</TableHead>
                        <TableHead className="min-w-[100px]">Statut</TableHead>
                        <TableHead className="min-w-[80px] text-center">Candid.</TableHead>
                       
                        <TableHead className="min-w-[100px] w-[100px] text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => (
                        <TableRow key={job.id} className="group">
                          <TableCell className="font-medium">
                            <div className="max-w-[200px] truncate" title={job.title}>
                              {job.title}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[150px] truncate" title={job.company}>
                              {job.company}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[120px] truncate" title={job.location}>
                              {job.location}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm whitespace-nowrap">
                              {job.salaryMin ? `${job.salaryMin.toLocaleString()}FCFA` : 'N/A'} - {job.salaryMax ? `${job.salaryMax.toLocaleString()}FCFA` : 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(job.status)}</TableCell>
                          <TableCell className="text-center">{job.applications}</TableCell>
                          
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(`/jobs/${job.id}`, "_blank")}
                                title="Voir l'offre"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditJob(job)}
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteJob(job.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {filteredJobs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune offre trouvée</p>
                    <Button 
                      onClick={handleCreateJob} 
                      className="mt-4 bg-teal-600 hover:bg-teal-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Créer votre première offre
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Candidatures récentes</CardTitle>
                <CardDescription className="text-sm sm:text-base">Gérez les candidatures reçues pour vos offres</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Candidat</TableHead>
                        <TableHead className="min-w-[120px]">Poste</TableHead>
                        <TableHead className="min-w-[100px]">Date</TableHead>
                        <TableHead className="min-w-[100px]">Statut</TableHead>
                        <TableHead className="min-w-[80px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {applications.map((application) => (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium text-sm sm:text-base">{application.candidate_name}</div>
                              <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[140px]" title={application.candidate_email}>
                                {application.candidate_email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[120px] truncate" title={application.job_title}>
                              {application.job_title}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(application.applied_at).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>{getApplicationStatusBadge(application.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem
                                  onClick={() => handleUpdateApplicationStatus(application.id, "reviewing")}
                                  className="cursor-pointer"
                                >
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Marquer en cours
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateApplicationStatus(application.id, "interview")}
                                  className="cursor-pointer"
                                >
                                  <Users className="w-4 h-4 mr-2" />
                                  Programmer entretien
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateApplicationStatus(application.id, "accepted")}
                                  className="text-green-600 cursor-pointer focus:text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Accepter
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateApplicationStatus(application.id, "rejected")}
                                  className="text-red-600 cursor-pointer focus:text-red-600"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Refuser
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Form Dialog */}
      <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{editingJob ? "Modifier l'offre" : "Créer une nouvelle offre"}</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">Remplissez les informations de l'offre d'emploi</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre du poste</Label>
                <Input
                  id="title"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  value={jobForm.company}
                  onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="location">Localisation</Label>
                <Input
                  id="location"
                  value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="type">Type de contrat</Label>
                <Select value={jobForm.type} onValueChange={(value) => setJobForm({ ...jobForm, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CDI">CDI</SelectItem>
                    <SelectItem value="CDD">CDD</SelectItem>
                    <SelectItem value="Stage">Stage</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin">Salaire min (FCFA)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={jobForm.salaryMin}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax">Salaire max (FCFA)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={jobForm.salaryMax}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expiresAt">Date d'expiration</Label>
                <Input
                  id="expiresAt"
                  type="date"
                  value={jobForm.expiresAt}
                  onChange={(e) => setJobForm({ ...jobForm, expiresAt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Exigences</Label>
                <Textarea
                  id="requirements"
                  rows={4}
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="benefits">Avantages</Label>
                <Textarea
                  id="benefits"
                  rows={4}
                  value={jobForm.benefits}
                  onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
                <Input
                  id="skills"
                  value={jobForm.skills}
                  onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                  placeholder="React, Node.js, TypeScript..."
                />
              </div>

              <div>
                <Label htmlFor="companyLogo">Logo de l'entreprise (URL)</Label>
                <Input
                  id="companyLogo"
                  type="url"
                  value={jobForm.companyLogo}
                  onChange={(e) => setJobForm({ ...jobForm, companyLogo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <Label htmlFor="companyWebsite">Site web de l'entreprise (URL)</Label>
                <Input
                  id="companyWebsite"
                  type="url"
                  value={jobForm.companyWebsite}
                  onChange={(e) => setJobForm({ ...jobForm, companyWebsite: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="jobImage">Image de l'offre (optionnel)</Label>
                <Input
                  id="jobImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {jobForm.jobImage && (
                  <img src={jobForm.jobImage} alt="Job image" className="w-32 h-32 object-cover mt-2" />
                )}
              </div>

              <div>
                <Label htmlFor="jobPdf">PDF de l'offre (optionnel)</Label>
                <Input
                  id="jobPdf"
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                />
                {jobForm.jobPdf && (
                  <a href={jobForm.jobPdf} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 block">
                    Voir le PDF
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
            <Button variant="outline" onClick={() => setShowJobForm(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button onClick={handleSaveJob} className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
              {editingJob ? "Mettre à jour" : "Créer l'offre"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteJob} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
