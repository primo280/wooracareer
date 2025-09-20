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
import { toast } from "@/hooks/use-toast"
import { z } from "zod"
import { createJobSchema } from "@/app/api/admin/jobs/schema"

interface Job {
  id: number
  title: string
  company: string
  location: string
  type: string
  salary_min: number
  salary_max: number
  status: string
  applications: number
  views: number
  posted_at: string
  expires_at: string
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

  // Job form state
  const [jobForm, setJobForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "CDI",
    salary_min: "",
    salary_max: "",
    description: "",
    requirements: "",
    benefits: "",
    skills: "",
    expires_at: "",
  })

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

  // Fetch data effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch jobs
        const jobsResponse = await fetch("/api/admin/jobs")
        const jobsData = await jobsResponse.json()
        if (jobsData.jobs) {
          setJobs(jobsData.jobs)
        }

        // Fetch applications
        const applicationsResponse = await fetch("/api/admin/applications")
        const applicationsData = await applicationsResponse.json()
        if (applicationsData.applications) {
          setApplications(applicationsData.applications)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        // Keep mock data as fallback
      } finally {
        setLoading(false)
      }
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
      salary_min: "",
      salary_max: "",
      description: "",
      requirements: "",
      benefits: "",
      skills: "",
      expires_at: "",
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
      salary_min: job.salary_min.toString(),
      salary_max: job.salary_max.toString(),
      description: "",
      requirements: "",
      benefits: "",
      skills: "",
      expires_at: job.expires_at,
    })
    setShowJobForm(true)
  }

  const handleSaveJob = async () => {
    try {
      // Client-side validation with Zod
      const jobData = {
        ...jobForm,
        salaryMin: Number.parseInt(jobForm.salary_min),
        salaryMax: Number.parseInt(jobForm.salary_max),
        tags: jobForm.skills.split(",").map((s) => s.trim()),
        expiresAt: jobForm.expires_at,
      }

      const validationResult = createJobSchema.safeParse(jobData)
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(", ")
        toast({
          title: "Erreur de validation",
          description: errors,
          variant: "destructive",
        })
        return
      }

      const method = editingJob ? "PUT" : "POST"
      const url = editingJob ? `/api/admin/jobs/${editingJob.id}` : "/api/admin/jobs"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jobData),
      })

      const data = await response.json()

      if (data.success) {
        setShowJobForm(false)
        toast({
          title: "Succès",
          description: editingJob ? "Offre mise à jour avec succès." : "Offre créée avec succès.",
        })
        // Refresh jobs list
        window.location.reload()
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de la sauvegarde",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving job:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde de l'offre.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setJobs(jobs.filter((job) => job.id !== jobId))
      } else {
        alert(data.error || "Erreur lors de la suppression")
      }
    } catch (error) {
      console.error("Error deleting job:", error)
      alert("Erreur lors de la suppression")
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
      console.error("Error updating application:", error)
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

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((job) => job.status === "active").length,
    totalApplications: applications.length,
    pendingApplications: applications.filter((app) => app.status === "pending").length,
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Actif</Badge>
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800">En pause</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800">Expiré</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getApplicationStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>
      case "reviewing":
        return <Badge className="bg-blue-100 text-blue-800">En cours</Badge>
      case "interview":
        return <Badge className="bg-purple-100 text-purple-800">Entretien</Badge>
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepté</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Refusé</Badge>
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tableau de bord Admin</h1>
              <p className="text-gray-600">Gérez vos offres d'emploi et candidatures</p>
            </div>
            <Button onClick={handleCreateJob} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle offre
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Offres</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
                </div>
                <Briefcase className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Offres Actives</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeJobs}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Candidatures</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En Attente</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
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
              <CardHeader>
                <CardTitle>Offres d'emploi ({filteredJobs.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Poste</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Localisation</TableHead>
                      <TableHead>Salaire</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Candidatures</TableHead>
                      <TableHead>Vues</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.company}</TableCell>
                        <TableCell>{job.location}</TableCell>
                        <TableCell>
                          {job.salary_min ? `${job.salary_min.toLocaleString()}€` : '0€'} - {job.salary_max ? `${job.salary_max.toLocaleString()}€` : '0€'}
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>{job.applications}</TableCell>
                        <TableCell>{job.views}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(`/jobs/${job.id}`, "_blank")}>
                                <Eye className="w-4 h-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditJob(job)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteJob(job.id)} className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Candidatures récentes</CardTitle>
                <CardDescription>Gérez les candidatures reçues pour vos offres</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidat</TableHead>
                      <TableHead>Poste</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{application.candidate_name}</div>
                            <div className="text-sm text-gray-500">{application.candidate_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{application.job_title}</TableCell>
                        <TableCell>{new Date(application.applied_at).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell>{getApplicationStatusBadge(application.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleUpdateApplicationStatus(application.id, "reviewing")}
                              >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Marquer en cours
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateApplicationStatus(application.id, "interview")}
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Programmer entretien
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateApplicationStatus(application.id, "accepted")}
                                className="text-green-600"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Accepter
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateApplicationStatus(application.id, "rejected")}
                                className="text-red-600"
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Job Form Dialog */}
      <Dialog open={showJobForm} onOpenChange={setShowJobForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? "Modifier l'offre" : "Créer une nouvelle offre"}</DialogTitle>
            <DialogDescription>Remplissez les informations de l'offre d'emploi</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Label htmlFor="salary_min">Salaire min (€)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={jobForm.salary_min}
                    onChange={(e) => setJobForm({ ...jobForm, salary_min: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="salary_max">Salaire max (€)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={jobForm.salary_max}
                    onChange={(e) => setJobForm({ ...jobForm, salary_max: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expires_at">Date d'expiration</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={jobForm.expires_at}
                  onChange={(e) => setJobForm({ ...jobForm, expires_at: e.target.value })}
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
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button variant="outline" onClick={() => setShowJobForm(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveJob} className="bg-teal-600 hover:bg-teal-700">
              {editingJob ? "Mettre à jour" : "Créer l'offre"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
