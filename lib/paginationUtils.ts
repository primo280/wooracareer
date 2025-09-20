import { PaginationInfo } from "@/types/job"

export const createPaginationButtons = (
  pagination: PaginationInfo,
  maxVisible: number = 5
): number[] => {
  const { page, totalPages } = pagination
  const buttons: number[] = []

  if (totalPages <= maxVisible) {
    // Show all pages if total pages is less than or equal to max visible
    for (let i = 1; i <= totalPages; i++) {
      buttons.push(i)
    }
  } else {
    // Always show first page
    buttons.push(1)

    // Calculate range around current page
    const start = Math.max(2, page - Math.floor(maxVisible / 2))
    const end = Math.min(totalPages - 1, start + maxVisible - 3)

    // Add ellipsis if there's a gap after first page
    if (start > 2) {
      buttons.push(-1) // -1 represents ellipsis
    }

    // Add pages in range
    for (let i = start; i <= end; i++) {
      buttons.push(i)
    }

    // Add ellipsis if there's a gap before last page
    if (end < totalPages - 1) {
      buttons.push(-2) // -2 represents ellipsis
    }

    // Always show last page
    if (totalPages > 1) {
      buttons.push(totalPages)
    }
  }

  return buttons
}

export const getPaginationInfo = (
  page: number,
  limit: number,
  totalCount: number
): PaginationInfo => {
  const totalPages = Math.ceil(totalCount / limit)

  return {
    page,
    limit,
    totalCount,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}
