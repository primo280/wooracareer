"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSession, signOut } from "next-auth/react"
import {
  Calendar,
  FileText,
  ExternalLink,
  Edit,
  Save,
  X,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Heart,
  Bell,
  User,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { z } from "zod"
import { profileSchema } from "@/app/api/profile/route"

interface Application {
  id: number
  job_id: number
  job_title: string
  company: string
  status: string
  applied_at: string
  updated_at: string
  cover_letter: string
  interview_date?: string
  notes?: string
}

interface SavedJob {
  id: number
  title: string
  company: string
  location: string
  type: string
  salary_min: number
  salary_max: number
  saved_at: string
}

interface CandidateProfile {
  first_name: string
  last_name: string
  phone: string
  location: string
  bio: string
  resume_url: string
  linkedin_url: string
  portfolio_url: string
  skills: string[]
  experience_level: string
  availability: string
}

export default function CandidateDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [profile, setProfile] = useState<CandidateProfile>({
    first_name: "",
    last_name: "",
    phone: "",
    location: "",
    bio: "",
    resume_url: "",
    linkedin_url: "",
    portfolio_url: "",
    skills: [],
    experience_level: "junior",
    availability: "available",
  })
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [showApplicationDetails, setShowApplicationDetails] = useState<Application | null>(null)
  const [dataErrors, setDataErrors] = useState<{[key: string]: string}>({})

  useEffect(() => {
    console.log("Dashboard useEffect triggered. Session status:", status, "Session data:", session)
    if (status === "loading") {
      // Still loading
      return
    }

    if (!session) {
      console.log("No session found, redirecting to /sign-in")
      router.push("/sign-in")
      return
    }

    const fetchData = async () => {
      try {
        // Fetch applications
        const applicationsResponse = await fetch("/api/applications")
        if (!applicationsResponse.ok) {
          console.error("Failed to fetch /api/applications:", applicationsResponse.status)
        }
        const applicationsData = await applicationsResponse.json()
        console.log("Applications data:", applicationsData)
        if (applicationsData.applications) {
          setApplications(applicationsData.applications)
        }

        // Fetch notifications
        const notificationsResponse = await fetch("/api/notifications")
        if (!notificationsResponse.ok) {
          console.error("Failed to fetch /api/notifications:", notificationsResponse.status)
        }
        const notificationsData = await notificationsResponse.json()
        console.log("Notifications data:", notificationsData)
        if (notificationsData.notifications) {
          setNotifications(notificationsData.notifications)
        }

        // Fetch profile
        const profileResponse = await fetch("/api/profile")
        if (!profileResponse.ok) {
          console.error("Failed to fetch /api/profile:", profileResponse.status)
        }
        const profileData = await profileResponse.json()
        console.log("Profile data:", profileData)
        if (profileData.profile) {
          setProfile(profileData.profile)
        } else {
          // Set default profile with user data
          setProfile({
            first_name: session.user?.name?.split(" ")[0] || "",
            last_name: session.user?.name?.split(" ")[1] || "",
            phone: "",
            location: "",
            bio: "",
            resume_url: "",
            linkedin_url: "",
            portfolio_url: "",
            skills: [],
            experience_level: "junior",
            availability: "available",
          })
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Erreur",
          description: "Erreur lors du chargement des données.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, status, router])

  const handleSaveProfile = async () => {
    try {
      // Client-side validation with Zod
      const validationResult = profileSchema.safeParse(profile)
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => err.message).join(", ")
        toast({
          title: "Erreur de validation",
          description: errors,
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      const data = await response.json()

      if (data.success) {
        setEditingProfile(false)
        toast({
          title: "Succès",
          description: "Profil sauvegardé avec succès.",
        })
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Erreur lors de la sauvegarde",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde du profil.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveSavedJob = (jobId: number) => {
    setSavedJobs(savedJobs.filter((job) => job.id !== jobId))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            En attente
          </Badge>
        )
      case "reviewing":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Eye className="w-3 h-3 mr-1" />
            En cours
          </Badge>
        )
      case "interview":
        return (
          <Badge className="bg-purple-100 text-purple-800">
            <Calendar className="w-3 h-3 mr-1" />
            Entretien
          </Badge>
        )
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepté
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Refusé
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case "available":
        return <Badge className="bg-green-100 text-green-800">Disponible</Badge>
      case "not_available":
        return <Badge className="bg-red-100 text-red-800">Non disponible</Badge>
      case "open_to_offers":
        return <Badge className="bg-blue-100 text-blue-800">Ouvert aux opportunités</Badge>
      default:
        return <Badge variant="secondary">{availability}</Badge>
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const unreadNotifications = notifications.filter((n) => !n.read).length

  const stats = {
    totalApplications: applications.length,
    pendingApplications: applications.filter((app) => app.status === "pending").length,
    interviewApplications: applications.filter((app) => app.status === "interview").length,
    savedJobs: savedJobs.length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Espace Candidat</h1>
              <p className="text-gray-600">Gérez vos candidatures et votre profil</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => router.push("/notifications")} className="relative">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
                {unreadNotifications > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Button>
              <Button variant="outline" onClick={() => router.push("/profile")}>
                <User className="w-4 h-4 mr-2" />
                Mon Profil
              </Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Voir les offres
              </Button>
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Recent Notifications Section */}
        {notifications.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-teal-600" />
                  Notifications récentes
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => router.push("/notifications")}>
                  Voir tout
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start space-x-3 p-3 rounded-lg ${
                      !notification.read ? "bg-teal-50 border border-teal-200" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {notification.type === "application_status" && <FileText className="w-4 h-4 text-blue-600" />}
                      {notification.type === "new_job" && <Bell className="w-4 h-4 text-green-600" />}
                      {notification.type === "interview" && <Calendar className="w-4 h-4 text-orange-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                      <p className="text-sm text-gray-600 truncate">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    {!notification.read && <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2"></div>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Candidatures</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
                <FileText className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingApplications}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Entretiens</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.interviewApplications}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Offres sauvées</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.savedJobs}</p>
                </div>
                <Heart className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList>
            <TabsTrigger value="applications">Mes Candidatures</TabsTrigger>
            <TabsTrigger value="saved">Offres Sauvées</TabsTrigger>
            <TabsTrigger value="profile">Mon Profil</TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mes Candidatures ({applications.length})</CardTitle>
                <CardDescription>Suivez l'évolution de vos candidatures</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Poste</TableHead>
                      <TableHead>Entreprise</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Candidature</TableHead>
                      <TableHead>Dernière MAJ</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">{application.job_title}</TableCell>
                        <TableCell>{application.company}</TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell>{new Date(application.applied_at).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell>{new Date(application.updated_at).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowApplicationDetails(application)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/jobs/${application.job_id}`, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Offres Sauvées ({savedJobs.length})</CardTitle>
                <CardDescription>Vos offres d'emploi favorites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {savedJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        <div className="flex items-center gap-4 text-gray-600 mt-1">
                          <span>{job.company}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.type}</span>
                          <span>•</span>
                          <span>
                            {job.salary_min.toLocaleString()}€ - {job.salary_max.toLocaleString()}€
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Sauvé le {new Date(job.saved_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.open(`/jobs/${job.id}`, "_blank")}>
                          Voir l'offre
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSavedJob(job.id)}
                          className="text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Mon Profil</CardTitle>
                    <CardDescription>Gérez vos informations personnelles et professionnelles</CardDescription>
                  </div>
                  <Button
                    variant={editingProfile ? "default" : "outline"}
                    onClick={editingProfile ? handleSaveProfile : () => setEditingProfile(true)}
                  >
                    {editingProfile ? (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </>
                    ) : (
                      <>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input
                          id="firstName"
                          value={profile.first_name}
                          onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                          disabled={!editingProfile}
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          value={profile.last_name}
                          onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                          disabled={!editingProfile}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={session?.user?.email || ""} disabled />
                    </div>

                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Localisation</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>

                    <div>
                      <Label htmlFor="availability">Disponibilité</Label>
                      <div className="mt-2">{getAvailabilityBadge(profile.availability)}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bio">Présentation</Label>
                      <Textarea
                        id="bio"
                        rows={4}
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={profile.linkedin_url}
                        onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>

                    <div>
                      <Label htmlFor="portfolio">Portfolio</Label>
                      <Input
                        id="portfolio"
                        value={profile.portfolio_url}
                        onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                        disabled={!editingProfile}
                      />
                    </div>

                    <div>
                      <Label>Compétences</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-teal-100 text-teal-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Details Modal */}
      {showApplicationDetails && (
        <Dialog open={!!showApplicationDetails} onOpenChange={() => setShowApplicationDetails(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Détails de la candidature</DialogTitle>
              <DialogDescription>
                {showApplicationDetails.job_title} chez {showApplicationDetails.company}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Statut:</span>
                {getStatusBadge(showApplicationDetails.status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Date de candidature:</span>
                <span>{new Date(showApplicationDetails.applied_at).toLocaleDateString("fr-FR")}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Dernière mise à jour:</span>
                <span>{new Date(showApplicationDetails.updated_at).toLocaleDateString("fr-FR")}</span>
              </div>

              {showApplicationDetails.interview_date && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Date d'entretien:</span>
                  <span className="text-purple-600 font-medium">
                    {new Date(showApplicationDetails.interview_date).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              )}

              <div>
                <Label className="font-medium">Lettre de motivation:</Label>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{showApplicationDetails.cover_letter}</p>
                </div>
              </div>

              {showApplicationDetails.notes && (
                <div>
                  <Label className="font-medium">Notes de l'employeur:</Label>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">{showApplicationDetails.notes}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowApplicationDetails(null)}>
                Fermer
              </Button>
              <Button
                onClick={() => window.open(`/jobs/${showApplicationDetails.job_id}`, "_blank")}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Voir l'offre
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
