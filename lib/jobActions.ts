import { Job } from "@/types/job"

export const handleApply = async (
  job: Job,
  applicantName: string,
  applicantEmail: string,
  applicantPhone: string,
  coverLetter: string,
  cvFile: File | null,
  setApplying: (applying: boolean) => void,
  setApplied: (applied: boolean) => void,
  setShowApplication: (show: boolean) => void,
  resetForm: () => void
) => {
  if (!applicantName.trim() || !applicantEmail.trim()) {
    alert("Veuillez remplir votre nom et email")
    return
  }

  setApplying(true)
  try {
    const formData = new FormData()
    formData.append('job_id', job.id.toString())
    formData.append('name', applicantName)
    formData.append('email', applicantEmail)
    if (applicantPhone) formData.append('phone', applicantPhone)
    if (coverLetter) formData.append('cover_letter', coverLetter)
    if (cvFile) formData.append('cv', cvFile)

    const response = await fetch("/api/applications", {
      method: "POST",
      body: formData,
    })

    const data = await response.json()

    if (data.success) {
      setApplied(true)
      setShowApplication(false)
      resetForm()
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

export const handleShare = async (platform: string, job: Job) => {
  const url = `${window.location.origin}/jobs/${job.id}`
  const text = `Découvrez cette offre d'emploi : ${job.title} chez ${job.company}`

  try {
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
    } else if (platform === 'instagram') {
      // Instagram doesn't have direct web share, copy link instead
      await navigator.clipboard.writeText(url)
      // Show a toast-like notification instead of alert
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-right'
      notification.textContent = 'Lien copié dans le presse-papiers!'
      document.body.appendChild(notification)
      setTimeout(() => document.body.removeChild(notification), 3000)
    } else if (platform === 'copy') {
      await navigator.clipboard.writeText(url)
      // Show a toast-like notification instead of alert
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-right'
      notification.textContent = 'Lien copié dans le presse-papiers!'
      document.body.appendChild(notification)
      setTimeout(() => document.body.removeChild(notification), 3000)
    } else if (platform === 'email') {
      const subject = `Offre d'emploi : ${job.title}`
      const body = `${text}\n\n${url}`
      window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)
    }
  } catch (error) {
    console.error('Error sharing:', error)
    // Fallback for clipboard API not supported
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in slide-in-from-right'
    notification.textContent = 'Erreur lors du partage'
    document.body.appendChild(notification)
    setTimeout(() => document.body.removeChild(notification), 3000)
  }
}
