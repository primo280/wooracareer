import { Job } from "@/types/job"

export const formatSalary = (salaryMin?: number, salaryMax?: number): string => {
  if (!salaryMin && !salaryMax) return 'N/A'
  if (salaryMin && salaryMax) {
    return `${salaryMin.toLocaleString()}€ - ${salaryMax.toLocaleString()}€`
  }
  if (salaryMin) return `${salaryMin.toLocaleString()}€+`
  return `${salaryMax?.toLocaleString()}€`
}

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("fr-FR")
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const handleShare = async (job: Job): Promise<void> => {
  if (navigator.share) {
    await navigator.share({
      title: job.title,
      text: `Découvrez cette offre d'emploi: ${job.title} chez ${job.company}`,
      url: `${window.location.origin}/jobs/${job.id}`,
    })
  } else {
    navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.id}`)
  }
}
