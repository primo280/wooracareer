import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../../../lib/database"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()

    if (!status || !['pending', 'reviewed', 'accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
    }

    // Get application details
    const application = await sql`
      SELECT
        a.*,
        j.title as job_title,
        j."createdBy" as employer_id,
        c."userId" as candidate_user_id,
        u.email as candidate_email
      FROM applications a
      JOIN jobs j ON a."jobId" = j.id
      JOIN candidates c ON a."candidateId" = c.id
      JOIN users_sync u ON c."userId" = u.id
      WHERE a.id = ${params.id}
    `

    if (application.length === 0) {
      return NextResponse.json({ error: "Candidature non trouvée" }, { status: 404 })
    }

    const app = application[0]

    // Update application status
    await sql`
      UPDATE applications
      SET status = ${status}, "updatedAt" = NOW()
      WHERE id = ${params.id}
    `

    // Create notification for candidate
    let notificationMessage = ""
    let notificationTitle = ""

    switch (status) {
      case 'reviewed':
        notificationTitle = "Candidature en cours de révision"
        notificationMessage = `Votre candidature pour "${app.job_title}" est en cours de révision.`
        break
      case 'accepted':
        notificationTitle = "Candidature acceptée"
        notificationMessage = `Félicitations ! Votre candidature pour "${app.job_title}" a été acceptée.`
        break
      case 'rejected':
        notificationTitle = "Candidature rejetée"
        notificationMessage = `Votre candidature pour "${app.job_title}" n'a pas été retenue.`
        break
      default:
        return NextResponse.json({ success: true })
    }

    await sql`
      INSERT INTO notifications ("userId", type, title, message, read, "createdAt")
      VALUES (${app.candidate_user_id}, 'application_status', ${notificationTitle}, ${notificationMessage}, false, NOW())
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating application status:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
