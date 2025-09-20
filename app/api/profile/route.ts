import { type NextRequest, NextResponse } from "next/server"
import { sql } from "../../../lib/database"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { z } from "zod"

export const profileSchema = z.object({
  first_name: z.string().min(1, "Le prénom est requis").max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  last_name: z.string().min(1, "Le nom est requis").max(50, "Le nom ne peut pas dépasser 50 caractères"),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  resume_url: z.string().url("URL du CV invalide").optional().or(z.literal("")),
  linkedin_url: z.string().url("URL LinkedIn invalide").optional().or(z.literal("")),
  portfolio_url: z.string().url("URL du portfolio invalide").optional().or(z.literal("")),
  skills: z.array(z.string()).optional(),
  experience_level: z.string().optional(),
  availability: z.string().optional(),
})

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const candidate = await sql`
      SELECT * FROM candidates WHERE user_id = ${session.user.email}
    `

    if (candidate.length === 0) {
      return NextResponse.json({ profile: null })
    }

    return NextResponse.json({ profile: candidate[0] })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const profileData = await request.json()

    // Validate profile data with Zod
    const parseResult = profileSchema.safeParse(profileData)
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: `Données invalides: ${errors}` }, { status: 400 })
    }

    // Update or create candidate profile
    const candidate = await sql`
      INSERT INTO candidates (
        user_id, first_name, last_name, phone, location, bio,
        resume_url, linkedin_url, portfolio_url, skills,
        experience_level, availability
      )
      VALUES (
        ${session.user.email}, ${profileData.first_name}, ${profileData.last_name},
        ${profileData.phone}, ${profileData.location}, ${profileData.bio},
        ${profileData.resume_url}, ${profileData.linkedin_url}, ${profileData.portfolio_url},
        ${profileData.skills}, ${profileData.experience_level}, ${profileData.availability}
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        phone = EXCLUDED.phone,
        location = EXCLUDED.location,
        bio = EXCLUDED.bio,
        resume_url = EXCLUDED.resume_url,
        linkedin_url = EXCLUDED.linkedin_url,
        portfolio_url = EXCLUDED.portfolio_url,
        skills = EXCLUDED.skills,
        experience_level = EXCLUDED.experience_level,
        availability = EXCLUDED.availability,
        updated_at = NOW()
      RETURNING *
    `

    return NextResponse.json({ success: true, profile: candidate[0] })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
