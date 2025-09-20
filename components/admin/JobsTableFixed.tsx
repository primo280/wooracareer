"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Briefcase,
  FileText,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

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
  description?: string
  company_logo?: string
}

interface JobsTableProps {
  jobs: Job[]
  loading?: boolean
  onEditJob: (job: Job) => void
  onDeleteJob: (jobId: number) => void
}

export function JobsTable({ jobs, loading = false, onEditJob, onDeleteJob }: JobsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)

  const handleDeleteClick = (job: Job) => {
    setJobToDelete(job)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (jobToDelete) {
      onDeleteJob(jobToDelete.id)
      setDeleteDialogOpen(false)
      setJobToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
      case "paused":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En pause</Badge>
      case "expired":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expiré</Badge>
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Brouillon</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatSalary = (min: number, max: number) => {
    if (min && max) {
      return `${min.toLocaleString()}€ - ${max.toLocaleString()}€`
    } else if (min) {
      return `À partir de ${min.toLocaleString()}€`
    } else if (max) {
      return `Jusqu'à ${max.toLocaleString()}€`
    }
    return "Non spécifié"
  }

  const copyJobLink = (jobId: number) => {
    const url = `${window.location.origin}/jobs/${jobId}`
    navigator.clipboard.writeText(url)
    toast({
      title: "Lien copié",
      description: "Le lien de l'offre a été copié dans le presse-papiers",
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Offres d'emploi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Offres d'emploi ({jobs.length})</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offre</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Localisation</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Salaire</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-center">Candidatures</TableHead>
                <TableHead className="text-center">Vues</TableHead>
                <TableHead className="text-center">Date</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={job.company_logo} />
                        <AvatarFallback>
                          {job.company.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(job.posted_at).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{job.company}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {job.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{job.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="w-3 h-3" />
                      {formatSalary(job.salary_min, job.salary_max)}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span className="font-medium">{job.applications}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-600" />
                      <span className="font-medium">{job.views}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-gray-500">
                    {new Date(job.expires_at).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={() => window.open(`/jobs/${job.id}`, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Voir l'offre
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyJobLink(job.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copier le lien
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEditJob(job)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(job)}
                          className="text-red-600 focus:text-red-600"
                        >
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

          {jobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune offre trouvée
              </h3>
              <p className="text-gray-500">
                Aucune offre ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer l'offre "{jobToDelete?.title}" ?
              Cette action est irréversible et supprimera également toutes les
              candidatures associées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
