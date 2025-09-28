import { neon } from "@neondatabase/serverless"
import dotenv from "dotenv"

dotenv.config()

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

export interface Job {
  id: number
  title: string
  company: string
  location: string
  type: "CDI" | "CDD" | "Stage" | "Freelance"
  salaryMin?: number
  salaryMax?: number
  currency: string
  description: string
  requirements?: string
  benefits?: string
  remoteWork: boolean
  experienceLevel?: string
  contractDuration?: string
  applicationUrl?: string
  applicationEmail?: string
  companyLogo?: string
  companyWebsite?: string
  tags: string[]
  featured: boolean
  status: "active" | "paused" | "closed"
  createdAt: string
  updatedAt: string
  expiresAt?: string
  createdBy?: string
  viewsCount: number
}

export interface JobFilters {
  search?: string
  location?: string
  type?: string
  remote?: boolean
  experience?: string
  tags?: string[]
}

export async function getJobs(filters: JobFilters = {}, limit = 20, offset = 0): Promise<Job[]> {
  let query = `
    SELECT
      id,
      title,
      company,
      location,
      type,
      "salaryMin",
      "salaryMax",
      currency,
      description,
      requirements,
      benefits,
      "remoteWork",
      "experienceLevel",
      "contractDuration",
      "applicationUrl",
      "applicationEmail",
      "companyLogo",
      "companyWebsite",
      tags,
      featured,
      status,
      "createdAt",
      "updatedAt",
      "expiresAt",
      "createdBy",
      "viewsCount"
    FROM jobs
    WHERE status = 'active' AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
  `

  const params: any[] = []
  let paramIndex = 1

  if (filters.search) {
    query += ` AND (title ILIKE $${paramIndex} OR company ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  if (filters.location) {
    query += ` AND location ILIKE $${paramIndex}`
    params.push(`%${filters.location}%`)
    paramIndex++
  }

  if (filters.type) {
    query += ` AND type = $${paramIndex}`
    params.push(filters.type)
    paramIndex++
  }

  if (filters.remote !== undefined) {
    query += ` AND "remoteWork" = $${paramIndex}`
    params.push(filters.remote)
    paramIndex++
  }

  if (filters.experience) {
    query += ` AND "experienceLevel" = $${paramIndex}`
    params.push(filters.experience)
    paramIndex++
  }

  if (filters.tags && filters.tags.length > 0) {
    query += ` AND tags && $${paramIndex}`
    params.push(filters.tags)
    paramIndex++
  }

  query += ` ORDER BY featured DESC, "createdAt" DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
  params.push(limit, offset)

  const result = await sql.query(query, params)
  return result.map(row => ({
    ...row,
    salaryMin: row.salaryMin || undefined,
    salaryMax: row.salaryMax || undefined,
    tags: row.tags || [],
    createdAt: row.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() || new Date().toISOString(),
    expiresAt: row.expiresAt?.toISOString() || undefined,
  })) as Job[]
}

export async function getJobsCount(filters: JobFilters = {}): Promise<number> {
  let query = `SELECT COUNT(*) as count FROM jobs WHERE status = 'active' AND ("expiresAt" IS NULL OR "expiresAt" > NOW())`

  const params: any[] = []
  let paramIndex = 1

  if (filters.search) {
    query += ` AND (title ILIKE $${paramIndex} OR company ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`
    params.push(`%${filters.search}%`)
    paramIndex++
  }

  if (filters.location) {
    query += ` AND location ILIKE $${paramIndex}`
    params.push(`%${filters.location}%`)
    paramIndex++
  }

  if (filters.type) {
    query += ` AND type = $${paramIndex}`
    params.push(filters.type)
    paramIndex++
  }

  if (filters.remote !== undefined) {
    query += ` AND "remoteWork" = $${paramIndex}`
    params.push(filters.remote)
    paramIndex++
  }

  if (filters.experience) {
    query += ` AND "experienceLevel" = $${paramIndex}`
    params.push(filters.experience)
    paramIndex++
  }

  if (filters.tags && filters.tags.length > 0) {
    query += ` AND tags && $${paramIndex}`
    params.push(filters.tags)
    paramIndex++
  }

  const result = await sql.query(query, params)
  return parseInt(result[0].count) || 0
}

export async function getJobById(id: number): Promise<Job | null> {
  const result = await sql`
    SELECT
      id,
      title,
      company,
      location,
      type,
      "salaryMin",
      "salaryMax",
      currency,
      description,
      requirements,
      benefits,
      "remoteWork",
      "experienceLevel",
      "contractDuration",
      "applicationUrl",
      "applicationEmail",
      "companyLogo",
      "companyWebsite",
      tags,
      featured,
      status,
      "createdAt",
      "updatedAt",
      "expiresAt",
      "createdBy",
      "viewsCount"
    FROM jobs
    WHERE id = ${id} AND status = 'active' AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
  `
  return (result[0] as Job) || null
}

export async function incrementJobViews(id: number): Promise<void> {
  await sql`UPDATE jobs SET "viewsCount" = "viewsCount" + 1 WHERE id = ${id}`
}
