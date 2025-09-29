import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../lib/database"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { z } from "zod"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { randomUUID } from "crypto"

export const dynamic = "force-dynamic"

const applicationSchema = z.object({
  job_id: z.number().int().positive(),
  name: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  cover_letter: z.string().max(1000).optional(),
})

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const job_id = parseInt(formData.get('job_id') as string)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string || undefined
    const cover_letter = formData.get('cover_letter') as string || undefined
    const cvFile = formData.get('cv') as File | null

    // Validate fields
    const parseResult = applicationSchema.safeParse({ job_id, name, email, phone, cover_letter })
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: `Données invalides: ${errors}` }, { status: 400 })
    }

    let cvUrl: string | undefined = undefined

    if (cvFile) {
      // Validate file
      if (cvFile.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Le fichier CV ne doit pas dépasser 5MB" }, { status: 400 })
      }
      if (!ALLOWED_TYPES.includes(cvFile.type)) {
        return NextResponse.json({ error: "Le CV doit être au format PDF ou DOCX" }, { status: 400 })
      }

      // Save file
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'cv')
      await mkdir(uploadDir, { recursive: true })
      const sanitizedName = cvFile.name.replace(/[/\\?%*:|"<>]/g, '-')
      const fileName = `${randomUUID()}-${sanitizedName}`
      const filePath = join(uploadDir, fileName)
      const bytes = await cvFile.arrayBuffer()
      await writeFile(filePath, Buffer.from(bytes))
      cvUrl = `/uploads/cv/${fileName}`
    }

    // Get or create user
    let user = await sql`
      SELECT id FROM users_sync WHERE email = ${email}
    `
    console.log("User query result:", user)

    if (user.length === 0) {
      // Create user
      user = await sql`
        INSERT INTO users_sync (id, email, name, role, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${email}, ${name}, 'CANDIDATE', NOW(), NOW())
        RETURNING id
      `
      console.log("Created new user:", user)
    }

    const userId = user[0].id

    // Get or create candidate profile
    let candidate = await sql`
      SELECT id FROM candidates WHERE "userId" = ${userId}
    `
    console.log("Candidate query result:", candidate)

    if (candidate.length === 0) {
      // Create candidate profile
      const nameParts = name.split(" ")
      const firstName = nameParts[0] || ""
      const lastName = nameParts.slice(1).join(" ") || ""
      candidate = await sql`
        INSERT INTO candidates ("userId", "firstName", "lastName", "phone", "createdAt", "updatedAt")
        VALUES (${userId}, ${firstName}, ${lastName}, ${phone || null}, NOW(), NOW())
        RETURNING id
      `
      console.log("Created new candidate profile:", candidate)
    }

    const candidateId = candidate[0].id

    // Check if already applied
    const existingApplication = await sql`
      SELECT id FROM applications
      WHERE "jobId" = ${job_id} AND "candidateId" = ${candidateId}
    `
    console.log("Existing application check:", existingApplication)

    if (existingApplication.length > 0) {
      return NextResponse.json({ error: "Vous avez déjà postulé à cette offre" }, { status: 400 })
    }

    // Get job details for notifications
    const job = await sql`
      SELECT title, "createdBy" FROM jobs WHERE id = ${job_id}
    `
    if (job.length === 0) {
      return NextResponse.json({ error: "Offre d'emploi non trouvée" }, { status: 404 })
    }

    // Create application
    const application = await sql`
      INSERT INTO applications ("jobId", "candidateId", "coverLetter", "cvUrl", "status", "appliedAt", "updatedAt")
      VALUES (${job_id}, ${candidateId}, ${cover_letter || null}, ${cvUrl || null}, 'pending', NOW(), NOW())
      RETURNING id, "jobId", "candidateId", "coverLetter", "cvUrl", "status", "appliedAt", "updatedAt"
    `
    console.log("Created application:", application)

    // Create notifications
    const candidateMessage = `Votre candidature pour "${job[0].title}" a été envoyée avec succès.`
    const employerMessage = `Vous avez reçu une nouvelle candidature pour "${job[0].title}".`

    // Create notification for candidate
    await sql`
      INSERT INTO notifications ("userId", type, title, message, read, "createdAt")
      VALUES (${userId}, 'application_status', 'Candidature envoyée', ${candidateMessage}, false, NOW())
    `

    // Create notification for employer if createdBy exists
    if (job[0].createdBy) {
      await sql`
        INSERT INTO notifications ("userId", type, title, message, read, "createdAt")
        VALUES (${job[0].createdBy}, 'new_application', 'Nouvelle candidature', ${employerMessage}, false, NOW())
      `
    }

    return NextResponse.json({ success: true, application: application[0] })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    console.log("GET /api/applications session:", session)
    if (!session?.user) {
      console.log("Unauthorized access attempt to GET /api/applications")
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Get candidate applications with job details
    const applications = await sql`
      SELECT
        a.*,
        j."title" as job_title,
        j."company",
        j."location",
        j."type",
        j."salaryMin",
        j."salaryMax"
      FROM applications a
      JOIN candidates c ON a."candidateId" = c.id
      JOIN users_sync u ON c."userId" = u.id
      JOIN jobs j ON a."jobId" = j.id
      WHERE u.email = ${session.user.email}
      ORDER BY a."appliedAt" DESC
    `
    console.log("Fetched applications:", applications)

    return NextResponse.json({ applications })
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
