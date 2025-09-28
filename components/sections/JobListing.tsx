"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Clock, Building, Users, Share2, Bookmark, ArrowRight, Briefcase, DollarSign, Eye, ChevronDown, ChevronUp, Send, CheckCircle, AlertCircle, Facebook, MessageCircle, Instagram, Copy, X, Linkedin, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Job, PaginationInfo, JobFilters } from "@/types/job"
import { formatSalary, formatDate } from "@/lib/jobUtils"
import { handleApply, handleShare as handleShareJob } from "@/lib/jobActions"
import { useSession } from "next-auth/react"

interface JobListingProps {
  filters: JobFilters
}

export default function JobListing({ filters }: JobListingProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [expandedJobs, setExpandedJobs] = useState<Set<number>>(new Set())
  const [pageLoading, setPageLoading] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  // Application modal state
  const [showApplication, setShowApplication] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [applicantName, setApplicantName] = useState("")
  const [applicantEmail, setApplicantEmail] = useState("")
  const [applicantPhone, setApplicantPhone] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  // Share dialog state
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [selectedJobForShare, setSelectedJobForShare] = useState<Job | null>(null)

  // Applied jobs tracking
  const [appliedJobs, setAppliedJobs] = useState<Set<number>>(new Set())

  // Get job image from database or fallback
  const getJobImage = (job: Job) => {
    // Use company logo from database if available
    if (job.companyLogo && job.companyLogo.trim() !== '') {
      return job.companyLogo
    }

    // Generate a colored background based on job ID for consistent but varied appearance
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple to blue
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink to red
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue to cyan
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green to teal
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Pink to yellow
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Light blue to pink
      'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', // Purple to cream
      'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #4facfe 100%)', // Multi-color
      'linear-gradient(135deg, #667eea 50%, #764ba2 100%)', // Blue to purple
      'linear-gradient(135deg, #43e97b 50%, #38f9d7 100%)', // Green to teal
    ];

    // Use job ID to select a consistent color for each job
    const colorIndex = (job.id % colors.length) || 0;
    return colors[colorIndex];
  }

  // Get gradient color for job type
  const getTypeGradient = (type: string) => {
    const gradients = {
      "CDI": "from-blue-500 to-blue-600",
      "CDD": "from-green-500 to-green-600",
      "Freelance": "from-purple-500 to-purple-600",
      "Stage": "from-orange-500 to-orange-600",
      "Alternance": "from-pink-500 to-pink-600"
    }
    return gradients[type as keyof typeof gradients] || "from-gray-500 to-gray-600"
  }

  const fetchJobs = async (page = 1) => {
    const isPageChange = page !== 1
    if (isPageChange) {
      setPageLoading(true)
    } else {
      setLoading(true)
    }
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.searchTerm) params.append("search", filters.searchTerm)
      if (filters.locationFilter !== "all") params.append("location", filters.locationFilter)
      if (filters.typeFilter !== "all") params.append("type", filters.typeFilter)
      if (filters.salaryFilter !== "all") params.append("salary_min", filters.salaryFilter)
      params.append("page", page.toString())
      params.append("limit", "10")

      const response = await fetch(`/api/jobs?${params.toString()}`)
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      const data = await response.json()

      if (data.jobs) {
        setJobs(data.jobs)
        setPagination(data.pagination)
        // Scroll to top on page change
        if (isPageChange) {
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else {
        throw new Error("Format de données invalide")
      }
    } catch (error) {
      console.error("Error fetching jobs:", error)
      setError(error instanceof Error ? error.message : "Erreur lors du chargement des offres")
      // Keep existing jobs if there was an error, or set empty array
      if (jobs.length === 0) {
        setJobs([])
      }
    } finally {
      setLoading(false)
      setPageLoading(false)
    }
  }

  // Toggle job description expansion
  const toggleJobExpansion = (jobId: number) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
  }

  // Debounced fetch function for filter changes
  const debouncedFetchJobs = useCallback((page = 1) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
    const timer = setTimeout(() => {
      fetchJobs(page)
    }, 500) // 500ms debounce
    setDebounceTimer(timer)
  }, [filters]) // Depend on filters to recreate when they change

  const handlePageChange = (newPage: number) => {
    fetchJobs(newPage)
  }

  // Fix for pagination button onClick type error
  const handlePageButtonClick = (page: number) => {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      handlePageChange(page)
    }
  }

  useEffect(() => {
    fetchJobs(1)
  }, []) // Only run on mount

  // Debounced effect for filter changes
  useEffect(() => {
    if (filters.searchTerm || filters.locationFilter !== "all" || filters.typeFilter !== "all" || filters.salaryFilter !== "all") {
      debouncedFetchJobs(1)
    }
  }, [filters, debouncedFetchJobs])

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [debounceTimer])

  const handleJobClick = (jobId: number) => {
    router.push(`/jobs/${jobId}`)
  }

  const handleSaveJob = async (jobId: number) => {
    // In real app, save to API
    console.log("Saving job:", jobId)
  }

  const handleApplyClick = (job: Job) => {
    if (status === "loading") {
      // Still loading
      return
    }

    if (!session?.user) {
      router.push("/sign-in")
      return
    }

    setSelectedJob(job)
    setShowApplication(true)
  }

  const handleApplySubmit = async () => {
    if (!selectedJob) return

    await handleApply(
      selectedJob,
      applicantName,
      applicantEmail,
      applicantPhone,
      coverLetter,
      cvFile,
      setApplying,
      (applied) => {
        if (applied && selectedJob) {
          setAppliedJobs(prev => new Set([...prev, selectedJob.id]))
        }
      },
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

  const handleOpenShare = (job: Job) => {
    setSelectedJobForShare(job)
    setShowShareDialog(true)
  }

  const handleShareClick = (platform: string, job: Job) => {
    handleShareJob(platform, job)
  }

  // Skeleton card component
  const JobSkeleton = () => (
    <Card className="overflow-hidden">
      <div className="aspect-[16/9] bg-gray-200 animate-pulse"></div>
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/5 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Offres récentes</h3>
            <Button variant="outline" onClick={() => router.push("/admin")}>
              Publier une offre
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <JobSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <TooltipProvider>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-teal-500 to-emerald-500 p-3 rounded-full shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1 animate-in slide-in-from-left duration-500">
                  Offres récentes
                </h3>
                <p className="text-gray-600 text-sm animate-in slide-in-from-left duration-500 delay-100">
                  Découvrez les dernières opportunités professionnelles
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => fetchJobs(1)}
                className="border-teal-200 hover:border-teal-300 hover:bg-teal-50 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Actualiser
              </Button>
              
                
             
            </div>
          </div>

          {pageLoading && (
            <div className="fixed inset-0 bg-black/10 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-4 shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                <p className="text-sm text-gray-600 mt-2">Chargement...</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.map((job, index) => (
              <Card
                key={job.id}
                className="group hover:shadow-2xl hover:shadow-teal-100/50 transition-all duration-300 hover:-translate-y-1 border-0 shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Job Image */}
                <div
                  className="relative aspect-[16/9] overflow-hidden group-hover:scale-105 transition-transform duration-300"
                  style={{ background: getJobImage(job) }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-3 right-3">
                    <Badge className={`bg-gradient-to-r ${getTypeGradient(job.type)} text-white border-0 shadow-lg`}>
                      {job.type}
                    </Badge>
                  </div>
                </div>

                <div onClick={() => handleJobClick(job.id)} className="cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-teal-700 transition-colors line-clamp-2 leading-tight">
                      {job.title}
                    </CardTitle>
                    <div className="flex items-center text-gray-600 mb-2">
                      <Building className="w-5 h-5 mr-2 text-teal-600" />
                      <span className="font-semibold text-lg">{job.company}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-2 text-teal-500" />
                      <span className="font-medium">{job.location}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="mb-4">
                      <p className={`text-gray-600 text-sm leading-relaxed ${expandedJobs.has(job.id) ? '' : 'line-clamp-3'}`}>
                        {job.description}
                      </p>
                      {job.description.length > 150 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleJobExpansion(job.id)
                          }}
                          className="p-0 h-auto text-teal-600 hover:text-teal-700 mt-1"
                        >
                          {expandedJobs.has(job.id) ? (
                            <>Voir moins <ChevronUp className="w-3 h-3 ml-1" /></>
                          ) : (
                            <>Voir plus <ChevronDown className="w-3 h-3 ml-1" /></>
                          )}
                        </Button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.tags.slice(0, 3).map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors">
                          {tag}
                        </Badge>
                      ))}
                      {job.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs bg-gray-50 text-gray-600">
                          +{job.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-4 text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Eye className="w-4 h-4 mr-1" />
                        <span>{job.viewsCount} vues</span>
                      </div>
                    </div>
                  </CardContent>
                </div>

                <CardContent className="pt-0 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 mr-1 text-teal-600" />
                      <span className="font-bold text-xl text-teal-700">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenShare(job)
                            }}
                            className="hover:bg-teal-50 hover:text-teal-600"
                            aria-label="Partager l'offre"
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Partager</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSaveJob(job.id)
                            }}
                            className="hover:bg-teal-50 hover:text-teal-600"
                            aria-label="Sauvegarder l'offre"
                          >
                            <Bookmark className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Sauvegarder</TooltipContent>
                      </Tooltip>

                      {appliedJobs.has(job.id) ? (
                        <Button disabled size="sm" className="bg-gradient-to-r from-green-500 to-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Candidature envoyée
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleApplyClick(job)
                          }}
                          aria-label="Postuler à cette offre"
                        >
                          Postuler
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={() => fetchJobs(1)} className="bg-teal-600 hover:bg-teal-700">
              Réessayer
            </Button>
          </div>
        )}

        {!error && jobs.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center">
                <Briefcase className="w-12 h-12 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune offre trouvée</h3>
              <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche ou revenez plus tard.</p>
              <Button
                variant="outline"
                onClick={() => {
                  // Reset filters would be handled by parent component
                  window.location.reload()
                }}
                className="border-teal-200 hover:border-teal-300 hover:bg-teal-50"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-12">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
              className="border-teal-200 hover:border-teal-300 hover:bg-teal-50 disabled:opacity-50"
            >
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
              Précédent
            </Button>

            <div className="flex space-x-1">
              {(() => {
                const pages = []
                const totalPages = pagination.totalPages
                const currentPage = pagination.page

                // Always show first page
                if (totalPages > 1) {
                  pages.push(
                    <Button
                      key={1}
                      variant={1 === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={handlePageButtonClick(1)}
                      className={1 === currentPage ? "bg-teal-600 hover:bg-teal-700" : "border-teal-200 hover:border-teal-300 hover:bg-teal-50"}
                    >
                      1
                    </Button>
                  )
                }

                // Add ellipsis if needed
                if (currentPage > 4) {
                  pages.push(
                    <span key="start-ellipsis" className="px-2 text-gray-400">...</span>
                  )
                }

                // Show pages around current page
                const start = Math.max(2, currentPage - 1)
                const end = Math.min(totalPages - 1, currentPage + 1)

                for (let i = start; i <= end; i++) {
                  if (i === 1 || i === totalPages) continue // Skip first and last as they're handled separately
                  pages.push(
                    <Button
                      key={i}
                      variant={i === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={handlePageButtonClick(i)}
                      className={i === currentPage ? "bg-teal-600 hover:bg-teal-700" : "border-teal-200 hover:border-teal-300 hover:bg-teal-50"}
                    >
                      {i}
                    </Button>
                  )
                }

                // Add ellipsis if needed
                if (currentPage < totalPages - 3) {
                  pages.push(
                    <span key="end-ellipsis" className="px-2 text-gray-400">...</span>
                  )
                }

                // Always show last page
                if (totalPages > 1) {
                  pages.push(
                    <Button
                      key={totalPages}
                      variant={totalPages === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={handlePageButtonClick(totalPages)}
                      className={totalPages === currentPage ? "bg-teal-600 hover:bg-teal-700" : "border-teal-200 hover:border-teal-300 hover:bg-teal-50"}
                    >
                      {totalPages}
                    </Button>
                  )
                }

                return pages
              })()}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
              className="border-teal-200 hover:border-teal-300 hover:bg-teal-50 disabled:opacity-50"
            >
              Suivant
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {pagination && (
          <div className="text-center text-sm text-gray-600 mt-4">
            Page {pagination.page} sur {pagination.totalPages} ({pagination.totalCount} offres au total)
          </div>
        )}

        {/* Share Dialog */}
        <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Partager cette offre d'emploi</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto p-4 hover:bg-blue-50"
                onClick={() => {
                  if (selectedJobForShare) handleShareJob('facebook', selectedJobForShare)
                  setShowShareDialog(false)
                }}
              >
                <Facebook className="w-5 h-5 mr-3 text-blue-600" />
                <span className="text-sm">Facebook</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 hover:bg-green-50"
                onClick={() => {
                  if (selectedJobForShare) handleShareJob('whatsapp', selectedJobForShare)
                  setShowShareDialog(false)
                }}
              >
                <MessageCircle className="w-5 h-5 mr-3 text-green-600" />
                <span className="text-sm">WhatsApp</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 hover:bg-blue-50"
                onClick={() => {
                  if (selectedJobForShare) handleShareJob('linkedin', selectedJobForShare)
                  setShowShareDialog(false)
                }}
              >
                <Linkedin className="w-5 h-5 mr-3 text-blue-600" />
                <span className="text-sm">LinkedIn</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 hover:bg-sky-50"
                onClick={() => {
                  if (selectedJobForShare) handleShareJob('twitter', selectedJobForShare)
                  setShowShareDialog(false)
                }}
              >
                <Twitter className="w-5 h-5 mr-3 text-sky-600" />
                <span className="text-sm">Twitter</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 hover:bg-pink-50"
                onClick={() => {
                  if (selectedJobForShare) handleShareJob('instagram', selectedJobForShare)
                  setShowShareDialog(false)
                }}
              >
                <Instagram className="w-5 h-5 mr-3 text-pink-600" />
                <span className="text-sm">Instagram</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 hover:bg-gray-50"
                onClick={() => {
                  if (selectedJobForShare) handleShareJob('copy', selectedJobForShare)
                  setShowShareDialog(false)
                }}
              >
                <Copy className="w-5 h-5 mr-3 text-gray-600" />
                <span className="text-sm">Copier le lien</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto p-4 hover:bg-orange-50 col-span-2"
                onClick={() => {
                  if (selectedJobForShare) handleShareJob('email', selectedJobForShare)
                  setShowShareDialog(false)
                }}
              >
                <Send className="w-5 h-5 mr-3 text-orange-600" />
                <span className="text-sm">Envoyer par email</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Application Modal */}
        {showApplication && selectedJob && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-0 bg-white">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-t-lg">
                <CardTitle className="text-xl sm:text-2xl font-bold">Postuler pour {selectedJob.title}</CardTitle>
                <CardDescription className="text-teal-100 text-base">
                  Complétez votre candidature pour {selectedJob.company}
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
    </section>
    </TooltipProvider>
  )
}
