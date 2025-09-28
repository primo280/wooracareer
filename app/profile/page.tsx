"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Award,
  Edit,
  Save,
  X,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { toast } from "sonner"

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  location?: string
  bio?: string
  experience_years?: number
  current_position?: string
  skills: string[]
  education?: string
  languages: string[]
  availability?: string
  salary_expectation?: number
  linkedin_url?: string
  portfolio_url?: string
}

const profileSchema = z.object({
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

export default function ProfilePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!session?.user) {
      router.push("/sign-in")
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile")
        const data = await response.json()

        if (data.profile) {
          setProfile(data.profile)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast.error("Erreur lors du chargement du profil.")
        // Mock data for demo
        setProfile({
          id: "1",
          email: session.user!.email || "",
          first_name: "Jean",
          last_name: "Dupont",
          phone: "+33 6 12 34 56 78",
          location: "Paris, France",
          bio: "Développeur passionné avec 5 ans d'expérience en développement web full-stack. Spécialisé en React, Node.js et PostgreSQL.",
          experience_years: 5,
          current_position: "Développeur Full Stack Senior",
          skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
          education: "Master en Informatique - Université Paris-Saclay",
          languages: ["Français (natif)", "Anglais (courant)", "Espagnol (intermédiaire)"],
          availability: "Disponible immédiatement",
          salary_expectation: 65000,
          linkedin_url: "https://linkedin.com/in/jean-dupont",
          portfolio_url: "https://jean-dupont.dev",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [session, router])

  const handleSave = async () => {
    if (!profile) return

    // Validate profile data before sending
    const parseResult = profileSchema.safeParse(profile)
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => e.message).join(", ")
      toast.error(`Données invalides: ${errors}`)
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        setEditing(false)
        toast.success("Profil mis à jour avec succès.")
      } else {
        const data = await response.json()
        toast.error(data.error || "Erreur lors de la mise à jour du profil.")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast.error("Erreur lors de la mise à jour du profil.")
    } finally {
      setSaving(false)
    }
  }

  const addSkill = (skill: string) => {
    if (!profile || !skill.trim() || profile.skills.includes(skill.trim())) return

    setProfile({
      ...profile,
      skills: [...profile.skills, skill.trim()],
    })
  }

  const removeSkill = (skillToRemove: string) => {
    if (!profile) return

    setProfile({
      ...profile,
      skills: profile.skills.filter((skill) => skill !== skillToRemove),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profil non trouvé</h2>
          <Button onClick={() => router.push("/dashboard")}>Retour au tableau de bord</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.back()}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">Mon Profil</h1>
            </div>
            <div className="flex items-center space-x-2">
              {editing ? (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-12 h-12 text-teal-600" />
                </div>
                <CardTitle className="text-xl">
                  {editing ? (
                    <div className="space-y-2">
                      <Input
                        value={profile.first_name}
                        onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                        placeholder="Prénom"
                      />
                      <Input
                        value={profile.last_name}
                        onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                        placeholder="Nom"
                      />
                    </div>
                  ) : (
                    `${profile.first_name} ${profile.last_name}`
                  )}
                </CardTitle>
                <div className="space-y-1">
                  <p className="text-gray-600">
                    {editing ? (
                      <Input
                        value={profile.current_position || ""}
                        onChange={(e) => setProfile({ ...profile, current_position: e.target.value })}
                        placeholder="Poste actuel"
                      />
                    ) : (
                      profile.current_position
                    )}
                  </p>
                  {session?.user?.role && (
                    <Badge variant="secondary" className="text-xs">
                      {session.user.role === "ADMIN" ? "Administrateur" :
                       session.user.role === "EMPLOYER" ? "Employeur" :
                       session.user.role === "CANDIDATE" ? "Candidat" : session.user.role}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{profile.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {editing ? (
                    <Input
                      value={profile.phone || ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="Téléphone"
                      className="text-sm"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{profile.phone}</span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {editing ? (
                    <Input
                      value={profile.location || ""}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="Localisation"
                      className="text-sm"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{profile.location}</span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  {editing ? (
                    <Input
                      type="number"
                      value={profile.experience_years || ""}
                      onChange={(e) => setProfile({ ...profile, experience_years: Number.parseInt(e.target.value) })}
                      placeholder="Années d'expérience"
                      className="text-sm"
                    />
                  ) : (
                    <span className="text-sm text-gray-600">{profile.experience_years} ans d'expérience</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Availability Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-teal-600" />
                  Disponibilité
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <Select
                    value={profile.availability || ""}
                    onValueChange={(value) => setProfile({ ...profile, availability: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponible immédiatement">Disponible immédiatement</SelectItem>
                      <SelectItem value="Disponible sous 1 mois">Disponible sous 1 mois</SelectItem>
                      <SelectItem value="Disponible sous 2 mois">Disponible sous 2 mois</SelectItem>
                      <SelectItem value="Disponible sous 3 mois">Disponible sous 3 mois</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">{profile.availability}</Badge>
                )}

                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Prétention salariale :</p>
                  {editing ? (
                    <Input
                      type="number"
                      value={profile.salary_expectation || ""}
                      onChange={(e) => setProfile({ ...profile, salary_expectation: Number.parseInt(e.target.value) })}
                      placeholder="Salaire souhaité (FCFA)"
                    />
                  ) : (
                    <span className="font-medium text-teal-600">
                      {profile.salary_expectation?.toLocaleString()}FCFA / an
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Detailed Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">À propos</CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Décrivez votre parcours et vos motivations..."
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700">{profile.bio}</p>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Award className="w-5 h-5 mr-2 text-teal-600" />
                  Compétences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      {editing && (
                        <button onClick={() => removeSkill(skill)} className="ml-1 text-gray-500 hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {editing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ajouter une compétence"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          addSkill(e.currentTarget.value)
                          e.currentTarget.value = ""
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement
                        addSkill(input.value)
                        input.value = ""
                      }}
                    >
                      Ajouter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-teal-600" />
                  Formation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <Textarea
                    value={profile.education || ""}
                    onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                    placeholder="Votre formation et diplômes..."
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-700">{profile.education}</p>
                )}
              </CardContent>
            </Card>

            {/* Languages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Langues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profile.languages.map((language, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">{language}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Liens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">LinkedIn</label>
                  {editing ? (
                    <Input
                      value={profile.linkedin_url || ""}
                      onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                      placeholder="https://linkedin.com/in/..."
                    />
                  ) : (
                    <a
                      href={profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline"
                    >
                      {profile.linkedin_url}
                    </a>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Portfolio</label>
                  {editing ? (
                    <Input
                      value={profile.portfolio_url || ""}
                      onChange={(e) => setProfile({ ...profile, portfolio_url: e.target.value })}
                      placeholder="https://mon-portfolio.com"
                    />
                  ) : (
                    <a
                      href={profile.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline"
                    >
                      {profile.portfolio_url}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
