"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import {
  MapPin,
  Clock,
  DollarSign,
  Building,
  Users,
  Share2,
  Heart,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

interface Job {
  id: number
  title: string
  company: string
  location: string
  type: string
  salaryMin?: number
  salaryMax?: number
  description: string
  requirements?: string
  benefits?: string
  tags: string[]
  createdAt: string
  expiresAt?: string
  status: string
  viewsCount: number
  companyLogo?: string
  companyWebsite?: string
  remoteWork: boolean
  experienceLevel?: string
  applicationUrl?: string
  applicationEmail?: string
}

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [showApplication, setShowApplication] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/jobs/${params.id}`)
        const data = await response.json()

        if (data.job) {
          setJob(data.job)
        } else {
          setJob(null)
        }
      } catch (error) {
        console.error("Error fetching job:", error)
        setJob(null)
      } finally {
        setLoading(false)
      }
    }

    fetchJob()
  }, [params.id])

  const handleApply = async () => {
    if (!session?.user) {
      router.push("/sign-in")
      return
    }

    setApplying(true)
    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: job?.id,
          cover_letter: coverLetter,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setApplied(true)
        setShowApplication(false)
      } else {
        alert(data.error || "Erreur lors de l'envoi de la candidature")
      }
    } catch (error) {
      console.error("Error applying:", error)
      alert("Erreur lors de l'envoi de la candidature")
    } finally {
      setApplying(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: job?.title,
        text: `Découvrez cette offre d'emploi : ${job?.title} chez ${job?.company}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const toggleSave = () => {
    setIsSaved(!isSaved)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Offre non trouvée</h1>
          <Button onClick={() => router.push("/")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux offres
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => router.push("/")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux offres
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <img
                  src={job.companyLogo || "/placeholder.svg"}
                  alt={`${job.company} logo`}
                  className="w-16 h-16 rounded-lg object-cover border"
                />
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span className="font-medium">{job.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        {job.salaryMin ? job.salaryMin.toLocaleString() : 'N/A'}€ - {job.salaryMax ? job.salaryMax.toLocaleString() : 'N/A'}€
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-teal-100 text-teal-800">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
              {applied ? (
                <Button disabled className="bg-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Candidature envoyée
                </Button>
              ) : (
                <Button onClick={() => setShowApplication(true)} className="bg-teal-600 hover:bg-teal-700">
                  <Send className="w-4 h-4 mr-2" />
                  Postuler
                </Button>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={toggleSave}>
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description du poste</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {job.description.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Profil recherché</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {job.requirements.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-4 whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Avantages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    {job.benefits.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-4 whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Company Info */}
            <Card>
              <CardHeader>
                <CardTitle>À propos de l'entreprise</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={job.companyLogo || "/placeholder.svg"}
                    alt={`${job.company} logo`}
                    className="w-12 h-12 rounded-lg object-cover border"
                  />
                  <div>
                    <h3 className="font-semibold">{job.company}</h3>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                </div>
                {job.companyWebsite && (
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Visiter le site web
                  </a>
                )}
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{job.remoteWork ? 'Télétravail possible' : 'Présentiel'}</span>
                  </div>
                  {job.experienceLevel && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{job.experienceLevel}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Publié le</span>
                  <span className="text-sm font-medium">{new Date(job.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
                {job.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expire le</span>
                    <span className="text-sm font-medium">{new Date(job.expiresAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Vues</span>
                  <span className="text-sm font-medium">{job.viewsCount}</span>
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Offre active</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Postuler pour {job.title}</CardTitle>
              <CardDescription>Complétez votre candidature pour {job.company}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!session?.user && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">Vous devez être connecté pour postuler à cette offre.</p>
                  </div>
                  <Button onClick={() => router.push("/sign-in")} className="mt-3 bg-yellow-600 hover:bg-yellow-700">
                    Se connecter
                  </Button>
                </div>
              )}

              {session?.user && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="coverLetter">Lettre de motivation</Label>
                    <Textarea
                      id="coverLetter"
                      placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={6}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      Votre CV sera automatiquement joint à votre candidature depuis votre profil.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <Button variant="outline" onClick={() => setShowApplication(false)}>
                Annuler
              </Button>
              {session?.user && (
                <Button
                  onClick={handleApply}
                  disabled={applying || !coverLetter.trim()}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {applying ? "Envoi en cours..." : "Envoyer ma candidature"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
