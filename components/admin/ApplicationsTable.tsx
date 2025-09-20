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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  MoreHorizontal,
  Eye,
  Download,
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Users,
  MessageSquare,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Application {
  id: number
  job_title: string
  candidate_name: string
  candidate_email: string
  status: string
  applied_at: string
  cover_letter: string
  resume_url?: string
  phone?: string
  location?: string
  experience?: string
  skills?: string
}

interface ApplicationsTableProps {
  applications: Application[]
  loading?: boolean
  onUpdateStatus: (applicationId: number, newStatus: string) => void
}

export function ApplicationsTable({ applications, loading = false, onUpdateStatus }: ApplicationsTableProps) {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">En attente</Badge>
      case "reviewing":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">En cours</Badge>
      case "interview":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Entretien</Badge>
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepté</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Refusé</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "reviewing":
        return <AlertCircle className="w-4 h-4" />
      case "interview":
        return <Users className="w-4 h-4" />
      case "accepted":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const handleStatusUpdate = (applicationId: number, newStatus: string) => {
    onUpdateStatus(applicationId, newStatus)
    toast({
      title: "Statut mis à jour",
      description: `La candidature a été marquée comme "${getStatusBadge(newStatus).props.children}"`,
    })
  }

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setShowDetailsDialog(true)
  }

  const handleDownloadResume = (resumeUrl?: string) => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank")
    } else {
      toast({
        title: "Aucun CV",
        description: "Aucun CV n'est disponible pour cette candidature",
        variant: "destructive",
      })
    }
  }

  const handleContactCandidate = (email: string, phone?: string) => {
    const subject = encodeURIComponent("Suivi de votre candidature")
    const body = encodeURIComponent("Bonjour,\n\nNous avons examiné votre candidature et...")
    const mailto = phone ? `tel:${phone}` : `mailto:${email}?subject=${subject}&body=${body}`
    window.open(mailto)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Candidatures</CardTitle>
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
            <CardTitle>Candidatures ({applications.length})</CardTitle>
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
                <TableHead>Candidat</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {application.candidate_name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-gray-900">
                          {application.candidate_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {application.experience && `${application.experience} d'expérience`}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{application.job_title}</div>
                      {application.location && (
                        <div className="text-sm text-gray-500">{application.location}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(application.status)}
                      {getStatusBadge(application.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {new Date(application.applied_at).toLocaleDateString("fr-FR")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleContactCandidate(application.candidate_email, application.phone)}
                        className="h-6 px-2 text-xs"
                      >
                        <Mail className="w-3 h-3 mr-1" />
                        {application.candidate_email}
                      </Button>
                      {application.phone && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`tel:${application.phone}`)}
                          className="h-6 px-2 text-xs"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          {application.phone}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => handleViewDetails(application)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadResume(application.resume_url)}>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger CV
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(application.id, "reviewing")}
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Marquer en cours
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(application.id, "interview")}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Programmer entretien
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(application.id, "accepted")}
                          className="text-green-600 focus:text-green-600"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accepter
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusUpdate(application.id, "rejected")}
                          className="text-red-600 focus:text-red-600"
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

          {applications.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune candidature
              </h3>
              <p className="text-gray-500">
                Aucune candidature n'a été reçue pour le moment.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la candidature</DialogTitle>
            <DialogDescription>
              Informations détaillées sur la candidature de {selectedApplication?.candidate_name}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Informations candidat</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Nom:</strong> {selectedApplication.candidate_name}</div>
                    <div><strong>Email:</strong> {selectedApplication.candidate_email}</div>
                    {selectedApplication.phone && (
                      <div><strong>Téléphone:</strong> {selectedApplication.phone}</div>
                    )}
                    {selectedApplication.location && (
                      <div><strong>Localisation:</strong> {selectedApplication.location}</div>
                    )}
                    {selectedApplication.experience && (
                      <div><strong>Expérience:</strong> {selectedApplication.experience}</div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Poste</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Titre:</strong> {selectedApplication.job_title}</div>
                    <div><strong>Date de candidature:</strong> {new Date(selectedApplication.applied_at).toLocaleDateString("fr-FR")}</div>
                    <div><strong>Statut:</strong> {getStatusBadge(selectedApplication.status)}</div>
                  </div>
                </div>
              </div>

              {selectedApplication.cover_letter && (
                <div>
                  <h4 className="font-semibold mb-2">Lettre de motivation</h4>
                  <div className="bg-gray-50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                    {selectedApplication.cover_letter}
                  </div>
                </div>
              )}

              {selectedApplication.skills && (
                <div>
                  <h4 className="font-semibold mb-2">Compétences</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.skills.split(",").map((skill, index) => (
                      <Badge key={index} variant="outline">
                        {skill.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadResume(selectedApplication.resume_url)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger CV
                </Button>
                <Button
                  onClick={() => handleContactCandidate(selectedApplication.candidate_email, selectedApplication.phone)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contacter
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
