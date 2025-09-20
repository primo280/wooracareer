import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../lib/database"

export async function GET(request: NextRequest) {
  try {
    // Get jobs statistics
    const jobsStats = await sql`
      SELECT
        COUNT(*) as total_jobs,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs
      FROM jobs
    `.catch(() => [{ total_jobs: 0, active_jobs: 0 }])

    // Get applications statistics
    const applicationsStats = await sql`
      SELECT
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_applications
      FROM applications
    `.catch(() => [{ total_applications: 0, pending_applications: 0 }])

    // Get candidates statistics
    const candidatesStats = await sql`
      SELECT COUNT(*) as total_candidates
      FROM candidates
    `.catch(() => [{ total_candidates: 0 }])

    // Get users statistics
    const usersStats = await sql`
      SELECT COUNT(*) as total_users
      FROM users_sync
    `.catch(() => [{ total_users: 0 }])

    // Get notifications statistics
    const notificationsStats = await sql`
      SELECT
        COUNT(*) as total_notifications,
        COUNT(CASE WHEN read = false THEN 1 END) as unread_notifications
      FROM notifications
    `.catch(() => [{ total_notifications: 0, unread_notifications: 0 }])

    // Get jobs by status
    const jobsByStatus = await sql`
      SELECT
        status,
        COUNT(*) as count
      FROM jobs
      GROUP BY status
    `.catch(() => [])

    // Get applications by status
    const applicationsByStatus = await sql`
      SELECT
        status,
        COUNT(*) as count
      FROM applications
      GROUP BY status
    `.catch(() => [])

    // Get recent activity (last 30 days)
    const recentActivity = await sql`
      SELECT
        'job' as type,
        j.title as title,
        j."createdAt" as date
      FROM jobs j
      WHERE j."createdAt" >= NOW() - INTERVAL '30 days'

      UNION ALL

      SELECT
        'application' as type,
        j.title as title,
        a."appliedAt" as date
      FROM applications a
      JOIN jobs j ON a."jobId" = j.id
      WHERE a."appliedAt" >= NOW() - INTERVAL '30 days'

      ORDER BY date DESC
      LIMIT 20
    `.catch(() => [])

    const overview = {
      total_jobs: Number(jobsStats[0]?.total_jobs || 0),
      active_jobs: Number(jobsStats[0]?.active_jobs || 0),
      total_applications: Number(applicationsStats[0]?.total_applications || 0),
      pending_applications: Number(applicationsStats[0]?.pending_applications || 0),
      total_candidates: Number(candidatesStats[0]?.total_candidates || 0),
      total_users: Number(usersStats[0]?.total_users || 0),
      total_notifications: Number(notificationsStats[0]?.total_notifications || 0),
      unread_notifications: Number(notificationsStats[0]?.unread_notifications || 0)
    }

    return NextResponse.json({
      overview,
      jobsByStatus,
      applicationsByStatus,
      recentActivity
    })
  } catch (error) {
    console.error("Error fetching admin analytics:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
