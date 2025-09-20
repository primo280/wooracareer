// Admin Analytics Interfaces
export interface AdminAnalyticsOverview {
  total_jobs: number
  active_jobs: number
  total_applications: number
  pending_applications: number
  total_users: number
  total_candidates: number
  total_notifications: number
  unread_notifications: number
}

export interface AdminAnalyticsStatusCount {
  status: string
  count: number
}

export interface AdminAnalyticsActivity {
  type: 'job' | 'application'
  title: string
  date: string
}

export interface AdminAnalytics {
  overview: AdminAnalyticsOverview
  jobsByStatus: AdminAnalyticsStatusCount[]
  applicationsByStatus: AdminAnalyticsStatusCount[]
  recentActivity: AdminAnalyticsActivity[]
}

// Admin Notifications Interfaces
export interface AdminNotification {
  id: number
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
  user_email?: string
  user_name?: string
}

export interface CreateNotificationRequest {
  userId: string
  type: string
  title: string
  message: string
}

// Admin Settings Interfaces
export interface AdminSettingsData {
  total_jobs: number
  total_applications: number
  total_users: number
  total_candidates: number
  platform_status: string
}

export interface AdminSettings {
  category: string
  data: AdminSettingsData
}

export interface UpdateSettingsRequest {
  category: string
  data: Record<string, any>
}

// Admin Calendar Interfaces
export interface AdminCalendarEvent {
  type: 'job_expiry' | 'application_deadline' | 'job_created'
  title: string
  date: string
  description: string
  priority: 'info' | 'warning' | 'success'
}

export interface CreateCalendarEventRequest {
  title: string
  description?: string
  date: string
  type: string
  priority?: 'info' | 'warning' | 'success'
}

// Admin Reports Interfaces
export interface AdminReport {
  id: number
  reportType: 'jobs' | 'applications' | 'users' | 'overview'
  data: any[]
  generatedAt: string
}

export interface GenerateReportRequest {
  reportType: 'jobs' | 'applications' | 'users' | 'overview'
  dateRange?: string
  filters?: Record<string, any>
}

// Admin Applications Interface
export interface AdminApplication {
  id: number
  jobId: number
  candidateId: number
  coverLetter?: string
  status: string
  appliedAt: string
  updatedAt: string
  job_title: string
  candidate_name: string
  candidate_email: string
}

// Admin Jobs Interface (extends existing Job)
export interface AdminJob {
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
  application_count: number
}

export interface CreateJobRequest {
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
  expiresAt?: string
}

// Import Job interface from job.ts
import { Job } from './job'
