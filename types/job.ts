export interface Job {
  id: number
  title: string
  company: string
  location: string
  type: string
  salaryMin?: number
  salaryMax?: number
  currency?: string
  description: string
  requirements?: string
  benefits?: string
  remoteWork?: boolean
  experienceLevel?: string
  contractDuration?: string
  applicationUrl?: string
  applicationEmail?: string
  companyLogo?: string
  companyWebsite?: string
  tags: string[]
  featured?: boolean
  status: string
  createdAt: string
  updatedAt?: string
  expiresAt?: string
  createdBy?: string
  viewsCount: number
}

export interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface JobFilters {
  searchTerm: string
  locationFilter: string
  typeFilter: string
  salaryFilter: string
}
