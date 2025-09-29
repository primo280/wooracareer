"use client"

import { useState, useEffect } from "react"
import { JobsTable } from "@/components/admin/JobsTableFixed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Briefcase, Users, TrendingUp, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { z } from "zod"
import { createJobSchema, updateJobSchema } from "@/app/api/admin/jobs/schema"

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

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showJobForm, setShowJobForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
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
    expiresAt: "",
    jobImage: "",
    jobPdf: "",
  })

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/admin/jobs')
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
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
      expiresAt: "",
      jobImage: "",
      jobPdf: "",
    })
    setShowJobForm(true)
  }

  const handleSaveJob = async () => {
    try {
      const jobData: any = {
        title: jobForm.title,
        company: jobForm.company,
        location: jobForm.location,
        type: jobForm.type,
        description: jobForm.description,
        requirements: jobForm.requirements || undefined,
        benefits: jobForm.benefits || undefined,
        tags: jobForm.skills.split(",").map((s) => s.trim()).filter(s => s.trim()),
        jobImage: jobForm.jobImage || undefined,
        jobPdf: jobForm.jobPdf || undefined,
      }

      // Only add salary if provided and valid
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

      // Convert expiresAt to datetime if provided
      if (jobForm.expiresAt.trim()) {
        const expiresDate = new Date(jobForm.expiresAt)
        if (!isNaN(expiresDate.getTime())) {
          jobData.expiresAt = expiresDate.toISOString()
        }
      }

      // Determine if this is an update or create
      const isUpdate = !!editingJob

      const validationResult = isUpdate ? updateJobSchema.safeParse(jobData) : createJobSchema.safeParse(jobData)
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(", ")
        toast({
          title: "Erreur de validation",
          description: errors,
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/admin/jobs", {
        method: isUpdate ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(isUpdate ? { id: editingJob.id, ...jobData } : jobData),
      })

      const data = await response.json()

      if (data.success) {
        setShowJobForm(false)
        toast({
          title: "Succès",
          description: isUpdate ? "Offre mise à jour avec succès." : "Offre créée avec succès.",
        })
        fetchJobs()
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
      expiresAt: job.expiresAt ? new Date(job.expiresAt).toISOString().split('T')[0] : "",
      jobImage: job.jobImage || "",
      jobPdf: job.jobPdf || "",
    })
    setShowJobForm(true)
  }

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/jobs?ids=${jobId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Succès",
          description: "Offre supprimée avec succès.",
        })
        fetchJobs()
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de la suppression",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting job:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression de l'offre.",
        variant: "destructive",
      })
    }
  }

  const handleFileUpload = async (file: File, type: 'image' | 'pdf') => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        if (type === 'image') {
          setJobForm({ ...jobForm, jobImage: data.url })
        } else {
          setJobForm({ ...jobForm, jobPdf: data.url })
        }
        toast({
          title: "Succès",
          description: `${type === 'image' ? 'Image' : 'PDF'} téléchargé avec succès.`,
        })
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors du téléchargement",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement du fichier.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Offres d'emploi</h1>
            <p className="text-muted-foreground">
              Gérer les offres d'emploi et les candidatures
            </p>
          </div>
        </div>
        <div>Chargement des offres...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Offres d'emploi</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gérer les offres d'emploi et les candidatures
          </p>
        </div>
        <Button onClick={handleCreateJob} className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Créer une offre
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total des offres</CardTitle>
            <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="text-lg sm:text-2xl font-bold">{jobs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Offres actives</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="text-lg sm:text-2xl font-bold">
              {jobs.filter((job: Job) => job.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total des candidatures</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="text-lg sm:text-2xl font-bold">
              {jobs.reduce((sum: number, job: Job) => sum + job.applications, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total des vues</CardTitle>
            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="text-lg sm:text-2xl font-bold">
              {jobs.reduce((sum: number, job: Job) => sum + job.views, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Offres récentes</CardTitle>
          <CardDescription>
            Gérer et surveiller les offres d'emploi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <JobsTable
            jobs={jobs}
            onEditJob={handleEditJob}
            onDeleteJob={handleDeleteJob}
          />
        </CardContent>
      </Card>

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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salaryMin" className="text-sm">Salaire min (FCFA)</Label>
                  <Input
                    id="salaryMin"
                    type="number"
                    value={jobForm.salaryMin}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMin: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="salaryMax" className="text-sm">Salaire max (FCFA)</Label>
                  <Input
                    id="salaryMax"
                    type="number"
                    value={jobForm.salaryMax}
                    onChange={(e) => setJobForm({ ...jobForm, salaryMax: e.target.value })}
                    className="text-sm"
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
                <Label htmlFor="description" className="text-sm">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="text-sm resize-none"
                />
              </div>

              <div>
                <Label htmlFor="requirements" className="text-sm">Exigences</Label>
                <Textarea
                  id="requirements"
                  rows={3}
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  className="text-sm resize-none"
                />
              </div>

              <div>
                <Label htmlFor="benefits" className="text-sm">Avantages</Label>
                <Textarea
                  id="benefits"
                  rows={3}
                  value={jobForm.benefits}
                  onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
                  className="text-sm resize-none"
                />
              </div>

              <div>
                <Label htmlFor="skills" className="text-sm">Compétences (séparées par des virgules)</Label>
                <Input
                  id="skills"
                  value={jobForm.skills}
                  onChange={(e) => setJobForm({ ...jobForm, skills: e.target.value })}
                  placeholder="React, Node.js, TypeScript..."
                  className="text-sm"
                />
              </div>

              <div>
                <Label htmlFor="jobImage" className="text-sm">Image du poste</Label>
                <Input
                  id="jobImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'image')
                  }}
                  className="text-sm"
                />
                {jobForm.jobImage && (
                  <div className="mt-2">
                    <img src={jobForm.jobImage} alt="Job" className="w-32 h-32 object-cover rounded" />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="jobPdf" className="text-sm">PDF du poste</Label>
                <Input
                  id="jobPdf"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, 'pdf')
                  }}
                  className="text-sm"
                />
                {jobForm.jobPdf && (
                  <div className="mt-2">
                    <a href={jobForm.jobPdf} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      Voir le PDF
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6">
            <Button variant="outline" onClick={() => setShowJobForm(false)} className="w-full sm:w-auto">
              Annuler
            </Button>
            <Button onClick={handleSaveJob} className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
              {editingJob ? "Mettre à jour" : "Créer l'offre"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
