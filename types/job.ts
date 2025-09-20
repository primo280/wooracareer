export interface Job {
  id: number
  title: string
  company: string
  location: string
  type: string
  salaryMin?: number
  salaryMax?: number
  description: string
  requirements?: string
  tags: string[]
  createdAt: string
  viewsCount: number
  status: string
  expiresAt?: string
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
