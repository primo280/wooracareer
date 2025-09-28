"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useSession } from "next-auth/react"
import { handleApply, handleShare as handleShareJob } from "@/lib/jobActions"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  Facebook,
  MessageCircle,
  Instagram,
  Copy,
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
  const [applicantName, setApplicantName] = useState("")
  const [applicantEmail, setApplicantEmail] = useState("")
  const [applicantPhone, setApplicantPhone] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true)
      try {
        // Validate job ID
        const jobId = Number.parseInt(params.id as string)
        if (isNaN(jobId) || jobId <= 0) {
          console.error("Invalid job ID:", params.id)
          setJob(null)
          setLoading(false)
          return
        }

        console.log("Fetching job with ID:", jobId) // Debug log
        const response = await fetch(`/api/jobs/${jobId}`)

        if (!response.ok) {
          console.error("API response not OK:", response.status, response.statusText)
          setJob(null)
          return
        }

        const data = await response.json()
        console.log("API response data:", data) // Debug log

        if (data.job) {
          setJob(data.job)
        } else {
          console.error("No job found in response:", data)
          setJob(null)
        }
      } catch (error) {
        console.error("Error fetching job:", error)
        setJob(null)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchJob()
    } else {
      console.error("No job ID in params")
      setJob(null)
      setLoading(false)
    }
  }, [params.id])

  const handleApplySubmit = async () => {
    if (!job) return

    await handleApply(
      job,
      applicantName,
      applicantEmail,
      applicantPhone,
      coverLetter,
      cvFile,
      setApplying,
      setApplied,
      setShowApplication,
      () => {
        setApplicantName("")
        setApplicantEmail("")
        setApplicantPhone("")
        setCoverLetter("")
        setCvFile(null)
      }
    )
  }

  const handleShareClick = (platform: string) => {
    if (!job) return
    handleShareJob(platform, job)
  }

  const toggleSave = () => {
    setIsSaved(!isSaved)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-28"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                      <div className="h-6 bg-gray-200 rounded-full animate-pulse w-14"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3">
                <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
                <div className="flex gap-2">
                  <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content Skeleton */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-lg border p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
                </div>
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-44 mb-4"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-28 mb-4"></div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg border p-6">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-18"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-14"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Offre non trouvée</h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              L'offre d'emploi que vous recherchez n'existe pas, a été supprimée ou n'est plus disponible.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3"
            >
              Réessayer
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full py-3"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux offres
            </Button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Conseil :</strong> Vérifiez que l'URL est correcte ou utilisez la recherche pour trouver d'autres offres similaires.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux offres
          </Button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 sm:gap-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-xl blur-lg opacity-30"></div>
                  <img
                    src={job.companyLogo || "/placeholder.svg"}
                    alt={`${job.company} logo`}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-white shadow-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 leading-tight">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-gray-600 mb-4">
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                      <Building className="w-4 h-4 text-teal-600" />
                      <span className="font-medium text-sm sm:text-base">{job.company}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span className="text-sm sm:text-base">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span className="text-sm sm:text-base">{job.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-green-100 px-3 py-1 rounded-full">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm sm:text-base font-medium text-green-800">
                        {job.salaryMin ? job.salaryMin.toLocaleString() : 'N/A'} - {job.salaryMax ? job.salaryMax.toLocaleString() : 'N/A'} FCFA
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-gradient-to-r from-teal-100 to-emerald-100 text-teal-800 border-teal-200 hover:from-teal-200 hover:to-emerald-200 transition-colors">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full sm:w-auto">
              {applied ? (
                <Button disabled className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg w-full sm:w-auto">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Candidature envoyée
                </Button>
              ) : (
                <Button
                  onClick={() => setShowApplication(true)}
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Postuler maintenant
                </Button>
              )}

              <div className="flex gap-2 justify-center sm:justify-start">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleSave}
                  className="hover:bg-red-50 hover:border-red-200 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="hover:bg-blue-50 hover:border-blue-200 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-lg sm:text-xl">Partager cette offre d'emploi</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4 hover:bg-blue-50"
                        onClick={() => handleShareClick('facebook')}
                      >
                        <Facebook className="w-5 h-5 mr-3 text-blue-600" />
                        <span className="text-sm">Facebook</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4 hover:bg-green-50"
                        onClick={() => handleShareClick('whatsapp')}
                      >
                        <MessageCircle className="w-5 h-5 mr-3 text-green-600" />
                        <span className="text-sm">WhatsApp</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4 hover:bg-pink-50"
                        onClick={() => handleShareClick('instagram')}
                      >
                        <Instagram className="w-5 h-5 mr-3 text-pink-600" />
                        <span className="text-sm">Instagram</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4 hover:bg-gray-50"
                        onClick={() => handleShareClick('copy')}
                      >
                        <Copy className="w-5 h-5 mr-3 text-gray-600" />
                        <span className="text-sm">Copier</span>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Description */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-white" />
                  </div>
                  Description du poste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
                  {job.description.split("\n").map((paragraph, index) => (
                    <p key={index} className="mb-4 text-base sm:text-lg whitespace-pre-line last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {job.requirements && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    Profil recherché
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
                    {job.requirements.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-4 text-base sm:text-lg whitespace-pre-line last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom duration-700 delay-400">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    Avantages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
                    {job.benefits.split("\n").map((paragraph, index) => (
                      <p key={index} className="mb-4 text-base sm:text-lg whitespace-pre-line last:mb-0">
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
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-right duration-700 delay-600">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Building className="w-3 h-3 text-white" />
                  </div>
                  À propos de l'entreprise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-lg blur-md opacity-30"></div>
                    <img
                      src={job.companyLogo || "/placeholder.svg"}
                      alt={`${job.company} logo`}
                      className="relative w-12 h-12 rounded-lg object-cover border-2 border-white"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.company}</h3>
                    <p className="text-sm text-gray-600">{job.location}</p>
                  </div>
                </div>
                {job.companyWebsite && (
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline transition-colors"
                  >
                    <Building className="w-4 h-4" />
                    Visiter le site web
                  </a>
                )}
                <Separator className="my-4" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Building className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{job.remoteWork ? 'Télétravail possible' : 'Présentiel'}</span>
                  </div>
                  {job.experienceLevel && (
                    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{job.experienceLevel}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Job Stats */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-right duration-700 delay-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-3 h-3 text-white" />
                  </div>
                  Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 font-medium">Publié le</span>
                  <span className="text-sm font-semibold text-gray-900">{new Date(job.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
                {job.expiresAt && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600 font-medium">Expire le</span>
                    <span className="text-sm font-semibold text-gray-900">{new Date(job.expiresAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600 font-medium">Vues</span>
                  <span className="text-sm font-semibold text-gray-900">{job.viewsCount}</span>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-sm font-semibold text-green-800">Offre active</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplication && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-0 bg-white">
            <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-t-lg">
              <CardTitle className="text-xl sm:text-2xl font-bold">Postuler pour {job.title}</CardTitle>
              <CardDescription className="text-teal-100 text-base">
                Complétez votre candidature pour {job.company}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <div className="w-8 h-0.5 bg-teal-500"></div>
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <div className="w-8 h-0.5 bg-teal-500"></div>
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicantName" className="text-sm font-semibold text-gray-700">
                    Nom complet *
                  </Label>
                  <Input
                    id="applicantName"
                    placeholder="Votre nom complet"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="applicantEmail" className="text-sm font-semibold text-gray-700">
                    Email *
                  </Label>
                  <Input
                    id="applicantEmail"
                    type="email"
                    placeholder="votre@email.com"
                    value={applicantEmail}
                    onChange={(e) => setApplicantEmail(e.target.value)}
                    className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="applicantPhone" className="text-sm font-semibold text-gray-700">
                  Téléphone (optionnel)
                </Label>
                <Input
                  id="applicantPhone"
                  type="tel"
                  placeholder="+225 01 02 03 04 05"
                  value={applicantPhone}
                  onChange={(e) => setApplicantPhone(e.target.value)}
                  className="border-gray-300 focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cv" className="text-sm font-semibold text-gray-700">
                  CV (PDF ou DOCX, max 5MB) *
                </Label>
                <div className="relative">
                  <Input
                    id="cv"
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                    className="border-gray-300 focus:border-teal-500 focus:ring-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                </div>
                {cvFile && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <p className="text-sm text-green-800 font-medium">Fichier sélectionné: {cvFile.name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverLetter" className="text-sm font-semibold text-gray-700">
                  Lettre de motivation (optionnel)
                </Label>
                <Textarea
                  id="coverLetter"
                  placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={6}
                  className="border-gray-300 focus:border-teal-500 focus:ring-teal-500 resize-none"
                />
                <p className="text-xs text-gray-500">Maximum 500 caractères</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800 font-medium mb-1">Informations importantes</p>
                    <p className="text-sm text-blue-700">
                      Votre candidature sera envoyée directement à l'employeur. Assurez-vous que toutes les informations sont correctes.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 bg-gray-50 rounded-b-lg">
              <Button
                variant="outline"
                onClick={() => setShowApplication(false)}
                className="border-gray-300 hover:bg-gray-100"
              >
                Annuler
              </Button>
              <Button
                onClick={handleApplySubmit}
                disabled={applying || !applicantName.trim() || !applicantEmail.trim() || !cvFile}
                className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi en cours...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    Envoyer ma candidature
                  </div>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
