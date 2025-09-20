"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Clock, Building, Users, Share2, Bookmark, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Job, PaginationInfo, JobFilters } from "@/types/job"
import { formatSalary, formatDate, handleShare } from "@/lib/jobUtils"
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

  const fetchJobs = async (page = 1) => {
    setLoading(true)
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
    }
  }

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
  }, [filters])

  const handleJobClick = (jobId: number) => {
    router.push(`/jobs/${jobId}`)
  }

  const handleSaveJob = async (jobId: number) => {
    // In real app, save to API
    console.log("Saving job:", jobId)
  }

  const handleApply = (jobId: number) => {
    if (status === "loading") {
      // Still loading
      return
    }

    if (!session?.user) {
      router.push("/sign-in")
      return
    }
    router.push(`/jobs/${jobId}`)
  }

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
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
          </div>
        </div>
      </section>
    )
  }

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
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow duration-200 relative cursor-pointer">
              <div onClick={() => handleJobClick(job.id)}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{job.title}</CardTitle>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <Building className="w-4 h-4 mr-2" />
                    <span className="font-medium">{job.company}</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{job.location}</span>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.slice(0, 3).map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {job.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{job.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{formatDate(job.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{job.viewsCount} vues</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{job.type}</Badge>
                    <span className="font-semibold text-teal-600">
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShare(job)
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSaveJob(job.id)
                      }}
                    >
                      <Bookmark className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleApply(job.id)
                      }}
                    >
                      Postuler
                    </Button>
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
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Aucune offre trouvée</div>
            <Button
              variant="outline"
              onClick={() => {
                // Reset filters would be handled by parent component
                window.location.reload()
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              Précédent
            </Button>

            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i
                if (pageNum > pagination.totalPages) return null
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={handlePageButtonClick(pageNum)}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Suivant
            </Button>
          </div>
        )}

        {pagination && (
          <div className="text-center text-sm text-gray-600 mt-4">
            Page {pagination.page} sur {pagination.totalPages} ({pagination.totalCount} offres au total)
          </div>
        )}
      </div>
    </section>
  )
}
